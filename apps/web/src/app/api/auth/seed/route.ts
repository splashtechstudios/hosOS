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

    // 1. Purge obsolete demo users from mmenkopalmhotel.com
    await User.deleteMany({
      $or: [
        { email: { $regex: /mmenkopalmhotel\.com$/i } },
        { email: { $in: [
          'accountant@mmenkopalmhotel.com',
          'manager@mmenkopalmhotel.com',
          'andrew.frontdesk@mmenkopalmhotel.com',
          'joy.frontdesk@mmenkopalmhotel.com',
          'admin@mmenkopalmhotel.com',
          'owner@mmenkopalmhotel.com'
        ] } }
      ]
    });

    // 2. Seed Staff Users with Hashed Passwords
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

    // 3. Seed Rooms (Clean Point Zero Baseline)
    let seededRoomsCount = 0;
    for (const r of INITIAL_ROOMS) {
      const existingRoom = await Room.findOne({ roomNumber: r.roomNumber });
      if (!existingRoom) {
        await Room.create({
          roomNumber: r.roomNumber,
          roomTypeName: r.roomTypeName,
          floor: r.floor,
          rackRatePerNight: r.rackRatePerNight,
          status: 'VACANT_CLEAN',
          currentGuestName: undefined,
          currentFolioId: undefined,
          lastCleanedAt: new Date().toISOString(),
          lastCleanedByStaffName: 'Housekeeping Lead',
          amenities: ['100% Off-Grid Solar Power', 'Solar Inverter AC', 'Smart TV', 'Balcony', 'En-suite Shower'],
        });
        seededRoomsCount++;
      } else {
        // Reset room to clean baseline
        existingRoom.status = 'VACANT_CLEAN';
        existingRoom.currentGuestName = undefined;
        existingRoom.currentFolioId = undefined;
        existingRoom.currentReservationId = undefined;
        await existingRoom.save();
      }
    }

    // 4. Clean baseline for folios and logs (Start from Point Zero)
    await Folio.deleteMany({ roomNumber: '204' });
    await AuditLog.deleteMany({ roomNumber: '204' });

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
