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

async function fixDB() {
  const carsSnap = await db.collection('cars').get();
  let fixCount = 0;

  for (const doc of carsSnap.docs) {
    const car = doc.data();
    if (!car.images || !Array.isArray(car.images)) continue;

    let newImages = [];
    let extraDocs = [];

    for (const url of car.images) {
      if (url.includes('travelnjoy_docs')) {
        // This is a document that was mistakenly put in images!
        extraDocs.push(url);
      } else {
        newImages.push(url);
      }
    }

    if (extraDocs.length > 0) {
      let currentVD = car.docVehicleDetails;
      let vdArray = [];
      
      if (typeof currentVD === 'string' && currentVD.trim() !== '') {
        vdArray = currentVD.split(',').map(s => s.trim());
      } else if (Array.isArray(currentVD)) {
        vdArray = currentVD;
      }
      
      vdArray.push(...extraDocs);
      
      const uniqueVdArray = [...new Set(vdArray)]; // Remove duplicates
      
      await doc.ref.update({
        images: newImages,
        docVehicleDetails: uniqueVdArray.join(',')
      });
      
      console.log(`Fixed Car ${doc.id}:`);
      console.log(`  Moved ${extraDocs.length} items from images to docVehicleDetails`);
      fixCount++;
    }
  }
  
  console.log(`\nFixed ${fixCount} cars in database.`);
}

fixDB();
