const crypto = require('crypto');

async function testUpload() {
  const originalName = "WhatsApp Image 2026-08-02 at 8.59.50 PM";
  
  const cloudName = 'hh0twxep';
  const apiKey = '525939719417216';
  const apiSecret = 'qWIhLnopv09OXiu4RGlLMWYg9DE';
  
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const folder = 'travelnjoy';
  
  let strToSign = `folder=${folder}&public_id=${originalName}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(strToSign).digest('hex');

  const cForm = new FormData();
  
  // Use a tiny image
  const base64Raw = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";
  const buffer = Buffer.from(base64Raw, 'base64');
  const blob = new Blob([buffer], { type: 'image/jpeg' });
  
  cForm.append('file', blob);
  cForm.append('upload_preset', ''); // wait, we don't use upload_preset
  cForm.append('public_id', originalName);
  cForm.append('api_key', apiKey);
  cForm.append('timestamp', timestamp);
  cForm.append('folder', folder);
  cForm.append('signature', signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: cForm,
  });
  
  const data = await res.json();
  console.log(data);
}

testUpload();
