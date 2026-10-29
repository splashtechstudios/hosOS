import { NextResponse, NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Room as RoomModel } from '@/models/Room';
import { AuditLog } from '@/models/AuditLog';
import {
  INITIAL_ROOMS,
  STANDARD_ROOM_AMENITIES,
  STANDARD_ROOM_DESCRIPTION,
  VIP_SUITE_AMENITIES,
  VIP_SUITE_DESCRIPTION,
} from '@/lib/mockData';
import type { Room } from '@hosos/types';

export const dynamic = 'force-dynamic';

declare global {
  // eslint-disable-next-line no-var
  var __hososRoomsStore: Room[] | undefined;
}

function getFallbackRoomsStore(): Room[] {
  if (!globalThis.__hososRoomsStore || globalThis.__hososRoomsStore.length === 0) {
    globalThis.__hososRoomsStore = [...INITIAL_ROOMS];
  }
  return globalThis.__hososRoomsStore;
}

function extractBlockFromRoomNumber(roomNumber: string, explicitBlock?: string): string {
  if (explicitBlock && explicitBlock.trim()) return explicitBlock.trim();
  const match = roomNumber.match(/^(Block\s+[A-Za-z0-9]+)/i);
  if (match) return match[1];
  return 'Resort Wing';
}

export async function GET() {
  try {
    await connectToDatabase();
    let dbRooms = await RoomModel.find().sort({ roomNumber: 1 });

    // Auto-migrate legacy 101/102/201 rooms or seed if empty so Osieka Block A1..C4 rooms are active
    const hasBlockRooms = dbRooms.some((r: any) => /^Block\s+[A-C]/i.test(r.roomNumber));
    if (!dbRooms || dbRooms.length === 0 || !hasBlockRooms) {
      if (dbRooms && dbRooms.length > 0 && !hasBlockRooms) {
        await RoomModel.deleteMany({ roomNumber: { $in: ['101', '102', '201', '202', '203', '204', '301'] } });
      }
      for (const r of INITIAL_ROOMS) {
        await RoomModel.findOneAndUpdate(
          { roomNumber: r.roomNumber },
          {
            $setOnInsert: {
              roomNumber: r.roomNumber,
              blockName: r.blockName || extractBlockFromRoomNumber(r.roomNumber),
              roomTypeName: r.roomTypeName,
              description: r.description,
              customName: r.customName || r.roomTypeName,
              colorTag: r.colorTag,
              colorBg: r.colorBg,
              floor: r.floor,
              rackRatePerNight: r.rackRatePerNight,
              status: r.status,
              currentGuestName: r.currentGuestName,
              currentFolioId: r.currentFolioId,
              lastCleanedAt: r.lastCleanedAt,
              lastCleanedByStaffName: r.lastCleanedByStaffName,
              amenities: r.amenities,
            },
          },
          { upsert: true, new: true }
        );
      }
      dbRooms = await RoomModel.find().sort({ roomNumber: 1 });
    }

    const formattedRooms: Room[] = dbRooms.map((r: any) => {
      const isVip = /vip/i.test(r.roomTypeName || '') || /vip/i.test(r.customName || '');
      const defaultAmenities = isVip ? VIP_SUITE_AMENITIES : STANDARD_ROOM_AMENITIES;
      const defaultDesc = isVip ? VIP_SUITE_DESCRIPTION : STANDARD_ROOM_DESCRIPTION;

      return {
        id: String(r._id),
        roomNumber: r.roomNumber,
        blockName: r.blockName || extractBlockFromRoomNumber(r.roomNumber),
        roomTypeId: isVip ? 'vip' : 'standard',
        roomTypeName: r.roomTypeName || (isVip ? 'Executive VIP Suite' : 'Standard Room'),
        description: r.description || defaultDesc,
        customName: r.customName || r.roomTypeName,
        colorTag: r.colorTag || (isVip ? '#D97706' : '#059669'),
        colorBg: r.colorBg || (isVip ? '#FFFBEB' : '#ECFDF5'),
        floor: r.floor || 1,
        rackRatePerNight: Number(r.rackRatePerNight) || (isVip ? 15000 : 10000),
        status: r.status || 'VACANT_CLEAN',
        currentGuestName: r.currentGuestName,
        currentFolioId: r.currentFolioId,
        activeMaintenanceTicketId: r.activeMaintenanceTicketId,
        lastCleanedAt: r.lastCleanedAt,
        lastCleanedByStaffName: r.lastCleanedByStaffName,
        amenities:
          Array.isArray(r.amenities) && r.amenities.length > 0 ? r.amenities : defaultAmenities,
        occupancyHistory: [],
      };
    });

    globalThis.__hososRoomsStore = formattedRooms;

    return NextResponse.json({
      success: true,
      rooms: formattedRooms,
    });
  } catch (error: any) {
    console.warn('MongoDB query failed in /api/rooms, serving live fallback store:', error.message);
    return NextResponse.json({
      success: true,
      fallback: true,
      rooms: getFallbackRoomsStore(),
    });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      roomNumber,
      newRoomNumber,
      blockName,
      roomTypeName,
      description,
      newStatus,
      rackRatePerNight,
      customName,
      colorTag,
      colorBg,
      amenities,
      notes,
      staff,
    } = body;

    if (!roomNumber) {
      return NextResponse.json(
        { success: false, error: 'roomNumber is required' },
        { status: 400 }
      );
    }

    const targetRoomName =
      newRoomNumber && String(newRoomNumber).trim()
        ? String(newRoomNumber).trim()
        : String(roomNumber).trim();

    // 1. Update live fallback store immediately
    const store = getFallbackRoomsStore();
    const storeIdx = store.findIndex((r) => r.roomNumber === roomNumber);
    if (storeIdx !== -1) {
      const existing = store[storeIdx];
      const nextTypeName = roomTypeName !== undefined ? roomTypeName : existing.roomTypeName;
      const isVip = /vip/i.test(nextTypeName);
      store[storeIdx] = {
        ...existing,
        roomNumber: targetRoomName,
        blockName:
          blockName !== undefined
            ? blockName
            : extractBlockFromRoomNumber(targetRoomName, existing.blockName),
        roomTypeId: isVip ? 'vip' : 'standard',
        roomTypeName: nextTypeName,
        description: description !== undefined ? description : existing.description,
        customName: customName !== undefined ? customName : existing.customName,
        colorTag: colorTag !== undefined ? colorTag : existing.colorTag,
        colorBg: colorBg !== undefined ? colorBg : existing.colorBg,
        rackRatePerNight:
          rackRatePerNight !== undefined ? Number(rackRatePerNight) : existing.rackRatePerNight,
        status: newStatus || existing.status,
        amenities: Array.isArray(amenities) ? amenities : existing.amenities,
        ...(newStatus === 'VACANT_CLEAN'
          ? {
              lastCleanedAt: new Date().toISOString(),
              lastCleanedByStaffName: staff?.name || 'Housekeeping Staff',
            }
          : {}),
        ...(newStatus === 'VACANT_DIRTY'
          ? {
              currentGuestName: undefined,
              currentFolioId: undefined,
            }
          : {}),
      };
    }

    // 2. Persist in MongoDB if available
    await connectToDatabase();
    const room = await RoomModel.findOne({ roomNumber });
    if (!room) {
      return NextResponse.json({
        success: true,
        fallback: true,
        message: `Room ${targetRoomName} updated in live store.`,
        room: storeIdx !== -1 ? store[storeIdx] : null,
      });
    }

    if (targetRoomName !== roomNumber) {
      const collision = await RoomModel.findOne({ roomNumber: targetRoomName });
      if (collision) {
        return NextResponse.json(
          { success: false, error: `A room named "${targetRoomName}" already exists.` },
          { status: 409 }
        );
      }
      room.roomNumber = targetRoomName;
    }

    if (blockName !== undefined) {
      room.blockName = blockName;
    } else if (targetRoomName !== roomNumber) {
      room.blockName = extractBlockFromRoomNumber(targetRoomName);
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

    if (roomTypeName !== undefined) {
      room.roomTypeName = roomTypeName;
    }
    if (description !== undefined) {
      room.description = description;
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
    if (Array.isArray(amenities)) {
      room.amenities = amenities;
    }

    await room.save();

    try {
      await AuditLog.create({
        roomNumber: room.roomNumber,
        category: statusChanged ? 'OCCUPANCY' : 'SERVICE',
        headline: statusChanged
          ? `Room Status Transitioned (${previousStatus} → ${newStatus})`
          : `Room Settings Updated (${room.roomNumber} • ${room.roomTypeName})`,
        details:
          notes ||
          `Updated ${room.roomNumber} (${room.roomTypeName}) — Rate: ₦${room.rackRatePerNight.toLocaleString()}/night.`,
        actor: {
          staffId: staff?.id || 'staff-system',
          staffName: staff?.name || 'Staff User',
          role: staff?.role || 'FRONT_DESK',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: `${room.roomNumber} updated successfully.`,
      room,
    });
  } catch (error: any) {
    console.warn('PATCH /api/rooms fallback used:', error.message);
    return NextResponse.json({
      success: true,
      fallback: true,
      message: 'Room settings updated in live store.',
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      roomNumber,
      blockName,
      roomTypeName,
      description,
      customName,
      colorTag,
      colorBg,
      floor,
      rackRatePerNight,
      amenities,
      maxOccupancy,
      createdBy,
    } = body;

    if (!roomNumber || !String(roomNumber).trim()) {
      return NextResponse.json(
        { success: false, error: 'Room name / number is required (e.g. Block A1 Room 1)' },
        { status: 400 }
      );
    }

    const cleanRoomNum = String(roomNumber).trim();
    const resolvedTypeName = roomTypeName?.trim() || 'Standard Room';
    const isVip = /vip/i.test(resolvedTypeName);
    const defaultAmenities = isVip ? VIP_SUITE_AMENITIES : STANDARD_ROOM_AMENITIES;
    const assignedAmenities =
      Array.isArray(amenities) && amenities.length > 0 ? amenities : defaultAmenities;
    const resolvedDesc =
      description?.trim() || (isVip ? VIP_SUITE_DESCRIPTION : STANDARD_ROOM_DESCRIPTION);
    const resolvedBlock = extractBlockFromRoomNumber(cleanRoomNum, blockName);
    const resolvedRate = Number(rackRatePerNight) || (isVip ? 15000 : 10000);

    const store = getFallbackRoomsStore();
    if (store.some((r) => r.roomNumber.toLowerCase() === cleanRoomNum.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: `"${cleanRoomNum}" already exists in the room inventory.` },
        { status: 409 }
      );
    }

    const newRoomObj: Room = {
      id: `room-${Date.now()}`,
      roomNumber: cleanRoomNum,
      blockName: resolvedBlock,
      roomTypeId: isVip ? 'vip' : 'standard',
      roomTypeName: resolvedTypeName,
      description: resolvedDesc,
      customName: customName?.trim() || resolvedTypeName,
      colorTag: colorTag?.trim() || (isVip ? '#D97706' : '#059669'),
      colorBg: colorBg?.trim() || (isVip ? '#FFFBEB' : '#ECFDF5'),
      floor: Number(floor) || 1,
      rackRatePerNight: resolvedRate,
      status: 'VACANT_CLEAN',
      amenities: assignedAmenities,
      occupancyHistory: [],
    };

    globalThis.__hososRoomsStore = [...store, newRoomObj];

    try {
      await connectToDatabase();
      const created = await RoomModel.create({
        roomNumber: cleanRoomNum,
        blockName: resolvedBlock,
        roomTypeName: resolvedTypeName,
        description: resolvedDesc,
        customName: customName?.trim() || resolvedTypeName,
        colorTag: newRoomObj.colorTag,
        colorBg: newRoomObj.colorBg,
        floor: newRoomObj.floor,
        rackRatePerNight: resolvedRate,
        status: 'VACANT_CLEAN',
        amenities: assignedAmenities,
        maxOccupancy: Number(maxOccupancy) || 2,
      });
      newRoomObj.id = String(created._id);

      await AuditLog.create({
        roomNumber: cleanRoomNum,
        category: 'SERVICE',
        actor: {
          staffId: 'admin-01',
          staffName: createdBy || 'Admin',
          role: 'SUPERADMIN',
        },
        headline: `New Room Created: ${cleanRoomNum} (${resolvedTypeName})`,
        details: `${cleanRoomNum} added to ${resolvedBlock} as ${resolvedTypeName} at ₦${resolvedRate.toLocaleString()}/night.`,
        timestamp: new Date().toISOString(),
      });
    } catch (dbErr: any) {
      console.warn('POST /api/rooms saved to live fallback store:', dbErr.message);
    }

    return NextResponse.json({
      success: true,
      room: newRoomObj,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roomNumber = searchParams.get('roomNumber');
    const permissionGranted = searchParams.get('permissionGranted') === 'true';
    const role = (searchParams.get('role') || '').toUpperCase();

    if (!permissionGranted && role !== 'SUPERADMIN' && role !== 'OWNER') {
      return NextResponse.json(
        { success: false, error: 'Access Denied: You do not have permission to delete rooms.' },
        { status: 403 }
      );
    }

    if (!roomNumber) {
      return NextResponse.json(
        { success: false, error: 'roomNumber is required' },
        { status: 400 }
      );
    }

    const store = getFallbackRoomsStore();
    globalThis.__hososRoomsStore = store.filter((r) => r.roomNumber !== roomNumber);

    try {
      await connectToDatabase();
      await RoomModel.deleteOne({ roomNumber });
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: `${roomNumber} deleted from inventory.`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
