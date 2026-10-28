import { NextResponse, NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ServiceItem, IServiceItem } from '@/models/ServiceItem';
import { AuditLog } from '@/models/AuditLog';

export const dynamic = 'force-dynamic';

const INITIAL_SERVICES: Array<Partial<IServiceItem>> = [
  {
    serviceId: 'hall-01',
    name: 'Osieka Grand Ballroom',
    group: 'Halls and Events',
    price: 750000,
    duration: 'Full Day (8:00 AM - 06:00 PM)',
    capacity: 600,
    description: 'Fully air-conditioned luxury banquet hall with stage, intelligent lighting and dual backup sound system.',
    status: 'AVAILABLE',
    isAvailable: true,
    amenities: [
      'Chilled Central Air Conditioning',
      'Acoustic Sound Treatment',
      'Stage & Ambient Mood Lighting',
      '100% Off-Grid Solar & BESS Power',
      'VIP Dressing Suites',
      'Banquet Tables & Chiavari Chairs',
    ],
    addedBy: 'Super Admin',
  },
  {
    serviceId: 'hall-02',
    name: 'Royal Diamond Conference Hall',
    group: 'Halls and Events',
    price: 450000,
    duration: 'Full Day (8:00 AM - 06:00 PM)',
    capacity: 250,
    description: 'Executive auditorium with high-definition multimedia laser projection and acoustic wall panels.',
    status: 'AVAILABLE',
    isAvailable: true,
    amenities: [
      'Dual 4K Laser Projectors',
      'Wireless Lapel & Podium Mics',
      'High-Speed Dedicated Wi-Fi',
      'Executive Auditorium Seating',
      'Climate Control AC',
    ],
    addedBy: 'Super Admin',
  },
  {
    serviceId: 'hall-03',
    name: 'Executive Boardroom Suite',
    group: 'Halls and Events',
    price: 150000,
    duration: 'Half Day (4 hrs)',
    capacity: 30,
    description: 'U-shaped executive boardroom with 85" 4K smart conferencing screen and dedicated beverage station.',
    status: 'AVAILABLE',
    isAvailable: true,
    amenities: [
      '85" 4K Smart Video Screen',
      'Polycom Video Conferencing',
      'Executive Leather Ergonomic Chairs',
      'Dedicated Refreshment Station',
      'High-Speed Wi-Fi',
    ],
    addedBy: 'Super Admin',
  },
  {
    serviceId: 'hall-04',
    name: 'Green Meadow Event Garden',
    group: 'Halls and Events',
    price: 500000,
    duration: 'Full Day (8:00 AM - 10:00 PM)',
    capacity: 800,
    description: 'Scenic outdoor landscape lawn ideal for corporate banquets, weddings, and grand evening receptions.',
    status: 'AVAILABLE',
    isAvailable: true,
    amenities: [
      'Manicured Bermuda Lawn',
      'Canopy Gazebo & Staging',
      'Scenic Landscape Lighting',
      'Private Restroom Trailer Access',
      'Outdoor Sound Rig Ready',
    ],
    addedBy: 'Super Admin',
  },
  {
    serviceId: 'anc-01',
    name: 'Suit & Agbada Steam Dry-Clean',
    group: 'Laundry & Ancillary Services',
    price: 5000,
    duration: 'Same Day (6 hrs)',
    capacity: 0,
    description: 'Professional delicate steam dry-cleaning, crisp pressing and protective garment bagging.',
    status: 'AVAILABLE',
    isAvailable: true,
    amenities: ['Steam Sanitization', 'Crisp Starching', 'Protective Hanger Bag'],
    addedBy: 'Super Admin',
  },
  {
    serviceId: 'anc-02',
    name: 'Standard Wash & Iron (Per Piece)',
    group: 'Laundry & Ancillary Services',
    price: 1500,
    duration: '24 Hours',
    capacity: 0,
    description: 'Gentle laundering and crisp pressing for shirts, trousers, and gowns.',
    status: 'AVAILABLE',
    isAvailable: true,
    amenities: ['Color Safe Detergents', 'Steam Pressing'],
    addedBy: 'Super Admin',
  },
  {
    serviceId: 'anc-03',
    name: 'VIP Executive Airport Chauffeur Transfer',
    group: 'Laundry & Ancillary Services',
    price: 45000,
    duration: 'One Way',
    capacity: 4,
    description: 'Air-conditioned luxury SUV transfer to/from nearest airport with dedicated driver.',
    status: 'AVAILABLE',
    isAvailable: true,
    amenities: ['Chilled Bottled Water', 'Fibre 5G Hotspot In-Car', 'Air Conditioning'],
    addedBy: 'Super Admin',
  },
  {
    serviceId: 'anc-04',
    name: 'Full Body Swedish Massage & Wellness',
    group: 'Laundry & Ancillary Services',
    price: 25000,
    duration: '60 Mins',
    capacity: 1,
    description: 'Therapeutic muscle relaxation session by licensed resort wellness masseuse.',
    status: 'AVAILABLE',
    isAvailable: true,
    amenities: ['Aromatherapy Oils', 'Private Spa Suite', 'Hot Stone Option'],
    addedBy: 'Super Admin',
  },
];

const CANONICAL_GROUPS = ['Rooms', 'Kitchen', 'Drinks', 'Halls and Events'];

export async function GET() {
  try {
    await connectToDatabase();

    const count = await ServiceItem.countDocuments();
    if (count === 0) {
      for (const item of INITIAL_SERVICES) {
        await ServiceItem.create(item);
      }
    }

    const services = await ServiceItem.find().sort({ group: 1, name: 1 });

    const distinctGroups = Array.from(
      new Set([...CANONICAL_GROUPS, ...services.map((s) => s.group)])
    );

    return NextResponse.json({
      success: true,
      services: services.map((s) => ({
        id: s.serviceId,
        serviceId: s.serviceId,
        name: s.name,
        group: s.group,
        price: s.price,
        duration: s.duration,
        capacity: s.capacity || 0,
        description: s.description || '',
        status: s.status || 'AVAILABLE',
        amenities: s.amenities || [],
        currentEvent: s.currentEvent || null,
        bookingHistory: s.bookingHistory || [],
        isAvailable: s.isAvailable,
        addedBy: s.addedBy,
        createdAt: s.createdAt,
      })),
      groups: distinctGroups,
    });
  } catch (err: any) {
    console.error('Error in GET /api/services:', err);
    return NextResponse.json({
      success: false,
      services: INITIAL_SERVICES.map((s) => ({
        ...s,
        id: s.serviceId,
        status: s.status || 'AVAILABLE',
        amenities: s.amenities || [],
        currentEvent: null,
        bookingHistory: [],
      })),
      groups: Array.from(new Set([...CANONICAL_GROUPS, 'Laundry & Ancillary Services'])),
      error: err.message,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, group, price, duration, capacity, description, amenities, addedBy } = body;

    if (!name || !group || price === undefined || !duration) {
      return NextResponse.json(
        { success: false, error: 'Name, group, price, and duration are required.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const serviceId = `svc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newService = await ServiceItem.create({
      serviceId,
      name: name.trim(),
      group: group.trim(),
      price: Number(price),
      duration: duration.trim(),
      capacity: capacity ? Number(capacity) : 0,
      description: description ? description.trim() : '',
      status: 'AVAILABLE',
      amenities: Array.isArray(amenities) ? amenities : [],
      isAvailable: true,
      addedBy: addedBy || 'Super Admin',
    });

    try {
      await AuditLog.create({
        roomNumber: 'RESORT',
        category: 'SERVICE',
        actor: {
          staffId: 'superadmin-01',
          staffName: addedBy || 'Super Admin',
          role: 'SUPERADMIN',
        },
        headline: `New Venue/Service Created: ${name}`,
        details: `Created in group [${group}] at ₦${Number(price).toLocaleString()} (${duration})`,
        meta: { serviceId, price, duration, group },
        timestamp: new Date().toISOString(),
      });
    } catch (_) {}

    return NextResponse.json({
      success: true,
      service: {
        id: newService.serviceId,
        serviceId: newService.serviceId,
        name: newService.name,
        group: newService.group,
        price: newService.price,
        duration: newService.duration,
        capacity: newService.capacity,
        description: newService.description,
        status: newService.status,
        amenities: newService.amenities,
        isAvailable: newService.isAvailable,
        addedBy: newService.addedBy,
      },
    });
  } catch (err: any) {
    console.error('Error in POST /api/services:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      serviceId,
      action,
      name,
      group,
      price,
      duration,
      capacity,
      description,
      status,
      amenities,
      currentEvent,
      isAvailable,
      updatedBy,
    } = body;

    if (!serviceId) {
      return NextResponse.json(
        { success: false, error: 'serviceId is required for update.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existing = await ServiceItem.findOne({ serviceId });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: `Service item ${serviceId} not found.` },
        { status: 404 }
      );
    }

    // Handle high-level booking actions like Room Check-In / Check-Out
    if (action === 'BOOK_HALL') {
      existing.status = 'RESERVED';
      existing.currentEvent = currentEvent;
    } else if (action === 'START_EVENT') {
      existing.status = 'EVENT_IN_PROGRESS';
      if (existing.currentEvent) {
        existing.currentEvent.status = 'IN_PROGRESS';
      }
    } else if (action === 'CONCLUDE_EVENT') {
      existing.status = 'CLEANING_TURNAROUND';
      if (existing.currentEvent) {
        if (!existing.bookingHistory) existing.bookingHistory = [];
        existing.bookingHistory.push({
          bookingId: existing.currentEvent.bookingId,
          eventName: existing.currentEvent.eventName,
          clientName: existing.currentEvent.clientName,
          date: existing.currentEvent.date,
          totalAmount: existing.currentEvent.totalAmount,
          status: 'COMPLETED',
        });
        existing.currentEvent = undefined;
      }
    } else if (action === 'MARK_CLEAN') {
      existing.status = 'AVAILABLE';
    } else {
      // General field update
      if (name !== undefined) existing.name = name.trim();
      if (group !== undefined) existing.group = group.trim();
      if (price !== undefined) existing.price = Number(price);
      if (duration !== undefined) existing.duration = duration.trim();
      if (capacity !== undefined) existing.capacity = Number(capacity);
      if (description !== undefined) existing.description = description.trim();
      if (status !== undefined) existing.status = status;
      if (amenities !== undefined && Array.isArray(amenities)) existing.amenities = amenities;
      if (currentEvent !== undefined) existing.currentEvent = currentEvent;
      if (isAvailable !== undefined) existing.isAvailable = Boolean(isAvailable);
    }

    await existing.save();

    try {
      await AuditLog.create({
        roomNumber: 'RESORT',
        category: 'SERVICE',
        actor: {
          staffId: 'staff-action',
          staffName: updatedBy || 'Staff User',
          role: 'FRONT_DESK',
        },
        headline: `Hall/Venue Updated: ${existing.name} (${action || 'SETTINGS_UPDATED'})`,
        details: `Venue status is now ${existing.status}. Current event: ${existing.currentEvent?.eventName || 'None'}.`,
        meta: { serviceId, status: existing.status, action },
        timestamp: new Date().toISOString(),
      });
    } catch (_) {}

    return NextResponse.json({
      success: true,
      service: {
        id: existing.serviceId,
        serviceId: existing.serviceId,
        name: existing.name,
        group: existing.group,
        price: existing.price,
        duration: existing.duration,
        capacity: existing.capacity,
        description: existing.description,
        status: existing.status,
        amenities: existing.amenities,
        currentEvent: existing.currentEvent,
        bookingHistory: existing.bookingHistory,
        isAvailable: existing.isAvailable,
        addedBy: existing.addedBy,
      },
    });
  } catch (err: any) {
    console.error('Error in PATCH /api/services:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const serviceId = searchParams.get('serviceId');

    if (!serviceId) {
      return NextResponse.json(
        { success: false, error: 'serviceId is required.' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const deleted = await ServiceItem.findOneAndDelete({ serviceId });

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: `Service item ${serviceId} not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Service item ${serviceId} deleted.`,
    });
  } catch (err: any) {
    console.error('Error in DELETE /api/services:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
