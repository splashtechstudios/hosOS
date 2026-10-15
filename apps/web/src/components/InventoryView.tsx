'use client';

import React, { useState } from 'react';
import { Package, AlertCircle, ArrowRightLeft, GlassWater, Layers, Sparkles } from 'lucide-react';
import { StaffUser } from '@hosos/types';

export default function InventoryView({ activeStaff }: { activeStaff: StaffUser }) {
  const [selectedStore, setSelectedStore] = useState<'MAIN_BAR' | 'CENTRAL_STORE' | 'KITCHEN_STORE'>('MAIN_BAR');

  const [openingBottles, setOpeningBottles] = useState<number>(3.5);
  const [totsSoldOnPOS, setTotsSoldOnPOS] = useState<number>(8); // 8 tots = 0.533 bottles
  const [actualMeasuredBottles, setActualMeasuredBottles] = useState<number>(2.92);

  const expectedBottlesRemaining = Number((openingBottles - (totsSoldOnPOS / 15)).toFixed(2));
  const variance = Number((expectedBottlesRemaining - actualMeasuredBottles).toFixed(2));
  const isVarianceUnacceptable = Math.abs(variance) > 0.05;

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
      <div className="ent-card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Package size={24} color="var(--brand-primary)" />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Stores, Recipe BOM & Bar Tot Variance Control
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', marginTop: '4px' }}>
              Stock ledger, inter-store transfers, and automatic liquor shrinkage detection per shift.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {(['MAIN_BAR', 'CENTRAL_STORE', 'KITCHEN_STORE'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSelectedStore(s)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  backgroundColor: selectedStore === s ? 'var(--brand-primary)' : 'var(--bg-secondary)',
                  color: selectedStore === s ? '#FFFFFF' : 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                }}
              >
                {s.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bar Tot Precision & Dipstick Variance Engine */}
      <div className="ent-card" style={{ padding: '24px', borderLeft: '4px solid var(--brand-primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <GlassWater size={22} color="var(--brand-primary)" />
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
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
          background: 'var(--bg-secondary)',
          padding: '18px',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '16px',
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
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
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
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
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
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
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
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
      <div className="ent-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Layers size={18} color="var(--brand-primary)" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Recipe Bill of Materials (BOM) Automatic Ingredient Deductions
          </h3>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '16px',
        }}>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h4 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Grilled Croaker Fish & Yam Chips</h4>
              <span className="badge badge-brand">Kitchen Dish</span>
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

          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h4 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Oseika Chapman Signature Cocktail</h4>
              <span className="badge badge-purple">Bar Cocktail</span>
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
