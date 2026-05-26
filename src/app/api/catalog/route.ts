import { NextResponse } from 'next/server';
import { db, ClothingItem } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locationId = searchParams.get('locationId');

  if (!locationId) {
    return NextResponse.json({ error: 'Missing locationId parameter.' }, { status: 400 });
  }

  try {
    const catalog = db.getCatalog(locationId);
    return NextResponse.json({ catalog });
  } catch (err: any) {
    console.error('Error fetching catalog:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch catalog.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { locationId, title, category, imageUrl, gender = 'unisex', price } = await request.json();

    if (!locationId || !title || !category || !imageUrl) {
      return NextResponse.json({ error: 'Missing required catalog parameters.' }, { status: 400 });
    }

    const newItem: ClothingItem = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title,
      category,
      imageUrl,
      gender,
      price: price ? parseFloat(price) : undefined,
    };

    db.saveCatalogItem(locationId, newItem);
    const updatedCatalog = db.getCatalog(locationId);

    return NextResponse.json({ success: true, item: newItem, catalog: updatedCatalog });
  } catch (err: any) {
    console.error('Error adding catalog item:', err);
    return NextResponse.json({ error: err.message || 'Failed to add catalog item.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const locationId = searchParams.get('locationId');
  const itemId = searchParams.get('itemId');

  if (!locationId || !itemId) {
    return NextResponse.json({ error: 'Missing locationId or itemId parameters.' }, { status: 400 });
  }

  try {
    db.deleteCatalogItem(locationId, itemId);
    const updatedCatalog = db.getCatalog(locationId);
    return NextResponse.json({ success: true, catalog: updatedCatalog });
  } catch (err: any) {
    console.error('Error deleting catalog item:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete catalog item.' }, { status: 500 });
  }
}
