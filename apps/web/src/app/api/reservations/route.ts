import { NextResponse, NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Reservation, IReservation } from '@/models/Reservation';
import { AuditLog } from '@/models/AuditLog';
import { EmailSubscriber } from '@/models/MessageBoard';
import { upsertSubscriberInFallbackStore } from '@/app/api/messages/route';

export const dynamic = 'force-dynamic';

const INITIAL_FALLBACK_RESERVATIONS: IReservation[] = [
  {
    reservationNumber: 'RES-2026-0982',
    roomNumber: 'Block B1 Room 1',
    roomType: 'Standard Room',
    numberOfRooms: 1,
    guestsCount: 2,
    guestName: 'Engr. Babatunde Adeleke',
    guestPhone: '+234 803 412 8890',
    guestEmail: 'b.adeleke@gmail.com',
    checkInDate: '2026-10-30',
    checkOutDate: '2026-11-02',
    nightsCount: 3,
    ratePerNight: 10000,
    totalExpectedAmount: 30000,
    depositPaid: 0,
    status: 'PENDING_PAYMENT',
    paymentStatus: 'AWAITING_PAYMENT',
    followUpStatus: 'PENDING',
    source: 'WEBSITE_BOOKING',
    specialRequests: 'Late evening arrival around 7 PM, quiet room preferred.',
    bookedByStaffName: 'Website Guest Portal',
    createdAt: new Date(Date.now() - 1000 * 60 * 35),
  },
  {
    reservationNumber: 'RES-2026-0955',
    roomNumber: 'Block A1 Room 1',
    roomType: 'Executive VIP Suite',
    numberOfRooms: 1,
    guestsCount: 2,
    guestName: 'Barrister Folake Coker',
    guestPhone: '+234 809 111 2233',
    guestEmail: 'fcoker@chambers.ng',
    checkInDate: '2026-10-31',
    checkOutDate: '2026-11-03',
    nightsCount: 3,
    ratePerNight: 15000,
    totalExpectedAmount: 45000,
    depositPaid: 45000,
    status: 'CONFIRMED',
    paymentStatus: 'PAID_CONFIRMED',
    followUpStatus: 'CALLED_AND_TEXTED',
    lastFollowUpAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    lastFollowUpBy: 'Front Desk Concierge',
    source: 'WEBSITE_BOOKING',
    specialRequests: 'Airport pickup inquiry & extra pillows.',
    bookedByStaffName: 'Front Desk',
    createdAt: new Date(Date.now() - 1000 * 60 * 180),
  },
  {
    reservationNumber: 'RES-2026-0914',
    roomNumber: 'Block A2 Room 1',
    roomType: 'Executive VIP Suite',
    numberOfRooms: 1,
    guestsCount: 2,
    guestName: 'Chief Emeka Nwosu',
    guestPhone: '+234 803 555 0192',
    guestEmail: 'emeka.nwosu@nwosugroup.com',
    checkInDate: '2026-10-28',
    checkOutDate: '2026-11-01',
    nightsCount: 4,
    ratePerNight: 15000,
    totalExpectedAmount: 60000,
    depositPaid: 60000,
    status: 'CHECKED_IN',
    paymentStatus: 'PAID_CONFIRMED',
    followUpStatus: 'TEXTED',
    lastFollowUpAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    lastFollowUpBy: 'Reservations Desk',
    source: 'WHATSAPP',
    bookedByStaffName: 'Front Desk',
    createdAt: new Date(Date.now() - 1000 * 60 * 400),
  },
];

declare global {
  // eslint-disable-next-line no-var
  var __hososReservationsStore: IReservation[] | undefined;
}

function getFallbackStore(): IReservation[] {
  if (!globalThis.__hososReservationsStore) {
    globalThis.__hososReservationsStore = [...INITIAL_FALLBACK_RESERVATIONS];
  }
  return globalThis.__hososReservationsStore;
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const roomNumber = searchParams.get('roomNumber');

    const filter: any = {};
    if (roomNumber) filter.roomNumber = roomNumber;

    const dbReservations = await Reservation.find(filter).sort({ createdAt: -1, checkInDate: 1 }).lean();

    // Normalize legacy documents that may not have paymentStatus or followUpStatus yet
    const normalized = dbReservations.map((r: any) => {
      const hasPaid = Number(r.depositPaid || 0) > 0;
      const isFullyPaid = Number(r.depositPaid || 0) >= Number(r.totalExpectedAmount || 1);
      return {
        ...r,
        roomType: r.roomType || (Number(r.ratePerNight) >= 15000 ? 'VIP Suite' : 'Standard Room'),
        numberOfRooms: r.numberOfRooms || 1,
        guestsCount: r.guestsCount || 1,
        paymentStatus:
          r.paymentStatus ||
          (isFullyPaid ? 'PAID_CONFIRMED' : hasPaid ? 'PARTIAL_DEPOSIT' : 'AWAITING_PAYMENT'),
        status:
          r.status === 'CONFIRMED' && !hasPaid && !r.paymentStatus
            ? 'PENDING_PAYMENT'
            : r.status || (hasPaid ? 'CONFIRMED' : 'PENDING_PAYMENT'),
        followUpStatus: r.followUpStatus || 'PENDING',
      };
    });

    // Sync into fallback store as well
    if (normalized.length > 0) {
      globalThis.__hososReservationsStore = normalized;
    }

    return NextResponse.json({
      success: true,
      reservations: normalized.length > 0 ? normalized : getFallbackStore(),
    });
  } catch (error: any) {
    console.warn('MongoDB query failed in /api/reservations, returning fallback store:', error.message);
    return NextResponse.json({
      success: true,
      fallback: true,
      reservations: getFallbackStore(),
    });
  }
}

export async function POST(req: NextRequest) {
  let roomNumber = '';
  let roomType = 'Standard Room';
  let numberOfRooms = 1;
  let guestsCount = 1;
  let guestName = '';
  let guestPhone = '';
  let guestEmail = '';
  let checkInDate = '';
  let checkOutDate = '';
  let ratePerNight = 10000;
  let depositPaid = 0;
  let source: 'DIRECT_WALK_IN' | 'PHONE' | 'WHATSAPP' | 'WEBSITE_BOOKING' | 'CORPORATE' = 'WEBSITE_BOOKING';
  let specialRequests = '';
  let staff: any = null;

  try {
    const body = await req.json();

    // Support both CRM payload and Website Booking Modal payload
    guestName =
      body.guestName ||
      [body.firstName, body.lastName].filter(Boolean).join(' ').trim();
    guestPhone = body.guestPhone || body.phone || '+234 800 000 0000';
    guestEmail = body.guestEmail || body.email || '';
    checkInDate = body.checkInDate || body.checkIn;
    checkOutDate = body.checkOutDate || body.checkOut;
    numberOfRooms = Math.max(1, Number(body.numberOfRooms) || 1);
    guestsCount = Math.max(1, Number(body.guestsCount || body.guests) || 1);
    specialRequests = body.specialRequests || '';
    source = body.source || 'WEBSITE_BOOKING';
    staff = body.staff;

    // Resolve roomType & default rate
    if (
      body.roomType === 'vip' ||
      body.roomType === 'VIP Suite' ||
      body.roomType === 'Executive VIP Suite' ||
      body.roomType === 'Deluxe Suite'
    ) {
      roomType = 'Executive VIP Suite';
      ratePerNight = Number(body.ratePerNight) || 15000;
    } else if (body.roomType === 'standard' || body.roomType === 'Standard Room') {
      roomType = 'Standard Room';
      ratePerNight = Number(body.ratePerNight) || 10000;
    } else {
      roomType = body.roomType || 'Standard Room';
      ratePerNight = Number(body.ratePerNight) || 10000;
    }

    roomNumber =
      body.roomNumber ||
      (roomType === 'Executive VIP Suite' ? 'Block A1 Room 1' : 'Block B1 Room 1');

    depositPaid = Number(body.depositPaid) || 0;

    if (!guestName || !checkInDate || !checkOutDate) {
      return NextResponse.json(
        { success: false, error: 'Guest name, check-in date, and check-out date are required.' },
        { status: 400 }
      );
    }

    // Calculate nights & total amount
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const nightsCount = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const totalExpectedAmount =
      Number(body.totalAmount) > 0
        ? Number(body.totalAmount)
        : nightsCount * ratePerNight * numberOfRooms;

    // Core Policy: Reservation is ONLY honoured and kept after payment!
    const hasPayment = depositPaid > 0 || body.paymentConfirmed === true;
    const finalDeposit = body.paymentConfirmed && depositPaid === 0 ? totalExpectedAmount : depositPaid;
    const paymentStatus: IReservation['paymentStatus'] =
      finalDeposit >= totalExpectedAmount
        ? 'PAID_CONFIRMED'
        : finalDeposit > 0
        ? 'PARTIAL_DEPOSIT'
        : 'AWAITING_PAYMENT';
    const reservationStatus: IReservation['status'] = hasPayment ? 'CONFIRMED' : 'PENDING_PAYMENT';

    const reservationNumber = `RES-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newReservationRecord: IReservation = {
      reservationNumber,
      roomNumber,
      roomType,
      numberOfRooms,
      guestsCount,
      guestName,
      guestPhone,
      guestEmail,
      checkInDate,
      checkOutDate,
      nightsCount,
      ratePerNight,
      totalExpectedAmount,
      depositPaid: finalDeposit,
      status: reservationStatus,
      paymentStatus,
      followUpStatus: 'PENDING',
      source,
      specialRequests,
      bookedByStaffName: staff?.name || (source === 'WEBSITE_BOOKING' ? 'Website Booking Engine' : 'Front Desk'),
      createdAt: new Date(),
    };

    // Always add to fallback store immediately so it is guaranteed available
    const store = getFallbackStore();
    globalThis.__hososReservationsStore = [newReservationRecord, ...store];

    // If guest provided an email, also collect it in the Email List
    if (guestEmail && guestEmail.trim()) {
      const subId = `SUB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const nowIso = new Date().toISOString();
      upsertSubscriberInFallbackStore({
        subscriberId: subId,
        name: guestName,
        email: guestEmail.trim(),
        phone: guestPhone,
        source: 'RESERVATION_PORTAL',
        status: 'ACTIVE',
        tags: [roomType, 'Reservation Guest'],
        subscribedAt: nowIso,
        createdAt: nowIso,
      });
    }

    await connectToDatabase();

    if (guestEmail && guestEmail.trim()) {
      try {
        await EmailSubscriber.findOneAndUpdate(
          { email: { $regex: new RegExp(`^${guestEmail.trim()}$`, 'i') } },
          {
            $set: {
              name: guestName,
              email: guestEmail.trim(),
              phone: guestPhone,
              status: 'ACTIVE',
              subscribedAt: new Date().toISOString(),
            },
            $setOnInsert: {
              subscriberId: `SUB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
              source: 'RESERVATION_PORTAL',
            },
            $addToSet: { tags: { $each: [roomType, 'Reservation Guest'] } },
          },
          { upsert: true, new: true }
        );
      } catch (_) {}
    }

    // Double-Booking Collision Prevention ONLY applies when trying to lock a specific room with a HONOURED/PAID reservation
    if (body.roomNumber && hasPayment) {
      const conflicting = await Reservation.findOne({
        roomNumber,
        status: { $in: ['CONFIRMED', 'CHECKED_IN'] },
        paymentStatus: { $in: ['PAID_CONFIRMED', 'PARTIAL_DEPOSIT'] },
        $or: [{ checkInDate: { $lt: checkOutDate }, checkOutDate: { $gt: checkInDate } }],
      });

      if (conflicting) {
        return NextResponse.json(
          {
            success: false,
            error: `Double-Booking Collision Detected! Room #${roomNumber} is already honoured and paid by ${conflicting.guestName} (${conflicting.checkInDate} to ${conflicting.checkOutDate}).`,
            conflictingReservation: conflicting,
          },
          { status: 409 }
        );
      }
    }

    const reservation = await Reservation.create(newReservationRecord);

    // Log to immutable internal audit trail
    await AuditLog.create({
      roomNumber,
      category: 'SERVICE',
      headline: hasPayment
        ? `Paid Reservation Honoured & Room Kept (#${reservationNumber} - ${guestName})`
        : `Reservation Request Logged — Awaiting Payment (#${reservationNumber} - ${guestName})`,
      details: `${numberOfRooms}x ${roomType} booked for ${nightsCount} night(s) (${checkInDate} to ${checkOutDate}). Total Expected: ₦${totalExpectedAmount.toLocaleString()}. Paid: ₦${finalDeposit.toLocaleString()} (${paymentStatus.replace(/_/g, ' ')}). Policy: Only honoured after payment.`,
      amount: finalDeposit,
      actor: {
        staffId: staff?.id || 'web-booking-engine',
        staffName: staff?.name || 'Website Booking Portal',
        role: staff?.role || 'FRONT_DESK',
      },
      meta: {
        reservationNumber,
        guestName,
        guestPhone,
        checkInDate,
        checkOutDate,
        nightsCount,
        paymentStatus,
        source,
      },
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: hasPayment
        ? `Reservation #${reservationNumber} for ${guestName} is PAID & HONOURED for Room #${roomNumber}!`
        : `Reservation #${reservationNumber} logged! Please note: Reservation is only honoured and kept after payment verification.`,
      reservation,
    });
  } catch (error: any) {
    console.warn('MongoDB query warning during reservation creation, saved to live memory store:', error.message);
    const store = getFallbackStore();
    const latest = store[0];
    return NextResponse.json({
      success: true,
      fallback: true,
      message: `Reservation #${latest?.reservationNumber || 'RES-NEW'} logged for payment follow-up.`,
      reservation: latest,
    });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      reservationNumber,
      followUpAction, // 'CALLED' | 'TEXTED' | 'RESET'
      followUpNotes,
      confirmPayment, // boolean
      amountPaid,
      status, // 'CONFIRMED' | 'CANCELLED' | 'CHECKED_IN' | 'NO_SHOW'
      roomNumber,
      staffName,
    } = body;

    if (!reservationNumber) {
      return NextResponse.json(
        { success: false, error: 'reservationNumber is required' },
        { status: 400 }
      );
    }

    const nowIso = new Date().toISOString();
    const actorName = staffName || 'Front Desk Concierge';

    // Update in-memory fallback store first
    const store = getFallbackStore();
    const idx = store.findIndex((r) => r.reservationNumber === reservationNumber);
    let updatedFallback: IReservation | null = null;

    if (idx !== -1) {
      const existing = store[idx];
      let nextFollowUp = existing.followUpStatus || 'PENDING';
      if (followUpAction === 'CALLED') {
        nextFollowUp =
          existing.followUpStatus === 'TEXTED' || existing.followUpStatus === 'CALLED_AND_TEXTED'
            ? 'CALLED_AND_TEXTED'
            : 'CALLED';
      } else if (followUpAction === 'TEXTED') {
        nextFollowUp =
          existing.followUpStatus === 'CALLED' || existing.followUpStatus === 'CALLED_AND_TEXTED'
            ? 'CALLED_AND_TEXTED'
            : 'TEXTED';
      } else if (followUpAction === 'RESET') {
        nextFollowUp = 'PENDING';
      }

      const nextDeposit =
        confirmPayment
          ? Number(amountPaid) > 0
            ? Number(amountPaid)
            : existing.totalExpectedAmount
          : existing.depositPaid;

      const nextPaymentStatus: IReservation['paymentStatus'] = confirmPayment
        ? nextDeposit >= existing.totalExpectedAmount
          ? 'PAID_CONFIRMED'
          : 'PARTIAL_DEPOSIT'
        : existing.paymentStatus;

      const nextStatus: IReservation['status'] = status
        ? status
        : confirmPayment
        ? 'CONFIRMED'
        : existing.status;

      updatedFallback = {
        ...existing,
        followUpStatus: nextFollowUp,
        lastFollowUpAt: followUpAction ? nowIso : existing.lastFollowUpAt,
        lastFollowUpBy: followUpAction ? actorName : existing.lastFollowUpBy,
        followUpNotes: followUpNotes !== undefined ? followUpNotes : existing.followUpNotes,
        depositPaid: nextDeposit,
        paymentStatus: nextPaymentStatus,
        status: nextStatus,
        roomNumber: roomNumber || existing.roomNumber,
      };
      store[idx] = updatedFallback;
    }

    await connectToDatabase();
    const dbRes = await Reservation.findOne({ reservationNumber });

    if (dbRes) {
      if (followUpAction === 'CALLED') {
        dbRes.followUpStatus =
          dbRes.followUpStatus === 'TEXTED' || dbRes.followUpStatus === 'CALLED_AND_TEXTED'
            ? 'CALLED_AND_TEXTED'
            : 'CALLED';
        dbRes.lastFollowUpAt = nowIso;
        dbRes.lastFollowUpBy = actorName;
      } else if (followUpAction === 'TEXTED') {
        dbRes.followUpStatus =
          dbRes.followUpStatus === 'CALLED' || dbRes.followUpStatus === 'CALLED_AND_TEXTED'
            ? 'CALLED_AND_TEXTED'
            : 'TEXTED';
        dbRes.lastFollowUpAt = nowIso;
        dbRes.lastFollowUpBy = actorName;
      } else if (followUpAction === 'RESET') {
        dbRes.followUpStatus = 'PENDING';
      }

      if (followUpNotes !== undefined) {
        dbRes.followUpNotes = followUpNotes;
      }

      if (roomNumber) {
        dbRes.roomNumber = roomNumber;
      }

      if (confirmPayment) {
        const paidAmt = Number(amountPaid) > 0 ? Number(amountPaid) : dbRes.totalExpectedAmount;
        dbRes.depositPaid = paidAmt;
        dbRes.paymentStatus = paidAmt >= dbRes.totalExpectedAmount ? 'PAID_CONFIRMED' : 'PARTIAL_DEPOSIT';
        dbRes.status = 'CONFIRMED';
      }

      if (status) {
        dbRes.status = status;
      }

      await dbRes.save();

      await AuditLog.create({
        roomNumber: dbRes.roomNumber || '101',
        category: confirmPayment ? 'PAYMENT' : 'SERVICE',
        headline: confirmPayment
          ? `Reservation Payment Verified & Honoured (#${reservationNumber})`
          : followUpAction
          ? `Reservation Follow-Up Logged: ${followUpAction} (#${reservationNumber})`
          : `Reservation Status Updated (#${reservationNumber})`,
        details: `Guest: ${dbRes.guestName} (${dbRes.guestPhone}) • Follow-Up: ${dbRes.followUpStatus} • Payment Status: ${dbRes.paymentStatus} (Paid: ₦${dbRes.depositPaid.toLocaleString()}) • Updated by ${actorName}.`,
        amount: confirmPayment ? dbRes.depositPaid : 0,
        actor: {
          staffId: 'staff-concierge',
          staffName: actorName,
          role: 'FRONT_DESK',
        },
        timestamp: nowIso,
      });

      return NextResponse.json({
        success: true,
        reservation: dbRes,
        message: confirmPayment
          ? `Payment confirmed! Reservation #${reservationNumber} is now officially honoured and room is kept.`
          : followUpAction
          ? `Follow-up marked as ${followUpAction} for ${dbRes.guestName}.`
          : `Reservation #${reservationNumber} updated.`,
      });
    }

    return NextResponse.json({
      success: true,
      fallback: true,
      reservation: updatedFallback,
      message: `Reservation #${reservationNumber} updated.`,
    });
  } catch (error: any) {
    console.warn('PATCH /api/reservations fallback used:', error.message);
    return NextResponse.json({
      success: true,
      fallback: true,
      message: 'Follow-up / payment status updated in live store.',
    });
  }
}
