import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import {
  ContactMessage,
  EmailSubscriber,
  IContactMessage,
  IEmailSubscriber,
} from '@/models/MessageBoard';

export const dynamic = 'force-dynamic';

const INITIAL_MESSAGES: IContactMessage[] = [
  {
    messageId: 'MSG-2026-8421',
    firstName: 'Dr. Kayode',
    lastName: 'Olatunji',
    fullName: 'Dr. Kayode Olatunji',
    email: 'k.olatunji@medcare.ng',
    phone: '+234 803 782 4410',
    subject: 'Weekend Family Retreat & VIP Suite Inquiry',
    message:
      'Good day Osieka Resort team, we are planning a 3-night family getaway next weekend and would like to reserve 2 VIP Suites and arrange a private bonfire dinner on Saturday evening. Please share payment details.',
    status: 'UNREAD',
    followUpChannel: 'NONE',
    source: 'CONTACT_FORM',
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
  {
    messageId: 'MSG-2026-8390',
    firstName: 'Mrs. Amina',
    lastName: 'Bello',
    fullName: 'Mrs. Amina Bello',
    email: 'amina.bello@zenithcorp.com',
    phone: '+234 809 334 1122',
    subject: 'Corporate Strategy Retreat & Dining Package',
    message:
      'Hello, our executive team of 8 guests is visiting Ogori next month. Since you are 100% solar powered with uninterrupted power and Wi-Fi, we would love to book rooms and daily breakfast/dinner catering.',
    status: 'FOLLOWED_UP',
    followUpChannel: 'WHATSAPP',
    followedUpBy: 'Concierge Desk',
    followedUpAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    staffNotes: 'Sent pro-forma invoice and account details via WhatsApp.',
    source: 'CONTACT_FORM',
    createdAt: new Date(Date.now() - 1000 * 60 * 210).toISOString(),
  },
];

const INITIAL_SUBSCRIBERS: IEmailSubscriber[] = [
  {
    subscriberId: 'SUB-2026-5011',
    name: 'Dr. Kayode Olatunji',
    email: 'k.olatunji@medcare.ng',
    phone: '+234 803 782 4410',
    source: 'CONTACT_FORM',
    status: 'ACTIVE',
    tags: ['VIP Inquiry', 'Weekend Retreat'],
    subscribedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
  {
    subscriberId: 'SUB-2026-4982',
    name: 'Mrs. Amina Bello',
    email: 'amina.bello@zenithcorp.com',
    phone: '+234 809 334 1122',
    source: 'CONTACT_FORM',
    status: 'ACTIVE',
    tags: ['Corporate', 'Dining'],
    subscribedAt: new Date(Date.now() - 1000 * 60 * 210).toISOString(),
  },
  {
    subscriberId: 'SUB-2026-4910',
    name: 'Engr. Segun Adeyemi',
    email: 'segun.adeyemi@gmail.com',
    phone: '+234 805 221 9087',
    source: 'NEWSLETTER_FORM',
    status: 'ACTIVE',
    tags: ['Osieka Dispatch', 'Seasonal Offers'],
    subscribedAt: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
  },
  {
    subscriberId: 'SUB-2026-4875',
    name: 'Barrister Folake Coker',
    email: 'fcoker@chambers.ng',
    phone: '+234 809 111 2233',
    source: 'RESERVATION_PORTAL',
    status: 'ACTIVE',
    tags: ['VIP Suite Guest'],
    subscribedAt: new Date(Date.now() - 1000 * 60 * 1440).toISOString(),
  },
];

declare global {
  // eslint-disable-next-line no-var
  var __hososContactMessagesStore: IContactMessage[] | undefined;
  // eslint-disable-next-line no-var
  var __hososEmailSubscribersStore: IEmailSubscriber[] | undefined;
}

export function getMessagesFallbackStore(): IContactMessage[] {
  if (!globalThis.__hososContactMessagesStore) {
    globalThis.__hososContactMessagesStore = [...INITIAL_MESSAGES];
  }
  return globalThis.__hososContactMessagesStore;
}

export function getSubscribersFallbackStore(): IEmailSubscriber[] {
  if (!globalThis.__hososEmailSubscribersStore) {
    globalThis.__hososEmailSubscribersStore = [...INITIAL_SUBSCRIBERS];
  }
  return globalThis.__hososEmailSubscribersStore;
}

export function upsertSubscriberInFallbackStore(sub: IEmailSubscriber): IEmailSubscriber {
  const store = getSubscribersFallbackStore();
  const normalizedEmail = sub.email.trim().toLowerCase();
  const existingIdx = store.findIndex((s) => s.email.trim().toLowerCase() === normalizedEmail);
  if (existingIdx !== -1) {
    const updated: IEmailSubscriber = {
      ...store[existingIdx],
      name: sub.name || store[existingIdx].name,
      phone: sub.phone || store[existingIdx].phone,
      status: 'ACTIVE',
      tags: Array.from(new Set([...(store[existingIdx].tags || []), ...(sub.tags || [])])),
    };
    store[existingIdx] = updated;
    return updated;
  }
  globalThis.__hososEmailSubscribersStore = [sub, ...store];
  return sub;
}

export async function GET() {
  try {
    await connectToDatabase();
    const [dbMessages, dbSubscribers] = await Promise.all([
      ContactMessage.find({}).sort({ createdAt: -1 }).lean(),
      EmailSubscriber.find({}).sort({ createdAt: -1 }).lean(),
    ]);

    const memMessages = getMessagesFallbackStore();
    const memSubscribers = getSubscribersFallbackStore();

    // Merge DB and memory stores by unique ID / email so new submissions are always visible
    const mergedMessagesMap = new Map<string, IContactMessage>();
    for (const m of [...dbMessages, ...memMessages]) {
      if (m.messageId && !mergedMessagesMap.has(m.messageId)) {
        mergedMessagesMap.set(m.messageId, m as IContactMessage);
      }
    }

    const mergedSubscribersMap = new Map<string, IEmailSubscriber>();
    for (const s of [...dbSubscribers, ...memSubscribers]) {
      const key = (s.email || s.subscriberId || '').toLowerCase();
      if (key && !mergedSubscribersMap.has(key)) {
        mergedSubscribersMap.set(key, s as IEmailSubscriber);
      }
    }

    const messages = Array.from(mergedMessagesMap.values());
    const subscribers = Array.from(mergedSubscribersMap.values());

    globalThis.__hososContactMessagesStore = messages;
    globalThis.__hososEmailSubscribersStore = subscribers;

    return NextResponse.json({
      success: true,
      messages,
      subscribers,
    });
  } catch (error: any) {
    console.warn('MongoDB warning in GET /api/messages, serving live store:', error.message);
    return NextResponse.json({
      success: true,
      fallback: true,
      messages: getMessagesFallbackStore(),
      subscribers: getSubscribersFallbackStore(),
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const type = body.type || 'MESSAGE'; // 'MESSAGE' | 'SUBSCRIBER'
    const nowIso = new Date().toISOString();

    if (type === 'SUBSCRIBER') {
      const email = (body.email || '').trim();
      const name = (body.name || 'Resort Guest').trim();
      const phone = (body.phone || '').trim();
      const source = body.source || 'NEWSLETTER_FORM';
      const tags = Array.isArray(body.tags) ? body.tags : ['Osieka Dispatch'];

      if (!email) {
        return NextResponse.json(
          { success: false, error: 'Email address is required.' },
          { status: 400 }
        );
      }

      const subscriberRecord: IEmailSubscriber = {
        subscriberId: `SUB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        name,
        email,
        phone,
        source,
        status: 'ACTIVE',
        tags,
        subscribedAt: nowIso,
        createdAt: nowIso,
      };

      const savedSub = upsertSubscriberInFallbackStore(subscriberRecord);

      try {
        await connectToDatabase();
        await EmailSubscriber.findOneAndUpdate(
          { email: { $regex: new RegExp(`^${email}$`, 'i') } },
          {
            $set: {
              name,
              email,
              ...(phone ? { phone } : {}),
              status: 'ACTIVE',
              subscribedAt: nowIso,
            },
            $setOnInsert: {
              subscriberId: subscriberRecord.subscriberId,
              source,
            },
            $addToSet: { tags: { $each: tags } },
          },
          { upsert: true, new: true }
        );
      } catch (dbErr: any) {
        console.warn('Subscriber saved to live memory store:', dbErr.message);
      }

      return NextResponse.json({
        success: true,
        message: 'Subscriber added to Osieka Resort email list.',
        subscriber: savedSub,
      });
    }

    // Default: Contact Form Message submission
    const firstName = (body.firstName || '').trim();
    const lastName = (body.lastName || '').trim();
    const fullName =
      (body.fullName || `${firstName} ${lastName}`).trim() || 'Website Visitor';
    const email = (body.email || '').trim();
    const phone = (body.phone || body.guestPhone || '').trim();
    const subject = (body.subject || 'Website Contact Inquiry').trim();
    const messageText = (body.message || body.specialNotes || '').trim();
    const source = body.source || 'CONTACT_FORM';

    if (!phone && !email) {
      return NextResponse.json(
        { success: false, error: 'Please provide a phone number or email address.' },
        { status: 400 }
      );
    }

    if (!messageText) {
      return NextResponse.json(
        { success: false, error: 'Please enter a message or inquiry note.' },
        { status: 400 }
      );
    }

    const messageId = `MSG-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newMsg: IContactMessage = {
      messageId,
      firstName: firstName || fullName.split(' ')[0] || 'Guest',
      lastName: lastName || fullName.split(' ').slice(1).join(' ') || '',
      fullName,
      email,
      phone: phone || 'Not provided',
      subject,
      message: messageText,
      status: 'UNREAD',
      followUpChannel: 'NONE',
      source,
      createdAt: nowIso,
    };

    // Add to live in-memory store immediately
    const currentMessages = getMessagesFallbackStore();
    globalThis.__hososContactMessagesStore = [newMsg, ...currentMessages];

    // If email is provided, automatically collect it into the Email List submenu!
    let collectedSubscriber: IEmailSubscriber | null = null;
    if (email) {
      collectedSubscriber = upsertSubscriberInFallbackStore({
        subscriberId: `SUB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        name: fullName,
        email,
        phone,
        source: 'CONTACT_FORM',
        status: 'ACTIVE',
        tags: ['Contact Inquiry', subject],
        subscribedAt: nowIso,
        createdAt: nowIso,
      });
    }

    try {
      await connectToDatabase();
      await ContactMessage.create(newMsg);

      if (email && collectedSubscriber) {
        await EmailSubscriber.findOneAndUpdate(
          { email: { $regex: new RegExp(`^${email}$`, 'i') } },
          {
            $set: {
              name: fullName,
              email,
              ...(phone ? { phone } : {}),
              status: 'ACTIVE',
              subscribedAt: nowIso,
            },
            $setOnInsert: {
              subscriberId: collectedSubscriber.subscriberId,
              source: 'CONTACT_FORM',
            },
            $addToSet: { tags: { $each: ['Contact Inquiry', subject] } },
          },
          { upsert: true, new: true }
        );
      }
    } catch (dbErr: any) {
      console.warn('Contact message saved to live fallback store:', dbErr.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Your message has been delivered to the Osieka Resort Message Board.',
      contactMessage: newMsg,
      subscriber: collectedSubscriber,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit message.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      messageId,
      subscriberId,
      status,
      followUpChannel,
      staffNotes,
      staffName,
    } = body;

    const nowIso = new Date().toISOString();

    if (subscriberId) {
      const subs = getSubscribersFallbackStore();
      const idx = subs.findIndex((s) => s.subscriberId === subscriberId);
      if (idx !== -1 && status) {
        subs[idx] = { ...subs[idx], status };
      }
      try {
        await connectToDatabase();
        await EmailSubscriber.findOneAndUpdate(
          { subscriberId },
          { $set: { ...(status ? { status } : {}) } }
        );
      } catch (_) {}

      return NextResponse.json({
        success: true,
        message: 'Subscriber status updated.',
      });
    }

    if (!messageId) {
      return NextResponse.json(
        { success: false, error: 'messageId or subscriberId is required.' },
        { status: 400 }
      );
    }

    const msgs = getMessagesFallbackStore();
    const idx = msgs.findIndex((m) => m.messageId === messageId);
    let updatedMsg: IContactMessage | null = null;

    if (idx !== -1) {
      const existing = msgs[idx];
      updatedMsg = {
        ...existing,
        status: status || (followUpChannel ? 'FOLLOWED_UP' : existing.status),
        followUpChannel: followUpChannel || existing.followUpChannel,
        followedUpBy: followUpChannel ? staffName || 'Concierge Desk' : existing.followedUpBy,
        followedUpAt: followUpChannel ? nowIso : existing.followedUpAt,
        staffNotes: staffNotes !== undefined ? staffNotes : existing.staffNotes,
      };
      msgs[idx] = updatedMsg;
    }

    try {
      await connectToDatabase();
      const updatePayload: any = {};
      if (status) updatePayload.status = status;
      if (followUpChannel) {
        updatePayload.followUpChannel = followUpChannel;
        updatePayload.status = status || 'FOLLOWED_UP';
        updatePayload.followedUpBy = staffName || 'Concierge Desk';
        updatePayload.followedUpAt = nowIso;
      }
      if (staffNotes !== undefined) updatePayload.staffNotes = staffNotes;

      await ContactMessage.findOneAndUpdate({ messageId }, { $set: updatePayload });
    } catch (_) {}

    return NextResponse.json({
      success: true,
      contactMessage: updatedMsg,
      message: 'Message updated.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update message.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const messageId = searchParams.get('messageId');
    const subscriberId = searchParams.get('subscriberId');
    const permissionGranted = searchParams.get('permissionGranted') === 'true';
    const role = (searchParams.get('role') || '').toUpperCase();

    if (!permissionGranted && role !== 'SUPERADMIN' && role !== 'OWNER') {
      return NextResponse.json(
        {
          success: false,
          error: 'Access Denied: You do not have permission to delete records from the Message Board.',
        },
        { status: 403 }
      );
    }

    if (messageId) {
      const msgs = getMessagesFallbackStore();
      globalThis.__hososContactMessagesStore = msgs.filter((m) => m.messageId !== messageId);
      try {
        await connectToDatabase();
        await ContactMessage.deleteOne({ messageId });
      } catch (_) {}
      return NextResponse.json({ success: true, message: 'Message deleted.' });
    }

    if (subscriberId) {
      const subs = getSubscribersFallbackStore();
      globalThis.__hososEmailSubscribersStore = subs.filter((s) => s.subscriberId !== subscriberId);
      try {
        await connectToDatabase();
        await EmailSubscriber.deleteOne({ subscriberId });
      } catch (_) {}
      return NextResponse.json({ success: true, message: 'Subscriber removed from email list.' });
    }

    return NextResponse.json(
      { success: false, error: 'messageId or subscriberId is required.' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Delete failed.' },
      { status: 500 }
    );
  }
}
