import { NextResponse, NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { DailyOperationSheet } from '@/models/DailyOperationSheet';
import { AuditLog } from '@/models/AuditLog';

export const dynamic = 'force-dynamic';

// Seed demo sheets if collection is empty (Resort operates 100% off-grid solar: 0 generator hours & N0 diesel by default)
const INITIAL_DEMO_SHEETS = [
  {
    sheetId: 'SHEET-2026-10-23',
    date: '2026-10-23',
    resortProperty: 'Osieka Luxury Resort',
    managerId: 'staff-02',
    managerName: 'Babajide Ogundimu',
    rooms: {
      occupiedCount: 22,
      vacantCleanCount: 34,
      vacantDirtyCount: 3,
      outOfOrderCount: 1,
      totalRooms: 60,
      roomRevenueCash: 350000,
      roomRevenuePOS: 980000,
      roomRevenueTransfer: 420000,
      roomRevenueTotal: 1750000,
    },
    fbSales: {
      foodSalesAmount: 385000,
      drinksSalesAmount: 265000,
      totalSalesAmount: 650000,
      cashReceived: 120000,
      posTerminalReceived: 390000,
      bankTransferReceived: 140000,
    },
    energyExpenses: {
      generatorRunHours: 0,
      dieselLitresPurchased: 0,
      dieselPricePerLitre: 0,
      totalDieselCost: 0,
      otherPettyExpenses: [
        { id: 'exp-1', title: 'Market Food Stuffs & Fresh Fish', amount: 45000, paidVia: 'CASH', receiptAttached: true },
        { id: 'exp-2', title: 'Cooking Gas Refill 50kg', amount: 48000, paidVia: 'TRANSFER', receiptAttached: true },
        { id: 'exp-3', title: 'Housekeeping Laundry Detergents', amount: 15000, paidVia: 'CASH', receiptAttached: true },
      ],
      totalExpenses: 108000,
    },
    reconciliation: {
      totalPhysicalCashHandover: 410000,
      expectedCashOnHand: 410000, // (350k room + 120k fb) - 60k cash expenses = 410k
      cashDiscrepancy: 0,
      receiptPhotoUrls: ['/receipts/pos_eod_20261023.png'],
      bankAlertNotes: 'GTBank & Zenith POS settlements verified in terminal batch report.',
      managerNotes: 'Resort operated 100% off-grid solar microgrid smoothly (120 kWp PV + 360 kWh BESS). Zero generator fuel burn.',
    },
    audit: {
      status: 'SUBMITTED',
      auditedBy: undefined,
      auditedAt: undefined,
      auditNotes: 'Pending daily reconciliation by Kelechi (Accountant).',
      varianceAmount: 0,
      discrepanciesFound: [],
    },
    submittedAt: '2026-10-23T16:00:00Z',
  },
  {
    sheetId: 'SHEET-2026-10-22',
    date: '2026-10-22',
    resortProperty: 'Osieka Luxury Resort',
    managerId: 'staff-02',
    managerName: 'Babajide Ogundimu',
    rooms: {
      occupiedCount: 19,
      vacantCleanCount: 38,
      vacantDirtyCount: 2,
      outOfOrderCount: 1,
      totalRooms: 60,
      roomRevenueCash: 280000,
      roomRevenuePOS: 840000,
      roomRevenueTransfer: 350000,
      roomRevenueTotal: 1470000,
    },
    fbSales: {
      foodSalesAmount: 290000,
      drinksSalesAmount: 210000,
      totalSalesAmount: 500000,
      cashReceived: 90000,
      posTerminalReceived: 310000,
      bankTransferReceived: 100000,
    },
    energyExpenses: {
      generatorRunHours: 0,
      dieselLitresPurchased: 0,
      dieselPricePerLitre: 0,
      totalDieselCost: 0,
      otherPettyExpenses: [
        { id: 'exp-4', title: 'Bar Ice Blocks Purchase', amount: 12000, paidVia: 'CASH', receiptAttached: true },
        { id: 'exp-5', title: 'Plumbing fittings for Room 104', amount: 18000, paidVia: 'CASH', receiptAttached: true },
      ],
      totalExpenses: 30000,
    },
    reconciliation: {
      totalPhysicalCashHandover: 340000,
      expectedCashOnHand: 340000,
      cashDiscrepancy: 0,
      receiptPhotoUrls: ['/receipts/pos_eod_20261022.png'],
      bankAlertNotes: 'All Moniepoint POS card payments reconciled with bank credit.',
      managerNotes: '100% pure solar operation. Zero diesel generator burn.',
    },
    audit: {
      status: 'AUDITED_VERIFIED',
      auditedBy: 'Kelechi Amadi (Accountant)',
      auditedAt: '2026-10-23T08:30:00Z',
      auditNotes: 'All cash in envelope tallied exactly (₦340,000). POS settlements verified on Stanbic portal. Zero discrepancies.',
      varianceAmount: 0,
      discrepanciesFound: [],
    },
    submittedAt: '2026-10-22T21:15:00Z',
  },
];

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    let sheets = await DailyOperationSheet.find().sort({ date: -1 }).limit(30);

    if (!sheets || sheets.length === 0) {
      for (const item of INITIAL_DEMO_SHEETS) {
        await DailyOperationSheet.create(item as any);
      }
      sheets = await DailyOperationSheet.find().sort({ date: -1 }).limit(30);
    } else {
      // If demo sheets were seeded with old 8.5 generator hours, reset them to 100% off-grid solar zero generator
      for (const s of sheets) {
        if (s.sheetId === 'SHEET-2026-10-23' && s.energyExpenses?.generatorRunHours === 8.5) {
          s.energyExpenses.generatorRunHours = 0;
          s.energyExpenses.dieselLitresPurchased = 0;
          s.energyExpenses.dieselPricePerLitre = 0;
          s.energyExpenses.totalDieselCost = 0;
          s.energyExpenses.totalExpenses = 108000;
          await s.save();
        }
      }
    }

    if (!sheets || sheets.length === 0) {
      for (const item of INITIAL_DEMO_SHEETS) {
        await DailyOperationSheet.create(item as any);
      }
      sheets = await DailyOperationSheet.find().sort({ date: -1 }).limit(30);
    }

    return NextResponse.json({
      success: true,
      sheets: sheets.map((s) => ({
        id: String(s._id),
        sheetId: s.sheetId,
        date: s.date,
        resortProperty: s.resortProperty,
        managerId: s.managerId,
        managerName: s.managerName,
        rooms: s.rooms,
        fbSales: s.fbSales,
        energyExpenses: s.energyExpenses,
        reconciliation: s.reconciliation,
        audit: s.audit,
        submittedAt: s.submittedAt,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      })),
    });
  } catch (err: any) {
    console.error('Error fetching operational sheets:', err);
    return NextResponse.json({ success: false, error: err.message, sheets: INITIAL_DEMO_SHEETS }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const date = body.date || new Date().toISOString().split('T')[0];
    const sheetId = body.sheetId || `SHEET-${date}`;

    // Auto-calculate totals
    const roomRevenueTotal =
      Number(body.rooms?.roomRevenueCash || 0) +
      Number(body.rooms?.roomRevenuePOS || 0) +
      Number(body.rooms?.roomRevenueTransfer || 0);

    const foodSales = Number(body.fbSales?.foodSalesAmount || 0);
    const drinksSales = Number(body.fbSales?.drinksSalesAmount || 0);
    const fbTotal = foodSales + drinksSales;

    const dieselHours = Number(body.energyExpenses?.generatorRunHours || 0);
    const dieselLitres = Number(body.energyExpenses?.dieselLitresPurchased || 0);
    const dieselPrice = Number(body.energyExpenses?.dieselPricePerLitre || 1250);
    const totalDieselCost = dieselLitres * dieselPrice;

    const pettyExpenses = body.energyExpenses?.otherPettyExpenses || [];
    const pettyTotal = pettyExpenses.reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);
    const totalExpenses = totalDieselCost + pettyTotal;

    const cashExpensesPaid = pettyExpenses
      .filter((e: any) => e.paidVia === 'CASH')
      .reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);

    const totalCashCollected = Number(body.rooms?.roomRevenueCash || 0) + Number(body.fbSales?.cashReceived || 0);
    const expectedCashOnHand = Math.max(0, totalCashCollected - cashExpensesPaid);
    const physicalCash = Number(body.reconciliation?.totalPhysicalCashHandover || 0);
    const cashDiscrepancy = physicalCash - expectedCashOnHand;

    const sheetData = {
      sheetId,
      date,
      resortProperty: 'Osieka Luxury Resort',
      managerId: body.managerId || 'staff-02',
      managerName: body.managerName || 'Babajide Ogundimu',
      rooms: {
        occupiedCount: Number(body.rooms?.occupiedCount || 0),
        vacantCleanCount: Number(body.rooms?.vacantCleanCount || 0),
        vacantDirtyCount: Number(body.rooms?.vacantDirtyCount || 0),
        outOfOrderCount: Number(body.rooms?.outOfOrderCount || 0),
        totalRooms: Number(body.rooms?.totalRooms || 60),
        roomRevenueCash: Number(body.rooms?.roomRevenueCash || 0),
        roomRevenuePOS: Number(body.rooms?.roomRevenuePOS || 0),
        roomRevenueTransfer: Number(body.rooms?.roomRevenueTransfer || 0),
        roomRevenueTotal,
      },
      fbSales: {
        foodSalesAmount: foodSales,
        drinksSalesAmount: drinksSales,
        totalSalesAmount: fbTotal,
        cashReceived: Number(body.fbSales?.cashReceived || 0),
        posTerminalReceived: Number(body.fbSales?.posTerminalReceived || 0),
        bankTransferReceived: Number(body.fbSales?.bankTransferReceived || 0),
      },
      energyExpenses: {
        generatorRunHours: dieselHours,
        dieselLitresPurchased: dieselLitres,
        dieselPricePerLitre: dieselPrice,
        totalDieselCost,
        otherPettyExpenses: pettyExpenses,
        totalExpenses,
      },
      reconciliation: {
        totalPhysicalCashHandover: physicalCash,
        expectedCashOnHand,
        cashDiscrepancy,
        receiptPhotoUrls: body.reconciliation?.receiptPhotoUrls || [],
        bankAlertNotes: body.reconciliation?.bankAlertNotes || '',
        managerNotes: body.reconciliation?.managerNotes || '',
      },
      audit: {
        status: body.audit?.status || 'SUBMITTED',
        auditedBy: body.audit?.auditedBy,
        auditedAt: body.audit?.auditedAt,
        auditNotes: body.audit?.auditNotes || 'Submitted by manager. Awaiting audit signoff.',
        varianceAmount: Math.abs(cashDiscrepancy),
        discrepanciesFound: cashDiscrepancy !== 0 ? [`Cash Handover variance: ₦${cashDiscrepancy.toLocaleString()}`] : [],
      },
      submittedAt: new Date().toISOString(),
    };

    const updated = await DailyOperationSheet.findOneAndUpdate(
      { date },
      { $set: sheetData },
      { upsert: true, new: true }
    );

    // Record audit log
    await AuditLog.create({
      roomNumber: 'RESORT-HQ',
      category: 'SYSTEM',
      headline: `Daily Operations Sheet Submitted for ${date}`,
      details: `Manager ${sheetData.managerName} submitted Osieka Resort daily operational sheet for ${date}. Total Inflow: ₦${(roomRevenueTotal + fbTotal).toLocaleString()}, Total Outflow: ₦${totalExpenses.toLocaleString()}`,
      amount: roomRevenueTotal + fbTotal,
      actor: {
        staffId: sheetData.managerId,
        staffName: sheetData.managerName,
        role: 'MANAGER',
      },
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      sheet: updated,
      message: `Daily operational sheet for ${date} successfully submitted to MongoDB Atlas.`,
    });
  } catch (err: any) {
    console.error('Error saving operational sheet:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// Accountant Stamp Action (Read-only verification / audit note, zero data tampering)
export async function PATCH(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { sheetId, status, auditedBy, auditNotes, varianceAmount, discrepanciesFound } = body;

    if (!sheetId) {
      return NextResponse.json({ success: false, error: 'Sheet ID is required.' }, { status: 400 });
    }

    const sheet = await DailyOperationSheet.findOne({ sheetId });
    if (!sheet) {
      return NextResponse.json({ success: false, error: 'Operational sheet not found.' }, { status: 404 });
    }

    // Accountant ONLY stamps the audit fields - manager numbers are preserved!
    sheet.audit = {
      status: status || 'AUDITED_VERIFIED',
      auditedBy: auditedBy || 'Accountant',
      auditedAt: new Date().toISOString(),
      auditNotes: auditNotes || 'Audited and verified against bank statements and physical cash handover.',
      varianceAmount: Number(varianceAmount || 0),
      discrepanciesFound: discrepanciesFound || [],
    };

    await sheet.save();

    // Log the accountant's review
    await AuditLog.create({
      roomNumber: 'ACCOUNTS-AUDIT',
      category: 'SYSTEM',
      headline: `Daily Audit Stamped by ${auditedBy}`,
      details: `Accountant ${auditedBy} audited Daily Sheet #${sheetId}. Status: ${sheet.audit.status}. Notes: "${sheet.audit.auditNotes}"`,
      actor: {
        staffId: 'staff-03',
        staffName: auditedBy || 'Accountant',
        role: 'ACCOUNTANT',
      },
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      sheet,
      message: `Audit stamp successfully applied to sheet #${sheetId}.`,
    });
  } catch (err: any) {
    console.error('Error auditing operational sheet:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// Superadmin / Accountant Authorized Administrative Update
// Enforces that records submitted by manager are immutable by manager
export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { sheetId, modifierRole, modifierName, adjustmentReason, updates } = body;

    const normalizedRole = (modifierRole || '').toUpperCase();
    if (normalizedRole !== 'SUPERADMIN' && normalizedRole !== 'OWNER' && normalizedRole !== 'ACCOUNTANT') {
      return NextResponse.json(
        {
          success: false,
          error:
            'Security Restriction: Records submitted by manager are immutable by manager. Only Super Admin or Accountant have authority to update submitted operations logs.',
        },
        { status: 403 }
      );
    }

    if (!sheetId) {
      return NextResponse.json({ success: false, error: 'Sheet ID is required.' }, { status: 400 });
    }

    const sheet = await DailyOperationSheet.findOne({ sheetId });
    if (!sheet) {
      return NextResponse.json({ success: false, error: 'Operational sheet not found.' }, { status: 404 });
    }

    const previousInflow = (sheet.rooms?.roomRevenueTotal || 0) + (sheet.fbSales?.totalSalesAmount || 0);

    // Apply authorized adjustments
    if (updates?.rooms) sheet.rooms = { ...sheet.rooms, ...updates.rooms };
    if (updates?.fbSales) sheet.fbSales = { ...sheet.fbSales, ...updates.fbSales };
    if (updates?.energyExpenses) sheet.energyExpenses = { ...sheet.energyExpenses, ...updates.energyExpenses };
    if (updates?.reconciliation) sheet.reconciliation = { ...sheet.reconciliation, ...updates.reconciliation };

    await sheet.save();

    // Immutable audit log
    await AuditLog.create({
      roomNumber: 'OPERATIONS-OVERRIDE',
      category: 'SYSTEM',
      headline: `Administrative Adjustment to Sheet #${sheetId} by ${modifierName} (${modifierRole})`,
      details: `Justification: "${adjustmentReason || 'Audit correction'}". Previous Inflow: ₦${previousInflow.toLocaleString()} -> Adjusted Inflow: ₦${(
        (sheet.rooms?.roomRevenueTotal || 0) + (sheet.fbSales?.totalSalesAmount || 0)
      ).toLocaleString()}`,
      actor: {
        staffId: 'staff-admin',
        staffName: modifierName || 'Super Admin',
        role: modifierRole || 'SUPERADMIN',
      },
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      sheet,
      message: `Operational sheet #${sheetId} updated by authorized ${modifierRole}. Adjustment recorded to immutable audit log.`,
    });
  } catch (err: any) {
    console.error('Error modifying operational sheet:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// Superadmin Permanent Data Item Deletion
export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const sheetId = searchParams.get('sheetId');
    const role = (searchParams.get('role') || '').toUpperCase();
    const actorName = searchParams.get('actorName') || 'Super Admin';

    if (role !== 'SUPERADMIN' && role !== 'OWNER' && role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Only Superadmin has permission to completely delete operational closing sheets.' },
        { status: 403 }
      );
    }

    if (!sheetId) {
      return NextResponse.json({ success: false, error: 'Sheet ID is required.' }, { status: 400 });
    }

    const deleted = await DailyOperationSheet.findOneAndDelete({ sheetId });
    if (!deleted) {
      return NextResponse.json({ success: false, error: `Daily operational sheet #${sheetId} not found.` }, { status: 404 });
    }

    // Record immutable audit log
    await AuditLog.create({
      roomNumber: 'RESORT-HQ',
      category: 'SYSTEM',
      headline: `Daily Operations Sheet #${sheetId} Deleted by Superadmin`,
      details: `Superadmin ${actorName} permanently purged daily operational closing sheet #${sheetId} for date ${deleted.date}. Total Inflow Purged: ₦${((deleted.rooms?.roomRevenueTotal || 0) + (deleted.fbSales?.totalSalesAmount || 0)).toLocaleString()}`,
      amount: (deleted.rooms?.roomRevenueTotal || 0) + (deleted.fbSales?.totalSalesAmount || 0),
      actor: {
        staffId: 'staff-admin',
        staffName: actorName,
        role: 'SUPERADMIN',
      },
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `Daily operational sheet #${sheetId} has been completely deleted by Superadmin.`,
    });
  } catch (err: any) {
    console.error('Error deleting operational sheet:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
