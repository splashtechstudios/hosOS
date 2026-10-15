'use client';

import React, { useState } from 'react';
import { Fuel, Zap, AlertTriangle, ShieldCheck } from 'lucide-react';
import { StaffUser } from '@hosos/types';
import { useFeedback } from '@/context/FeedbackContext';

export default function FacilitiesView({ activeStaff }: { activeStaff: StaffUser }) {
  const { showConfirm, showSuccess } = useFeedback();
  const [meterStart, setMeterStart] = useState<number>(4210.5);
  const [meterEnd, setMeterEnd] = useState<number>(4218.5);
  const [dieselAdded, setDieselAdded] = useState<number>(220);
  const [fuelPricePerLitre, setFuelPricePerLitre] = useState<number>(1350);

  const runHours = Math.max(0, Number((meterEnd - meterStart).toFixed(1)));
  const burnRate = runHours > 0 ? Number((dieselAdded / runHours).toFixed(1)) : 0;
  const totalFuelCost = dieselAdded * fuelPricePerLitre;
  const isAnomaly = burnRate > 29.0;

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px 0' }}>
      
      {/* Header Banner */}
      <div className="ent-card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Fuel size={24} color="var(--brand-primary)" />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Diesel, Generator Run Logs & Energy OPEX Monitor
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', marginTop: '4px' }}>
              Essential Nigerian resort utility tracking. Monitor litre-per-hour consumption and prevent fuel diversion.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <span className="badge badge-clean">
              <Zap size={12} /> Primary: Perkins 250kVA (Online)
            </span>
            <span className="badge badge-dirty">
              Backup: Mikano 100kVA (Standby)
            </span>
          </div>
        </div>
      </div>

      {/* Generator Operational Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
      }}>
        {/* Perkins 250kVA */}
        <div className="ent-card" style={{ padding: '24px', borderLeft: '4px solid var(--emerald-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <span className="badge badge-clean">Online & Supplying Load</span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '8px', color: 'var(--text-primary)' }}>
                Perkins 250kVA Heavy Diesel Generator
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Asset Tag: #GEN-PERK-250 • Location: Central Power House
              </div>
            </div>
            <Zap size={26} color="var(--emerald-primary)" />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            background: 'var(--bg-secondary)',
            padding: '14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            marginBottom: '16px',
          }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>TODAY RUN HOURS</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                {runHours} hrs
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>BURN RATE</div>
              <div style={{
                fontSize: '1.2rem',
                fontWeight: 800,
                color: isAnomaly ? 'var(--rose-primary)' : 'var(--emerald-primary)',
                fontFamily: 'var(--font-mono)'
              }}>
                {burnRate} L/hr
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>DIESEL BURNT</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--brand-primary)', fontFamily: 'var(--font-mono)' }}>
                {dieselAdded} Litres
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>FUEL COST TODAY</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--amber-primary)', fontFamily: 'var(--font-mono)' }}>
                {formatNaira(totalFuelCost)}
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Logged by: <strong style={{ color: 'var(--text-primary)' }}>Engr. Tunde Bakare (Maintenance Lead)</strong> at 18:00 WAT.
          </div>
        </div>

        {/* Live Shift Fuel Log Form */}
        <div className="ent-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '14px', color: 'var(--text-primary)' }}>
            Log Generator Shift & Meter Reading
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                  Hour Meter Start
                </label>
                <input
                  type="number"
                  step={0.1}
                  value={meterStart}
                  onChange={(e) => setMeterStart(Number(e.target.value))}
                  style={{ width: '100%', fontSize: '0.9rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                  Hour Meter Stop
                </label>
                <input
                  type="number"
                  step={0.1}
                  value={meterEnd}
                  onChange={(e) => setMeterEnd(Number(e.target.value))}
                  style={{ width: '100%', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                  Diesel Added (Litres)
                </label>
                <input
                  type="number"
                  value={dieselAdded}
                  onChange={(e) => setDieselAdded(Number(e.target.value))}
                  style={{ width: '100%', fontSize: '0.9rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                  Price/Litre (₦)
                </label>
                <input
                  type="number"
                  value={fuelPricePerLitre}
                  onChange={(e) => setFuelPricePerLitre(Number(e.target.value))}
                  style={{ width: '100%', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            <div style={{
              background: isAnomaly ? 'var(--rose-bg)' : 'var(--emerald-bg)',
              border: `1px solid ${isAnomaly ? 'var(--rose-border)' : 'var(--emerald-border)'}`,
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
            }}>
              {isAnomaly ? (
                <div style={{ color: 'var(--rose-primary)', fontWeight: 600 }}>
                  ⚠️ Fuel Burn Anomaly: {burnRate} L/hr exceeds benchmark (27-28 L/hr). Potential fuel diversion or injector fault.
                </div>
              ) : (
                <div style={{ color: 'var(--emerald-primary)', fontWeight: 600 }}>
                  ✓ Normal Consumption: {burnRate} L/hr within expected manufacturer range.
                </div>
              )}
            </div>

            <button
              onClick={() => {
                showConfirm(
                  'Confirm Certified Fuel Log Entry',
                  `Are you sure you want to submit generator fuel run log of ${runHours} hrs with ${dieselAdded}L diesel replenishment (${formatNaira(totalFuelCost)})?`,
                  () => {
                    showSuccess(
                      'Generator Run Log Recorded Successfully',
                      `Certified by ${activeStaff.name}. Burn rate calculated at ${burnRate} L/hr.`,
                      `Gen-1 Perkins 500kVA | Run: ${runHours} hrs | Fuel Cost: ${formatNaira(totalFuelCost)}`
                    );
                  },
                  {
                    confirmText: 'Submit Certified Log',
                    variant: isAnomaly ? 'danger' : 'primary',
                    details: `Burn Rate: ${burnRate} L/hr | Status: ${isAnomaly ? 'HIGH BURN ANOMALY' : 'NORMAL'}`
                  }
                );
              }}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '6px' }}
            >
              Submit Certified Fuel Log (Logged by {activeStaff.name})
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
