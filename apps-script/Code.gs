
function onOpen() {
  try {
    SpreadsheetApp.getUi().createMenu('TravelNJoy')
      .addItem('Sync All Cars to Website', 'syncAllCarsToWebsite')
      .addItem('Format Links Blue', 'formatLinksBlue')
      .addToUi();
  } catch (e) {
    Logger.log('onOpen: UI not available in this context');
  }
}

/**
 * Scans all data cells and turns any cell containing =HYPERLINK blue + underlined.
 */
function formatLinksBlue() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tabs = [CONFIG.TAB_LISTED, CONFIG.TAB_SOLD];
  for (var t = 0; t < tabs.length; t++) {
    var sheet = ss.getSheetByName(tabs[t]);
    if (!sheet || sheet.getLastRow() <= 1) continue;
    var range = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn());
    var formulas = range.getFormulas();
    for (var r = 0; r < formulas.length; r++) {
      for (var c = 0; c < formulas[r].length; c++) {
        if (formulas[r][c] && formulas[r][c].toUpperCase().indexOf('HYPERLINK') !== -1) {
          var cell = range.getCell(r + 1, c + 1);
          cell.setFontColor('#1155cc').setFontLine('underline');
        }
      }
    }
  }
  Logger.log('All links formatted blue!');
}

// Configuration
const CONFIG = {
  VERCEL_API_URL: 'https://travel-n-joy.vercel.app',
  SYNC_SECRET: 'travelnjoy-sync-2024',
  TAB_LISTED: 'Listed & Reserved',
  TAB_SOLD: 'Sold',
  FOLDER_NAME: 'TravelNJoy Car Photos'
};

// ============================================================
// COLUMN MAP — matches the actual sheet header order exactly
// ============================================================
// A=0  Car ID
// B=1  Status
// C=2  Make
// D=3  Model & Variant
// E=4  Registration No
// F=5  Year of Manufacture
// G=6  Quoting Price
// H=7  Odometer
// I=8  Acquisition Date
// J=9  RC Name
// K=10 Car Photos
// L=11 Doc: Vehicle Details
// M=12 Doc: RC
// N=13 Doc: Insurance
// O=14 Doc: PUC
// P=15 Doc: NOC
// Q=16 Doc: Seller PAN
// R=17 Doc: Seller Aadhar
// S=18 Buyer Name
// T=19 Buyer PAN
// U=20 Buyer Aadhar
// V=21 Buyer Address
// W=22 Sold Date
// X=23 Last Updated
// Y=24 (Column 1 — empty spacer)
// Z=25 Body Type
// AA=26 Transmission

/**
 * Sync every row in the "Listed & Reserved" sheet to the live website.
 */
function syncAllCarsToWebsite() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.TAB_LISTED);
  if (!sheet) return;

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return;

  var successCount = 0;
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var carId = row[0];
    if (!carId) continue;

    var car = rowToCar(row);

    try {
      UrlFetchApp.fetch(CONFIG.VERCEL_API_URL + '/api/sync-from-sheets', {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify({ secret: CONFIG.SYNC_SECRET, car: car }),
        muteHttpExceptions: true
      });
      successCount++;
    } catch (e) {
      console.error('Sync error for ' + carId + ':', e);
    }
  }

  SpreadsheetApp.getUi().alert('Successfully synced ' + successCount + ' cars to the website!');
}

/**
 * Convert a sheet row (array of cell values) into a car object.
 * Uses the COLUMN MAP above — every index is explicit so nothing shifts.
 */
function rowToCar(data) {
  return {
    id:                 data[0]  || '',
    status:             (data[1] || '').toString().toLowerCase(),
    make:               data[2]  || '',
    modelVariant:       data[3]  || '',
    registrationNo:     data[4]  || '',
    yearOfManufacture:  data[5]  || '',
    quotingPrice:       data[6]  || '',
    odometer:           data[7]  || '',
    acquisitionDate:    data[8]  || '',
    rcName:             data[9]  || '',
    images:             data[10] ? extractUrls(data[10]) : [],
    docVehicleDetails:  data[11] ? extractUrls(data[11])[0] || '' : '',
    docRC:              data[12] ? extractUrls(data[12])[0] || '' : '',
    docInsurance:       data[13] ? extractUrls(data[13])[0] || '' : '',
    docPUC:             data[14] ? extractUrls(data[14])[0] || '' : '',
    docNOC:             data[15] ? extractUrls(data[15])[0] || '' : '',
    docSellerPAN:       data[16] ? extractUrls(data[16])[0] || '' : '',
    docSellerAadhar:    data[17] ? extractUrls(data[17])[0] || '' : '',
    buyerName:          data[18] || '',
    buyerPAN:           data[19] || '',
    buyerAadhar:        data[20] || '',
    buyerAddress:       data[21] || '',
    soldDate:           data[22] || '',
    bodyType:           data[25] ? data[25].toString().toLowerCase().replace('/', '_') : '',
    transmission:       data[26] ? data[26].toString().toLowerCase() : ''
  };
}

/**
 * Extracts clean URLs from raw values or pre-formatted HYPERLINK formulas,
 * converting relative image paths to absolute URLs.
 */
function extractUrls(input) {
  if (!input) return [];
  var rawList = [];
  if (Array.isArray(input)) {
    rawList = input;
  } else if (typeof input === 'string') {
    rawList = [input];
  } else {
    rawList = [String(input)];
  }

  var urls = [];
  var baseUrl = 'https://travel-n-joy.vercel.app';

  for (var i = 0; i < rawList.length; i++) {
    var item = rawList[i];
    if (!item) continue;
    var str = String(item).trim();
    if (!str) continue;

    var matches = str.match(/https?:\/\/[^\s"',)]+|\/?images\/[^\s"',)]+/gi);
    if (matches && matches.length > 0) {
      for (var j = 0; j < matches.length; j++) {
        var u = matches[j].replace(/["')]+$/, '').trim();
        if (u) {
          if (!u.startsWith('http://') && !u.startsWith('https://')) {
            if (!u.startsWith('/')) u = '/' + u;
            u = baseUrl + u;
          }
          if (urls.indexOf(u) === -1) {
            urls.push(u);
          }
        }
      }
    } else {
      if (str.toUpperCase().indexOf('=HYPERLINK') === -1) {
        var parts = str.split(',');
        for (var k = 0; k < parts.length; k++) {
          var part = parts[k].trim();
          if (part && (part.startsWith('http://') || part.startsWith('https://') || part.startsWith('/') || part.startsWith('images/'))) {
            var u2 = part;
            if (!u2.startsWith('http://') && !u2.startsWith('https://')) {
              if (!u2.startsWith('/')) u2 = '/' + u2;
              u2 = baseUrl + u2;
            }
            if (urls.indexOf(u2) === -1) {
              urls.push(u2);
            }
          }
        }
      }
    }
  }
  return urls;
}

/**
 * Handle incoming POST requests from Next.js (Admin Panel -> Firestore -> Apps Script)
 */
function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;
    var car = payload.car;
    var cars = payload.cars;
    var carId = payload.carId;
    var base64Data = payload.base64Data;
    var fileName = payload.fileName;
    var mimeType = payload.mimeType;

    // 1. Photo Upload
    if (action === 'uploadPhoto') {
      var photoUrl = handlePhotoUpload(base64Data, fileName, mimeType);
      return ContentService.createTextOutput(JSON.stringify({ success: true, url: photoUrl }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 2. Secret authentication for Sheet sync actions
    var validSecret = CONFIG.SYNC_SECRET || 'travelnjoy-sync-2024';
    if (payload.secret && payload.secret !== validSecret && payload.secret !== 'travelnjoy-sync-2024') {
      return ContentService.createTextOutput(JSON.stringify({ error: 'Unauthorized' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var sheetRow = null;

    if (action === 'batchUpsert') {
      var carList = Array.isArray(cars) ? cars : (car ? [car] : []);
      var results = handleBatchUpsert(carList);
      return ContentService.createTextOutput(JSON.stringify({ success: true, count: results.length, results: results }))
        .setMimeType(ContentService.MimeType.JSON);
    } else if (action === 'upsert') {
      sheetRow = handleUpsert(car);
    } else if (action === 'markSold') {
      handleMarkSold(car);
    } else if (action === 'delete') {
      handleDelete(carId);
    }

    return ContentService.createTextOutput(JSON.stringify({ success: true, sheetRow: sheetRow }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Uploads photo directly to your personal Google Drive
 */
function handlePhotoUpload(base64Data, fileName, mimeType) {
  var bytes = Utilities.base64Decode(base64Data);
  var blob = Utilities.newBlob(bytes, mimeType || 'image/jpeg', fileName || 'photo_' + Date.now() + '.jpg');

  var folder;
  var folders = DriveApp.getFoldersByName(CONFIG.FOLDER_NAME);
  if (folders.hasNext()) {
    folder = folders.next();
  } else {
    folder = DriveApp.createFolder(CONFIG.FOLDER_NAME);
  }

  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  var fileId = file.getId();
  return 'https://lh3.googleusercontent.com/d/' + fileId;
}

/**
 * Finds a car row across specified sheet tabs by car.id
 */
function findCarRow(carId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tabs = [CONFIG.TAB_LISTED, CONFIG.TAB_SOLD];

  for (var t = 0; t < tabs.length; t++) {
    var sheet = ss.getSheetByName(tabs[t]);
    if (!sheet) continue;

    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === carId) {
        return { sheet: sheet, row: i + 1, data: data[i] };
      }
    }
  }
  return null;
}

/**
 * Ensures header row exists in a sheet
 */
function ensureHeaders(sheet) {
  var defaultHeaders = [
    'Car ID', 'Status', 'Make', 'Model & Variant', 'Registration No', 'Year of Manufacture',
    'Quoting Price', 'Odometer', 'Acquisition Date', 'RC Name', 'Car Photos',
    'Doc: Vehicle Details', 'Doc: RC', 'Doc: Insurance', 'Doc: PUC', 'Doc: NOC',
    'Doc: Seller PAN', 'Doc: Seller Aadhar',
    'Buyer Name', 'Buyer PAN', 'Buyer Aadhar', 'Buyer Address', 'Sold Date', 'Last Updated',
    '', 'Body Type', 'Transmission'
  ];

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, defaultHeaders.length).setValues([defaultHeaders]);
    sheet.getRange(1, 1, 1, defaultHeaders.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
}

/**
 * Converts Car object to an array of row values matching the 27-column layout.
 */
function carToRowData(car) {
  var linkDoc = function(docValue, label) {
    var urls = extractUrls(docValue);
    if (urls.length === 0) return '';
    if (urls.length === 1) return '=HYPERLINK("' + urls[0] + '", "' + label + '")';
    return '=HYPERLINK("' + urls[0] + '", "' + label + ' (' + urls.length + ' docs)")';
  };

  var formatPhotos = function(images) {
    var urls = extractUrls(images);
    if (urls.length === 0) return '';
    if (urls.length === 1) return '=HYPERLINK("' + urls[0] + '", "Car Photo")';
    return '=HYPERLINK("' + urls[0] + '", "Car Photo (' + urls.length + ' photos)")';
  };

  // Must return exactly 27 values matching the column map
  return [
    car.id || '',                                       // A=0  Car ID
    car.status || 'available',                          // B=1  Status
    car.make || '',                                     // C=2  Make
    car.modelVariant || '',                             // D=3  Model & Variant
    car.registrationNo || '',                           // E=4  Registration No
    car.yearOfManufacture || '',                        // F=5  Year of Manufacture
    car.quotingPrice || '',                             // G=6  Quoting Price
    car.odometer || '',                                 // H=7  Odometer
    car.acquisitionDate || '',                          // I=8  Acquisition Date
    car.rcName || '',                                   // J=9  RC Name
    '',                                                 // K=10 Car Photos
    '',                                                 // L=11 Doc: Vehicle Details
    '',                                                 // M=12 Doc: RC
    linkDoc(car.docInsurance, 'Insurance Doc'),         // N=13 Doc: Insurance
    linkDoc(car.docPUC, 'PUC Doc'),                     // O=14 Doc: PUC
    linkDoc(car.docNOC, 'NOC Doc'),                     // P=15 Doc: NOC
    linkDoc(car.docSellerPAN, 'Seller PAN'),            // Q=16 Doc: Seller PAN
    linkDoc(car.docSellerAadhar, 'Seller Aadhar'),      // R=17 Doc: Seller Aadhar
    car.buyerName || '',                                // S=18 Buyer Name
    car.buyerPAN || '',                                 // T=19 Buyer PAN
    car.buyerAadhar || '',                              // U=20 Buyer Aadhar
    car.buyerAddress || '',                             // V=21 Buyer Address
    car.soldDate || '',                                 // W=22 Sold Date
    new Date().toISOString(),                           // X=23 Last Updated
    '',                                                 // Y=24 Column 1 (spacer)
    car.bodyType ? car.bodyType.replace('_', '/') : '', // Z=25 Body Type
    car.transmission || ''                              // AA=26 Transmission
  ];
}

function applyRichText(sheet, row, colIndex, urls, baseLabel) {
  if (!urls || urls.length === 0) {
    sheet.getRange(row, colIndex).setValue('');
    return;
  }
  var richTextBuilder = SpreadsheetApp.newRichTextValue();
  var text = '';
  var linkPositions = [];
  
  for (var i = 0; i < urls.length; i++) {
    var label = (urls.length === 1) ? baseLabel : (baseLabel + ' ' + (i + 1));
    var start = text.length;
    text += label;
    var end = text.length;
    linkPositions.push({ start: start, end: end, url: urls[i] });
    
    if (i < urls.length - 1) {
      text += '\n';
    }
  }
  
  richTextBuilder.setText(text);
  for (var j = 0; j < linkPositions.length; j++) {
    var pos = linkPositions[j];
    richTextBuilder.setLinkUrl(pos.start, pos.end, pos.url);
  }
  
  sheet.getRange(row, colIndex).setRichTextValue(richTextBuilder.build());
}

/**
 * Upsert car in 'Listed & Reserved' sheet
 */
function handleUpsert(car) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.TAB_LISTED);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.TAB_LISTED);
  }
  ensureHeaders(sheet);

  var existing = findCarRow(car.id);
  var rowData = carToRowData(car);

  if (existing) {
    if (car.status !== 'sold' && existing.sheet.getName() === CONFIG.TAB_SOLD) {
      existing.sheet.deleteRow(existing.row);
      var listedSheet = ss.getSheetByName(CONFIG.TAB_LISTED);
      if (!listedSheet) listedSheet = ss.insertSheet(CONFIG.TAB_LISTED);
      ensureHeaders(listedSheet);
      listedSheet.appendRow(rowData);
      var newRow = listedSheet.getLastRow();
      applyRichText(listedSheet, newRow, 11, extractUrls(car.images), 'Car Photo');
      applyRichText(listedSheet, newRow, 12, extractUrls(car.docVehicleDetails), 'Vehicle Details');
      applyRichText(listedSheet, newRow, 13, extractUrls(car.docRC), 'RC Doc');
      applyRichText(listedSheet, newRow, 14, extractUrls(car.docInsurance), 'Insurance Doc');
      applyRichText(listedSheet, newRow, 15, extractUrls(car.docPUC), 'PUC Doc');
      applyRichText(listedSheet, newRow, 16, extractUrls(car.docNOC), 'NOC Doc');
      applyRichText(listedSheet, newRow, 17, extractUrls(car.docSellerPAN), 'Seller PAN');
      applyRichText(listedSheet, newRow, 18, extractUrls(car.docSellerAadhar), 'Seller Aadhar');
      return newRow;
    }

    if (car.status === 'sold' && existing.sheet.getName() === CONFIG.TAB_LISTED) {
      existing.sheet.deleteRow(existing.row);
      var soldSheet = ss.getSheetByName(CONFIG.TAB_SOLD);
      if (!soldSheet) soldSheet = ss.insertSheet(CONFIG.TAB_SOLD);
      ensureHeaders(soldSheet);
      soldSheet.appendRow(rowData);
      var newRowSold = soldSheet.getLastRow();
      applyRichText(soldSheet, newRowSold, 11, extractUrls(car.images), 'Car Photo');
      applyRichText(soldSheet, newRowSold, 12, extractUrls(car.docVehicleDetails), 'Vehicle Details');
      applyRichText(soldSheet, newRowSold, 13, extractUrls(car.docRC), 'RC Doc');
      applyRichText(soldSheet, newRowSold, 14, extractUrls(car.docInsurance), 'Insurance Doc');
      applyRichText(soldSheet, newRowSold, 15, extractUrls(car.docPUC), 'PUC Doc');
      applyRichText(soldSheet, newRowSold, 16, extractUrls(car.docNOC), 'NOC Doc');
      applyRichText(soldSheet, newRowSold, 17, extractUrls(car.docSellerPAN), 'Seller PAN');
      applyRichText(soldSheet, newRowSold, 18, extractUrls(car.docSellerAadhar), 'Seller Aadhar');
      return newRowSold;
    }

    existing.sheet.getRange(existing.row, 1, 1, rowData.length).setValues([rowData]);
    applyRichText(existing.sheet, existing.row, 11, extractUrls(car.images), 'Car Photo');
    applyRichText(existing.sheet, existing.row, 12, extractUrls(car.docVehicleDetails), 'Vehicle Details');
    applyRichText(existing.sheet, existing.row, 13, extractUrls(car.docRC), 'RC Doc');
    applyRichText(existing.sheet, existing.row, 14, extractUrls(car.docInsurance), 'Insurance Doc');
    applyRichText(existing.sheet, existing.row, 15, extractUrls(car.docPUC), 'PUC Doc');
    applyRichText(existing.sheet, existing.row, 16, extractUrls(car.docNOC), 'NOC Doc');
    applyRichText(existing.sheet, existing.row, 17, extractUrls(car.docSellerPAN), 'Seller PAN');
    applyRichText(existing.sheet, existing.row, 18, extractUrls(car.docSellerAadhar), 'Seller Aadhar');
    return existing.row;
  } else {
    sheet.appendRow(rowData);
    var addedRow = sheet.getLastRow();
    applyRichText(sheet, addedRow, 11, extractUrls(car.images), 'Car Photo');
    applyRichText(sheet, addedRow, 12, extractUrls(car.docVehicleDetails), 'Vehicle Details');
    applyRichText(sheet, addedRow, 13, extractUrls(car.docRC), 'RC Doc');
    applyRichText(sheet, addedRow, 14, extractUrls(car.docInsurance), 'Insurance Doc');
    applyRichText(sheet, addedRow, 15, extractUrls(car.docPUC), 'PUC Doc');
    applyRichText(sheet, addedRow, 16, extractUrls(car.docNOC), 'NOC Doc');
    applyRichText(sheet, addedRow, 17, extractUrls(car.docSellerPAN), 'Seller PAN');
    applyRichText(sheet, addedRow, 18, extractUrls(car.docSellerAadhar), 'Seller Aadhar');
    return addedRow;
  }
}

/**
 * Mark a car as Sold - Move it to the 'Sold' tab
 */
function handleMarkSold(car) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var soldSheet = ss.getSheetByName(CONFIG.TAB_SOLD);
  if (!soldSheet) {
    soldSheet = ss.insertSheet(CONFIG.TAB_SOLD);
  }
  ensureHeaders(soldSheet);

  var existing = findCarRow(car.id);
  var rowData = carToRowData(car);

  if (existing) {
    if (existing.sheet.getName() === CONFIG.TAB_SOLD) {
      existing.sheet.getRange(existing.row, 1, 1, rowData.length).setValues([rowData]);
      applyRichText(existing.sheet, existing.row, 11, extractUrls(car.images), 'Car Photo');
      applyRichText(existing.sheet, existing.row, 12, extractUrls(car.docVehicleDetails), 'Vehicle Details');
      applyRichText(existing.sheet, existing.row, 13, extractUrls(car.docRC), 'RC Doc');
      applyRichText(existing.sheet, existing.row, 14, extractUrls(car.docInsurance), 'Insurance Doc');
      applyRichText(existing.sheet, existing.row, 15, extractUrls(car.docPUC), 'PUC Doc');
      applyRichText(existing.sheet, existing.row, 16, extractUrls(car.docNOC), 'NOC Doc');
      applyRichText(existing.sheet, existing.row, 17, extractUrls(car.docSellerPAN), 'Seller PAN');
      applyRichText(existing.sheet, existing.row, 18, extractUrls(car.docSellerAadhar), 'Seller Aadhar');
    } else {
      existing.sheet.deleteRow(existing.row);
      soldSheet.appendRow(rowData);
      var soldRow = soldSheet.getLastRow();
      applyRichText(soldSheet, soldRow, 11, extractUrls(car.images), 'Car Photo');
      applyRichText(soldSheet, soldRow, 12, extractUrls(car.docVehicleDetails), 'Vehicle Details');
      applyRichText(soldSheet, soldRow, 13, extractUrls(car.docRC), 'RC Doc');
      applyRichText(soldSheet, soldRow, 14, extractUrls(car.docInsurance), 'Insurance Doc');
      applyRichText(soldSheet, soldRow, 15, extractUrls(car.docPUC), 'PUC Doc');
      applyRichText(soldSheet, soldRow, 16, extractUrls(car.docNOC), 'NOC Doc');
      applyRichText(soldSheet, soldRow, 17, extractUrls(car.docSellerPAN), 'Seller PAN');
      applyRichText(soldSheet, soldRow, 18, extractUrls(car.docSellerAadhar), 'Seller Aadhar');
    }
  } else {
    soldSheet.appendRow(rowData);
    var newSoldRow = soldSheet.getLastRow();
    applyRichText(soldSheet, newSoldRow, 11, extractUrls(car.images), 'Car Photo');
    applyRichText(soldSheet, newSoldRow, 12, extractUrls(car.docVehicleDetails), 'Vehicle Details');
    applyRichText(soldSheet, newSoldRow, 13, extractUrls(car.docRC), 'RC Doc');
    applyRichText(soldSheet, newSoldRow, 14, extractUrls(car.docInsurance), 'Insurance Doc');
    applyRichText(soldSheet, newSoldRow, 15, extractUrls(car.docPUC), 'PUC Doc');
    applyRichText(soldSheet, newSoldRow, 16, extractUrls(car.docNOC), 'NOC Doc');
    applyRichText(soldSheet, newSoldRow, 17, extractUrls(car.docSellerPAN), 'Seller PAN');
    applyRichText(soldSheet, newSoldRow, 18, extractUrls(car.docSellerAadhar), 'Seller Aadhar');
  }
}

/**
 * Hard delete a car
 */
function handleDelete(carId) {
  var existing = findCarRow(carId);
  if (existing) {
    existing.sheet.deleteRow(existing.row);
  }
}

/**
 * Bulk upserts multiple cars in one operation
 */
function handleBatchUpsert(cars) {
  if (!Array.isArray(cars) || cars.length === 0) return [];
  var results = [];
  for (var i = 0; i < cars.length; i++) {
    var car = cars[i];
    if (!car || !car.id) continue;
    var row = handleUpsert(car);
    results.push({ id: car.id, row: row });
  }
  return results;
}

/**
 * Handle edits in the Google Sheet — pushes ALL fields back to the website instantly.
 */
function onEdit(e) {
  var range = e.range;
  var sheet = range.getSheet();
  var sheetName = sheet.getName();

  if (sheetName !== CONFIG.TAB_LISTED && sheetName !== CONFIG.TAB_SOLD) {
    return;
  }

  if (range.getRow() === 1) return;

  var row = range.getRow();
  var data = sheet.getRange(row, 1, 1, 27).getValues()[0];

  var carId = data[0];
  if (!carId) return;

  // Use the same rowToCar function so indices are always consistent
  var car = rowToCar(data);

  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      secret: CONFIG.SYNC_SECRET,
      car: car
    }),
    muteHttpExceptions: true
  };

  try {
    var url = CONFIG.VERCEL_API_URL + '/api/sync-from-sheets';
    UrlFetchApp.fetch(url, options);
  } catch (err) {
    console.error('Error syncing to Vercel:', err);
  }
}

/**
 * Run this once to grant Drive permissions.
 */
function testAuthorization() {
  var folders = DriveApp.getFoldersByName(CONFIG.FOLDER_NAME);
  if (!folders.hasNext()) {
    DriveApp.createFolder(CONFIG.FOLDER_NAME);
  }
  Logger.log('Drive authorization successful!');
}

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.TAB_LISTED);
  var data = sheet.getDataRange().getValues();
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}