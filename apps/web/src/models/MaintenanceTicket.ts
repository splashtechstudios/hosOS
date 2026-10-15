import mongoose, { Schema, Model } from 'mongoose';

export interface IMaintenanceTicket {
  _id?: string;
  ticketId: string;
  roomNumber: string;
  issue: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY_ROOM_DOWN';
  partsCost: number;
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  reportedByName: string;
  reportedByStaffId: string;
  reportedByRole: string;
  assignedTo?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const MaintenanceTicketSchema = new Schema<IMaintenanceTicket>(
  {
    ticketId: { type: String, required: true, unique: true, index: true },
    roomNumber: { type: String, required: true, index: true },
    issue: { type: String, required: true },
    priority: {
      type: String,
      required: true,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY_ROOM_DOWN'],
      default: 'MEDIUM',
    },
    partsCost: { type: Number, default: 0 },
    status: {
      type: String,
      required: true,
      enum: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
      default: 'OPEN',
    },
    reportedByName: { type: String, required: true },
    reportedByStaffId: { type: String, required: true },
    reportedByRole: { type: String, required: true },
    assignedTo: { type: String, default: 'Facilities Team' },
    resolutionNotes: { type: String },
    resolvedAt: { type: String },
  },
  { timestamps: true }
);

export const MaintenanceTicket: Model<IMaintenanceTicket> =
  mongoose.models.MaintenanceTicket ||
  mongoose.model<IMaintenanceTicket>('MaintenanceTicket', MaintenanceTicketSchema);
