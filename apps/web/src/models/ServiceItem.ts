import mongoose, { Schema, Model } from 'mongoose';

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
    addedBy: { type: String, default: 'Super Admin' },
  },
  { timestamps: true }
);

export const ServiceItem: Model<IServiceItem> =
  mongoose.models.ServiceItem ||
  mongoose.model<IServiceItem>('ServiceItem', ServiceItemSchema);
