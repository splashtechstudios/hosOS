import mongoose, { Schema, Model } from 'mongoose';

export type HallStatus = 'AVAILABLE' | 'RESERVED' | 'EVENT_IN_PROGRESS' | 'CLEANING_TURNAROUND' | 'MAINTENANCE';

export interface ICurrentEvent {
  bookingId: string;
  eventName: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  date: string;
  timeSlot: string; // e.g. "10:00 AM - 06:00 PM"
  totalAmount: number;
  depositPaid: number;
  balanceDue: number;
  paymentMethod: 'POS' | 'TRANSFER' | 'CASH' | 'SPLIT';
  splitDetails?: {
    method1: string;
    amount1: number;
    method2: string;
    amount2: number;
  };
  status: 'CONFIRMED' | 'IN_PROGRESS' | 'CONCLUDED';
  bookedBy?: string;
}

export interface IServiceItem {
  _id?: string;
  serviceId: string;
  name: string;
  group: string; // 'Rooms' | 'Kitchen' | 'Drinks' | 'Halls and Events' | 'Laundry & Ancillary Services' | string
  price: number;
  duration: string; // e.g. "Full Day (8am - 6pm)", "Half Day (4 hrs)", "Per Hour", "Per Piece", "Per Event"
  capacity?: number;
  description?: string;
  isAvailable: boolean;
  status: HallStatus;
  amenities?: string[];
  currentEvent?: ICurrentEvent;
  bookingHistory?: Array<{
    bookingId: string;
    eventName: string;
    clientName: string;
    date: string;
    totalAmount: number;
    status: string;
  }>;
  addedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ServiceItemSchema = new Schema<IServiceItem>(
  {
    serviceId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    group: { type: String, required: true, default: 'Halls and Events' },
    price: { type: Number, required: true, default: 0 },
    duration: { type: String, required: true, default: 'Per Event' },
    capacity: { type: Number, default: 0 },
    description: { type: String, default: '' },
    isAvailable: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ['AVAILABLE', 'RESERVED', 'EVENT_IN_PROGRESS', 'CLEANING_TURNAROUND', 'MAINTENANCE'],
      default: 'AVAILABLE',
    },
    amenities: [{ type: String }],
    currentEvent: { type: Schema.Types.Mixed },
    bookingHistory: [{ type: Schema.Types.Mixed }],
    addedBy: { type: String, default: 'Super Admin' },
  },
  { timestamps: true }
);

export const ServiceItem: Model<IServiceItem> =
  mongoose.models.ServiceItem ||
  mongoose.model<IServiceItem>('ServiceItem', ServiceItemSchema);
