import { DailyOperationSheet } from '@/models/DailyOperationSheet';
import { connectToDatabase } from '@/lib/mongodb';

export interface AccountingPaymentEntry {
  method: 'POS_TERMINAL' | 'BANK_TRANSFER' | 'CASH';
  amount: number;
  reference?: string;
}

/**
 * Automatically updates the accounting section (DailyOperationSheet)
 * with the exact breakdown of Cash, POS, and Bank Transfer collections.
 * Accurately handles single payments and split settlements (e.g. ₦20,000 Transfer + ₦3,000 Cash).
 */
export async function syncPaymentToAccounting(params: {
  channel: 'ROOMS' | 'FB';
  payments: AccountingPaymentEntry[];
  date?: string;
  notes?: string;
}) {
  try {
    await connectToDatabase();
    const targetDate = params.date || new Date().toISOString().split('T')[0];

    // Find today's sheet or the most recent sheet in MongoDB Atlas
    let sheet = await DailyOperationSheet.findOne({ date: targetDate });
    if (!sheet) {
      sheet = await DailyOperationSheet.findOne().sort({ date: -1 });
    }

    if (!sheet) {
      console.warn('[Accounting Sync] No operational sheet found to update.');
      return null;
    }

    let cashDelta = 0;
    let posDelta = 0;
    let transferDelta = 0;

    for (const p of params.payments) {
      const amt = Number(p.amount) || 0;
      if (p.method === 'CASH') {
        cashDelta += amt;
      } else if (p.method === 'POS_TERMINAL') {
        posDelta += amt;
      } else if (p.method === 'BANK_TRANSFER') {
        transferDelta += amt;
      }
    }

    const totalDelta = cashDelta + posDelta + transferDelta;

    // Apply to Accommodation (Rooms) or Food & Beverage channels
    if (params.channel === 'ROOMS') {
      sheet.rooms.roomRevenueCash = Math.max(0, (sheet.rooms.roomRevenueCash || 0) + cashDelta);
      sheet.rooms.roomRevenuePOS = Math.max(0, (sheet.rooms.roomRevenuePOS || 0) + posDelta);
      sheet.rooms.roomRevenueTransfer = Math.max(0, (sheet.rooms.roomRevenueTransfer || 0) + transferDelta);
      sheet.rooms.roomRevenueTotal = Math.max(0, (sheet.rooms.roomRevenueTotal || 0) + totalDelta);
    } else {
      sheet.fbSales.cashReceived = Math.max(0, (sheet.fbSales.cashReceived || 0) + cashDelta);
      sheet.fbSales.posTerminalReceived = Math.max(0, (sheet.fbSales.posTerminalReceived || 0) + posDelta);
      sheet.fbSales.bankTransferReceived = Math.max(0, (sheet.fbSales.bankTransferReceived || 0) + transferDelta);
      sheet.fbSales.totalSalesAmount = Math.max(0, (sheet.fbSales.totalSalesAmount || 0) + totalDelta);
    }

    // Automatically recalculate Expected Physical Cash in Hand
    const totalCashCollected = (sheet.rooms.roomRevenueCash || 0) + (sheet.fbSales.cashReceived || 0);
    const pettyExpenses = sheet.energyExpenses?.otherPettyExpenses || [];
    const cashExpenses = pettyExpenses
      .filter((e: any) => e.paidVia === 'CASH')
      .reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);

    const expectedCashOnHand = Math.max(0, totalCashCollected - cashExpenses);
    sheet.reconciliation.expectedCashOnHand = expectedCashOnHand;

    // Keep physical safe handover aligned with expected cash
    const discrepancy = (sheet.reconciliation.cashDiscrepancy || 0);
    if (discrepancy === 0) {
      sheet.reconciliation.totalPhysicalCashHandover = expectedCashOnHand;
    } else {
      sheet.reconciliation.cashDiscrepancy = (sheet.reconciliation.totalPhysicalCashHandover || 0) - expectedCashOnHand;
    }

    await sheet.save();

    console.log(
      `[Accounting Sync Live] Channel: ${params.channel} | +Cash: ₦${cashDelta.toLocaleString()} | +POS: ₦${posDelta.toLocaleString()} | +Transfer: ₦${transferDelta.toLocaleString()} | Total: ₦${totalDelta.toLocaleString()} synced to Sheet #${sheet.sheetId}`
    );

    return sheet;
  } catch (err) {
    console.warn('[Accounting Sync Warning]:', err);
    return null;
  }
}
