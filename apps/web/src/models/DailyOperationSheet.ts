import mongoose, { Schema, Model } from 'mongoose';

export interface IDailyOperationSheet {
  _id?: string;
  sheetId: string;
  date: string; // YYYY-MM-DD
  resortProperty: string;
  managerId: string;
  managerName: string;
  rooms: {
    occupiedCount: number;
    vacantCleanCount: number;
    vacantDirtyCount: number;
    outOfOrderCount: number;
    totalRooms: number;
    roomRevenueCash: number;
    roomRevenuePOS: number;
    roomRevenueTransfer: number;
    roomRevenueTotal: number;
  };
  fbSales: {
    foodSalesAmount: number;
    drinksSalesAmount: number;
    totalSalesAmount: number;
    cashReceived: number;
    posTerminalReceived: number;
    bankTransferReceived: number;
  };
  energyExpenses: {
    generatorRunHours: number;
    dieselLitresPurchased: number;
    dieselPricePerLitre: number;
    totalDieselCost: number;
    otherPettyExpenses: Array<{
      id: string;
      title: string;
      amount: number;
      paidVia: string;
      receiptAttached?: boolean;
    }>;
    totalExpenses: number;
  };
  reconciliation: {
    totalPhysicalCashHandover: number;
    expectedCashOnHand: number;
    cashDiscrepancy: number;
    receiptPhotoUrls?: string[];
    bankAlertNotes?: string;
    managerNotes?: string;
  };
  audit: {
    status: string;
    auditedBy?: string;
    auditedAt?: string;
    auditNotes?: string;
    varianceAmount?: number;
    discrepanciesFound?: string[];
  };
  submittedAt?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const DailyOperationSheetSchema = new Schema<IDailyOperationSheet>(
  {
    sheetId: { type: String, required: true, unique: true, index: true },
    date: { type: String, required: true, index: true },
    resortProperty: { type: String, default: 'Osieka Luxury Resort' },
    managerId: { type: String, required: true },
    managerName: { type: String, required: true },
    rooms: {
      occupiedCount: { type: Number, default: 0 },
      vacantCleanCount: { type: Number, default: 0 },
      vacantDirtyCount: { type: Number, default: 0 },
      outOfOrderCount: { type: Number, default: 0 },
      totalRooms: { type: Number, default: 60 },
      roomRevenueCash: { type: Number, default: 0 },
      roomRevenuePOS: { type: Number, default: 0 },
      roomRevenueTransfer: { type: Number, default: 0 },
      roomRevenueTotal: { type: Number, default: 0 },
    },
    fbSales: {
      foodSalesAmount: { type: Number, default: 0 },
      drinksSalesAmount: { type: Number, default: 0 },
      totalSalesAmount: { type: Number, default: 0 },
      cashReceived: { type: Number, default: 0 },
      posTerminalReceived: { type: Number, default: 0 },
      bankTransferReceived: { type: Number, default: 0 },
    },
    energyExpenses: {
      generatorRunHours: { type: Number, default: 0 },
      dieselLitresPurchased: { type: Number, default: 0 },
      dieselPricePerLitre: { type: Number, default: 1250 },
      totalDieselCost: { type: Number, default: 0 },
      otherPettyExpenses: [
        {
          id: { type: String },
          title: { type: String },
          amount: { type: Number },
          paidVia: { type: String, default: 'CASH' },
          receiptAttached: { type: Boolean, default: false },
        },
      ],
      totalExpenses: { type: Number, default: 0 },
    },
    reconciliation: {
      totalPhysicalCashHandover: { type: Number, default: 0 },
      expectedCashOnHand: { type: Number, default: 0 },
      cashDiscrepancy: { type: Number, default: 0 },
      receiptPhotoUrls: [{ type: String }],
      bankAlertNotes: { type: String },
      managerNotes: { type: String },
    },
    audit: {
      status: { type: String, default: 'DRAFT', index: true },
      auditedBy: { type: String },
      auditedAt: { type: String },
      auditNotes: { type: String },
      varianceAmount: { type: Number, default: 0 },
      discrepanciesFound: [{ type: String }],
    },
    submittedAt: { type: String },
  },
  { timestamps: true }
);

export const DailyOperationSheet: Model<IDailyOperationSheet> =
  mongoose.models.DailyOperationSheet ||
  mongoose.model<IDailyOperationSheet>('DailyOperationSheet', DailyOperationSheetSchema);
