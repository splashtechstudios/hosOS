import mongoose, { Schema, Model } from 'mongoose';

export interface IInventoryItem {
  _id?: string;
  sku: string;
  name: string;
  category: 'FOOD_KITCHEN' | 'BEVERAGE_BAR' | 'FACILITIES_FUEL' | 'HOUSEKEEPING_LINEN' | 'MAINTENANCE_PARTS';
  unit: string;
  quantityOnHand: number;
  minThreshold: number;
  unitCost: number;
  location?: string;
  supplier?: string;
  lastRestockedAt?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const InventoryItemSchema = new Schema<IInventoryItem>(
  {
    sku: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, index: true },
    category: {
      type: String,
      required: true,
      enum: ['FOOD_KITCHEN', 'BEVERAGE_BAR', 'FACILITIES_FUEL', 'HOUSEKEEPING_LINEN', 'MAINTENANCE_PARTS'],
      default: 'FOOD_KITCHEN',
    },
    unit: { type: String, required: true, default: 'pcs' },
    quantityOnHand: { type: Number, required: true, default: 0 },
    minThreshold: { type: Number, required: true, default: 10 },
    unitCost: { type: Number, required: true, default: 0 },
    location: { type: String, default: 'Main Resort Store' },
    supplier: { type: String },
    lastRestockedAt: { type: String },
  },
  { timestamps: true }
);

export const InventoryItem: Model<IInventoryItem> =
  mongoose.models.InventoryItem ||
  mongoose.model<IInventoryItem>('InventoryItem', InventoryItemSchema);
