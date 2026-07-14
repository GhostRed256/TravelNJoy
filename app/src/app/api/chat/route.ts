import { NextRequest, NextResponse } from 'next/server';
import { getSheetsClient, SHEET_ID, MESSAGES_SHEET, MESSAGE_COLUMNS, rowToMessage } from '@/lib/sheets';
import { ChatMessage } from '@/types/car';

// GET - Fetch messages for a customer
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get('customerId');

  try {
    const sheets = getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${MESSAGES_SHEET}!A2:G`,
    });

    const rows = res.data.values || [];
    let messages = rows.filter(r => r[0]).map(rowToMessage);

    if (customerId) {
      messages = messages.filter(m => m.customerId === customerId);
    }

    return NextResponse.json({ messages });
  } catch (err) {
    console.error('Chat GET error:', err);
    return NextResponse.json({ messages: [] });
  }
}

// POST - Send a new message
export async function POST(req: NextRequest) {
  try {
    const message: ChatMessage = await req.json();

    const sheets = getSheetsClient();

    // Ensure headers
    const headerRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${MESSAGES_SHEET}!A1:G1`,
    });

    if (!headerRes.data.values?.[0]) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${MESSAGES_SHEET}!A1:G1`,
        valueInputOption: 'RAW',
        requestBody: { values: [MESSAGE_COLUMNS] },
      });
    }

    const row = [
      message.id,
      message.customerId,
      message.customerName,
      message.message,
      message.sender,
      message.timestamp,
      String(message.read),
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${MESSAGES_SHEET}!A:G`,
      valueInputOption: 'RAW',
      requestBody: { values: [row] },
    });

    return NextResponse.json({ success: true, message });
  } catch (err) {
    console.error('Chat POST error:', err);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
