import { NextRequest, NextResponse } from 'next/server';
import { db, initError } from '@/lib/firebase-admin';
import { DEMO_CARS, generateId } from '@/lib/utils';
import type { Car } from '@/types/car';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Sheet sync — must be awaited on Vercel (serverless functions terminate after response)
async function syncToSheet(car: Car, action: 'upsert' | 'markSold' | 'delete', carId?: string) {
  const webAppUrl = process.env.SHEETS_WEBAPP_URL;
  if (!webAppUrl) {
    console.error('SHEETS_WEBAPP_URL is not set in environment variables');
    return;
  }

  const payload: Record<string, unknown> = {
    action,
    secret: process.env.SYNC_SECRET || 'travelnjoy-sync-2024',
  };
  if (action === 'delete') {
    payload.carId = carId;
  } else {
    const syncedCar = JSON.parse(JSON.stringify(car));
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://travel-n-joy.vercel.app';
    
    if (syncedCar.images && Array.isArray(syncedCar.images)) {
      syncedCar.images = syncedCar.images
        .filter((img: string) => !img.startsWith('data:'))
        .map((img: string) => 
          img.startsWith('/') && !img.startsWith('//') ? `${baseUrl}${img}` : img
        );
    }
    
    const docFields = ['docRC', 'docInsurance', 'docPUC', 'docNOC', 'docSellerPAN', 'docSellerAadhar', 'docBuyerPAN', 'docBuyerAadhar', 'docVehicleDetails'];
    for (const field of docFields) {
      if (syncedCar[field] && typeof syncedCar[field] === 'string') {
        if (syncedCar[field].startsWith('data:')) {
          syncedCar[field] = '';
        } else if (syncedCar[field].startsWith('/')) {
          syncedCar[field] = `${baseUrl}${syncedCar[field]}`;
        }
      }
    }
    
    if (syncedCar.acquisitionDate && typeof syncedCar.acquisitionDate === 'string') {
      syncedCar.acquisitionDate = syncedCar.acquisitionDate.split('T')[0];
    }
    if (syncedCar.soldDate && typeof syncedCar.soldDate === 'string') {
      syncedCar.soldDate = syncedCar.soldDate.split('T')[0];
    }
    
    payload.car = syncedCar;
  }

  try {
    const res = await fetch(webAppUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      redirect: 'manual',
      body: JSON.stringify(payload),
    });
    // Try to save sheetRow if we got a real response
    if (res.ok && action === 'upsert') {
      try {
        const text = await res.text();
        const data = JSON.parse(text);
        if (data.success && data.sheetRow) {
          await db.collection('cars').doc(car.id).update({ sheetRow: data.sheetRow });
        }
      } catch { /* ignore parse errors */ }
    }
  } catch (err: any) {
    console.error(`Sheet sync (${action}) failed:`, err?.message || err);
  }
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
    await syncToSheet(car, 'upsert');

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
