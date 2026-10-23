'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  DollarSign, 
  Fuel, 
  Hotel, 
  Image as ImageIcon, 
  Lock, 
  Plus, 
  Send, 
  Sparkles, 
  Trash2, 
  UploadCloud, 
  UtensilsCrossed, 
  Wallet,
  AlertTriangle,
  History,
  FileCheck,
  ShieldAlert,
  X,
  Edit3,
  Tag,
  Fish,
  Flame,
  RefreshCw,
  Sliders,
  Check
} from 'lucide-react';
import { StaffUser, DailyOperationalSheet, DailyPettyExpense, DynamicMenuItem } from '@hosos/types';
import { useFeedback } from '@/context/FeedbackContext';

interface DailyOperationsViewProps {
  activeStaff: StaffUser;
}

export default function DailyOperationsView({ activeStaff }: DailyOperationsViewProps) {
  const { showConfirm, showSuccess, showFailed, showToast } = useFeedback();

  // Active sub-tab: Today's Entry, Dynamic Menu & Specials, or Past Logs History
  const [activeTab, setActiveTab] = useState<'TODAY' | 'MENU_PRICING' | 'HISTORY'>('TODAY');
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [submittedSheets, setSubmittedSheets] = useState<DailyOperationalSheet[]>([]);

  // Role authority checks
  const isSuperAdminOrAccountant =
    activeStaff.role === 'SUPERADMIN' ||
    activeStaff.role === 'ACCOUNTANT' ||
    activeStaff.role === 'OWNER' ||
    (activeStaff.role as any) === 'ADMIN';

  const isSuperAdminOnly =
    activeStaff.role === 'SUPERADMIN' ||
    activeStaff.role === 'OWNER' ||
    (activeStaff.role as any) === 'ADMIN';

  const isManager = activeStaff.role === 'MANAGER' || !isSuperAdminOrAccountant;

  // 1. Rooms State
  const [occupiedRooms, setOccupiedRooms] = useState<number>(22);
  const [vacantCleanRooms, setVacantCleanRooms] = useState<number>(34);
  const [vacantDirtyRooms, setVacantDirtyRooms] = useState<number>(3);
  const [outOfOrderRooms, setOutOfOrderRooms] = useState<number>(1);
  const [roomCash, setRoomCash] = useState<number>(350000);
  const [roomPOS, setRoomPOS] = useState<number>(980000);
  const [roomTransfer, setRoomTransfer] = useState<number>(420000);

  // 2. Food & Bar Sales State
  const [foodSales, setFoodSales] = useState<number>(385000);
  const [drinksSales, setDrinksSales] = useState<number>(265000);
  const [fbCash, setFbCash] = useState<number>(120000);
  const [fbPOS, setFbPOS] = useState<number>(390000);
  const [fbTransfer, setFbTransfer] = useState<number>(140000);

  // 3. Generator & Diesel & Petty Cash (Off-Grid Solar Microgrid with Emergency Backup)
  const [ranGenerator, setRanGenerator] = useState<boolean>(false);
  const [genHours, setGenHours] = useState<number>(0);
  const [dieselLitres, setDieselLitres] = useState<number>(0);
  const [dieselPricePerLitre, setDieselPricePerLitre] = useState<number>(1250);
  const [pettyExpenses, setPettyExpenses] = useState<DailyPettyExpense[]>([
    { id: '1', title: 'Market Food Stuffs & Fresh Fish', amount: 45000, paidVia: 'CASH', receiptAttached: true },
    { id: '2', title: 'Cooking Gas Refill 50kg', amount: 48000, paidVia: 'TRANSFER', receiptAttached: true },
    { id: '3', title: 'Housekeeping Laundry Detergents', amount: 15000, paidVia: 'CASH', receiptAttached: true },
  ]);

  // 4. Physical Cash & Reconciliation
  const [physicalCashHandover, setPhysicalCashHandover] = useState<number>(410000);
  const [managerNotes, setManagerNotes] = useState<string>(
    '100% pure solar microgrid today. Battery SoC stayed above 88%. All guest checkouts reconciled.'
  );
  const [uploadedReceipts, setUploadedReceipts] = useState<string[]>([
    'POS_Terminal_Batch_Slip_Oct23.png',
  ]);

  // Dynamic Menu State (No fixed prices - market catch & daily specials)
  const [menuItems, setMenuItems] = useState<DynamicMenuItem[]>([]);
  const [selectedMenuCategory, setSelectedMenuCategory] = useState<string>('ALL');
  const [isAddMenuModalOpen, setIsAddMenuModalOpen] = useState(false);
  const [newMenuName, setNewMenuName] = useState('');
  const [newMenuCat, setNewMenuCat] = useState<'Kitchen' | 'Bar' | 'Grill' | 'Events'>('Kitchen');
  const [newMenuPricingType, setNewMenuPricingType] = useState<'OPEN_MARKET_PRICE' | 'DAILY_SPECIAL' | 'SUGGESTED_BENCHMARK'>('OPEN_MARKET_PRICE');
  const [newMenuSuggestedPrice, setNewMenuSuggestedPrice] = useState<number>(14500);
  const [newMenuPriceFloor, setNewMenuPriceFloor] = useState<number>(11000);
  const [newMenuDescription, setNewMenuDescription] = useState('');

  // Super Admin / Accountant Administrative Adjustment Modal State
  const [isAdminAdjustmentModalOpen, setIsAdminAdjustmentModalOpen] = useState(false);
  const [adjRoomCash, setAdjRoomCash] = useState<number>(0);
  const [adjRoomPOS, setAdjRoomPOS] = useState<number>(0);
  const [adjRoomTransfer, setAdjRoomTransfer] = useState<number>(0);
  const [adjFbFood, setAdjFbFood] = useState<number>(0);
  const [adjFbDrinks, setAdjFbDrinks] = useState<number>(0);
  const [adjCashHandover, setAdjCashHandover] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState<string>('');

  // Detect if selected date already has a submitted sheet
  const existingSheetForDate = submittedSheets.find((s) => s.date === selectedDate);
  const isSubmitted = Boolean(existingSheetForDate);
  // Records submitted by manager are strictly immutable by manager
  const isImmutableForManager = isSubmitted && isManager;

  // Calculate live totals
  const totalRoomRevenue = (Number(roomCash) || 0) + (Number(roomPOS) || 0) + (Number(roomTransfer) || 0);
  const totalFbSales = (Number(foodSales) || 0) + (Number(drinksSales) || 0);
  const totalGrossRevenue = totalRoomRevenue + totalFbSales;

  const totalDieselCost = ranGenerator ? (Number(dieselLitres) || 0) * (Number(dieselPricePerLitre) || 1250) : 0;
  const totalPettyExpenses = pettyExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalOperationalOutflow = totalDieselCost + totalPettyExpenses;

  // Expected Cash = (Room Cash + FB Cash) - Cash Petty Expenses
  const cashPaidPettyExpenses = pettyExpenses
    .filter((e) => e.paidVia === 'CASH')
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const totalCashCollected = (Number(roomCash) || 0) + (Number(fbCash) || 0);
  const expectedCashOnHand = Math.max(0, totalCashCollected - cashPaidPettyExpenses);
  const cashDifference = (Number(physicalCashHandover) || 0) - expectedCashOnHand;

  // Monday.com completion metrics
  const isSection1Done = totalRoomRevenue > 0;
  const isSection2Done = totalFbSales > 0;
  const isSection3Done = !ranGenerator || (genHours >= 0 && dieselLitres >= 0);
  const isSection4Done = physicalCashHandover > 0;

  const completedSections = [isSection1Done, isSection2Done, isSection3Done, isSection4Done].filter(Boolean).length;
  const completionPercentage = Math.round((completedSections / 4) * 100);

  // Load Submitted Sheets from Backend
  const loadSheets = async () => {
    try {
      const res = await fetch('/api/operations');
      const data = await res.json();
      if (data.success && data.sheets) {
        setSubmittedSheets(data.sheets);
      }
    } catch (e) {
      console.warn('Could not load operational sheets:', e);
    }
  };

  // Load Dynamic Menu Items from Backend
  const loadMenuItems = async () => {
    try {
      const res = await fetch('/api/menu');
      const data = await res.json();
      if (data.success && data.items) {
        setMenuItems(data.items);
      }
    } catch (e) {
      console.warn('Could not load dynamic menu items:', e);
    }
  };

  useEffect(() => {
    loadSheets();
    loadMenuItems();
  }, []);

  // Sync state whenever selected date changes
  useEffect(() => {
    const match = submittedSheets.find((s) => s.date === selectedDate);
    if (match) {
      setOccupiedRooms(match.rooms?.occupiedCount || 0);
      setVacantCleanRooms(match.rooms?.vacantCleanCount || 0);
      setVacantDirtyRooms(match.rooms?.vacantDirtyCount || 0);
      setOutOfOrderRooms(match.rooms?.outOfOrderCount || 0);
      setRoomCash(match.rooms?.roomRevenueCash || 0);
      setRoomPOS(match.rooms?.roomRevenuePOS || 0);
      setRoomTransfer(match.rooms?.roomRevenueTransfer || 0);

      setFoodSales(match.fbSales?.foodSalesAmount || 0);
      setDrinksSales(match.fbSales?.drinksSalesAmount || 0);
      setFbCash(match.fbSales?.cashReceived || 0);
      setFbPOS(match.fbSales?.posTerminalReceived || 0);
      setFbTransfer(match.fbSales?.bankTransferReceived || 0);

      setRanGenerator((match.energyExpenses?.generatorRunHours || 0) > 0);
      setGenHours(match.energyExpenses?.generatorRunHours || 0);
      setDieselLitres(match.energyExpenses?.dieselLitresPurchased || 0);
      setDieselPricePerLitre(match.energyExpenses?.dieselPricePerLitre || 1250);
      setPettyExpenses(match.energyExpenses?.otherPettyExpenses || []);

      setPhysicalCashHandover(match.reconciliation?.totalPhysicalCashHandover || 0);
      setManagerNotes(match.reconciliation?.managerNotes || '');
      setUploadedReceipts(match.reconciliation?.receiptPhotoUrls || []);
    }
  }, [selectedDate, submittedSheets]);

  // Open Administrative Adjustment Modal
  const openAdjustmentModal = () => {
    if (!existingSheetForDate) return;
    setAdjRoomCash(roomCash);
    setAdjRoomPOS(roomPOS);
    setAdjRoomTransfer(roomTransfer);
    setAdjFbFood(foodSales);
    setAdjFbDrinks(drinksSales);
    setAdjCashHandover(physicalCashHandover);
    setAdjustmentReason('');
    setIsAdminAdjustmentModalOpen(true);
  };

  // Superadmin Permanent Sheet Deletion
  const handleDeleteSheet = () => {
    if (!existingSheetForDate || !isSuperAdminOnly) return;
    showConfirm(
      'Purge Operational Closing Sheet Completely',
      `Are you sure you want to permanently delete Daily Operational Closing Sheet #${existingSheetForDate.sheetId} for ${existingSheetForDate.date}? This data item will be completely wiped from MongoDB Atlas and cannot be recovered.`,
      async () => {
        setIsLoading(true);
        try {
          const res = await fetch(
            `/api/operations?sheetId=${encodeURIComponent(existingSheetForDate.sheetId)}&role=${encodeURIComponent(activeStaff.role)}&actorName=${encodeURIComponent(activeStaff.name)}`,
            { method: 'DELETE' }
          );
          const data = await res.json();
          if (data.success) {
            showSuccess(
              'Sheet Deleted Successfully',
              data.message || `Sheet #${existingSheetForDate.sheetId} was deleted by Superadmin.`,
              `Acting Superadmin: ${activeStaff.name} (${activeStaff.role}). Purge recorded to immutable audit log.`
            );
            loadSheets();
          } else {
            showFailed('Delete Failed', data.error || 'Server error occurred.');
          }
        } catch (err: any) {
          showFailed('Network Error', err.message || 'Unable to delete sheet.');
        } finally {
          setIsLoading(false);
        }
      },
      {
        confirmText: 'Purge Sheet Permanently',
        cancelText: 'Cancel',
        variant: 'danger',
      }
    );
  };

  // Superadmin Permanent Menu Item Deletion from Operations View
  const handleDeleteMenuItem = (itemId: string, itemName: string) => {
    if (!isSuperAdminOnly) return;
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
            showSuccess('Menu Item Deleted', `"${itemName}" was permanently purged by Superadmin.`);
            loadMenuItems();
          } else {
            showToast({ type: 'error', title: 'Delete Failed', message: data.error || 'Server error' });
          }
        } catch (err: any) {
          showToast({ type: 'error', title: 'Network Error', message: err.message });
        }
      },
      {
        confirmText: 'Delete Item',
        cancelText: 'Cancel',
        variant: 'danger',
      }
    );
  };

  // Submit Administrative Adjustment Handler (calls PUT /api/operations)
  const handleSaveAdministrativeAdjustment = async () => {
    if (!existingSheetForDate) return;
    if (!adjustmentReason.trim()) {
      showToast({
        type: 'error',
        title: 'Audit Reason Required',
        message: 'Super Admin / Accountant must document the justification for modifying a submitted record.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        sheetId: existingSheetForDate.sheetId,
        modifierRole: activeStaff.role,
        modifierName: activeStaff.name,
        adjustmentReason,
        updates: {
          rooms: {
            roomRevenueCash: adjRoomCash,
            roomRevenuePOS: adjRoomPOS,
            roomRevenueTransfer: adjRoomTransfer,
            roomRevenueTotal: adjRoomCash + adjRoomPOS + adjRoomTransfer,
          },
          fbSales: {
            foodSalesAmount: adjFbFood,
            drinksSalesAmount: adjFbDrinks,
            totalSalesAmount: adjFbFood + adjFbDrinks,
          },
          reconciliation: {
            totalPhysicalCashHandover: adjCashHandover,
          },
        },
      };

      const res = await fetch('/api/operations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        showSuccess(
          'Operational Record Updated & Audited',
          `Adjustment to sheet #${existingSheetForDate.sheetId} has been committed by ${activeStaff.role}.`,
          `Audit Justification: "${adjustmentReason}". Permanent trail created.`
        );
        setIsAdminAdjustmentModalOpen(false);
        loadSheets();
      } else {
        showFailed('Adjustment Failed', data.error || 'Server error occurred.');
      }
    } catch (err: any) {
      showFailed('Network Error', err.message || 'Unable to update sheet.');
    } finally {
      setIsLoading(false);
    }
  };

  // Add Petty Expense Handler
  const handleAddExpense = () => {
    if (isImmutableForManager) return;
    const newExpense: DailyPettyExpense = {
      id: Date.now().toString(),
      title: 'New Resort Supply Item',
      amount: 5000,
      paidVia: 'CASH',
      receiptAttached: false,
    };
    setPettyExpenses((prev) => [...prev, newExpense]);
  };

  // Remove Petty Expense Handler
  const handleRemoveExpense = (id: string) => {
    if (isImmutableForManager) return;
    setPettyExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Receipt file upload simulator
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isImmutableForManager) return;
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploadedReceipts((prev) => [...prev, file.name]);
      showToast({
        type: 'success',
        title: 'Receipt Image Attached',
        message: `${file.name} successfully attached to today's audit pack.`,
      });
    }
  };

  // Manager: Submit Daily Close Handler
  const handleSubmitDailyClose = () => {
    if (isImmutableForManager) {
      showToast({
        type: 'error',
        title: 'Record Immutable',
        message: 'This date already has a locked submission. Manager cannot overwrite submitted records.',
      });
      return;
    }

    showConfirm(
      "Confirm Submission of Today's Resort Operations",
      `Are you sure you want to lock and submit the daily operations for ${selectedDate}? Total Gross Revenue: ₦${totalGrossRevenue.toLocaleString()} | Cash in Safe: ₦${physicalCashHandover.toLocaleString()}. Kelechi (Accountant) will receive this sheet for audit. Once submitted, this record is immutable to you.`,
      async () => {
        setIsLoading(true);
        try {
          const payload = {
            date: selectedDate,
            resortProperty: 'Osieka Luxury Resort',
            managerId: activeStaff.id,
            managerName: activeStaff.name,
            rooms: {
              occupiedCount: occupiedRooms,
              vacantCleanCount: vacantCleanRooms,
              vacantDirtyCount: vacantDirtyRooms,
              outOfOrderCount: outOfOrderRooms,
              totalRooms: 60,
              roomRevenueCash: roomCash,
              roomRevenuePOS: roomPOS,
              roomRevenueTransfer: roomTransfer,
              roomRevenueTotal: totalRoomRevenue,
            },
            fbSales: {
              foodSalesAmount: foodSales,
              drinksSalesAmount: drinksSales,
              totalSalesAmount: totalFbSales,
              cashReceived: fbCash,
              posTerminalReceived: fbPOS,
              bankTransferReceived: fbTransfer,
            },
            energyExpenses: {
              generatorRunHours: ranGenerator ? genHours : 0,
              dieselLitresPurchased: ranGenerator ? dieselLitres : 0,
              dieselPricePerLitre,
              totalDieselCost,
              otherPettyExpenses: pettyExpenses,
              totalExpenses: totalOperationalOutflow,
            },
            reconciliation: {
              totalPhysicalCashHandover: physicalCashHandover,
              expectedCashOnHand,
              cashDiscrepancy: cashDifference,
              receiptPhotoUrls: uploadedReceipts,
              bankAlertNotes: 'All POS & Transfer payments cross-checked with staff.',
              managerNotes,
            },
            audit: {
              status: 'SUBMITTED',
            },
          };

          const res = await fetch('/api/operations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          const data = await res.json();
          if (data.success) {
            showSuccess(
              "Daily Operations Submitted Successfully!",
              `Sheet for ${selectedDate} has been locked and saved to MongoDB Atlas.`,
              `Total Inflow: ₦${totalGrossRevenue.toLocaleString()} • Cash Handover: ₦${physicalCashHandover.toLocaleString()} • Sheet is now immutable to manager; Accountant notified for audit.`
            );
            loadSheets();
          } else {
            showFailed('Submission Failed', data.error || 'Server error occurred.');
          }
        } catch (err: any) {
          showFailed('Network Error', err.message || 'Unable to submit daily sheet.');
        } finally {
          setIsLoading(false);
        }
      },
      {
        confirmText: 'Submit & Lock Daily Sheet',
        cancelText: 'Check Again',
        variant: 'primary',
      }
    );
  };

  // Manager: Add New Menu Item (Catch of the day / specials)
  const handleAddMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenuName.trim()) return;

    setIsLoading(true);
    try {
      const payload = {
        name: newMenuName,
        category: newMenuCat,
        pricingType: newMenuPricingType,
        suggestedPrice: Number(newMenuSuggestedPrice) || 0,
        priceFloor: isSuperAdminOrAccountant
          ? Number(newMenuPriceFloor) || 0
          : Math.round((Number(newMenuSuggestedPrice) || 0) * 0.7),
        dailyPriceSnapshot: Number(newMenuSuggestedPrice) || 0,
        description: newMenuDescription || 'Fresh coastal specialty prepared with local herbs and spices.',
        addedBy: `${activeStaff.name} (${activeStaff.role})`,
      };

      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        showSuccess(
          'Dish Added to Menu Catalog!',
          `"${newMenuName}" has been added under ${newMenuCat}.`,
          `Pricing Model: ${newMenuPricingType.replace(/_/g, ' ')} • Today's Price: ₦${Number(newMenuSuggestedPrice).toLocaleString()}`
        );
        setIsAddMenuModalOpen(false);
        setNewMenuName('');
        setNewMenuDescription('');
        loadMenuItems();
      } else {
        showFailed('Failed to Add Dish', data.error || 'Unable to save menu item.');
      }
    } catch (err: any) {
      showFailed('Network Error', err.message || 'Unable to connect to server.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Price / Floor Update
  const handleUpdatePriceSnapshot = async (item: DynamicMenuItem, newPrice: number) => {
    try {
      const res = await fetch('/api/menu', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: item.id || (item as any).itemId,
          modifierRole: activeStaff.role,
          modifierName: activeStaff.name,
          dailyPriceSnapshot: newPrice,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast({
          type: 'success',
          title: 'Price Snapshot Updated',
          message: `${item.name} daily price updated to ₦${newPrice.toLocaleString()}`,
        });
        loadMenuItems();
      } else {
        showFailed('Update Failed', data.error);
      }
    } catch (err: any) {
      showFailed('Network Error', err.message);
    }
  };

  // Filtered menu items
  const filteredMenuItems = menuItems.filter((item) => {
    if (selectedMenuCategory === 'ALL') return true;
    return item.category.toUpperCase().replace(/\s+/g, '') === selectedMenuCategory.toUpperCase().replace(/\s+/g, '');
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '60px' }}>
      
      {/* 1. Header Banner & Quick Date Selector (Monday.com Look) */}
      <div className="ent-card" style={{ padding: '20px 24px', backgroundColor: '#FFFFFF' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                color: 'var(--brand-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
              }}>
                <Hotel size={20} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Osieka Resort Daily Operations Board
                </h1>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                  Logged in as <strong>{activeStaff.name} ({activeStaff.role})</strong> • Monday.com Visual Board & Daily Record
                </p>
              </div>
            </div>
          </div>

          {/* Date Picker & Tab Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {activeTab === 'TODAY' && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'var(--bg-secondary)',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
              }}>
                <Calendar size={14} color="var(--text-muted)" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    fontWeight: 700,
                    fontSize: '0.825rem',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                />
              </div>
            )}

            <div style={{ display: 'flex', backgroundColor: 'var(--bg-secondary)', padding: '3px', borderRadius: '8px', gap: '2px' }}>
              <button
                onClick={() => setActiveTab('TODAY')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: activeTab === 'TODAY' ? '#FFFFFF' : 'transparent',
                  color: activeTab === 'TODAY' ? 'var(--brand-primary)' : 'var(--text-muted)',
                  boxShadow: activeTab === 'TODAY' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Hotel size={14} />
                <span>Daily Entry</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('MENU_PRICING');
                  loadMenuItems();
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: activeTab === 'MENU_PRICING' ? '#FFFFFF' : 'transparent',
                  color: activeTab === 'MENU_PRICING' ? 'var(--brand-primary)' : 'var(--text-muted)',
                  boxShadow: activeTab === 'MENU_PRICING' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <UtensilsCrossed size={14} />
                <span>Dynamic Menu ({menuItems.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('HISTORY')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: activeTab === 'HISTORY' ? '#FFFFFF' : 'transparent',
                  color: activeTab === 'HISTORY' ? 'var(--brand-primary)' : 'var(--text-muted)',
                  boxShadow: activeTab === 'HISTORY' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <History size={14} />
                <span>Past Sheets ({submittedSheets.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Monday.com Progress Bar */}
        {activeTab === 'TODAY' && (
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {isSubmitted
                  ? `Submission Status: Sheet Locked (${existingSheetForDate?.audit?.status || 'SUBMITTED'})`
                  : `Daily Progress: ${completedSections} of 4 Sections Filled`}
              </span>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: isSubmitted ? 'var(--emerald-primary)' : completionPercentage === 100 ? 'var(--emerald-primary)' : 'var(--brand-primary)',
              }}>
                {isSubmitted ? '✓ Sheet Locked & Submitted' : `${completionPercentage}% Ready`}
              </span>
            </div>
            <div style={{ height: '8px', backgroundColor: 'var(--bg-secondary)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${isSubmitted ? 100 : completionPercentage}%`,
                backgroundColor: isSubmitted || completionPercentage === 100 ? 'var(--emerald-primary)' : 'var(--brand-primary)',
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* TAB 1: TODAY'S ENTRY (MONDAY.COM DESIGN & IMMUTABLE LOCK)      */}
      {/* ============================================================== */}
      {activeTab === 'TODAY' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* IMMUTABILITY BANNER FOR MANAGER */}
          {isImmutableForManager && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '2px solid rgba(239, 68, 68, 0.35)',
              padding: '18px 24px',
              borderRadius: '12px',
              display: 'flex',
              gap: '16px',
              alignItems: 'center',
            }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--crimson-primary)',
                flexShrink: 0,
              }}>
                <Lock size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--crimson-primary)' }}>
                    🔒 RECORD SUBMITTED & IMMUTABLE (Date: {selectedDate})
                  </h3>
                  <span className="badge badge-emerald">
                    Status: {existingSheetForDate?.audit?.status || 'SUBMITTED'}
                  </span>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                  This daily closing sheet was submitted by Manager <strong>{existingSheetForDate?.managerName}</strong> on {new Date(existingSheetForDate?.submittedAt || '').toLocaleString()}.
                  Under Osieka Resort internal audit controls, <strong>all records submitted by the manager are strictly immutable</strong> and cannot be altered by the manager.
                  Only <strong>Superadmin</strong> or <strong>Accountant</strong> can execute verified adjustments.
                </p>
              </div>
            </div>
          )}

          {/* ADMINISTRATIVE OVERRIDE BANNER FOR SUPERADMIN / ACCOUNTANT */}
          {isSubmitted && isSuperAdminOrAccountant && (
            <div style={{
              backgroundColor: 'rgba(37, 99, 235, 0.08)',
              border: '2px solid rgba(37, 99, 235, 0.3)',
              padding: '16px 20px',
              borderRadius: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileCheck size={18} color="var(--brand-primary)" />
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
                    Manager Record Submitted (Immutable to Manager)
                  </h4>
                </div>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Submitted by {existingSheetForDate?.managerName}. As <strong>{activeStaff.name} ({activeStaff.role})</strong>, you have exclusive privilege to adjust figures if required.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={openAdjustmentModal}
                  className="btn-primary"
                  style={{ padding: '8px 18px', fontSize: '0.825rem', fontWeight: 800 }}
                >
                  ⚡ Administrative Adjustment
                </button>
                {isSuperAdminOnly && (
                  <button
                    type="button"
                    onClick={handleDeleteSheet}
                    className="btn-danger"
                    style={{ padding: '8px 16px', fontSize: '0.825rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}
                    title="Permanently purge sheet (Superadmin)"
                  >
                    <Trash2 size={14} />
                    <span>Delete Sheet Completely</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* SECTION 1: ROOMS DIVISION */}
          <div className="ent-card" style={{ padding: '24px', opacity: isImmutableForManager ? 0.95 : 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--brand-bg)',
                  color: 'var(--brand-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Hotel size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Step 1: Rooms & Accommodation
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                    Occupancy count and payments collected from room guests
                  </p>
                </div>
              </div>
              <span className={`badge ${isSection1Done ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '0.7rem' }}>
                {isSection1Done ? '✓ Completed' : 'Pending'}
              </span>
            </div>

            {/* Room Status Counters */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '12px',
              marginBottom: '20px',
            }}>
              <div style={{ padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Guest Inside (Occupied)</span>
                <input
                  type="number"
                  disabled={isImmutableForManager}
                  value={occupiedRooms}
                  onChange={(e) => setOccupiedRooms(Number(e.target.value))}
                  style={{ width: '100%', fontSize: '1.25rem', fontWeight: 800, marginTop: '4px' }}
                />
              </div>

              <div style={{ padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Vacant Clean (Ready)</span>
                <input
                  type="number"
                  disabled={isImmutableForManager}
                  value={vacantCleanRooms}
                  onChange={(e) => setVacantCleanRooms(Number(e.target.value))}
                  style={{ width: '100%', fontSize: '1.25rem', fontWeight: 800, marginTop: '4px' }}
                />
              </div>

              <div style={{ padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Vacant Dirty (Housekeeping)</span>
                <input
                  type="number"
                  disabled={isImmutableForManager}
                  value={vacantDirtyRooms}
                  onChange={(e) => setVacantDirtyRooms(Number(e.target.value))}
                  style={{ width: '100%', fontSize: '1.25rem', fontWeight: 800, marginTop: '4px' }}
                />
              </div>

              <div style={{ padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Out of Service / Repair</span>
                <input
                  type="number"
                  disabled={isImmutableForManager}
                  value={outOfOrderRooms}
                  onChange={(e) => setOutOfOrderRooms(Number(e.target.value))}
                  style={{ width: '100%', fontSize: '1.25rem', fontWeight: 800, marginTop: '4px' }}
                />
              </div>
            </div>

            {/* Room Revenue Breakdown */}
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
              Room Money Collected Today:
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
            }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  💵 Cash at Front Desk (₦)
                </label>
                <input
                  type="number"
                  disabled={isImmutableForManager}
                  value={roomCash}
                  onChange={(e) => setRoomCash(Number(e.target.value))}
                  style={{ width: '100%', fontWeight: 700, marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  💳 POS Card Terminal (₦)
                </label>
                <input
                  type="number"
                  disabled={isImmutableForManager}
                  value={roomPOS}
                  onChange={(e) => setRoomPOS(Number(e.target.value))}
                  style={{ width: '100%', fontWeight: 700, marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  🏦 Bank Transfer Credit (₦)
                </label>
                <input
                  type="number"
                  disabled={isImmutableForManager}
                  value={roomTransfer}
                  onChange={(e) => setRoomTransfer(Number(e.target.value))}
                  style={{ width: '100%', fontWeight: 700, marginTop: '4px' }}
                />
              </div>
            </div>

            <div style={{
              marginTop: '14px',
              padding: '10px 14px',
              backgroundColor: 'rgba(37, 99, 235, 0.06)',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-primary)' }}>
                Total Room Revenue Collected:
              </span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
                ₦{totalRoomRevenue.toLocaleString()}
              </span>
            </div>
          </div>

          {/* SECTION 2: FOOD & BAR SALES */}
          <div className="ent-card" style={{ padding: '24px', opacity: isImmutableForManager ? 0.95 : 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  color: 'var(--emerald-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <UtensilsCrossed size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Step 2: Restaurant & Bar Sales (Dynamic Specials & Catch)
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                    Daily kitchen food and bar drink sales from guest orders
                  </p>
                </div>
              </div>
              <span className={`badge ${isSection2Done ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '0.7rem' }}>
                {isSection2Done ? '✓ Completed' : 'Pending'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  🍲 Total Kitchen Food Sales (₦)
                </label>
                <input
                  type="number"
                  disabled={isImmutableForManager}
                  value={foodSales}
                  onChange={(e) => setFoodSales(Number(e.target.value))}
                  style={{ width: '100%', fontSize: '1.1rem', fontWeight: 700, marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  🍸 Total Bar Drinks Sales (₦)
                </label>
                <input
                  type="number"
                  disabled={isImmutableForManager}
                  value={drinksSales}
                  onChange={(e) => setDrinksSales(Number(e.target.value))}
                  style={{ width: '100%', fontSize: '1.1rem', fontWeight: 700, marginTop: '4px' }}
                />
              </div>
            </div>

            {/* How Guests Paid for F&B */}
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
              How Guests Paid for Food & Drinks:
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
            }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  💵 F&B Cash Handover (₦)
                </label>
                <input
                  type="number"
                  disabled={isImmutableForManager}
                  value={fbCash}
                  onChange={(e) => setFbCash(Number(e.target.value))}
                  style={{ width: '100%', fontWeight: 700, marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  💳 F&B POS Terminal (₦)
                </label>
                <input
                  type="number"
                  disabled={isImmutableForManager}
                  value={fbPOS}
                  onChange={(e) => setFbPOS(Number(e.target.value))}
                  style={{ width: '100%', fontWeight: 700, marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  🏦 Direct Bank Transfer (₦)
                </label>
                <input
                  type="number"
                  disabled={isImmutableForManager}
                  value={fbTransfer}
                  onChange={(e) => setFbTransfer(Number(e.target.value))}
                  style={{ width: '100%', fontWeight: 700, marginTop: '4px' }}
                />
              </div>
            </div>

            <div style={{
              marginTop: '14px',
              padding: '10px 14px',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--emerald-primary)' }}>
                Total Restaurant & Bar Sales:
              </span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--emerald-primary)' }}>
                ₦{totalFbSales.toLocaleString()}
              </span>
            </div>
          </div>

          {/* SECTION 3: GENERATOR & PETTY EXPENSES */}
          <div className="ent-card" style={{ padding: '24px', opacity: isImmutableForManager ? 0.95 : 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  color: 'var(--amber-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Fuel size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Step 3: Diesel, Generator & Market Expenses
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                    Resort operates 100% off-grid solar • Log rare backup generator usage and market petty cash
                  </p>
                </div>
              </div>
              <span className={`badge ${isSection3Done ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '0.7rem' }}>
                {isSection3Done ? '✓ Completed' : 'Pending'}
              </span>
            </div>

            {/* Generator Toggle */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '8px',
              marginBottom: '16px',
              flexWrap: 'wrap',
              gap: '10px',
            }}>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Did emergency backup generator run today?
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Osieka runs purely on solar. Only turn on if heavy overcast drained 360kWh BESS
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  disabled={isImmutableForManager}
                  onClick={() => {
                    setRanGenerator(false);
                    setGenHours(0);
                    setDieselLitres(0);
                    setDieselPricePerLitre(0);
                  }}
                  style={{
                    padding: '6px 16px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    backgroundColor: !ranGenerator ? 'var(--emerald-primary)' : '#FFFFFF',
                    color: !ranGenerator ? '#FFFFFF' : 'var(--text-secondary)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  ☀️ 100% Pure Solar Microgrid
                </button>
                <button
                  type="button"
                  disabled={isImmutableForManager}
                  onClick={() => {
                    setRanGenerator(true);
                    setDieselPricePerLitre(1250);
                  }}
                  style={{
                    padding: '6px 16px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    backgroundColor: ranGenerator ? 'var(--amber-primary)' : '#FFFFFF',
                    color: ranGenerator ? '#FFFFFF' : 'var(--text-secondary)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  ⚡ Backup Generator Ran
                </button>
              </div>
            </div>

            {/* If 100% Off-Grid Solar (Zero Generator Accounting Active) */}
            {!ranGenerator && (
              <div style={{
                padding: '14px 18px',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                borderRadius: '8px',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px',
              }}>
                <span style={{ fontSize: '1.4rem' }}>☀️</span>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--emerald-primary)' }}>
                    100% Pure Off-Grid Solar Microgrid Active (120 kWp Solar PV + 360 kWh BESS)
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Resort operates totally off-grid. Backup generator is offline (0 Run Hours • ₦0 Fuel Outflow). System does not account for generator; only actual daily market petty cash is logged below.
                  </div>
                </div>
              </div>
            )}

            {/* If Generator Ran */}
            {ranGenerator && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '14px',
                padding: '16px',
                backgroundColor: 'rgba(245, 158, 11, 0.05)',
                borderRadius: '8px',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                marginBottom: '20px',
              }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    ⏱️ Generator Run Hours
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    disabled={isImmutableForManager}
                    value={genHours}
                    onChange={(e) => setGenHours(Number(e.target.value))}
                    style={{ width: '100%', fontWeight: 700, marginTop: '4px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    🛢️ Litres of Diesel Purchased
                  </label>
                  <input
                    type="number"
                    disabled={isImmutableForManager}
                    value={dieselLitres}
                    onChange={(e) => setDieselLitres(Number(e.target.value))}
                    style={{ width: '100%', fontWeight: 700, marginTop: '4px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    ⛽ Price Per Litre (₦)
                  </label>
                  <input
                    type="number"
                    disabled={isImmutableForManager}
                    value={dieselPricePerLitre}
                    onChange={(e) => setDieselPricePerLitre(Number(e.target.value))}
                    style={{ width: '100%', fontWeight: 700, marginTop: '4px' }}
                  />
                </div>
              </div>
            )}

            {/* Petty Cash Outflows */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Daily Petty Cash Expenses (Market Fish, Gas, Ice Blocks):
              </h4>
              {!isImmutableForManager && (
                <button
                  type="button"
                  onClick={handleAddExpense}
                  className="btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                >
                  <Plus size={12} /> Add Expense Item
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {pettyExpenses.map((expense) => (
                <div
                  key={expense.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '6px',
                  }}
                >
                  <input
                    type="text"
                    disabled={isImmutableForManager}
                    value={expense.title}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPettyExpenses((prev) =>
                        prev.map((item) => (item.id === expense.id ? { ...item, title: val } : item))
                      );
                    }}
                    style={{ flex: 1, fontSize: '0.85rem' }}
                    placeholder="Expense description (e.g. fresh fish, ice blocks)"
                  />

                  <div style={{ width: '130px' }}>
                    <input
                      type="number"
                      disabled={isImmutableForManager}
                      value={expense.amount}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setPettyExpenses((prev) =>
                          prev.map((item) => (item.id === expense.id ? { ...item, amount: val } : item))
                        );
                      }}
                      style={{ width: '100%', fontWeight: 700 }}
                    />
                  </div>

                  <select
                    disabled={isImmutableForManager}
                    value={expense.paidVia}
                    onChange={(e) => {
                      const val = e.target.value as 'CASH' | 'TRANSFER';
                      setPettyExpenses((prev) =>
                        prev.map((item) => (item.id === expense.id ? { ...item, paidVia: val } : item))
                      );
                    }}
                    style={{ padding: '6px 8px', fontSize: '0.75rem' }}
                  >
                    <option value="CASH">Paid with Cash</option>
                    <option value="TRANSFER">Paid via Transfer</option>
                  </select>

                  {!isImmutableForManager && (
                    <button
                      type="button"
                      onClick={() => handleRemoveExpense(expense.id)}
                      style={{ padding: '6px', color: 'var(--rose-primary)', background: 'transparent' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div style={{
              marginTop: '14px',
              padding: '10px 14px',
              backgroundColor: !ranGenerator ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: !ranGenerator ? 'var(--emerald-primary)' : 'var(--amber-primary)' }}>
                {!ranGenerator ? 'Total Daily Petty Expenses (100% Off-Grid Solar • ₦0 Diesel Burn):' : 'Total Operational Expenses (Diesel + Petty):'}
              </span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: !ranGenerator ? 'var(--emerald-primary)' : 'var(--amber-primary)' }}>
                ₦{totalOperationalOutflow.toLocaleString()}
              </span>
            </div>
          </div>

          {/* SECTION 4: CASH HANDOVER & PHOTO UPLOAD */}
          <div className="ent-card" style={{ padding: '24px', opacity: isImmutableForManager ? 0.95 : 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(124, 58, 237, 0.1)',
                  color: 'var(--purple-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Wallet size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Step 4: End-of-Day Cash Handover & Receipts
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                    Count physical cash in safe and upload POS settlement slips or bank screenshots
                  </p>
                </div>
              </div>
              <span className={`badge ${isSection4Done ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '0.7rem' }}>
                {isSection4Done ? '✓ Completed' : 'Pending'}
              </span>
            </div>

            {/* Cash Tally Comparison Box */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              padding: '16px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              marginBottom: '20px',
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Expected Cash from Sales:
                </span>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                  ₦{expectedCashOnHand.toLocaleString()}
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  (Room Cash ₦{roomCash.toLocaleString()} + F&B Cash ₦{fbCash.toLocaleString()} - Cash Petty ₦{cashPaidPettyExpenses.toLocaleString()})
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                  💵 Actual Physical Cash in Safe (₦):
                </span>
                <input
                  type="number"
                  disabled={isImmutableForManager}
                  value={physicalCashHandover}
                  onChange={(e) => setPhysicalCashHandover(Number(e.target.value))}
                  style={{
                    width: '100%',
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: 'var(--emerald-primary)',
                    marginTop: '4px',
                  }}
                />
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Cash Variance:
                </span>
                <div style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: cashDifference === 0 ? 'var(--emerald-primary)' : cashDifference > 0 ? 'var(--brand-primary)' : 'var(--crimson-primary)',
                  marginTop: '2px',
                }}>
                  {cashDifference === 0 ? '₦0 (Perfect Match)' : cashDifference > 0 ? `+₦${cashDifference.toLocaleString()} (Surplus)` : `-₦${Math.abs(cashDifference).toLocaleString()} (Shortage)`}
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {cashDifference === 0 ? 'Cash in envelope matches ledger exactly' : 'Audit discrepancy flagged for Kelechi (Accountant)'}
                </span>
              </div>
            </div>

            {/* Photo Attachment & Upload Section */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                📸 Snap / Attach POS Settlement Roll & Receipts:
              </label>

              {!isImmutableForManager && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  flexWrap: 'wrap',
                  marginBottom: '10px',
                }}>
                  <label className="btn-secondary" style={{ cursor: 'pointer', padding: '8px 14px' }}>
                    <UploadCloud size={16} />
                    <span>Attach Photo / File</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                  </label>

                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Take a clear photo of the POS machine end-of-day printout roll
                  </span>
                </div>
              )}

              {/* Uploaded File Badges */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {uploadedReceipts.map((name, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      backgroundColor: 'rgba(37, 99, 235, 0.08)',
                      borderRadius: '6px',
                      border: '1px solid rgba(37, 99, 235, 0.2)',
                      fontSize: '0.75rem',
                      color: 'var(--brand-primary)',
                      fontWeight: 600,
                    }}
                  >
                    <ImageIcon size={13} />
                    <span>{name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Manager Notes */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                Manager Daily Memo to Accountant / Owner:
              </label>
              <textarea
                rows={2}
                disabled={isImmutableForManager}
                value={managerNotes}
                onChange={(e) => setManagerNotes(e.target.value)}
                placeholder="Mention any solar battery states, special guest events, or customer issues here..."
                style={{ width: '100%', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {/* BOTTOM SUBMISSION / IMMUTABLE STATUS BAR */}
          <div style={{
            position: 'sticky',
            bottom: '20px',
            backgroundColor: '#FFFFFF',
            padding: '16px 24px',
            borderRadius: '12px',
            border: isImmutableForManager ? '2px solid rgba(239, 68, 68, 0.3)' : '2px solid var(--brand-primary)',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            zIndex: 30,
          }}>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {isSubmitted ? `Sheet for ${selectedDate}: Locked & Submitted` : `Ready to Close Today (${selectedDate})?`}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Total Revenue: <strong>₦{totalGrossRevenue.toLocaleString()}</strong> • Cash Handover: <strong>₦{physicalCashHandover.toLocaleString()}</strong>
              </div>
            </div>

            {isImmutableForManager ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                borderRadius: '8px',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: 'var(--crimson-primary)',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}>
                <Lock size={16} />
                <span>Submitted Sheet Locked — Immutable to Manager</span>
              </div>
            ) : isSubmitted && isSuperAdminOrAccountant ? (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={openAdjustmentModal}
                  className="btn-primary"
                  style={{
                    padding: '12px 24px',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    backgroundColor: 'var(--brand-primary)',
                  }}
                >
                  ⚡ Administrative Adjustment
                </button>
                {isSuperAdminOnly && (
                  <button
                    type="button"
                    onClick={handleDeleteSheet}
                    className="btn-danger"
                    style={{
                      padding: '12px 24px',
                      fontSize: '0.9rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                    title="Permanently purge sheet (Superadmin)"
                  >
                    <Trash2 size={16} />
                    <span>Delete Sheet Completely</span>
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                disabled={isLoading}
                onClick={handleSubmitDailyClose}
                className="btn-primary"
                style={{
                  padding: '12px 28px',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  backgroundColor: 'var(--emerald-primary)',
                  borderColor: 'var(--emerald-border)',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                }}
              >
                <Lock size={16} />
                <span>{isLoading ? 'Submitting...' : '🔒 Submit Daily Close to Accountant'}</span>
              </button>
            )}
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: DYNAMIC MENU & SPECIALS (NO FIXED PRICES)                */}
      {/* ============================================================== */}
      {activeTab === 'MENU_PRICING' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Header Card */}
          <div className="ent-card" style={{ padding: '24px', backgroundColor: '#FFFFFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Fish size={20} color="var(--brand-primary)" />
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Osieka Resort Dynamic Menu & Pricing Catalog
                  </h2>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                  <strong>Operational Reality:</strong> Fresh coastal catch, point-and-kill pond catfish, and chef specials have <strong>no fixed prices</strong>.
                  Manager adds all dishes and daily market rates. Superadmin & Accountant configure price floors to safeguard food costs.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddMenuModalOpen(true)}
                className="btn-primary"
                style={{ padding: '10px 20px', fontSize: '0.85rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Plus size={16} />
                <span>Add Dish / Catch of the Day</span>
              </button>
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '18px', flexWrap: 'wrap' }}>
              {['ALL', 'SWALLOW', 'SOUPS', 'RICE MEALS', 'PASTA MENU', 'PROTEINS', 'GRILL', 'BAR'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedMenuCategory(cat)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: selectedMenuCategory === cat ? 'var(--brand-primary)' : 'var(--bg-secondary)',
                    color: selectedMenuCategory === cat ? '#FFFFFF' : 'var(--text-secondary)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  {cat === 'ALL' ? 'All Dishes & Drinks' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Menu Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px',
          }}>
            {filteredMenuItems.map((item) => (
              <div
                key={item.id}
                className="ent-card"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span className={item.category === 'Kitchen' ? 'badge badge-brand' : item.category === 'Bar' ? 'badge badge-purple' : 'badge badge-amber'}>
                      {item.category}
                    </span>

                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: item.pricingType === 'OPEN_MARKET_PRICE' ? 'rgba(37, 99, 235, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                      color: item.pricingType === 'OPEN_MARKET_PRICE' ? 'var(--brand-primary)' : 'var(--emerald-primary)',
                      border: '1px solid currentColor',
                    }}>
                      {item.pricingType === 'OPEN_MARKET_PRICE' ? '🐟 Market Catch / Weight' : item.pricingType === 'DAILY_SPECIAL' ? '⭐ Chef Special' : '📊 Benchmark'}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '0.975rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 10px' }}>
                    {item.name}
                  </h3>
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Rate / Unit:</span>
                      <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                        {item.category === 'Bar' && (item.dailyPriceSnapshot || item.suggestedPrice) > 0 ? (
                          `₦${(item.dailyPriceSnapshot || item.suggestedPrice).toLocaleString()}`
                        ) : (
                          <span style={{ fontSize: '0.85rem', color: 'var(--brand-primary)' }}>Price on Order</span>
                        )}
                      </span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Cost Floor:</span>
                      <span style={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: 'var(--amber-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        justifyContent: 'flex-end',
                      }}>
                        <Lock size={12} />
                        ₦{(item.priceFloor || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Inline quick-adjustment for Manager or Superadmin */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        const newP = prompt(`Enter today's active price for "${item.name}":`, String(item.dailyPriceSnapshot || item.suggestedPrice));
                        if (newP && !isNaN(Number(newP))) {
                          handleUpdatePriceSnapshot(item, Number(newP));
                        }
                      }}
                      className="btn-secondary"
                      style={{ flex: 1, fontSize: '0.75rem', padding: '6px' }}
                    >
                      <Tag size={12} /> Set Rate
                    </button>

                    {isSuperAdminOrAccountant && (
                      <button
                        type="button"
                        onClick={async () => {
                          const newF = prompt(`[Admin Privilege] Update Price Floor for "${item.name}":`, String(item.priceFloor || 0));
                          if (newF && !isNaN(Number(newF))) {
                            try {
                              const res = await fetch('/api/menu', {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  itemId: item.id || (item as any).itemId,
                                  modifierRole: activeStaff.role,
                                  modifierName: activeStaff.name,
                                  priceFloor: Number(newF),
                                }),
                              });
                              const data = await res.json();
                              if (data.success) {
                                showToast({ type: 'success', title: 'Floor Updated', message: 'Price floor successfully updated.' });
                                loadMenuItems();
                              } else {
                                showFailed('Failed', data.error);
                              }
                            } catch (e: any) {
                              showFailed('Error', e.message);
                            }
                          }
                        }}
                        className="btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '6px 10px', color: 'var(--amber-primary)' }}
                        title="Configure Price Floor (Admin / Accountant Only)"
                      >
                        <Lock size={12} /> Floor
                      </button>
                    )}

                    {isSuperAdminOnly && (
                      <button
                        type="button"
                        onClick={() => handleDeleteMenuItem(item.id || (item as any).itemId, item.name)}
                        className="btn-danger"
                        style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                        title="Permanently purge item from catalog (Superadmin)"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: PAST LOGS HISTORY                                       */}
      {/* ============================================================== */}
      {activeTab === 'HISTORY' && (
        <div className="ent-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
            Historical Submitted Operational Logs (Osieka Resort)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {submittedSheets.map((s) => (
              <div
                key={s.sheetId}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 20px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      Date: {s.date}
                    </span>
                    <span className={s.audit?.status === 'AUDITED_VERIFIED' ? 'badge badge-clean' : 'badge badge-brand'}>
                      {s.audit?.status || 'SUBMITTED'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Submitted by: <strong>{s.managerName}</strong> • {s.rooms?.occupiedCount || 0} Rooms Occupied
                  </div>
                  {s.audit?.auditedBy && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--emerald-primary)', fontWeight: 600, marginTop: '2px' }}>
                      Audited by {s.audit.auditedBy} • Notes: "{s.audit.auditNotes}"
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--emerald-primary)' }}>
                    ₦{((s.rooms?.roomRevenueTotal || 0) + (s.fbSales?.totalSalesAmount || 0)).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Cash in Hand: ₦{(s.reconciliation?.totalPhysicalCashHandover || 0).toLocaleString()}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                    <button
                      onClick={() => {
                        setSelectedDate(s.date);
                        setActiveTab('TODAY');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--brand-primary)',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      View / Audit Full Sheet →
                    </button>
                    {isSuperAdminOnly && (
                      <button
                        onClick={() => {
                          showConfirm(
                            'Delete Historical Sheet Permanently',
                            `Are you sure you want to completely purge Daily Operational Sheet #${s.sheetId} for ${s.date}? This data item will be removed from MongoDB Atlas and cannot be recovered.`,
                            async () => {
                              try {
                                const res = await fetch(`/api/operations?sheetId=${encodeURIComponent(s.sheetId)}&role=${encodeURIComponent(activeStaff.role)}&actorName=${encodeURIComponent(activeStaff.name)}`, {
                                  method: 'DELETE',
                                });
                                const data = await res.json();
                                if (data.success) {
                                  showSuccess('Sheet Purged', data.message || `Sheet #${s.sheetId} was deleted.`);
                                  loadSheets();
                                } else {
                                  showToast({ type: 'error', title: 'Delete Failed', message: data.error || 'Server error' });
                                }
                              } catch (e: any) {
                                showToast({ type: 'error', title: 'Network Error', message: e.message });
                              }
                            },
                            { confirmText: 'Purge Sheet', variant: 'danger' }
                          );
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--rose-primary)',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                        }}
                      >
                        Purge ×
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: ADD NEW MENU ITEM (MANAGER / STAFF)                  */}
      {/* ============================================================== */}
      {isAddMenuModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}>
          <div className="ent-card" style={{
            maxWidth: '540px',
            width: '100%',
            backgroundColor: '#FFFFFF',
            padding: '28px',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Fish size={22} color="var(--brand-primary)" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Add Dish / Drink to Menu Catalog
                </h3>
              </div>
              <button
                onClick={() => setIsAddMenuModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddMenuItem} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Dish / Drink Name:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Catch of the Day: Grilled Jumbo Croaker (by size)"
                  value={newMenuName}
                  onChange={(e) => setNewMenuName(e.target.value)}
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Department Category:
                  </label>
                  <select
                    value={newMenuCat}
                    onChange={(e) => setNewMenuCat(e.target.value as any)}
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  >
                    <option value="Swallow">Swallow</option>
                    <option value="Soups">Soups</option>
                    <option value="Rice Meals">Rice Meals</option>
                    <option value="Pasta Menu">Pasta Menu</option>
                    <option value="Proteins">Proteins</option>
                    <option value="Grill">Grill</option>
                    <option value="Bar">Bar</option>
                    <option value="Kitchen">Kitchen (General)</option>
                    <option value="Events">Events / Banquet</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Pricing Model:
                  </label>
                  <select
                    value={newMenuPricingType}
                    onChange={(e) => setNewMenuPricingType(e.target.value as any)}
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  >
                    <option value="OPEN_MARKET_PRICE">🐟 Open Market (By Size / Weight)</option>
                    <option value="DAILY_SPECIAL">⭐ Daily Chef Special</option>
                    <option value="SUGGESTED_BENCHMARK">📊 Suggested Benchmark</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Today's Rate / Price (₦):
                  </label>
                  <input
                    type="number"
                    required
                    value={newMenuSuggestedPrice}
                    onChange={(e) => setNewMenuSuggestedPrice(Number(e.target.value))}
                    style={{ width: '100%', fontWeight: 700 }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Cost Recovery Floor (₦):
                  </label>
                  <input
                    type="number"
                    disabled={!isSuperAdminOrAccountant}
                    value={isSuperAdminOrAccountant ? newMenuPriceFloor : Math.round(newMenuSuggestedPrice * 0.7)}
                    onChange={(e) => setNewMenuPriceFloor(Number(e.target.value))}
                    style={{ width: '100%', fontWeight: 700, backgroundColor: !isSuperAdminOrAccountant ? 'var(--bg-secondary)' : '#FFFFFF' }}
                  />
                  {!isSuperAdminOrAccountant && (
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      🔒 Floors are managed by Superadmin / Accountant
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Description & Presentation:
                </label>
                <textarea
                  rows={2}
                  value={newMenuDescription}
                  onChange={(e) => setNewMenuDescription(e.target.value)}
                  placeholder="e.g. Marinated with fresh resort garden scent leaves, grilled over charcoal, served with roasted plantain."
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddMenuModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary"
                >
                  {isLoading ? 'Saving...' : 'Add to Menu Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: SUPERADMIN / ACCOUNTANT ADMINISTRATIVE ADJUSTMENT     */}
      {/* ============================================================== */}
      {isAdminAdjustmentModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}>
          <div className="ent-card" style={{
            maxWidth: '600px',
            width: '100%',
            backgroundColor: '#FFFFFF',
            padding: '28px',
            maxHeight: '90vh',
            overflowY: 'auto',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldAlert size={24} color="var(--brand-primary)" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Administrative Adjustment & Override
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Sheet #{existingSheetForDate?.sheetId} • Submitted by {existingSheetForDate?.managerName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAdminAdjustmentModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{
              padding: '12px 16px',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '8px',
              marginBottom: '18px',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
            }}>
              <strong>Security & Compliance Notice:</strong> Records submitted by the manager are strictly immutable to the manager. You are updating this record as <strong>{activeStaff.name} ({activeStaff.role})</strong>. All adjustments are permanently stamped to the audit log with your justification.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
              <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Adjust Room Revenue Figures:
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Room Cash (₦)</label>
                  <input
                    type="number"
                    value={adjRoomCash}
                    onChange={(e) => setAdjRoomCash(Number(e.target.value))}
                    style={{ width: '100%', fontWeight: 700, fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Room POS (₦)</label>
                  <input
                    type="number"
                    value={adjRoomPOS}
                    onChange={(e) => setAdjRoomPOS(Number(e.target.value))}
                    style={{ width: '100%', fontWeight: 700, fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Room Transfer (₦)</label>
                  <input
                    type="number"
                    value={adjRoomTransfer}
                    onChange={(e) => setAdjRoomTransfer(Number(e.target.value))}
                    style={{ width: '100%', fontWeight: 700, fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <h4 style={{ margin: '10px 0 0', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Adjust Restaurant & Bar Sales:
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Food Total (₦)</label>
                  <input
                    type="number"
                    value={adjFbFood}
                    onChange={(e) => setAdjFbFood(Number(e.target.value))}
                    style={{ width: '100%', fontWeight: 700, fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Drinks Total (₦)</label>
                  <input
                    type="number"
                    value={adjFbDrinks}
                    onChange={(e) => setAdjFbDrinks(Number(e.target.value))}
                    style={{ width: '100%', fontWeight: 700, fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <h4 style={{ margin: '10px 0 0', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Adjust Physical Cash in Safe:
              </h4>
              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Verified Cash Handover (₦)</label>
                <input
                  type="number"
                  value={adjCashHandover}
                  onChange={(e) => setAdjCashHandover(Number(e.target.value))}
                  style={{ width: '100%', fontWeight: 700, fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--crimson-primary)', display: 'block', marginBottom: '6px' }}>
                  * Mandatory Audit Justification Reason:
                </label>
                <textarea
                  rows={3}
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  placeholder="e.g., Bank statement confirmed ₦50,000 POS difference from terminal roll. Stanbic bank portal verified."
                  style={{ width: '100%', fontSize: '0.85rem', border: '1px solid var(--crimson-primary)' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setIsAdminAdjustmentModalOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isLoading || !adjustmentReason.trim()}
                onClick={handleSaveAdministrativeAdjustment}
                className="btn-primary"
                style={{ backgroundColor: 'var(--crimson-primary)', borderColor: 'var(--crimson-primary)' }}
              >
                {isLoading ? 'Saving...' : 'Authorize & Commit Adjustment'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
