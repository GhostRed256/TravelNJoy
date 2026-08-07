import { NextRequest, NextResponse } from 'next/server';
import { db, initError } from '@/lib/firebase-admin';
import { DEMO_CARS, generateId } from '@/lib/utils';
import type { Car } from '@/types/car';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Fire-and-forget sheet sync — NEVER blocks the response to the client
function syncToSheet(car: Car, action: 'upsert' | 'markSold' | 'delete', carId?: string) {
  const webAppUrl = process.env.SHEETS_WEBAPP_URL || 'https://script.google.com/macros/s/AKfycbwqpt5gVDdCx_tO5c8J8Lz1TCH2ZETG-oOIxaofpHQzyZiVvXhmyKMnALOA9Qwju_T7/exec';
  if (!webAppUrl) return;

  const payload: Record<string, unknown> = {
    action,
    secret: process.env.SYNC_SECRET || 'travelnjoy-sync-2024',
  };
  if (action === 'delete') {
    payload.carId = carId;
  } else {
    // Clone car to avoid mutating the original object sent to Firestore
    const syncedCar = JSON.parse(JSON.stringify(car));
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://travel-n-joy.vercel.app';
    
    // Convert any relative image/document paths to absolute URLs so they are clickable in Sheets
    if (syncedCar.images && Array.isArray(syncedCar.images)) {
      syncedCar.images = syncedCar.images
        .filter((img: string) => !img.startsWith('data:')) // Strip data URLs — they break Sheets
        .map((img: string) => 
          img.startsWith('/') && !img.startsWith('//') ? `${baseUrl}${img}` : img
        );
    }
    
    // Also fix document links if any
    const docFields = ['docRC', 'docInsurance', 'docPUC', 'docNOC', 'docSellerPAN', 'docSellerAadhar', 'docBuyerPAN', 'docBuyerAadhar', 'docVehicleDetails'];
    for (const field of docFields) {
      if (syncedCar[field] && typeof syncedCar[field] === 'string') {
        if (syncedCar[field].startsWith('data:')) {
          syncedCar[field] = ''; // Strip data URLs
        } else if (syncedCar[field].startsWith('/')) {
          syncedCar[field] = `${baseUrl}${syncedCar[field]}`;
        }
      }
    }
    
    // Strip time from dates to prevent complicating the sheets
    if (syncedCar.acquisitionDate && typeof syncedCar.acquisitionDate === 'string') {
      syncedCar.acquisitionDate = syncedCar.acquisitionDate.split('T')[0];
    }
    if (syncedCar.soldDate && typeof syncedCar.soldDate === 'string') {
      syncedCar.soldDate = syncedCar.soldDate.split('T')[0];
    }
    
    payload.car = syncedCar;
  }

  // Fire-and-forget — we don't await this
  // IMPORTANT: redirect:'manual' prevents Apps Script 302 redirect from converting POST→GET (which breaks doPost)
  fetch(webAppUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    redirect: 'manual',
    body: JSON.stringify(payload),
  })
    .then(async (res) => {
      // With redirect:'manual' we get a 302 opaque response — that's fine, Apps Script processed the POST
      // For upsert, try to follow manually if we get a real 200 back
      if ((res.ok || res.type === 'opaqueredirect') && action === 'upsert') {
        try {
          if (res.ok) {
            const text = await res.text();
            const data = JSON.parse(text);
            if (data.success && data.sheetRow) {
              await db.collection('cars').doc(car.id).update({ sheetRow: data.sheetRow });
            }
          }
        } catch { /* ignore */ }
      }
    })
    .catch((err) => {
      console.error(`Sheet sync (${action}) failed:`, err?.message || err);
    });
}

export async function GET(req: NextRequest) {
  try {
    if (initError || !db) {
      console.error('Firebase failed to initialize:', initError);
      return NextResponse.json({ 
        cars: DEMO_CARS, 
        source: 'demo', 
        error: 'Firebase init failed: ' + initError 
      });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter');

    const carsRef = db.collection('cars');
    let snapshot: any;

    if (filter === 'public') {
      snapshot = await carsRef.where('status', 'in', ['available', 'reserved']).get();
    } else {
      snapshot = await carsRef.get();
    }

    const cars: Car[] = snapshot.docs.map((doc: any) => doc.data() as Car);

    // Sort by createdAt desc
    cars.sort((a: Car, b: Car) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });

    return NextResponse.json({ cars });
  } catch (err: unknown) {
    console.error('Firestore GET error:', err);
    return NextResponse.json({ cars: DEMO_CARS, source: 'demo' });
  }
}

export async function POST(req: NextRequest) {
  try {
    const car: Car = await req.json();
    if (!car.id) car.id = generateId();
    if (!car.createdAt) car.createdAt = new Date().toISOString();

    // 1. Write to Firestore (source of truth)
    await db.collection('cars').doc(car.id).set(car);

    // 2. Fire-and-forget sync to Google Sheet
    syncToSheet(car, 'upsert');

    return NextResponse.json({ success: true, car });
  } catch (err: unknown) {
    console.error('Add car error:', err);
    const firestoreErr = err as { code?: number };
    if (firestoreErr?.code === 5) {
      return NextResponse.json({
        error: 'Firestore database not found. Create the database in Native mode in the Google Cloud Console.',
      }, { status: 503 });
    }
    return NextResponse.json({ error: 'Failed to add car' }, { status: 500 });
  }
}
