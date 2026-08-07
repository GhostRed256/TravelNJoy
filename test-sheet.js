async function testSheet() {
  console.log("Testing sheet sync...");
  const webAppUrl = process.env.SHEETS_WEBAPP_URL || 'https://script.google.com/macros/s/AKfycbwfR5h4XZmI1iF_krlpImUKWnu2tnm5rui_9CYeUmr1-AMDDC8FG-HoaSB5m4VcQ3jd/exec';
  const syncSecret = process.env.SYNC_SECRET || 'travelnjoy-sync-2024';

  const payload = {
    secret: syncSecret,
    action: 'upsert',
    car: {
      id: 'test-id-123',
      make: 'Test',
      modelVariant: 'Test Variant',
      acquisitionDate: '2024-01-01',
      soldDate: '2024-01-02',
      images: ['https://res.cloudinary.com/demo/image/upload/sample.jpg'],
      docVehicleDetails: 'https://res.cloudinary.com/demo/image/upload/sample.pdf'
    }
  };

  try {
    const res = await fetch(webAppUrl, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    console.log("Response:", text);
  } catch (err) {
    console.error(err);
  }
}

testSheet();
