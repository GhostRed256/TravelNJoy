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
  let fixCount = 0;

  for (const doc of carsSnap.docs) {
    const car = doc.data();
    let updated = false;
    let updates = {};

    const docFields = ['docRC', 'docInsurance', 'docPUC', 'docNOC', 'docSellerPAN', 'docSellerAadhar', 'docVehicleDetails'];
    
    for (const field of docFields) {
      const val = car[field];
      if (typeof val === 'string' && val.includes(',')) {
        // It's a comma-separated list of URLs (caused by fix-db.js)
        const urls = val.split(',').map(s => s.trim());
        
        // We only want ONE URL. Preferably a PDF, otherwise the first one.
        let chosenUrl = urls.find(u => u.toLowerCase().endsWith('.pdf'));
        if (!chosenUrl) chosenUrl = urls[0];
        
        updates[field] = chosenUrl;
        updated = true;
      } else if (Array.isArray(val)) {
         let chosenUrl = val.find(u => u.toLowerCase().endsWith('.pdf'));
         if (!chosenUrl && val.length > 0) chosenUrl = val[0];
         updates[field] = chosenUrl || '';
         updated = true;
      }
    }

    if (updated) {
      await doc.ref.update(updates);
      console.log(`Cleaned Car ${doc.id}: ${JSON.stringify(updates)}`);
      fixCount++;
    }
  }

  console.log(`\nFixed ${fixCount} cars in database.`);
}

run();
