import mongoose, { Schema, Model } from 'mongoose';

export interface IDynamicMenuItem {
  _id?: string;
  itemId: string;
  name: string;
  category: 'Kitchen' | 'Bar' | 'Grill' | 'Events' | string;
  pricingType: 'OPEN_MARKET_PRICE' | 'DAILY_SPECIAL' | 'SUGGESTED_BENCHMARK';
  suggestedPrice: number;
  priceFloor: number;
  dailyPriceSnapshot?: number;
  description?: string;
  imageUrl?: string;
  addedBy: string;
  isAvailable: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const DynamicMenuItemSchema = new Schema<IDynamicMenuItem>(
  {
    itemId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true, default: 'Kitchen' },
    pricingType: {
      type: String,
      required: true,
      enum: ['OPEN_MARKET_PRICE', 'DAILY_SPECIAL', 'SUGGESTED_BENCHMARK'],
      default: 'OPEN_MARKET_PRICE',
    },
    suggestedPrice: { type: Number, default: 0 },
    priceFloor: { type: Number, default: 0 },
    dailyPriceSnapshot: { type: Number, default: 0 },
    description: { type: String },
    imageUrl: { type: String },
    addedBy: { type: String, default: 'Resort Manager' },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const DynamicMenuItem: Model<IDynamicMenuItem> =
  mongoose.models.DynamicMenuItem ||
  mongoose.model<IDynamicMenuItem>('DynamicMenuItem', DynamicMenuItemSchema);
