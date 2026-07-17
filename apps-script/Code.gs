// Configuration
const CONFIG = {
  VERCEL_API_URL: 'YOUR_VERCEL_PROJECT_URL', // e.g. 'https://travelnjoy.vercel.app'
  SYNC_SECRET: 'YOUR_SYNC_SECRET_HERE',
  TAB_LISTED: 'Listed & Reserved',
  TAB_SOLD: 'Sold'
};

/**
 * Handle incoming POST requests from Next.js (Admin Panel -> Firestore -> Apps Script)
 */
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    
    // Authenticate
    if (payload.secret !== CONFIG.SYNC_SECRET) {
      return ContentService.createTextOutput(JSON.stringify({ error: 'Unauthorized' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const { action, car, carId } = payload;
    let sheetRow = null;

    if (action === 'upsert') {
      sheetRow = handleUpsert(car);
    } else if (action === 'markSold') {
      handleMarkSold(car);
    } else if (action === 'delete') {
      handleDelete(carId);
    }

    return ContentService.createTextOutput(JSON.stringify({ success: true, sheetRow }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Finds a car row across specified sheet tabs by car.id
 */
function findCarRow(carId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tabs = [CONFIG.TAB_LISTED, CONFIG.TAB_SOLD];
  
  for (let t of tabs) {
    const sheet = ss.getSheetByName(t);
    if (!sheet) continue;
    
    const data = sheet.getDataRange().getValues();
    // Assuming column A (index 0) is Car ID
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === carId) {
        return { sheet, row: i + 1, data: data[i] };
      }
    }
  }
  return null;
}

/**
 * Ensures header row exists in a sheet
 */
function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    const headers = [
      'Car ID', 'Status', 'Make', 'Model & Variant', 'Registration No', 'Year of Manufacture',
      'Quoting Price', 'Odometer', 'Acquisition Date', 'RC Name',
      'Doc: RC', 'Doc: Insurance', 'Doc: PUC', 'Doc: NOC', 'Doc: Seller PAN', 'Doc: Seller Aadhar',
      'Buyer Name', 'Buyer PAN', 'Buyer Aadhar', 'Buyer Address', 'Sold Date', 'Last Updated'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
}

/**
 * Converts Car object to an array of row values
 */
function carToRowData(car, siteUrl) {
  // Helper to create hyperlinked docs
  const linkDoc = (docType, docValue) => {
    if (!docValue) return '';
    return `=HYPERLINK("${siteUrl}/api/docs/${car.id}/${docType}", "View Document")`;
  };

  return [
    car.id || '',
    car.status || 'available',
    car.make || '',
    car.modelVariant || '',
    car.registrationNo || '',
    car.yearOfManufacture || '',
    car.quotingPrice || '',
    car.odometer || '',
    car.acquisitionDate || '',
    car.rcName || '',
    linkDoc('rc', car.docRC),
    linkDoc('insurance', car.docInsurance),
    linkDoc('puc', car.docPUC),
    linkDoc('noc', car.docNOC),
    linkDoc('seller-pan', car.docSellerPAN),
    linkDoc('seller-aadhar', car.docSellerAadhar),
    car.buyerName || '',
    car.buyerPAN || '',
    car.buyerAadhar || '',
    car.buyerAddress || '',
    car.soldDate || '',
    new Date().toISOString()
  ];
}

/**
 * Upsert car in 'Listed & Reserved' sheet
 */
function handleUpsert(car) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.TAB_LISTED);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.TAB_LISTED);
  }
  ensureHeaders(sheet);

  const existing = findCarRow(car.id);
  const rowData = carToRowData(car, CONFIG.VERCEL_API_URL);

  if (existing) {
    // If status is NOT sold, but it's currently in the Sold sheet, move it to Listed
    if (car.status !== 'sold' && existing.sheet.getName() === CONFIG.TAB_SOLD) {
      existing.sheet.deleteRow(existing.row);
      let listedSheet = ss.getSheetByName(CONFIG.TAB_LISTED);
      if (!listedSheet) listedSheet = ss.insertSheet(CONFIG.TAB_LISTED);
      ensureHeaders(listedSheet);
      listedSheet.appendRow(rowData);
      return listedSheet.getLastRow();
    }

    // If status IS sold, but it's currently in the Listed sheet, move it to Sold
    if (car.status === 'sold' && existing.sheet.getName() === CONFIG.TAB_LISTED) {
      existing.sheet.deleteRow(existing.row);
      let soldSheet = ss.getSheetByName(CONFIG.TAB_SOLD);
      if (!soldSheet) soldSheet = ss.insertSheet(CONFIG.TAB_SOLD);
      ensureHeaders(soldSheet);
      soldSheet.appendRow(rowData);
      return soldSheet.getLastRow();
    }

    existing.sheet.getRange(existing.row, 1, 1, rowData.length).setValues([rowData]);
    return existing.row;
  } else {
    sheet.appendRow(rowData);
    return sheet.getLastRow();
  }
}

/**
 * Mark a car as Sold - Move it to the 'Sold' tab
 */
function handleMarkSold(car) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let soldSheet = ss.getSheetByName(CONFIG.TAB_SOLD);
  if (!soldSheet) {
    soldSheet = ss.insertSheet(CONFIG.TAB_SOLD);
  }
  ensureHeaders(soldSheet);

  const existing = findCarRow(car.id);
  const rowData = carToRowData(car, CONFIG.VERCEL_API_URL);

  if (existing) {
    // If it's already in the sold sheet, just update it
    if (existing.sheet.getName() === CONFIG.TAB_SOLD) {
      existing.sheet.getRange(existing.row, 1, 1, rowData.length).setValues([rowData]);
    } else {
      // It's in the Listed sheet. We must delete it from there and append to Sold sheet.
      existing.sheet.deleteRow(existing.row);
      soldSheet.appendRow(rowData);
    }
  } else {
    // Doesn't exist at all, just add to sold sheet
    soldSheet.appendRow(rowData);
  }
}

/**
 * Hard delete a car
 */
function handleDelete(carId) {
  const existing = findCarRow(carId);
  if (existing) {
    existing.sheet.deleteRow(existing.row);
  }
}

/**
 * Handle edits in the Google Sheet (Trigger)
 */
function onEdit(e) {
  const range = e.range;
  const sheet = range.getSheet();
  const sheetName = sheet.getName();
  
  if (sheetName !== CONFIG.TAB_LISTED && sheetName !== CONFIG.TAB_SOLD) {
    return;
  }
  
  // Ignore header row edits
  if (range.getRow() === 1) return;

  const row = range.getRow();
  const data = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  const carId = data[0]; // Assuming ID is in Col A
  if (!carId) return; // Ignore if no ID

  // Construct car object from row data
  const car = {
    id: carId,
    status: (data[1] || '').toString().toLowerCase(),
    make: data[2],
    modelVariant: data[3],
    registrationNo: data[4],
    yearOfManufacture: data[5],
    quotingPrice: data[6],
    odometer: data[7],
    acquisitionDate: data[8],
    rcName: data[9],
    // Document hyperlinks can't easily be edited back to file uploads in the sheet,
    // so we ignore them for sheet-to-firebase sync.
    buyerName: data[16],
    buyerPAN: data[17],
    buyerAadhar: data[18],
    buyerAddress: data[19],
    soldDate: data[20],
  };

  // Push to Vercel API
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      secret: CONFIG.SYNC_SECRET,
      car: car
    }),
    muteHttpExceptions: true
  };

  try {
    const url = `${CONFIG.VERCEL_API_URL}/api/sync-from-sheets`;
    const response = UrlFetchApp.fetch(url, options);
    // Vercel returns 200 "No changes detected" if it breaks the loop.
    // If it returns success: true, Vercel updated Firestore.
  } catch (err) {
    console.error('Error syncing to Vercel:', err);
  }
}
