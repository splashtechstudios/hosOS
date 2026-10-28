// ==========================================
// HosOS Domain Type Definitions
// ==========================================

export type UserRole =
  | 'SUPERADMIN'
  | 'OWNER'
  | 'MANAGER'
  | 'GENERAL_MANAGER'
  | 'FRONT_DESK'
  | 'CASHIER'
  | 'WAITER'
  | 'BARTENDER'
  | 'CHEF'
  | 'HOUSEKEEPING'
  | 'MAINTENANCE'
  | 'ACCOUNTANT'
  | 'STOREKEEPER';

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  pinCodeHash?: string; // 4-digit quick auth PIN
  department: DepartmentType | 'FRONT_DESK' | 'F_AND_B' | 'HOUSEKEEPING' | 'MAINTENANCE' | 'MANAGEMENT' | 'FINANCE' | string;
  activeShiftId?: string;
  isActive: boolean;
  createdAt: string;
}

// ------------------------------------------
// Universal Immutable Audit Trail
// ------------------------------------------
export type AuditActionType =
  | 'ROOM_OCCUPANCY_CHANGED'
  | 'ORDER_CREATED'
  | 'ORDER_INCREMENTED'
  | 'ORDER_ITEM_VOIDED'
  | 'PRICE_OVERRIDE'
  | 'PAYMENT_RECEIVED'
  | 'MAINTENANCE_TICKET_RAISED'
  | 'MAINTENANCE_STATUS_UPDATED'
  | 'MAINTENANCE_REPAIR_COMPLETED'
  | 'STOCK_ADJUSTMENT'
  | 'DIESEL_LOGGED'
  | 'TRANSFER_VERIFIED';

export interface AuditActor {
  userId: string;
  staffName: string;
  role: UserRole;
  shiftId?: string;
}

export interface AuditTarget {
  entityType: 'Room' | 'POSOrder' | 'GuestFolio' | 'MaintenanceTicket' | 'InventoryItem' | 'GeneratorLog';
  entityId: string;
  identifierLabel: string; // e.g. "Room 204", "Order BAR-042", "Ticket #MNT-109"
}

export interface AuditDelta {
  beforeState?: Record<string, unknown>;
  afterState?: Record<string, unknown>;
  changeSummary: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string; // ISO string
  actor: AuditActor;
  actionType: AuditActionType;
  targetEntity: AuditTarget;
  delta: AuditDelta;
  deviceMetadata: {
    terminalId: string;
    ipAddress?: string;
    outlet?: string;
  };
  authorizedByManagerId?: string;
  reason?: string;
}

// ------------------------------------------
// Rooms & 360° Internal Room Audit
// ------------------------------------------
export type RoomStatus =
  | 'VACANT_CLEAN'
  | 'VACANT_DIRTY'
  | 'OCCUPIED'
  | 'OUT_OF_ORDER'
  | 'MAINTENANCE';

export interface RoomOccupancyTransition {
  transitionTime: string;
  previousStatus: RoomStatus;
  newStatus: RoomStatus;
  staffUserId: string;
  staffName: string;
  staffRole: UserRole;
  guestName?: string;
  reservationId?: string;
  folioId?: string;
  notes?: string;
}

export interface Room {
  id: string;
  roomNumber: string; // e.g. "101", "204"
  roomTypeId: string;
  roomTypeName: string; // "Standard", "Deluxe Ocean View", "Executive Suite"
  floor: number;
  rackRatePerNight: number;
  status: RoomStatus;
  customName?: string;
  colorTag?: string;
  colorBg?: string;
  amenities?: string[];
  currentGuestName?: string;
  currentReservationId?: string;
  currentFolioId?: string;
  activeMaintenanceTicketId?: string;
  lastCleanedAt?: string;
  lastCleanedByStaffName?: string;
  occupancyHistory: RoomOccupancyTransition[];
}

export interface RoomTimelineItem {
  id: string;
  timestamp: string;
  category: 'OCCUPANCY' | 'ORDER' | 'ORDER_INCREMENT' | 'MAINTENANCE' | 'PAYMENT' | 'SERVICE';
  headline: string;
  details: string;
  amount?: number;
  actor: {
    staffId: string;
    staffName: string;
    role: UserRole;
  };
  meta?: {
    orderNumber?: string;
    ticketNumber?: string;
    receiptNumber?: string;
    priceSnapshot?: number;
    items?: Array<{ name: string; quantity: number; unitPrice: number }>;
  };
}

// ------------------------------------------
// Point of Sale & Order Increments
// ------------------------------------------
export type POSOutlet = 'MAIN_RESTAURANT' | 'MAIN_BAR' | 'ROOM_SERVICE';

export type POSOrderStatus =
  | 'DRAFT'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'SERVED'
  | 'BILLED'
  | 'PAID'
  | 'VOIDED';

export interface POSOrderItem {
  itemLineId: string;
  itemId: string;
  name: string;
  quantity: number;
  unitPriceAtSale: number;
  subtotal: number;
  station: 'KITCHEN' | 'BAR';
  addedAt: string;
  addedByUserId: string;
  addedByName: string;
  voided?: boolean;
  voidReason?: string;
  voidedByUserId?: string;
}

export interface OrderIncrementLog {
  incrementId: string;
  timestamp: string;
  staffUserId: string;
  staffName: string;
  action: 'ITEM_ADDED' | 'QUANTITY_INCREASED' | 'ITEM_REMOVED' | 'PRICE_MODIFIED';
  itemAffected: string;
  quantityDelta: number;
  priceSnapshot: number;
  newOrderTotal: number;
  reason?: string;
}

export type BasePaymentMethod = 'POS_TERMINAL' | 'BANK_TRANSFER' | 'CASH';
export type PaymentMethod = BasePaymentMethod | 'ROOM_FOLIO' | 'SPLIT';

export interface SplitPaymentDetail {
  method: BasePaymentMethod;
  amount: number;
  reference?: string;
}

export interface PaymentSplit {
  paymentId: string;
  timestamp: string;
  method: PaymentMethod;
  amount: number;
  receivedByUserId: string;
  receivedByName: string;
  drawerId?: string;
  terminalRef?: string;
  transferVerificationId?: string;
}

export interface POSOrder {
  id: string;
  orderNumber: string;
  outlet: POSOutlet;
  tableNumber?: string;
  roomNumber?: string;
  guestFolioId?: string;
  status: POSOrderStatus;
  items: POSOrderItem[];
  incrementHistory: OrderIncrementLog[];
  subtotal: number;
  vatAmount: number; // 7.5%
  consumptionTax: number; // 5%
  serviceCharge: number; // 10%
  discountAmount: number;
  total: number;
  paymentDetails: {
    status: 'UNPAID' | 'PARTIAL' | 'PAID';
    splits: PaymentSplit[];
  };
  waiterId: string;
  waiterName: string;
  shiftId: string;
  createdAt: string;
  updatedAt: string;
}

// ------------------------------------------
// Maintenance & Asset Repair Lifecycle
// ------------------------------------------
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY_ROOM_DOWN';
export type TicketCategory = 'PLUMBING' | 'ELECTRICAL' | 'HVAC_AIR_CONDITIONING' | 'CARPENTRY' | 'ELECTRONICS';
export type TicketStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'PARTS_PENDING' | 'RESOLVED' | 'CLOSED_VERIFIED';

export interface MaintenanceStatusChange {
  timestamp: string;
  fromStatus: TicketStatus;
  toStatus: TicketStatus;
  updatedByUserId: string;
  updatedByName: string;
  notes?: string;
}

export interface PartConsumed {
  inventoryItemId: string;
  partName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface MaintenanceTicket {
  id: string;
  ticketNumber: string; // e.g. "MNT-2026-0109"
  roomNumber?: string;
  assetName: string; // e.g. "Daikin Inverter AC 1.5HP"
  priority: TicketPriority;
  category: TicketCategory;
  issueDescription: string;
  raisedAt: string;
  raisedByUserId: string;
  raisedByName: string;
  raisedByRole: UserRole;
  status: TicketStatus;
  statusHistory: MaintenanceStatusChange[];
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  repairDetails?: string;
  partsConsumed: PartConsumed[];
  totalRepairCost: number;
  resolvedAt?: string;
  verifiedAt?: string;
  verifiedByUserId?: string;
  verifiedByName?: string;
}

// ------------------------------------------
// Guest Folio & Ledger
// ------------------------------------------
export interface FolioTransaction {
  transactionId: string;
  timestamp: string;
  type: 'ROOM_CHARGE' | 'RESTAURANT' | 'BAR' | 'LAUNDRY' | 'PAYMENT' | 'DISCOUNT' | 'TAX' | 'REFUND';
  amount: number; // Positive for debits/charges, negative for credits/payments
  description: string;
  sourceModule: 'HOTEL' | 'POS_RESTAURANT' | 'POS_BAR' | 'FRONT_DESK' | 'EVENTS';
  sourceReferenceId?: string;
  paymentMethod?: PaymentMethod;
  receivedOrPostedByUserId: string;
  receivedOrPostedByName: string;
  receivedOrPostedByRole: UserRole;
  drawerOrTillId?: string;
  approvedByUserId?: string;
}

export interface GuestFolio {
  id: string;
  folioNumber: string; // e.g. "FOL-204-89"
  reservationId: string;
  guestId: string;
  guestName: string;
  roomNumber: string;
  status: 'OPEN' | 'SETTLED' | 'CLOSED';
  creditLimit: number;
  balance: number;
  currency: 'NGN' | 'USD';
  transactions: FolioTransaction[];
  openedAt: string;
  openedByUserId: string;
  closedAt?: string;
  closedByUserId?: string;
}

// ------------------------------------------
// Inventory & Recipe BOM
// ------------------------------------------
export type StoreLocation = 'CENTRAL_STORE' | 'KITCHEN_STORE' | 'MAIN_BAR_STORE';

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: 'FOOD_RAW' | 'BEVERAGE_SPIRIT' | 'BEVERAGE_BEER' | 'HOUSEKEEPING' | 'MAINTENANCE_FUEL';
  storeLocation: StoreLocation;
  unitOfMeasure: 'KG' | 'LITRE' | 'PORTION' | 'BOTTLE' | 'CAN' | 'PIECE';
  currentStock: number;
  minimumThreshold: number;
  costPricePerUnit: number;
  sellingPricePerUnit?: number;
  totSpecification?: {
    volumePerBottleMl: number;
    totSizeMl: number;
    totsPerBottle: number;
    remainingTotsInOpenedBottle: number;
  };
}

export interface MenuItemRecipe {
  menuItemId: string;
  name: string;
  ingredients: Array<{
    inventoryItemId: string;
    name: string;
    quantityRequired: number;
    unit: string;
  }>;
}

// ------------------------------------------
// Facilities: Generator & Diesel Tracker
// ------------------------------------------
export interface GeneratorRunLog {
  id: string;
  generatorId: string; // "GEN_250KVA_PERKINS"
  date: string;
  startTime: string;
  stopTime: string;
  durationHours: number;
  meterStart: number;
  meterEnd: number;
  dieselAddedLitres: number;
  fuelCostPerLitre: number;
  burnRateLitresPerHour: number;
  isAnomaly: boolean;
  powerSourceTransition: 'NEPA_DISCO' | 'GENERATOR_PRIMARY' | 'GENERATOR_BACKUP' | 'SOLAR';
  loggedByUserId: string;
  loggedByName: string;
  notes?: string;
}

// ------------------------------------------
// Enterprise CRM: Guests, Corporate & Deals
// ------------------------------------------
export type LoyaltyTier = 'STANDARD' | 'SILVER' | 'GOLD' | 'PLATINUM_VIP';

export interface GuestProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  nationalIdOrPassport: string;
  loyaltyTier: LoyaltyTier;
  loyaltyPoints: number;
  totalLifetimeSpend: number; // In Naira
  totalStaysCount: number;
  totalDiningOrdersCount: number;
  roomPreferences: string[];
  dietaryRestrictions: string[];
  corporateCompanyId?: string;
  corporateCompanyName?: string;
  whatsappOptIn: boolean;
  notes: string;
  lastVisitDate: string;
  createdAt: string;
}

export type CRMDealStage = 
  | 'LEAD_INCOMING' 
  | 'SITE_INSPECTION' 
  | 'CONTRACT_QUOTED' 
  | 'DEPOSIT_PAID' 
  | 'EVENT_ACTIVE' 
  | 'INVOICED_SETTLED' 
  | 'CLOSED_LOST';

export interface CorporateDeal {
  id: string;
  dealTitle: string; // e.g. "Chevron Annual Leadership Retreat 2026"
  companyName: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  dealValue: number; // in Naira
  depositPaid: number;
  balanceDue: number;
  stage: CRMDealStage;
  hallOrLawn: string;
  roomsBlocked: number;
  eventDate: string;
  assignedAccountManager: string;
  createdAt: string;
}

// ------------------------------------------
// Enterprise HR & Staff Onboarding
// ------------------------------------------
export type DepartmentType = 
  | 'EXECUTIVE'
  | 'ROOMS_DIVISION'
  | 'FOOD_AND_BEVERAGE'
  | 'MAINTENANCE_ENGINEERING'
  | 'ACCOUNTS_FINANCE'
  | 'HUMAN_RESOURCES_SECURITY';

export type OnboardingStatus = 
  | 'PENDING_DOCS'
  | 'BACKGROUND_CHECK'
  | 'TRAINING_IN_PROGRESS'
  | 'ACTIVE_CONFIRMED'
  | 'SUSPENDED';

export interface StaffOnboardingRecord {
  id: string;
  staffId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  ninOrIdNumber: string;
  department: DepartmentType;
  designation: string;
  roleAssigned: UserRole;
  salaryTier: string;
  bankName: string;
  bankAccountNumber: string;
  onboardingStatus: OnboardingStatus;
  posQuickPinIssued: string; // 4-digit PIN
  onboardedByStaffName: string;
  onboardedByUserId?: string;
  createdAt: string;
  completedAt?: string;
}

// ------------------------------------------
// Multi-Role RBAC Permissions Matrix
// ------------------------------------------
export type AppPermission =
  | 'rooms.audit.view'
  | 'rooms.status.override'
  | 'rooms.checkin'
  | 'rooms.checkout'
  | 'rooms.customize'
  | 'orders.create'
  | 'orders.increment'
  | 'prices.override'
  | 'discounts.approve'
  | 'voids.execute'
  | 'menu.manage'
  | 'cash.receive'
  | 'maintenance.raise'
  | 'maintenance.signoff'
  | 'reports.export'
  | 'users.onboard'
  | 'crm.manage'
  | 'solar.log'
  | 'solar.powersaver_toggle'
  | 'diesel.log'
  | 'audit.stamp'
  | 'daily.submit'
  | 'daily.audit_update'
  | 'payment.split'
  | 'sidebar.toggle'
  | 'rooms.create'
  | 'rooms.manage_amenities'
  | 'halls.book'
  | 'halls.checkin'
  | 'halls.checkout'
  | 'halls.manage'
  | 'users.manage'
  | 'users.delete'
  | 'services.manage'
  | 'database.clear'
  | 'rbac.manage';

export type HallStatus = 'AVAILABLE' | 'RESERVED' | 'EVENT_IN_PROGRESS' | 'CLEANING_TURNAROUND' | 'MAINTENANCE';

export interface EventHallVenue {
  id: string;
  hallId: string;
  name: string; // e.g. "Osieka Grand Ballroom"
  status: HallStatus;
  capacity: number; // e.g. 600
  ratePerDay: number;
  ratePerHour?: number;
  duration: string; // e.g. "Full Day (8am - 6pm)"
  amenities?: string[];
  description?: string;
  currentEvent?: {
    bookingId: string;
    eventName: string;
    clientName: string;
    clientPhone: string;
    clientEmail?: string;
    date: string;
    timeSlot: string; // e.g. "10:00 AM - 06:00 PM"
    totalAmount: number;
    depositPaid: number;
    balanceDue: number;
    paymentMethod: 'POS' | 'TRANSFER' | 'CASH' | 'SPLIT';
    splitDetails?: { method1: string; amount1: number; method2: string; amount2: number };
    status: 'CONFIRMED' | 'IN_PROGRESS' | 'CONCLUDED';
  };
  bookingHistory?: Array<{
    bookingId: string;
    eventName: string;
    clientName: string;
    date: string;
    totalAmount: number;
    status: 'COMPLETED' | 'CANCELLED';
  }>;
}

export interface ServiceItem {
  id: string;
  name: string;
  group: string; // e.g., 'Rooms', 'Kitchen', 'Drinks', 'Halls and Events', 'Laundry & Ancillary Services', etc.
  price: number;
  duration: string; // e.g., "Full Day (8am-6pm)", "Per Hour", "Per Piece", "Per Event", "Per Session"
  capacity?: number;
  description?: string;
  isAvailable: boolean;
  createdAt?: string;
}

export interface RoleRBACDefinition {
  role: UserRole;
  displayName: string;
  department: DepartmentType;
  description: string;
  isEnabled: boolean; // Superadmin master toggle ON/OFF
  hasSidebar?: boolean; // Per-role toggle: Manager uses Command Hub only, Superadmin/Accountant have full sidebar
  allowedViews: string[]; // Sub-page view clearance
  permissions: AppPermission[]; // Action-level clearance
  dataScope: 'ALL_RESORT_DATA' | 'RESTRICTED_SHIFT_DATA';
}

// ------------------------------------------
// Pure Solar Off-Grid Microgrid Telemetry
// ------------------------------------------
export interface SolarTelemetryDay {
  date: string;
  solarHarvestedKwh: number;
  batteryStateOfCharge: number; // 0 to 100%
  resortConsumptionKwh: number;
  peakSolarPowerKw: number;
  equivalentDieselSavedLitres: number;
  moneySavedNaira: number;
  co2OffsetKg: number;
  generatorBackupHours: number;
  powerSaverActive: boolean;
}

// ------------------------------------------
// Dynamic Resort Menu (No Fixed Prices)
// ------------------------------------------
export interface DynamicMenuItem {
  id: string;
  name: string;
  category: 'Kitchen' | 'Bar' | 'Grill' | 'Events' | string;
  pricingType: 'OPEN_MARKET_PRICE' | 'DAILY_SPECIAL' | 'SUGGESTED_BENCHMARK';
  suggestedPrice: number;
  priceFloor: number; // Minimum price threshold set by Superadmin/Accountant
  description?: string;
  addedBy: string;
  isAvailable: boolean;
  dailyPriceSnapshot?: number; // Today's active price entered by manager
  imageUrl?: string; // Local fast-loading menu image asset path (/menu/...)
}

// ------------------------------------------
// Downsized Operations: Daily Operational Sheet
// ------------------------------------------
export interface DailyRoomOccupancyLog {
  occupiedCount: number;
  vacantCleanCount: number;
  vacantDirtyCount: number;
  outOfOrderCount: number;
  totalRooms: number;
  roomRevenueCash: number;
  roomRevenuePOS: number;
  roomRevenueTransfer: number;
  roomRevenueTotal: number;
}

export interface DailyFBSalesLog {
  foodSalesAmount: number;
  drinksSalesAmount: number;
  totalSalesAmount: number;
  cashReceived: number;
  posTerminalReceived: number;
  bankTransferReceived: number;
}

export interface DailyPettyExpense {
  id: string;
  title: string;
  amount: number;
  paidVia: 'CASH' | 'TRANSFER';
  receiptAttached?: boolean;
}

export interface DailyEnergyExpensesLog {
  generatorRunHours: number;
  dieselLitresPurchased: number;
  dieselPricePerLitre: number;
  totalDieselCost: number;
  otherPettyExpenses: DailyPettyExpense[];
  totalExpenses: number;
}

export interface DailyReconciliationLog {
  totalPhysicalCashHandover: number;
  expectedCashOnHand: number;
  cashDiscrepancy: number; // physical - expected
  receiptPhotoUrls?: string[];
  bankAlertNotes?: string;
  managerNotes?: string;
}

export interface DailyAuditStatus {
  status: 'DRAFT' | 'SUBMITTED' | 'AUDITED_VERIFIED' | 'AUDIT_FLAGGED';
  auditedBy?: string;
  auditedAt?: string;
  auditNotes?: string;
  varianceAmount?: number;
  discrepanciesFound?: string[];
}

export interface DailyOperationalSheet {
  id: string;
  sheetId: string;
  date: string; // YYYY-MM-DD
  resortProperty: string; // "Osieka Luxury Resort"
  managerId: string;
  managerName: string;
  rooms: DailyRoomOccupancyLog;
  fbSales: DailyFBSalesLog;
  energyExpenses: DailyEnergyExpensesLog;
  reconciliation: DailyReconciliationLog;
  audit: DailyAuditStatus;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

