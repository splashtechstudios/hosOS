import mongoose, { Schema, Model } from 'mongoose';

export interface IRoom {
  _id?: string;
  roomNumber: string;
  roomTypeName: string;
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
    roomTypeName: { type: String, required: true, default: 'Standard Deluxe' },
    floor: { type: Number, required: true, default: 1 },
    rackRatePerNight: { type: Number, required: true, default: 45000 },
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

export const Room: Model<IRoom> = mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema);
