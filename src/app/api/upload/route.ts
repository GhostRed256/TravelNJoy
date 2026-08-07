import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

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
    // Cloudinary Upload
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

    if (!cloudName || (!uploadPreset && !(apiKey && apiSecret))) {
      return NextResponse.json({ error: 'Cloudinary credentials missing' }, { status: 500 });
    }

    const base64Data = `data:${mimeType};base64,${base64Raw}`;
    const cForm = new FormData();
    cForm.append('file', base64Data);

    // Pass the original file name so it's saved with its name in the sheet
    const originalName = file.name ? file.name.split('.').slice(0, -1).join('.') : '';
    if (originalName) {
      cForm.append('public_id', originalName);
    }

    if (uploadPreset) {
      cForm.append('upload_preset', uploadPreset);
    } else if (apiKey && apiSecret) {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const folder = 'travelnjoy';
      
      // Cloudinary requires all parameters (except api_key, file, cloud_name, resource_type) 
      // to be in alphabetical order for the signature.
      let strToSign = `folder=${folder}`;
      if (originalName) {
        strToSign += `&public_id=${originalName}`;
      }
      strToSign += `&timestamp=${timestamp}${apiSecret}`;
      
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
    return NextResponse.json({ error: 'Cloudinary upload failed', details: cData }, { status: 500 });

  } catch (err: any) {
    console.error('Upload route error:', err);
    return NextResponse.json({ error: err?.message || 'Upload failed' }, { status: 500 });
  }
}
