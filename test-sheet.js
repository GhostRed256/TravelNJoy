async function testSheet() {
  const webAppUrl = process.env.SHEETS_WEBAPP_URL || 'https://script.google.com/macros/s/AKfycbwfR5h4XZmI1iF_krlpImUKWnu2tnm5rui_9CYeUmr1-AMDDC8FG-HoaSB5m4VcQ3jd/exec';
  const payload = {
    secret: 'travelnjoy-sync-2024',
    action: 'upsert',
    car: {
      id: 'test-id-999',
      make: 'Test Make',
      rcName: 'Test RC',
      docRC: 'https://example.com/rc',
      docInsurance: 'https://example.com/ins',
      docPUC: 'https://example.com/puc',
      docNOC: 'https://example.com/noc',
      docSellerPAN: 'https://example.com/pan',
      docVehicleDetails: 'https://example.com/veh'
    }
  };
  try {
    const res = await fetch(webAppUrl, { method: 'POST', body: JSON.stringify(payload) });
    console.log(await res.text());
  } catch (e) { console.error(e); }
}
testSheet();
