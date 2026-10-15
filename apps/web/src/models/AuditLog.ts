import mongoose, { Schema, Model } from 'mongoose';

export interface IAuditLog {
  _id?: string;
  roomNumber: string;
  category: 'OCCUPANCY' | 'ORDER' | 'ORDER_INCREMENT' | 'MAINTENANCE' | 'PAYMENT' | 'SERVICE' | 'SYSTEM';
  headline: string;
  details: string;
  amount?: number;
  actor: {
    staffId: string;
    staffName: string;
    role: string;
  };
  meta?: {
    orderNumber?: string;
    ticketNumber?: string;
    receiptNumber?: string;
    priceSnapshot?: number;
    itemName?: string;
    quantity?: number;
    reason?: string;
    priority?: string;
    method?: string;
    newStatus?: string;
    previousStatus?: string;
    category?: string;
    items?: Array<{ name: string; quantity: number; unitPrice: number }>;
    [key: string]: any;
  };
  timestamp: string; // ISO string
  createdAt?: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    roomNumber: { type: String, required: true, index: true },
    category: {
      type: String,
      required: true,
      enum: ['OCCUPANCY', 'ORDER', 'ORDER_INCREMENT', 'MAINTENANCE', 'PAYMENT', 'SERVICE', 'SYSTEM'],
      index: true,
    },
    headline: { type: String, required: true },
    details: { type: String, required: true },
    amount: { type: Number, default: 0 },
    actor: {
      staffId: { type: String, required: true },
      staffName: { type: String, required: true },
      role: { type: String, required: true },
    },
    meta: { type: Schema.Types.Mixed },
    timestamp: { type: String, required: true, default: () => new Date().toISOString(), index: true },
  },
  { timestamps: true }
);

// Prohibit modification or deletion of audit logs (immutable append-only guarantee)
AuditLogSchema.pre('updateOne', function () {
  throw new Error('Audit logs are immutable and cannot be updated.');
});
AuditLogSchema.pre('findOneAndUpdate', function () {
  throw new Error('Audit logs are immutable and cannot be updated.');
});
AuditLogSchema.pre('deleteOne', function () {
  throw new Error('Audit logs are immutable and cannot be deleted.');
});

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
