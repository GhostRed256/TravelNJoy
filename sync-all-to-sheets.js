const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config({ path: '.env.local' });

if (getApps().length === 0) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
      })
    });
  } catch (err) {
    console.error("Firebase init error:", err.message);
    process.exit(1);
  }
}
const db = getFirestore();

async function syncAll() {
  const webAppUrl = process.env.SHEETS_WEBAPP_URL;
  if (!webAppUrl) {
    console.error("No SHEETS_WEBAPP_URL in .env.local");
    return;
  }
  
  console.log("Fetching cars from Firestore...");
  const snapshot = await db.collection('cars').get();
  const cars = snapshot.docs.map(doc => doc.data());
  console.log(`Found ${cars.length} cars. Sending to Google Sheets...`);
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://travel-n-joy.vercel.app';
  const cleanUrl = (url) => {
    if (!url || typeof url !== 'string' || url.startsWith('data:')) return '';
    return url.startsWith('/') ? baseUrl + url : url;
  };
  
  const cleanCars = cars.map(c => {
    const car = JSON.parse(JSON.stringify(c));
    if (car.images) car.images = car.images.map(cleanUrl);
    ['docRC','docInsurance','docPUC','docNOC','docSellerPAN','docSellerAadhar','docVehicleDetails'].forEach(f => {
      car[f] = cleanUrl(car[f]);
    });
    return car;
  });

  const payload = {
    secret: process.env.SYNC_SECRET || 'travelnjoy-sync-2024',
    action: 'batchUpsert',
    cars: cleanCars
  };

  try {
    const res = await fetch(webAppUrl, { method: 'POST', body: JSON.stringify(payload) });
    const text = await res.text();
    console.log("Sheets sync result:", text);
  } catch(e) {
    console.error("Sync failed:", e);
  }
}
syncAll();
