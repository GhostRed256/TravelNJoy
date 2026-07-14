import { NextRequest, NextResponse } from 'next/server';
import { getSheetsClient, SHEET_ID, MESSAGES_SHEET, rowToMessage } from '@/lib/sheets';
import { ChatSession } from '@/types/car';

export async function GET() {
  try {
    const sheets = getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${MESSAGES_SHEET}!A2:G`,
    });

    const rows = res.data.values || [];
    const messages = rows.filter(r => r[0]).map(rowToMessage);

    // Group messages by customer
    const sessionMap = new Map<string, ChatSession>();

    for (const msg of messages) {
      if (!sessionMap.has(msg.customerId)) {
        sessionMap.set(msg.customerId, {
          customerId: msg.customerId,
          customerName: msg.customerName,
          lastMessage: msg.message,
          lastTimestamp: msg.timestamp,
          unreadCount: 0,
          messages: [],
        });
      }

      const session = sessionMap.get(msg.customerId)!;
      session.messages.push(msg);

      if (new Date(msg.timestamp) > new Date(session.lastTimestamp)) {
        session.lastMessage = msg.message;
        session.lastTimestamp = msg.timestamp;
      }

      if (!msg.read && msg.sender === 'customer') {
        session.unreadCount++;
      }
    }

    const sessions = Array.from(sessionMap.values()).sort(
      (a, b) => new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime()
    );

    return NextResponse.json({ sessions });
  } catch (err) {
    console.error('Sessions error:', err);
    return NextResponse.json({ sessions: [] });
  }
}
