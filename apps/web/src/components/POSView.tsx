'use client';

import React, { useState, useEffect } from 'react';
import { StaffUser, Room, DynamicMenuItem } from '@hosos/types';
import { useFeedback } from '@/context/FeedbackContext';
import { getItemImageUrl } from '@/lib/menuImages';
import { 
  UtensilsCrossed, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  Banknote, 
  ShieldAlert, 
  CheckCircle2, 
  Receipt,
  Fish,
  Tag,
  Lock,
  Sparkles,
  Flame,
  Soup,
  List,
  LayoutGrid,
  Search,
  ArrowRight,
  ShoppingBag,
  ArrowLeft,
  Wine,
} from 'lucide-react';
import { hasPermission } from '@/lib/rbac';

interface POSViewProps {
  rooms: Room[];
  activeStaff: StaffUser;
  onPostChargeToRoom: (
    roomNumber: string,
    amount: number,
    itemsSummary: string,
    items?: Array<{ name: string; quantity: number; unitPrice: number }>,
    chargeToRoom?: boolean
  ) => void;
  initialCategory?: 'Kitchen' | 'Bar';
  onBack?: () => void;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  priceFloor: number;
  quantity: number;
  pricingType?: string;
  category?: string;
}

export default function POSView({
  rooms,
  activeStaff,
  onPostChargeToRoom,
  initialCategory = 'Kitchen',
  onBack,
}: POSViewProps) {
  const { showConfirm, showSuccess, showToast } = useFeedback();
  const [selectedOutlet, setSelectedOutlet] = useState<'RESTAURANT' | 'MAIN_BAR'>('RESTAURANT');
  const [orderType, setOrderType] = useState<'DINE_IN' | 'ROOM_SERVICE' | 'BAR_TAB'>('ROOM_SERVICE');
  const [selectedRoomNumber, setSelectedRoomNumber] = useState('204');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategory === 'Bar' ? 'BEERS' : 'SWALLOW'
  );

  useEffect(() => {
    setSelectedCategory(initialCategory === 'Bar' ? 'BEERS' : 'SWALLOW');
  }, [initialCategory]);

  // Helper to categorize bar drink items into specific subcategories (No "All" tab)
  const getBarSubCategory = (item: DynamicMenuItem): 'BEERS' | 'SOFT_DRINKS' | 'ENERGY' | 'SPIRITS' => {
    const name = item.name.toLowerCase();
    if (name.includes('predator') || name.includes('bullet') || name.includes('climax')) {
      return 'ENERGY';
    }
    if (
      name.includes('smirnoff') ||
      name.includes('origin') ||
      name.includes('orijin') ||
      name.includes('bigmask') ||
      name.includes('chapman') ||
      name.includes('palm wine')
    ) {
      return 'SPIRITS';
    }
    if (
      name.includes('5 alive') ||
      name.includes('five alive') ||
      name.includes('exotic') ||
      name.includes('maltina') ||
      name.includes('coke') ||
      name.includes('nutri') ||
      name.includes('fayrouz') ||
      name.includes('hollandia') ||
      name.includes('water')
    ) {
      return 'SOFT_DRINKS';
    }
    return 'BEERS';
  };
  
  // Authentic Osieka Resort Initial Menu Items (No fixed prices on food; drinks have printed menu prices)
  const DEFAULT_MENU_ITEMS: DynamicMenuItem[] = [
    // 1. Swallow (No price, no description)
    {
      id: 'swallow-1',
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
      id: 'swallow-2',
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
      id: 'swallow-3',
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
      id: 'swallow-4',
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

    // 2. Soups (No price, no description)
    {
      id: 'soup-1',
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
      id: 'soup-2',
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
      id: 'soup-3',
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
      id: 'soup-4',
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
      id: 'soup-5',
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
      id: 'dyn-2',
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
      id: 'rice-1',
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
      id: 'rice-2',
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
      id: 'rice-3',
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
      id: 'protein-1',
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
      id: 'protein-2',
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
      id: 'protein-3',
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
      id: 'protein-4',
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
      id: 'pasta-1',
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
      id: 'pasta-2',
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
      id: 'pasta-3',
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
      id: 'pasta-4',
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
      id: 'bar-1',
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
      id: 'bar-2',
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
      id: 'bar-3',
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
      id: 'bar-4',
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
      id: 'bar-5',
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
      id: 'bar-6',
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
      id: 'bar-7',
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
      id: 'bar-8',
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
      id: 'bar-9',
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
      id: 'bar-10',
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
      id: 'bar-11',
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
      id: 'bar-12',
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
      id: 'bar-13',
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
      id: 'bar-14',
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
      id: 'bar-15',
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
      id: 'bar-16',
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
      id: 'bar-17',
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
      id: 'bar-18',
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
      id: 'bar-19',
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
      id: 'bar-20',
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
      id: 'bar-21',
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
      id: 'bar-22',
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
      id: 'bar-23',
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
      id: 'bar-24',
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
      id: 'bar-25',
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
      id: 'bar-26',
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
      id: 'bar-27',
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
      id: 'bar-28',
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
      id: 'bar-29',
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
      id: 'bar-30',
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
      id: 'bar-31',
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
      id: 'bar-32',
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
      id: 'bar-33',
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
      id: 'bar-34',
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
      id: 'bar-35',
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
      id: 'bar-36',
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
      id: 'dyn-5',
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
      id: 'dyn-6',
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

  const [menuItems, setMenuItems] = useState<DynamicMenuItem[]>(() =>
    DEFAULT_MENU_ITEMS.map((it) => ({
      ...it,
      imageUrl: it.imageUrl || getItemImageUrl(it.id, it.name, it.category),
    }))
  );

  // Responsive screen detection: Chowdeck & Glovo Mobile UX (Mobile = Cards default)
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);
  const [userViewMode, setUserViewMode] = useState<'LIST' | 'GRID' | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Effective view mode: Defaults to Cards ('GRID') for picture-heavy display as requested by user. Manual toggle overrides.
  const effectiveViewMode = userViewMode ?? 'GRID';

  // Superadmin & Granular RBAC Authority checks with activeStaff.id for custom/elevated overrides
  const isSuperAdmin =
    activeStaff.role === 'SUPERADMIN' ||
    activeStaff.role === 'OWNER' ||
    (activeStaff.role as any) === 'ADMIN';

  const canCreateOrder = hasPermission(activeStaff.role, 'orders.create', activeStaff.id);
  const canOverridePrice = isSuperAdmin || hasPermission(activeStaff.role, 'prices.override', activeStaff.id);
  const canManageMenu = isSuperAdmin || hasPermission(activeStaff.role, 'menu.manage', activeStaff.id);
  const canDirectSettle = hasPermission(activeStaff.role, 'cash.receive', activeStaff.id);

  // Initial cart: starts clean for order entry
  const [cart, setCart] = useState<CartItem[]>([]);

  // Fetch dynamic menu from backend
  useEffect(() => {
    fetch('/api/menu')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.items && data.items.length > 0) {
          setMenuItems(
            data.items.map((it: any) => ({
              ...it,
              imageUrl: it.imageUrl || getItemImageUrl(it.id || it.itemId, it.name, it.category),
            }))
          );
        }
      })
      .catch((e) => console.warn('Could not fetch dynamic menu for POS:', e));
  }, []);

  // Superadmin Permanent Menu Item Deletion
  const handleDeleteMenuItem = (itemId: string, itemName: string) => {
    if (!isSuperAdmin) return;
    showConfirm(
      'Delete Menu Item Permanently',
      `Are you sure you want to completely delete "${itemName}" from the Osieka Resort menu catalog? This data item will be completely removed from MongoDB Atlas and cannot be recovered.`,
      async () => {
        try {
          const res = await fetch(`/api/menu?itemId=${encodeURIComponent(itemId)}&role=${encodeURIComponent(activeStaff.role)}&actorName=${encodeURIComponent(activeStaff.name)}`, {
            method: 'DELETE',
          });
          const data = await res.json();
          if (data.success) {
            showSuccess('Menu Item Deleted', `"${itemName}" was permanently purged from the catalog by Superadmin.`);
            setMenuItems((prev) => prev.filter((m) => m.id !== itemId && (m as any).itemId !== itemId));
            setCart((prev) => prev.filter((c) => c.id !== itemId));
          } else {
            showToast({ type: 'error', title: 'Delete Failed', message: data.error || 'Server error' });
          }
        } catch (err: any) {
          showToast({ type: 'error', title: 'Network Error', message: err.message });
        }
      },
      {
        confirmText: 'Purge Item',
        cancelText: 'Cancel',
        variant: 'danger',
      }
    );
  };

  const addToCart = (item: DynamicMenuItem) => {
    const activePrice = item.dailyPriceSnapshot || item.suggestedPrice || 0;
    setCart((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (existing) {
        return prev.map((p) => (p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p));
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          price: activePrice,
          priceFloor: item.priceFloor || 0,
          pricingType: item.pricingType,
          category: item.category,
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((p) => p.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newQ = p.quantity + delta;
          return newQ > 0 ? { ...p, quantity: newQ } : p;
        }
        return p;
      })
    );
  };

  // Allow order-taker to dynamically modify unit price on the fly (weight / market rate / special request)
  const updateItemPrice = (id: string, newPrice: number) => {
    setCart((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return { ...p, price: Math.max(0, newPrice) };
        }
        return p;
      })
    );
  };

  const subtotal = cart.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
  const vat = Math.round(subtotal * 0.075);
  const serviceCharge = Math.round(subtotal * 0.1);
  const total = subtotal + vat + serviceCharge;

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleChargeToRoom = () => {
    const summary = cart.map((c) => `${c.quantity}x ${c.name} (@ ₦${c.price.toLocaleString()})`).join(', ');
    const itemsPayload = cart.map((c) => ({ name: c.name, quantity: c.quantity, unitPrice: c.price }));

    // Warn if any item is below price floor
    const belowFloorItem = cart.find((c) => c.priceFloor > 0 && c.price < c.priceFloor);
    if (belowFloorItem) {
      showToast({
        type: 'warning',
        title: 'Floor Price Warning',
        message: `"${belowFloorItem.name}" is priced below cost floor (₦${belowFloorItem.priceFloor.toLocaleString()}). Proceeding with staff override.`,
      });
    }

    showConfirm(
      `Confirm Charge to Room #${selectedRoomNumber}`,
      `Are you sure you want to post this order totaling ${formatNaira(total)} to Room #${selectedRoomNumber} folio?`,
      () => {
        onPostChargeToRoom(selectedRoomNumber, total, summary, itemsPayload, true);
        setCart([]);
      },
      {
        confirmText: 'Charge Room Folio',
        variant: 'primary',
        details: `Items: ${summary} | Total Amount: ${formatNaira(total)} | Waiter: ${activeStaff.name}`,
      }
    );
  };

  // Fast Live Search & Category Filtering (No "All" tab: only clicked data displayed)
  const filteredMenuItems = menuItems.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q);
    if (!matchesSearch) return false;

    if (initialCategory === 'Bar') {
      if (item.category !== 'Bar') return false;
      return getBarSubCategory(item) === selectedCategory;
    } else {
      if (item.category === 'Bar') return false;
      const targetCat = selectedCategory.toUpperCase().replace(/\s+/g, '');
      const itemCat = item.category.toUpperCase().replace(/\s+/g, '');
      return itemCat === targetCat;
    }
  });

  // Reusable Ticket Component for Desktop Column & Mobile Sliding Drawer Modal
  const renderTicketContent = (isDrawerModal: boolean = false) => (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Active Order Ticket
          </h3>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Server: <strong style={{ color: 'var(--text-primary)' }}>{activeStaff.name}</strong>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-brand">KOT Firing</span>
          {isDrawerModal && (
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(false)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontWeight: 800,
                color: 'var(--text-secondary)',
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Room / Destination Selector */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
          Bill Destination
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button
            onClick={() => setOrderType('ROOM_SERVICE')}
            style={{
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: orderType === 'ROOM_SERVICE' ? 'var(--brand-primary)' : 'var(--bg-secondary)',
              color: orderType === 'ROOM_SERVICE' ? '#FFFFFF' : 'var(--text-secondary)',
            }}
          >
            Charge Room
          </button>
          <button
            onClick={() => setOrderType('DINE_IN')}
            style={{
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: orderType === 'DINE_IN' ? 'var(--brand-primary)' : 'var(--bg-secondary)',
              color: orderType === 'DINE_IN' ? '#FFFFFF' : 'var(--text-secondary)',
            }}
          >
            Direct Cash/POS
          </button>
        </div>

        {orderType === 'ROOM_SERVICE' && (
          <div style={{ marginTop: '8px' }}>
            <select
              value={selectedRoomNumber}
              onChange={(e) => setSelectedRoomNumber(e.target.value)}
              style={{ width: '100%', fontSize: '0.85rem' }}
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.roomNumber}>
                  Room #{r.roomNumber} ({r.currentGuestName || 'Unassigned'})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Cart Item List with ON-THE-FLY PRICE EDITING */}
      <div style={{
        maxHeight: isDrawerModal ? '42vh' : '320px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        paddingRight: '4px',
        marginBottom: '16px',
      }}>
        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Order is empty. Tap Swallow, Soups, Rice, or Proteins to assemble meal.
          </div>
        ) : (
          cart.map((item) => {
            const isBelowFloor = item.priceFloor > 0 && item.price < item.priceFloor;
            return (
              <div 
                key={item.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  padding: '10px 12px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '8px',
                  border: isBelowFloor ? '1px solid var(--crimson-border)' : '1px solid var(--border-color)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem', flex: 1, paddingRight: '6px' }}>
                    {item.name}
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    style={{ background: 'transparent', color: 'var(--rose-primary)', padding: '2px', border: 'none', cursor: 'pointer' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {/* Interactive Dynamic Price & Quantity Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {/* Editable Unit Price */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>₦</span>
                    <input
                      type="number"
                      value={item.price}
                      disabled={!canOverridePrice}
                      onChange={(e) => updateItemPrice(item.id, Number(e.target.value))}
                      style={{
                        width: '95px',
                        padding: '3px 6px',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        backgroundColor: canOverridePrice ? '#FFFFFF' : 'var(--bg-secondary)',
                        borderRadius: '4px',
                        border: isBelowFloor ? '1px solid var(--crimson-primary)' : '1px solid var(--border-color)',
                        cursor: canOverridePrice ? 'text' : 'not-allowed',
                      }}
                    />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>/unit</span>
                  </div>

                  {/* Quantity Stepper */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      style={{ padding: '3px 8px', background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}
                    >
                      <Minus size={12} />
                    </button>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, minWidth: '16px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      style={{ padding: '3px 8px', background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* Extended Total */}
                  <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                    {formatNaira(item.price * item.quantity)}
                  </span>
                </div>

                {/* Floor Warning Tag */}
                {isBelowFloor && (
                  <div style={{ fontSize: '0.675rem', color: 'var(--crimson-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Lock size={10} /> Below Cost Recovery Floor (₦{item.priceFloor.toLocaleString()})
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Calculation Totals */}
      <div style={{
        borderTop: '1px solid var(--border-color)',
        paddingTop: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        fontSize: '0.85rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
          <span>Subtotal (Dynamic Prices)</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>{formatNaira(subtotal)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
          <span>VAT (7.5%)</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>{formatNaira(vat)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
          <span>Service Charge (10%)</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>{formatNaira(serviceCharge)}</span>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          color: 'var(--text-primary)',
          fontWeight: 800,
          fontSize: '1.15rem',
          marginTop: '8px',
          paddingTop: '8px',
          borderTop: '1px solid var(--border-color)',
        }}>
          <span>Total</span>
          <span style={{ color: 'var(--brand-primary)', fontFamily: 'var(--font-mono)' }}>
            {formatNaira(total)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ marginTop: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {orderType === 'ROOM_SERVICE' ? (
          <button
            onClick={() => {
              handleChargeToRoom();
              if (isDrawerModal) setMobileDrawerOpen(false);
            }}
            disabled={cart.length === 0 || !canCreateOrder}
            className="btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '0.9rem', fontWeight: 800 }}
          >
            <CreditCard size={16} /> Post Charge to Room #{selectedRoomNumber}
          </button>
        ) : (
          <button
            onClick={() => {
              showSuccess(
                'Order Settled Direct',
                `Payment of ${formatNaira(total)} collected via POS / Cash.`,
                `Items: ${cart.map((c) => c.name).join(', ')}`
              );
              setCart([]);
              if (isDrawerModal) setMobileDrawerOpen(false);
            }}
            disabled={cart.length === 0 || !canDirectSettle}
            className="btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '0.9rem', fontWeight: 800, backgroundColor: 'var(--emerald-primary)' }}
          >
            <Banknote size={16} /> Settle Bill Direct ({formatNaira(total)})
          </button>
        )}

        <button
          onClick={() => {
            setCart([]);
            if (isDrawerModal) setMobileDrawerOpen(false);
          }}
          disabled={cart.length === 0}
          className="btn-secondary"
          style={{ width: '100%', padding: '8px', fontSize: '0.8rem' }}
        >
          Clear Ticket
        </button>
      </div>
    </>
  );

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 400px',
      gap: '24px',
      padding: '24px 0',
      position: 'relative',
    }}>
      
      {/* Left: Outlet Switcher + Search + Menu Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Top Operational Header with Back, Title, Station & List/Cards Toggle */}
        <div className="ent-card" style={{ padding: '18px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '6px 12px',
                    gap: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                  }}
                  title="Return to Hospitality Hub"
                >
                  <ArrowLeft size={16} /> Hub
                </button>
              )}
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: initialCategory === 'Bar' ? 'rgba(147, 51, 234, 0.12)' : 'rgba(234, 88, 12, 0.12)',
                color: initialCategory === 'Bar' ? '#9333ea' : '#ea580c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${initialCategory === 'Bar' ? 'rgba(147, 51, 234, 0.25)' : 'rgba(234, 88, 12, 0.25)'}`,
              }}>
                {initialCategory === 'Bar' ? <Wine size={22} /> : <UtensilsCrossed size={22} />}
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {initialCategory === 'Bar' ? 'Bar & Beverage Order Board' : 'Kitchen POS & Order Board'}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: 0 }}>
                  {initialCategory === 'Bar'
                    ? 'Chilled beers, juices, energy drinks & signature resort cocktails'
                    : 'Authentic Nigerian swallow, soups, rice, pasta & coastal proteins'}
                </p>
              </div>
            </div>

            {/* List vs Cards Toggle Button at the TOP */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{
                display: 'flex',
                backgroundColor: 'var(--bg-secondary)',
                padding: '3px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
              }}>
                <button
                  type="button"
                  onClick={() => setUserViewMode('GRID')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    backgroundColor: effectiveViewMode === 'GRID' ? '#FFFFFF' : 'transparent',
                    color: effectiveViewMode === 'GRID' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                    border: 'none',
                    boxShadow: effectiveViewMode === 'GRID' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  <LayoutGrid size={14} /> Cards (Photo Heavy)
                </button>
                <button
                  type="button"
                  onClick={() => setUserViewMode('LIST')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    backgroundColor: effectiveViewMode === 'LIST' ? '#FFFFFF' : 'transparent',
                    color: effectiveViewMode === 'LIST' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                    border: 'none',
                    boxShadow: effectiveViewMode === 'LIST' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  <List size={14} /> List View
                </button>
              </div>

              {isMobile && (
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '7px 14px',
                    borderRadius: '8px',
                    backgroundColor: cart.length > 0 ? 'var(--brand-primary)' : 'var(--bg-secondary)',
                    color: cart.length > 0 ? '#FFFFFF' : 'var(--text-secondary)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <ShoppingBag size={14} />
                  <span>Ticket ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
                </button>
              )}
            </div>
          </div>

          {/* Sub-bar: Outlet & Station */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              {(['RESTAURANT', 'MAIN_BAR'] as const).map((outlet) => (
                <button
                  key={outlet}
                  onClick={() => setSelectedOutlet(outlet)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    backgroundColor: selectedOutlet === outlet ? 'var(--brand-primary)' : 'var(--bg-secondary)',
                    color: selectedOutlet === outlet ? '#FFFFFF' : 'var(--text-secondary)',
                    border: '1px solid var(--border-color)',
                    cursor: 'pointer',
                  }}
                >
                  {outlet.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Destination:</span>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value as any)}
                style={{ fontSize: '0.78rem', padding: '4px 8px' }}
              >
                <option value="ROOM_SERVICE">Room Service Delivery</option>
                <option value="DINE_IN">Table Dine-In</option>
                <option value="BAR_TAB">Bar Tab</option>
              </select>
            </div>
          </div>
        </div>

        {/* Chowdeck / Glovo Responsive Live Search Input */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={initialCategory === 'Bar' ? 'Search chilled beer bottles, juices, energy boosts, cocktails...' : 'Search authentic Nigerian dishes (Eba, Egusi, Jollof, Semo)...'}
            style={{
              width: '100%',
              padding: '11px 16px 11px 40px',
              borderRadius: '24px',
              border: '1px solid var(--border-color)',
              backgroundColor: '#FFFFFF',
              fontSize: '0.85rem',
              color: 'var(--text-primary)',
              outline: 'none',
              boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.8rem',
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Dynamic Pricing Explanatory Banner */}
        <div style={{
          padding: '12px 18px',
          backgroundColor: 'rgba(37, 99, 235, 0.06)',
          border: '1px solid rgba(37, 99, 235, 0.2)',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <Fish size={20} color="var(--brand-primary)" />
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <strong>Authentic Nigerian Hospitality:</strong> {initialCategory === 'Bar' ? 'Official bar inventory with verified price snapshots. Tap any drink to add to live guest ticket.' : 'Coastal seafood, chef specials and authentic local dishes priced per portion. Bar drinks retain fixed register prices.'}
          </div>
        </div>

        {/* Category Filter Bar (No "All" tab! Strictly clicked category items) */}
        {(() => {
          const kitchenCats = [
            { id: 'SWALLOW', label: '🥣 Swallow' },
            { id: 'SOUPS', label: '🍲 Soups' },
            { id: 'RICE MEALS', label: '🍚 Rice Meals' },
            { id: 'PASTA MENU', label: '🍝 Pasta Menu' },
            { id: 'PROTEINS', label: '🥩 Proteins' },
          ];
          const barCats = [
            { id: 'BEERS', label: '🍺 Beers & Stouts' },
            { id: 'SOFT_DRINKS', label: '🧃 Juices & Soft Drinks' },
            { id: 'ENERGY', label: '⚡ Energy Drinks' },
            { id: 'SPIRITS', label: '🍸 Spirits & Cocktails' },
          ];
          const currentCategories = initialCategory === 'Bar' ? barCats : kitchenCats;

          return (
            <div style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '4px',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
            }}>
              {currentCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                    padding: isMobile ? '8px 14px' : '9px 18px',
                    borderRadius: '20px',
                    fontSize: isMobile ? '0.75rem' : '0.825rem',
                    fontWeight: 700,
                    backgroundColor: selectedCategory === cat.id ? 'var(--brand-primary)' : 'var(--bg-secondary)',
                    color: selectedCategory === cat.id ? '#FFFFFF' : 'var(--text-secondary)',
                    border: selectedCategory === cat.id ? '1px solid var(--brand-primary)' : '1px solid var(--border-color)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: selectedCategory === cat.id ? '0 2px 8px rgba(37,99,235,0.25)' : 'none',
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          );
        })()}

        {/* Menu Items Container */}
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '14px',
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {(() => {
                const kitchenCats = [
                  { id: 'SWALLOW', label: '🥣 Swallow' },
                  { id: 'SOUPS', label: '🍲 Soups' },
                  { id: 'RICE MEALS', label: '🍚 Rice Meals' },
                  { id: 'PASTA MENU', label: '🍝 Pasta Menu' },
                  { id: 'PROTEINS', label: '🥩 Proteins' },
                ];
                const barCats = [
                  { id: 'BEERS', label: '🍺 Beers & Stouts' },
                  { id: 'SOFT_DRINKS', label: '🧃 Juices & Soft Drinks' },
                  { id: 'ENERGY', label: '⚡ Energy Drinks' },
                  { id: 'SPIRITS', label: '🍸 Spirits & Cocktails' },
                ];
                const cats = initialCategory === 'Bar' ? barCats : kitchenCats;
                return cats.find(c => c.id === selectedCategory)?.label || selectedCategory;
              })()} ({filteredMenuItems.length} available)
            </h3>

            {/* List vs Cards View Switcher */}
            <div style={{
              display: 'flex',
              backgroundColor: 'var(--bg-secondary)',
              padding: '3px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
            }}>
              <button
                type="button"
                onClick={() => setUserViewMode('LIST')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: effectiveViewMode === 'LIST' ? '#FFFFFF' : 'transparent',
                  color: effectiveViewMode === 'LIST' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  border: 'none',
                  boxShadow: effectiveViewMode === 'LIST' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                }}
              >
                <List size={14} />
                <span>☰ List View</span>
              </button>
              <button
                type="button"
                onClick={() => setUserViewMode('GRID')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: effectiveViewMode === 'GRID' ? '#FFFFFF' : 'transparent',
                  color: effectiveViewMode === 'GRID' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  border: 'none',
                  boxShadow: effectiveViewMode === 'GRID' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                }}
              >
                <LayoutGrid size={14} />
                <span>⊞ Cards {isMobile ? '(Mobile)' : 'View'}</span>
              </button>
            </div>
          </div>

          {/* 1. LIST VIEW (Desktop default with fast local food/drink thumbnails) */}
          {effectiveViewMode === 'LIST' ? (
            <div className="ent-card" style={{ padding: 0, overflow: 'hidden', backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)' }}>
              <div style={{ overflowX: 'auto' }}>
                <table className="ent-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Item & Photo</th>
                      <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Category</th>
                      <th style={{ padding: '10px 16px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Price</th>
                      <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', width: '130px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMenuItems.map((item) => {
                      const isBar = item.category === 'Bar';
                      const activePrice = item.dailyPriceSnapshot || item.suggestedPrice || 0;
                      const cartEntry = cart.find((c) => c.id === item.id);
                      const inCartQty = cartEntry ? cartEntry.quantity : 0;
                      const imgSrc = item.imageUrl || getItemImageUrl(item.id, item.name, item.category);

                      return (
                        <tr
                          key={item.id}
                          onClick={() => addToCart(item)}
                          style={{
                            borderBottom: '1px solid var(--border-subtle)',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s ease',
                            backgroundColor: inCartQty > 0 ? 'rgba(37, 99, 235, 0.03)' : 'transparent',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.05)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = inCartQty > 0 ? 'rgba(37, 99, 235, 0.03)' : 'transparent')}
                        >
                          <td style={{ padding: '8px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <img
                                src={imgSrc}
                                alt={item.name}
                                loading="lazy"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = '/menu/jollof_rice.jpg';
                                }}
                                style={{
                                  width: '42px',
                                  height: '42px',
                                  borderRadius: '8px',
                                  objectFit: 'cover',
                                  flexShrink: 0,
                                  border: '1px solid var(--border-color)',
                                }}
                              />
                              <div>
                                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                                  {item.name}
                                </div>
                                {inCartQty > 0 && (
                                  <div style={{ fontSize: '0.7rem', color: 'var(--brand-primary)', fontWeight: 600 }}>
                                    ✓ {inCartQty} in active order
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '8px 16px' }}>
                            <span className={item.category === 'Swallow' ? 'badge badge-brand' : item.category === 'Soups' ? 'badge badge-amber' : item.category === 'Rice Meals' ? 'badge badge-clean' : item.category === 'Proteins' ? 'badge badge-dirty' : 'badge badge-purple'}>
                              {item.category}
                            </span>
                          </td>
                          <td style={{ padding: '8px 16px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.9rem' }}>
                            {isBar && activePrice > 0 ? (
                              <span style={{ color: 'var(--text-primary)' }}>{formatNaira(activePrice)}</span>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', fontWeight: 700 }}>
                                Price on Order
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '8px 16px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                              <button
                                className="btn-primary"
                                style={{ padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700, borderRadius: '6px' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToCart(item);
                                }}
                              >
                                <Plus size={13} /> Add
                              </button>
                              {canManageMenu && (
                                <button
                                  className="btn-danger"
                                  style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '6px' }}
                                  title="Permanently purge item (Authorized)"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteMenuItem(item.id, item.name);
                                  }}
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* 2. CHOWDECK & GLOVO CARDS VIEW (Picture Heavy Display - Strictly 3 on a row on desktop) */
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
              gap: isMobile ? '12px' : '20px',
            }}>
              {filteredMenuItems.map((item) => {
                const isBar = item.category === 'Bar';
                const activePrice = item.dailyPriceSnapshot || item.suggestedPrice || 0;
                const cartEntry = cart.find((c) => c.id === item.id);
                const inCartQty = cartEntry ? cartEntry.quantity : 0;
                const imgSrc = item.imageUrl || getItemImageUrl(item.id, item.name, item.category);

                return (
                  <div
                    key={item.id}
                    onClick={() => canCreateOrder && addToCart(item)}
                    className="ent-card-interactive"
                    style={{
                      padding: 0,
                      cursor: canCreateOrder ? 'pointer' : 'default',
                      display: 'flex',
                      flexDirection: 'column',
                      backgroundColor: '#FFFFFF',
                      border: inCartQty > 0 ? '2px solid var(--brand-primary)' : '1px solid var(--border-color)',
                      borderRadius: isMobile ? '12px' : '16px',
                      overflow: 'hidden',
                      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                      boxShadow: inCartQty > 0 ? '0 6px 20px rgba(37, 99, 235, 0.18)' : '0 2px 8px rgba(0,0,0,0.04)',
                    }}
                  >
                    {/* Card Photo Container (Picture Heavy Display with Authentic Nigerian Dishes & Drinks) */}
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      height: isMobile ? '130px' : '185px',
                      backgroundColor: 'var(--bg-secondary)',
                      overflow: 'hidden',
                    }}>
                      <img
                        src={imgSrc}
                        alt={item.name}
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/menu/jollof_rice.jpg';
                        }}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease',
                        }}
                      />

                      {/* Floating Category Pill on top-left of image */}
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        backgroundColor: 'rgba(15, 23, 42, 0.72)',
                        backdropFilter: 'blur(6px)',
                        color: '#FFFFFF',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '12px',
                        letterSpacing: '0.3px',
                      }}>
                        {item.category}
                      </div>

                      {/* Active Ticket Counter Badge on top-right */}
                      {inCartQty > 0 && (
                        <div style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          backgroundColor: 'var(--brand-primary)',
                          color: '#FFFFFF',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '3px 9px',
                          borderRadius: '12px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        }}>
                          {inCartQty} in ticket
                        </div>
                      )}
                    </div>

                    {/* Card Body */}
                    <div style={{
                      padding: '12px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      flex: 1,
                      justifyContent: 'space-between',
                    }}>
                      <div>
                        <h4 style={{
                          fontSize: isMobile ? '0.825rem' : '0.9rem',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          margin: '0 0 6px',
                          lineHeight: 1.25,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          minHeight: '2.5em',
                        }}>
                          {item.name}
                        </h4>
                      </div>

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '8px',
                        paddingTop: '8px',
                        borderTop: '1px solid var(--border-subtle)',
                      }}>
                        <div>
                          {isBar && activePrice > 0 ? (
                            <span style={{
                              fontSize: isMobile ? '0.95rem' : '1.05rem',
                              fontWeight: 800,
                              fontFamily: 'var(--font-mono)',
                              color: 'var(--text-primary)',
                            }}>
                              {formatNaira(activePrice)}
                            </span>
                          ) : (
                            <span style={{
                              fontSize: '0.725rem',
                              fontWeight: 700,
                              color: 'var(--brand-primary)',
                              backgroundColor: 'rgba(37, 99, 235, 0.08)',
                              padding: '2px 6px',
                              borderRadius: '4px',
                            }}>
                              Price on Order
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            className="btn-primary"
                            style={{
                              padding: isMobile ? '4px 10px' : '5px 12px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              borderRadius: '20px',
                              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(item);
                            }}
                          >
                            <Plus size={13} /> Add
                          </button>

                          {canManageMenu && (
                            <button
                              type="button"
                              className="btn-danger"
                              style={{ padding: '4px 7px', fontSize: '0.725rem', borderRadius: '6px' }}
                              title="Permanently purge item (Authorized)"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteMenuItem(item.id, item.name);
                              }}
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right: Active Ticket on Desktop */}
      {!isMobile && (
        <div id="pos-order-ticket" className="ent-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: 'fit-content', backgroundColor: '#FFFFFF' }}>
          {renderTicketContent(false)}
        </div>
      )}

      {/* Chowdeck & Glovo Mobile Sticky Order Pill (Fixed Bottom Bar) */}
      {isMobile && cart.length > 0 && !mobileDrawerOpen && (
        <div
          onClick={() => setMobileDrawerOpen(true)}
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '16px',
            right: '16px',
            zIndex: 100,
            backgroundColor: 'var(--brand-primary)',
            color: '#FFFFFF',
            borderRadius: '16px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 8px 24px rgba(37, 99, 235, 0.45)',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              backgroundColor: 'rgba(255,255,255,0.22)',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 800,
            }}>
              {cart.reduce((sum, item) => sum + item.quantity, 0)} items
            </span>
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Review Active Order</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '1.05rem', fontFamily: 'var(--font-mono)' }}>
            <span>{formatNaira(total)}</span>
            <ArrowRight size={18} />
          </div>
        </div>
      )}

      {/* Chowdeck & Glovo Mobile Sliding Ticket Bottom Sheet Drawer */}
      {isMobile && mobileDrawerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setMobileDrawerOpen(false);
            }
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '16px 20px 32px',
              boxShadow: '0 -10px 40px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Top Grab Handle */}
            <div style={{
              width: '40px',
              height: '4px',
              backgroundColor: 'var(--border-color)',
              borderRadius: '2px',
              margin: '0 auto 12px',
            }} />

            {renderTicketContent(true)}
          </div>
        </div>
      )}

    </div>
  );
}
