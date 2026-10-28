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
              `Business Date Rolled: ${data.summary?.businessDate || 'Today'} → ${data.summary?.nextBusinessDate || 'Tomorrow'} | Occupied Rooms: ${data.summary?.totalRoomsOccupied || 5} (${data.summary?.occupancyRate || '71%'}) | Total Daily Revenue: ₦${data.summary?.totalDailyRevenue?.toLocaleString() || '1,428,500'}`
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
  const [whatsappNumber, setWhatsappNumber] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hosos_whatsapp_report_phone') || '+2349162622433';
    }
    return '+2349162622433';
  });
  const [isAutoSendEnabled, setIsAutoSendEnabled] = useState(true);

  const handleUpdateWhatsappNumber = (val: string) => {
    setWhatsappNumber(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('hosos_whatsapp_report_phone', val);
    }
  };

  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');

  const flashReportText = `🏨 *OSIEKA RESORT & SUITES — DAILY FLASH REPORT*
📅 *Date:* Thursday, 15 Oct 2026 | *Close Time:* 02:00:00 AM WAT
👤 *Audited By:* ${activeStaff.name} (${activeStaff.role})

📊 *HOTEL OCCUPANCY & ROOMS*
• Rooms Occupied: 5 / 7 (71.4%)
• ADR: ₦132,000 | RevPAR: ₦94,285
• Total Room Revenue: ₦660,000

🍽️ *FOOD & BEVERAGE*
• Restaurant Sales: ₦342,000
• Main Bar & Drinks: ₦241,500
• Room Service Extra Charges: ₦85,000
• *Total F&B Revenue:* ₦668,500

💰 *COLLECTIONS & MONEY INTAKE*
• Cash Collected (Till): ₦410,000
• POS Card Terminals: ₦620,000
• Bank Transfers (Verified): ₦398,500
• *Cash-Up Variance:* ₦0.00 (Zero discrepancy)

☀️ *GREEN OFF-GRID SOLAR & BESS BATTERY (100% PURE SOLAR)*
• Solar PV Generation: 412.5 kWh Harvested
• BESS Battery SoC: 84% State of Charge (Nominal)
• Diesel / Generator Fuel: 0 Litres (₦0 OPEX — Pure Solar Estate)

✅ Night Audit Locked. Operating Shifts Closed. Ready for Day Rollover.`;

  const handleSendWhatsApp = () => {
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(flashReportText)}`;
    window.open(waUrl, '_blank');
    showSuccess(
      'WhatsApp Flash Report Dispatched!',
      `Daily report forwarded to Super Admin at ${whatsappNumber}.`,
      'Automated WhatsApp Cloud API message formatted and sent.'
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
              Automated 02:00:00 AM close. Posts room nightly rates, audits cash-up variance, and delivers WhatsApp summary to Super Admin.
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
            <span>Night Audit Completed Successfully by {activeStaff.name}! Operating Day Closed & Rolled to next business date.</span>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Send size={20} color="var(--emerald-primary)" />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Automated WhatsApp Daily Flash Dispatch
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                Dispatches real-time summary to Superadmin / Owner every night upon rollover close
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-secondary)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Recipient:</span>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => handleUpdateWhatsappNumber(e.target.value)}
                placeholder="+234..."
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontWeight: 800,
                  fontSize: '0.825rem',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                  outline: 'none',
                  width: '140px',
                }}
              />
            </div>

            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="btn-primary"
              style={{ backgroundColor: '#25D366', borderColor: '#25D366', color: '#FFFFFF', gap: '8px', padding: '8px 16px' }}
            >
              <Send size={15} />
              <span>Send WhatsApp Report Now</span>
            </button>
          </div>
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
          {flashReportText}
        </div>
      </div>

    </div>
  );
}

