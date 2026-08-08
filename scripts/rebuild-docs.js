const fs = require('fs');
const path = require('path');
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: '.env.local' });

cloudinary.config({
  cloud_name: 'hh0twxep',
  api_key: '525939719417216',
  api_secret: 'qWIhLnopv09OXiu4RGlLMWYg9DE',
  secure: true
});

if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
    })
  });
}
const db = getFirestore();

async function run() {
  console.log("Fetching cars from Firestore...");
  const carsSnap = await db.collection('cars').get();
  const cars = carsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  
  const baseDir = path.join(__dirname, '..', 'public', 'DataLocal');
  if (!fs.existsSync(baseDir)) return;
  
  const dirs = fs.readdirSync(baseDir).filter(d => d.startsWith('Document'));
  console.log(`Found ${dirs.length} document folders.`);
  
  for (let i = 0; i < dirs.length; i++) {
    const dir = dirs[i];
    const dirPath = path.join(baseDir, dir);
    const txtPath = path.join(dirPath, 'extracted_details.txt');
    if (!fs.existsSync(txtPath)) continue;
    
    const text = fs.readFileSync(txtPath, 'utf8');
    let matchedCar = null;
    
    for (const car of cars) {
      if (car.registrationNo && car.registrationNo.length > 5) {
        const cleanReg = car.registrationNo.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
        const cleanText = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
        if (cleanText.includes(cleanReg)) { matchedCar = car; break; }
      }
    }
    
    if (!matchedCar) {
      for (const car of cars) {
        if (car.rcName && car.rcName.length > 3) {
          const nameParts = car.rcName.toUpperCase().split(' ').filter(p => p.length > 3);
          for (const p of nameParts) {
            if (text.toUpperCase().includes(p)) { matchedCar = car; break; }
          }
          if (matchedCar) break;
        }
      }
    }
    
    if (!matchedCar) continue;
    console.log(`\nFound Match: Folder ${dir} -> Car: ${matchedCar.rcName} (${matchedCar.registrationNo})`);
    
    const files = fs.readdirSync(dirPath);
    
    let docFields = {
      docVehicleDetails: [],
      docRC: [],
      docInsurance: [],
      docPUC: [],
      docNOC: [],
      docSellerPAN: [],
      docSellerAadhar: []
    };
    
    for (const file of files) {
      const lower = file.toLowerCase();
      if (!lower.endsWith('.jpeg') && !lower.endsWith('.jpg') && !lower.endsWith('.png') && !lower.endsWith('.pdf')) continue;
      
      const filePath = path.join(dirPath, file);
      
      let targetField = '';
      if (lower.includes('vehicledetails') || lower.endsWith('.pdf')) targetField = 'docVehicleDetails';
      else if (lower.startsWith('rc_')) targetField = 'docRC';
      else if (lower.startsWith('insurance_')) targetField = 'docInsurance';
      else if (lower.startsWith('puc_')) targetField = 'docPUC';
      else if (lower.startsWith('noc_')) targetField = 'docNOC';
      else if (lower.startsWith('pan_')) targetField = 'docSellerPAN';
      else if (lower.startsWith('aadhar_')) targetField = 'docSellerAadhar';
      else continue; // SKIP images

      try {
        console.log(`  Uploading ${file} to Cloudinary...`);
        const result = await cloudinary.uploader.upload(filePath, { folder: 'travelnjoy_docs' });
        docFields[targetField].push(result.secure_url);
      } catch (err) {
        console.error(`  Failed to upload ${file}:`, err.message);
      }
    }
    
    let updates = {};
    for (const [key, urls] of Object.entries(docFields)) {
      if (urls.length > 0) {
        updates[key] = urls.join(',');
      } else {
        // If it's completely missing, do we clear it? 
        // No, maybe they uploaded it manually via the website. Let's not clear it.
      }
    }
    
    if (Object.keys(updates).length > 0) {
      await db.collection('cars').doc(matchedCar.id).update(updates);
      console.log(`  -> Firestore updated for ${matchedCar.id} with ${Object.keys(updates).join(', ')}`);
    }
  }
}

run();
