function onOpen() {
  try {
    SpreadsheetApp.getUi().createMenu('TravelNJoy')
      .addItem('Sync All Cars to Website', 'syncAllCarsToWebsite')
      .addItem('Format Links Blue', 'formatLinksBlue')
      .addToUi();
  } catch (e) {
    Logger.log('onOpen: UI not available');
  }
}

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
          range.getCell(r + 1, c + 1).setFontColor('#1155cc').setFontLine('underline');
        }
      }
    }
  }
}

var CONFIG = {
  VERCEL_API_URL: 'https://travel-n-joy.vercel.app',
  SYNC_SECRET: 'travelnjoy-sync-2024',
  TAB_LISTED: 'Listed & Reserved',
  TAB_SOLD: 'Sold',
  FOLDER_NAME: 'TravelNJoy Car Photos'
};

function getHeaderMap(sheet) {
  var lastCol = sheet.getLastColumn();
  if (lastCol === 0) return {};
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var map = {};
  for (var i = 0; i < headers.length; i++) {
    if (headers[i]) {
      map[headers[i].toString().trim().toLowerCase()] = i + 1; 
    }
  }
  return map;
}

function syncAllCarsToWebsite() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.TAB_LISTED);
  if (!sheet) return;

  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;

  var successCount = 0;
  for (var i = 2; i <= lastRow; i++) {
    var car = rowToCar(sheet, i);
    if (!car.id) continue;

    try {
      UrlFetchApp.fetch(CONFIG.VERCEL_API_URL + '/api/sync-from-sheets', {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify({ secret: CONFIG.SYNC_SECRET, car: car }),
        muteHttpExceptions: true
      });
      successCount++;
    } catch (e) {
      // ignore
    }
  }
  SpreadsheetApp.getUi().alert('Successfully synced ' + successCount + ' cars to the website!');
}

function rowToCar(sheet, rowNum) {
  var lastCol = sheet.getLastColumn();
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var data = sheet.getRange(rowNum, 1, 1, lastCol).getValues()[0];
  var richTexts = sheet.getRange(rowNum, 1, 1, lastCol).getRichTextValues()[0];

  var map = {};
  for (var i = 0; i < headers.length; i++) {
    if (headers[i]) {
      map[headers[i].toString().trim().toLowerCase()] = i; 
    }
  }

  var getVal = function(name) {
    var idx = map[name.toLowerCase()];
    return idx !== undefined ? data[idx] : '';
  };

  var getDocs = function(name) {
    var idx = map[name.toLowerCase()];
    if (idx === undefined) return [];
    
    var urls = [];
    if (richTexts && richTexts[idx]) {
      var runs = richTexts[idx].getRuns();
      for (var r = 0; r < runs.length; r++) {
        var url = runs[r].getLinkUrl();
        if (url && urls.indexOf(url) === -1) {
          urls.push(url);
        }
      }
    }
    if (urls.length === 0) {
      urls = extractUrls(data[idx]);
    }
    return urls;
  };

  return {
    id:                 getVal('Car ID'),
    status:             (getVal('Status') || '').toString().toLowerCase(),
    make:               getVal('Make'),
    modelVariant:       getVal('Model & Variant'),
    registrationNo:     getVal('Registration No'),
    yearOfManufacture:  getVal('Year of Manufacture'),
    quotingPrice:       getVal('Quoting Price'),
    odometer:           getVal('Odometer'),
    acquisitionDate:    getVal('Acquisition Date'),
    rcName:             getVal('RC Name'),
    images:             getDocs('Car Photos'),
    docVehicleDetails:  getDocs('Doc: Vehicle Details')[0] || '',
    docRC:              getDocs('Doc: RC')[0] || '',
    docInsurance:       getDocs('Doc: Insurance')[0] || '',
    docPUC:             getDocs('Doc: PUC')[0] || '',
    docNOC:             getDocs('Doc: NOC')[0] || '',
    docSellerPAN:       getDocs('Doc: Seller PAN')[0] || '',
    docSellerAadhar:    getDocs('Doc: Seller Aadhar')[0] || '',
    buyerName:          getVal('Buyer Name'),
    buyerPAN:           getVal('Buyer PAN'),
    buyerAadhar:        getVal('Buyer Aadhar'),
    buyerAddress:       getVal('Buyer Address'),
    soldDate:           getVal('Sold Date'),
    fuel:               (getVal('Fuel Type') || '').toString().toLowerCase(),
    bodyType:           (getVal('Body Type') || '').toString().toLowerCase().replace('/', '_'),
    transmission:       (getVal('Transmission') || '').toString().toLowerCase(),
    color:              getVal('Color')
  };
}

function extractUrls(input) {
  if (!input) return [];
  var rawList = Array.isArray(input) ? input : [String(input)];
  var urls = [];
  var baseUrl = 'https://travel-n-joy.vercel.app';

  for (var i = 0; i < rawList.length; i++) {
    if (!rawList[i]) continue;
    var str = String(rawList[i]).trim();
    if (!str) continue;

    var matches = str.match(/https?:\/\/[^\s"',)]+|\/?images\/[^\s"',)]+/gi);
    if (matches && matches.length > 0) {
      for (var j = 0; j < matches.length; j++) {
        var u = matches[j].replace(/["')]+$/, '').trim();
        if (u) {
          if (!u.startsWith('http://') && !u.startsWith('https://')) {
            u = u.startsWith('/') ? baseUrl + u : baseUrl + '/' + u;
          }
          if (urls.indexOf(u) === -1) urls.push(u);
        }
      }
    } else if (str.toUpperCase().indexOf('=HYPERLINK') === -1) {
      var parts = str.split(',');
      for (var k = 0; k < parts.length; k++) {
        var part = parts[k].trim();
        if (part && (part.startsWith('http') || part.startsWith('/') || part.startsWith('images/'))) {
          if (!part.startsWith('http')) {
            part = part.startsWith('/') ? baseUrl + part : baseUrl + '/' + part;
          }
          if (urls.indexOf(part) === -1) urls.push(part);
        }
      }
    }
  }
  return urls;
}

function applyRichText(sheet, row, colIndex, urls, baseLabel) {
  if (!colIndex) return; 
  try {
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
      if (i < urls.length - 1) text += '\n';
    }
    
    richTextBuilder.setText(text);
    for (var j = 0; j < linkPositions.length; j++) {
      richTextBuilder.setLinkUrl(linkPositions[j].start, linkPositions[j].end, linkPositions[j].url);
    }
    sheet.getRange(row, colIndex).setRichTextValue(richTextBuilder.build());
  } catch (e) {
    // ignore
  }
}

function formatDateOnly(dateStr) {
  if (!dateStr) return '';
  return dateStr.split('T')[0];
}

function writeCarToRow(sheet, row, car, colMap) {
  var lastCol = sheet.getLastColumn();
  if (lastCol === 0) return;
  
  var rowData = [];
  for (var i = 0; i < lastCol; i++) {
    rowData.push('');
  }
  
  var setVal = function(name, val) {
    var idx = colMap[name.toLowerCase()];
    if (idx) rowData[idx - 1] = val;
  };

  setVal('Car ID', car.id || '');
  setVal('Status', car.status || 'available');
  setVal('Make', car.make || '');
  setVal('Model & Variant', car.modelVariant || '');
  setVal('Registration No', car.registrationNo || '');
  setVal('Year of Manufacture', car.yearOfManufacture || '');
  setVal('Quoting Price', car.quotingPrice || '');
  setVal('Odometer', car.odometer || '');
  setVal('Acquisition Date', formatDateOnly(car.acquisitionDate));
  setVal('RC Name', car.rcName || '');
  setVal('Buyer Name', car.buyerName || '');
  setVal('Buyer PAN', car.buyerPAN || '');
  setVal('Buyer Aadhar', car.buyerAadhar || '');
  setVal('Buyer Address', car.buyerAddress || '');
  setVal('Sold Date', formatDateOnly(car.soldDate));
  setVal('Last Updated', Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss"));
  setVal('Fuel Type', car.fuel || '');
  setVal('Body Type', car.bodyType ? car.bodyType.replace('_', '/') : '');
  setVal('Transmission', car.transmission || '');
  setVal('Color', car.color || '');

  sheet.getRange(row, 1, 1, lastCol).setValues([rowData]);

  var applyRT = function(name, urls, label) {
    var idx = colMap[name.toLowerCase()];
    if (idx) applyRichText(sheet, row, idx, urls, label);
  };

  applyRT('Car Photos', extractUrls(car.images), 'Car Photo');
  applyRT('Doc: Vehicle Details', extractUrls(car.docVehicleDetails), 'Vehicle Details');
  applyRT('Doc: RC', extractUrls(car.docRC), 'RC Doc');
  applyRT('Doc: Insurance', extractUrls(car.docInsurance), 'Insurance Doc');
  applyRT('Doc: PUC', extractUrls(car.docPUC), 'PUC Doc');
  applyRT('Doc: NOC', extractUrls(car.docNOC), 'NOC Doc');
  applyRT('Doc: Seller PAN', extractUrls(car.docSellerPAN), 'Seller PAN');
  applyRT('Doc: Seller Aadhar', extractUrls(car.docSellerAadhar), 'Seller Aadhar');
}

function handleUpsert(car) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.TAB_LISTED);
  if (!sheet) sheet = ss.insertSheet(CONFIG.TAB_LISTED);
  ensureHeaders(sheet);

  var colMap = getHeaderMap(sheet);
  var existing = findCarRow(car.id);

  if (existing) {
    if (car.status !== 'sold' && existing.sheet.getName() === CONFIG.TAB_SOLD) {
      existing.sheet.deleteRow(existing.row);
      var listedSheet = ss.getSheetByName(CONFIG.TAB_LISTED);
      if (!listedSheet) listedSheet = ss.insertSheet(CONFIG.TAB_LISTED);
      ensureHeaders(listedSheet);
      var newMap = getHeaderMap(listedSheet);
      listedSheet.appendRow(createEmptyArray(listedSheet.getLastColumn()));
      var newRow = listedSheet.getLastRow();
      writeCarToRow(listedSheet, newRow, car, newMap);
      return newRow;
    }
    if (car.status === 'sold' && existing.sheet.getName() === CONFIG.TAB_LISTED) {
      existing.sheet.deleteRow(existing.row);
      var soldSheet = ss.getSheetByName(CONFIG.TAB_SOLD);
      if (!soldSheet) soldSheet = ss.insertSheet(CONFIG.TAB_SOLD);
      ensureHeaders(soldSheet);
      var soldMap = getHeaderMap(soldSheet);
      soldSheet.appendRow(createEmptyArray(soldSheet.getLastColumn()));
      var newRowSold = soldSheet.getLastRow();
      writeCarToRow(soldSheet, newRowSold, car, soldMap);
      return newRowSold;
    }

    writeCarToRow(existing.sheet, existing.row, car, colMap);
    return existing.row;
  } else {
    sheet.appendRow(createEmptyArray(sheet.getLastColumn()));
    var addedRow = sheet.getLastRow();
    writeCarToRow(sheet, addedRow, car, colMap);
    return addedRow;
  }
}

function createEmptyArray(len) {
  var arr = [];
  for (var i = 0; i < len; i++) arr.push('');
  return arr;
}

function handleMarkSold(car) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var soldSheet = ss.getSheetByName(CONFIG.TAB_SOLD);
  if (!soldSheet) soldSheet = ss.insertSheet(CONFIG.TAB_SOLD);
  ensureHeaders(soldSheet);
  var soldMap = getHeaderMap(soldSheet);

  var existing = findCarRow(car.id);
  if (existing) {
    if (existing.sheet.getName() === CONFIG.TAB_SOLD) {
      writeCarToRow(existing.sheet, existing.row, car, soldMap);
    } else {
      existing.sheet.deleteRow(existing.row);
      soldSheet.appendRow(createEmptyArray(soldSheet.getLastColumn()));
      var soldRow = soldSheet.getLastRow();
      writeCarToRow(soldSheet, soldRow, car, soldMap);
    }
  } else {
    soldSheet.appendRow(createEmptyArray(soldSheet.getLastColumn()));
    var newSoldRow = soldSheet.getLastRow();
    writeCarToRow(soldSheet, newSoldRow, car, soldMap);
  }
}

function handleDelete(carId) {
  var existing = findCarRow(carId);
  if (existing) existing.sheet.deleteRow(existing.row);
}

function handleBatchUpsert(cars) {
  if (!Array.isArray(cars) || cars.length === 0) return [];
  var results = [];
  for (var i = 0; i < cars.length; i++) {
    if (!cars[i] || !cars[i].id) continue;
    results.push({ id: cars[i].id, row: handleUpsert(cars[i]) });
  }
  return results;
}

function onEdit(e) {
  var range = e.range;
  var sheet = range.getSheet();
  var sheetName = sheet.getName();
  if (sheetName !== CONFIG.TAB_LISTED && sheetName !== CONFIG.TAB_SOLD) return;
  if (range.getRow() === 1) return;

  var car = rowToCar(sheet, range.getRow());
  if (!car.id) return;

  try {
    UrlFetchApp.fetch(CONFIG.VERCEL_API_URL + '/api/sync-from-sheets', {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({ secret: CONFIG.SYNC_SECRET, car: car }),
      muteHttpExceptions: true
    });
  } catch (err) {
    // ignore
  }
}

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;

    if (action === 'uploadPhoto') {
      var photoUrl = handlePhotoUpload(payload.base64Data, payload.fileName, payload.mimeType);
      return ContentService.createTextOutput(JSON.stringify({ success: true, url: photoUrl })).setMimeType(ContentService.MimeType.JSON);
    }

    if (payload.secret && payload.secret !== CONFIG.SYNC_SECRET) {
      return ContentService.createTextOutput(JSON.stringify({ error: 'Unauthorized' })).setMimeType(ContentService.MimeType.JSON);
    }

    var sheetRow = null;
    if (action === 'batchUpsert') {
      var carList = Array.isArray(payload.cars) ? payload.cars : (payload.car ? [payload.car] : []);
      var results = handleBatchUpsert(carList);
      return ContentService.createTextOutput(JSON.stringify({ success: true, count: results.length, results: results })).setMimeType(ContentService.MimeType.JSON);
    } else if (action === 'upsert') {
      sheetRow = handleUpsert(payload.car);
    } else if (action === 'markSold') {
      handleMarkSold(payload.car);
    } else if (action === 'delete') {
      handleDelete(payload.carId);
    }

    return ContentService.createTextOutput(JSON.stringify({ success: true, sheetRow: sheetRow })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function handlePhotoUpload(base64Data, fileName, mimeType) {
  var bytes = Utilities.base64Decode(base64Data);
  var blob = Utilities.newBlob(bytes, mimeType || 'image/jpeg', fileName || 'photo_' + Date.now() + '.jpg');
  var folders = DriveApp.getFoldersByName(CONFIG.FOLDER_NAME);
  var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(CONFIG.FOLDER_NAME);
  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return 'https://lh3.googleusercontent.com/d/' + file.getId();
}

function findCarRow(carId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tabs = [CONFIG.TAB_LISTED, CONFIG.TAB_SOLD];
  for (var t = 0; t < tabs.length; t++) {
    var sheet = ss.getSheetByName(tabs[t]);
    if (!sheet) continue;
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === carId) return { sheet: sheet, row: i + 1 };
    }
  }
  return null;
}

function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    var defaultHeaders = [
      'Car ID', 'Status', 'Make', 'Model & Variant', 'Registration No', 'Year of Manufacture',
      'Quoting Price', 'Odometer', 'Acquisition Date', 'RC Name', 'Car Photos',
      'Doc: Vehicle Details', 'Doc: RC', 'Doc: Insurance', 'Doc: PUC', 'Doc: NOC',
      'Doc: Seller PAN', 'Doc: Seller Aadhar', 'Buyer Name', 'Buyer PAN', 'Buyer Aadhar', 
      'Buyer Address', 'Sold Date', 'Last Updated', 'Fuel Type', 'Body Type', 'Transmission', 'Color'
    ];
    sheet.getRange(1, 1, 1, defaultHeaders.length).setValues([defaultHeaders]);
    sheet.getRange(1, 1, 1, defaultHeaders.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
}

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.TAB_LISTED);
  var data = sheet.getDataRange().getValues();
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
