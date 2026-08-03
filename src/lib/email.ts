import nodemailer from 'nodemailer';
import { Car } from '@/types/car';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://travel-n-joy.vercel.app';
const LOGO_URL = `${APP_URL}/images/logo.jpg`;

const emailFooter = `
  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #3b2a5c; text-align: center; color: #8a7b9c; font-size: 12px;">
    <p>TravelNJoy | Premium Pre-Owned Cars</p>
    <p>This is an automated message. Please do not reply directly to this email.</p>
  </div>
`;

export const sendCustomerEmail = async (to: string, car: Car, action: 'reserved' | 'sold') => {
  if (!process.env.SMTP_EMAIL) {
    console.warn('SMTP_EMAIL not configured, skipping customer email.');
    return;
  }

  const subject = action === 'reserved' 
    ? `🚗 Reservation Confirmed: ${car.make} ${car.modelVariant}`
    : `🎉 Congratulations on your new ${car.make} ${car.modelVariant}!`;

  const title = action === 'reserved'
    ? 'Reservation Received'
    : 'Purchase Confirmed';

  const message = action === 'reserved'
    ? `Thank you for choosing TravelNJoy! We have received your reservation request for the <strong>${car.make} ${car.modelVariant}</strong>. Our team will contact you shortly to process your request and discuss the next steps.`
    : `Congratulations! Your purchase of the <strong>${car.make} ${car.modelVariant}</strong> has been confirmed. Thank you for trusting TravelNJoy for your premium pre-owned car experience.`;

  const html = `
    <div style="font-family: 'Inter', 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0b0914; color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #3b2a5c;">
      
      <!-- Header with Logo -->
      <div style="background: linear-gradient(180deg, #1f113a 0%, #0b0914 100%); padding: 30px 20px; text-align: center; border-bottom: 1px solid #3b2a5c;">
        <img src="${LOGO_URL}" alt="TravelNJoy Logo" style="width: 80px; height: 80px; border-radius: 12px; margin-bottom: 15px; box-shadow: 0 4px 20px rgba(124, 58, 237, 0.4);" />
        <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 700; letter-spacing: 0.5px;">
          Travel<span style="color: #22d3ee; text-shadow: 0 0 10px rgba(34, 211, 238, 0.5);">N</span>Joy
        </h1>
        <p style="color: #a78bfa; margin-top: 5px; font-size: 16px; letter-spacing: 1px; text-transform: uppercase;">${title}</p>
      </div>
      
      <div style="padding: 30px 20px;">
        <p style="font-size: 16px; line-height: 1.6; color: #e2e8f0;">Hi ${car.buyerName ? car.buyerName.split(' ')[0] : 'there'},</p>
        
        <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1;">${message}</p>
        
        <!-- Glassmorphism Card -->
        <div style="background-color: rgba(124, 58, 237, 0.05); border: 1px solid rgba(124, 58, 237, 0.2); padding: 20px; margin: 25px 0; border-radius: 8px;">
          <h3 style="margin: 0 0 15px 0; color: #c4b5fd; font-size: 18px;">Vehicle Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #94a3b8; border-bottom: 1px solid rgba(124, 58, 237, 0.1);">Make & Model:</td>
              <td style="padding: 8px 0; color: #ffffff; text-align: right; font-weight: 600; border-bottom: 1px solid rgba(124, 58, 237, 0.1);">${car.make} ${car.modelVariant}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #94a3b8; border-bottom: 1px solid rgba(124, 58, 237, 0.1);">Year:</td>
              <td style="padding: 8px 0; color: #ffffff; text-align: right; border-bottom: 1px solid rgba(124, 58, 237, 0.1);">${car.yearOfManufacture}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #94a3b8; border-bottom: 1px solid rgba(124, 58, 237, 0.1);">Registration:</td>
              <td style="padding: 8px 0; color: #ffffff; text-align: right; border-bottom: 1px solid rgba(124, 58, 237, 0.1);">${car.registrationNo || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #94a3b8; padding-top: 15px;">Price:</td>
              <td style="padding: 8px 0; color: #22d3ee; text-align: right; font-weight: 700; font-size: 18px; padding-top: 15px;">₹${car.quotingPrice.toLocaleString('en-IN')}</td>
            </tr>
          </table>
        </div>
        
        <div style="text-align: center; margin-top: 35px;">
          <a href="${APP_URL}/cars/${car.id}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 30px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3);">View Car Details</a>
        </div>
      </div>
      
      ${emailFooter}
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"TravelNJoy" <${process.env.SMTP_EMAIL}>`,
      to,
      subject,
      html,
    });
    console.log(`Customer email sent to ${to}`);
  } catch (error) {
    console.error('Error sending customer email:', error);
  }
};

export const sendAdminEmail = async (car: Car, action: 'reserved' | 'sold') => {
  const adminEmails = process.env.ADMIN_EMAILS;
  if (!process.env.SMTP_EMAIL || !adminEmails) {
    console.warn('SMTP_EMAIL or ADMIN_EMAILS not configured, skipping admin email.');
    return;
  }

  const subject = action === 'reserved' 
    ? `🚨 NEW RESERVATION: ${car.make} ${car.modelVariant}`
    : `💰 CAR SOLD: ${car.make} ${car.modelVariant}`;

  const statusColor = action === 'reserved' ? '#eab308' : '#22c55e'; // yellow or green

  const html = `
    <div style="font-family: 'Inter', 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0b0914; color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #3b2a5c;">
      
      <div style="background: linear-gradient(180deg, #1f113a 0%, #0b0914 100%); padding: 30px 20px; text-align: center; border-bottom: 1px solid #3b2a5c;">
        <img src="${LOGO_URL}" alt="TravelNJoy Logo" style="width: 60px; height: 60px; border-radius: 10px; margin-bottom: 10px; box-shadow: 0 4px 20px rgba(124, 58, 237, 0.4);" />
        <h2 style="margin: 0; color: #ffffff; font-size: 22px;">Admin Alert</h2>
      </div>
      
      <div style="padding: 30px 20px;">
        <h3 style="color: #ffffff; border-bottom: 2px solid ${statusColor}; padding-bottom: 10px; display: inline-block;">
          Status Updated: <span style="color: ${statusColor}; text-transform: uppercase; font-weight: 800;">${action}</span>
        </h3>
        
        <div style="background-color: rgba(124, 58, 237, 0.05); border: 1px solid rgba(124, 58, 237, 0.2); padding: 20px; border-radius: 8px; margin-top: 20px;">
          <h4 style="margin-top: 0; color: #c4b5fd; font-size: 16px;">Car Information</h4>
          <p style="color: #e2e8f0;"><strong>Make & Model:</strong> ${car.make} ${car.modelVariant}</p>
          <p style="color: #e2e8f0;"><strong>Year:</strong> ${car.yearOfManufacture}</p>
          <p style="color: #e2e8f0;"><strong>Reg No:</strong> ${car.registrationNo || 'N/A'}</p>
          <p style="color: #e2e8f0;"><strong>Price:</strong> <span style="color: #22d3ee; font-weight: 700;">₹${car.quotingPrice.toLocaleString('en-IN')}</span></p>
        </div>

        <div style="background-color: rgba(124, 58, 237, 0.05); border: 1px solid rgba(124, 58, 237, 0.2); padding: 20px; border-radius: 8px; margin-top: 20px;">
          <h4 style="margin-top: 0; color: #c4b5fd; font-size: 16px;">Buyer Details</h4>
          <p style="color: #e2e8f0;"><strong>Name:</strong> ${car.buyerName || 'N/A'}</p>
          <p style="color: #e2e8f0;"><strong>Email:</strong> ${car.buyerEmail || 'N/A'}</p>
          <p style="color: #e2e8f0;"><strong>PAN:</strong> ${car.buyerPAN || 'N/A'}</p>
          <p style="color: #e2e8f0;"><strong>Aadhar:</strong> ${car.buyerAadhar || 'N/A'}</p>
          <p style="color: #e2e8f0;"><strong>Address:</strong> ${car.buyerAddress || 'N/A'}</p>
        </div>
        
        <div style="text-align: center; margin-top: 35px;">
          <a href="${APP_URL}/admin" style="display: inline-block; background: #3b2a5c; color: white; text-decoration: none; padding: 12px 25px; border-radius: 6px; font-weight: 600;">Open Admin Dashboard</a>
        </div>
      </div>
      
      ${emailFooter}
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"TravelNJoy System" <${process.env.SMTP_EMAIL}>`,
      to: adminEmails,
      subject,
      html,
    });
    console.log(`Admin email sent to ${adminEmails}`);
  } catch (error) {
    console.error('Error sending admin email:', error);
  }
};
