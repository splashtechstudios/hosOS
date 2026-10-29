import mongoose, { Schema, Model } from 'mongoose';

export interface IContactMessage {
  _id?: string;
  messageId: string;
  firstName: string;
  lastName?: string;
  fullName: string;
  email?: string;
  phone: string;
  subject: string;
  message: string;
  status: 'UNREAD' | 'READ' | 'FOLLOWED_UP' | 'ARCHIVED';
  followUpChannel?: 'NONE' | 'CALLED' | 'WHATSAPP' | 'EMAIL';
  followedUpBy?: string;
  followedUpAt?: string;
  staffNotes?: string;
  source: 'CONTACT_FORM' | 'BOOKING_INQUIRY' | 'DIRECT';
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface IEmailSubscriber {
  _id?: string;
  subscriberId: string;
  name: string;
  email: string;
  phone?: string;
  source: 'NEWSLETTER_FORM' | 'CONTACT_FORM' | 'RESERVATION_PORTAL' | 'MANUAL_ENTRY';
  status: 'ACTIVE' | 'UNSUBSCRIBED';
  tags?: string[];
  subscribedAt: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

const ContactMessageSchema = new Schema<IContactMessage>(
  {
    messageId: { type: String, required: true, unique: true, index: true },
    firstName: { type: String, required: true },
    lastName: { type: String, default: '' },
    fullName: { type: String, required: true, index: true },
    email: { type: String, default: '' },
    phone: { type: String, required: true },
    subject: { type: String, default: 'General Concierge Inquiry' },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['UNREAD', 'READ', 'FOLLOWED_UP', 'ARCHIVED'],
      default: 'UNREAD',
      index: true,
    },
    followUpChannel: {
      type: String,
      enum: ['NONE', 'CALLED', 'WHATSAPP', 'EMAIL'],
      default: 'NONE',
    },
    followedUpBy: { type: String },
    followedUpAt: { type: String },
    staffNotes: { type: String },
    source: {
      type: String,
      enum: ['CONTACT_FORM', 'BOOKING_INQUIRY', 'DIRECT'],
      default: 'CONTACT_FORM',
    },
  },
  { timestamps: true }
);

const EmailSubscriberSchema = new Schema<IEmailSubscriber>(
  {
    subscriberId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, index: true },
    phone: { type: String, default: '' },
    source: {
      type: String,
      enum: ['NEWSLETTER_FORM', 'CONTACT_FORM', 'RESERVATION_PORTAL', 'MANUAL_ENTRY'],
      default: 'NEWSLETTER_FORM',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'UNSUBSCRIBED'],
      default: 'ACTIVE',
      index: true,
    },
    tags: [{ type: String }],
    subscribedAt: { type: String, required: true },
  },
  { timestamps: true }
);

if (mongoose.models.ContactMessage) {
  delete mongoose.models.ContactMessage;
}
if (mongoose.models.EmailSubscriber) {
  delete mongoose.models.EmailSubscriber;
}

export const ContactMessage: Model<IContactMessage> =
  mongoose.model<IContactMessage>('ContactMessage', ContactMessageSchema);

export const EmailSubscriber: Model<IEmailSubscriber> =
  mongoose.model<IEmailSubscriber>('EmailSubscriber', EmailSubscriberSchema);
