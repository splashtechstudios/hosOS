import { NextResponse, NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { InventoryItem } from '@/models/InventoryItem';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    const items = await InventoryItem.find().sort({ category: 1, name: 1 });
    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    console.warn('MongoDB query failed in /api/inventory, returning fallback items:', error.message);
    const defaultInventory = [
      { sku: 'RAW-MEAT-01', name: 'Fresh Goat Meat (Chevon)', category: 'FOOD_KITCHEN', unit: 'kg', quantityOnHand: 45, minThreshold: 15, unitCost: 4500 },
      { sku: 'RAW-FISH-02', name: 'Fresh Farm Catfish', category: 'FOOD_KITCHEN', unit: 'kg', quantityOnHand: 60, minThreshold: 20, unitCost: 3200 },
      { sku: 'BEV-LIQ-01', name: 'Hennessy VSOP (70cl)', category: 'BEVERAGE_BAR', unit: 'bottles', quantityOnHand: 24, minThreshold: 8, unitCost: 65000 },
      { sku: 'BEV-LIQ-02', name: 'Johnnie Walker Black Label', category: 'BEVERAGE_BAR', unit: 'bottles', quantityOnHand: 30, minThreshold: 10, unitCost: 38000 },
      { sku: 'FAC-DSL-01', name: 'Automotive Gas Oil (Diesel)', category: 'FACILITIES_FUEL', unit: 'litres', quantityOnHand: 4200, minThreshold: 1500, unitCost: 1350 },
      { sku: 'HSK-LIN-01', name: 'King Size Egyptian Cotton Sheet', category: 'HOUSEKEEPING_LINEN', unit: 'sets', quantityOnHand: 80, minThreshold: 25, unitCost: 18500 },
    ];
    return NextResponse.json({ success: true, fallback: true, items: defaultInventory });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectToDatabase();
    const { sku, deltaQuantity, newQuantity, unitCost, notes } = await req.json();

    if (!sku) {
      return NextResponse.json({ success: false, error: 'SKU is required' }, { status: 400 });
    }

    const item = await InventoryItem.findOne({ sku });
    if (!item) {
      return NextResponse.json({ success: false, error: 'Inventory item not found' }, { status: 404 });
    }

    if (deltaQuantity !== undefined) {
      item.quantityOnHand += Number(deltaQuantity);
    } else if (newQuantity !== undefined) {
      item.quantityOnHand = Number(newQuantity);
    }

    if (unitCost !== undefined) {
      item.unitCost = Number(unitCost);
    }

    item.lastRestockedAt = new Date().toISOString();
    await item.save();

    return NextResponse.json({
      success: true,
      message: `Stock updated for ${item.name}. New On-Hand: ${item.quantityOnHand} ${item.unit}.`,
      item,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
