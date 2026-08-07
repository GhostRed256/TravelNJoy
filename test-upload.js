const fs = require('fs');

async function testUpload() {
  console.log("Fetching a real image...");
  const resImage = await fetch('https://upload.wikimedia.org/wikipedia/commons/a/a3/Eq_it-na_pizza-margherita_sep2005_sml.jpg');
  const buffer = await resImage.arrayBuffer();
  
  const blob = new Blob([buffer], { type: 'image/jpeg' });
  const formData = new FormData();
  formData.append('file', blob, 'pizza.jpg');

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
