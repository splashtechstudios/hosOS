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
  FileCheck
} from 'lucide-react';
import { StaffUser, DailyOperationalSheet, DailyPettyExpense } from '@hosos/types';
import { useFeedback } from '@/context/FeedbackContext';

interface DailyOperationsViewProps {
  activeStaff: StaffUser;
}

export default function DailyOperationsView({ activeStaff }: DailyOperationsViewProps) {
  const { showConfirm, showSuccess, showFailed, showToast } = useFeedback();

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<'TODAY' | 'HISTORY'>('TODAY');
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [submittedSheets, setSubmittedSheets] = useState<DailyOperationalSheet[]>([]);

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

  // 3. Generator & Diesel & Petty Cash
  const [ranGenerator, setRanGenerator] = useState<boolean>(true);
  const [genHours, setGenHours] = useState<number>(8.5);
  const [dieselLitres, setDieselLitres] = useState<number>(120);
  const [dieselPricePerLitre, setDieselPricePerLitre] = useState<number>(1250);
  const [pettyExpenses, setPettyExpenses] = useState<DailyPettyExpense[]>([
    { id: '1', title: 'Market Food Stuffs & Fresh Fish', amount: 45000, paidVia: 'CASH', receiptAttached: true },
    { id: '2', title: 'Cooking Gas Refill 50kg', amount: 48000, paidVia: 'TRANSFER', receiptAttached: true },
    { id: '3', title: 'Housekeeping Laundry Detergents', amount: 15000, paidVia: 'CASH', receiptAttached: true },
  ]);

  // 4. Physical Cash & Reconciliation
  const [physicalCashHandover, setPhysicalCashHandover] = useState<number>(410000);
  const [managerNotes, setManagerNotes] = useState<string>(
    'Busy Friday corporate arrivals. Generator ran from 8:00 AM to 4:30 PM until Disco restored power.'
  );
  const [uploadedReceipts, setUploadedReceipts] = useState<string[]>([
    'POS_Terminal_Batch_Slip_Oct23.png',
    'Diesel_Waybill_Receipt_120L.png',
  ]);

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

  // Completion calculation (Monday.com style)
  const isSection1Done = totalRoomRevenue > 0;
  const isSection2Done = totalFbSales > 0;
  const isSection3Done = !ranGenerator || (genHours > 0 && dieselLitres >= 0);
  const isSection4Done = physicalCashHandover > 0 && uploadedReceipts.length > 0;

  const completedSections = [isSection1Done, isSection2Done, isSection3Done, isSection4Done].filter(Boolean).length;
  const completionPercentage = Math.round((completedSections / 4) * 100);

  // Fetch submitted sheets on mount
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

  useEffect(() => {
    loadSheets();
  }, []);

  // Add Petty Expense Handler
  const handleAddExpense = () => {
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
    setPettyExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Simulate receipt file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  // Submit Daily Close Handler
  const handleSubmitDailyClose = () => {
    showConfirm(
      "Confirm Submission of Today's Resort Operations",
      `Are you sure you want to lock and submit the daily operations for ${selectedDate}? Total Gross Revenue: ₦${totalGrossRevenue.toLocaleString()} | Cash in Safe: ₦${physicalCashHandover.toLocaleString()}. Kelechi (Accountant) will receive this sheet for audit.`,
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
              `Total Inflow: ₦${totalGrossRevenue.toLocaleString()} • Cash Handover: ₦${physicalCashHandover.toLocaleString()} • Accountant notified for verification.`
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
        confirmText: 'Submit Daily Sheet',
        cancelText: 'Check Again',
        variant: 'primary',
      }
    );
  };

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
                  Simple daily record for Manager <strong>{activeStaff.name}</strong> • Fill each section below and submit
                </p>
              </div>
            </div>
          </div>

          {/* Date Picker & Tab Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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

            <div style={{ display: 'flex', backgroundColor: 'var(--bg-secondary)', padding: '3px', borderRadius: '8px' }}>
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
                }}
              >
                Today's Entry
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
                }}
              >
                Past Logs ({submittedSheets.length})
              </button>
            </div>
          </div>
        </div>

        {/* Monday.com Progress Bar */}
        {activeTab === 'TODAY' && (
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Daily Completion: {completedSections} of 4 Sections Complete
              </span>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: completionPercentage === 100 ? 'var(--emerald-primary)' : 'var(--brand-primary)',
              }}>
                {completionPercentage}% Ready
              </span>
            </div>
            <div style={{ height: '8px', backgroundColor: 'var(--bg-secondary)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${completionPercentage}%`,
                backgroundColor: completionPercentage === 100 ? 'var(--emerald-primary)' : 'var(--brand-primary)',
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>
        )}
      </div>

      {/* VIEW PAST LOGS */}
      {activeTab === 'HISTORY' ? (
        <div className="ent-card" style={{ padding: '20px' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
            Historical Submitted Operational Logs (Osieka Resort)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {submittedSheets.map((s) => (
              <div
                key={s.sheetId}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 18px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {s.date}
                    </span>
                    <span
                      className={`badge ${
                        s.audit?.status === 'AUDITED_VERIFIED'
                          ? 'badge-emerald'
                          : s.audit?.status === 'AUDIT_FLAGGED'
                          ? 'badge-rose'
                          : 'badge-amber'
                      }`}
                      style={{ fontSize: '0.65rem' }}
                    >
                      {s.audit?.status?.replace(/_/g, ' ') || 'SUBMITTED'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Logged by {s.managerName} • {s.rooms?.occupiedCount || 0} Rooms Occupied • Net Inflow: ₦
                    {((s.rooms?.roomRevenueTotal || 0) + (s.fbSales?.totalSalesAmount || 0)).toLocaleString()}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--emerald-primary)' }}>
                    ₦{((s.rooms?.roomRevenueTotal || 0) + (s.fbSales?.totalSalesAmount || 0)).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Cash in Hand: ₦{(s.reconciliation?.totalPhysicalCashHandover || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* TODAY'S EASY DATA ENTRY (MONDAY.COM DESIGN) */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* SECTION 1: ROOMS DIVISION */}
          <div className="ent-card" style={{ padding: '24px' }}>
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
                  value={occupiedRooms}
                  onChange={(e) => setOccupiedRooms(Number(e.target.value))}
                  style={{ width: '100%', fontSize: '1.25rem', fontWeight: 800, marginTop: '4px' }}
                />
              </div>

              <div style={{ padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Vacant Clean (Ready)</span>
                <input
                  type="number"
                  value={vacantCleanRooms}
                  onChange={(e) => setVacantCleanRooms(Number(e.target.value))}
                  style={{ width: '100%', fontSize: '1.25rem', fontWeight: 800, marginTop: '4px' }}
                />
              </div>

              <div style={{ padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Vacant Dirty (Housekeeping)</span>
                <input
                  type="number"
                  value={vacantDirtyRooms}
                  onChange={(e) => setVacantDirtyRooms(Number(e.target.value))}
                  style={{ width: '100%', fontSize: '1.25rem', fontWeight: 800, marginTop: '4px' }}
                />
              </div>

              <div style={{ padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Out of Service / Repair</span>
                <input
                  type="number"
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
          <div className="ent-card" style={{ padding: '24px' }}>
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
                    Step 2: Restaurant & Bar Sales
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                    Daily kitchen food and bar drink sales
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
                  value={drinksSales}
                  onChange={(e) => setDrinksSales(Number(e.target.value))}
                  style={{ width: '100%', fontSize: '1.1rem', fontWeight: 700, marginTop: '4px' }}
                />
              </div>
            </div>

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
                  💵 Cash Paid (₦)
                </label>
                <input
                  type="number"
                  value={fbCash}
                  onChange={(e) => setFbCash(Number(e.target.value))}
                  style={{ width: '100%', fontWeight: 700, marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  💳 POS Machine (₦)
                </label>
                <input
                  type="number"
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

          {/* SECTION 3: GENERATOR, DIESEL & PETTY EXPENSES */}
          <div className="ent-card" style={{ padding: '24px' }}>
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
                    Generator run hours and small cash purchases for today
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
            }}>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Did we run generator today?
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Track diesel consumption and prevent fuel diversion
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setRanGenerator(true)}
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
                  Yes, Generator Ran
                </button>
                <button
                  type="button"
                  onClick={() => setRanGenerator(false)}
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
                  No, PHCN/NEPA All Day
                </button>
              </div>
            </div>

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
                    ⏱️ Total Hours Generator Ran
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={genHours}
                    onChange={(e) => setGenHours(Number(e.target.value))}
                    style={{ width: '100%', fontWeight: 700, marginTop: '4px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    🛢️ Litres of Diesel Bought Today
                  </label>
                  <input
                    type="number"
                    value={dieselLitres}
                    onChange={(e) => setDieselLitres(Number(e.target.value))}
                    style={{ width: '100%', fontWeight: 700, marginTop: '4px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Price Per Litre (Default: ₦1,250)
                  </label>
                  <input
                    type="number"
                    value={dieselPricePerLitre}
                    onChange={(e) => setDieselPricePerLitre(Number(e.target.value))}
                    style={{ width: '100%', fontWeight: 700, marginTop: '4px' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Calculated Diesel Expense:</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--amber-primary)' }}>
                    ₦{totalDieselCost.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Petty Cash Purchases */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Today's Petty Cash & Market Expenses:
              </h4>
              <button
                type="button"
                onClick={handleAddExpense}
                className="btn-secondary"
                style={{ fontSize: '0.75rem', padding: '4px 10px' }}
              >
                <Plus size={13} />
                <span>+ Add Market Item</span>
              </button>
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
                    borderRadius: '8px',
                  }}
                >
                  <input
                    type="text"
                    value={expense.title}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPettyExpenses((prev) =>
                        prev.map((item) => (item.id === expense.id ? { ...item, title: val } : item))
                      );
                    }}
                    style={{ flex: 1, fontSize: '0.85rem' }}
                    placeholder="Expense description (e.g. ice blocks, gas, market fish)"
                  />

                  <div style={{ width: '130px' }}>
                    <input
                      type="number"
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

                  <button
                    type="button"
                    onClick={() => handleRemoveExpense(expense.id)}
                    style={{ padding: '6px', color: 'var(--rose-primary)', background: 'transparent' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: '14px',
              padding: '10px 14px',
              backgroundColor: 'rgba(245, 158, 11, 0.08)',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--amber-primary)' }}>
                Total Operational Expenses (Diesel + Petty):
              </span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--amber-primary)' }}>
                ₦{totalOperationalOutflow.toLocaleString()}
              </span>
            </div>
          </div>

          {/* SECTION 4: CASH HANDOVER & PHOTO UPLOAD */}
          <div className="ent-card" style={{ padding: '24px' }}>
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
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              padding: '16px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              marginBottom: '20px',
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Calculated Cash Left (Expected):
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                  ₦{expectedCashOnHand.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  (Room Cash ₦{roomCash.toLocaleString()} + FB Cash ₦{fbCash.toLocaleString()}) - Petty Cash ₦{cashPaidPettyExpenses.toLocaleString()}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Physical Cash Counted in Safe (₦):
                </label>
                <input
                  type="number"
                  value={physicalCashHandover}
                  onChange={(e) => setPhysicalCashHandover(Number(e.target.value))}
                  style={{ width: '100%', fontSize: '1.25rem', fontWeight: 800, marginTop: '4px', borderColor: cashDifference !== 0 ? 'var(--amber-primary)' : 'var(--emerald-primary)' }}
                />
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '10px',
                borderRadius: '8px',
                backgroundColor: cashDifference === 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: cashDifference === 0 ? 'var(--emerald-primary)' : 'var(--rose-primary)' }}>
                  {cashDifference === 0 ? '✓ Cash Perfectly Balanced' : `⚠ Variance: ₦${cashDifference.toLocaleString()}`}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {cashDifference === 0
                    ? 'Physical cash matches sales calculation.'
                    : 'Accountant will audit this discrepancy.'}
                </span>
              </div>
            </div>

            {/* Photo Attachment & Upload Section */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                📸 Snap / Attach POS Settlement Roll & Diesel Waybill:
              </label>

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
                value={managerNotes}
                onChange={(e) => setManagerNotes(e.target.value)}
                placeholder="Mention any power cuts, special events, or customer issues here..."
                style={{ width: '100%', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {/* GRAND SUBMIT BUTTON (MONDAY.COM STYLE) */}
          <div style={{
            position: 'sticky',
            bottom: '20px',
            backgroundColor: '#FFFFFF',
            padding: '16px 24px',
            borderRadius: '12px',
            border: '2px solid var(--brand-primary)',
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
                Ready to Close Today ({selectedDate})?
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Total Revenue: <strong>₦{totalGrossRevenue.toLocaleString()}</strong> • Cash Handover: <strong>₦{physicalCashHandover.toLocaleString()}</strong>
              </div>
            </div>

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
          </div>

        </div>
      )}

    </div>
  );
}
