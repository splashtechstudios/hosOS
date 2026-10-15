import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { Room } from '@/models/Room';
import { Folio } from '@/models/Folio';
import { AuditLog } from '@/models/AuditLog';
import { InventoryItem, IInventoryItem } from '@/models/InventoryItem';
import { SEEDED_ACCOUNTS } from '@/lib/seededAccounts';
import { INITIAL_ROOMS, ROOM_204_TIMELINE } from '@/lib/mockData';
import { hashPassword } from '@/lib/auth';

export async function POST() {
  try {
    await connectToDatabase();

    // 1. Seed Staff Users with Hashed Passwords
    const seededStaff = [];
    for (const acc of SEEDED_ACCOUNTS) {
      const hashedPassword = await hashPassword(acc.password);
      const existing = await User.findOne({ email: acc.email });
      if (!existing) {
        const created = await User.create({
          ...acc,
          password: hashedPassword,
          isActive: true,
          createdAt: new Date(),
        });
        seededStaff.push(created);
      } else {
        await User.updateOne(
          { email: acc.email },
          { $set: { ...acc, password: hashedPassword } }
        );
        seededStaff.push(existing);
      }
    }

    // 2. Seed Rooms
    let seededRoomsCount = 0;
    for (const r of INITIAL_ROOMS) {
      const existingRoom = await Room.findOne({ roomNumber: r.roomNumber });
      if (!existingRoom) {
        await Room.create({
          roomNumber: r.roomNumber,
          roomTypeName: r.roomTypeName,
          floor: r.floor,
          rackRatePerNight: r.rackRatePerNight,
          status: r.status,
          currentGuestName: r.currentGuestName,
          currentFolioId: r.currentFolioId,
          lastCleanedAt: r.lastCleanedAt,
          lastCleanedByStaffName: r.lastCleanedByStaffName,
          amenities: ['Air Conditioning', 'High Speed Wi-Fi', 'Smart TV', 'Balcony', 'En-suite Jacuzzi'],
        });
        seededRoomsCount++;
      }
    }

    // 3. Seed Guest Folio for Room 204
    const existingFolio = await Folio.findOne({ roomNumber: '204', status: 'OPEN' });
    if (!existingFolio) {
      await Folio.create({
        folioNumber: 'FOL-2026-204',
        roomNumber: '204',
        guestName: 'Chief Emeka Nwosu',
        guestPhone: '+234 803 555 0192',
        status: 'OPEN',
        checkInDate: '2026-10-14T14:30:00Z',
        checkOutDate: '2026-10-18T11:00:00Z',
        charges: [
          {
            id: 'chg-1',
            category: 'ROOM_RATE',
            description: 'Room Charge - Deluxe Ocean View Suite (Night 1)',
            amount: 95000,
            postedAt: '2026-10-14T23:59:00Z',
            postedByStaffName: 'Night Auditor',
          },
          {
            id: 'chg-2',
            category: 'F_AND_B',
            description: 'Main Restaurant - Spicy Goat Meat Pepper Soup & Hennessy VSOP',
            amount: 72500,
            postedAt: '2026-10-15T13:20:00Z',
            postedByStaffName: 'Chidi Obi (WAITER)',
          },
        ],
        payments: [
          {
            id: 'pay-1',
            method: 'BANK_TRANSFER',
            amount: 150000,
            reference: 'GTB-TRF-9028110',
            receivedAt: '2026-10-14T14:35:00Z',
            receivedByStaffName: 'Mary Okon (FRONT_DESK)',
          },
        ],
        totalCharges: 167500,
        totalPayments: 150000,
        balance: 17500,
      });
    }

    // 4. Seed Audit Logs for Room 204
    const existingLogs = await AuditLog.countDocuments({ roomNumber: '204' });
    if (existingLogs === 0) {
      for (const item of ROOM_204_TIMELINE) {
        await AuditLog.create({
          roomNumber: '204',
          category: item.category,
          headline: item.headline,
          details: item.details,
          amount: item.amount || 0,
          actor: {
            staffId: item.actor.staffId,
            staffName: item.actor.staffName,
            role: item.actor.role,
          },
          meta: item.meta,
          timestamp: item.timestamp,
        });
      }
    }

    // 5. Seed Inventory Items
    const initialInventory: IInventoryItem[] = [
      { sku: 'RAW-MEAT-01', name: 'Fresh Goat Meat (Chevon)', category: 'FOOD_KITCHEN', unit: 'kg', quantityOnHand: 45, minThreshold: 15, unitCost: 4500 },
      { sku: 'RAW-FISH-02', name: 'Fresh Farm Catfish', category: 'FOOD_KITCHEN', unit: 'kg', quantityOnHand: 60, minThreshold: 20, unitCost: 3200 },
      { sku: 'BEV-LIQ-01', name: 'Hennessy VSOP (70cl)', category: 'BEVERAGE_BAR', unit: 'bottles', quantityOnHand: 24, minThreshold: 8, unitCost: 65000 },
      { sku: 'BEV-LIQ-02', name: 'Johnnie Walker Black Label', category: 'BEVERAGE_BAR', unit: 'bottles', quantityOnHand: 30, minThreshold: 10, unitCost: 38000 },
      { sku: 'FAC-DSL-01', name: 'Automotive Gas Oil (Diesel)', category: 'FACILITIES_FUEL', unit: 'litres', quantityOnHand: 4200, minThreshold: 1500, unitCost: 1350 },
      { sku: 'HSK-LIN-01', name: 'King Size Egyptian Cotton Sheet', category: 'HOUSEKEEPING_LINEN', unit: 'sets', quantityOnHand: 80, minThreshold: 25, unitCost: 18500 },
    ];

    for (const inv of initialInventory) {
      const exists = await InventoryItem.findOne({ sku: inv.sku });
      if (!exists) {
        await InventoryItem.create(inv);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'MongoDB Atlas successfully seeded with enterprise roles, rooms, folios, inventory, and immutable audit logs!',
      users: seededStaff.map((u) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        department: u.department,
        pinCode: u.pinCode,
      })),
    });
  } catch (error: any) {
    console.error('Seed API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
