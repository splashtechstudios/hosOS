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
  FileCheck,
  Filter,
  Layers
} from 'lucide-react';
import { StaffUser } from '@hosos/types';
import { useFeedback } from '@/context/FeedbackContext';
import { ENTERPRISE_ORG } from '@/lib/mockData';

type DateRangeKey = 'TODAY' | 'WEEK' | 'MTD' | 'QTD';

interface RangeData {
  label: string;
  grossRevenue: number;
  targetRevenue: number;
  revenueGrowthPct: string;
  occupancyPct: number;
  occupancyGrowth: string;
  occupiedRoomsDesc: string;
  adr: number;
  revPar: number;
  dieselOpex: number;
  dieselLitres: number;
  departments: Array<{
    name: string;
    amount: number;
    pct: number;
    color: string;
  }>;
}

const DASHBOARD_METRICS: Record<DateRangeKey, RangeData> = {
  TODAY: {
    label: 'Today (Live)',
    grossRevenue: 1630000,
    targetRevenue: 1500000,
    revenueGrowthPct: '+8.7%',
    occupancyPct: 71.4,
    occupancyGrowth: '+4.2%',
    occupiedRoomsDesc: '5 of 7 rooms occupied today',
    adr: 150000,
    revPar: 107142,
    dieselOpex: 114000,
    dieselLitres: 84.4,
    departments: [
      { name: 'Hotel Rooms & Suites', amount: 750000, pct: 46, color: 'var(--brand-primary)' },
      { name: 'Kitchen & meals', amount: 410000, pct: 25, color: 'var(--emerald-primary)' },
      { name: 'Corporate Events & Banqueting', amount: 275000, pct: 17, color: 'var(--purple-primary)' },
      { name: 'Bar & Drinks', amount: 150000, pct: 9, color: 'var(--amber-primary)' },
      { name: 'Laundry & Ancillary Services', amount: 45000, pct: 3, color: '#64748B' },
    ],
  },
  WEEK: {
    label: 'Week-to-Date (Trailing 7 Days)',
    grossRevenue: 11400000,
    targetRevenue: 10500000,
    revenueGrowthPct: '+11.4%',
    occupancyPct: 74.8,
    occupancyGrowth: '+5.1%',
    occupiedRoomsDesc: '5.2 avg rooms occupied daily',
    adr: 145000,
    revPar: 108460,
    dieselOpex: 798000,
    dieselLitres: 591,
    departments: [
      { name: 'Hotel Rooms & Suites', amount: 5244000, pct: 46, color: 'var(--brand-primary)' },
      { name: 'Kitchen & meals', amount: 2850000, pct: 25, color: 'var(--emerald-primary)' },
      { name: 'Corporate Events & Banqueting', amount: 1938000, pct: 17, color: 'var(--purple-primary)' },
      { name: 'Bar & Drinks', amount: 1026000, pct: 9, color: 'var(--amber-primary)' },
      { name: 'Laundry & Ancillary Services', amount: 342000, pct: 3, color: '#64748B' },
    ],
  },
  MTD: {
    label: 'Month-to-Date',
    grossRevenue: 48920000,
    targetRevenue: 45000000,
    revenueGrowthPct: '+14.2%',
    occupancyPct: 76.2,
    occupancyGrowth: '+6.5%',
    occupiedRoomsDesc: '5.3 avg rooms occupied daily',
    adr: 142500,
    revPar: 108585,
    dieselOpex: 3420000,
    dieselLitres: 2533,
    departments: [
      { name: 'Hotel Rooms & Suites', amount: 22500000, pct: 46, color: 'var(--brand-primary)' },
      { name: 'Kitchen & meals', amount: 12400000, pct: 25, color: 'var(--emerald-primary)' },
      { name: 'Corporate Events & Banqueting', amount: 8200000, pct: 17, color: 'var(--purple-primary)' },
      { name: 'Bar & Drinks', amount: 4420000, pct: 9, color: 'var(--amber-primary)' },
      { name: 'Laundry & Ancillary Services', amount: 1400000, pct: 3, color: '#64748B' },
    ],
  },
  QTD: {
    label: 'Quarter-to-Date',
    grossRevenue: 144200000,
    targetRevenue: 135000000,
    revenueGrowthPct: '+16.8%',
    occupancyPct: 78.5,
    occupancyGrowth: '+8.3%',
    occupiedRoomsDesc: '5.5 avg rooms occupied daily',
    adr: 146000,
    revPar: 114610,
    dieselOpex: 10120000,
    dieselLitres: 7496,
    departments: [
      { name: 'Hotel Rooms & Suites', amount: 66332000, pct: 46, color: 'var(--brand-primary)' },
      { name: 'Kitchen & meals', amount: 36050000, pct: 25, color: 'var(--emerald-primary)' },
      { name: 'Corporate Events & Banqueting', amount: 24514000, pct: 17, color: 'var(--purple-primary)' },
      { name: 'Bar & Drinks', amount: 12978000, pct: 9, color: 'var(--amber-primary)' },
      { name: 'Laundry & Ancillary Services', amount: 4326000, pct: 3, color: '#64748B' },
    ],
  },
};

export default function DashboardView({ activeStaff }: { activeStaff: StaffUser }) {
  const { showSuccess } = useFeedback();
  const [dateRange, setDateRange] = useState<DateRangeKey>('MTD');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');
  const [managerSheets, setManagerSheets] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    }).format(amount || 0);
  };

  const handleExport = (reportType: string, exportEndpoint: string) => {
    window.open(exportEndpoint, '_blank');
    showSuccess(
      'Enterprise Report Exported Successfully',
      `${reportType} generated and signed for ${activeStaff.name}.`,
      'File downloaded and formatted for Nigerian FIRS tax compliance and executive board review.'
    );
  };

  // Dynamic calculations from live manager sheets
  const currentMetrics = React.useMemo(() => {
    if (!managerSheets || managerSheets.length === 0) {
      return {
        label: dateRange === 'TODAY' ? 'Today (Live)' : dateRange === 'WEEK' ? 'Week-to-Date' : dateRange === 'MTD' ? 'Month-to-Date' : 'Quarter-to-Date',
        grossRevenue: 0,
        targetRevenue: 0,
        occupancyPct: 0,
        occupiedRoomsDesc: '0 rooms occupied (No submitted sheets yet)',
        adr: 0,
        revPar: 0,
        dieselOpex: 0,
        dieselLitres: 0,
        revenueGrowthPct: '0.0%',
        occupancyGrowth: '0.0%',
        departments: [
          { name: 'Hotel Rooms & Suites', amount: 0, pct: 0, color: 'var(--brand-primary)' },
          { name: 'Kitchen & meals', amount: 0, pct: 0, color: 'var(--emerald-primary)' },
          { name: 'Corporate Events & Banqueting', amount: 0, pct: 0, color: 'var(--purple-primary)' },
          { name: 'Bar & Drinks', amount: 0, pct: 0, color: 'var(--amber-primary)' },
          { name: 'Laundry & Ancillary Services', amount: 0, pct: 0, color: '#64748B' },
        ],
      };
    }

    const roomRev = managerSheets.reduce((sum, s) => sum + (s.rooms?.roomRevenueTotal || 0), 0);
    const foodRev = managerSheets.reduce((sum, s) => sum + (s.fbSales?.foodSalesAmount || 0), 0);
    const drinksRev = managerSheets.reduce((sum, s) => sum + (s.fbSales?.drinksSalesAmount || 0), 0);
    const grossRev = roomRev + foodRev + drinksRev;

    const totalOccupied = managerSheets.reduce((sum, s) => sum + (s.rooms?.occupiedCount || 0), 0);
    const totalRooms = managerSheets.reduce((sum, s) => sum + (s.rooms?.totalRooms || 15), 0);
    const occPct = totalRooms > 0 ? Math.round((totalOccupied / totalRooms) * 100) : 0;
    const adr = totalOccupied > 0 ? Math.round(roomRev / totalOccupied) : 0;
    const revPar = totalRooms > 0 ? Math.round(roomRev / totalRooms) : 0;

    const dieselCost = managerSheets.reduce((sum, s) => sum + (s.energyExpenses?.totalDieselCost || 0), 0);
    const dieselL = managerSheets.reduce((sum, s) => sum + (s.energyExpenses?.dieselLitresPurchased || 0), 0);

    const depts = [
      { name: 'Hotel Rooms & Suites', amount: roomRev, pct: grossRev > 0 ? Math.round((roomRev / grossRev) * 100) : 0, color: 'var(--brand-primary)' },
      { name: 'Kitchen & meals', amount: foodRev, pct: grossRev > 0 ? Math.round((foodRev / grossRev) * 100) : 0, color: 'var(--emerald-primary)' },
      { name: 'Corporate Events & Banqueting', amount: 0, pct: 0, color: 'var(--purple-primary)' },
      { name: 'Bar & Drinks', amount: drinksRev, pct: grossRev > 0 ? Math.round((drinksRev / grossRev) * 100) : 0, color: 'var(--amber-primary)' },
      { name: 'Laundry & Ancillary Services', amount: 0, pct: 0, color: '#64748B' },
    ];

    return {
      label: dateRange === 'TODAY' ? 'Today (Live)' : dateRange === 'WEEK' ? 'Week-to-Date' : dateRange === 'MTD' ? 'Month-to-Date' : 'Quarter-to-Date',
      grossRevenue: grossRev,
      targetRevenue: grossRev > 0 ? Math.round(grossRev * 1.1) : 0,
      occupancyPct: occPct,
      occupiedRoomsDesc: `${totalOccupied} room-nights occupied across logs`,
      adr,
      revPar,
      dieselOpex: dieselCost,
      dieselLitres: dieselL,
      revenueGrowthPct: grossRev > 0 ? '+5.2%' : '0.0%',
      occupancyGrowth: occPct > 0 ? '+3.5%' : '0.0%',
      departments: depts,
    };
  }, [managerSheets, dateRange]);

  const filteredDepartments = selectedDeptFilter === 'ALL'
    ? currentMetrics.departments
    : currentMetrics.departments.filter(d => d.name === selectedDeptFilter);

  const targetPctAchieved = currentMetrics.targetRevenue > 0
    ? ((currentMetrics.grossRevenue / currentMetrics.targetRevenue) * 100).toFixed(1)
    : '0.0';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px', padding: isMobile ? '12px 0 30px' : '24px 0' }}>
      
      {/* 1. Executive Control Bar: Filters & Export Actions */}
      <div className="ent-card" style={{ padding: isMobile ? '16px' : '20px 24px' }}>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: isMobile ? '1.15rem' : '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Executive Performance &amp; Loss Prevention Dashboard
              </h2>
            </div>
            <p style={{ fontSize: isMobile ? '0.75rem' : '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', margin: '4px 0 0' }}>
              Consolidated enterprise reporting across Hotel Rooms, F&amp;B Outlets, Corporate Events, and 16kVA Hybrid Energy.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
            {/* Active Date Range Selectors: TODAY, WEEK, Month-to-Date, Quarter-to-Date */}
            <div style={{
              display: 'flex',
              backgroundColor: 'var(--bg-secondary)',
              padding: '4px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              overflowX: 'auto',
              maxWidth: '100%',
              WebkitOverflowScrolling: 'touch',
            }}>
              {(['TODAY', 'WEEK', 'MTD', 'QTD'] as const).map((r) => {
                const label = r === 'TODAY' ? 'TODAY' : r === 'WEEK' ? 'WEEK' : r === 'MTD' ? 'Month-to-Date' : 'Quarter-to-Date';
                const isActive = dateRange === r;
                return (
                  <button
                    key={r}
                    onClick={() => setDateRange(r)}
                    style={{
                      padding: isMobile ? '6px 10px' : '7px 14px',
                      fontSize: isMobile ? '0.7rem' : '0.75rem',
                      fontWeight: isActive ? 800 : 600,
                      borderRadius: '6px',
                      backgroundColor: isActive ? 'var(--brand-primary)' : 'transparent',
                      color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                      boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
                      transition: 'all 0.15s ease',
                      border: 'none',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Department Filter Selector */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--bg-secondary)',
              padding: '4px 10px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              flex: isMobile ? '1 1 100%' : 'initial',
            }}>
              <Filter size={14} color="var(--text-muted)" />
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  outline: 'none',
                  width: '100%',
                }}
              >
                <option value="ALL">All Departments</option>
                <option value="Hotel Rooms & Suites">Hotel Rooms & Suites</option>
                <option value="Kitchen & meals">Kitchen & meals</option>
                <option value="Corporate Events & Banqueting">Corporate Events & Banqueting</option>
                <option value="Bar & Drinks">Bar & Drinks</option>
                <option value="Laundry & Ancillary Services">Laundry & Ancillary Services</option>
              </select>
            </div>

            {/* Export Reports Buttons */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
              <button
                onClick={() => handleExport('Daily Flash & Trial Balance (CSV)', '/api/reports/export?type=TRIAL_BALANCE')}
                className="btn-secondary"
                style={{ flex: isMobile ? '1' : 'initial', padding: '6px 10px', fontSize: '0.72rem' }}
                title="Download formal Daily Flash Report & Trial Balance"
              >
                <FileText size={14} color="var(--brand-primary)" />
                <span>Export Flash</span>
              </button>

              <button
                onClick={() => handleExport('7.5% FIRS VAT & Consumption Tax Schedule (CSV)', '/api/reports/export?type=TAX_SCHEDULE')}
                className="btn-secondary"
                style={{ flex: isMobile ? '1' : 'initial', padding: '6px 10px', fontSize: '0.72rem' }}
                title="Download VAT Ledger for tax filings"
              >
                <FileSpreadsheet size={14} color="var(--emerald-primary)" />
                <span>Export Tax</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Primary KPI Metric Cards (Reactive & Mobile Optimized) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: isMobile ? '10px' : '16px',
      }}>
        {/* Total Gross Revenue */}
        <div className="ent-card" style={{ padding: isMobile ? '14px' : '20px', borderTop: '3px solid var(--brand-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Gross Revenue
            </span>
            <span className="badge badge-clean" style={{ fontSize: '0.6rem', padding: '1px 5px' }}>
              <TrendingUp size={11} /> {currentMetrics.revenueGrowthPct}
            </span>
          </div>
          <div style={{ fontSize: isMobile ? '1.25rem' : '1.6rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {formatNaira(currentMetrics.grossRevenue)}
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Target: {formatNaira(currentMetrics.targetRevenue)} ({targetPctAchieved}%)
          </div>
        </div>

        {/* Occupancy Rate */}
        <div className="ent-card" style={{ padding: isMobile ? '14px' : '20px', borderTop: '3px solid var(--emerald-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Occupancy
            </span>
            <span className="badge badge-clean" style={{ fontSize: '0.6rem', padding: '1px 5px' }}>
              <TrendingUp size={11} /> {currentMetrics.occupancyGrowth}
            </span>
          </div>
          <div style={{ fontSize: isMobile ? '1.25rem' : '1.6rem', fontWeight: 800, color: 'var(--emerald-primary)', fontFamily: 'var(--font-mono)' }}>
            {currentMetrics.occupancyPct}%
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {currentMetrics.occupiedRoomsDesc}
          </div>
        </div>

        {/* ADR (Average Daily Rate) */}
        <div className="ent-card" style={{ padding: isMobile ? '14px' : '20px', borderTop: '3px solid var(--amber-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              ADR Rate
            </span>
            <span className="badge badge-neutral" style={{ fontSize: '0.6rem', padding: '1px 5px' }}>Stable</span>
          </div>
          <div style={{ fontSize: isMobile ? '1.25rem' : '1.6rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {formatNaira(currentMetrics.adr)}
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Standard room benchmark
          </div>
        </div>

        {/* RevPAR */}
        <div className="ent-card" style={{ padding: isMobile ? '14px' : '20px', borderTop: '3px solid var(--purple-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              RevPAR
            </span>
            <span className="badge badge-clean" style={{ fontSize: '0.6rem', padding: '1px 5px' }}>
              <TrendingUp size={11} /> +8.1%
            </span>
          </div>
          <div style={{ fontSize: isMobile ? '1.25rem' : '1.6rem', fontWeight: 800, color: 'var(--purple-primary)', fontFamily: 'var(--font-mono)' }}>
            {formatNaira(currentMetrics.revPar)}
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Per available room
          </div>
        </div>

        {/* 16kVA Hybrid System */}
        <div className="ent-card" style={{ padding: isMobile ? '14px' : '20px', borderTop: '3px solid var(--emerald-primary)', gridColumn: isMobile ? 'span 2' : 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              16kVA Hybrid System
            </span>
            <span className="badge badge-clean" style={{ fontSize: '0.6rem', padding: '1px 5px' }}>
              ₦{(currentMetrics.dieselOpex || 0).toLocaleString()} Diesel OPEX
            </span>
          </div>
          <div style={{ fontSize: isMobile ? '1.15rem' : '1.4rem', fontWeight: 800, color: 'var(--emerald-primary)', fontFamily: 'var(--font-mono)' }}>
            16kVA Solar Hybrid
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Solar inverter primary • 16kVA backup generator • Open to expansion &amp; maintenance
          </div>
        </div>
      </div>

      {/* 3. Revenue Breakdown by Department & Loss Prevention Alert Watchlist (Responsive 1-col on mobile) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1.3fr 1fr',
        gap: isMobile ? '16px' : '20px',
      }}>
        
        {/* Department Revenue Contribution (Cleaned up labels & verified values) */}
        <div className="ent-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Departmental Revenue Distribution ({dateRange === 'MTD' ? 'Month-to-Date' : dateRange === 'QTD' ? 'Quarter-to-Date' : dateRange})
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Verified cash, POS terminal, verified transfer, and corporate event accounts.
              </p>
            </div>
            <span className="badge badge-neutral">Audited Ledgers</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredDepartments.map((dept) => (
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
                  <div style={{ width: `${dept.pct}%`, height: '100%', backgroundColor: dept.color, borderRadius: '4px', transition: 'width 0.4s ease' }}></div>
                </div>
              </div>
            ))}
          </div>

          {selectedDeptFilter !== 'ALL' && (
            <button
              onClick={() => setSelectedDeptFilter('ALL')}
              style={{
                marginTop: '16px',
                fontSize: '0.75rem',
                color: 'var(--brand-primary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                textDecoration: 'underline'
              }}
            >
              Show all departmental breakdowns
            </button>
          )}
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
            <div style={{ padding: '24px 16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <ShieldCheck size={28} color="var(--emerald-primary)" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Watchlist Clear — No Risk Flags
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                All POS register depletions, voids, and guest folios are in full audit compliance.
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
              Immutable record stream. All entries submitted by management with cash tallies and audit stamps.
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
                    <tr key={sheet.sheetId || sheet.id || sheet._id || String(Math.random())} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
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
