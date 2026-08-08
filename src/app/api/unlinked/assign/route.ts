import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import fs from 'fs';
import path from 'path';
import type { Car } from '@/types/car';

async function syncToSheet(car: Car) {
  const webAppUrl = process.env.SHEETS_WEBAPP_URL;
  if (!webAppUrl) return;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://travel-n-joy.vercel.app';
  const syncedCar = JSON.parse(JSON.stringify(car));

  if (syncedCar.images && Array.isArray(syncedCar.images)) {
    syncedCar.images = syncedCar.images
      .filter((img: string) => !img.startsWith('data:'))
      .map((img: string) =>
        img.startsWith('/') && !img.startsWith('//') ? `${baseUrl}${img}` : img
      );
  }

  // Convert relative document paths to absolute URLs
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

  const payload = {
    action: 'upsert',
    secret: process.env.SYNC_SECRET || 'travelnjoy-sync-2024',
    car: syncedCar
  };

  try {
    await fetch(webAppUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      redirect: 'manual',
      body: JSON.stringify(payload),
    });
  } catch (err: any) {
    console.error('Sheet sync failed:', err?.message || err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, carId } = await req.json();

    if (!imageUrl || !carId) {
      return NextResponse.json({ error: 'Missing imageUrl or carId' }, { status: 400 });
    }

    // Move file from unlinked to cars
    const fileName = path.basename(imageUrl);
    const sourcePath = path.join(process.cwd(), 'public', 'images', 'unlinked', fileName);
    const destPath = path.join(process.cwd(), 'public', 'images', 'cars', fileName);

    if (!fs.existsSync(sourcePath)) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    fs.copyFileSync(sourcePath, destPath);
    fs.unlinkSync(sourcePath);

    const newUrl = `/images/cars/${fileName}`;

    // Update Firestore
    const carRef = db.collection('cars').doc(carId);
    const docSnap = await carRef.get();
    
    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    const carData = docSnap.data() as Car;
    const images = carData.images || [];
    images.push(newUrl); // Append to the end

    await carRef.update({ images });

    const updatedCar = { ...carData, images };
    
    // Sync to Sheets
    await syncToSheet(updatedCar);

    return NextResponse.json({ success: true, car: updatedCar });
  } catch (error: any) {
    console.error('Error assigning image:', error);
    return NextResponse.json({ error: error.message || 'Failed to assign image' }, { status: 500 });
  }
}
