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
  const snap = await db.collection('cars').limit(5).get();
  snap.docs.forEach(d => {
    const data = d.data();
    console.log(`Car: ${data.rcName}`);
    console.log(`  images:`, data.images);
    console.log(`  docVehicleDetails:`, data.docVehicleDetails);
  });
}
run();
