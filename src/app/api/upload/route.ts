import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { imageBase64, extension = 'png' } = await request.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'Missing imageBase64 data.' }, { status: 400 });
    }

    // Clean base64 string
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${extension}`;
    const filePath = path.join(uploadsDir, fileName);

    fs.writeFileSync(filePath, buffer);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const imageUrl = `${appUrl}/uploads/${fileName}`;

    return NextResponse.json({ imageUrl });
  } catch (err: any) {
    console.error('File Upload Exception:', err);
    return NextResponse.json({ error: err.message || 'Failed to upload image.' }, { status: 500 });
  }
}
