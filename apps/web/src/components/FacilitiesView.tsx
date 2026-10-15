'use client';

import React, { useState } from 'react';
import { Fuel, Zap, AlertTriangle, ShieldCheck, Plus, CheckCircle2 } from 'lucide-react';
import { StaffUser } from '@hosos/types';

export default function FacilitiesView({ activeStaff }: { activeStaff: StaffUser }) {
  const [meterStart, setMeterStart] = useState<number>(4210.5);
  const [meterEnd, setMeterEnd] = useState<number>(4218.5);
  const [dieselAdded, setDieselAdded] = useState<number>(220); // Litres
  const [fuelPricePerLitre, setFuelPricePerLitre] = useState<number>(1350); // ₦1,350/Litre

  const runHours = Math.max(0, Number((meterEnd - meterStart).toFixed(1)));
  const burnRate = runHours > 0 ? Number((dieselAdded / runHours).toFixed(1)) : 0;
  const totalFuelCost = dieselAdded * fuelPricePerLitre;
  const isAnomaly = burnRate > 29.0; // Perkins 250kVA benchmark is 27-28 L/hr at 65% load

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
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Fuel size={24} color="var(--gold-primary)" />
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                Diesel, Generator Run Logs & Energy OPEX Monitor
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
              Essential Nigerian resort utility tracking. Monitor litre-per-hour consumption and prevent fuel siphoning.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <span className="badge badge-clean">
              <Zap size={12} /> Primary: Perkins 250kVA (Online)
            </span>
            <span className="badge badge-gold">
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
        <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid var(--emerald-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <span className="badge badge-clean">Online & Supplying Load</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '8px' }}>
                Perkins 250kVA Heavy Diesel Generator
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Asset Tag: #GEN-PERK-250 • Location: Central Power House
              </div>
            </div>
            <Zap size={28} color="var(--emerald-primary)" />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            background: 'rgba(255,255,255,0.02)',
            padding: '14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            marginBottom: '16px',
          }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>TODAY RUN HOURS</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFF', fontFamily: 'var(--font-mono)' }}>
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
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gold-primary)', fontFamily: 'var(--font-mono)' }}>
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
            Logged by: <strong style={{ color: '#FFF' }}>Engr. Tunde Bakare (Maintenance Lead)</strong> at 18:00 WAT.
          </div>
        </div>

        {/* Live Shift Fuel Log Form */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px', color: '#FFF' }}>
            Log Generator Shift & Meter Reading
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
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
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
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
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
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
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
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
              background: isAnomaly ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.08)',
              border: `1px solid ${isAnomaly ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.2)'}`,
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
              onClick={() => alert(`Generator log of ${runHours} hrs / ${dieselAdded}L submitted by ${activeStaff.name}`)}
              className="btn-gold"
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
