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
        amenities: r.amenities && r.amenities.length > 0 ? r.amenities : ['Air Conditioning', 'High Speed Wi-Fi', 'Smart TV', 'Balcony', 'En-suite Jacuzzi'],
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
    if (body.amenities !== undefined && Array.isArray(body.amenities)) {
      room.amenities = body.amenities;
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
    } else if (rackRatePerNight !== undefined || customName !== undefined || body.amenities !== undefined) {
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
          amenities: room.amenities,
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

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const {
      roomNumber,
      roomTypeName,
      customName,
      colorTag,
      colorBg,
      floor,
      rackRatePerNight,
      amenities,
      maxOccupancy,
      createdBy,
    } = body;

    if (!roomNumber) {
      return NextResponse.json({ success: false, error: 'Room number is required' }, { status: 400 });
    }

    const cleanRoomNum = String(roomNumber).trim();
    const existing = await Room.findOne({ roomNumber: cleanRoomNum });
    if (existing) {
      return NextResponse.json({ success: false, error: `Room #${cleanRoomNum} already exists in registry.` }, { status: 409 });
    }

    const defaultAmenities = ['Air Conditioning', 'High Speed Wi-Fi', 'Smart TV', 'Balcony', 'En-suite Jacuzzi'];
    const assignedAmenities = Array.isArray(amenities) && amenities.length > 0 ? amenities : defaultAmenities;

    const newRoom = await Room.create({
      roomNumber: cleanRoomNum,
      roomTypeName: roomTypeName?.trim() || 'Executive Deluxe Suite',
      customName: customName?.trim() || '',
      colorTag: colorTag?.trim() || '#2563EB',
      colorBg: colorBg?.trim() || 'rgba(37,99,235,0.06)',
      floor: Number(floor) || 1,
      rackRatePerNight: Number(rackRatePerNight) || 45000,
      status: 'VACANT_CLEAN',
      amenities: assignedAmenities,
      maxOccupancy: Number(maxOccupancy) || 2,
    });

    try {
      await AuditLog.create({
        roomNumber: newRoom.roomNumber,
        category: 'SERVICE',
        actor: {
          staffId: 'admin-01',
          staffName: createdBy || 'Admin',
          role: 'SUPERADMIN',
        },
        headline: `New Room Created: Room #${newRoom.roomNumber}`,
        details: `Room #${newRoom.roomNumber} (${newRoom.roomTypeName}) added with rack rate ₦${newRoom.rackRatePerNight.toLocaleString()}`,
        meta: {
          roomNumber: newRoom.roomNumber,
          roomTypeName: newRoom.roomTypeName,
          rackRatePerNight: newRoom.rackRatePerNight,
          amenities: assignedAmenities,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (_) {}

    return NextResponse.json({
      success: true,
      room: {
        id: String(newRoom._id),
        roomNumber: newRoom.roomNumber,
        roomTypeId: `type-${newRoom.roomNumber}`,
        roomTypeName: newRoom.roomTypeName,
        customName: newRoom.customName,
        colorTag: newRoom.colorTag,
        colorBg: newRoom.colorBg,
        floor: newRoom.floor,
        rackRatePerNight: newRoom.rackRatePerNight,
        status: newRoom.status,
        amenities: newRoom.amenities,
      },
    });
  } catch (err: any) {
    console.error('Error in POST /api/rooms:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
