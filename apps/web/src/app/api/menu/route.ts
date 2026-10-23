import { NextResponse, NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { AuditLog } from '@/models/AuditLog';

export const dynamic = 'force-dynamic';

import { DynamicMenuItem, IDynamicMenuItem } from '@/models/DynamicMenuItem';

// Initial dynamic menu items for Osieka Resort (market pricing & daily specials)
// Authentic Osieka Resort dynamic menu catalog (No fixed prices - market catch, daily specials & benchmarks)
const INITIAL_DYNAMIC_MENU: IDynamicMenuItem[] = [
  // 1. Swallow
  {
    itemId: 'swallow-1',
    name: 'Eba (Garri portion)',
    category: 'Swallow',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 1200,
    priceFloor: 800,
    dailyPriceSnapshot: 1200,
    description: 'Fresh steaming hot garri swallow portion made to order.',
    addedBy: 'Babajide Ogundimu (Manager)',
    isAvailable: true,
  },
  {
    itemId: 'swallow-2',
    name: 'Semovita',
    category: 'Swallow',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 1500,
    priceFloor: 1000,
    dailyPriceSnapshot: 1500,
    description: 'Smooth, finely milled wheat semolina swallow portion.',
    addedBy: 'Babajide Ogundimu (Manager)',
    isAvailable: true,
  },
  {
    itemId: 'swallow-3',
    name: 'Fufu',
    category: 'Swallow',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 1200,
    priceFloor: 800,
    dailyPriceSnapshot: 1200,
    description: 'Traditional fermented cassava fufu wrap portion.',
    addedBy: 'Babajide Ogundimu (Manager)',
    isAvailable: true,
  },
  {
    itemId: 'swallow-4',
    name: 'Pounded Yam',
    category: 'Swallow',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 2000,
    priceFloor: 1200,
    dailyPriceSnapshot: 2000,
    description: 'Freshly pounded yam portion, smooth and elastic texture.',
    addedBy: 'Babajide Ogundimu (Manager)',
    isAvailable: true,
  },

  // 2. Soups
  {
    itemId: 'soup-1',
    name: 'Egusi Soup',
    category: 'Soups',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 3500,
    priceFloor: 2500,
    dailyPriceSnapshot: 3500,
    description: 'Ground melon seeds simmered with stockfish, dried fish, and garden greens.',
    addedBy: 'Babajide Ogundimu (Manager)',
    isAvailable: true,
  },
  {
    itemId: 'soup-2',
    name: 'Ogbono Soup',
    category: 'Soups',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 3500,
    priceFloor: 2500,
    dailyPriceSnapshot: 3500,
    description: 'Traditional wild mango seed draw soup slow cooked with crayfish and spices.',
    addedBy: 'Babajide Ogundimu (Manager)',
    isAvailable: true,
  },
  {
    itemId: 'soup-3',
    name: 'Vegetable Soup (Efo Riro - on special order)',
    category: 'Soups',
    pricingType: 'DAILY_SPECIAL',
    suggestedPrice: 4500,
    priceFloor: 3200,
    dailyPriceSnapshot: 4500,
    description: 'Rich spinach vegetable pot simmered with locust beans (iru) on special chef order.',
    addedBy: 'Babajide Ogundimu (Manager)',
    isAvailable: true,
  },
  {
    itemId: 'soup-4',
    name: 'Beans Soup (Gbegiri - on special order)',
    category: 'Soups',
    pricingType: 'DAILY_SPECIAL',
    suggestedPrice: 4000,
    priceFloor: 2800,
    dailyPriceSnapshot: 4000,
    description: 'Silky peeled black-eyed beans soup slow simmered on special order.',
    addedBy: 'Babajide Ogundimu (Manager)',
    isAvailable: true,
  },
  {
    itemId: 'soup-5',
    name: 'Groundnut Soup (on special order)',
    category: 'Soups',
    pricingType: 'DAILY_SPECIAL',
    suggestedPrice: 4500,
    priceFloor: 3200,
    dailyPriceSnapshot: 4500,
    description: 'Savory roasted peanut stew infused with local herbs and spices on special order.',
    addedBy: 'Babajide Ogundimu (Manager)',
    isAvailable: true,
  },

  // 3. Rice Meals
  {
    itemId: 'rice-1',
    name: 'White Rice & Stew or Vegetable',
    category: 'Rice Meals',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 3500,
    priceFloor: 2500,
    dailyPriceSnapshot: 3500,
    description: 'Steamed fragrant white rice served with savory red tomato stew or vegetable sauce.',
    addedBy: 'Babajide Ogundimu (Manager)',
    isAvailable: true,
  },
  {
    itemId: 'rice-2',
    name: 'Jollof Rice (Party Style)',
    category: 'Rice Meals',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 4000,
    priceFloor: 2800,
    dailyPriceSnapshot: 4000,
    description: 'Smoky firewood-aroma Nigerian jollof rice in rich bell pepper tomato reduction.',
    addedBy: 'Babajide Ogundimu (Manager)',
    isAvailable: true,
  },
  {
    itemId: 'rice-3',
    name: 'Asun Rice (on special order)',
    category: 'Rice Meals',
    pricingType: 'DAILY_SPECIAL',
    suggestedPrice: 6500,
    priceFloor: 4800,
    dailyPriceSnapshot: 6500,
    description: 'Spicy wok-tossed jollof rice infused with tender roasted peppered goat meat on special order.',
    addedBy: 'Babajide Ogundimu (Manager)',
    isAvailable: true,
  },

  // 4. Proteins
  {
    itemId: 'protein-1',
    name: 'Beef (Braised & Stewed Portion)',
    category: 'Proteins',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 2500,
    priceFloor: 1800,
    dailyPriceSnapshot: 2500,
    description: 'Tender braised beef portion simmered in seasoned pepper reduction.',
    addedBy: 'Babajide Ogundimu (Manager)',
    isAvailable: true,
  },
  {
    itemId: 'protein-2',
    name: 'Goat Meat (Peppered / Stewed Cut)',
    category: 'Proteins',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 3500,
    priceFloor: 2500,
    dailyPriceSnapshot: 3500,
    description: 'Succulent goat meat cut slow-cooked in aromatic local herbs.',
    addedBy: 'Babajide Ogundimu (Manager)',
    isAvailable: true,
  },
  {
    itemId: 'protein-3',
    name: 'Chicken (Crispy Fried / Stewed Quarter)',
    category: 'Proteins',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 3500,
    priceFloor: 2500,
    dailyPriceSnapshot: 3500,
    description: 'Quarter chicken portion seasoned and fried golden or stewed.',
    addedBy: 'Babajide Ogundimu (Manager)',
    isAvailable: true,
  },
  {
    itemId: 'protein-4',
    name: 'Fish (Fresh Catch / Grilled or Stewed Portion)',
    category: 'Proteins',
    pricingType: 'OPEN_MARKET_PRICE',
    suggestedPrice: 5500,
    priceFloor: 3800,
    dailyPriceSnapshot: 5500,
    description: 'Fresh local fish portion priced by weight and daily morning catch.',
    addedBy: 'Babajide Ogundimu (Manager)',
    isAvailable: true,
  },

  // 5. Pasta Menu
  {
    itemId: 'pasta-1',
    name: 'White Spaghetti & Savory Stew',
    category: 'Pasta Menu',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 3500,
    priceFloor: 2500,
    dailyPriceSnapshot: 3500,
    description: 'Al dente spaghetti accompanied by seasoned red pepper tomato sauce.',
    addedBy: 'Babajide Ogundimu (Manager)',
    isAvailable: true,
  },
  {
    itemId: 'pasta-2',
    name: 'Veggies Jollof Spaghetti',
    category: 'Pasta Menu',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 4000,
    priceFloor: 2800,
    dailyPriceSnapshot: 4000,
    description: 'Spaghetti simmered in jollof sauce tossed with sweet corn, carrots, and peas.',
    addedBy: 'Babajide Ogundimu (Manager)',
    isAvailable: true,
  },
  {
    itemId: 'pasta-3',
    name: 'White Macaroni & Savory Stew',
    category: 'Pasta Menu',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 3500,
    priceFloor: 2500,
    dailyPriceSnapshot: 3500,
    description: 'Elbow macaroni served with rich pepper stew sauce.',
    addedBy: 'Babajide Ogundimu (Manager)',
    isAvailable: true,
  },
  {
    itemId: 'pasta-4',
    name: 'Eggs / Veggies Jollof Macaroni (on special order)',
    category: 'Pasta Menu',
    pricingType: 'DAILY_SPECIAL',
    suggestedPrice: 4500,
    priceFloor: 3200,
    dailyPriceSnapshot: 4500,
    description: 'Jollof macaroni stir-fried with farm fresh eggs and crisp veggies on special order.',
    addedBy: 'Babajide Ogundimu (Manager)',
    isAvailable: true,
  },

  // 6. Coastal & Bar Specialties
  {
    itemId: 'dyn-1',
    name: 'Catch of the Day: Whole Grilled Croaker (by size/kg)',
    category: 'Kitchen',
    pricingType: 'OPEN_MARKET_PRICE',
    suggestedPrice: 16500,
    priceFloor: 12000,
    dailyPriceSnapshot: 16500,
    description: 'Fresh Atlantic catch seasoned with Osieka spice blend and grilled plantain chips.',
    addedBy: 'Babajide Ogundimu (Manager)',
    isAvailable: true,
  },
  {
    itemId: 'dyn-2',
    name: 'Live Catfish Pepper Soup Pot (Point & Kill)',
    category: 'Soups',
    pricingType: 'OPEN_MARKET_PRICE',
    suggestedPrice: 9500,
    priceFloor: 7500,
    dailyPriceSnapshot: 9500,
    description: 'Selected live from resort pond, simmered with aromatic scent leaves.',
    addedBy: 'Babajide Ogundimu (Manager)',
    isAvailable: true,
  },
  {
    itemId: 'dyn-5',
    name: 'Osieka Signature Chapman Pitcher (Shared Jug)',
    category: 'Bar',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 6500,
    priceFloor: 5000,
    dailyPriceSnapshot: 6500,
    description: 'Signature bitters, cucumber ribbons, and freshly squeezed resort citrus.',
    addedBy: 'Babajide Ogundimu (Manager)',
    isAvailable: true,
  },
  {
    itemId: 'dyn-6',
    name: 'Fresh Palm Wine & Coconut Cocktail Dispenser',
    category: 'Bar',
    pricingType: 'DAILY_SPECIAL',
    suggestedPrice: 4500,
    priceFloor: 3500,
    dailyPriceSnapshot: 4500,
    description: 'Tapped daily from local palms, chilled and served inside carved fresh coconuts.',
    addedBy: 'Babajide Ogundimu (Manager)',
    isAvailable: true,
  },
];

export async function GET() {
  try {
    await connectToDatabase();
    
    // Auto-upsert any missing items from INITIAL_DYNAMIC_MENU
    for (const item of INITIAL_DYNAMIC_MENU) {
      const exists = await DynamicMenuItem.findOne({ itemId: item.itemId });
      if (!exists) {
        await DynamicMenuItem.create(item);
      }
    }

    const items = await DynamicMenuItem.find().sort({ category: 1, name: 1 });

    return NextResponse.json({
      success: true,
      items: items.map((it) => ({
        id: it.itemId,
        name: it.name,
        category: it.category,
        pricingType: it.pricingType,
        suggestedPrice: it.suggestedPrice,
        priceFloor: it.priceFloor,
        dailyPriceSnapshot: it.dailyPriceSnapshot,
        description: it.description,
        addedBy: it.addedBy,
        isAvailable: it.isAvailable,
      })),
    });
  } catch (err: any) {
    console.error('Error fetching menu items:', err);
    return NextResponse.json({ success: false, items: INITIAL_DYNAMIC_MENU, error: err.message }, { status: 500 });
  }
}

// Manager adds new dynamic menu item
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const { name, category, pricingType, suggestedPrice, priceFloor, description, addedBy } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: 'Item name is required' }, { status: 400 });
    }

    const itemId = `dyn-${Date.now()}`;
    const newItem = await DynamicMenuItem.create({
      itemId,
      name,
      category: category || 'Kitchen',
      pricingType: pricingType || 'OPEN_MARKET_PRICE',
      suggestedPrice: Number(suggestedPrice || 0),
      priceFloor: Number(priceFloor || 0),
      dailyPriceSnapshot: Number(suggestedPrice || 0),
      description: description || '',
      addedBy: addedBy || 'Resort Manager',
      isAvailable: true,
    });

    // Audit log
    await AuditLog.create({
      roomNumber: 'KITCHEN-BAR',
      category: 'ORDER',
      headline: `New Dynamic Menu Item Added: ${name}`,
      details: `${addedBy || 'Manager'} added dynamic dish "${name}" (${pricingType || 'OPEN_MARKET_PRICE'}). Benchmark: ₦${Number(suggestedPrice || 0).toLocaleString()}, Floor: ₦${Number(priceFloor || 0).toLocaleString()}`,
      actor: {
        staffId: 'staff-manager',
        staffName: addedBy || 'Manager',
        role: 'MANAGER',
      },
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      item: newItem,
      message: `Menu item "${name}" successfully added to Osieka Resort catalog.`,
    });
  } catch (err: any) {
    console.error('Error creating menu item:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// Superadmin / Accountant adjusts price floor or Manager sets today's price
export async function PATCH(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { itemId, dailyPriceSnapshot, priceFloor, isAvailable, updaterRole, updaterName } = body;

    const item = await DynamicMenuItem.findOne({ itemId });
    if (!item) {
      return NextResponse.json({ success: false, error: 'Menu item not found' }, { status: 404 });
    }

    // Only Admin/Accountant can modify the price floor
    if (priceFloor !== undefined) {
      if (updaterRole !== 'SUPERADMIN' && updaterRole !== 'OWNER' && updaterRole !== 'ACCOUNTANT') {
        return NextResponse.json(
          { success: false, error: 'Only Super Admin or Accountant can fix or adjust minimum price floors.' },
          { status: 403 }
        );
      }
      item.priceFloor = Number(priceFloor);
    }

    if (dailyPriceSnapshot !== undefined) {
      item.dailyPriceSnapshot = Number(dailyPriceSnapshot);
    }

    if (isAvailable !== undefined) {
      item.isAvailable = Boolean(isAvailable);
    }

    await item.save();

    return NextResponse.json({
      success: true,
      item,
      message: `Menu item "${item.name}" updated successfully.`,
    });
  } catch (err: any) {
    console.error('Error updating menu item:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
