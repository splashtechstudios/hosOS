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
      'solar.log', 'solar.powersaver_toggle', 'diesel.log', 'audit.stamp',
      'daily.submit', 'daily.audit_update', 'sidebar.toggle', 'database.clear', 'rbac.manage'
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
      'maintenance.raise', 'solar.log', 'solar.powersaver_toggle', 'daily.submit'
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
      'solar.log', 'solar.powersaver_toggle', 'diesel.log', 'audit.stamp',
      'daily.submit', 'daily.audit_update', 'sidebar.toggle', 'rbac.manage'
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
      'solar.log', 'solar.powersaver_toggle', 'diesel.log', 'daily.submit'
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

// Enterprise CRM Guest Profiles
export const INITIAL_GUEST_PROFILES: GuestProfile[] = [
  {
    id: 'crm-gst-01',
    fullName: 'Dr. Adeleke Bello',
    email: 'dr.bello@lagosmed.ng',
    phone: '+234 803 492 8810',
    nationalIdOrPassport: 'NIN-94829410948',
    loyaltyTier: 'PLATINUM_VIP',
    loyaltyPoints: 14200,
    totalLifetimeSpend: 4850000,
    totalStaysCount: 8,
    totalDiningOrdersCount: 32,
    roomPreferences: ['Ocean View High Floor', 'Feather Pillows', 'Room Temperature 21°C'],
    dietaryRestrictions: ['No Shellfish', 'Prefers Decaf Coffee'],
    corporateCompanyId: 'corp-01',
    corporateCompanyName: 'Chevron Nigeria Ltd',
    whatsappOptIn: true,
    notes: 'Chairman of West Africa Surgeons College. VIP treatment mandatory. Always requests fruit platter upon arrival.',
    lastVisitDate: '2026-10-15',
    createdAt: '2025-06-12T10:00:00Z',
  },
  {
    id: 'crm-gst-02',
    fullName: 'Chief Adeyemi Thomas',
    email: 'chief.thomas@thomasgroup.com',
    phone: '+234 802 331 4400',
    nationalIdOrPassport: 'PASS-A09481924',
    loyaltyTier: 'GOLD',
    loyaltyPoints: 8900,
    totalLifetimeSpend: 2950000,
    totalStaysCount: 5,
    totalDiningOrdersCount: 18,
    roomPreferences: ['Terrace Access', 'King Size Bed'],
    dietaryRestrictions: ['Spicy Food Lover', 'Cognac Connoisseur'],
    corporateCompanyId: 'corp-02',
    corporateCompanyName: 'Zenith Bank PLC',
    whatsappOptIn: true,
    notes: 'Regular weekend guest. Frequently hosts 6-8 guests at Main Bar.',
    lastVisitDate: '2026-10-14',
    createdAt: '2025-08-20T14:30:00Z',
  },
  {
    id: 'crm-gst-03',
    fullName: 'Senator N. Kalu',
    email: 'senator.kalu@nass.gov.ng',
    phone: '+234 809 111 8800',
    nationalIdOrPassport: 'DIPLO-D984210',
    loyaltyTier: 'PLATINUM_VIP',
    loyaltyPoints: 31000,
    totalLifetimeSpend: 11200000,
    totalStaysCount: 12,
    totalDiningOrdersCount: 54,
    roomPreferences: ['Presidential Penthouse Suite Only', 'Private Security Detail Room Adjoining'],
    dietaryRestrictions: ['Strictly Halal', 'Fresh Coconut Water Daily'],
    whatsappOptIn: false,
    notes: 'High security protocol. Requires discrete check-in via Executive Elevator. Folio billed to corporate account.',
    lastVisitDate: '2026-10-15',
    createdAt: '2024-11-05T09:00:00Z',
  },
];

// Enterprise Corporate Deals & Events Pipeline
export const INITIAL_CORPORATE_DEALS: CorporateDeal[] = [
  {
    id: 'deal-01',
    dealTitle: 'Chevron Annual Leadership Strategy Summit 2026',
    companyName: 'Chevron Nigeria Ltd',
    contactPerson: 'Mrs. Folashade Alabi (VP HR)',
    contactEmail: 'falabi@chevron.com',
    contactPhone: '+234 803 555 1234',
    dealValue: 18500000,
    depositPaid: 10000000,
    balanceDue: 8500000,
    stage: 'CONTRACT_QUOTED',
    hallOrLawn: 'Grand Marina Banquet Hall',
    roomsBlocked: 18,
    eventDate: '2026-11-12 to 2026-11-15',
    assignedAccountManager: 'Mary Okon (Front Office Lead)',
    createdAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 'deal-02',
    dealTitle: 'Zenith Bank PLC Executive FinTech Gala Dinner',
    companyName: 'Zenith Bank PLC',
    contactPerson: 'Mr. Kelechi Nwosu (Head of Brand)',
    contactEmail: 'knwosu@zenithbank.com',
    contactPhone: '+234 802 888 9900',
    dealValue: 7200000,
    depositPaid: 7200000,
    balanceDue: 0,
    stage: 'DEPOSIT_PAID',
    hallOrLawn: 'Palms Oceanfront Lawn',
    roomsBlocked: 6,
    eventDate: '2026-10-28',
    assignedAccountManager: 'Alhaji Ibrahim Danjuma (GM)',
    createdAt: '2026-09-18T14:00:00Z',
  },
  {
    id: 'deal-03',
    dealTitle: 'Dangote Regional Distributors Conference',
    companyName: 'Dangote Industries Ltd',
    contactPerson: 'Alhaji Sani Bello (Commercial Director)',
    contactEmail: 'sbello@dangote.com',
    contactPhone: '+234 803 777 6655',
    dealValue: 24500000,
    depositPaid: 5000000,
    balanceDue: 19500000,
    stage: 'SITE_INSPECTION',
    hallOrLawn: 'Grand Ballroom & Conference Suites A-C',
    roomsBlocked: 30,
    eventDate: '2026-12-05',
    assignedAccountManager: 'Alhaji Ibrahim Danjuma (GM)',
    createdAt: '2026-10-08T11:00:00Z',
  },
];

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

export const INITIAL_ROOMS: Room[] = OSIEKA_BLOCKS.flatMap(({ block, floor, defaultTier }, bIdx) =>
  [1, 2].map((roomIdx) => {
    const roomNumber = `${block} Room ${roomIdx}`;
    const isVip = defaultTier === 'VIP';
    const slug = roomNumber.toLowerCase().replace(/\s+/g, '-');

    // Give a few rooms realistic live statuses while keeping most VACANT_CLEAN
    let status: Room['status'] = 'VACANT_CLEAN';
    let currentGuestName: string | undefined;
    let currentReservationId: string | undefined;
    let currentFolioId: string | undefined;

    if (roomNumber === 'Block A1 Room 1') {
      status = 'OCCUPIED';
      currentGuestName = 'Chief Adeyemi Thomas';
      currentReservationId = 'RES-A1R1-98';
      currentFolioId = 'FOL-A1R1-12';
    } else if (roomNumber === 'Block A2 Room 2') {
      status = 'OCCUPIED';
      currentGuestName = 'Dr. Adeleke Bello';
      currentReservationId = 'RES-A2R2-77';
      currentFolioId = 'FOL-A2R2-89';
    } else if (roomNumber === 'Block B1 Room 2') {
      status = 'VACANT_DIRTY';
    } else if (roomNumber === 'Block C4 Room 2') {
      status = 'MAINTENANCE';
    }

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
      status,
      currentGuestName,
      currentReservationId,
      currentFolioId,
      lastCleanedAt: '2026-10-29T10:30:00Z',
      lastCleanedByStaffName: 'Blessing Eze',
      amenities: isVip ? [...VIP_SUITE_AMENITIES] : [...STANDARD_ROOM_AMENITIES],
      occupancyHistory: [],
    };
  })
);

// Room 204 Comprehensive 360° Timeline Activity Feed
export const ROOM_204_TIMELINE: RoomTimelineItem[] = [
  {
    id: 'tl-01',
    timestamp: '2026-10-15T14:10:00Z',
    category: 'OCCUPANCY',
    headline: 'Guest Check-In & Room Occupancy Activated',
    details: 'Status transitioned from VACANT CLEAN to OCCUPIED. Folio #FOL-204-89 opened with ₦200,000 credit limit. Keycard KC-204-A programmed.',
    actor: {
      staffId: 'staff-02',
      staffName: 'Mary Okon',
      role: 'FRONT_DESK',
    },
    meta: {
      receiptNumber: 'FOL-204-89',
    },
  },
  {
    id: 'tl-02',
    timestamp: '2026-10-15T14:15:00Z',
    category: 'PAYMENT',
    headline: 'Cash Deposit Received & Credited to Room Folio',
    details: 'Initial stay cash deposit of ₦50,000 received at Front Desk Till-A. Physical notes counted and verified with UV currency detector.',
    amount: 50000,
    actor: {
      staffId: 'staff-04',
      staffName: 'Fatima Sanusi',
      role: 'CASHIER',
    },
    meta: {
      receiptNumber: 'RCT-2026-9932',
    },
  },
  {
    id: 'tl-03',
    timestamp: '2026-10-15T14:45:00Z',
    category: 'ORDER',
    headline: 'Room Service Order Placed (KOT #KOT-044)',
    details: 'Items: 1x Grilled Croaker Fish & Yam Chips @ ₦14,500, 1x Osieka Chapman Cocktail @ ₦3,800. Fired to Kitchen and Main Bar.',
    amount: 18300,
    actor: {
      staffId: 'staff-03',
      staffName: 'Chidi Obi',
      role: 'WAITER',
    },
    meta: {
      orderNumber: 'RS-2026-0044',
      items: [
        { name: 'Grilled Croaker Fish & Yam Chips', quantity: 1, unitPrice: 14500 },
        { name: 'Osieka Chapman Cocktail', quantity: 1, unitPrice: 3800 },
      ],
    },
  },
  {
    id: 'tl-04',
    timestamp: '2026-10-15T15:15:00Z',
    category: 'ORDER_INCREMENT',
    headline: 'Order Increment Logged (+2x Heineken Beer)',
    details: 'Guest phoned room service requesting additional chilled drinks. Waiter added 2x Heineken Draught @ ₦2,500 each (+₦5,000). Total updated from ₦18,300 to ₦23,300.',
    amount: 5000,
    actor: {
      staffId: 'staff-03',
      staffName: 'Chidi Obi',
      role: 'WAITER',
    },
    meta: {
      orderNumber: 'RS-2026-0044',
      priceSnapshot: 2500,
      items: [{ name: 'Heineken Draught (Cold)', quantity: 2, unitPrice: 2500 }],
    },
  },
  {
    id: 'tl-05',
    timestamp: '2026-10-15T15:40:00Z',
    category: 'MAINTENANCE',
    headline: 'Maintenance Ticket Raised (#MNT-2026-0109)',
    details: 'Issue: "Balcony AC outdoor condensation unit dripping water onto tiled patio floor". Priority: HIGH. Room marked for quick turnaround inspection.',
    actor: {
      staffId: 'staff-06',
      staffName: 'Blessing Eze',
      role: 'HOUSEKEEPING',
    },
    meta: {
      ticketNumber: 'MNT-2026-0109',
    },
  },
  {
    id: 'tl-06',
    timestamp: '2026-10-15T16:30:00Z',
    category: 'MAINTENANCE',
    headline: 'Maintenance Repair Completed & Inspected',
    details: 'Technician cleared drain line and replaced rubber gasket. Consumed: 1x 1/2-inch Gasket (Part #GSK-55) from Maintenance Store. Parts Cost: ₦3,200. Tested under full load.',
    amount: 3200,
    actor: {
      staffId: 'staff-05',
      staffName: 'Engr. Tunde Bakare',
      role: 'MAINTENANCE',
    },
    meta: {
      ticketNumber: 'MNT-2026-0109',
    },
  },
  {
    id: 'tl-07',
    timestamp: '2026-10-15T17:00:00Z',
    category: 'PAYMENT',
    headline: 'POS Card Payment Received for Extras',
    details: 'Guest walked to Front Desk and settled interim charges of ₦25,000 via Stanbic IBTC POS Terminal #STANBIC-02. Transaction Auth Code #884920 verified.',
    amount: 25000,
    actor: {
      staffId: 'staff-02',
      staffName: 'Mary Okon',
      role: 'FRONT_DESK',
    },
    meta: {
      receiptNumber: 'POS-TX-884920',
    },
  },
  {
    id: 'tl-08',
    timestamp: '2026-10-15T17:35:00Z',
    category: 'ORDER_INCREMENT',
    headline: 'Evening Bar Order Placed (+3x Pepper Soup & 2x Hennessy Tots)',
    details: 'Main Bar tab charged directly to Room 204 folio. 3x Spicy Goat Meat Pepper Soup @ ₦7,500 (₦22,500), 2x Hennessy VSOP 50ml Tots @ ₦6,500 (₦13,000). Total: ₦35,500.',
    amount: 35500,
    actor: {
      staffId: 'staff-03',
      staffName: 'Chidi Obi',
      role: 'WAITER',
    },
    meta: {
      orderNumber: 'BAR-2026-0112',
      items: [
        { name: 'Spicy Goat Meat Pepper Soup', quantity: 3, unitPrice: 7500 },
        { name: 'Hennessy VSOP (50ml Tot)', quantity: 2, unitPrice: 6500 },
      ],
    },
  },
];

export const ROOM_204_CONSUMPTION_STATS = [
  {
    id: 'item-01',
    itemName: 'Grilled Croaker Fish & Yam Chips',
    category: 'KITCHEN_FOOD',
    totalQuantity: 2,
    unitPriceCharged: 14500,
    totalSpent: 29000,
    lastOrderedAt: '2026-10-15T14:45:00Z',
    orderedByStaff: 'Chidi Obi (Waiter #03)',
  },
  {
    id: 'item-02',
    itemName: 'Spicy Goat Meat Pepper Soup',
    category: 'KITCHEN_FOOD',
    totalQuantity: 3,
    unitPriceCharged: 7500,
    totalSpent: 22500,
    lastOrderedAt: '2026-10-15T17:35:00Z',
    orderedByStaff: 'Chidi Obi (Waiter #03)',
  },
  {
    id: 'item-03',
    itemName: 'Osieka Chapman Cocktail',
    category: 'BAR_BEVERAGE',
    totalQuantity: 4,
    unitPriceCharged: 3800,
    totalSpent: 15200,
    lastOrderedAt: '2026-10-15T16:10:00Z',
    orderedByStaff: 'Chidi Obi (Waiter #03)',
  },
  {
    id: 'item-04',
    itemName: 'Heineken Draught (Cold)',
    category: 'BAR_BEVERAGE',
    totalQuantity: 6,
    unitPriceCharged: 2500,
    totalSpent: 15000,
    lastOrderedAt: '2026-10-15T15:15:00Z',
    orderedByStaff: 'Chidi Obi (Waiter #03)',
  },
  {
    id: 'item-05',
    itemName: 'Hennessy VSOP (50ml Tot)',
    category: 'BAR_BEVERAGE',
    totalQuantity: 2,
    unitPriceCharged: 6500,
    totalSpent: 13000,
    lastOrderedAt: '2026-10-15T17:35:00Z',
    orderedByStaff: 'Chidi Obi (Waiter #03)',
  },
];

export const INITIAL_MAINTENANCE_TICKETS: MaintenanceTicket[] = [
  {
    id: 'mnt-2026-0109',
    ticketNumber: 'MNT-2026-0109',
    roomNumber: '204',
    assetName: 'LG Dual Inverter 1.5HP AC (Balcony)',
    priority: 'HIGH',
    category: 'HVAC_AIR_CONDITIONING',
    issueDescription: 'Balcony AC condensation line dripping water onto balcony tiles.',
    raisedAt: '2026-10-15T15:40:00Z',
    raisedByUserId: 'staff-06',
    raisedByName: 'Blessing Eze',
    raisedByRole: 'HOUSEKEEPING',
    status: 'CLOSED_VERIFIED',
    statusHistory: [],
    assignedTechnicianId: 'staff-05',
    assignedTechnicianName: 'Engr. Tunde Bakare',
    repairDetails: 'Replaced cracked rubber gasket and re-sealed drain clamp.',
    partsConsumed: [
      {
        inventoryItemId: 'inv-gsk-55',
        partName: '1/2-Inch Heavy Rubber Gasket',
        quantity: 1,
        unitCost: 3200,
        totalCost: 3200,
      },
    ],
    totalRepairCost: 3200,
    resolvedAt: '2026-10-15T16:30:00Z',
    verifiedAt: '2026-10-15T16:45:00Z',
    verifiedByUserId: 'staff-06',
    verifiedByName: 'Blessing Eze',
  },
];

export const INITIAL_GENERATOR_LOGS: GeneratorRunLog[] = [
  {
    id: 'gen-log-01',
    generatorId: 'GEN-250KVA-PERKINS',
    date: '2026-10-15',
    startTime: '2026-10-15T10:00:00Z',
    stopTime: '2026-10-15T18:00:00Z',
    durationHours: 8.0,
    meterStart: 4210.5,
    meterEnd: 4218.5,
    dieselAddedLitres: 220,
    fuelCostPerLitre: 1350,
    burnRateLitresPerHour: 27.5,
    isAnomaly: false,
    powerSourceTransition: 'GENERATOR_PRIMARY',
    loggedByUserId: 'staff-05',
    loggedByName: 'Engr. Tunde Bakare',
    notes: 'Resort main load at 65%. Burn rate matches Perkins benchmark.',
  },
];
