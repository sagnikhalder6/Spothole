import { NextResponse } from 'next/server';
import getDb from '../../../lib/mongodb';

export const dynamic = 'force-dynamic';

const MAX_IMAGE_CHARS = 500_000; // ~370 KB of image data; the browser shrinks photos far below this

function num(v, min, max) {
  return typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max ? v : null;
}

// Save a new pothole report
export async function POST(req) {
  try {
    const body = await req.json();
    const { deviceId, image } = body;

    if (typeof deviceId !== 'string' || !deviceId || deviceId.length > 64) {
      return NextResponse.json({ message: 'Missing device id' }, { status: 400 });
    }
    if (typeof image !== 'string' || !image.startsWith('data:image/jpeg;base64,')) {
      return NextResponse.json({ message: 'A JPEG image is required' }, { status: 400 });
    }
    if (image.length > MAX_IMAGE_CHARS) {
      return NextResponse.json({ message: 'Image is too large' }, { status: 413 });
    }

    const latitude = num(body.latitude, -90, 90);
    const longitude = num(body.longitude, -180, 180);
    const hasCoords = latitude !== null && longitude !== null;
    const address = typeof body.address === 'string' ? body.address.trim().slice(0, 200) : '';
    const message = typeof body.message === 'string' ? body.message.trim().slice(0, 200) : '';

    if (!hasCoords && !address) {
      return NextResponse.json(
        { message: 'Add GPS location or type the location manually' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const result = await db.collection('reports').insertOne({
      deviceId,
      image,
      latitude: hasCoords ? latitude : null,
      longitude: hasCoords ? longitude : null,
      address,
      message,
      status: 'pending', // pending | acknowledged | resolved
      createdAt: new Date(),
    });

    return NextResponse.json({ id: result.insertedId }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: 'Server error. Check MONGODB_URI.' }, { status: 500 });
  }
}

// ?deviceId=...  -> your own reports (with photos)
// ?scope=map     -> everyone's reports that have coordinates (no photos, no device ids)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const db = await getDb();
    const reports = db.collection('reports');

    if (searchParams.get('scope') === 'map') {
      const list = await reports
        .find({ latitude: { $type: 'number' } }, { projection: { image: 0, deviceId: 0 } })
        .sort({ createdAt: -1 })
        .limit(200)
        .toArray();
      return NextResponse.json({ reports: list });
    }

    const deviceId = searchParams.get('deviceId');
    if (!deviceId) return NextResponse.json({ message: 'deviceId is required' }, { status: 400 });

    const list = await reports
      .find({ deviceId }, { projection: { deviceId: 0 } })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();
    return NextResponse.json({ reports: list });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: 'Server error. Check MONGODB_URI.' }, { status: 500 });
  }
}
