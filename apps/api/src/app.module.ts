import { Module } from '@nestjs/common';
import { AuditService } from './modules/audit/audit.service';
import { RoomsService } from './modules/rooms/rooms.service';
import { RoomsController } from './modules/rooms/rooms.controller';

@Module({
  imports: [],
  controllers: [RoomsController],
  providers: [AuditService, RoomsService],
})
export class AppModule {}
