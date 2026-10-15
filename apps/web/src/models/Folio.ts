import mongoose, { Schema, Model } from 'mongoose';

export interface IFolioCharge {
  id: string;
  category: 'ROOM_RATE' | 'F_AND_B' | 'LAUNDRY' | 'MINIBAR' | 'TAX' | 'DAMAGE';
  description: string;
  amount: number;
  postedAt: string;
  postedByStaffName: string;
}

export interface IFolioPayment {
  id: string;
  method: 'CASH' | 'POS_TERMINAL' | 'BANK_TRANSFER' | 'CARD';
  amount: number;
  reference: string;
  receivedAt: string;
  receivedByStaffName: string;
}

export interface IFolio {
  _id?: string;
  folioNumber: string;
  roomNumber: string;
  guestName: string;
  guestPhone?: string;
  status: 'OPEN' | 'SETTLED' | 'CLOSED';
  checkInDate: string;
  checkOutDate: string;
  charges: IFolioCharge[];
  payments: IFolioPayment[];
  totalCharges: number;
  totalPayments: number;
  balance: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const FolioSchema = new Schema<IFolio>(
  {
    folioNumber: { type: String, required: true, unique: true, index: true },
    roomNumber: { type: String, required: true, index: true },
    guestName: { type: String, required: true },
    guestPhone: { type: String },
    status: {
      type: String,
      required: true,
      enum: ['OPEN', 'SETTLED', 'CLOSED'],
      default: 'OPEN',
    },
    checkInDate: { type: String, required: true },
    checkOutDate: { type: String, required: true },
    charges: [
      {
        id: { type: String, required: true },
        category: { type: String, required: true },
        description: { type: String, required: true },
        amount: { type: Number, required: true },
        postedAt: { type: String, required: true },
        postedByStaffName: { type: String, required: true },
      },
    ],
    payments: [
      {
        id: { type: String, required: true },
        method: { type: String, required: true },
        amount: { type: Number, required: true },
        reference: { type: String, required: true },
        receivedAt: { type: String, required: true },
        receivedByStaffName: { type: String, required: true },
      },
    ],
    totalCharges: { type: Number, required: true, default: 0 },
    totalPayments: { type: Number, required: true, default: 0 },
    balance: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

export const Folio: Model<IFolio> =
  mongoose.models.Folio || mongoose.model<IFolio>('Folio', FolioSchema);
