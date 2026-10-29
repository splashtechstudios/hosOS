import { NextResponse, NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { AuditLog } from '@/models/AuditLog';

export const dynamic = 'force-dynamic';

import { DynamicMenuItem, IDynamicMenuItem } from '@/models/DynamicMenuItem';
import { getItemImageUrl } from '@/lib/menuImages';

// Initial dynamic menu items for Osieka Resort (market pricing & daily specials)
// Authentic Osieka Resort dynamic menu catalog (No fixed prices - market catch, daily specials & benchmarks)
const INITIAL_DYNAMIC_MENU: IDynamicMenuItem[] = [
  // 1. Swallow (No fixed prices - market price, plain names)
  {
    itemId: 'swallow-1',
    name: 'Eba',
    category: 'Swallow',
    pricingType: 'OPEN_MARKET_PRICE',
    suggestedPrice: 0,
    priceFloor: 0,
    dailyPriceSnapshot: 0,
    description: '',
    addedBy: 'Babajide Ogundimu (Manager)',
    isAvailable: true,
  },
  {
    itemId: 'swallow-2',
    name: 'Semovita',
    category: 'Swallow',
    pricingType: 'OPEN_MARKET_PRICE',
    suggestedPrice: 0,
    priceFloor: 0,
    dailyPriceSnapshot: 0,
    description: '',
    addedBy: 'Babajide Ogundimu (Manager)',
    isAvailable: true,
  },
  {
    itemId: 'swallow-3',
    name: 'Fufu',
    category: 'Swallow',
    pricingType: 'OPEN_MARKET_PRICE',
    suggestedPrice: 0,
    priceFloor: 0,
    dailyPriceSnapshot: 0,
    description: '',
    addedBy: 'Babajide Ogundimu (Manager)',
    isAvailable: true,
  },
  {
    itemId: 'swallow-4',
    name: 'Pounded Yam',
    category: 'Swallow',
    pricingType: 'OPEN_MARKET_PRICE',
    suggestedPrice: 0,
    priceFloor: 0,
    dailyPriceSnapshot: 0,
    description: '',
    addedBy: 'Babajide Ogundimu (Manager)',
    isAvailable: true,
  },

  // 2. Soups (No fixed prices, plain user names)
  {
    itemId: 'soup-1',
    name: 'Egusi',
    category: 'Soups',
    pricingType: 'OPEN_MARKET_PRICE',
    suggestedPrice: 0,
    priceFloor: 0,
    dailyPriceSnapshot: 0,
    description: '',
    addedBy: 'Babajide Ogundimu (Manager)',
    isAvailable: true,
  },
  {
    itemId: 'soup-2',
    name: 'Ogbono',
    category: 'Soups',
    pricingType: 'OPEN_MARKET_PRICE',
    suggestedPrice: 0,
    priceFloor: 0,
    dailyPriceSnapshot: 0,
    description: '',
    addedBy: 'Babajide Ogundimu (Manager)',
    isAvailable: true,
  },
  {
    itemId: 'soup-3',
    name: 'Vegetable (on special Order)',
    category: 'Soups',
    pricingType: 'OPEN_MARKET_PRICE',
    suggestedPrice: 0,
    priceFloor: 0,
    dailyPriceSnapshot: 0,
    description: '',
    addedBy: 'Babajide Ogundimu (Manager)',
    isAvailable: true,
  },
  {
    itemId: 'soup-4',
    name: 'Beans Soup (on special Order)',
    category: 'Soups',
    pricingType: 'OPEN_MARKET_PRICE',
    suggestedPrice: 0,
    priceFloor: 0,
    dailyPriceSnapshot: 0,
    description: '',
    addedBy: 'Babajide Ogundimu (Manager)',
    isAvailable: true,
  },
  {
    itemId: 'soup-5',
    name: 'Groundnut Soup (on special Order)',
    category: 'Soups',
    pricingType: 'OPEN_MARKET_PRICE',
    suggestedPrice: 0,
    priceFloor: 0,
    dailyPriceSnapshot: 0,
    description: '',
    addedBy: 'Babajide Ogundimu (Manager)',
    isAvailable: true,
  },
  {
    itemId: 'dyn-2',
    name: 'Catfish Pepper Soup',
    category: 'Soups',
    pricingType: 'OPEN_MARKET_PRICE',
    suggestedPrice: 0,
    priceFloor: 0,
    dailyPriceSnapshot: 0,
    description: '',
    addedBy: 'Babajide Ogundimu (Manager)',
    isAvailable: true,
  },

  // 3. Rice Meals (Strict user menu names)
  {
    itemId: 'rice-1',
    name: 'white rice and stew or vegetable',
    category: 'Rice Meals',
    pricingType: 'OPEN_MARKET_PRICE',
    suggestedPrice: 0,
    priceFloor: 0,
    dailyPriceSnapshot: 0,
    description: '',
    addedBy: 'Babajide Ogundimu (Manager)',
    isAvailable: true,
  },
  {
    itemId: 'rice-2',
    name: 'jollof rice',
    category: 'Rice Meals',
    pricingType: 'OPEN_MARKET_PRICE',
    suggestedPrice: 0,
    priceFloor: 0,
    dailyPriceSnapshot: 0,
    description: '',
    addedBy: 'Babajide Ogundimu (Manager)',
    isAvailable: true,
  },
  {
    itemId: 'rice-3',
    name: 'Asun Rice',
    category: 'Rice Meals',
    pricingType: 'OPEN_MARKET_PRICE',
    suggestedPrice: 0,
    priceFloor: 0,
    dailyPriceSnapshot: 0,
    description: '',
    addedBy: 'Babajide Ogundimu (Manager)',
    isAvailable: true,
  },

  // 4. Proteins (Plain protein name only: Beef, Goat meat, Chicken, Fish)
  {
    itemId: 'protein-1',
    name: 'Beef',
    category: 'Proteins',
    pricingType: 'OPEN_MARKET_PRICE',
    suggestedPrice: 0,
    priceFloor: 0,
    dailyPriceSnapshot: 0,
    description: '',
    addedBy: 'Babajide Ogundimu (Manager)',
    isAvailable: true,
  },
  {
    itemId: 'protein-2',
    name: 'Goat meat',
    category: 'Proteins',
    pricingType: 'OPEN_MARKET_PRICE',
    suggestedPrice: 0,
    priceFloor: 0,
    dailyPriceSnapshot: 0,
    description: '',
    addedBy: 'Babajide Ogundimu (Manager)',
    isAvailable: true,
  },
  {
    itemId: 'protein-3',
    name: 'Chicken',
    category: 'Proteins',
    pricingType: 'OPEN_MARKET_PRICE',
    suggestedPrice: 0,
    priceFloor: 0,
    dailyPriceSnapshot: 0,
    description: '',
    addedBy: 'Babajide Ogundimu (Manager)',
    isAvailable: true,
  },
  {
    itemId: 'protein-4',
    name: 'Fish',
    category: 'Proteins',
    pricingType: 'OPEN_MARKET_PRICE',
    suggestedPrice: 0,
    priceFloor: 0,
    dailyPriceSnapshot: 0,
    description: '',
    addedBy: 'Babajide Ogundimu (Manager)',
    isAvailable: true,
  },

  // 5. Pasta Menu (Strict user menu names)
  {
    itemId: 'pasta-1',
    name: 'white spaghetti and stew',
    category: 'Pasta Menu',
    pricingType: 'OPEN_MARKET_PRICE',
    suggestedPrice: 0,
    priceFloor: 0,
    dailyPriceSnapshot: 0,
    description: '',
    addedBy: 'Babajide Ogundimu (Manager)',
    isAvailable: true,
  },
  {
    itemId: 'pasta-2',
    name: 'Veggies Jollof spaghetti',
    category: 'Pasta Menu',
    pricingType: 'OPEN_MARKET_PRICE',
    suggestedPrice: 0,
    priceFloor: 0,
    dailyPriceSnapshot: 0,
    description: '',
    addedBy: 'Babajide Ogundimu (Manager)',
    isAvailable: true,
  },
  {
    itemId: 'pasta-3',
    name: 'white marcaroni and stew',
    category: 'Pasta Menu',
    pricingType: 'OPEN_MARKET_PRICE',
    suggestedPrice: 0,
    priceFloor: 0,
    dailyPriceSnapshot: 0,
    description: '',
    addedBy: 'Babajide Ogundimu (Manager)',
    isAvailable: true,
  },
  {
    itemId: 'pasta-4',
    name: 'eggs/veggies jollof marcaroni',
    category: 'Pasta Menu',
    pricingType: 'OPEN_MARKET_PRICE',
    suggestedPrice: 0,
    priceFloor: 0,
    dailyPriceSnapshot: 0,
    description: '',
    addedBy: 'Babajide Ogundimu (Manager)',
    isAvailable: true,
  },


  // 7. Official Osieka Resort Bar Menu (Printed Register: No. 3 Resort Close, Aiyeromi Quarters, Ogori)
  {
    itemId: 'bar-1',
    name: '5 Alive',
    category: 'Bar',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 2000,
    priceFloor: 1400,
    dailyPriceSnapshot: 2000,
    description: 'Chilled 5 Alive fruit juice pack.',
    addedBy: 'Osieka Resort Bar Register',
    isAvailable: true,
  },
  {
    itemId: 'bar-2',
    name: 'Exotic',
    category: 'Bar',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 2500,
    priceFloor: 1800,
    dailyPriceSnapshot: 2500,
    description: 'Chivita Exotic sparkling tropical fruit nectar.',
    addedBy: 'Osieka Resort Bar Register',
    isAvailable: true,
  },
  {
    itemId: 'bar-3',
    name: 'Smirnoff Ice',
    category: 'Bar',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 1700,
    priceFloor: 1200,
    dailyPriceSnapshot: 1700,
    description: 'Crisp, refreshing lemon citrus vodka premix.',
    addedBy: 'Osieka Resort Bar Register',
    isAvailable: true,
  },
  {
    itemId: 'bar-4',
    name: 'Maltina',
    category: 'Bar',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 1000,
    priceFloor: 700,
    dailyPriceSnapshot: 1000,
    description: 'Nourishing premium malt drink (glass bottle).',
    addedBy: 'Osieka Resort Bar Register',
    isAvailable: true,
  },
  {
    itemId: 'bar-5',
    name: 'M/Stout (Medium Stout)',
    category: 'Bar',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 1500,
    priceFloor: 1100,
    dailyPriceSnapshot: 1500,
    description: 'Guinness Medium Foreign Extra Stout.',
    addedBy: 'Osieka Resort Bar Register',
    isAvailable: true,
  },
  {
    itemId: 'bar-6',
    name: 'Life',
    category: 'Bar',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 1200,
    priceFloor: 850,
    dailyPriceSnapshot: 1200,
    description: 'Life Continental Lager Beer.',
    addedBy: 'Osieka Resort Bar Register',
    isAvailable: true,
  },
  {
    itemId: 'bar-7',
    name: 'B/Legend',
    category: 'Bar',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 1500,
    priceFloor: 1100,
    dailyPriceSnapshot: 1500,
    description: 'Big Legend Extra Stout bottle.',
    addedBy: 'Osieka Resort Bar Register',
    isAvailable: true,
  },
  {
    itemId: 'bar-8',
    name: 'Goldberg',
    category: 'Bar',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 1300,
    priceFloor: 900,
    dailyPriceSnapshot: 1300,
    description: 'Goldberg Golden Lager Beer.',
    addedBy: 'Osieka Resort Bar Register',
    isAvailable: true,
  },
  {
    itemId: 'bar-9',
    name: '"33"',
    category: 'Bar',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 1300,
    priceFloor: 900,
    dailyPriceSnapshot: 1300,
    description: '"33" Export premium lager beer.',
    addedBy: 'Osieka Resort Bar Register',
    isAvailable: true,
  },
  {
    itemId: 'bar-10',
    name: 'B/Heineken',
    category: 'Bar',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 1500,
    priceFloor: 1100,
    dailyPriceSnapshot: 1500,
    description: 'Big bottle Heineken premium malt lager.',
    addedBy: 'Osieka Resort Bar Register',
    isAvailable: true,
  },
  {
    itemId: 'bar-11',
    name: 'M/Heineken',
    category: 'Bar',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 1300,
    priceFloor: 950,
    dailyPriceSnapshot: 1300,
    description: 'Medium Heineken lager bottle.',
    addedBy: 'Osieka Resort Bar Register',
    isAvailable: true,
  },
  {
    itemId: 'bar-12',
    name: 'Tiger',
    category: 'Bar',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 1200,
    priceFloor: 850,
    dailyPriceSnapshot: 1200,
    description: 'Tiger Crystal cold-filtered Asian lager.',
    addedBy: 'Osieka Resort Bar Register',
    isAvailable: true,
  },
  {
    itemId: 'bar-13',
    name: 'Trophy',
    category: 'Bar',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 1200,
    priceFloor: 850,
    dailyPriceSnapshot: 1200,
    description: 'Trophy Extra Special Lager Beer.',
    addedBy: 'Osieka Resort Bar Register',
    isAvailable: true,
  },
  {
    itemId: 'bar-14',
    name: 'Flying fish',
    category: 'Bar',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 1200,
    priceFloor: 850,
    dailyPriceSnapshot: 1200,
    description: 'Flying Fish pressed lemon flavoured beer.',
    addedBy: 'Osieka Resort Bar Register',
    isAvailable: true,
  },
  {
    itemId: 'bar-15',
    name: 'Guilder',
    category: 'Bar',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 1300,
    priceFloor: 900,
    dailyPriceSnapshot: 1300,
    description: 'Gulder Ultimate extra matured lager beer.',
    addedBy: 'Osieka Resort Bar Register',
    isAvailable: true,
  },
  {
    itemId: 'bar-16',
    name: 'Desperado',
    category: 'Bar',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 1300,
    priceFloor: 950,
    dailyPriceSnapshot: 1300,
    description: 'Desperados tequila flavoured lager with citrus zest.',
    addedBy: 'Osieka Resort Bar Register',
    isAvailable: true,
  },
  {
    itemId: 'bar-17',
    name: 'Staradlar',
    category: 'Bar',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 1000,
    priceFloor: 750,
    dailyPriceSnapshot: 1000,
    description: 'Star Radler citrus infused 2% lager.',
    addedBy: 'Osieka Resort Bar Register',
    isAvailable: true,
  },
  {
    itemId: 'bar-18',
    name: 'Castle life',
    category: 'Bar',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 1500,
    priceFloor: 1100,
    dailyPriceSnapshot: 1500,
    description: 'Castle Lite extra cold brewed lager.',
    addedBy: 'Osieka Resort Bar Register',
    isAvailable: true,
  },
  {
    itemId: 'bar-19',
    name: 'Buduriser',
    category: 'Bar',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 1500,
    priceFloor: 1100,
    dailyPriceSnapshot: 1500,
    description: 'Budweiser king of beers beechwood aged.',
    addedBy: 'Osieka Resort Bar Register',
    isAvailable: true,
  },
  {
    itemId: 'bar-20',
    name: 'Star',
    category: 'Bar',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 1300,
    priceFloor: 900,
    dailyPriceSnapshot: 1300,
    description: 'Star classic cold-filtered lager beer.',
    addedBy: 'Osieka Resort Bar Register',
    isAvailable: true,
  },
  {
    itemId: 'bar-21',
    name: 'M/Legend',
    category: 'Bar',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 1200,
    priceFloor: 850,
    dailyPriceSnapshot: 1200,
    description: 'Legend Extra Stout medium bottle.',
    addedBy: 'Osieka Resort Bar Register',
    isAvailable: true,
  },
  {
    itemId: 'bar-22',
    name: 'B/Goldberg',
    category: 'Bar',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 1200,
    priceFloor: 850,
    dailyPriceSnapshot: 1200,
    description: 'Big Goldberg lager bottle.',
    addedBy: 'Osieka Resort Bar Register',
    isAvailable: true,
  },
  {
    itemId: 'bar-23',
    name: 'B/Stout',
    category: 'Bar',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 2000,
    priceFloor: 1500,
    dailyPriceSnapshot: 2000,
    description: 'Big Guinness Foreign Extra Stout bottle.',
    addedBy: 'Osieka Resort Bar Register',
    isAvailable: true,
  },
  {
    itemId: 'bar-24',
    name: 'Hero',
    category: 'Bar',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 1200,
    priceFloor: 850,
    dailyPriceSnapshot: 1200,
    description: 'Hero premium lager beer.',
    addedBy: 'Osieka Resort Bar Register',
    isAvailable: true,
  },
  {
    itemId: 'bar-25',
    name: 'Coke',
    category: 'Bar',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 800,
    priceFloor: 500,
    dailyPriceSnapshot: 800,
    description: 'Classic Coca-Cola chilled soft drink.',
    addedBy: 'Osieka Resort Bar Register',
    isAvailable: true,
  },
  {
    itemId: 'bar-26',
    name: 'Nutri-milk',
    category: 'Bar',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 1000,
    priceFloor: 700,
    dailyPriceSnapshot: 1000,
    description: 'Nutri-Milk apple flavour dairy drink.',
    addedBy: 'Osieka Resort Bar Register',
    isAvailable: true,
  },
  {
    itemId: 'bar-27',
    name: 'Nutri Yo',
    category: 'Bar',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 1000,
    priceFloor: 700,
    dailyPriceSnapshot: 1000,
    description: '',
    addedBy: 'Osieka Resort Bar Register',
    isAvailable: true,
  },
  {
    itemId: 'bar-28',
    name: 'Predator',
    category: 'Bar',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 1000,
    priceFloor: 700,
    dailyPriceSnapshot: 1000,
    description: 'Predator taurine & caffeine energy boost.',
    addedBy: 'Osieka Resort Bar Register',
    isAvailable: true,
  },
  {
    itemId: 'bar-29',
    name: 'Origin bitters',
    category: 'Bar',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 1500,
    priceFloor: 1100,
    dailyPriceSnapshot: 1500,
    description: 'Orijin herbal bitters spirit drink.',
    addedBy: 'Osieka Resort Bar Register',
    isAvailable: true,
  },
  {
    itemId: 'bar-30',
    name: 'Fayrouz',
    category: 'Bar',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 1000,
    priceFloor: 700,
    dailyPriceSnapshot: 1000,
    description: 'Fayrouz sparkling pear/malt soft drink.',
    addedBy: 'Osieka Resort Bar Register',
    isAvailable: true,
  },
  {
    itemId: 'bar-31',
    name: 'Hollandia yogurt',
    category: 'Bar',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 3000,
    priceFloor: 2200,
    dailyPriceSnapshot: 3000,
    description: 'Hollandia 1 Litre drinking yoghurt pack.',
    addedBy: 'Osieka Resort Bar Register',
    isAvailable: true,
  },
  {
    itemId: 'bar-32',
    name: 'Water',
    category: 'Bar',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 400,
    priceFloor: 250,
    dailyPriceSnapshot: 400,
    description: 'Chilled pure table water 75cl bottle.',
    addedBy: 'Osieka Resort Bar Register',
    isAvailable: true,
  },
  {
    itemId: 'bar-33',
    name: 'Bullet',
    category: 'Bar',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 2000,
    priceFloor: 1400,
    dailyPriceSnapshot: 2000,
    description: 'Bullet high-octane energy booster can.',
    addedBy: 'Osieka Resort Bar Register',
    isAvailable: true,
  },
  {
    itemId: 'bar-34',
    name: 'Climax',
    category: 'Bar',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 1000,
    priceFloor: 700,
    dailyPriceSnapshot: 1000,
    description: 'Climax herbal vitality energy drink.',
    addedBy: 'Osieka Resort Bar Register',
    isAvailable: true,
  },
  {
    itemId: 'bar-35',
    name: 'Can-maltina',
    category: 'Bar',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 1000,
    priceFloor: 700,
    dailyPriceSnapshot: 1000,
    description: 'Maltina in 33cl chilled slim can.',
    addedBy: 'Osieka Resort Bar Register',
    isAvailable: true,
  },
  {
    itemId: 'bar-36',
    name: 'Bigmask',
    category: 'Bar',
    pricingType: 'SUGGESTED_BENCHMARK',
    suggestedPrice: 1500,
    priceFloor: 1000,
    dailyPriceSnapshot: 1500,
    description: 'Bigmask herbal alcoholic beverage bottle.',
    addedBy: 'Osieka Resort Bar Register',
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
    
    const count = await DynamicMenuItem.countDocuments();
    if (count === 0) {
      for (const item of INITIAL_DYNAMIC_MENU) {
        await DynamicMenuItem.create(item);
      }
    } else {
      // Synchronize database: Food items (Swallow, Soups, Rice, Proteins, Pasta) have NO fixed prices (0)
      await DynamicMenuItem.updateMany(
        { category: { $ne: 'Bar' } },
        {
          $set: {
            suggestedPrice: 0,
            priceFloor: 0,
            dailyPriceSnapshot: 0,
            pricingType: 'OPEN_MARKET_PRICE',
            description: '',
          },
        }
      );
      // Remove descriptions from all items as requested
      await DynamicMenuItem.updateMany({}, { $set: { description: '' } });

      // Synchronize exact names from INITIAL_DYNAMIC_MENU
      for (const item of INITIAL_DYNAMIC_MENU) {
        await DynamicMenuItem.updateOne(
          { itemId: item.itemId },
          { $set: { name: item.name, category: item.category, description: '' } }
        );
      }
      // Remove any unwanted extras
      await DynamicMenuItem.deleteOne({ itemId: 'dyn-1' });
    }

    const items = await DynamicMenuItem.find().sort({ category: 1, name: 1 });

    return NextResponse.json({
      success: true,
      items: items.map((it) => ({
        id: it.itemId,
        name: it.name,
        category: it.category,
        pricingType: it.pricingType,
        suggestedPrice: it.category === 'Bar' ? it.suggestedPrice : 0,
        priceFloor: it.category === 'Bar' ? it.priceFloor : 0,
        dailyPriceSnapshot: it.category === 'Bar' ? it.dailyPriceSnapshot : 0,
        description: '',
        imageUrl: it.imageUrl || getItemImageUrl(it.itemId, it.name, it.category),
        addedBy: it.addedBy,
        isAvailable: it.isAvailable,
      })),
    });
  } catch (err: any) {
    console.error('Error fetching menu items:', err);
    return NextResponse.json({
      success: false,
      items: INITIAL_DYNAMIC_MENU.map((it) => ({
        ...it,
        id: it.itemId,
        imageUrl: it.imageUrl || getItemImageUrl(it.itemId, it.name, it.category),
      })),
      error: err.message,
    }, { status: 500 });
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

    const isFood = (category || '').toLowerCase() !== 'bar';
    const itemId = `dyn-${Date.now()}`;
    const newItem = await DynamicMenuItem.create({
      itemId,
      name,
      category: category || 'Kitchen',
      pricingType: isFood ? 'OPEN_MARKET_PRICE' : (pricingType || 'OPEN_MARKET_PRICE'),
      suggestedPrice: isFood ? 0 : Number(suggestedPrice || 0),
      priceFloor: isFood ? 0 : Number(priceFloor || 0),
      dailyPriceSnapshot: isFood ? 0 : Number(suggestedPrice || 0),
      description: '',
      addedBy: addedBy || 'Resort Manager',
      isAvailable: true,
    });

    // Audit log
    await AuditLog.create({
      roomNumber: 'KITCHEN-BAR',
      category: 'ORDER',
      headline: `New Menu Item Added: ${name}`,
      details: `${addedBy || 'Manager'} added dish "${name}" (${category || 'Kitchen'}). Fixed price: ${isFood ? 'None (Market Price on Order)' : `₦${Number(suggestedPrice || 0).toLocaleString()}`}`,
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

// Permanent Menu Item Deletion (Authorized via menu.food.delete / menu.drink.delete)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get('itemId');
    const role = (searchParams.get('role') || '').toUpperCase();
    const actorName = searchParams.get('actorName') || 'Authorized Staff';
    const permissionGranted = searchParams.get('permissionGranted') === 'true';

    if (!permissionGranted && role !== 'SUPERADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: You do not have permission (menu.food.delete / menu.drink.delete) to delete menu items.' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    if (!itemId) {
      return NextResponse.json({ success: false, error: 'Item ID is required.' }, { status: 400 });
    }

    let deleted = await DynamicMenuItem.findOneAndDelete({ itemId });
    if (!deleted) {
      try {
        deleted = await DynamicMenuItem.findByIdAndDelete(itemId);
      } catch (_) {}
    }

    if (!deleted) {
      return NextResponse.json({ success: false, error: `Menu item "${itemId}" not found.` }, { status: 404 });
    }

    // Immutable audit log
    await AuditLog.create({
      roomNumber: 'KITCHEN-BAR',
      category: 'SYSTEM',
      headline: `Menu Item Purged by Superadmin: ${deleted.name}`,
      details: `Superadmin ${actorName} permanently purged menu item "${deleted.name}" (${deleted.category}, ID: ${itemId}) from Osieka Resort database.`,
      actor: {
        staffId: 'staff-admin',
        staffName: actorName,
        role: 'SUPERADMIN',
      },
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `Menu item "${deleted.name}" completely deleted by Superadmin.`,
    });
  } catch (err: any) {
    console.error('Error deleting menu item:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
