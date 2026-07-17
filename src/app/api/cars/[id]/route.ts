import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { Car } from '@/types/car';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const doc = await db.collection('cars').doc(id).get();
    
    if (!doc.exists) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    return NextResponse.json({ car: doc.data() as Car });
  } catch (err: unknown) {
    console.error('Fetch car error:', err);
    const e = err as { code?: number };
    if (e?.code === 5) return NextResponse.json({ error: 'Firestore database not provisioned yet.' }, { status: 503 });
    return NextResponse.json({ error: 'Failed to fetch car' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const updates: Partial<Car> = await req.json();
    updates.updatedAt = new Date().toISOString();

    const carRef = db.collection('cars').doc(id);
    const oldDoc = await carRef.get();
    
    if (!oldDoc.exists) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }
    
    const oldCar = oldDoc.data() as Car;
    
    // Write to Firestore
    await carRef.update(updates);

    // Call Apps Script to sync
    const webAppUrl = process.env.SHEETS_WEBAPP_URL;
    if (webAppUrl) {
      const fullCar = { ...oldCar, ...updates };
      
      const isStatusChangedToSold = oldCar.status !== 'sold' && updates.status === 'sold';
      
      try {
        const syncRes = await fetch(webAppUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: isStatusChangedToSold ? 'markSold' : 'upsert',
            secret: process.env.SYNC_SECRET,
            car: fullCar,
          }),
        });

        if (syncRes.ok) {
          const syncData = await syncRes.json();
          // If upsert returned a new row number, update it
          if (syncData.success && syncData.sheetRow && syncData.sheetRow !== oldCar.sheetRow) {
            await carRef.update({ sheetRow: syncData.sheetRow });
            fullCar.sheetRow = syncData.sheetRow;
          }
        }
      } catch (syncErr) {
        console.error('Failed to sync to Apps Script on PUT:', syncErr);
      }
    }

    // Return the updated data (approximately)
    return NextResponse.json({ success: true, car: { ...oldCar, ...updates } });
  } catch (err: unknown) {
    console.error('Update car error:', err);
    const e = err as { code?: number };
    if (e?.code === 5) return NextResponse.json({ error: 'Firestore database not provisioned yet.' }, { status: 503 });
    return NextResponse.json({ error: 'Failed to update car' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Just delete from Firestore for now
    await db.collection('cars').doc(id).delete();

    // Optionally call Apps Script to delete the row, 
    // but in our plan we only hard-delete via a periodic cleanup,
    // or we can implement a 'delete' action.
    const webAppUrl = process.env.SHEETS_WEBAPP_URL;
    if (webAppUrl) {
      try {
        await fetch(webAppUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'delete',
            secret: process.env.SYNC_SECRET,
            carId: id,
          }),
        });
      } catch (e) {
        console.error('Failed to sync delete to Apps Script', e);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('Delete car error:', err);
    const e = err as { code?: number };
    if (e?.code === 5) return NextResponse.json({ error: 'Firestore database not provisioned yet.' }, { status: 503 });
    return NextResponse.json({ error: 'Failed to delete car' }, { status: 500 });
  }
}
