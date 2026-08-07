const fs = require('fs');

async function testUpload() {
  const logo = fs.readFileSync('public/logo.png');
  const blob = new Blob([logo], { type: 'image/png' });
  
  const formData = new FormData();
  formData.append('file', blob, 'WhatsApp Image 2026-08-02 at 8.59.50 PM.jpeg');

  console.log("Sending to local server...");
  try {
    const res = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    console.log("Upload response:", data);
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

testUpload();
