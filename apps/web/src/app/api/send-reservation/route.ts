import { type NextRequest, NextResponse } from 'next/server';
import { POST as createReservation } from '@/app/api/reservations/route';

export async function POST(request: NextRequest) {
  try {
    // Delegate directly to our unified /api/reservations POST handler
    return await createReservation(request);
  } catch (error) {
    console.error('Error processing reservation:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process reservation' },
      { status: 500 }
    );
  }
}
