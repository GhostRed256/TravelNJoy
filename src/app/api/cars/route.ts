import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { DEMO_CARS, generateId } from '@/lib/utils';
import { Car } from '@/types/car';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter'); // e.g. 'public'

    let carsRef = db.collection('cars');
    let snapshot;

    if (filter === 'public') {
      snapshot = await carsRef.where('status', 'in', ['available', 'reserved']).get();
    } else {
      snapshot = await carsRef.get();
    }

    const cars = snapshot.docs.map(doc => doc.data() as Car);
    
    // Sort by createdAt desc
    cars.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ cars });
  } catch (err: unknown) {
    console.error('Firestore GET error:', err);
    // Return demo data if Firebase fails
    return NextResponse.json({ cars: DEMO_CARS });
  }
}

export async function POST(req: NextRequest) {
  try {
    const car: Car = await req.json();
    if (!car.id) car.id = generateId();
    if (!car.createdAt) car.createdAt = new Date().toISOString();

    // 1. Write to Firestore
    await db.collection('cars').doc(car.id).set(car);

    // 2. Call Apps Script to sync
    const webAppUrl = process.env.SHEETS_WEBAPP_URL;
    if (webAppUrl) {
      try {
        const syncRes = await fetch(webAppUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'upsert',
            secret: process.env.SYNC_SECRET,
            car,
          }),
        });

        if (syncRes.ok) {
          const syncData = await syncRes.json();
          if (syncData.success && syncData.sheetRow) {
            // 3. Cache sheetRow back to Firestore
            car.sheetRow = syncData.sheetRow;
            await db.collection('cars').doc(car.id).update({ sheetRow: car.sheetRow });
          }
        }
      } catch (syncErr) {
        console.error('Failed to sync to Apps Script on POST:', syncErr);
        // We don't fail the request if sync fails, the data is safe in Firestore
      }
    }

    return NextResponse.json({ success: true, car });
  } catch (err: unknown) {
    console.error('Add car error:', err);
    // Detect Firestore NOT_FOUND (code 5) – database not yet created in GCP
    const firestoreErr = err as { code?: number };
    if (firestoreErr?.code === 5) {
      return NextResponse.json({
        error: 'Firestore database not found. Please enable Cloud Firestore in the Google Cloud Console: https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=travelnjoy  — then create a database in Native mode.',
      }, { status: 503 });
    }
    return NextResponse.json({ error: 'Failed to add car' }, { status: 500 });
  }
}
