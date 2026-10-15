import mongoose, { Schema, Model } from 'mongoose';

export interface IReservation {
  _id?: string;
  reservationNumber: string;
  roomNumber: string;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  nightsCount: number;
  ratePerNight: number;
  totalExpectedAmount: number;
  depositPaid: number;
  status: 'CONFIRMED' | 'CHECKED_IN' | 'CANCELLED' | 'NO_SHOW';
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
      enum: ['CONFIRMED', 'CHECKED_IN', 'CANCELLED', 'NO_SHOW'],
      default: 'CONFIRMED',
      index: true,
    },
    source: {
      type: String,
      required: true,
      enum: ['DIRECT_WALK_IN', 'PHONE', 'WHATSAPP', 'WEBSITE_BOOKING', 'CORPORATE'],
      default: 'DIRECT_WALK_IN',
    },
    specialRequests: { type: String },
    bookedByStaffName: { type: String, required: true, default: 'Front Desk' },
  },
  { timestamps: true }
);

export const Reservation: Model<IReservation> =
  mongoose.models.Reservation ||
  mongoose.model<IReservation>('Reservation', ReservationSchema);
