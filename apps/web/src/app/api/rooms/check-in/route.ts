import { NextResponse, NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Room } from '@/models/Room';
import { Folio } from '@/models/Folio';
import { AuditLog } from '@/models/AuditLog';
import { sendGuestWelcomeSms } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let roomNumber = '';
  let guestName = '';
  let guestPhone = '';
  let nightsCount = 1;
  let ratePerNight = 45000;
  let advancePayment = 0;
  let paymentMethod = 'POS_TERMINAL';
  let paymentReference = '';
  let staff: any = null;

  try {
    const body = await req.json();
    roomNumber = body.roomNumber;
    guestName = body.guestName;
    guestPhone = body.guestPhone || '+234 800 000 0000';
    nightsCount = Number(body.nightsCount) || 1;
    ratePerNight = Number(body.ratePerNight) || 45000;
    advancePayment = Number(body.advancePayment) || 0;
    paymentMethod = body.paymentMethod || 'POS_TERMINAL';
    paymentReference = body.paymentReference || `CHK-${Date.now().toString().slice(-6)}`;
    staff = body.staff;

    if (!roomNumber || !guestName) {
      return NextResponse.json(
        { success: false, error: 'roomNumber and guestName are required' },
        { status: 400 }
      );
    }

    const checkInDate = new Date().toISOString();
    const checkOutDateObj = new Date();
    checkOutDateObj.setDate(checkOutDateObj.getDate() + nightsCount);
    const checkOutDate = checkOutDateObj.toISOString();

    const folioNumber = `FOL-2026-${roomNumber}-${Date.now().toString().slice(-4)}`;

    await connectToDatabase();

    // 1. Update Room Status to OCCUPIED
    const room = await Room.findOne({ roomNumber });
    if (room) {
      room.status = 'OCCUPIED';
      room.currentGuestName = guestName;
      room.currentFolioId = folioNumber;
      await room.save();
    }

    // 2. Compute initial room tariff and taxes
    const baseRoomCharge = ratePerNight * nightsCount;
    const vat = Math.round(baseRoomCharge * 0.075);
    const consumptionTax = Math.round(baseRoomCharge * 0.05);
    const totalRoomCharge = baseRoomCharge + vat + consumptionTax;

    const initialCharges = [
      {
        id: `chg-${Date.now()}-1`,
        category: 'ROOM_RATE' as const,
        description: `Room Accommodation (${nightsCount} Night${nightsCount > 1 ? 's' : ''}) + FIRS 7.5% VAT + 5% State Tax`,
        amount: totalRoomCharge,
        postedAt: checkInDate,
        postedByStaffName: staff?.name || 'Front Desk Receptionist',
      },
    ];

    const initialPayments = advancePayment > 0 ? [
      {
        id: `pay-${Date.now()}-1`,
        method: paymentMethod as any,
        amount: advancePayment,
        reference: paymentReference,
        receivedAt: checkInDate,
        receivedByStaffName: staff?.name || 'Front Desk Receptionist',
      },
    ] : [];

    // 3. Create active Folio
    const folio = await Folio.create({
      folioNumber,
      roomNumber,
      guestName,
      guestPhone,
      status: 'OPEN',
      checkInDate,
      checkOutDate,
      charges: initialCharges,
      payments: initialPayments,
      totalCharges: totalRoomCharge,
      totalPayments: advancePayment,
      balance: totalRoomCharge - advancePayment,
    });

    // 4. Log to Immutable Audit Trail
    const auditRecord = await AuditLog.create({
      roomNumber,
      category: 'OCCUPANCY',
      headline: `Guest Check-In Activated (${guestName})`,
      details: `Checked in for ${nightsCount} night(s) through ${checkOutDate.split('T')[0]}. Room Rate: ₦${ratePerNight.toLocaleString()}/night. Total Folio Accrued: ₦${totalRoomCharge.toLocaleString()}. Advance Deposit: ₦${advancePayment.toLocaleString()} (${paymentMethod.replace(/_/g, ' ')}).`,
      amount: advancePayment,
      actor: {
        staffId: staff?.id || 'staff-front-desk',
        staffName: staff?.name || 'Front Desk Staff',
        role: staff?.role || 'FRONT_DESK',
      },
      meta: {
        folioNumber,
        guestName,
        guestPhone,
        nightsCount,
        advancePayment,
        paymentReference,
        newStatus: 'OCCUPIED',
      },
      timestamp: checkInDate,
    });

    // 5. Send automated guest welcome SMS
    await sendGuestWelcomeSms({
      guestName,
      phone: guestPhone,
      roomNumber,
      wifiCode: 'OseikaVIP2026',
      checkOutDate: checkOutDate.split('T')[0],
    });

    return NextResponse.json({
      success: true,
      message: `Guest ${guestName} successfully checked into Room #${roomNumber}! Folio #${folioNumber} opened.`,
      folio,
      auditRecord,
    });
  } catch (error: any) {
    console.warn('MongoDB connection failed during check-in, returning local check-in record:', error.message);
    const folioNumber = `FOL-2026-${roomNumber}`;
    return NextResponse.json({
      success: true,
      fallback: true,
      message: `Guest ${guestName} successfully checked into Room #${roomNumber} (Local Shift Ledger).`,
      folio: {
        folioNumber,
        roomNumber,
        guestName,
        status: 'OPEN',
        balance: (ratePerNight * nightsCount) - advancePayment,
      },
    });
  }
}
