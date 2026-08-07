const crypto = require('crypto');

async function testCloudinary() {
  const cloudName = 'hh0twxep';
  const apiKey = '525939719417216';
  const apiSecret = 'qWIhLnopv09OXiu4RGlLMWYg9DE';
  
  const timestamp = Math.floor(Date.now() / 1000).toString();
  
  // Test without folder
  const strToSign = `timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(strToSign).digest('hex');

  const cForm = new FormData();
  
  // Use a remote URL for upload (Cloudinary supports this)
  cForm.append('file', 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Eq_it-na_pizza-margherita_sep2005_sml.jpg');
  cForm.append('api_key', apiKey);
  cForm.append('timestamp', timestamp);
  cForm.append('signature', signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: cForm,
  });
  
  const data = await res.json();
  console.log(data);
}

testCloudinary();
