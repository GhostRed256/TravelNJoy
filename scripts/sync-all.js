const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config({ path: '.env.local' });

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
  })
});
const db = getFirestore();

async function run() {
  const carsSnap = await db.collection('cars').get();
  const cars = carsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  console.log(`Syncing ${cars.length} cars to Google Sheets...`);
  
  const webAppUrl = process.env.SHEETS_WEBAPP_URL;
  if (!webAppUrl) {
    console.error("Missing SHEETS_WEBAPP_URL in .env.local");
    return;
  }
  
  try {
    const res = await fetch(webAppUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ 
        action: 'batchUpsert',
        cars: cars, 
        secret: process.env.SYNC_SECRET || 'travelnjoy-sync-2024' 
      })
    });
    
    const text = await res.text();
    console.log("Sheet Sync Response:", text);
  } catch (err) {
    console.error("Failed to sync:", err);
  }
}

run();
