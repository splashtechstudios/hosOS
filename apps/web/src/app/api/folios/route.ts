import { NextResponse, NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Folio } from '@/models/Folio';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const roomNumber = searchParams.get('roomNumber');

    if (roomNumber) {
      const folio = await Folio.findOne({ roomNumber, status: 'OPEN' });
      return NextResponse.json({ success: true, folio });
    }

    const folios = await Folio.find({ status: 'OPEN' }).sort({ roomNumber: 1 });
    return NextResponse.json({ success: true, folios });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
