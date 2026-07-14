import { google } from 'googleapis';

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

export function getGoogleAuth() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: privateKey,
    },
    scopes: SCOPES,
  });

  return auth;
}

export function getSheetsClient() {
  const auth = getGoogleAuth();
  return google.sheets({ version: 'v4', auth });
}

export const SHEET_ID = process.env.GOOGLE_SHEET_ID!;
export const CARS_SHEET = 'Cars';
export const MESSAGES_SHEET = 'Messages';

// Car record columns order: id, make, model, year, price, mileage, fuel,
// transmission, color, description, images, status, features, engine, owners, createdAt, updatedAt
export const CAR_COLUMNS = [
  'id', 'make', 'model', 'year', 'price', 'mileage', 'fuel',
  'transmission', 'color', 'description', 'images', 'status',
  'features', 'engine', 'owners', 'ownerName', 'ownerAddress', 'condition', 'carType',
  'registrationNo', 'chassisNo', 'engineNo', 'dateOfProcurement',
  'buyerName', 'buyerAadhar', 'buyerPan', 'buyerAddress', 'soldDate',
  'createdAt', 'updatedAt'
];

// Message columns: id, customerId, customerName, message, sender, timestamp, read
export const MESSAGE_COLUMNS = [
  'id', 'customerId', 'customerName', 'message', 'sender', 'timestamp', 'read'
];

export function rowToCar(row: string[]): import('@/types/car').Car {
  return {
    id: row[0] || '',
    make: row[1] || '',
    model: row[2] || '',
    year: parseInt(row[3]) || 0,
    price: parseFloat(row[4]) || 0,
    mileage: parseInt(row[5]) || 0,
    fuel: (row[6] as import('@/types/car').FuelType) || 'petrol',
    transmission: (row[7] as import('@/types/car').TransmissionType) || 'manual',
    color: row[8] || '',
    description: row[9] || '',
    images: row[10] ? row[10].split(',').map(s => s.trim()) : [],
    status: (row[11] as import('@/types/car').CarStatus) || 'available',
    features: row[12] ? row[12].split(',').map(s => s.trim()) : [],
    engine: row[13] || '',
    owners: parseInt(row[14]) || 1,
    ownerName: row[15] || '',
    ownerAddress: row[16] || '',
    condition: row[17] || '',
    carType: row[18] || '',
    registrationNo: row[19] || '',
    chassisNo: row[20] || '',
    engineNo: row[21] || '',
    dateOfProcurement: row[22] || '',
    buyerName: row[23] || '',
    buyerAadhar: row[24] || '',
    buyerPan: row[25] || '',
    buyerAddress: row[26] || '',
    soldDate: row[27] || '',
    createdAt: row[28] || new Date().toISOString(),
    updatedAt: row[29] || undefined,
  };
}

export function carToRow(car: import('@/types/car').Car): string[] {
  return [
    car.id,
    car.make,
    car.model,
    car.year.toString(),
    car.price.toString(),
    car.mileage.toString(),
    car.fuel,
    car.transmission,
    car.color,
    car.description,
    car.images.join(', '),
    car.status,
    car.features.join(', '),
    car.engine,
    car.owners.toString(),
    car.ownerName || '',
    car.ownerAddress || '',
    car.condition || '',
    car.carType || '',
    car.registrationNo || '',
    car.chassisNo || '',
    car.engineNo || '',
    car.dateOfProcurement || '',
    car.buyerName || '',
    car.buyerAadhar || '',
    car.buyerPan || '',
    car.buyerAddress || '',
    car.soldDate || '',
    car.createdAt,
    car.updatedAt || '',
  ];
}

export function rowToMessage(row: string[]): import('@/types/car').ChatMessage {
  return {
    id: row[0] || '',
    customerId: row[1] || '',
    customerName: row[2] || '',
    message: row[3] || '',
    sender: (row[4] as 'customer' | 'admin') || 'customer',
    timestamp: row[5] || new Date().toISOString(),
    read: row[6] === 'true',
  };
}
