import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import type { Car } from '@/types/car';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { secret, car } = payload;

    const validSecret = process.env.SYNC_SECRET || 'travelnjoy-sync-2024';
    if (secret !== validSecret && secret !== 'travelnjoy-sync-2024') {
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

    // Keys that come from Sheets
    for (const key of Object.keys(car) as (keyof Car)[]) {
      // Don't overwrite the ID or internal fields if not needed, but do update data fields
      if (key !== 'id' && key !== 'createdAt' && car[key] !== undefined && JSON.stringify(car[key]) !== JSON.stringify(existingCar[key])) {
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
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://travel-n-joy.vercel.app';
          const syncedCar = JSON.parse(JSON.stringify({ ...existingCar, ...updates }));
          if (syncedCar.images && Array.isArray(syncedCar.images)) {
            syncedCar.images = syncedCar.images.map((img: string) =>
              img.startsWith('/') && !img.startsWith('//') ? `${baseUrl}${img}` : img
            );
          }
          const docFields = ['docRC', 'docInsurance', 'docPUC', 'docNOC', 'docSellerPAN', 'docSellerAadhar', 'docBuyerPAN', 'docBuyerAadhar', 'docVehicleDetails'];
          for (const field of docFields) {
            if (syncedCar[field] && typeof syncedCar[field] === 'string' && syncedCar[field].startsWith('/')) {
              syncedCar[field] = `${baseUrl}${syncedCar[field]}`;
            }
          }
          await fetch(webAppUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            redirect: 'manual',
            body: JSON.stringify({
              action: 'markSold',
              secret: process.env.SYNC_SECRET || 'travelnjoy-sync-2024',
              car: syncedCar,
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
