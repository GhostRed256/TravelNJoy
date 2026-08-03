import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const unlinkedDir = path.join(process.cwd(), 'public', 'images', 'unlinked');
    
    if (!fs.existsSync(unlinkedDir)) {
      return NextResponse.json({ images: [] });
    }

    const files = fs.readdirSync(unlinkedDir);
    const images = files.filter(f => f.match(/\.(jpg|jpeg|png|webp|gif)$/i)).map(f => `/images/unlinked/${f}`);
    
    return NextResponse.json({ images });
  } catch (error: any) {
    console.error('Error fetching unlinked images:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch unlinked images' }, { status: 500 });
  }
}
