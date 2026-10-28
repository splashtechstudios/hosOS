'use client';

import React, { useState } from 'react';
import { StaffUser } from '@hosos/types';
import { useFeedback } from '@/context/FeedbackContext';
import {
  ShieldAlert,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  Sliders,
  DollarSign,
  UserX,
  Lock,
  ArrowUpRight
} from 'lucide-react';

interface LossPreventionViewProps {
  activeStaff: StaffUser;
}

export default function LossPreventionView({ activeStaff }: LossPreventionViewProps) {
  const { showConfirm, showSuccess } = useFeedback();
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const voidItems = [
    {
      id: 'VD-9021',
      timestamp: 'Today, 17:42:10',
      item: '2x Moët & Chandon Imperial Brut',
      amount: 190000,
      outlet: 'Main Bar',
      staff: 'Emeka Nwosu (Bartender)',
      approver: 'Dr. Adeleke Bello (GM)',
      reason: 'Guest changed order to Dom Pérignon before bottle popped',
      risk: 'HIGH',
      cctvRef: 'CAM-04 [Bar Counter]',
      status: 'AUDITED',
    },
    {
      id: 'VD-9018',
      timestamp: 'Today, 14:15:33',
      item: '1x Grilled Jumbo Prawns (Continental)',
      amount: 32000,
      outlet: 'Main Restaurant',
      staff: 'Chidi Obi (Waiter)',
      approver: 'Chef Donald Umeh (Chef)',
      reason: 'Kitchen delay exceeded 45 mins; guest walked out',
      risk: 'MEDIUM',
      cctvRef: 'CAM-02 [Dining Room]',
      status: 'RESOLVED',
    },
    {
      id: 'VD-8994',
      timestamp: 'Yesterday, 22:10:45',
      item: '3x Hennessy XO Double Tots',
      amount: 105000,
      outlet: 'Main Bar',
      staff: 'Emeka Nwosu (Bartender)',
      approver: 'Unapproved (Override PIN)',
      reason: 'POS entry error on bill split without supervisor PIN',
      risk: 'CRITICAL',
      cctvRef: 'CAM-07 [Bar Storage]',
      status: 'INVESTIGATING',
    },
    {
      id: 'VD-8950',
      timestamp: 'Yesterday, 19:30:12',
      item: 'Room 201 Full Day Room Charge Void',
      amount: 120000,
      outlet: 'Front Desk',
      staff: 'Mary Okon (Front Desk)',
      approver: 'Dr. Adeleke Bello (GM)',
      reason: 'Customer air conditioner leakage; relocated to Suite 304 without charge',
      risk: 'HIGH',
      cctvRef: 'CAM-01 [Reception]',
      status: 'APPROVED',
    },
  ];

  const barShrinkage = [
    {
      bottle: 'Hennessy XO (750ml)',
      category: 'Cognac',
      openedAt: '2026-10-14 16:00',
      totalTots: 25,
      totsSoldPOS: 18,
      totsMeasured: 16,
      varianceTots: -2,
      varianceCost: 70000,
      supervisor: 'Emeka Nwosu',
      status: 'FLAGGED',
    },
    {
      bottle: 'Don Julio 1942 (750ml)',
      category: 'Tequila',
      openedAt: '2026-10-15 11:30',
      totalTots: 25,
      totsSoldPOS: 10,
      totsMeasured: 10,
      varianceTots: 0,
      varianceCost: 0,
      supervisor: 'Emeka Nwosu',
      status: 'BALANCED',
    },
    {
      bottle: 'Macallan 18 Sherry Oak (700ml)',
      category: 'Single Malt',
      openedAt: '2026-10-13 19:00',
      totalTots: 23,
      totsSoldPOS: 14,
      totsMeasured: 12,
      varianceTots: -2,
      varianceCost: 96000,
      supervisor: 'Emeka Nwosu',
      status: 'FLAGGED',
    },
  ];

  const filteredVoids = voidItems.filter(v => {
    if (filterSeverity !== 'ALL' && v.risk !== filterSeverity) return false;
    if (searchQuery) {
      return (
        v.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.staff.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.reason.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px 0' }}>
      
      {/* 1. Header Toolbar */}
      <div className="ent-card" style={{ padding: '18px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={22} color="var(--rose-primary)" />
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Loss Prevention & Revenue Integrity Watchlist
              </h2>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Real-time monitoring of bill voids, unauthorized discounts, bar spirit variances, and cashier skimming anomalies.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => {
                showSuccess(
                  'Audit Package Exported Successfully',
                  'Loss prevention workbook generated (.xlsx) for FIRS tax compliance and Internal Audit.',
                  `Auditor: ${activeStaff.name} • 4 Void Records • 3 Spirit Variances`
                );
              }}
              className="btn-secondary"
            >
              <FileSpreadsheet size={15} color="var(--emerald-primary)" />
              <span>Export Audit Package (.xlsx)</span>
            </button>
            <button
              onClick={() => {
                showConfirm(
                  'Flag High-Risk Incident for Security Review',
                  'Are you sure you want to escalate this transaction to the General Manager and Owner? A high-priority alert will be dispatched to their dashboard notifications.',
                  () => {
                    showSuccess(
                      'Security Alert Dispatched',
                      'Incident #INC-994 has been escalated to Executive Management.',
                      'CCTV footage and staff PIN log timestamped.'
                    );
                  },
                  {
                    confirmText: 'Dispatch Security Alert',
                    variant: 'danger'
                  }
                );
              }}
              className="btn-primary"
              style={{ backgroundColor: 'var(--rose-primary)' }}
            >
              <AlertTriangle size={15} />
              <span>Flag New Incident</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Loss Prevention Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '14px',
      }}>
        <div className="ent-kpi-card" style={{ borderLeft: '3px solid var(--rose-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Voided Value (MTD)
            </span>
            <span className="badge badge-danger">4 Incidents</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--rose-primary)', fontFamily: 'var(--font-mono)' }}>
            {formatNaira(447000)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            0.91% of gross revenue (Threshold: &lt;1.5%)
          </div>
        </div>

        <div className="ent-kpi-card" style={{ borderLeft: '3px solid var(--amber-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Bar Tot Shrinkage Value
            </span>
            <span className="badge badge-warning">-4 Tots Unaccounted</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--amber-primary)', fontFamily: 'var(--font-mono)' }}>
            {formatNaira(166000)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Hennessy XO & Macallan 18 bottles flagged
          </div>
        </div>

        <div className="ent-kpi-card" style={{ borderLeft: '3px solid var(--brand-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Discounts / Comps Approved
            </span>
            <span className="badge badge-brand">Owner/GM Signed</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {formatNaira(680000)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Corporate client volume discounts & VIP comps
          </div>
        </div>

        <div className="ent-kpi-card" style={{ borderLeft: '3px solid var(--emerald-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Cashier Drawer Balance
            </span>
            <span className="badge badge-clean">99.8% Match</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--emerald-primary)', fontFamily: 'var(--font-mono)' }}>
            ₦0 Variance
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            All 4 POS cash drawers balanced yesterday
          </div>
        </div>
      </div>

      {/* 3. Voided Items & Cancellations Audit Table */}
      <div className="ent-card" style={{ padding: '20px 22px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Itemized Void & Cancellation Ledger
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Complete audit trail of all items cancelled after being fired to kitchen, bar, or posted to guest folio.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 10px',
              border: '1px solid var(--border-color)',
            }}>
              <Search size={14} color="var(--text-muted)" />
              <input
                placeholder="Search voids..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: 'none', background: 'transparent', padding: 0, fontSize: '0.75rem' }}
              />
            </div>

            <div style={{ display: 'flex', backgroundColor: 'var(--bg-secondary)', padding: '2px', borderRadius: 'var(--radius-sm)' }}>
              {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'] as const).map(sev => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  style={{
                    padding: '4px 8px',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    borderRadius: '4px',
                    backgroundColor: filterSeverity === sev ? '#FFFFFF' : 'transparent',
                    color: filterSeverity === sev ? 'var(--brand-primary)' : 'var(--text-secondary)',
                    boxShadow: filterSeverity === sev ? 'var(--shadow-xs)' : 'none',
                  }}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="ent-table-container">
          <table className="ent-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Timestamp</th>
                <th>Item & Category</th>
                <th>Outlet</th>
                <th>Amount</th>
                <th>Logged By</th>
                <th>Approver</th>
                <th>Reason Logged</th>
                <th>CCTV Reference</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredVoids.map(v => (
                <tr key={v.id}>
                  <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{v.id}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{v.timestamp}</td>
                  <td style={{ fontWeight: 600 }}>{v.item}</td>
                  <td><span className="badge badge-neutral">{v.outlet}</span></td>
                  <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--rose-primary)' }}>
                    {formatNaira(v.amount)}
                  </td>
                  <td>{v.staff}</td>
                  <td style={{ fontWeight: 600, color: v.approver.includes('Unapproved') ? 'var(--rose-primary)' : 'var(--text-primary)' }}>
                    {v.approver}
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', maxWidth: '200px' }}>
                    {v.reason}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {v.cctvRef}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${v.status === 'INVESTIGATING' ? 'badge-danger' : v.status === 'AUDITED' ? 'badge-clean' : 'badge-brand'}`}>
                      {v.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. High-End Bar Spirits Tot Variance Audit Table */}
      <div className="ent-card" style={{ padding: '20px 22px' }}>
        <div style={{ marginBottom: '14px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            High-Value Spirits Dipstick Variance (Bar Tot Audit)
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Daily physical tot dipstick measurements cross-referenced with POS register depletions.
          </p>
        </div>

        <div className="ent-table-container">
          <table className="ent-table">
            <thead>
              <tr>
                <th>Spirit Bottle</th>
                <th>Category</th>
                <th>Opened At</th>
                <th>Total Yield</th>
                <th>POS Depletions</th>
                <th>Dipstick Measured</th>
                <th>Variance (Tots)</th>
                <th>Estimated Loss</th>
                <th>Supervisor</th>
                <th>Audit Status</th>
              </tr>
            </thead>
            <tbody>
              {barShrinkage.map((b, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 700 }}>{b.bottle}</td>
                  <td><span className="badge badge-neutral">{b.category}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{b.openedAt}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{b.totalTots} tots</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{b.totsSoldPOS} tots</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{b.totsMeasured} tots</td>
                  <td style={{
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: b.varianceTots < 0 ? 'var(--rose-primary)' : 'var(--emerald-primary)',
                  }}>
                    {b.varianceTots === 0 ? '0' : `${b.varianceTots} tots`}
                  </td>
                  <td style={{
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: b.varianceCost > 0 ? 'var(--rose-primary)' : 'var(--text-muted)',
                  }}>
                    {b.varianceCost > 0 ? formatNaira(b.varianceCost) : '₦0'}
                  </td>
                  <td>{b.supervisor}</td>
                  <td>
                    <span className={`badge ${b.status === 'FLAGGED' ? 'badge-danger' : 'badge-clean'}`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
