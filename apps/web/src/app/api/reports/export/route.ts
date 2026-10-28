import { NextResponse, NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { AuditLog } from '@/models/AuditLog';
import { Order } from '@/models/Order';
import { Folio } from '@/models/Folio';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reportType = searchParams.get('type') || 'TAX_SCHEDULE';

    if (reportType === 'TAX_SCHEDULE') {
      const csvHeader = 'Invoice/Folio,Date,Customer/Guest,Category,Gross Amount (NGN),FIRS VAT (7.5%),State Consumption Tax (5%),Net Amount (NGN)\n';
      const sampleRows = [
        'FOL-2026-201,2026-10-15,Chief Adeyemi Thomas,Deluxe Ocean View (Night 2),95000,7125,4750,83125',
        'FOL-2026-204,2026-10-15,Chief Emeka Nwosu,Deluxe Ocean View (Night 2),95000,7125,4750,83125',
        'ORD-882910,2026-10-15,Room 204 Guest,Main Restaurant Food & Beverage,32500,2438,1625,28437',
        'ORD-882918,2026-10-15,Table 04 Walk-in,Main Bar Hennessy VSOP & Chapman,75000,5625,3750,65625',
        'FOL-2026-301,2026-10-15,Senator Bello Yakubu,Presidential Penthouse Suite,250000,18750,12500,218750',
      ];
      const csvContent = csvHeader + sampleRows.join('\n');

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="Osieka_Resort_FIRS_Tax_Schedule_2026_10.csv"',
        },
      });
    }

    if (reportType === 'TRIAL_BALANCE') {
      const csvHeader = 'Business Date,Account Code,Account Name,Debit (NGN),Credit (NGN),Ledger Status\n';
      const sampleRows = [
        '2026-10-15,1010,Main Cash Drawer Vault,480000,0,BALANCED',
        '2026-10-15,1020,Moniepoint POS Settlement,1250000,0,BALANCED',
        '2026-10-15,1030,Providus Bank Virtual Account Transfers,890000,0,BALANCED',
        '2026-10-15,4010,Rooms Division Rack Revenue,0,1850000,BALANCED',
        '2026-10-15,4020,F&B Restaurant & Room Service Sales,0,450000,BALANCED',
        '2026-10-15,4030,Main Bar Beverage Sales,0,320000,BALANCED',
        '2026-10-15,2010,FIRS Value Added Tax Output (7.5%),0,196500,BALANCED',
        '2026-10-15,2020,State Hospitality Consumption Tax (5%),0,131000,BALANCED',
      ];
      const csvContent = csvHeader + sampleRows.join('\n');

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="Osieka_Resort_Night_Audit_Trial_Balance_2026_10_15.csv"',
        },
      });
    }

    // Default: Internal Room Audit Ledger
    const csvHeader = 'Timestamp,Room,Category,Headline,Amount (NGN),Staff Name,Role,Details\n';
    const sampleRows = [
      '2026-10-15T14:10:00Z,204,OCCUPANCY,Guest Check-In & Room Occupancy Activated,150000,Mary Okon,FRONT_DESK,Checked in Chief Emeka Nwosu',
      '2026-10-15T15:30:00Z,204,ORDER_INCREMENT,Order Increment Logged (+1x Spicy Goat Meat),7500,Chidi Obi,WAITER,Guest requested extra portion',
      '2026-10-15T17:45:00Z,204,MAINTENANCE,Maintenance Ticket Raised (#MNT-109),4500,Engr. Tunde Bakare,MAINTENANCE,Balcony sliding glass door lock',
      '2026-10-15T19:00:00Z,204,PAYMENT,Payment Received (Cash Settlement),30000,Fatima Sanusi,CASHIER,Cash advance deposit',
    ];
    const csvContent = csvHeader + sampleRows.join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="Osieka_Resort_Room_Audit_Ledger.csv"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
