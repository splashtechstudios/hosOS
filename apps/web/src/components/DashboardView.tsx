'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Hotel, 
  UtensilsCrossed, 
  Calendar, 
  Download, 
  ShieldAlert, 
  FileSpreadsheet, 
  FileText,
  AlertTriangle,
  Clock,
  UserCheck,
  CheckCircle2,
  Building2,
  ChevronRight,
  FileCheck
} from 'lucide-react';
import { StaffUser } from '@hosos/types';
import { useFeedback } from '@/context/FeedbackContext';
import { ENTERPRISE_ORG } from '@/lib/mockData';

export default function DashboardView({ activeStaff }: { activeStaff: StaffUser }) {
  const { showSuccess } = useFeedback();
  const [dateRange, setDateRange] = useState<'TODAY' | 'WEEK' | 'MTD' | 'QTD'>('MTD');
  const [managerSheets, setManagerSheets] = useState<any[]>([]);

  useEffect(() => {
    async function fetchSheets() {
      try {
        const res = await fetch('/api/operations');
        const data = await res.json();
        if (data.success && data.sheets) {
          setManagerSheets(data.sheets);
        }
      } catch (err) {
        console.warn('Could not load manager sheets in dashboard:', err);
      }
    }
    fetchSheets();
  }, []);

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleExport = (reportType: string, exportEndpoint: string) => {
    window.open(exportEndpoint, '_blank');
    showSuccess(
      'Enterprise Report Exported Successfully',
      `${reportType} generated and signed for ${activeStaff.name}.`,
      'File downloaded and formatted for Nigerian FIRS tax compliance and executive board review.'
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px 0' }}>
      
      {/* 1. Executive Control Bar: Filters & Export Actions */}
      <div className="ent-card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Executive Performance & Loss Prevention Dashboard
              </h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Consolidated enterprise reporting across Hotel Rooms, F&B Outlets, Corporate Events, and Energy Infrastructure.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Date Range Selector */}
            <div style={{ display: 'flex', backgroundColor: 'var(--bg-secondary)', padding: '3px', borderRadius: 'var(--radius-sm)' }}>
              {(['TODAY', 'WEEK', 'MTD', 'QTD'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setDateRange(r)}
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    borderRadius: '4px',
                    backgroundColor: dateRange === r ? '#FFFFFF' : 'transparent',
                    color: dateRange === r ? 'var(--brand-primary)' : 'var(--text-secondary)',
                    boxShadow: dateRange === r ? 'var(--shadow-subtle)' : 'none',
                  }}
                >
                  {r === 'MTD' ? 'Month-to-Date' : r === 'QTD' ? 'Quarter-to-Date' : r}
                </button>
              ))}
            </div>

            {/* Export Reports Buttons */}
            <button
              onClick={() => handleExport('Daily Flash & Trial Balance (CSV)', '/api/reports/export?type=TRIAL_BALANCE')}
              className="btn-secondary"
              title="Download formal Daily Flash Report & Trial Balance"
            >
              <FileText size={15} color="var(--brand-primary)" />
              <span>Export Flash Balance</span>
            </button>

            <button
              onClick={() => handleExport('7.5% FIRS VAT & Consumption Tax Schedule (CSV)', '/api/reports/export?type=TAX_SCHEDULE')}
              className="btn-secondary"
              title="Download VAT Ledger for tax filings"
            >
              <FileSpreadsheet size={15} color="var(--emerald-primary)" />
              <span>Export Tax XLSX/CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Primary KPI Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
      }}>
        {/* Total Gross Revenue */}
        <div className="ent-card" style={{ padding: '20px', borderTop: '3px solid var(--brand-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Gross Revenue (MTD)
            </span>
            <span className="badge badge-clean">
              <TrendingUp size={12} /> +14.2%
            </span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {formatNaira(48920000)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Target: ₦45,000,000 (108.7% achieved)
          </div>
        </div>

        {/* Occupancy Rate */}
        <div className="ent-card" style={{ padding: '20px', borderTop: '3px solid var(--emerald-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Average Occupancy
            </span>
            <span className="badge badge-clean">
              <TrendingUp size={12} /> +6.5%
            </span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--emerald-primary)', fontFamily: 'var(--font-mono)' }}>
            76.2%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            5 of 7 rooms occupied today
          </div>
        </div>

        {/* ADR (Average Daily Rate) */}
        <div className="ent-card" style={{ padding: '20px', borderTop: '3px solid var(--amber-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              ADR (Avg Daily Rate)
            </span>
            <span className="badge badge-neutral">Stable</span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {formatNaira(142500)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Rack rate premium maintained
          </div>
        </div>

        {/* RevPAR */}
        <div className="ent-card" style={{ padding: '20px', borderTop: '3px solid var(--purple-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              RevPAR
            </span>
            <span className="badge badge-clean">
              <TrendingUp size={12} /> +8.1%
            </span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--purple-primary)', fontFamily: 'var(--font-mono)' }}>
            {formatNaira(108585)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Revenue per available room
          </div>
        </div>

        {/* Energy & Diesel OPEX */}
        <div className="ent-card" style={{ padding: '20px', borderTop: '3px solid var(--rose-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Diesel Energy OPEX
            </span>
            <span className="badge badge-dirty">7.0% of Rev</span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--rose-primary)', fontFamily: 'var(--font-mono)' }}>
            {formatNaira(3420000)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            2,533 Litres burnt @ ₦1,350/L
          </div>
        </div>
      </div>

      {/* 3. Revenue Breakdown by Department & Loss Prevention Alert Watchlist */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '20px' }}>
        
        {/* Department Revenue Contribution */}
        <div className="ent-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Departmental Revenue Distribution (MTD)
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Verified cash, POS terminal, verified transfer, and corporate accounts.
              </p>
            </div>
            <span className="badge badge-neutral">Audited Ledgers</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { name: 'Hotel Rooms & Suites', amount: 22500000, pct: 46, color: 'var(--brand-primary)' },
              { name: 'Restaurant & Room Service', amount: 12400000, pct: 25, color: 'var(--emerald-primary)' },
              { name: 'Corporate Events & Banqueting', amount: 8200000, pct: 17, color: 'var(--purple-primary)' },
              { name: 'Main Bar & Pool Lounge', amount: 4420000, pct: 9, color: 'var(--amber-primary)' },
              { name: 'Laundry & Ancillary Services', amount: 1400000, pct: 3, color: '#64748B' },
            ].map((dept) => (
              <div key={dept.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{dept.name}</span>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{formatNaira(dept.amount)}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', minWidth: '35px', textAlign: 'right' }}>
                      {dept.pct}%
                    </span>
                  </div>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${dept.pct}%`, height: '100%', backgroundColor: dept.color, borderRadius: '4px' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Loss Prevention & Anti-Fraud Watchlist */}
        <div className="ent-card" style={{ padding: '24px', borderLeft: '4px solid var(--amber-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <ShieldAlert size={20} color="var(--amber-primary)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Loss Prevention & Risk Watchlist
            </h3>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            System-flagged variances, high voids, manual discounts, and unverified bank transfers requiring executive review.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-clean">Transfer Verified</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>17:10 WAT</span>
              </div>
              <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
                ₦35,000 Bank Transfer Claim Verified
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Waiter Chidi Obi submitted • Approved by Fatima Sanusi (Funds cleared GTB #0291)
              </div>
            </div>

            <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-dirty">Stock Variance</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>16:00 WAT</span>
              </div>
              <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
                Hennessy VSOP Dipstick Count: -0.02 Btl Variance
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Main Bar Handover. Measured 2.85 btl vs theoretical 2.87 btl (Within 2% acceptable spillage).
              </div>
            </div>

            <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-clean">Generator Benchmark</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>18:00 WAT</span>
              </div>
              <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
                Perkins 250kVA Burn Rate: 27.5 L/hr (Normal)
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Engr. Tunde Bakare logged 8.0 run hours and 220L diesel added. Zero siphoning flag.
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 4. Manager Daily Operational Submissions Feed (Admin Full Oversight) */}
      <div className="ent-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileCheck size={20} color="var(--brand-primary)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Live Operational Logs & Daily Closures Submitted by Manager
              </h3>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
              Immutable record stream. All entries submitted by manager Babajide Ogundimu with cash tallies and audit stamps.
            </p>
          </div>
          <span className="badge badge-brand">
            {managerSheets.length} Submitted Reports
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="ent-table" style={{ width: '100%', fontSize: '0.825rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-secondary)', textAlign: 'left' }}>
                <th style={{ padding: '10px 14px' }}>Operational Date</th>
                <th style={{ padding: '10px 14px' }}>Manager Attribution</th>
                <th style={{ padding: '10px 14px' }}>Rooms Occupied</th>
                <th style={{ padding: '10px 14px' }}>Gross Revenue Inflow</th>
                <th style={{ padding: '10px 14px' }}>Cash Handover (Safe)</th>
                <th style={{ padding: '10px 14px' }}>Audit Status</th>
                <th style={{ padding: '10px 14px', textAlign: 'right' }}>Audited By</th>
              </tr>
            </thead>
            <tbody>
              {managerSheets.length > 0 ? (
                managerSheets.map((sheet) => {
                  const totalInflow = (sheet.rooms?.roomRevenueTotal || 0) + (sheet.fbSales?.totalSalesAmount || 0);
                  return (
                    <tr key={sheet.sheetId} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 800 }}>{sheet.date}</td>
                      <td style={{ padding: '10px 14px' }}>{sheet.managerName}</td>
                      <td style={{ padding: '10px 14px' }}>{sheet.rooms?.occupiedCount || 0} / 60 Rooms</td>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--emerald-primary)' }}>
                        ₦{totalInflow.toLocaleString()}
                      </td>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>
                        ₦{(sheet.reconciliation?.totalPhysicalCashHandover || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span className={`badge ${
                          sheet.audit?.status === 'AUDITED_VERIFIED'
                            ? 'badge-emerald'
                            : sheet.audit?.status === 'AUDIT_FLAGGED'
                            ? 'badge-rose'
                            : 'badge-amber'
                        }`} style={{ fontSize: '0.65rem' }}>
                          {sheet.audit?.status?.replace(/_/g, ' ') || 'SUBMITTED'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--text-muted)' }}>
                        {sheet.audit?.auditedBy || 'Awaiting Audit'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    No manager operational sheets loaded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
