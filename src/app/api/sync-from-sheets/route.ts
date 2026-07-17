import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { Car } from '@/types/car';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { secret, car } = payload;

    if (secret !== process.env.SYNC_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!car || !car.id) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const carRef = db.collection('cars').doc(car.id);
    const doc = await carRef.get();

    if (!doc.exists) {
      // If it doesn't exist, this is a new car created from Sheet directly?
      // For now, let's just create it.
      await carRef.set(car);
      return NextResponse.json({ success: true, message: 'Created new car' });
    }

    const existingCar = doc.data() as Car;

    // Deep compare to find differences
    let hasChanges = false;
    const updates: Partial<Car> = {};

    // Keys that might come from Sheets
    const keysToCheck: (keyof Car)[] = [
      'make', 'modelVariant', 'registrationNo', 'odometer', 'yearOfManufacture',
      'acquisitionDate', 'quotingPrice', 'rcName', 'status'
    ];

    for (const key of keysToCheck) {
      if (car[key] !== undefined && car[key] !== existingCar[key]) {
        hasChanges = true;
        // @ts-ignore
        updates[key] = car[key];
      }
    }

    if (!hasChanges) {
      // Return 200 without writing to Firestore. Loop is broken!
      return NextResponse.json({ success: true, message: 'No changes detected' });
    }

    updates.updatedAt = new Date().toISOString();
    await carRef.update(updates);

    // If status flipped to sold from the Sheet, we might need to tell Apps Script to move the row
    if (existingCar.status !== 'sold' && updates.status === 'sold') {
      const webAppUrl = process.env.SHEETS_WEBAPP_URL;
      if (webAppUrl) {
        try {
          await fetch(webAppUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'markSold',
              secret: process.env.SYNC_SECRET,
              car: { ...existingCar, ...updates },
            }),
          });
        } catch (syncErr) {
          console.error('Failed to call markSold on Apps Script:', syncErr);
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Firestore updated' });
  } catch (err) {
    console.error('Sync from Sheets error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
