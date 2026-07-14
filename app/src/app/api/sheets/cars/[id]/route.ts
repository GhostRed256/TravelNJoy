import { NextRequest, NextResponse } from 'next/server';
import { getSheetsClient, SHEET_ID, CARS_SHEET, rowToCar, carToRow } from '@/lib/sheets';
import { Car } from '@/types/car';

async function findCarRow(sheets: ReturnType<typeof getSheetsClient>, id: string): Promise<{ rowIndex: number; car: Car } | null> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${CARS_SHEET}!A:Q`,
  });

  const rows = res.data.values || [];
  const rowIndex = rows.findIndex((r, i) => i > 0 && r[0] === id);
  if (rowIndex === -1) return null;

  return { rowIndex: rowIndex + 1, car: rowToCar(rows[rowIndex]) };
}

// PUT - Update a car
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updatedCar: Car = await req.json();
    updatedCar.updatedAt = new Date().toISOString();

    const sheets = getSheetsClient();
    const result = await findCarRow(sheets, params.id);

    if (!result) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${CARS_SHEET}!A${result.rowIndex + 1}:Q${result.rowIndex + 1}`,
      valueInputOption: 'RAW',
      requestBody: { values: [carToRow(updatedCar)] },
    });

    return NextResponse.json({ success: true, car: updatedCar });
  } catch (err) {
    console.error('Update car error:', err);
    return NextResponse.json({ error: 'Failed to update car' }, { status: 500 });
  }
}

// DELETE - Remove a car
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sheets = getSheetsClient();
    const result = await findCarRow(sheets, params.id);

    if (!result) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    // Get spreadsheet ID for batch update
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
    const sheet = spreadsheet.data.sheets?.find(s => s.properties?.title === CARS_SHEET);
    const sheetId = sheet?.properties?.sheetId ?? 0;

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: result.rowIndex, // 0-indexed
              endIndex: result.rowIndex + 1,
            },
          },
        }],
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete car error:', err);
    return NextResponse.json({ error: 'Failed to delete car' }, { status: 500 });
  }
}
