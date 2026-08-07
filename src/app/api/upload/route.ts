import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { storage } from '@/lib/firebase-admin';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Raw = buffer.toString('base64');
    
    // Determine proper MIME type
    let mimeType = file.type || 'image/jpeg';
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    if (!file.type || file.type === 'application/octet-stream') {
      if (ext === 'avif') mimeType = 'image/avif';
      else if (ext === 'webp') mimeType = 'image/webp';
      else if (ext === 'png') mimeType = 'image/png';
      else if (ext === 'svg') mimeType = 'image/svg+xml';
      else if (ext === 'pdf') mimeType = 'application/pdf';
      else mimeType = 'image/jpeg';
    }

    // ----------------------------------------------------
    // Tier 1: Cloudinary Upload (If credentials exist)
    // ----------------------------------------------------
    let cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    let apiKey = process.env.CLOUDINARY_API_KEY;
    let apiSecret = process.env.CLOUDINARY_API_SECRET;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    const cloudinaryUrl = process.env.CLOUDINARY_URL;
    if (cloudinaryUrl && (!cloudName || !apiKey || !apiSecret)) {
      const match = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
      if (match) {
        apiKey = match[1];
        apiSecret = match[2];
        cloudName = match[3];
      }
    }

    if (cloudName && (uploadPreset || (apiKey && apiSecret))) {
      try {
        const base64Data = `data:${mimeType};base64,${base64Raw}`;
        const cForm = new FormData();
        cForm.append('file', base64Data);

        if (uploadPreset) {
          cForm.append('upload_preset', uploadPreset);
        } else if (apiKey && apiSecret) {
          const timestamp = Math.floor(Date.now() / 1000).toString();
          const folder = 'travelnjoy';
          const strToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
          const signature = crypto.createHash('sha1').update(strToSign).digest('hex');

          cForm.append('api_key', apiKey);
          cForm.append('timestamp', timestamp);
          cForm.append('folder', folder);
          cForm.append('signature', signature);
        }

        const cRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
          method: 'POST',
          body: cForm,
        });

        const cData = await cRes.json();
        if (cData.secure_url || cData.url) {
          return NextResponse.json({ success: true, url: cData.secure_url || cData.url });
        }
        console.error('Cloudinary upload warning:', cData);
      } catch (cErr) {
        console.error('Cloudinary fetch error:', cErr);
      }
    }

    // ----------------------------------------------------
    // Tier 2: Firebase Storage Upload
    // ----------------------------------------------------
    if (storage) {
      try {
        const filename = `${crypto.randomUUID()}.${ext}`;
        const destination = `uploads/${filename}`;

        const bucket = storage.bucket();
        if (bucket && bucket.name && !bucket.name.includes('undefined')) {
          const fileRef = bucket.file(destination);
          await fileRef.save(buffer, { metadata: { contentType: mimeType } });
          try { await fileRef.makePublic(); } catch { /* ignore ACL warning */ }

          const url = `https://storage.googleapis.com/${bucket.name}/${destination}`;
          return NextResponse.json({ success: true, url });
        }
      } catch (fbErr) {
        console.error('Firebase Storage upload warning:', fbErr);
      }
    }

    // ----------------------------------------------------
    // Tier 3: Local Storage Fallback (DataLocal / images/cars)
    // ----------------------------------------------------
    try {
      const isDocument = mimeType === 'application/pdf' || ext === 'pdf';
      const targetDir = isDocument ? 'public/DataLocal' : 'public/images/cars';
      const fullDirPath = path.join(process.cwd(), targetDir);
      
      // Ensure directory exists
      await fs.mkdir(fullDirPath, { recursive: true });
      
      const filename = `${crypto.randomUUID()}.${ext}`;
      const filePath = path.join(fullDirPath, filename);
      
      await fs.writeFile(filePath, buffer);
      
      // Return relative URL for client usage (and sheet sync will prefix origin if needed)
      const url = isDocument ? `/DataLocal/${filename}` : `/images/cars/${filename}`;
      return NextResponse.json({ success: true, url });
    } catch (localErr) {
      console.error('Local file save failed:', localErr);
    }

    // ----------------------------------------------------
    // Tier 4: Base64 Data URL Fallback (Absolute last resort)
    // ----------------------------------------------------
    // We only use this if LOCAL filesystem writing ALSO fails!
    const dataUrl = `data:${mimeType};base64,${base64Raw}`;
    return NextResponse.json({ success: true, url: dataUrl });

  } catch (err: any) {
    console.error('Upload route error:', err);
    return NextResponse.json({ error: err?.message || 'Upload failed' }, { status: 500 });
  }
}
