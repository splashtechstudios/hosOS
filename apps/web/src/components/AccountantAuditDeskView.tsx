'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  Download, 
  FileCheck, 
  FileSpreadsheet, 
  Fuel, 
  Hotel, 
  Image as ImageIcon, 
  Lock, 
  MessageSquare, 
  Receipt, 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  TrendingUp, 
  UtensilsCrossed, 
  Wallet,
  AlertTriangle,
  ExternalLink,
  Filter
} from 'lucide-react';
import { StaffUser, DailyOperationalSheet } from '@hosos/types';
import { useFeedback } from '@/context/FeedbackContext';

interface AccountantAuditDeskViewProps {
  activeStaff: StaffUser;
}

export default function AccountantAuditDeskView({ activeStaff }: AccountantAuditDeskViewProps) {
  const { showConfirm, showSuccess, showFailed, showToast } = useFeedback();

  const [sheets, setSheets] = useState<DailyOperationalSheet[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<DailyOperationalSheet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState('');
  const [auditNotesInput, setAuditNotesInput] = useState('');
  const [isStamping, setIsStamping] = useState(false);

  // Fetch operational sheets
  const loadSheets = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/operations');
      const data = await res.json();
      if (data.success && data.sheets && data.sheets.length > 0) {
        setSheets(data.sheets);
        setSelectedSheet(data.sheets[0]);
        setAuditNotesInput(data.sheets[0]?.audit?.auditNotes || '');
      }
    } catch (e) {
      console.warn('Could not load audit sheets:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSheets();
  }, []);

  // When selected sheet changes, update local audit notes input
  useEffect(() => {
    if (selectedSheet) {
      setAuditNotesInput(selectedSheet.audit?.auditNotes || '');
    }
  }, [selectedSheet?.sheetId]);

  // Handle Accountant Audit Stamping (Read-only verification / review flag)
  const handleApplyAuditStamp = (newStatus: 'AUDITED_VERIFIED' | 'AUDIT_FLAGGED') => {
    if (!selectedSheet) return;

    const actionTitle =
      newStatus === 'AUDITED_VERIFIED' ? 'Verify & Stamp Daily Sheet' : 'Flag Sheet for Manager Clarification';

    showConfirm(
      actionTitle,
      `Are you sure you want to stamp the daily operational sheet for ${selectedSheet.date} as ${newStatus.replace(/_/g, ' ')}? Note: As an auditor, raw financial records entered by the manager are immutable and will remain preserved.`,
      async () => {
        setIsStamping(true);
        try {
          const res = await fetch('/api/operations', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sheetId: selectedSheet.sheetId,
              status: newStatus,
              auditedBy: `${activeStaff.name} (Accountant)`,
              auditNotes: auditNotesInput,
              varianceAmount: selectedSheet.reconciliation?.cashDiscrepancy || 0,
              discrepanciesFound:
                (selectedSheet.reconciliation?.cashDiscrepancy || 0) !== 0
                  ? [`Cash variance: ₦${(selectedSheet.reconciliation?.cashDiscrepancy || 0).toLocaleString()}`]
                  : [],
            }),
          });

          const result = await res.json();
          if (result.success) {
            showSuccess(
              newStatus === 'AUDITED_VERIFIED' ? 'Daily Audit Verified!' : 'Audit Discrepancy Flagged',
              `Sheet #${selectedSheet.sheetId} has been stamped by ${activeStaff.name}.`,
              `Notes recorded: "${auditNotesInput}". Saved to immutable MongoDB Atlas audit trail.`
            );
            loadSheets();
          } else {
            showFailed('Audit Stamping Failed', result.error || 'Server error occurred');
          }
        } catch (err: any) {
          showFailed('Network Error', err.message || 'Could not apply audit stamp');
        } finally {
          setIsStamping(false);
        }
      },
      {
        confirmText: newStatus === 'AUDITED_VERIFIED' ? 'Stamp as Verified' : 'Flag Discrepancy',
        cancelText: 'Cancel',
        variant: newStatus === 'AUDITED_VERIFIED' ? 'primary' : 'danger',
      }
    );
  };

  // Export Daily Audit Schedule to CSV (Sage / QuickBooks export)
  const handleExportCSV = () => {
    if (!selectedSheet) return;

    const s = selectedSheet;
    const grossInflow = (s.rooms?.roomRevenueTotal || 0) + (s.fbSales?.totalSalesAmount || 0);
    const vat75 = Math.round(grossInflow * 0.075);
    const consumptionTax5 = Math.round(grossInflow * 0.05);
    const totalOutflow = s.energyExpenses?.totalExpenses || 0;
    const netCash = grossInflow - totalOutflow;

    const csvRows = [
      ['OSIEKA RESORT — NO. 3 RESORT CLOSE, AIYEROMI QUARTERS, OGORI, KOGI STATE'],
      ['INTERNAL FINANCIAL AUDIT SCHEDULE'],
      ['Audit Sheet Reference', s.sheetId],
      ['Operational Business Date', s.date],
      ['Auditing Officer', activeStaff.name],
      ['Operational Manager', s.managerName],
      ['Audit Status', s.audit?.status || 'SUBMITTED'],
      [''],
      ['SECTION', 'LINE ITEM', 'AMOUNT (NGN)'],
      ['ACCOMMODATION', 'Rooms Cash Collected', s.rooms?.roomRevenueCash || 0],
      ['ACCOMMODATION', 'Rooms POS Terminal Collected', s.rooms?.roomRevenuePOS || 0],
      ['ACCOMMODATION', 'Rooms Bank Transfer Credit', s.rooms?.roomRevenueTransfer || 0],
      ['ACCOMMODATION', 'Total Room Revenue', s.rooms?.roomRevenueTotal || 0],
      ['FOOD & BEVERAGE', 'Kitchen Food Sales', s.fbSales?.foodSalesAmount || 0],
      ['FOOD & BEVERAGE', 'Bar Drinks Sales', s.fbSales?.drinksSalesAmount || 0],
      ['FOOD & BEVERAGE', 'Total F&B Sales', s.fbSales?.totalSalesAmount || 0],
      ['TAX ACCRUALS', 'FIRS VAT (7.5%)', vat75],
      ['TAX ACCRUALS', 'State Consumption Tax (5.0%)', consumptionTax5],
      ['ENERGY & EXPENSES', 'Diesel Expense', s.energyExpenses?.totalDieselCost || 0],
      ['ENERGY & EXPENSES', 'Petty Cash Supplies', (s.energyExpenses?.totalExpenses || 0) - (s.energyExpenses?.totalDieselCost || 0)],
      ['ENERGY & EXPENSES', 'Total Operational Outflow', totalOutflow],
      ['NET POSITION', 'Net Operating Daily Cash Inflow', netCash],
      ['CASH RECONCILIATION', 'Expected Physical Cash', s.reconciliation?.expectedCashOnHand || 0],
      ['CASH RECONCILIATION', 'Physical Cash Counted in Safe', s.reconciliation?.totalPhysicalCashHandover || 0],
      ['CASH RECONCILIATION', 'Audited Discrepancy Variance', s.reconciliation?.cashDiscrepancy || 0],
      [''],
      ['AUDITOR NOTES', s.audit?.auditNotes || 'None'],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Osieka_Resort_Audit_Schedule_${s.date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast({
      type: 'success',
      title: 'Audit Schedule Exported',
      message: `Downloaded Osieka_Resort_Audit_Schedule_${s.date}.csv for Sage / QuickBooks import.`,
    });
  };

  const filteredSheets = sheets.filter(
    (s) =>
      s.date.includes(filterQuery) ||
      s.managerName.toLowerCase().includes(filterQuery.toLowerCase()) ||
      s.sheetId.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '60px' }}>
      
      {/* 1. Sage / QuickBooks Professional Audit Header */}
      <div className="ent-card" style={{ padding: '20px 24px', backgroundColor: '#FFFFFF' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: 'var(--emerald-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
              }}>
                <FileCheck size={22} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Financial Audit & Daily Reconciliation Desk
                  </h1>
                  <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                    Sage / QuickBooks Core
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                  Osieka Resort & Suites • Acting Auditor: <strong>{activeStaff.name}</strong> ({activeStaff.role})
                </p>
              </div>
            </div>
          </div>

          {/* Read-Only Badge & CSV Export */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleExportCSV}
              disabled={!selectedSheet}
              className="btn-secondary"
              style={{ padding: '8px 14px', fontSize: '0.8rem', gap: '6px' }}
            >
              <Download size={14} />
              <span>Export CSV Schedule</span>
            </button>
          </div>
        </div>

        {/* STRICT AUDITOR READ-ONLY NOTICE BANNER */}
        <div style={{
          marginTop: '16px',
          padding: '10px 16px',
          backgroundColor: 'rgba(37, 99, 235, 0.05)',
          border: '1px solid rgba(37, 99, 235, 0.2)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.775rem',
          color: 'var(--text-secondary)',
        }}>
          <ShieldCheck size={16} color="var(--brand-primary)" flex-shrink="0" />
          <span>
            <strong>🛡️ Read-Only Audit Mode Active:</strong> You hold full Super Admin visibility into all resort folios, cash counts, and ledgers, but <strong>zero mutation actions</strong> are permitted. Transactions entered by the manager cannot be altered or deleted. You may verify, flag discrepancies, or export audit files.
          </span>
        </div>
      </div>

      {/* 2. Main Audit Split View: Left List of Days, Right Detailed Journal */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: Daily Audit Register */}
        <div className="ent-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Daily Sheets Register
            </h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {filteredSheets.length} Days
            </span>
          </div>

          {/* Quick Filter */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--bg-secondary)',
            padding: '6px 10px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
          }}>
            <Search size={13} color="var(--text-muted)" />
            <input
              placeholder="Search date or manager..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontSize: '0.75rem', outline: 'none', width: '100%' }}
            />
          </div>

          {/* Sheets List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '600px', overflowY: 'auto' }}>
            {filteredSheets.map((s) => {
              const isSelected = selectedSheet?.sheetId === s.sheetId;
              const hasDiscrepancy = (s.reconciliation?.cashDiscrepancy || 0) !== 0;

              return (
                <div
                  key={s.sheetId}
                  onClick={() => setSelectedSheet(s)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: isSelected ? '2px solid var(--brand-primary)' : '1px solid var(--border-color)',
                    backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.04)' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
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
                      style={{ fontSize: '0.625rem' }}
                    >
                      {s.audit?.status?.replace(/_/g, ' ') || 'SUBMITTED'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                    Mgr: {s.managerName}
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '8px',
                    paddingTop: '6px',
                    borderTop: '1px solid var(--border-subtle)',
                  }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      ₦{((s.rooms?.roomRevenueTotal || 0) + (s.fbSales?.totalSalesAmount || 0)).toLocaleString()}
                    </span>
                    {hasDiscrepancy ? (
                      <span style={{ fontSize: '0.675rem', color: 'var(--rose-primary)', fontWeight: 700 }}>
                        ⚠ Variance
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.675rem', color: 'var(--emerald-primary)', fontWeight: 700 }}>
                        ✓ Balanced
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Detailed Sage / QuickBooks Trial Balance & Reconciliation */}
        {selectedSheet ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Top Financial Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
              
              <div className="ent-card" style={{ padding: '16px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Inflow (Rooms + F&B)</span>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--emerald-primary)', marginTop: '4px' }}>
                  ₦{((selectedSheet.rooms?.roomRevenueTotal || 0) + (selectedSheet.fbSales?.totalSalesAmount || 0)).toLocaleString()}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Rooms: ₦{(selectedSheet.rooms?.roomRevenueTotal || 0).toLocaleString()} • F&B: ₦{(selectedSheet.fbSales?.totalSalesAmount || 0).toLocaleString()}
                </div>
              </div>

              <div className="ent-card" style={{ padding: '16px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Outflow (Diesel + Petty)</span>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--amber-primary)', marginTop: '4px' }}>
                  ₦{(selectedSheet.energyExpenses?.totalExpenses || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Diesel: ₦{(selectedSheet.energyExpenses?.totalDieselCost || 0).toLocaleString()} ({selectedSheet.energyExpenses?.dieselLitresPurchased || 0}L)
                </div>
              </div>

              <div className="ent-card" style={{ padding: '16px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Net Daily Cash Surplus</span>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--brand-primary)', marginTop: '4px' }}>
                  ₦{(
                    (selectedSheet.rooms?.roomRevenueTotal || 0) +
                    (selectedSheet.fbSales?.totalSalesAmount || 0) -
                    (selectedSheet.energyExpenses?.totalExpenses || 0)
                  ).toLocaleString()}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Operating Margin: {Math.round(
                    (((selectedSheet.rooms?.roomRevenueTotal || 0) +
                      (selectedSheet.fbSales?.totalSalesAmount || 0) -
                      (selectedSheet.energyExpenses?.totalExpenses || 0)) /
                      Math.max(1, (selectedSheet.rooms?.roomRevenueTotal || 0) + (selectedSheet.fbSales?.totalSalesAmount || 0))) *
                      100
                  )}%
                </div>
              </div>

              <div className="ent-card" style={{ padding: '16px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Cash Handover Variance</span>
                <div style={{
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: (selectedSheet.reconciliation?.cashDiscrepancy || 0) === 0 ? 'var(--emerald-primary)' : 'var(--rose-primary)',
                  marginTop: '4px',
                }}>
                  ₦{(selectedSheet.reconciliation?.cashDiscrepancy || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {(selectedSheet.reconciliation?.cashDiscrepancy || 0) === 0 ? 'Zero Discrepancy' : 'Auditor flag required'}
                </div>
              </div>

            </div>

            {/* Reconciliation Double-Entry Table */}
            <div className="ent-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Three-Way Inflow Reconciliation: Cash vs POS vs Bank Transfer
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                    Verify manager claimed channel collections against bank settlements
                  </p>
                </div>
                <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>
                  Ref: {selectedSheet.sheetId}
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                      <th style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-secondary)' }}>Revenue Channel</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-secondary)' }}>💵 Cash in Hand</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-secondary)' }}>💳 POS Terminal</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-secondary)' }}>🏦 Bank Direct Transfer</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-secondary)', textAlign: 'right' }}>Total Audited</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600 }}>🏨 Rooms & Suites Division</td>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>₦{(selectedSheet.rooms?.roomRevenueCash || 0).toLocaleString()}</td>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>₦{(selectedSheet.rooms?.roomRevenuePOS || 0).toLocaleString()}</td>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>₦{(selectedSheet.rooms?.roomRevenueTransfer || 0).toLocaleString()}</td>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontWeight: 700, textAlign: 'right' }}>
                        ₦{(selectedSheet.rooms?.roomRevenueTotal || 0).toLocaleString()}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600 }}>🍽️ Restaurant & Main Bar F&B</td>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>₦{(selectedSheet.fbSales?.cashReceived || 0).toLocaleString()}</td>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>₦{(selectedSheet.fbSales?.posTerminalReceived || 0).toLocaleString()}</td>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>₦{(selectedSheet.fbSales?.bankTransferReceived || 0).toLocaleString()}</td>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontWeight: 700, textAlign: 'right' }}>
                        ₦{(selectedSheet.fbSales?.totalSalesAmount || 0).toLocaleString()}
                      </td>
                    </tr>
                    <tr style={{ backgroundColor: 'rgba(37, 99, 235, 0.04)', fontWeight: 800 }}>
                      <td style={{ padding: '12px 14px', color: 'var(--brand-primary)' }}>Total Gross Channel Inflows</td>
                      <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)' }}>
                        ₦{((selectedSheet.rooms?.roomRevenueCash || 0) + (selectedSheet.fbSales?.cashReceived || 0)).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)' }}>
                        ₦{((selectedSheet.rooms?.roomRevenuePOS || 0) + (selectedSheet.fbSales?.posTerminalReceived || 0)).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)' }}>
                        ₦{((selectedSheet.rooms?.roomRevenueTransfer || 0) + (selectedSheet.fbSales?.bankTransferReceived || 0)).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', textAlign: 'right', color: 'var(--emerald-primary)' }}>
                        ₦{((selectedSheet.rooms?.roomRevenueTotal || 0) + (selectedSheet.fbSales?.totalSalesAmount || 0)).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Petty Cash & Diesel Audit Breakdown */}
            <div className="ent-card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
                Outflows & Fuel Consumption Audit
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ padding: '14px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    Generator Burn Rate Check:
                  </span>
                  <div style={{ marginTop: '6px', fontSize: '0.825rem', lineHeight: 1.5 }}>
                    <div>Hours Run: <strong>{selectedSheet.energyExpenses?.generatorRunHours || 0} Hours</strong></div>
                    <div>Diesel Litres: <strong>{selectedSheet.energyExpenses?.dieselLitresPurchased || 0} Litres</strong> @ ₦{selectedSheet.energyExpenses?.dieselPricePerLitre || 1250}/L</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px' }}>
                      Burn Rate: {Math.round(((selectedSheet.energyExpenses?.dieselLitresPurchased || 0) / Math.max(1, selectedSheet.energyExpenses?.generatorRunHours || 1)) * 10) / 10} L/Hr (Benchmark: 14.1 L/Hr)
                    </div>
                  </div>
                </div>

                <div style={{ padding: '14px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    Petty Cash Purchases ({selectedSheet.energyExpenses?.otherPettyExpenses?.length || 0} Items):
                  </span>
                  <div style={{ marginTop: '6px', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {selectedSheet.energyExpenses?.otherPettyExpenses?.map((p, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{p.title} ({p.paidVia})</span>
                        <strong style={{ fontFamily: 'var(--font-mono)' }}>₦{p.amount.toLocaleString()}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Attached Receipt Images Preview */}
            <div className="ent-card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
                Attached POS Settlement & Waybill Receipts
              </h3>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {selectedSheet.reconciliation?.receiptPhotoUrls && selectedSheet.reconciliation?.receiptPhotoUrls.length > 0 ? (
                  selectedSheet.reconciliation?.receiptPhotoUrls.map((r, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '12px 16px',
                        backgroundColor: 'var(--bg-secondary)',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                      }}
                    >
                      <ImageIcon size={18} color="var(--brand-primary)" />
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{r}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--emerald-primary)' }}>Attached by Manager</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No images attached for this day.</span>
                )}
              </div>
            </div>

            {/* AUDITOR STAMPING & ACTIONS (IMMUTABLE AUDIT TRAIL) */}
            <div className="ent-card" style={{ padding: '20px', backgroundColor: '#FFFFFF', border: '2px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Auditor Sign-off & Verification Stamping
                </h3>
                <span className="badge badge-brand" style={{ fontSize: '0.65rem' }}>
                  Auditor: {activeStaff.name}
                </span>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Audit Review Notes & Reconciliation Memo:
                </label>
                <textarea
                  rows={3}
                  value={auditNotesInput}
                  onChange={(e) => setAuditNotesInput(e.target.value)}
                  placeholder="Record your cross-checking notes against Moniepoint/Zenith bank statement..."
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  disabled={isStamping}
                  onClick={() => handleApplyAuditStamp('AUDIT_FLAGGED')}
                  className="btn-danger"
                  style={{ padding: '9px 18px', fontSize: '0.85rem', gap: '6px' }}
                >
                  <AlertTriangle size={15} />
                  <span>Flag Discrepancy for Clarification</span>
                </button>

                <button
                  type="button"
                  disabled={isStamping}
                  onClick={() => handleApplyAuditStamp('AUDITED_VERIFIED')}
                  className="btn-primary"
                  style={{
                    padding: '9px 22px',
                    fontSize: '0.85rem',
                    gap: '6px',
                    backgroundColor: 'var(--emerald-primary)',
                    borderColor: 'var(--emerald-border)',
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>✓ Stamp as Audited & Reconciled</span>
                </button>
              </div>
            </div>

          </div>
        ) : (
          <div className="ent-card" style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)' }}>Select an operational date from the register to audit.</p>
          </div>
        )}

      </div>

    </div>
  );
}
