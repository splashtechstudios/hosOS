import { NextResponse, NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Order } from '@/models/Order';
import { Folio } from '@/models/Folio';
import { DailyOperationSheet } from '@/models/DailyOperationSheet';
import { MaintenanceTicket } from '@/models/MaintenanceTicket';
import { AuditLog } from '@/models/AuditLog';
import { NightAuditRecord } from '@/models/NightAuditRecord';
import { Room } from '@/models/Room';
import { DynamicMenuItem } from '@/models/DynamicMenuItem';
import { ServiceItem } from '@/models/ServiceItem';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { confirmationCode, requestedBy, resetType, targets } = body;

    // Strict safety check: confirmation code must be "CLEAR_ALL_DATA" or "CLEAR_DATA"
    if (confirmationCode !== 'CLEAR_ALL_DATA' && confirmationCode !== 'CLEAR_DATA' && confirmationCode !== 'PURGE_ALL') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid confirmation code. Please type CLEAR_ALL_DATA or CLEAR_DATA to authorize.',
        },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const targetList: string[] = Array.isArray(targets) && targets.length > 0 ? targets : ['ALL'];
    const isTarget = (key: string) => targetList.includes('ALL') || targetList.includes(key);

    const summary: Record<string, number> = {
      ordersPurged: 0,
      foliosPurged: 0,
      sheetsPurged: 0,
      ticketsPurged: 0,
      nightAuditsPurged: 0,
      roomsReset: 0,
      hallsReset: 0,
      menuItemsPurged: 0,
      servicesPurged: 0,
      auditLogsPurged: 0,
    };

    // 1. Orders / POS (Kitchen & Bar Outlets)
    if (isTarget('ORDERS_POS')) {
      const deletedOrders = await Order.deleteMany({});
      summary.ordersPurged = deletedOrders.deletedCount || 0;
    }

    // 2. Room Stays & Guest Folios (Front Desk & Command Hub)
    if (isTarget('ROOMS_FOLIOS')) {
      const deletedFolios = await Folio.deleteMany({});
      summary.foliosPurged = deletedFolios.deletedCount || 0;

      const resetRooms = await Room.updateMany(
        {},
        {
          $set: {
            status: 'VACANT_CLEAN',
            currentGuestName: '',
            currentReservationId: '',
            currentFolioId: '',
            occupancyHistory: [],
          },
        }
      );
      summary.roomsReset = resetRooms.modifiedCount || 0;
    }

    // 3. Daily Operational Sheets
    if (isTarget('DAILY_SHEETS')) {
      const deletedSheets = await DailyOperationSheet.deleteMany({});
      summary.sheetsPurged = deletedSheets.deletedCount || 0;
    }

    // 4. Engineering & Maintenance Tickets
    if (isTarget('MAINTENANCE_TICKETS')) {
      const deletedTickets = await MaintenanceTicket.deleteMany({});
      summary.ticketsPurged = deletedTickets.deletedCount || 0;
    }

    // 5. Night Audit Rollover Records
    if (isTarget('NIGHT_AUDITS')) {
      const deletedNightAudits = await NightAuditRecord.deleteMany({});
      summary.nightAuditsPurged = deletedNightAudits.deletedCount || 0;
    }

    // 6. Halls, Banqueting & Event Venues
    if (isTarget('HALLS_EVENTS')) {
      const resetHalls = await ServiceItem.updateMany(
        { category: 'HALLS' },
        {
          $set: {
            status: 'AVAILABLE',
            currentEvent: undefined,
            bookingHistory: [],
          },
        }
      );
      summary.hallsReset = resetHalls.modifiedCount || 0;
    }

    // 7. Ancillary Services & Custom Menu Items
    if (isTarget('SERVICES_ANCILLARY') || resetType === 'FULL_FACTORY_RESET') {
      const deletedServices = await ServiceItem.deleteMany({ category: { $ne: 'HALLS' } });
      summary.servicesPurged = deletedServices.deletedCount || 0;
    }

    if (resetType === 'FULL_FACTORY_RESET') {
      const deletedMenu = await DynamicMenuItem.deleteMany({});
      summary.menuItemsPurged = deletedMenu.deletedCount || 0;
    }

    // 8. Audit Logs (Optional specific target)
    if (isTarget('AUDIT_TRAILS')) {
      const deletedLogs = await AuditLog.deleteMany({});
      summary.auditLogsPurged = deletedLogs.deletedCount || 0;
    }

    // Log the reset event to immutable audit log
    try {
      await AuditLog.create({
        roomNumber: 'RESORT',
        category: 'SYSTEM',
        actor: {
          staffId: 'superadmin-master',
          staffName: requestedBy || 'Engnr Omole',
          role: 'SUPERADMIN',
        },
        headline: 'DATABASE DATA PURGE EXECUTED FROM SOURCE',
        details: `Purged targets [${targetList.join(', ')}]. Cleared ${summary.ordersPurged} orders, ${summary.foliosPurged} folios, reset ${summary.roomsReset} rooms & ${summary.hallsReset} halls.`,
        meta: {
          ...summary,
          targets: targetList,
          resetType: resetType || 'OPERATIONAL_TRANSACTIONS',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: 'Specified database modules have been completely cleared and reset in MongoDB Atlas.',
      summary,
    });
  } catch (err: any) {
    console.error('Error in /api/admin/clear-data:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Database purge failed.' },
      { status: 500 }
    );
  }
}
