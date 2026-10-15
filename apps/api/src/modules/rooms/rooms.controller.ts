import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { Room, RoomStatus } from '@hosos/types';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  async getAllRooms(): Promise<Room[]> {
    return this.roomsService.getAllRooms();
  }

  @Get(':roomNumber')
  async getRoom(@Param('roomNumber') roomNumber: string): Promise<Room> {
    return this.roomsService.getRoomByNumber(roomNumber);
  }

  @Post(':roomNumber/status')
  async updateStatus(
    @Param('roomNumber') roomNumber: string,
    @Body() body: { status: RoomStatus; staff: { id: string; name: string; role: any }; notes: string }
  ): Promise<Room> {
    return this.roomsService.updateRoomStatus(roomNumber, body.status, body.staff, body.notes);
  }
}
