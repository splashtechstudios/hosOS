'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, Landmark, Banknote, Split, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { BasePaymentMethod, PaymentMethod, SplitPaymentDetail } from '@hosos/types';

interface PaymentMethodSelectorProps {
  totalAmount: number;
  initialMethod?: PaymentMethod;
  onChange: (result: {
    method: PaymentMethod;
    reference: string;
    split?: SplitPaymentDetail[];
    isValid: boolean;
  }) => void;
}

export default function PaymentMethodSelector({
  totalAmount,
  initialMethod = 'POS_TERMINAL',
  onChange,
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(initialMethod);
  const [singleReference, setSingleReference] = useState('');

  // Split state: allows splitting across any two methods
  const [method1, setMethod1] = useState<BasePaymentMethod>('BANK_TRANSFER');
  const [amount1, setAmount1] = useState<number>(() => Math.round(totalAmount > 5000 ? totalAmount - 3000 : Math.round(totalAmount / 2)));
  const [ref1, setRef1] = useState('');

  const [method2, setMethod2] = useState<BasePaymentMethod>('CASH');
  const [amount2, setAmount2] = useState<number>(() => totalAmount - (totalAmount > 5000 ? totalAmount - 3000 : Math.round(totalAmount / 2)));
  const [ref2, setRef2] = useState('');

  // When total amount changes, re-adjust split amount2 to match
  useEffect(() => {
    if (selectedMethod === 'SPLIT') {
      const remaining = Math.max(0, totalAmount - amount1);
      setAmount2(remaining);
    }
  }, [totalAmount]);

  // Handle amount 1 change -> auto update amount 2
  const handleAmount1Change = (val: number) => {
    const clamped = Math.max(0, Math.min(totalAmount, val));
    setAmount1(clamped);
    setAmount2(Math.max(0, totalAmount - clamped));
  };

  // Handle amount 2 change -> auto update amount 1
  const handleAmount2Change = (val: number) => {
    const clamped = Math.max(0, Math.min(totalAmount, val));
    setAmount2(clamped);
    setAmount1(Math.max(0, totalAmount - clamped));
  };

  const currentSplitSum = Number(amount1) + Number(amount2);
  const splitDifference = totalAmount - currentSplitSum;
  const isSplitBalanced = Math.abs(splitDifference) === 0 && amount1 > 0 && amount2 > 0 && method1 !== method2;

  // Broadcast changes up to parent
  useEffect(() => {
    if (selectedMethod === 'SPLIT') {
      const isValid = isSplitBalanced;
      onChange({
        method: 'SPLIT',
        reference: `SPLIT-${method1.slice(0, 3)}+${method2.slice(0, 3)}`,
        split: [
          { method: method1, amount: Number(amount1), reference: ref1 || `REF-${method1.slice(0, 3)}` },
          { method: method2, amount: Number(amount2), reference: ref2 || `REF-${method2.slice(0, 3)}` },
        ],
        isValid,
      });
    } else {
      onChange({
        method: selectedMethod,
        reference: singleReference || `REF-${selectedMethod.slice(0, 3)}`,
        split: [{ method: selectedMethod as BasePaymentMethod, amount: totalAmount, reference: singleReference }],
        isValid: totalAmount > 0,
      });
    }
  }, [selectedMethod, singleReference, method1, amount1, ref1, method2, amount2, ref2, totalAmount, isSplitBalanced]);

  const formatNaira = (val: number) => `₦${Number(val).toLocaleString()}`;

  const availableForMethod2: BasePaymentMethod[] = (['POS_TERMINAL', 'BANK_TRANSFER', 'CASH'] as BasePaymentMethod[]).filter(
    (m) => m !== method1
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      
      {/* 4 Method Selection Buttons: POS, Transfer, Cash, Split */}
      <div>
        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
          Payment Method / Settlement Option
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          
          {/* 1. POS Terminal */}
          <button
            type="button"
            onClick={() => setSelectedMethod('POS_TERMINAL')}
            style={{
              padding: '10px 8px',
              borderRadius: '8px',
              border: selectedMethod === 'POS_TERMINAL' ? '2px solid var(--brand-primary)' : '1px solid var(--border-color)',
              backgroundColor: selectedMethod === 'POS_TERMINAL' ? 'var(--brand-bg)' : '#FFFFFF',
              color: selectedMethod === 'POS_TERMINAL' ? 'var(--brand-primary)' : 'var(--text-primary)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.75rem',
              transition: 'all 0.15s ease',
            }}
          >
            <CreditCard size={18} />
            <span>POS</span>
          </button>

          {/* 2. Bank Transfer */}
          <button
            type="button"
            onClick={() => setSelectedMethod('BANK_TRANSFER')}
            style={{
              padding: '10px 8px',
              borderRadius: '8px',
              border: selectedMethod === 'BANK_TRANSFER' ? '2px solid var(--brand-primary)' : '1px solid var(--border-color)',
              backgroundColor: selectedMethod === 'BANK_TRANSFER' ? 'var(--brand-bg)' : '#FFFFFF',
              color: selectedMethod === 'BANK_TRANSFER' ? 'var(--brand-primary)' : 'var(--text-primary)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.75rem',
              transition: 'all 0.15s ease',
            }}
          >
            <Landmark size={18} />
            <span>Transfer</span>
          </button>

          {/* 3. Physical Cash */}
          <button
            type="button"
            onClick={() => setSelectedMethod('CASH')}
            style={{
              padding: '10px 8px',
              borderRadius: '8px',
              border: selectedMethod === 'CASH' ? '2px solid var(--emerald-primary)' : '1px solid var(--border-color)',
              backgroundColor: selectedMethod === 'CASH' ? 'var(--emerald-bg)' : '#FFFFFF',
              color: selectedMethod === 'CASH' ? 'var(--emerald-text)' : 'var(--text-primary)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.75rem',
              transition: 'all 0.15s ease',
            }}
          >
            <Banknote size={18} />
            <span>Cash</span>
          </button>

          {/* 4. Split Settlement */}
          <button
            type="button"
            onClick={() => {
              setSelectedMethod('SPLIT');
              // Auto set amount1 and amount2
              const initA1 = totalAmount > 5000 ? totalAmount - 3000 : Math.round(totalAmount / 2);
              setAmount1(initA1);
              setAmount2(totalAmount - initA1);
            }}
            style={{
              padding: '10px 8px',
              borderRadius: '8px',
              border: selectedMethod === 'SPLIT' ? '2px solid #8B5CF6' : '1px solid var(--border-color)',
              backgroundColor: selectedMethod === 'SPLIT' ? 'rgba(139, 92, 246, 0.08)' : '#FFFFFF',
              color: selectedMethod === 'SPLIT' ? '#7C3AED' : 'var(--text-primary)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.75rem',
              transition: 'all 0.15s ease',
            }}
          >
            <Split size={18} />
            <span>Split</span>
          </button>
        </div>
      </div>

      {/* SINGLE PAYMENT DETAILS */}
      {selectedMethod !== 'SPLIT' && (
        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Payment Breakdown</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              100% via {selectedMethod === 'POS_TERMINAL' ? 'POS Terminal Card' : selectedMethod === 'BANK_TRANSFER' ? 'Bank Direct Transfer' : 'Cash in Hand'}
            </span>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.725rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
              {selectedMethod === 'POS_TERMINAL' ? 'POS Terminal RRN / Auth Code' : selectedMethod === 'BANK_TRANSFER' ? 'Bank Transfer Session ID / Ref' : 'Cash Drawer Receipt #'}
            </label>
            <input
              type="text"
              value={singleReference}
              onChange={(e) => setSingleReference(e.target.value)}
              placeholder={selectedMethod === 'POS_TERMINAL' ? 'e.g. POS-AUTH-99210' : selectedMethod === 'BANK_TRANSFER' ? 'e.g. NIP-TRANSFER-8831' : 'e.g. CASH-RCT-102'}
              style={{ width: '100%', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}
            />
          </div>
        </div>
      )}

      {/* SPLIT SETTLEMENT PANEL (ALLOWS SETTLING VIA ANY TWO CHOSEN OPTIONS) */}
      {selectedMethod === 'SPLIT' && (
        <div style={{
          backgroundColor: 'rgba(139, 92, 246, 0.04)',
          border: '1.5px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '10px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Split size={16} color="#7C3AED" />
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#6D28D9' }}>
                Split Settlement (Combine Any 2 Methods)
              </span>
            </div>
            <div style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Total to Settle: <strong style={{ color: 'var(--brand-primary)', fontFamily: 'var(--font-mono)' }}>{formatNaira(totalAmount)}</strong>
            </div>
          </div>

          {/* Dual Method Split Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            
            {/* Method 1 */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
                Method 1 Channel
              </label>
              <select
                value={method1}
                onChange={(e) => {
                  const newM1 = e.target.value as BasePaymentMethod;
                  setMethod1(newM1);
                  if (newM1 === method2) {
                    const fallback = (['POS_TERMINAL', 'BANK_TRANSFER', 'CASH'] as BasePaymentMethod[]).find(m => m !== newM1);
                    if (fallback) setMethod2(fallback);
                  }
                }}
                style={{ width: '100%', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}
              >
                <option value="BANK_TRANSFER">Bank Transfer (e.g. ₦20k)</option>
                <option value="POS_TERMINAL">POS Terminal Card</option>
                <option value="CASH">Cash in Hand</option>
              </select>

              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Amount (₦)
              </label>
              <input
                type="number"
                min={0}
                max={totalAmount}
                step={500}
                value={amount1}
                onChange={(e) => handleAmount1Change(Number(e.target.value))}
                style={{ width: '100%', fontSize: '1rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#6D28D9', marginBottom: '8px' }}
              />

              <label style={{ display: 'block', fontSize: '0.675rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
                Ref / Auth Code
              </label>
              <input
                type="text"
                placeholder="e.g. NIP-Transfer Ref"
                value={ref1}
                onChange={(e) => setRef1(e.target.value)}
                style={{ width: '100%', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}
              />
            </div>

            {/* Method 2 */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
                Method 2 Channel
              </label>
              <select
                value={method2}
                onChange={(e) => setMethod2(e.target.value as BasePaymentMethod)}
                style={{ width: '100%', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}
              >
                {availableForMethod2.map((m) => (
                  <option key={m} value={m}>
                    {m === 'CASH' ? 'Cash in Hand (e.g. ₦3k)' : m === 'POS_TERMINAL' ? 'POS Terminal Card' : 'Bank Transfer'}
                  </option>
                ))}
              </select>

              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Amount (₦)
              </label>
              <input
                type="number"
                min={0}
                max={totalAmount}
                step={500}
                value={amount2}
                onChange={(e) => handleAmount2Change(Number(e.target.value))}
                style={{ width: '100%', fontSize: '1rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--emerald-primary)', marginBottom: '8px' }}
              />

              <label style={{ display: 'block', fontSize: '0.675rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
                Ref / Drawer Receipt #
              </label>
              <input
                type="text"
                placeholder="e.g. Cash Safe Receipt"
                value={ref2}
                onChange={(e) => setRef2(e.target.value)}
                style={{ width: '100%', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}
              />
            </div>

          </div>

          {/* Live Reconciliation Calculation Bar */}
          <div style={{
            padding: '10px 14px',
            borderRadius: '8px',
            backgroundColor: isSplitBalanced ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.08)',
            border: isSplitBalanced ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            fontSize: '0.775rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isSplitBalanced ? (
                <CheckCircle2 size={16} color="var(--emerald-primary)" />
              ) : (
                <AlertTriangle size={16} color="var(--rose-primary)" />
              )}
              <span style={{ fontWeight: 700, color: isSplitBalanced ? 'var(--emerald-primary)' : 'var(--rose-primary)' }}>
                {isSplitBalanced
                  ? `✓ Balanced: ${formatNaira(amount1)} (${method1.replace(/_/g, ' ')}) + ${formatNaira(amount2)} (${method2.replace(/_/g, ' ')}) = ${formatNaira(totalAmount)}`
                  : `Discrepancy: ${formatNaira(currentSplitSum)} allocated out of ${formatNaira(totalAmount)} (${formatNaira(Math.abs(splitDifference))} ${splitDifference > 0 ? 'remaining' : 'over-allocated'})`}
              </span>
            </div>

            {!isSplitBalanced && (
              <button
                type="button"
                onClick={() => setAmount2(Math.max(0, totalAmount - amount1))}
                style={{
                  padding: '3px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'var(--rose-bg)',
                  border: '1px solid var(--rose-border)',
                  color: 'var(--rose-primary)',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                }}
              >
                Auto-Balance Remaining
              </button>
            )}
          </div>

          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
            * This split will be automatically booked to the exact columns (POS, Bank Transfer, Cash) in your Accounting Audit Desk records.
          </div>
        </div>
      )}

    </div>
  );
}
