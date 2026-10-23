'use client';

import React, { useState } from 'react';
import { FileText, Moon, CheckCircle2, TrendingUp, AlertTriangle, Send, ShieldCheck } from 'lucide-react';
import { StaffUser } from '@hosos/types';
import { useFeedback } from '@/context/FeedbackContext';

export default function NightAuditView({ activeStaff }: { activeStaff: StaffUser }) {
  const { showConfirm, showSuccess, showFailed } = useFeedback();
  const [auditRunning, setAuditRunning] = useState(false);
  const [auditCompleted, setAuditCompleted] = useState(false);

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleRunAudit = () => {
    showConfirm(
      'Execute End-of-Day Night Audit Close?',
      'This will close the active business day for Osieka Resort in MongoDB Atlas, reconcile all trial balance folios, post nightly room rack rates + FIRS VAT (7.5%) + Consumption Tax (5%), lock registers, and roll to the next operating date.',
      async () => {
        setAuditRunning(true);
        try {
          const res = await fetch('/api/night-audit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ staff: activeStaff }),
          });
          const data = await res.json();
          setAuditRunning(false);

          if (data.success) {
            setAuditCompleted(true);
            showSuccess(
              'Night Audit Rollover Completed Successfully!',
              data.message,
              `Business Date Rolled: ${data.summary.businessDate} → ${data.summary.nextBusinessDate} | Occupied Rooms: ${data.summary.totalRoomsOccupied} (${data.summary.occupancyRate}) | Total Daily Revenue: ₦${data.summary.totalDailyRevenue?.toLocaleString()}`
            );
          } else {
            showFailed('Night Audit Failed', data.error || 'Server error occurred during rollover');
          }
        } catch (err: any) {
          setAuditRunning(false);
          showFailed('Network Error', err.message || 'Could not communicate with night audit API');
        }
      },
      {
        confirmText: 'Execute Midnight Rollover',
        variant: 'primary',
        details: 'Operating Ledger: MongoDB Atlas | Auditor: ' + activeStaff.name + ' (' + activeStaff.role + ')'
      }
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px 0' }}>
      
      {/* Top Banner */}
      <div className="ent-card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Moon size={24} color="var(--brand-primary)" />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                End-of-Day Night Audit & Owner Flash Report Engine
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', marginTop: '4px' }}>
              Automated 02:00 AM close. Posts room nightly room rates, audits cash-up variance, and delivers WhatsApp summary to Owner.
            </p>
          </div>

          <button
            onClick={handleRunAudit}
            disabled={auditRunning}
            className="btn-primary"
          >
            <ShieldCheck size={16} />
            <span>{auditRunning ? 'Running Audit Steps...' : 'Execute Night Audit Close'}</span>
          </button>
        </div>
      </div>

      {auditCompleted && (
        <div className="ent-card" style={{ padding: '16px 20px', borderLeft: '4px solid var(--emerald-primary)', background: 'var(--emerald-bg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--emerald-primary)', fontWeight: 700 }}>
            <CheckCircle2 size={20} />
            <span>Night Audit Completed Successfully by {activeStaff.name}! Operating Day Closed & Rolled to 2026-10-16.</span>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
      }}>
        <div className="ent-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Occupancy Rate
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--brand-primary)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
            71.4%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            5 of 7 available rooms occupied
          </div>
        </div>

        <div className="ent-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            ADR (Avg Daily Rate)
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
            ₦132,000
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Across booked room inventory
          </div>
        </div>

        <div className="ent-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            RevPAR
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--emerald-primary)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
            ₦94,285
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Revenue Per Available Room
          </div>
        </div>

        <div className="ent-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Today Gross Revenue
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
            ₦1,428,500
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--emerald-primary)', marginTop: '2px' }}>
            Rooms (46%) • F&B (41%) • Events (13%)
          </div>
        </div>
      </div>

      {/* WhatsApp Flash Preview to Resort Owner */}
      <div className="ent-card" style={{ padding: '24px', borderLeft: '4px solid var(--emerald-primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Send size={20} color="var(--emerald-primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Owner WhatsApp Daily Flash Dispatch Preview
            </h3>
          </div>
          <span className="badge badge-clean">Automated WhatsApp Cloud API</span>
        </div>

        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          padding: '20px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.825rem',
          lineHeight: 1.6,
          color: 'var(--text-primary)',
          whiteSpace: 'pre-line',
        }}>
          {`🏨 *OSIEKA RESORT & SUITES — DAILY FLASH REPORT*
📅 *Date:* Thursday, 15 Oct 2026 | *Close Time:* 02:00 WAT
👤 *Audited By:* ${activeStaff.name} (${activeStaff.role})

📊 *HOTEL OCCUPANCY & ROOMS*
• Rooms Occupied: 5 / 7 (71.4%)
• ADR: ₦132,000 | RevPAR: ₦94,285
• Total Room Revenue: ₦660,000

🍽️ *FOOD & BEVERAGE*
• Restaurant Sales: ₦342,000
• Main Bar & Pool Lounge: ₦241,500
• Room Service Extra Charges: ₦85,000
• *Total F&B Revenue:* ₦668,500

💰 *COLLECTIONS & MONEY INTAKE*
• Cash Collected (Till): ₦410,000
• POS Card Terminals: ₦620,000
• Bank Transfers (Verified): ₦398,500
• *Cash-Up Variance:* ₦0.00 (Zero discrepancy)

⚡ *UTILITIES & DIESEL OPEX*
• Perkins 250kVA Run: 8.0 hrs
• Fuel Consumed: 220 Litres @ ₦1,350/L (₦297,000)
• Burn Rate: 27.5 L/hr (Normal - No anomaly detected)

✅ Night Audit Locked. Shifts Closed. Ready for Day Rollover.`}
        </div>
      </div>

    </div>
  );
}
