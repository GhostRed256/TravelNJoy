import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin SDK singleton
if (!getApps().length) {
  try {
    let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
    if (privateKey) {
      privateKey = privateKey.trim().replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');
    }
    
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || 'travelnjoy-88645',
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL || 'firebase-adminsdk-fbsvc@travelnjoy-88645.iam.gserviceaccount.com',
        privateKey: privateKey,
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'travelnjoy-88645.firebasestorage.app',
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase Admin initialization error', error);
  }
}

let db: any = null;
let storage: any = null;
let initError: any = null;

try {
  db = getFirestore();
  storage = getStorage();
} catch (e: any) {
  console.error("Failed to call getFirestore():", e.message);
  initError = e.message;
}

export { db, storage, initError };
