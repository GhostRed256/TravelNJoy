import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { storage } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Raw = buffer.toString('base64');
    const mimeType = file.type || 'image/jpeg';

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

        const cRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
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
    try {
      const ext = file.name.split('.').pop() || 'png';
      const filename = `${crypto.randomUUID()}.${ext}`;
      const destination = `uploads/${filename}`;

      const bucket = storage.bucket();
      const fileRef = bucket.file(destination);

      await fileRef.save(buffer, { metadata: { contentType: mimeType } });
      try { await fileRef.makePublic(); } catch { /* ignore ACL warning */ }

      const url = `https://storage.googleapis.com/${bucket.name}/${destination}`;
      return NextResponse.json({ success: true, url });
    } catch (fbErr) {
      console.error('Firebase Storage upload warning:', fbErr);
    }

    return NextResponse.json({ error: 'All storage engines failed (Cloudinary/Firebase)' }, { status: 500 });
  } catch (err: any) {
    console.error('Upload route error:', err);
    return NextResponse.json({ error: err?.message || 'Upload failed' }, { status: 500 });
  }
}
