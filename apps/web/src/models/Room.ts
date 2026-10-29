import mongoose, { Schema, Model } from 'mongoose';

export interface IRoom {
  _id?: string;
  roomNumber: string;
  blockName?: string;
  roomTypeName: string;
  description?: string;
  customName?: string;
  colorTag?: string;
  colorBg?: string;
  floor: number;
  rackRatePerNight: number;
  status: 'VACANT_CLEAN' | 'VACANT_DIRTY' | 'OCCUPIED' | 'OUT_OF_ORDER' | 'MAINTENANCE';
  currentGuestName?: string;
  currentFolioId?: string;
  activeMaintenanceTicketId?: string;
  lastCleanedAt?: string;
  lastCleanedByStaffName?: string;
  amenities?: string[];
  maxOccupancy?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const RoomSchema = new Schema<IRoom>(
  {
    roomNumber: { type: String, required: true, unique: true, index: true },
    blockName: { type: String },
    roomTypeName: { type: String, required: true, default: 'Standard Room' },
    description: { type: String },
    customName: { type: String },
    colorTag: { type: String },
    colorBg: { type: String },
    floor: { type: Number, required: true, default: 1 },
    rackRatePerNight: { type: Number, required: true, default: 10000 },
    status: {
      type: String,
      required: true,
      enum: ['VACANT_CLEAN', 'VACANT_DIRTY', 'OCCUPIED', 'OUT_OF_ORDER', 'MAINTENANCE'],
      default: 'VACANT_CLEAN',
    },
    currentGuestName: { type: String },
    currentFolioId: { type: String },
    activeMaintenanceTicketId: { type: String },
    lastCleanedAt: { type: String },
    lastCleanedByStaffName: { type: String },
    amenities: [{ type: String }],
    maxOccupancy: { type: Number, default: 2 },
  },
  { timestamps: true }
);

if (mongoose.models.Room) {
  delete mongoose.models.Room;
}

export const Room: Model<IRoom> = mongoose.model<IRoom>('Room', RoomSchema);
