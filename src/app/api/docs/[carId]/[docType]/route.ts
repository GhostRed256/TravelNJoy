import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function GET(req: NextRequest, { params }: { params: Promise<{ carId: string, docType: string }> }) {
  try {
    const { carId, docType } = await params;
    
    // Map nice URL names to Firestore document fields
    const docFieldMap: Record<string, string> = {
      'rc': 'docRC',
      'insurance': 'docInsurance',
      'puc': 'docPUC',
      'noc': 'docNOC',
      'seller-pan': 'docSellerPAN',
      'seller-aadhar': 'docSellerAadhar',
      'buyer-pan': 'docBuyerPAN',
      'buyer-aadhar': 'docBuyerAadhar'
    };

    const fieldName = docFieldMap[docType.toLowerCase()];
    
    if (!fieldName) {
      return new NextResponse('Invalid document type', { status: 400 });
    }

    const doc = await db.collection('cars').doc(carId).get();
    
    if (!doc.exists) {
      return new NextResponse('Car not found', { status: 404 });
    }

    const carData = doc.data();
    const docUrl = carData?.[fieldName];

    if (!docUrl) {
      return new NextResponse('Document not uploaded', { status: 404 });
    }

    // Redirect to the actual Firebase Storage URL
    return NextResponse.redirect(docUrl);
  } catch (err) {
    console.error('Doc redirect error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
