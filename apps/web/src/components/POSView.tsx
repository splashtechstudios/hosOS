'use client';

import React, { useState, useEffect } from 'react';
import { StaffUser, Room, DynamicMenuItem } from '@hosos/types';
import { useFeedback } from '@/context/FeedbackContext';
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
  Soup
} from 'lucide-react';

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
}: POSViewProps) {
  const { showConfirm, showSuccess, showToast } = useFeedback();
  const [selectedOutlet, setSelectedOutlet] = useState<'RESTAURANT' | 'POOL_BAR' | 'LOUNGE'>('RESTAURANT');
  const [orderType, setOrderType] = useState<'DINE_IN' | 'ROOM_SERVICE' | 'BAR_TAB'>('ROOM_SERVICE');
  const [selectedRoomNumber, setSelectedRoomNumber] = useState('204');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  
  // Authentic Osieka Resort Initial Menu Items
  const DEFAULT_MENU_ITEMS: DynamicMenuItem[] = [
    // 1. Swallow
    {
      id: 'swallow-1',
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
      id: 'swallow-2',
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
      id: 'swallow-3',
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
      id: 'swallow-4',
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
      id: 'soup-1',
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
      id: 'soup-2',
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
      id: 'soup-3',
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
      id: 'soup-4',
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
      id: 'soup-5',
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
      id: 'rice-1',
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
      id: 'rice-2',
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
      id: 'rice-3',
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
      id: 'protein-1',
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
      id: 'protein-2',
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
      id: 'protein-3',
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
      id: 'protein-4',
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
      id: 'pasta-1',
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
      id: 'pasta-2',
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
      id: 'pasta-3',
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
      id: 'pasta-4',
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
      id: 'dyn-1',
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
      id: 'dyn-2',
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
      name: 'Nutria-yo',
      category: 'Bar',
      pricingType: 'SUGGESTED_BENCHMARK',
      suggestedPrice: 1000,
      priceFloor: 700,
      dailyPriceSnapshot: 1000,
      description: 'Nutri-Yo sweetened yoghurt drink.',
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

  const [menuItems, setMenuItems] = useState<DynamicMenuItem[]>(DEFAULT_MENU_ITEMS);

  // Initial cart sample (Pounded Yam + Egusi Soup + Goat Meat combo)
  const [cart, setCart] = useState<CartItem[]>([
    {
      id: 'swallow-4',
      name: 'Pounded Yam',
      price: 2000,
      priceFloor: 1200,
      quantity: 1,
      category: 'Swallow',
      pricingType: 'SUGGESTED_BENCHMARK',
    },
    {
      id: 'soup-1',
      name: 'Egusi Soup',
      price: 3500,
      priceFloor: 2500,
      quantity: 1,
      category: 'Soups',
      pricingType: 'SUGGESTED_BENCHMARK',
    },
    {
      id: 'protein-2',
      name: 'Goat Meat (Peppered / Stewed Cut)',
      price: 3500,
      priceFloor: 2500,
      quantity: 1,
      category: 'Proteins',
      pricingType: 'SUGGESTED_BENCHMARK',
    },
  ]);

  const [transferPending, setTransferPending] = useState(false);
  const [transferVerified, setTransferVerified] = useState(false);

  // Fetch dynamic menu from backend
  useEffect(() => {
    fetch('/api/menu')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.items && data.items.length > 0) {
          setMenuItems(data.items);
        }
      })
      .catch((e) => console.warn('Could not fetch dynamic menu for POS:', e));
  }, []);

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

  // Category filtering
  const filteredMenuItems = menuItems.filter((item) => {
    if (selectedCategory === 'ALL') return true;
    return item.category.toUpperCase().replace(/\s+/g, '') === selectedCategory.toUpperCase().replace(/\s+/g, '');
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px', padding: '24px 0' }}>
      
      {/* Left: Outlet Switcher + Menu Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Outlet & Mode Bar */}
        <div className="ent-card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['RESTAURANT', 'POOL_BAR', 'LOUNGE'] as const).map((outlet) => (
                <button
                  key={outlet}
                  onClick={() => setSelectedOutlet(outlet)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    backgroundColor: selectedOutlet === outlet ? 'var(--brand-primary)' : 'var(--bg-secondary)',
                    color: selectedOutlet === outlet ? '#FFFFFF' : 'var(--text-secondary)',
                  }}
                >
                  {outlet.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Station:</span>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value as any)}
                style={{ fontSize: '0.8rem' }}
              >
                <option value="ROOM_SERVICE">Room Service Delivery</option>
                <option value="DINE_IN">Table Dine-In</option>
                <option value="BAR_TAB">Bar Tab</option>
              </select>
            </div>
          </div>
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
            <strong>Osieka Dynamic Menu:</strong> Coastal catch, special orders & authentic local dishes have <strong>no fixed prices</strong>.
            Click dishes to assemble guest meals (Swallow + Soup + Protein). You can adjust unit prices directly in the ticket.
          </div>
        </div>

        {/* Category Filter Bar */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: 'All Items' },
            { id: 'SWALLOW', label: '🥣 Swallow' },
            { id: 'SOUPS', label: '🍲 Soups' },
            { id: 'RICE MEALS', label: '🍚 Rice Meals' },
            { id: 'PASTA MENU', label: '🍝 Pasta Menu' },
            { id: 'PROTEINS', label: '🥩 Proteins' },
            { id: 'GRILL', label: '🍢 Grill / BBQ' },
            { id: 'BAR', label: '🍹 Bar & Drinks' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: selectedCategory === cat.id ? 'var(--brand-primary)' : 'var(--bg-secondary)',
                color: selectedCategory === cat.id ? '#FFFFFF' : 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Menu Cards */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {selectedCategory === 'ALL' ? 'All Dishes & Drinks' : selectedCategory} ({filteredMenuItems.length} available)
            </h3>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '14px',
          }}>
            {filteredMenuItems.map((item) => {
              const activePrice = item.dailyPriceSnapshot || item.suggestedPrice || 0;
              return (
                <div
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="ent-card-interactive"
                  style={{
                    padding: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span className={item.category === 'Swallow' ? 'badge badge-brand' : item.category === 'Soups' ? 'badge badge-amber' : item.category === 'Rice Meals' ? 'badge badge-clean' : item.category === 'Proteins' ? 'badge badge-dirty' : 'badge badge-purple'}>
                        {item.category}
                      </span>
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        color: item.pricingType === 'OPEN_MARKET_PRICE' ? 'var(--brand-primary)' : item.pricingType === 'DAILY_SPECIAL' ? 'var(--amber-primary)' : 'var(--emerald-primary)',
                      }}>
                        {item.pricingType === 'OPEN_MARKET_PRICE' ? '🐟 Market Catch' : item.pricingType === 'DAILY_SPECIAL' ? '⭐ Special Order' : '📊 Benchmark'}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                      {item.name}
                    </h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.3 }}>
                      {item.description || 'Authentic Osieka resort specialty.'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                    <div>
                      <span style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                        {formatNaira(activePrice)}
                      </span>
                      {item.priceFloor > 0 && (
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                          Floor: ₦{item.priceFloor.toLocaleString()}
                        </div>
                      )}
                    </div>

                    <button
                      className="btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(item);
                      }}
                    >
                      <Plus size={14} /> Add
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Anti-Fraud Manual Bank Transfer Verification Queue */}
        <div className="ent-card" style={{ padding: '20px', borderLeft: '4px solid var(--amber-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <ShieldAlert size={20} color="var(--amber-primary)" />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Anti-Fraud: Manual Bank Transfer Verification Queue
            </h4>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
            Prevents fake bank credit SMS and screenshot scams. Waiters log the transfer claim, which must be verified against Osieka resort bank accounts before orders are released.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                setTransferPending(true);
                setTransferVerified(false);
              }}
              className="btn-secondary"
              style={{ fontSize: '0.8rem' }}
            >
              Simulate Guest Transfer (₦35,000 via GTBank)
            </button>

            {transferPending && !transferVerified && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-dirty">Awaiting Cashier Verification</span>
                <button
                  onClick={() => {
                    setTransferVerified(true);
                    setTransferPending(false);
                  }}
                  className="btn-primary"
                  style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                >
                  Cashier Verify & Release
                </button>
              </div>
            )}

            {transferVerified && (
              <span className="badge badge-clean">
                <CheckCircle2 size={12} /> Verified by Fatima Sanusi (Funds Confirmed)
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Right: Active Ticket / Cart Drawer with Editable Unit Prices */}
      <div className="ent-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: 'fit-content', backgroundColor: '#FFFFFF' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Active Order Ticket
            </h3>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Server: <strong style={{ color: 'var(--text-primary)' }}>{activeStaff.name}</strong>
            </div>
          </div>
          <span className="badge badge-brand">KOT Firing</span>
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
          maxHeight: '320px',
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
                        onChange={(e) => updateItemPrice(item.id, Number(e.target.value))}
                        style={{
                          width: '95px',
                          padding: '3px 6px',
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          backgroundColor: '#FFFFFF',
                          borderRadius: '4px',
                          border: isBelowFloor ? '1px solid var(--crimson-primary)' : '1px solid var(--border-color)',
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
              onClick={handleChargeToRoom}
              disabled={cart.length === 0}
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
              }}
              disabled={cart.length === 0}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '0.9rem', fontWeight: 800, backgroundColor: 'var(--emerald-primary)' }}
            >
              <Banknote size={16} /> Settle Bill Direct ({formatNaira(total)})
            </button>
          )}

          <button
            onClick={() => setCart([])}
            disabled={cart.length === 0}
            className="btn-secondary"
            style={{ width: '100%', padding: '8px', fontSize: '0.8rem' }}
          >
            Clear Ticket
          </button>
        </div>

      </div>

    </div>
  );
}
