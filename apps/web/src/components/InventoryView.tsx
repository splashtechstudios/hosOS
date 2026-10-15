'use client';

import React, { useState } from 'react';
import { Package, AlertCircle, ArrowRightLeft, GlassWater, Layers, Sparkles } from 'lucide-react';
import { StaffUser } from '@hosos/types';

export default function InventoryView({ activeStaff }: { activeStaff: StaffUser }) {
  const [selectedStore, setSelectedStore] = useState<'MAIN_BAR' | 'CENTRAL_STORE' | 'KITCHEN_STORE'>('MAIN_BAR');

  // Spirit Bottle Tot Dipstick interactive calculator
  const [openingBottles, setOpeningBottles] = useState<number>(3.5);
  const [totsSoldOnPOS, setTotsSoldOnPOS] = useState<number>(8); // 8 tots = 0.533 bottles
  const [actualMeasuredBottles, setActualMeasuredBottles] = useState<number>(2.92);

  // 15 tots per 750ml bottle (50ml each)
  const expectedBottlesRemaining = Number((openingBottles - (totsSoldOnPOS / 15)).toFixed(2));
  const variance = Number((expectedBottlesRemaining - actualMeasuredBottles).toFixed(2));
  const isVarianceUnacceptable = Math.abs(variance) > 0.05; // > 5% bottle loss threshold

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px 0' }}>
      
      {/* Top Banner */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Package size={24} color="var(--gold-primary)" />
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                Stores, Recipe BOM & Bar Tot Variance Control
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
              Strict stock ledger, inter-store transfers, and automatic liquor shrinkage detection per shift.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {(['MAIN_BAR', 'CENTRAL_STORE', 'KITCHEN_STORE'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSelectedStore(s)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  backgroundColor: selectedStore === s ? 'var(--gold-primary)' : 'rgba(255,255,255,0.05)',
                  color: selectedStore === s ? '#060A13' : 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bar Tot Precision & Dipstick Variance Engine */}
      <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid var(--gold-primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <GlassWater size={22} color="var(--gold-primary)" />
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
              Liquor Shrinkage & Tot Dipstick Audit (Hennessy VSOP 750ml)
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              1 Bottle = 750ml = 15 Tots (50ml). System computes theoretical vs physical bar handover.
            </p>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          background: 'rgba(255,255,255,0.02)',
          padding: '18px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '16px',
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Shift Opening Stock (Bottles)
            </label>
            <input
              type="number"
              step={0.1}
              value={openingBottles}
              onChange={(e) => setOpeningBottles(Number(e.target.value))}
              style={{ width: '100%', fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              POS Recorded Pours (50ml Tots)
            </label>
            <input
              type="number"
              step={1}
              value={totsSoldOnPOS}
              onChange={(e) => setTotsSoldOnPOS(Number(e.target.value))}
              style={{ width: '100%', fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}
            />
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Equals {(totsSoldOnPOS / 15).toFixed(2)} bottles sold
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Physical Dipstick Measure (Bottles)
            </label>
            <input
              type="number"
              step={0.01}
              value={actualMeasuredBottles}
              onChange={(e) => setActualMeasuredBottles(Number(e.target.value))}
              style={{ width: '100%', fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Expected Closing vs Variance
            </label>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: isVarianceUnacceptable ? 'var(--rose-primary)' : 'var(--emerald-primary)' }}>
              {expectedBottlesRemaining} btl (Diff: {variance > 0 ? `-${variance}` : `+${Math.abs(variance)}`} btl)
            </div>
            <div style={{ marginTop: '4px' }}>
              {isVarianceUnacceptable ? (
                <span className="badge badge-maintenance">⚠️ Shrinkage Alert! Exceeds 2% Loss</span>
              ) : (
                <span className="badge badge-clean">✓ Balanced within tolerance</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bill of Materials (BOM) Recipe Deduction Engine */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Layers size={20} color="var(--sky-primary)" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
            Recipe Bill of Materials (BOM) Automatic Ingredient Deductions
          </h3>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '16px',
        }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h4 style={{ fontWeight: 700, color: '#FFF' }}>Grilled Croaker Fish & Yam Chips</h4>
              <span className="badge badge-gold">Kitchen Dish</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Every POS order automatically decrements Kitchen Store stock:
            </div>
            <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px', listStyle: 'none' }}>
              <li>• <strong>Fresh Croaker Fish:</strong> -0.50 kg</li>
              <li>• <strong>Yam Tubers:</strong> -0.35 kg</li>
              <li>• <strong>Refined Vegetable Oil:</strong> -0.08 Litre</li>
              <li>• <strong>Pepper & Seasoning Blend:</strong> -0.05 Portion</li>
            </ul>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h4 style={{ fontWeight: 700, color: '#FFF' }}>Oseika Chapman Signature Cocktail</h4>
              <span className="badge badge-occupied">Bar Cocktail</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Every POS order automatically decrements Main Bar Store stock:
            </div>
            <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px', listStyle: 'none' }}>
              <li>• <strong>Campari Bitter:</strong> -50 ml (0.05 Litre)</li>
              <li>• <strong>Angostura Bitters:</strong> -5 dashes (0.01 Litre)</li>
              <li>• <strong>Fanta / Sprite Mix:</strong> -1 can (0.33 Litre)</li>
              <li>• <strong>Fresh Cucumber & Citrus Garnish:</strong> -1 slice</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
}
