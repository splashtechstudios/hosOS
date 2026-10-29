import mongoose, { Schema, Model } from 'mongoose';

export interface IReservation {
  _id?: string;
  reservationNumber: string;
  roomNumber: string;
  roomType?: string;
  numberOfRooms?: number;
  guestsCount?: number;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  nightsCount: number;
  ratePerNight: number;
  totalExpectedAmount: number;
  depositPaid: number;
  status: 'PENDING_PAYMENT' | 'CONFIRMED' | 'CHECKED_IN' | 'CANCELLED' | 'NO_SHOW';
  paymentStatus: 'AWAITING_PAYMENT' | 'PARTIAL_DEPOSIT' | 'PAID_CONFIRMED';
  followUpStatus: 'PENDING' | 'CALLED' | 'TEXTED' | 'CALLED_AND_TEXTED';
  lastFollowUpAt?: string;
  lastFollowUpBy?: string;
  followUpNotes?: string;
  source: 'DIRECT_WALK_IN' | 'PHONE' | 'WHATSAPP' | 'WEBSITE_BOOKING' | 'CORPORATE';
  specialRequests?: string;
  bookedByStaffName: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ReservationSchema = new Schema<IReservation>(
  {
    reservationNumber: { type: String, required: true, unique: true, index: true },
    roomNumber: { type: String, required: true, index: true },
    roomType: { type: String, default: 'Standard Room' },
    numberOfRooms: { type: Number, default: 1 },
    guestsCount: { type: Number, default: 1 },
    guestName: { type: String, required: true, index: true },
    guestPhone: { type: String, required: true },
    guestEmail: { type: String },
    checkInDate: { type: String, required: true, index: true },
    checkOutDate: { type: String, required: true, index: true },
    nightsCount: { type: Number, required: true, default: 1 },
    ratePerNight: { type: Number, required: true },
    totalExpectedAmount: { type: Number, required: true },
    depositPaid: { type: Number, default: 0 },
    status: {
      type: String,
      required: true,
      enum: ['PENDING_PAYMENT', 'CONFIRMED', 'CHECKED_IN', 'CANCELLED', 'NO_SHOW'],
      default: 'PENDING_PAYMENT',
      index: true,
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ['AWAITING_PAYMENT', 'PARTIAL_DEPOSIT', 'PAID_CONFIRMED'],
      default: 'AWAITING_PAYMENT',
      index: true,
    },
    followUpStatus: {
      type: String,
      required: true,
      enum: ['PENDING', 'CALLED', 'TEXTED', 'CALLED_AND_TEXTED'],
      default: 'PENDING',
    },
    lastFollowUpAt: { type: String },
    lastFollowUpBy: { type: String },
    followUpNotes: { type: String },
    source: {
      type: String,
      required: true,
      enum: ['DIRECT_WALK_IN', 'PHONE', 'WHATSAPP', 'WEBSITE_BOOKING', 'CORPORATE'],
      default: 'DIRECT_WALK_IN',
    },
    specialRequests: { type: String },
    bookedByStaffName: { type: String, required: true, default: 'Website Guest Portal' },
  },
  { timestamps: true }
);

if (mongoose.models.Reservation) {
  delete mongoose.models.Reservation;
}

export const Reservation: Model<IReservation> =
  mongoose.model<IReservation>('Reservation', ReservationSchema);
