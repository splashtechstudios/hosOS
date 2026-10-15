import { Injectable, NotFoundException } from '@nestjs/common';
import { Room, RoomTimelineItem, RoomStatus, StaffUser } from '@hosos/types';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class RoomsService {
  constructor(private readonly auditService: AuditService) {}

  private rooms: Room[] = [
    {
      id: 'room-101',
      roomNumber: '101',
      roomTypeId: 'type-std',
      roomTypeName: 'Standard Garden View',
      floor: 1,
      rackRatePerNight: 55000,
      status: 'VACANT_CLEAN',
      occupancyHistory: [],
    },
    {
      id: 'room-204',
      roomNumber: '204',
      roomTypeId: 'type-dlx',
      roomTypeName: 'Deluxe Ocean View',
      floor: 2,
      rackRatePerNight: 95000,
      status: 'OCCUPIED',
      currentGuestName: 'Dr. Adeleke Bello',
      currentReservationId: 'res-204-77',
      currentFolioId: 'fol-204-89',
      occupancyHistory: [],
    },
  ];

  async getAllRooms(): Promise<Room[]> {
    return this.rooms;
  }

  async getRoomByNumber(roomNumber: string): Promise<Room> {
    const room = this.rooms.find((r) => r.roomNumber === roomNumber);
    if (!room) throw new NotFoundException(`Room ${roomNumber} not found`);
    return room;
  }

  async updateRoomStatus(
    roomNumber: string,
    newStatus: RoomStatus,
    staff: { id: string; name: string; role: any },
    notes: string
  ): Promise<Room> {
    const room = await this.getRoomByNumber(roomNumber);
    const prevStatus = room.status;
    room.status = newStatus;

    await this.auditService.logEvent({
      actor: {
        userId: staff.id,
        staffName: staff.name,
        role: staff.role,
      },
      actionType: 'ROOM_OCCUPANCY_CHANGED',
      targetEntity: {
        entityType: 'Room',
        entityId: room.id,
        identifierLabel: `Room ${roomNumber}`,
      },
      delta: {
        beforeState: { status: prevStatus },
        afterState: { status: newStatus },
        changeSummary: `Status changed from ${prevStatus} to ${newStatus}. Notes: ${notes}`,
      },
      terminalId: 'API_GATEWAY',
    });

    return room;
  }
}
