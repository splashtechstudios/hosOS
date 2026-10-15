import { NextResponse, NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Room } from '@/models/Room';

export const dynamic = 'force-dynamic';
import { AuditLog } from '@/models/AuditLog';
import { INITIAL_ROOMS } from '@/lib/mockData';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET() {
  try {
    await connectToDatabase();
    let rooms = await Room.find().sort({ roomNumber: 1 });

    // Auto-seed if empty
    if (!rooms || rooms.length === 0) {
      for (const r of INITIAL_ROOMS) {
        await Room.create({
          roomNumber: r.roomNumber,
          roomTypeName: r.roomTypeName,
          floor: r.floor,
          rackRatePerNight: r.rackRatePerNight,
          status: r.status,
          currentGuestName: r.currentGuestName,
          currentFolioId: r.currentFolioId,
          lastCleanedAt: r.lastCleanedAt,
          lastCleanedByStaffName: r.lastCleanedByStaffName,
          amenities: ['Air Conditioning', 'High Speed Wi-Fi', 'Smart TV', 'Balcony', 'En-suite Jacuzzi'],
        });
      }
      rooms = await Room.find().sort({ roomNumber: 1 });
    }

    return NextResponse.json({
      success: true,
      rooms: rooms.map((r) => ({
        id: String(r._id),
        roomNumber: r.roomNumber,
        roomTypeId: `type-${r.roomNumber}`,
        roomTypeName: r.roomTypeName,
        floor: r.floor,
        rackRatePerNight: r.rackRatePerNight,
        status: r.status,
        currentGuestName: r.currentGuestName,
        currentFolioId: r.currentFolioId,
        activeMaintenanceTicketId: r.activeMaintenanceTicketId,
        lastCleanedAt: r.lastCleanedAt,
        lastCleanedByStaffName: r.lastCleanedByStaffName,
        occupancyHistory: [],
      })),
    });
  } catch (error: any) {
    console.warn('MongoDB query failed in /api/rooms, falling back to local room registry:', error.message);
    return NextResponse.json({
      success: true,
      fallback: true,
      rooms: INITIAL_ROOMS,
    });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { roomNumber, newStatus, notes, staff } = body;

    if (!roomNumber || !newStatus) {
      return NextResponse.json(
        { success: false, error: 'roomNumber and newStatus are required' },
        { status: 400 }
      );
    }

    const room = await Room.findOne({ roomNumber });
    if (!room) {
      return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
    }

    const previousStatus = room.status;
    room.status = newStatus;

    if (newStatus === 'VACANT_CLEAN') {
      room.lastCleanedAt = new Date().toISOString();
      room.lastCleanedByStaffName = staff?.name || 'Housekeeping Staff';
    } else if (newStatus === 'VACANT_DIRTY') {
      room.currentGuestName = undefined;
      room.currentFolioId = undefined;
    }

    await room.save();

    // Append to immutable internal room audit log
    const auditRecord = await AuditLog.create({
      roomNumber,
      category: 'OCCUPANCY',
      headline: `Room Status Transitioned (${previousStatus} → ${newStatus})`,
      details: notes || `Operational status updated from ${previousStatus} to ${newStatus}.`,
      actor: {
        staffId: staff?.id || 'staff-system',
        staffName: staff?.name || 'Staff User',
        role: staff?.role || 'FRONT_DESK',
      },
      meta: {
        previousStatus,
        newStatus,
        notes,
      },
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `Room #${roomNumber} status successfully updated to ${newStatus}.`,
      room,
      auditRecord,
    });
  } catch (error: any) {
    console.error('Error updating room status:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
