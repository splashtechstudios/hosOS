import {
  StaffUser,
  Room,
  MaintenanceTicket,
  GeneratorRunLog,
  RoomTimelineItem,
  GuestProfile,
  CorporateDeal,
  StaffOnboardingRecord,
  RoleRBACDefinition,
  UserRole
} from '@hosos/types';

export const ENTERPRISE_ORG = {
  name: 'Osieka Luxury Resort & Convention Centre',
  legalEntity: 'Osieka Hospitality & Leisure Group Ltd',
  registrationNumber: 'RC-1849204',
  location: 'No. 3, Resort Close, Aiyeromi Quarters, Ogori, Kogi State, Nigeria',
  currency: 'NGN (₦)',
  taxId: 'TIN-09482941-0001',
  departments: [
    { id: 'EXECUTIVE', name: 'Executive Suite', head: 'Engnr Omole (Executive Super Admin)' },
    { id: 'ROOMS_DIVISION', name: 'Rooms Division & Operations', head: 'Ahmed Manager (Operations Manager)' },
    { id: 'FOOD_AND_BEVERAGE', name: 'Food & Beverage Outlets', head: 'Ahmed Manager (Operations Manager)' },
    { id: 'ACCOUNTS_FINANCE', name: 'Finance, Audit & Loss Prevention', head: 'Victoria Omole (Financial Controller & Auditor)' },
    { id: 'MAINTENANCE_ENGINEERING', name: 'Engineering & 100% Solar Facilities', head: 'Solar & Microgrid Team' },
  ],
};

export const INITIAL_STAFF: StaffUser[] = [
  {
    id: 'staff-01',
    name: 'Engnr Omole',
    email: 'admin@osiekaresort.ng',
    role: 'SUPERADMIN',
    pinCodeHash: '1001',
    department: 'EXECUTIVE',
    isActive: true,
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'staff-02',
    name: 'Ahmed Manager',
    email: 'manager@osiekaresort.ng',
    role: 'MANAGER',
    pinCodeHash: '2002',
    department: 'OPERATIONS',
    isActive: true,
    createdAt: '2026-02-01T08:00:00Z',
  },
  {
    id: 'staff-03',
    name: 'Victoria Omole',
    email: 'accountant@osiekaresort.ng',
    role: 'ACCOUNTANT',
    pinCodeHash: '9009',
    department: 'FINANCE_AUDIT',
    isActive: true,
    createdAt: '2026-02-15T08:00:00Z',
  },
];

// Enterprise RBAC Matrix Definitions
// Enterprise RBAC Matrix Definitions
export const RBAC_ROLE_DEFINITIONS: RoleRBACDefinition[] = [
  {
    role: 'SUPERADMIN',
    displayName: 'Executive Super Admin & Owner',
    department: 'EXECUTIVE',
    description: 'Master governance. Full unconstrained visibility, privilege matrix controls, pricing thresholds, and executive audits.',
    isEnabled: true,
    hasSidebar: true,
    dataScope: 'ALL_RESORT_DATA',
    allowedViews: [
      'dashboard', 'daily-operations', 'accountant-audit', 'front-desk', 'room-audit',
      'pos', 'halls-services', 'facilities-generators', 'night-audit', 'loss-prevention', 'onboarding-directory', 'rbac-matrix'
    ],
    permissions: [
      // Rooms
      'rooms.audit.view', 'rooms.status.override', 'rooms.checkin', 'rooms.checkout',
      'rooms.customize', 'rooms.create', 'rooms.manage_amenities', 'rooms.delete',
      // Reservations
      'reservations.view', 'reservations.create', 'reservations.followup',
      'reservations.confirm_payment', 'reservations.cancel',
      // Kitchen & Food Menu
      'orders.create', 'orders.increment', 'orders.remove_cart_item',
      'menu.food.create', 'menu.food.edit',
      // Note: 'menu.food.delete' and 'menu.drink.delete' can be toggled ON/OFF individually in RBAC Matrix
      // Bar & Drink Menu
      'orders.bar.create', 'menu.drink.create', 'menu.drink.edit',
      // POS Billing & Pricing
      'menu.manage', 'prices.override', 'discounts.approve', 'voids.execute',
      'cash.receive', 'orders.charge_room', 'payment.split',
      // Halls & Venues
      'halls.book', 'halls.checkin', 'halls.checkout', 'halls.mark_clean',
      'halls.manage', 'halls.create', 'halls.edit', 'halls.delete',
      // Ancillary Services
      'services.order', 'services.status_update', 'services.manage', 'services.create', 'services.edit', 'services.delete',
      // Finance, Solar & Governance
      'maintenance.raise', 'maintenance.signoff', 'reports.export',
      'users.onboard', 'users.manage', 'users.delete',
      'crm.manage', 'crm.create_guest', 'crm.create_deal',
      'solar.log', 'solar.powersaver_toggle', 'diesel.log', 'expenses.record', 'audit.stamp',
      'daily.submit', 'daily.audit_update', 'sidebar.toggle', 'settings.manage', 'database.clear', 'rbac.manage'
    ],
  },
  {
    role: 'MANAGER',
    displayName: 'Resort Operations Manager',
    department: 'EXECUTIVE',
    description: 'Daily operational management, room check-in oversight, menu additions (no deletion), and single-screen daily closing submission.',
    isEnabled: true,
    hasSidebar: false,
    dataScope: 'ALL_RESORT_DATA',
    allowedViews: ['daily-operations', 'front-desk', 'room-audit', 'pos', 'halls-services'],
    permissions: [
      'rooms.audit.view', 'rooms.status.override', 'rooms.checkin', 'rooms.checkout',
      'reservations.view', 'reservations.create', 'reservations.followup', 'reservations.confirm_payment',
      'halls.book', 'halls.checkin', 'halls.checkout', 'halls.mark_clean',
      'orders.create', 'orders.bar.create', 'orders.increment', 'orders.remove_cart_item',
      'orders.charge_room', 'cash.receive', 'payment.split',
      'menu.food.create', 'menu.food.edit', 'menu.drink.create', 'menu.drink.edit', 'menu.manage',
      'services.order', 'services.status_update',
      'maintenance.raise', 'solar.log', 'solar.powersaver_toggle', 'expenses.record', 'settings.manage', 'daily.submit'
    ],
  },
  {
    role: 'ACCOUNTANT',
    displayName: 'Financial Controller & Auditor',
    department: 'ACCOUNTS_FINANCE',
    description: 'Super-admin read-only inspection, 3-way reconciliation, variance detection, price floor setting, and tax export.',
    isEnabled: true,
    hasSidebar: true,
    dataScope: 'ALL_RESORT_DATA',
    allowedViews: ['accountant-audit', 'dashboard', 'night-audit', 'loss-prevention', 'room-audit'],
    permissions: [
      'rooms.audit.view', 'reservations.view', 'reports.export', 'audit.stamp', 'daily.audit_update', 'prices.override'
    ],
  },
  {
    role: 'OWNER',
    displayName: 'Executive Owner / Board',
    department: 'EXECUTIVE',
    description: 'Full unconstrained visibility into every department, profit & loss, loss prevention, and executive audits.',
    isEnabled: true,
    hasSidebar: true,
    dataScope: 'ALL_RESORT_DATA',
    allowedViews: [
      'dashboard', 'daily-operations', 'accountant-audit', 'front-desk', 'room-audit',
      'pos', 'halls-services', 'facilities-generators', 'night-audit', 'loss-prevention', 'onboarding-directory', 'rbac-matrix'
    ],
    permissions: [
      'rooms.audit.view', 'rooms.status.override', 'rooms.checkin', 'rooms.checkout',
      'rooms.customize', 'rooms.create', 'rooms.manage_amenities',
      'reservations.view', 'reservations.create', 'reservations.followup', 'reservations.confirm_payment', 'reservations.cancel',
      'halls.book', 'halls.checkin', 'halls.checkout', 'halls.mark_clean', 'halls.manage', 'halls.create', 'halls.edit',
      'orders.create', 'orders.bar.create', 'orders.increment', 'orders.remove_cart_item',
      'menu.food.create', 'menu.food.edit', 'menu.drink.create', 'menu.drink.edit', 'menu.manage',
      'discounts.approve', 'voids.execute', 'cash.receive', 'orders.charge_room', 'payment.split',
      'services.order', 'services.status_update', 'services.manage', 'services.create', 'services.edit',
      'maintenance.raise', 'maintenance.signoff', 'reports.export',
      'users.onboard', 'users.manage', 'crm.manage', 'crm.create_guest', 'crm.create_deal',
      'solar.log', 'solar.powersaver_toggle', 'diesel.log', 'expenses.record', 'audit.stamp',
      'daily.submit', 'daily.audit_update', 'sidebar.toggle', 'settings.manage', 'rbac.manage'
    ],
  },
  {
    role: 'GENERAL_MANAGER',
    displayName: 'General Manager (Operations)',
    department: 'EXECUTIVE',
    description: 'Total operational control across rooms division, F&B outlets, store requisitions, and daily flash sign-offs.',
    isEnabled: true,
    hasSidebar: true,
    dataScope: 'ALL_RESORT_DATA',
    allowedViews: [
      'dashboard', 'daily-operations', 'accountant-audit', 'front-desk', 'room-audit',
      'pos', 'halls-services', 'facilities-generators', 'night-audit', 'loss-prevention', 'onboarding-directory', 'rbac-matrix'
    ],
    permissions: [
      'rooms.audit.view', 'rooms.status.override', 'rooms.checkin', 'rooms.checkout',
      'rooms.customize', 'rooms.create', 'rooms.manage_amenities',
      'reservations.view', 'reservations.create', 'reservations.followup', 'reservations.confirm_payment', 'reservations.cancel',
      'halls.book', 'halls.checkin', 'halls.checkout', 'halls.mark_clean', 'halls.manage', 'halls.create', 'halls.edit',
      'orders.create', 'orders.bar.create', 'orders.increment', 'orders.remove_cart_item',
      'menu.food.create', 'menu.food.edit', 'menu.drink.create', 'menu.drink.edit', 'menu.manage',
      'discounts.approve', 'voids.execute', 'cash.receive', 'orders.charge_room', 'payment.split',
      'services.order', 'services.status_update', 'services.manage', 'services.create', 'services.edit',
      'maintenance.raise', 'maintenance.signoff', 'reports.export',
      'users.onboard', 'users.manage', 'crm.manage', 'crm.create_guest', 'crm.create_deal',
      'solar.log', 'solar.powersaver_toggle', 'diesel.log', 'expenses.record', 'settings.manage', 'daily.submit'
    ],
  },
  {
    role: 'FRONT_DESK',
    displayName: 'Front Desk Lead / Agent',
    department: 'ROOMS_DIVISION',
    description: 'Guest check-in, keycard issuance, folio management, room moves, and cash deposit collection.',
    isEnabled: true,
    hasSidebar: false,
    dataScope: 'RESTRICTED_SHIFT_DATA',
    allowedViews: ['daily-operations', 'front-desk', 'room-audit', 'pos', 'halls-services'],
    permissions: [
      'rooms.audit.view', 'rooms.status.override', 'rooms.checkin', 'rooms.checkout',
      'reservations.view', 'reservations.create', 'reservations.followup', 'reservations.confirm_payment',
      'halls.book', 'halls.checkin', 'halls.checkout', 'halls.mark_clean',
      'orders.create', 'orders.bar.create', 'orders.increment', 'orders.charge_room',
      'services.order', 'services.status_update',
      'cash.receive', 'payment.split', 'maintenance.raise', 'crm.manage', 'crm.create_guest'
    ],
  },
  {
    role: 'CASHIER',
    displayName: 'Central Cashier & Audit Officer',
    department: 'ACCOUNTS_FINANCE',
    description: 'Cash drawer balancing, POS card settlement, bank transfer verification, and folio closure.',
    isEnabled: true,
    hasSidebar: false,
    dataScope: 'RESTRICTED_SHIFT_DATA',
    allowedViews: ['daily-operations', 'pos', 'room-audit', 'dashboard'],
    permissions: [
      'rooms.audit.view', 'reservations.view', 'reservations.confirm_payment',
      'cash.receive', 'orders.charge_room', 'payment.split', 'reports.export'
    ],
  },
  {
    role: 'WAITER',
    displayName: 'F&B Food & Beverage Waiter',
    department: 'FOOD_AND_BEVERAGE',
    description: 'Table order taking, room service delivery, and order increments with PIN authentication.',
    isEnabled: true,
    hasSidebar: false,
    dataScope: 'RESTRICTED_SHIFT_DATA',
    allowedViews: ['pos'],
    permissions: [
      'orders.create', 'orders.bar.create', 'orders.increment', 'orders.remove_cart_item', 'orders.charge_room'
    ],
  },
  {
    role: 'BARTENDER',
    displayName: 'Mixologist / Bar Cashier',
    department: 'FOOD_AND_BEVERAGE',
    description: 'Cocktail dispensing, spirit tot decrement, bar tabs, and shift tot dipstick counts.',
    isEnabled: true,
    hasSidebar: false,
    dataScope: 'RESTRICTED_SHIFT_DATA',
    allowedViews: ['pos'],
    permissions: [
      'orders.bar.create', 'orders.increment', 'orders.remove_cart_item', 'orders.charge_room', 'cash.receive'
    ],
  },
  {
    role: 'CHEF',
    displayName: 'Executive Chef / Station Cook',
    department: 'FOOD_AND_BEVERAGE',
    description: 'Kitchen Display System (KDS), food preparation dispatch, and recipe ingredient reconciliation.',
    isEnabled: true,
    hasSidebar: false,
    dataScope: 'RESTRICTED_SHIFT_DATA',
    allowedViews: ['pos'],
    permissions: [
      'orders.create', 'menu.food.edit'
    ],
  },
  {
    role: 'HOUSEKEEPING',
    displayName: 'Housekeeping Lead / Attendant',
    department: 'ROOMS_DIVISION',
    description: 'Daily cleaning boards, room inspection checklists, lost & found, and maintenance ticket raising.',
    isEnabled: true,
    hasSidebar: false,
    dataScope: 'RESTRICTED_SHIFT_DATA',
    allowedViews: ['front-desk', 'room-audit'],
    permissions: [
      'rooms.audit.view', 'rooms.status.override', 'halls.mark_clean', 'services.status_update', 'maintenance.raise'
    ],
  },
  {
    role: 'MAINTENANCE',
    displayName: 'Solar Microgrid & Facilities Engineer',
    department: 'MAINTENANCE_ENGINEERING',
    description: 'Solar PV array monitoring, BESS battery bank state of charge, power saver mode, and inverter maintenance.',
    isEnabled: true,
    hasSidebar: false,
    dataScope: 'RESTRICTED_SHIFT_DATA',
    allowedViews: ['facilities-generators', 'room-audit'],
    permissions: [
      'maintenance.raise', 'maintenance.signoff', 'solar.log', 'solar.powersaver_toggle', 'diesel.log'
    ],
  },
  {
    role: 'STOREKEEPER',
    displayName: 'Central Storekeeper',
    department: 'FOOD_AND_BEVERAGE',
    description: 'GRN inspection, bulk consumables discharge, inter-store requisitions, and shrinkage reporting.',
    isEnabled: true,
    hasSidebar: false,
    dataScope: 'RESTRICTED_SHIFT_DATA',
    allowedViews: ['daily-operations'],
    permissions: [
      'reports.export'
    ],
  },
];

// Enterprise CRM Guest Profiles (Point Zero Baseline)
export const INITIAL_GUEST_PROFILES: GuestProfile[] = [];

// Enterprise Corporate Deals & Events Pipeline (Point Zero Baseline)
export const INITIAL_CORPORATE_DEALS: CorporateDeal[] = [];

// Enterprise Staff Onboarding Pipeline Records
export const INITIAL_STAFF_ONBOARDING: StaffOnboardingRecord[] = [
  {
    id: 'onb-01',
    staffId: 'staff-01',
    fullName: 'Engnr Omole',
    email: 'admin@osiekaresort.ng',
    phoneNumber: '+234 916 262 2433',
    ninOrIdNumber: 'NIN-10000000001',
    department: 'EXECUTIVE',
    designation: 'Managing Director & Super Admin',
    roleAssigned: 'SUPERADMIN',
    salaryTier: 'Executive Board & Super Admin',
    bankName: 'Zenith Bank PLC',
    bankAccountNumber: '1002948291',
    onboardingStatus: 'ACTIVE_CONFIRMED',
    posQuickPinIssued: '1001',
    onboardedByStaffName: 'Board of Directors',
    onboardedByUserId: 'system',
    createdAt: '2026-01-10T08:00:00Z',
    completedAt: '2026-01-10T12:00:00Z',
  },
  {
    id: 'onb-02',
    staffId: 'staff-02',
    fullName: 'Ahmed Manager',
    email: 'manager@osiekaresort.ng',
    phoneNumber: '+234 803 222 5544',
    ninOrIdNumber: 'NIN-20000000002',
    department: 'EXECUTIVE',
    designation: 'General Operations Manager',
    roleAssigned: 'MANAGER',
    salaryTier: 'Resort Operations Manager',
    bankName: 'Access Bank PLC',
    bankAccountNumber: '0098492019',
    onboardingStatus: 'ACTIVE_CONFIRMED',
    posQuickPinIssued: '2002',
    onboardedByStaffName: 'Engnr Omole',
    onboardedByUserId: 'staff-01',
    createdAt: '2026-02-01T08:00:00Z',
    completedAt: '2026-02-01T14:00:00Z',
  },
  {
    id: 'onb-03',
    staffId: 'staff-03',
    fullName: 'Victoria Omole',
    email: 'accountant@osiekaresort.ng',
    phoneNumber: '+234 803 999 0011',
    ninOrIdNumber: 'NIN-90982910482',
    department: 'ACCOUNTS_FINANCE',
    designation: 'Financial Controller & Chief Auditor',
    roleAssigned: 'ACCOUNTANT',
    salaryTier: 'Financial Controller & Chief Auditor',
    bankName: 'Zenith Bank PLC',
    bankAccountNumber: '2093849102',
    onboardingStatus: 'ACTIVE_CONFIRMED',
    posQuickPinIssued: '9009',
    onboardedByStaffName: 'Engnr Omole',
    onboardedByUserId: 'staff-01',
    createdAt: '2026-02-15T08:00:00Z',
    completedAt: '2026-02-15T15:00:00Z',
  },
];

export const STANDARD_ROOM_DESCRIPTION =
  'Ideal for solo travelers and business guests. Features a plush double bed, 100% solar-powered inverter air conditioning, flat-screen satellite TV, and a serene private bathroom.';

export const STANDARD_ROOM_AMENITIES = [
  '100% Off-Grid Solar Power',
  'Solar Inverter AC',
  'Room Service',
  'En-Suite Bath',
  'Plush Double Bed',
  'Flat-Screen Satellite TV',
];

export const VIP_SUITE_DESCRIPTION =
  'Our most spacious suite tailored for couples, VIP guests, and weekend retreats. Includes executive king bedding, priority dining & bar room service, 100% solar inverter AC, and tranquil views.';

export const VIP_SUITE_AMENITIES = [
  'Spacious Executive Layout',
  '24/7 Off-Grid Solar AC & TV',
  'Priority VIP Concierge',
  'Luxury En-Suite',
  'Executive King Bedding',
  'Tranquil Views',
];

export interface RoomTierConfig {
  id: string;
  name: string;
  rate: number;
  description: string;
  features: string[];
  badgeColor: string;
  badgeBg: string;
}

export const HOSOS_ROOM_TIERS: RoomTierConfig[] = [
  {
    id: 'standard',
    name: 'Standard Room',
    rate: 10000,
    description: STANDARD_ROOM_DESCRIPTION,
    features: [...STANDARD_ROOM_AMENITIES],
    badgeColor: '#059669',
    badgeBg: '#ECFDF5',
  },
  {
    id: 'vip',
    name: 'Executive VIP Suite',
    rate: 15000,
    description: VIP_SUITE_DESCRIPTION,
    features: [...VIP_SUITE_AMENITIES],
    badgeColor: '#D97706',
    badgeBg: '#FFFBEB',
  },
  {
    id: 'royal',
    name: 'Royal Room',
    rate: 20000,
    description: 'Elevated comfort with expanded living space, premium entertainment, and serene garden view.',
    features: ['100% Off-Grid Solar Power', 'Solar Inverter AC', 'King Bed', 'Room Service', 'Luxury Shower'],
    badgeColor: '#2563EB',
    badgeBg: '#EFF6FF',
  },
  {
    id: 'villa',
    name: 'Villa Suite',
    rate: 35000,
    description: 'Exclusive luxury villa lodge with private terrace, executive lounge, and priority 24/7 concierge.',
    features: ['100% Off-Grid Solar Power', 'Solar Inverter AC', 'Private Balcony', 'Executive King Bed', 'Priority Concierge'],
    badgeColor: '#7C3AED',
    badgeBg: '#F5F3FF',
  },
];

// Compatibility alias
export const MMENKO_ROOM_TIERS = HOSOS_ROOM_TIERS;

const OSIEKA_BLOCKS = [
  { block: 'Block A1', floor: 1, defaultTier: 'VIP' as const },
  { block: 'Block A2', floor: 1, defaultTier: 'VIP' as const },
  { block: 'Block A3', floor: 1, defaultTier: 'VIP' as const },
  { block: 'Block B1', floor: 1, defaultTier: 'STANDARD' as const },
  { block: 'Block B2', floor: 1, defaultTier: 'STANDARD' as const },
  { block: 'Block B3', floor: 1, defaultTier: 'STANDARD' as const },
  { block: 'Block B4', floor: 1, defaultTier: 'STANDARD' as const },
  { block: 'Block C1', floor: 1, defaultTier: 'STANDARD' as const },
  { block: 'Block C2', floor: 1, defaultTier: 'STANDARD' as const },
  { block: 'Block C3', floor: 1, defaultTier: 'VIP' as const },
  { block: 'Block C4', floor: 1, defaultTier: 'VIP' as const },
];

export const INITIAL_ROOMS: Room[] = OSIEKA_BLOCKS.flatMap(({ block, floor, defaultTier }) =>
  [1, 2].map((roomIdx) => {
    const roomNumber = `${block} Room ${roomIdx}`;
    const isVip = defaultTier === 'VIP';
    const slug = roomNumber.toLowerCase().replace(/\s+/g, '-');

    return {
      id: `room-${slug}`,
      roomNumber,
      blockName: block,
      roomTypeId: isVip ? 'vip' : 'standard',
      roomTypeName: isVip ? 'Executive VIP Suite' : 'Standard Room',
      customName: isVip ? 'Executive VIP Suite' : 'Standard Room',
      description: isVip ? VIP_SUITE_DESCRIPTION : STANDARD_ROOM_DESCRIPTION,
      colorTag: isVip ? '#D97706' : '#059669',
      colorBg: isVip ? '#FFFBEB' : '#ECFDF5',
      floor,
      rackRatePerNight: isVip ? 15000 : 10000,
      status: 'VACANT_CLEAN' as const,
      currentGuestName: undefined,
      currentReservationId: undefined,
      currentFolioId: undefined,
      lastCleanedAt: new Date().toISOString(),
      lastCleanedByStaffName: 'Housekeeping Lead',
      amenities: isVip ? [...VIP_SUITE_AMENITIES] : [...STANDARD_ROOM_AMENITIES],
      occupancyHistory: [],
    };
  })
);

// Room Comprehensive 360° Timeline Activity Feed (Clean Baseline)
export const ROOM_204_TIMELINE: RoomTimelineItem[] = [];

export const ROOM_204_CONSUMPTION_STATS: any[] = [];

export const INITIAL_MAINTENANCE_TICKETS: MaintenanceTicket[] = [];

export const INITIAL_GENERATOR_LOGS: GeneratorRunLog[] = [];
