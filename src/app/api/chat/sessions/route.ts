import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { ChatMessage, ChatSession } from '@/types/car';

export async function GET() {
  try {
    const snapshot = await db.collection('messages').get();
    const messages: ChatMessage[] = snapshot.docs.map((doc: any) => doc.data() as ChatMessage);

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

    // Sort sessions so the most recent conversation is first
    const sessions = Array.from(sessionMap.values()).sort((a: ChatSession, b: ChatSession) => 
      new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime()
    );

    return NextResponse.json({ sessions });
  } catch (err) {
    console.error('Sessions error:', err);
    return NextResponse.json({ sessions: [] });
  }
}
