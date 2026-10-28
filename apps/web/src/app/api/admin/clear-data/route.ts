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
    const { confirmationCode, requestedBy, resetType } = body;

    // Strict safety check: confirmation code must be "CLEAR_ALL_DATA" or "PURGE_ALL"
    if (confirmationCode !== 'CLEAR_ALL_DATA' && confirmationCode !== 'PURGE_ALL') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid confirmation code. Please type CLEAR_ALL_DATA to authorize full wipe.',
        },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // 1. Purge operational transactions
    const deletedOrders = await Order.deleteMany({});
    const deletedFolios = await Folio.deleteMany({});
    const deletedSheets = await DailyOperationSheet.deleteMany({});
    const deletedTickets = await MaintenanceTicket.deleteMany({});
    const deletedNightAudits = await NightAuditRecord.deleteMany({});

    // 2. Reset Rooms to pristine clean vacant state with no current guests
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

    // 3. If deep purge requested, clear dynamic menu items and services
    let deletedMenu = { deletedCount: 0 };
    let deletedServices = { deletedCount: 0 };
    if (resetType === 'FULL_FACTORY_RESET') {
      deletedMenu = await DynamicMenuItem.deleteMany({});
      deletedServices = await ServiceItem.deleteMany({});
    }

    // 4. Log the audit event for compliance
    try {
      await AuditLog.create({
        action: 'DATABASE_PURGED',
        category: 'SYSTEM',
        actor: {
          staffId: 'superadmin-master',
          staffName: requestedBy || 'Super Admin',
          role: 'SUPERADMIN',
        },
        headline: 'DATABASE MASTER RESET EXECUTED',
        details: `Deleted ${deletedOrders.deletedCount} orders, ${deletedFolios.deletedCount} folios, ${deletedSheets.deletedCount} daily sheets, ${deletedTickets.deletedCount} maintenance tickets. Reset ${resetRooms.modifiedCount} rooms.`,
        meta: {
          ordersPurged: deletedOrders.deletedCount,
          foliosPurged: deletedFolios.deletedCount,
          sheetsPurged: deletedSheets.deletedCount,
          roomsReset: resetRooms.modifiedCount,
          resetType: resetType || 'OPERATIONAL_TRANSACTIONS',
        },
      });
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: 'All resort operational data points and transaction entries have been completely cleared.',
      summary: {
        ordersPurged: deletedOrders.deletedCount,
        foliosPurged: deletedFolios.deletedCount,
        sheetsPurged: deletedSheets.deletedCount,
        ticketsPurged: deletedTickets.deletedCount,
        nightAuditsPurged: deletedNightAudits.deletedCount,
        roomsReset: resetRooms.modifiedCount,
        menuItemsPurged: deletedMenu.deletedCount,
        servicesPurged: deletedServices.deletedCount,
      },
    });
  } catch (err: any) {
    console.error('Error in /api/admin/clear-data:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to clear data' },
      { status: 500 }
    );
  }
}
