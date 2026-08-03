import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { db } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    // 1. Verify password
    if (password !== adminPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 2. Verify email is in ADMIN_EMAILS
    const allowedEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
    if (!allowedEmails.includes(email.toLowerCase())) {
      return NextResponse.json({ error: 'Unauthorized email' }, { status: 401 });
    }

    // 3. Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 4. Save to Firestore with a 5-minute expiry
    const expiry = new Date(Date.now() + 5 * 60 * 1000);
    await db.collection('admin_otps').doc(email.toLowerCase()).set({
      otp,
      expiresAt: expiry.toISOString()
    });

    // 5. Send Email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"TravelNJoy Admin" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: 'Your Admin Login OTP - TravelNJoy',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #6b21a8;">TravelNJoy Admin Portal</h2>
          <p>You requested to log in. Here is your One-Time Password (OTP):</p>
          <h1 style="font-size: 36px; letter-spacing: 5px; color: #111;">${otp}</h1>
          <p>This code will expire in 5 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: 'OTP sent' });
  } catch (error: any) {
    console.error('Send OTP Error:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
