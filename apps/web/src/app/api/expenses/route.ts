import { NextResponse, NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { DailyOperationSheet } from '@/models/DailyOperationSheet';
import { AuditLog } from '@/models/AuditLog';

export const dynamic = 'force-dynamic';

function getTodayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || getTodayIso();

    await connectToDatabase();
    const sheet = await DailyOperationSheet.findOne({ date });

    return NextResponse.json({
      success: true,
      date,
      energyExpenses: sheet?.energyExpenses || {
        generatorRunHours: 0,
        dieselLitresPurchased: 0,
        dieselPricePerLitre: 1250,
        totalDieselCost: 0,
        otherPettyExpenses: [],
        totalExpenses: 0,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, type, staffId, staffName, role, pettyExpense, dieselExpense } = body;

    if (!date) {
      return NextResponse.json({ success: false, error: 'Date is required.' }, { status: 400 });
    }

    await connectToDatabase();

    let sheet = await DailyOperationSheet.findOne({ date });
    if (!sheet) {
      sheet = new DailyOperationSheet({
        date,
        managerId: staffId || 'staff-manager',
        managerName: staffName || 'Operations Manager',
        status: 'DRAFT',
        shiftType: 'FULL_DAY',
        openingTime: `${date}T08:00:00Z`,
        rooms: {
          totalRooms: 15,
          occupiedCount: 0,
          roomRevenueTotal: 0,
        },
        fbSales: {
          foodSalesAmount: 0,
          drinksSalesAmount: 0,
        },
        energyExpenses: {
          generatorRunHours: 0,
          dieselLitresPurchased: 0,
          dieselPricePerLitre: 1250,
          totalDieselCost: 0,
          otherPettyExpenses: [],
          totalExpenses: 0,
        },
      });
    }

    if (!sheet.energyExpenses) {
      sheet.energyExpenses = {
        generatorRunHours: 0,
        dieselLitresPurchased: 0,
        dieselPricePerLitre: 1250,
        totalDieselCost: 0,
        otherPettyExpenses: [],
        totalExpenses: 0,
      };
    }

    if (!sheet.energyExpenses.otherPettyExpenses) {
      sheet.energyExpenses.otherPettyExpenses = [];
    }

    if (type === 'PETTY_CASH' && pettyExpense) {
      sheet.energyExpenses.otherPettyExpenses.push({
        id: `petty-${Date.now()}`,
        description: pettyExpense.description,
        amount: Number(pettyExpense.amount),
        category: pettyExpense.paymentSource || 'CASH',
        approvedBy: pettyExpense.approvedBy || staffName,
      });
    } else if (type === 'DIESEL_FUEL' && dieselExpense) {
      sheet.energyExpenses.dieselLitresPurchased =
        (sheet.energyExpenses.dieselLitresPurchased || 0) + Number(dieselExpense.litresPurchased || 0);
      sheet.energyExpenses.dieselPricePerLitre = Number(dieselExpense.pricePerLitre || 1250);
      sheet.energyExpenses.totalDieselCost =
        (sheet.energyExpenses.totalDieselCost || 0) + Number(dieselExpense.totalCost || 0);
      if (dieselExpense.generatorHoursRun) {
        sheet.energyExpenses.generatorRunHours =
          (sheet.energyExpenses.generatorRunHours || 0) + Number(dieselExpense.generatorHoursRun);
      }
    }

    const pettyTotal = sheet.energyExpenses.otherPettyExpenses.reduce((sum: number, item: any) => sum + (Number(item.amount) || 0), 0);
    sheet.energyExpenses.totalExpenses = (sheet.energyExpenses.totalDieselCost || 0) + pettyTotal;

    await sheet.save();

    // Audit log
    await AuditLog.create({
      roomNumber: 'GENERAL_EXPENSE',
      category: 'AUDIT',
      headline: type === 'PETTY_CASH' ? `Petty Cash Outlay Recorded (₦${pettyExpense?.amount})` : `Generator Fuel Outlay Recorded (₦${dieselExpense?.totalCost})`,
      details: type === 'PETTY_CASH'
        ? `${staffName} logged petty cash expense: ${pettyExpense?.description} for ₦${Number(pettyExpense?.amount).toLocaleString()}`
        : `${staffName} logged ${dieselExpense?.litresPurchased}L fuel purchase for ₦${Number(dieselExpense?.totalCost).toLocaleString()}`,
      amount: type === 'PETTY_CASH' ? Number(pettyExpense?.amount) : Number(dieselExpense?.totalCost),
      actor: {
        staffId: staffId || 'staff-system',
        staffName: staffName || 'Manager',
        role: role || 'MANAGER',
      },
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Expense successfully recorded into Daily Operation Sheet.',
      sheet,
    });
  } catch (err: any) {
    console.error('Error saving expense:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
