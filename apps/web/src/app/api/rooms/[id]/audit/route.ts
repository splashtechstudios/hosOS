import { NextResponse, NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { AuditLog } from '@/models/AuditLog';

export const dynamic = 'force-dynamic';
import { Folio } from '@/models/Folio';
import { Room } from '@/models/Room';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const roomIdentifier = params?.id || '204';
  try {
    await connectToDatabase();

    // Fetch immutable audit logs for this room
    const logs = await AuditLog.find({ roomNumber: roomIdentifier })
      .sort({ timestamp: -1 })
      .limit(100);

    // Calculate real-time consumption stats directly from audit logs
    const consumptionMap = new Map<string, {
      id: string;
      itemName: string;
      category: string;
      totalQuantity: number;
      unitPriceCharged: number;
      totalSpent: number;
      lastOrderedAt: string;
      orderedByStaff: string;
    }>();

    for (const log of logs) {
      if (log.category === 'ORDER' || log.category === 'ORDER_INCREMENT') {
        const itemName = log.meta?.itemName || (log.headline.includes('x') ? log.headline.split('x ')[1] : 'F&B Item');
        const quantity = Number(log.meta?.quantity) || 1;
        const unitPrice = Number(log.meta?.priceSnapshot) || (log.amount ? log.amount / quantity : 0);
        const amount = Number(log.amount) || quantity * unitPrice;

        if (consumptionMap.has(itemName)) {
          const item = consumptionMap.get(itemName)!;
          item.totalQuantity += quantity;
          item.totalSpent += amount;
          if (new Date(log.timestamp) > new Date(item.lastOrderedAt)) {
            item.lastOrderedAt = log.timestamp;
            item.orderedByStaff = `${log.actor.staffName} (${log.actor.role})`;
          }
        } else {
          consumptionMap.set(itemName, {
            id: `item-${itemName.replace(/\s+/g, '-').toLowerCase()}`,
            itemName,
            category: log.meta?.category || 'KITCHEN_FOOD',
            totalQuantity: quantity,
            unitPriceCharged: unitPrice,
            totalSpent: amount,
            lastOrderedAt: log.timestamp,
            orderedByStaff: `${log.actor.staffName} (${log.actor.role})`,
          });
        }
      }
    }

    // Format logs into timeline items
    const timeline = logs.map((l) => ({
      id: String(l._id),
      timestamp: l.timestamp,
      category: l.category,
      headline: l.headline,
      details: l.details,
      amount: l.amount,
      actor: {
        staffId: l.actor.staffId,
        staffName: l.actor.staffName,
        role: l.actor.role as any,
      },
      meta: l.meta,
    }));

    return NextResponse.json({
      success: true,
      roomNumber: roomIdentifier,
      timeline,
      consumptionStats: Array.from(consumptionMap.values()),
    });
  } catch (error: any) {
    console.warn('MongoDB query failed in /api/rooms/[id]/audit, falling back to local audit registry:', error.message);
    const { ROOM_204_TIMELINE, ROOM_204_CONSUMPTION_STATS } = await import('@/lib/mockData');
    return NextResponse.json({
      success: true,
      fallback: true,
      roomNumber: roomIdentifier,
      timeline: ROOM_204_TIMELINE,
      consumptionStats: ROOM_204_CONSUMPTION_STATS,
    });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const roomNumber = params.id;
    const body = await req.json();
    const { category, headline, details, amount, actor, meta } = body;

    if (!category || !headline || !details || !actor) {
      return NextResponse.json(
        { success: false, error: 'category, headline, details, and actor are required' },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();

    const auditLog = await AuditLog.create({
      roomNumber,
      category,
      headline,
      details,
      amount: Number(amount) || 0,
      actor: {
        staffId: actor.staffId || 'staff-unassigned',
        staffName: actor.staffName || 'System User',
        role: actor.role || 'FRONT_DESK',
      },
      meta,
      timestamp,
    });

    return NextResponse.json({
      success: true,
      message: 'Audit log appended successfully to immutable ledger.',
      auditLog,
    });
  } catch (error: any) {
    console.error('Error appending audit log:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
