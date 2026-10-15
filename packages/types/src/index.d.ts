export type UserRole = 'OWNER' | 'GENERAL_MANAGER' | 'FRONT_DESK' | 'CASHIER' | 'WAITER' | 'BARTENDER' | 'CHEF' | 'HOUSEKEEPING' | 'MAINTENANCE' | 'ACCOUNTANT' | 'STOREKEEPER';
export interface StaffUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    pinCodeHash?: string;
    department: DepartmentType | 'FRONT_DESK' | 'F_AND_B' | 'HOUSEKEEPING' | 'MAINTENANCE' | 'MANAGEMENT' | 'FINANCE' | string;
    activeShiftId?: string;
    isActive: boolean;
    createdAt: string;
}
export type AuditActionType = 'ROOM_OCCUPANCY_CHANGED' | 'ORDER_CREATED' | 'ORDER_INCREMENTED' | 'ORDER_ITEM_VOIDED' | 'PRICE_OVERRIDE' | 'PAYMENT_RECEIVED' | 'MAINTENANCE_TICKET_RAISED' | 'MAINTENANCE_STATUS_UPDATED' | 'MAINTENANCE_REPAIR_COMPLETED' | 'STOCK_ADJUSTMENT' | 'DIESEL_LOGGED' | 'TRANSFER_VERIFIED';
export interface AuditActor {
    userId: string;
    staffName: string;
    role: UserRole;
    shiftId?: string;
}
export interface AuditTarget {
    entityType: 'Room' | 'POSOrder' | 'GuestFolio' | 'MaintenanceTicket' | 'InventoryItem' | 'GeneratorLog';
    entityId: string;
    identifierLabel: string;
}
export interface AuditDelta {
    beforeState?: Record<string, unknown>;
    afterState?: Record<string, unknown>;
    changeSummary: string;
}
export interface AuditEvent {
    id: string;
    timestamp: string;
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
export type RoomStatus = 'VACANT_CLEAN' | 'VACANT_DIRTY' | 'OCCUPIED' | 'OUT_OF_ORDER' | 'MAINTENANCE';
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
    roomNumber: string;
    roomTypeId: string;
    roomTypeName: string;
    floor: number;
    rackRatePerNight: number;
    status: RoomStatus;
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
        items?: Array<{
            name: string;
            quantity: number;
            unitPrice: number;
        }>;
    };
}
export type POSOutlet = 'MAIN_RESTAURANT' | 'POOL_BAR' | 'LOUNGE' | 'ROOM_SERVICE';
export type POSOrderStatus = 'DRAFT' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'SERVED' | 'BILLED' | 'PAID' | 'VOIDED';
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
export type PaymentMethod = 'CASH' | 'POS_TERMINAL' | 'BANK_TRANSFER' | 'ROOM_FOLIO';
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
    vatAmount: number;
    consumptionTax: number;
    serviceCharge: number;
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
    ticketNumber: string;
    roomNumber?: string;
    assetName: string;
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
export interface FolioTransaction {
    transactionId: string;
    timestamp: string;
    type: 'ROOM_CHARGE' | 'RESTAURANT' | 'BAR' | 'LAUNDRY' | 'PAYMENT' | 'DISCOUNT' | 'TAX' | 'REFUND';
    amount: number;
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
    folioNumber: string;
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
export type StoreLocation = 'CENTRAL_STORE' | 'KITCHEN_STORE' | 'MAIN_BAR_STORE' | 'POOL_BAR_STORE';
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
export interface GeneratorRunLog {
    id: string;
    generatorId: string;
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
export type LoyaltyTier = 'STANDARD' | 'SILVER' | 'GOLD' | 'PLATINUM_VIP';
export interface GuestProfile {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    nationalIdOrPassport: string;
    loyaltyTier: LoyaltyTier;
    loyaltyPoints: number;
    totalLifetimeSpend: number;
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
export type CRMDealStage = 'LEAD_INCOMING' | 'SITE_INSPECTION' | 'CONTRACT_QUOTED' | 'DEPOSIT_PAID' | 'EVENT_ACTIVE' | 'INVOICED_SETTLED' | 'CLOSED_LOST';
export interface CorporateDeal {
    id: string;
    dealTitle: string;
    companyName: string;
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
    dealValue: number;
    depositPaid: number;
    balanceDue: number;
    stage: CRMDealStage;
    hallOrLawn: string;
    roomsBlocked: number;
    eventDate: string;
    assignedAccountManager: string;
    createdAt: string;
}
export type DepartmentType = 'EXECUTIVE' | 'ROOMS_DIVISION' | 'FOOD_AND_BEVERAGE' | 'MAINTENANCE_ENGINEERING' | 'ACCOUNTS_FINANCE' | 'HUMAN_RESOURCES_SECURITY';
export type OnboardingStatus = 'PENDING_DOCS' | 'BACKGROUND_CHECK' | 'TRAINING_IN_PROGRESS' | 'ACTIVE_CONFIRMED' | 'SUSPENDED';
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
    posQuickPinIssued: string;
    onboardedByStaffName: string;
    onboardedByUserId: string;
    createdAt: string;
    completedAt?: string;
}
export type AppPermission = 'rooms.audit.view' | 'rooms.status.override' | 'orders.create' | 'orders.increment' | 'discounts.approve' | 'voids.execute' | 'cash.receive' | 'maintenance.raise' | 'maintenance.signoff' | 'reports.export' | 'users.onboard' | 'crm.manage' | 'diesel.log';
export interface RoleRBACDefinition {
    role: UserRole;
    displayName: string;
    department: DepartmentType;
    description: string;
    permissions: AppPermission[];
}
