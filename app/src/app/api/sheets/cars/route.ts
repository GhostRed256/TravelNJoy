import { NextRequest, NextResponse } from 'next/server';
import { getSheetsClient, SHEET_ID, CARS_SHEET, CAR_COLUMNS, rowToCar, carToRow } from '@/lib/sheets';
import { DEMO_CARS, generateId } from '@/lib/utils';
import { Car } from '@/types/car';

// GET - Fetch all cars
export async function GET() {
  try {
    const sheets = getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${CARS_SHEET}!A2:Q`,
    });

    const rows = res.data.values || [];
    const cars = rows.filter(r => r[0]).map(rowToCar);

    return NextResponse.json({ cars });
  } catch (err) {
    console.error('Sheets API error:', err);
    // Return demo data if sheets not configured
    return NextResponse.json({ cars: DEMO_CARS });
  }
}

// POST - Add a new car
export async function POST(req: NextRequest) {
  try {
    const car: Car = await req.json();
    if (!car.id) car.id = generateId();
    if (!car.createdAt) car.createdAt = new Date().toISOString();

    const sheets = getSheetsClient();

    // Ensure header row exists
    const headerRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${CARS_SHEET}!A1:Q1`,
    });

    if (!headerRes.data.values?.[0]) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${CARS_SHEET}!A1:Q1`,
        valueInputOption: 'RAW',
        requestBody: { values: [CAR_COLUMNS] },
      });
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${CARS_SHEET}!A:Q`,
      valueInputOption: 'RAW',
      requestBody: { values: [carToRow(car)] },
    });

    return NextResponse.json({ success: true, car });
  } catch (err) {
    console.error('Add car error:', err);
    return NextResponse.json({ error: 'Failed to add car' }, { status: 500 });
  }
}
