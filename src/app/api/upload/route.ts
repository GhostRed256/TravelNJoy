import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/firebase-admin';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Create a unique filename
    const ext = file.name.split('.').pop() || 'png';
    const filename = `${uuidv4()}.${ext}`;
    const destination = `uploads/${filename}`;

    const bucket = storage.bucket();
    const fileRef = bucket.file(destination);

    // Upload to Firebase Storage
    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });

    // Make the file public (optional, if bucket isn't public by default)
    try {
      await fileRef.makePublic();
    } catch (e) {
      console.log('Bucket might already be public or lacks permission to change ACLs');
    }

    // Get public URL
    // Format: https://storage.googleapis.com/[BUCKET_NAME]/[OBJECT_PATH]
    const url = `https://storage.googleapis.com/${bucket.name}/${destination}`;

    return NextResponse.json({ success: true, url });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
