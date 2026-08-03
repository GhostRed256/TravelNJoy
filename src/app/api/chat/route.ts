import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { ChatMessage } from '@/types/car';

// GET - Fetch messages for a customer
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get('customerId');

  try {
    let snapshot: any;
    if (customerId) {
      snapshot = await db.collection('messages').where('customerId', '==', customerId).get();
    } else {
      snapshot = await db.collection('messages').get();
    }

    const messages: ChatMessage[] = snapshot.docs.map((doc: any) => doc.data() as ChatMessage);
    
    // Sort in-memory to prevent requiring composite indices in Firestore
    messages.sort((a: ChatMessage, b: ChatMessage) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

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

    // Store in Firestore
    await db.collection('messages').doc(message.id).set(message);

    return NextResponse.json({ success: true, message });
  } catch (err) {
    console.error('Chat POST error:', err);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
