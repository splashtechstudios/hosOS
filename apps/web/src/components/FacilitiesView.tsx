'use client';

import React, { useState } from 'react';
import { 
  Sun, 
  BatteryCharging, 
  Battery, 
  Zap, 
  Leaf, 
  DollarSign, 
  Calendar, 
  Filter, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingUp, 
  Power, 
  Sliders, 
  Clock, 
  Flame, 
  CheckCircle2,
  BarChart3
} from 'lucide-react';
import { StaffUser } from '@hosos/types';
import { useFeedback } from '@/context/FeedbackContext';

interface DaySolarData {
  date: string;
  dayLabel: string;
  solarGeneratedKwh: number;
  resortConsumedKwh: number;
  batteryPeakSoc: number;
  dieselSavedLitres: number;
  moneySavedNaira: number;
  generatorRunHours: number;
}

export default function FacilitiesView({ activeStaff }: { activeStaff: StaffUser }) {
  const { showConfirm, showSuccess, showToast } = useFeedback();

  // Time range filter
  const [selectedFilter, setSelectedFilter] = useState<'TODAY' | 'WEEK' | 'MONTH'>('WEEK');
  
  // Power Saver Eco-Mode Toggle
  const [powerSaverActive, setPowerSaverActive] = useState<boolean>(true);

  // Live Microgrid Telemetry (Simulated real-time)
  const currentPvOutputKw = 96.4; // kW
  const currentResortLoadKw = powerSaverActive ? 28.5 : 36.2; // kW
  const currentBatterySoc = 92; // 92%
  const batteryCapacityKwh = 360; // 360 kWh LiFePO4 BESS
  const batteryStoredKwh = Math.round((currentBatterySoc / 100) * batteryCapacityKwh);
  const netChargingKw = Number((currentPvOutputKw - currentResortLoadKw).toFixed(1));

  // Past 7 Days Solar Microgrid Data (100% Off-Grid Solar)
  // Benchmark: 1 kWh of solar replaces 0.28 Litres of diesel in Perkins 250kVA generator @ ₦1,250/L = ₦350 per kWh
  const DIESEL_COST_PER_LITRE = 1250;
  const LITRES_SAVED_PER_KWH = 0.28;
  const NAIRA_SAVED_PER_KWH = Math.round(LITRES_SAVED_PER_KWH * DIESEL_COST_PER_LITRE); // ₦350/kWh

  const weeklySolarHistory: DaySolarData[] = [
    {
      date: '2026-10-17',
      dayLabel: 'Sat',
      solarGeneratedKwh: 520,
      resortConsumedKwh: 480,
      batteryPeakSoc: 100,
      dieselSavedLitres: Math.round(520 * LITRES_SAVED_PER_KWH),
      moneySavedNaira: 520 * NAIRA_SAVED_PER_KWH,
      generatorRunHours: 0.0,
    },
    {
      date: '2026-10-18',
      dayLabel: 'Sun',
      solarGeneratedKwh: 540,
      resortConsumedKwh: 510,
      batteryPeakSoc: 100,
      dieselSavedLitres: Math.round(540 * LITRES_SAVED_PER_KWH),
      moneySavedNaira: 540 * NAIRA_SAVED_PER_KWH,
      generatorRunHours: 0.0,
    },
    {
      date: '2026-10-19',
      dayLabel: 'Mon',
      solarGeneratedKwh: 490,
      resortConsumedKwh: 440,
      batteryPeakSoc: 98,
      dieselSavedLitres: Math.round(490 * LITRES_SAVED_PER_KWH),
      moneySavedNaira: 490 * NAIRA_SAVED_PER_KWH,
      generatorRunHours: 0.0,
    },
    {
      date: '2026-10-20',
      dayLabel: 'Tue',
      solarGeneratedKwh: 560,
      resortConsumedKwh: 460,
      batteryPeakSoc: 100,
      dieselSavedLitres: Math.round(560 * LITRES_SAVED_PER_KWH),
      moneySavedNaira: 560 * NAIRA_SAVED_PER_KWH,
      generatorRunHours: 0.0,
    },
    {
      date: '2026-10-21',
      dayLabel: 'Wed',
      solarGeneratedKwh: 510,
      resortConsumedKwh: 470,
      batteryPeakSoc: 96,
      dieselSavedLitres: Math.round(510 * LITRES_SAVED_PER_KWH),
      moneySavedNaira: 510 * NAIRA_SAVED_PER_KWH,
      generatorRunHours: 0.0,
    },
    {
      date: '2026-10-22',
      dayLabel: 'Thu',
      solarGeneratedKwh: 580,
      resortConsumedKwh: 490,
      batteryPeakSoc: 100,
      dieselSavedLitres: Math.round(580 * LITRES_SAVED_PER_KWH),
      moneySavedNaira: 580 * NAIRA_SAVED_PER_KWH,
      generatorRunHours: 0.0,
    },
    {
      date: '2026-10-23',
      dayLabel: 'Fri (Today)',
      solarGeneratedKwh: 555,
      resortConsumedKwh: 465,
      batteryPeakSoc: 100,
      dieselSavedLitres: Math.round(555 * LITRES_SAVED_PER_KWH),
      moneySavedNaira: 555 * NAIRA_SAVED_PER_KWH,
      generatorRunHours: 0.0,
    },
  ];

  // Filtered dataset
  const activeDataset =
    selectedFilter === 'TODAY'
      ? [weeklySolarHistory[weeklySolarHistory.length - 1]]
      : selectedFilter === 'WEEK'
      ? weeklySolarHistory
      : [
          ...weeklySolarHistory,
          // Simulated additional historical days for monthly view
          ...weeklySolarHistory.map((d, i) => ({
            ...d,
            date: `2026-10-${String(i + 1).padStart(2, '0')}`,
            dayLabel: `Day ${i + 1}`,
            solarGeneratedKwh: Math.round(d.solarGeneratedKwh * 1.02),
            moneySavedNaira: Math.round(d.moneySavedNaira * 1.02),
          })),
        ];

  // Aggregate stats
  const totalSolarHarvested = activeDataset.reduce((sum, d) => sum + d.solarGeneratedKwh, 0);
  const totalMoneySaved = activeDataset.reduce((sum, d) => sum + d.moneySavedNaira, 0);
  const totalDieselLitresAvoided = activeDataset.reduce((sum, d) => sum + d.dieselSavedLitres, 0);
  const totalCo2AvoidedKg = Math.round(totalDieselLitresAvoided * 2.68); // 2.68 kg CO2 per litre of diesel
  const totalGenHours = activeDataset.reduce((sum, d) => sum + d.generatorRunHours, 0);

  // Toggle Power Saver Handler
  const handleTogglePowerSaver = () => {
    const newState = !powerSaverActive;
    setPowerSaverActive(newState);
    showToast({
      type: newState ? 'success' : 'info',
      title: newState ? 'Smart Power Saver Enabled' : 'Standard Full Power Enabled',
      message: newState
        ? 'Chillers & pool circulation scheduled for peak solar hours. Night battery autonomy extended by 8 hours.'
        : 'Full power mode active. All auxiliary resort circuits operating at standard load.',
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '60px' }}>
      
      {/* 1. Header Banner */}
      <div className="ent-card" style={{ padding: '20px 24px', backgroundColor: '#FFFFFF' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                color: 'var(--amber-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
              }}>
                <Sun size={22} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    100% Pure Off-Grid Solar & Power Saver Telemetry
                  </h1>
                  <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                    Zero Grid • Pure Solar
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                  Osieka Luxury Resort runs entirely on Solar PV & BESS battery storage with zero public grid reliance
                </p>
              </div>
            </div>
          </div>

          {/* Time Range Filter Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              display: 'flex',
              backgroundColor: 'var(--bg-secondary)',
              padding: '4px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
            }}>
              <button
                type="button"
                onClick={() => setSelectedFilter('TODAY')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: selectedFilter === 'TODAY' ? '#FFFFFF' : 'transparent',
                  color: selectedFilter === 'TODAY' ? 'var(--brand-primary)' : 'var(--text-muted)',
                  boxShadow: selectedFilter === 'TODAY' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                Today
              </button>

              <button
                type="button"
                onClick={() => setSelectedFilter('WEEK')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: selectedFilter === 'WEEK' ? '#FFFFFF' : 'transparent',
                  color: selectedFilter === 'WEEK' ? 'var(--brand-primary)' : 'var(--text-muted)',
                  boxShadow: selectedFilter === 'WEEK' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                This Week (7 Days)
              </button>

              <button
                type="button"
                onClick={() => setSelectedFilter('MONTH')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: selectedFilter === 'MONTH' ? '#FFFFFF' : 'transparent',
                  color: selectedFilter === 'MONTH' ? 'var(--brand-primary)' : 'var(--text-muted)',
                  boxShadow: selectedFilter === 'MONTH' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                This Month
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Highlight: "AMOUNT SAVED ON POWER THIS WEEK" Banner Card */}
      <div style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        borderRadius: '12px',
        padding: '24px',
        color: '#FFFFFF',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.25)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                <Leaf size={12} /> Clean Energy Savings Engine
              </span>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                Filter: {selectedFilter === 'TODAY' ? 'Today' : selectedFilter === 'WEEK' ? 'This Week' : 'This Month'}
              </span>
            </div>

            <div style={{ fontSize: '0.85rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Amount Saved on Power ({selectedFilter === 'WEEK' ? 'This Week' : selectedFilter === 'TODAY' ? 'Today' : 'This Month'}):
            </div>

            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#10B981', letterSpacing: '-0.02em', marginTop: '2px' }}>
              ₦{totalMoneySaved.toLocaleString()}
            </div>

            <div style={{ fontSize: '0.825rem', color: '#CBD5E1', marginTop: '6px' }}>
              Clean Solar Generated: <strong>{totalSolarHarvested.toLocaleString()} kWh</strong> • Replaced <strong>{totalDieselLitresAvoided.toLocaleString()} Litres</strong> of Diesel @ ₦1,250/L
            </div>
          </div>

          {/* Interactive Power Saver Mode Toggle Switch */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            padding: '16px 20px',
            borderRadius: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            minWidth: '260px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FFFFFF' }}>Smart Power Saver</div>
                <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Eco Load Optimization</div>
              </div>

              <button
                type="button"
                onClick={handleTogglePowerSaver}
                style={{
                  padding: '6px 14px',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  backgroundColor: powerSaverActive ? '#10B981' : 'rgba(255, 255, 255, 0.2)',
                  color: '#FFFFFF',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Power size={13} />
                <span>{powerSaverActive ? 'ECO ACTIVE' : 'STANDARD'}</span>
              </button>
            </div>

            <div style={{ fontSize: '0.7rem', color: '#94A3B8', lineHeight: 1.4 }}>
              {powerSaverActive
                ? '✓ High-load pool pumps scheduled for peak daylight. Night battery drain reduced by 21%.'
                : 'Standard mode. No active microgrid load shedding.'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Real-Time Telemetry Cards: Solar PV, Battery BESS, Inverter Load */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        
        {/* Solar PV Array */}
        <div className="ent-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Solar PV Generation</span>
            <Sun size={18} color="var(--amber-primary)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--amber-primary)', fontFamily: 'var(--font-mono)' }}>
            {currentPvOutputKw} kW
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            120 kWp Monocrystalline Solar Array • Efficiency: 94.2%
          </div>
        </div>

        {/* LiFePO4 Battery Bank (BESS) */}
        <div className="ent-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>BESS Battery Bank SoC</span>
            <BatteryCharging size={18} color="var(--emerald-primary)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--emerald-primary)', fontFamily: 'var(--font-mono)' }}>
            {currentBatterySoc}% Full
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {batteryStoredKwh} kWh stored of 360 kWh LiFePO4 capacity
          </div>
        </div>

        {/* Resort Load Demand */}
        <div className="ent-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Resort Microgrid Load</span>
            <Zap size={18} color="var(--brand-primary)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--brand-primary)', fontFamily: 'var(--font-mono)' }}>
            {currentResortLoadKw} kW
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Net Battery Charge Rate: <strong>+{netChargingKw} kW Surplus</strong>
          </div>
        </div>

        {/* Emergency Generator Standby */}
        <div className="ent-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Emergency Generator</span>
            <ShieldCheck size={18} color="var(--emerald-primary)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            0.0 Hrs Run
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--emerald-primary)', marginTop: '4px', fontWeight: 700 }}>
            100% Pure Solar Coverage • Zero Fuel Burn
          </div>
        </div>

      </div>

      {/* 4. Daily Solar Energy & Naira Savings History Table & Bars */}
      <div className="ent-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Daily Clean Solar Harvest & Money Saved Log
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
              Calculated against equivalent diesel generator burn rate benchmark (0.28 L/kWh @ ₦1,250/L)
            </p>
          </div>
          <span className="badge badge-brand">
            {activeDataset.length} Days Filtered
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="ent-table" style={{ width: '100%', fontSize: '0.825rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-secondary)', textAlign: 'left' }}>
                <th style={{ padding: '10px 14px' }}>Date</th>
                <th style={{ padding: '10px 14px' }}>Solar Harvested</th>
                <th style={{ padding: '10px 14px' }}>Resort Load</th>
                <th style={{ padding: '10px 14px' }}>Peak Battery SoC</th>
                <th style={{ padding: '10px 14px' }}>Diesel Litres Saved</th>
                <th style={{ padding: '10px 14px', textAlign: 'right' }}>Money Saved (NGN)</th>
                <th style={{ padding: '10px 14px', textAlign: 'center' }}>Solar Autonomy</th>
              </tr>
            </thead>
            <tbody>
              {activeDataset.map((day) => (
                <tr key={day.date} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 700 }}>
                    {day.date} ({day.dayLabel})
                  </td>

                  <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', color: 'var(--amber-primary)', fontWeight: 700 }}>
                    {day.solarGeneratedKwh} kWh
                  </td>

                  <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>
                    {day.resortConsumedKwh} kWh
                  </td>

                  <td style={{ padding: '10px 14px' }}>
                    <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                      {day.batteryPeakSoc}%
                    </span>
                  </td>

                  <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', color: 'var(--emerald-primary)' }}>
                    {day.dieselSavedLitres} Litres
                  </td>

                  <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontWeight: 800, textAlign: 'right', color: 'var(--emerald-primary)' }}>
                    +₦{day.moneySavedNaira.toLocaleString()}
                  </td>

                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                    <span className="badge badge-clean" style={{ fontSize: '0.65rem' }}>
                      100% Pure Solar
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', fontWeight: 800 }}>
                <td style={{ padding: '12px 14px' }}>TOTAL FOR PERIOD</td>
                <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', color: 'var(--amber-primary)' }}>
                  {totalSolarHarvested.toLocaleString()} kWh
                </td>
                <td style={{ padding: '12px 14px' }}>-</td>
                <td style={{ padding: '12px 14px' }}>-</td>
                <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', color: 'var(--emerald-primary)' }}>
                  {totalDieselLitresAvoided.toLocaleString()} Litres
                </td>
                <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', textAlign: 'right', color: 'var(--emerald-primary)', fontSize: '0.95rem' }}>
                  +₦{totalMoneySaved.toLocaleString()}
                </td>
                <td style={{ padding: '12px 14px', textAlign: 'center', color: 'var(--emerald-primary)' }}>
                  Zero Grid Rely
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  );
}
