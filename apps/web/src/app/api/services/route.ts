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
    duration: 'Full Day (8am - 6pm)',
    capacity: 600,
    description: 'Fully air-conditioned luxury banquet hall with stage, lighting and backup sound system.',
    isAvailable: true,
    addedBy: 'Super Admin',
  },
  {
    serviceId: 'hall-02',
    name: 'Royal Diamond Conference Hall',
    group: 'Halls and Events',
    price: 450000,
    duration: 'Full Day (8am - 6pm)',
    capacity: 250,
    description: 'Executive auditorium with high-definition multimedia projection and acoustic treatment.',
    isAvailable: true,
    addedBy: 'Super Admin',
  },
  {
    serviceId: 'hall-03',
    name: 'Executive Boardroom Suite',
    group: 'Halls and Events',
    price: 150000,
    duration: 'Half Day (4 hrs)',
    capacity: 30,
    description: 'U-shaped executive boardroom with 4K smart conferencing screen and beverage station.',
    isAvailable: true,
    addedBy: 'Super Admin',
  },
  {
    serviceId: 'hall-04',
    name: 'Green Meadow Event Garden',
    group: 'Halls and Events',
    price: 500000,
    duration: 'Full Day (8am - 10pm)',
    capacity: 800,
    description: 'Scenic outdoor landscape lawn ideal for corporate banquets, weddings, and grand receptions.',
    isAvailable: true,
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
    isAvailable: true,
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
    isAvailable: true,
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
    isAvailable: true,
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
    isAvailable: true,
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

    // Collect all unique groups
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
      })),
      groups: Array.from(new Set([...CANONICAL_GROUPS, 'Laundry & Ancillary Services'])),
      error: err.message,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, group, price, duration, capacity, description, addedBy } = body;

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
        headline: `New Service Created: ${name}`,
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
    const { serviceId, name, group, price, duration, capacity, description, isAvailable, updatedBy } = body;

    if (!serviceId) {
      return NextResponse.json(
        { success: false, error: 'serviceId is required for update.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const updateFields: any = {};
    if (name !== undefined) updateFields.name = name.trim();
    if (group !== undefined) updateFields.group = group.trim();
    if (price !== undefined) updateFields.price = Number(price);
    if (duration !== undefined) updateFields.duration = duration.trim();
    if (capacity !== undefined) updateFields.capacity = Number(capacity);
    if (description !== undefined) updateFields.description = description.trim();
    if (isAvailable !== undefined) updateFields.isAvailable = Boolean(isAvailable);

    const updated = await ServiceItem.findOneAndUpdate(
      { serviceId },
      { $set: updateFields },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: `Service item ${serviceId} not found.` },
        { status: 404 }
      );
    }

    try {
      await AuditLog.create({
        roomNumber: 'RESORT',
        category: 'SERVICE',
        actor: {
          staffId: 'superadmin-01',
          staffName: updatedBy || 'Super Admin',
          role: 'SUPERADMIN',
        },
        headline: `Service Updated: ${updated.name}`,
        details: `Updated parameters: ${Object.keys(updateFields).join(', ')}`,
        meta: { serviceId, updateFields },
        timestamp: new Date().toISOString(),
      });
    } catch (_) {}

    return NextResponse.json({
      success: true,
      service: {
        id: updated.serviceId,
        serviceId: updated.serviceId,
        name: updated.name,
        group: updated.group,
        price: updated.price,
        duration: updated.duration,
        capacity: updated.capacity,
        description: updated.description,
        isAvailable: updated.isAvailable,
        addedBy: updated.addedBy,
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
