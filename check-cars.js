const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const db = admin.firestore();

async function run() {
  const carsSnap = await db.collection('cars').orderBy('createdAt', 'desc').get();
  carsSnap.docs.forEach((d, i) => {
    const car = d.data();
    console.log(`[${i}] ${car.rcName} - ${car.registrationNo}`);
  });
}
run();
