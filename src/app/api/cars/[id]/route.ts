import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import type { Car } from '@/types/car';
import { sendAdminEmail, sendCustomerEmail } from '@/lib/email';

// Sheet sync — must be awaited on Vercel (serverless functions terminate after response)
async function syncToSheet(payload: Record<string, unknown>) {
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzagP2G8OpPi7mY3gLHQVGHBpMsYJE4sbG2gZWxfxJuz7E2_rC6wPzFFkj9LDBt5wFt/exec';
  const webAppUrl = process.env.SHEETS_WEBAPP_URL || GOOGLE_SCRIPT_URL;
  if (!webAppUrl) return;

  // redirect:'manual' prevents Apps Script 302 from converting POST→GET (which causes "doGet not found")
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://travel-n-joy.vercel.app';
  const syncedCar = JSON.parse(JSON.stringify(payload.car || {}));
  
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

  try {
    await fetch(webAppUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      redirect: 'manual',
      body: JSON.stringify({ ...payload, car: syncedCar, secret: process.env.SYNC_SECRET || 'travelnjoy-sync-2024' }),
    });
  } catch (err: any) {
    console.error('Sheet sync failed:', err?.message || err);
  }
}

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
    const updates: Partial<Car> & { otp?: string, buyerEmail?: string } = await req.json();
    updates.updatedAt = new Date().toISOString();

    const carRef = db.collection('cars').doc(id);
    const oldDoc = await carRef.get();

    if (!oldDoc.exists) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    const oldCar = oldDoc.data() as Car;
    
    // OTP verification if booking as customer
    const isAdmin = req.cookies.has('admin_session');
    if (!isAdmin && updates.status === 'reserved' && oldCar.status !== 'reserved') {
      if (!updates.otp || !updates.buyerEmail) {
        return NextResponse.json({ error: 'OTP and email are required for booking' }, { status: 400 });
      }

      const emailKey = updates.buyerEmail.toLowerCase();
      const doc = await db.collection('customer_otps').doc(emailKey).get();
      
      if (!doc.exists) {
        return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 });
      }

      const data = doc.data();
      if (new Date() > new Date(data?.expiresAt)) {
        await db.collection('customer_otps').doc(emailKey).delete();
        return NextResponse.json({ error: 'OTP has expired' }, { status: 401 });
      }

      if (data?.otp !== updates.otp) {
        return NextResponse.json({ error: 'Incorrect OTP' }, { status: 401 });
      }

      // Success - delete OTP
      await db.collection('customer_otps').doc(emailKey).delete();
    }
    
    // Remove otp from updates to avoid storing it in car doc
    delete updates.otp;

    // 1. Write to Firestore first (source of truth)
    await carRef.update(updates);

    // 2. Fire-and-forget sync to Sheet
    const fullCar = { ...oldCar, ...updates };
    const isStatusChangedToSold = oldCar.status !== 'sold' && updates.status === 'sold';
    await syncToSheet({
      action: isStatusChangedToSold ? 'markSold' : 'upsert',
      car: fullCar,
    });

    // 3. Trigger Emails if status changed to reserved or sold
    if (oldCar.status !== updates.status && (updates.status === 'reserved' || updates.status === 'sold')) {
      const action = updates.status;
      // Send admin email
      sendAdminEmail(fullCar as Car, action).catch(e => console.error('Admin email error:', e));
      // Send customer email if buyerEmail exists
      if (fullCar.buyerEmail) {
        sendCustomerEmail(fullCar.buyerEmail, fullCar as Car, action).catch(e => console.error('Customer email error:', e));
      }
    }

    return NextResponse.json({ success: true, car: fullCar });
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

    // 1. Delete from Firestore (source of truth)
    await db.collection('cars').doc(id).delete();

    // 2. Fire-and-forget sync to Sheet
    await syncToSheet({ action: 'delete', carId: id });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('Delete car error:', err);
    const e = err as { code?: number };
    if (e?.code === 5) return NextResponse.json({ error: 'Firestore database not provisioned yet.' }, { status: 503 });
    return NextResponse.json({ error: 'Failed to delete car' }, { status: 500 });
  }
}
