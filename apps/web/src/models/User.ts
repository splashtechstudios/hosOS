import mongoose, { Schema, Model } from 'mongoose';

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  password: string; // Plain/hash for auth
  role: string;
  department: string;
  pinCode: string;
  phone?: string;
  nin?: string;
  salaryTier?: string;
  bankName?: string;
  bankAccountNumber?: string;
  onboardedBy?: string;
  isActive: boolean;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    required: true,
    enum: [
      'OWNER',
      'GENERAL_MANAGER',
      'FRONT_DESK',
      'CASHIER',
      'WAITER',
      'BARTENDER',
      'CHEF',
      'HOUSEKEEPING',
      'MAINTENANCE',
      'ACCOUNTANT',
      'STOREKEEPER'
    ]
  },
  department: { type: String, required: true },
  pinCode: { type: String, required: true, default: '1234' },
  phone: { type: String },
  nin: { type: String },
  salaryTier: { type: String },
  bankName: { type: String },
  bankAccountNumber: { type: String },
  onboardedBy: { type: String, default: 'System Super Admin' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
