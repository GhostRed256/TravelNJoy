import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    const doc = await db.collection('admin_otps').doc(email.toLowerCase()).get();
    
    if (!doc.exists) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 });
    }

    const data = doc.data();
    
    // Check expiration
    if (new Date() > new Date(data?.expiresAt)) {
      await db.collection('admin_otps').doc(email.toLowerCase()).delete();
      return NextResponse.json({ error: 'OTP has expired' }, { status: 401 });
    }

    // Check match
    if (data?.otp !== otp) {
      return NextResponse.json({ error: 'Incorrect OTP' }, { status: 401 });
    }

    // Success - delete OTP
    await db.collection('admin_otps').doc(email.toLowerCase()).delete();

    const response = NextResponse.json({ success: true, token: 'authenticated' });

    // Set secure HTTP-only cookie
    response.cookies.set('admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
