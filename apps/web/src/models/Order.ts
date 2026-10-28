import mongoose, { Schema, Model } from 'mongoose';

export interface IOrderItem {
  itemId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  station: 'KITCHEN' | 'BAR';
}

export interface IOrder {
  _id?: string;
  orderNumber: string;
  outlet: 'MAIN_RESTAURANT' | 'MAIN_BAR' | 'ROOM_SERVICE';
  roomNumber?: string;
  tableNumber?: string;
  guestFolioId?: string;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'SERVED' | 'BILLED' | 'PAID' | 'VOIDED';
  items: IOrderItem[];
  subtotal: number;
  vatAmount: number; // 7.5%
  consumptionTax: number; // 5%
  total: number;
  chargeToRoom: boolean;
  waiterName: string;
  waiterId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    outlet: {
      type: String,
      required: true,
      enum: ['MAIN_RESTAURANT', 'MAIN_BAR', 'ROOM_SERVICE'],
      default: 'MAIN_RESTAURANT',
    },
    roomNumber: { type: String, index: true },
    tableNumber: { type: String },
    guestFolioId: { type: String },
    status: {
      type: String,
      required: true,
      enum: ['PENDING', 'CONFIRMED', 'PREPARING', 'SERVED', 'BILLED', 'PAID', 'VOIDED'],
      default: 'CONFIRMED',
    },
    items: [
      {
        itemId: { type: String },
        name: { type: String, required: true },
        quantity: { type: Number, required: true, default: 1 },
        unitPrice: { type: Number, required: true },
        subtotal: { type: Number, required: true },
        station: { type: String, enum: ['KITCHEN', 'BAR'], default: 'KITCHEN' },
      },
    ],
    subtotal: { type: Number, required: true },
    vatAmount: { type: Number, required: true },
    consumptionTax: { type: Number, required: true },
    total: { type: Number, required: true },
    chargeToRoom: { type: Boolean, default: false },
    waiterName: { type: String, required: true },
    waiterId: { type: String, required: true },
  },
  { timestamps: true }
);

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
