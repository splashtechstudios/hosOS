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
      rooms: rooms.map((r: any) => ({
        id: String(r._id),
        roomNumber: r.roomNumber,
        roomTypeId: `type-${r.roomNumber}`,
        roomTypeName: r.roomTypeName,
        customName: r.customName,
        colorTag: r.colorTag,
        colorBg: r.colorBg,
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
    const {
      roomNumber,
      newStatus,
      rackRatePerNight,
      customName,
      colorTag,
      colorBg,
      notes,
      staff,
    } = body;

    if (!roomNumber) {
      return NextResponse.json(
        { success: false, error: 'roomNumber is required' },
        { status: 400 }
      );
    }

    const room = await Room.findOne({ roomNumber });
    if (!room) {
      return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
    }

    const previousStatus = room.status;
    let statusChanged = false;

    if (newStatus && newStatus !== previousStatus) {
      room.status = newStatus;
      statusChanged = true;
      if (newStatus === 'VACANT_CLEAN') {
        room.lastCleanedAt = new Date().toISOString();
        room.lastCleanedByStaffName = staff?.name || 'Housekeeping Staff';
      } else if (newStatus === 'VACANT_DIRTY') {
        room.currentGuestName = undefined;
        room.currentFolioId = undefined;
      }
    }

    if (rackRatePerNight !== undefined) {
      room.rackRatePerNight = Number(rackRatePerNight);
    }
    if (customName !== undefined) {
      room.customName = customName;
    }
    if (colorTag !== undefined) {
      room.colorTag = colorTag;
    }
    if (colorBg !== undefined) {
      room.colorBg = colorBg;
    }

    await room.save();

    let auditRecord = null;
    if (statusChanged) {
      auditRecord = await AuditLog.create({
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
    } else if (rackRatePerNight !== undefined || customName !== undefined) {
      auditRecord = await AuditLog.create({
        roomNumber,
        category: 'SERVICE',
        headline: `Room Metadata Updated (Room #${roomNumber})`,
        details: notes || `Room settings updated: Name="${customName || room.roomTypeName}", Rate=₦${room.rackRatePerNight.toLocaleString()}.`,
        actor: {
          staffId: staff?.id || 'staff-system',
          staffName: staff?.name || 'Staff User',
          role: staff?.role || 'FRONT_DESK',
        },
        meta: {
          rackRatePerNight: room.rackRatePerNight,
          customName: room.customName,
          colorTag: room.colorTag,
        },
        timestamp: new Date().toISOString(),
      });
    }

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
