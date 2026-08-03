import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { db } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const { email, carMake, carModel } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save to Firestore with a 5-minute expiry
    const expiry = new Date(Date.now() + 5 * 60 * 1000);
    await db.collection('customer_otps').doc(email.toLowerCase()).set({
      otp,
      expiresAt: expiry.toISOString()
    });

    // Send Email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"TravelNJoy" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: `Your Booking OTP - TravelNJoy`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #6b21a8;">TravelNJoy Booking</h2>
          <p>You requested to book the ${carMake} ${carModel}. Here is your One-Time Password (OTP):</p>
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
