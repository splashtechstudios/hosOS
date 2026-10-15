import mongoose, { Schema, Model } from 'mongoose';

export interface INightAuditRecord {
  _id?: string;
  auditId: string;
  businessDate: string;
  nextBusinessDate: string;
  auditedByStaffId: string;
  auditedByStaffName: string;
  totalRoomsOccupied: number;
  totalRoomsAvailable: number;
  occupancyRatePercentage: number;
  roomRevenueAccrued: number;
  posFoodRevenue: number;
  posBeverageRevenue: number;
  vatCollected: number;
  consumptionTaxCollected: number;
  totalDailyRevenue: number;
  unbalancedFoliosCount: number;
  ledgerLocked: boolean;
  executedAt: string;
  createdAt?: Date;
}

const NightAuditRecordSchema = new Schema<INightAuditRecord>(
  {
    auditId: { type: String, required: true, unique: true, index: true },
    businessDate: { type: String, required: true, index: true },
    nextBusinessDate: { type: String, required: true },
    auditedByStaffId: { type: String, required: true },
    auditedByStaffName: { type: String, required: true },
    totalRoomsOccupied: { type: Number, required: true },
    totalRoomsAvailable: { type: Number, required: true },
    occupancyRatePercentage: { type: Number, required: true },
    roomRevenueAccrued: { type: Number, required: true },
    posFoodRevenue: { type: Number, required: true },
    posBeverageRevenue: { type: Number, required: true },
    vatCollected: { type: Number, required: true },
    consumptionTaxCollected: { type: Number, required: true },
    totalDailyRevenue: { type: Number, required: true },
    unbalancedFoliosCount: { type: Number, default: 0 },
    ledgerLocked: { type: Boolean, default: true },
    executedAt: { type: String, required: true, default: () => new Date().toISOString() },
  },
  { timestamps: true }
);

export const NightAuditRecord: Model<INightAuditRecord> =
  mongoose.models.NightAuditRecord ||
  mongoose.model<INightAuditRecord>('NightAuditRecord', NightAuditRecordSchema);
