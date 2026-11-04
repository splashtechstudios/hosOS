'use client';

import React, { useState } from 'react';
import {
  X,
  Fuel,
  Receipt,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Wallet,
  Building2,
  FileText,
  DollarSign,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';
import { StaffUser } from '@hosos/types';
import { useFeedback } from '@/context/FeedbackContext';

interface RecordExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeStaff: StaffUser;
  onExpenseRecorded?: () => void;
  initialDate?: string;
}

const PRESET_EXPENSE_CATEGORIES = [
  { title: 'Market Food Stuffs & Fresh Fish', defaultAmount: 45000, method: 'CASH' as const },
  { title: 'Cooking Gas Refill 50kg', defaultAmount: 48000, method: 'TRANSFER' as const },
  { title: 'Housekeeping Laundry Detergents', defaultAmount: 15000, method: 'CASH' as const },
  { title: 'Bar Ice Blocks Purchase', defaultAmount: 12000, method: 'CASH' as const },
  { title: 'Plumbing & Maintenance Fittings', defaultAmount: 25000, method: 'CASH' as const },
  { title: 'Kitchen Seasonings & Provisions', defaultAmount: 30000, method: 'POS' as const },
];

export default function RecordExpenseModal({
  isOpen,
  onClose,
  activeStaff,
  onExpenseRecorded,
  initialDate,
}: RecordExpenseModalProps) {
  const { showSuccess, showFailed } = useFeedback();

  const getTodayIso = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const [date, setDate] = useState(initialDate || getTodayIso());
  const [expenseType, setExpenseType] = useState<'PETTY_CASH' | 'DIESEL_FUEL'>('PETTY_CASH');

  // Petty Expense fields
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [recipient, setRecipient] = useState('');
  const [approvedBy, setApprovedBy] = useState(activeStaff.name || 'General Manager');
  const [paymentSource, setPaymentSource] = useState<'CASH' | 'POS' | 'TRANSFER'>('CASH');

  // Diesel fuel fields
  const [litresPurchased, setLitresPurchased] = useState<number | ''>('');
  const [pricePerLitre, setPricePerLitre] = useState<number>(1250);
  const [generatorHoursRun, setGeneratorHoursRun] = useState<number | ''>('');
  const [fuelPaymentMethod, setFuelPaymentMethod] = useState<'CASH' | 'TRANSFER' | 'POS'>('TRANSFER');
  const [fuelVendor, setFuelVendor] = useState('TotalEnergies Depot');

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const calculatedFuelCost =
    typeof litresPurchased === 'number' && litresPurchased > 0
      ? litresPurchased * pricePerLitre
      : 0;

  const handleApplyPreset = (preset: typeof PRESET_EXPENSE_CATEGORIES[0]) => {
    setDescription(preset.title);
    setAmount(preset.defaultAmount);
    setPaymentSource(preset.method);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: any = {
        date,
        type: expenseType,
        staffId: activeStaff.id,
        staffName: activeStaff.name,
        role: activeStaff.role,
      };

      if (expenseType === 'PETTY_CASH') {
        if (!description.trim() || !amount || Number(amount) <= 0) {
          showFailed('Validation Error', 'Please specify an expense description and a valid amount greater than ₦0.');
          setIsSubmitting(false);
          return;
        }
        payload.pettyExpense = {
          description: description.trim(),
          amount: Number(amount),
          recipient: recipient.trim() || 'Third-Party Vendor',
          approvedBy: approvedBy.trim() || activeStaff.name,
          paymentSource,
        };
      } else {
        if (!litresPurchased || Number(litresPurchased) <= 0) {
          showFailed('Validation Error', 'Please specify litres of fuel purchased.');
          setIsSubmitting(false);
          return;
        }
        payload.dieselExpense = {
          litresPurchased: Number(litresPurchased),
          pricePerLitre: Number(pricePerLitre) || 1250,
          totalCost: calculatedFuelCost,
          generatorHoursRun: Number(generatorHoursRun) || 0,
          paymentMethod: fuelPaymentMethod,
          vendor: fuelVendor.trim() || 'Depot',
        };
      }

      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (data.success) {
        showSuccess(
          'Operational Outlay Recorded',
          expenseType === 'PETTY_CASH'
            ? `₦${Number(amount).toLocaleString()} logged under ${description}.`
            : `₦${calculatedFuelCost.toLocaleString()} (${litresPurchased}L) logged to generator fuel account.`,
          `Synchronized with Manager Daily Shift Sheet for ${date}.`
        );
        if (onExpenseRecorded) onExpenseRecorded();
        onClose();
      } else {
        showFailed('Failed to Record Expense', data.error || 'Server error occurred.');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      showFailed('Network Error', err.message || 'Could not communicate with expense server.');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '580px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-modal)',
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#FEF2F2',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'rgba(220, 38, 38, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Fuel size={20} color="#DC2626" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#991B1B' }}>
                Record Operational Outlay &amp; Fuel Expense
              </h3>
              <p style={{ margin: 0, fontSize: '0.73rem', color: '#B91C1C' }}>
                Instant petty cash &amp; diesel purchase logging to daily shift sheets
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              padding: '6px',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#991B1B',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Date & Outlay Type Selector */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                Operational Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="ent-input"
                style={{ width: '100%', fontSize: '0.8125rem' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                Expense Type
              </label>
              <div style={{ display: 'flex', borderRadius: '8px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                <button
                  type="button"
                  onClick={() => setExpenseType('PETTY_CASH')}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    border: 'none',
                    backgroundColor: expenseType === 'PETTY_CASH' ? 'var(--brand-primary)' : '#FFFFFF',
                    color: expenseType === 'PETTY_CASH' ? '#FFFFFF' : 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  Petty Cash
                </button>
                <button
                  type="button"
                  onClick={() => setExpenseType('DIESEL_FUEL')}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    border: 'none',
                    backgroundColor: expenseType === 'DIESEL_FUEL' ? '#DC2626' : '#FFFFFF',
                    color: expenseType === 'DIESEL_FUEL' ? '#FFFFFF' : 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  Fuel &amp; Energy
                </button>
              </div>
            </div>
          </div>

          {/* Conditional Form: PETTY CASH */}
          {expenseType === 'PETTY_CASH' && (
            <>
              {/* Presets */}
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Quick Preset Outlays:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                  {PRESET_EXPENSE_CATEGORIES.map((preset) => (
                    <button
                      key={preset.title}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-secondary)',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                      }}
                    >
                      + {preset.title} (₦{preset.defaultAmount.toLocaleString()})
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  Expense Description *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Market Purchase: Fresh Catfish & Vegetables for Kitchen"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="ent-input"
                  style={{ width: '100%', fontSize: '0.8125rem' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    Amount (₦) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 45000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="ent-input"
                    style={{ width: '100%', fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    Paid From (Account Source)
                  </label>
                  <select
                    value={paymentSource}
                    onChange={(e) => setPaymentSource(e.target.value as any)}
                    className="ent-input"
                    style={{ width: '100%', fontSize: '0.8125rem' }}
                  >
                    <option value="CASH">Physical Cash Till (Daily Inflow Cash)</option>
                    <option value="TRANSFER">Company Bank Account (Transfer)</option>
                    <option value="POS">POS Terminal Account</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    Vendor / Recipient
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Local Food Market / Mama Ngozi"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="ent-input"
                    style={{ width: '100%', fontSize: '0.8125rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    Approved By (Authorized Manager)
                  </label>
                  <input
                    type="text"
                    value={approvedBy}
                    onChange={(e) => setApprovedBy(e.target.value)}
                    className="ent-input"
                    style={{ width: '100%', fontSize: '0.8125rem' }}
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* Conditional Form: DIESEL FUEL */}
          {expenseType === 'DIESEL_FUEL' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    Litres Purchased *
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 100"
                    value={litresPurchased}
                    onChange={(e) => setLitresPurchased(e.target.value === '' ? '' : Number(e.target.value))}
                    className="ent-input"
                    style={{ width: '100%', fontSize: '0.85rem', fontWeight: 700 }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    Price Per Litre (₦)
                  </label>
                  <input
                    type="number"
                    min="100"
                    value={pricePerLitre}
                    onChange={(e) => setPricePerLitre(Number(e.target.value))}
                    className="ent-input"
                    style={{ width: '100%', fontSize: '0.85rem', fontWeight: 700 }}
                    required
                  />
                </div>
              </div>

              {/* Total Cost Calculation Banner */}
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#991B1B' }}>
                  Total Fuel Expense:
                </span>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#DC2626', fontFamily: 'var(--font-mono)' }}>
                  ₦{calculatedFuelCost.toLocaleString()}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    Generator Run Hours (Today)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="e.g. 6.5"
                    value={generatorHoursRun}
                    onChange={(e) => setGeneratorHoursRun(e.target.value === '' ? '' : Number(e.target.value))}
                    className="ent-input"
                    style={{ width: '100%', fontSize: '0.8125rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    Payment Method
                  </label>
                  <select
                    value={fuelPaymentMethod}
                    onChange={(e) => setFuelPaymentMethod(e.target.value as any)}
                    className="ent-input"
                    style={{ width: '100%', fontSize: '0.8125rem' }}
                  >
                    <option value="TRANSFER">Company Bank Transfer (Account Pay)</option>
                    <option value="CASH">Physical Cash Till</option>
                    <option value="POS">POS Terminal</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  Fuel Depot / Station Vendor
                </label>
                <input
                  type="text"
                  placeholder="e.g. TotalEnergies / NNPC Mega Station"
                  value={fuelVendor}
                  onChange={(e) => setFuelVendor(e.target.value)}
                  className="ent-input"
                  style={{ width: '100%', fontSize: '0.8125rem' }}
                />
              </div>
            </>
          )}

          {/* Action Footer */}
          <div
            style={{
              paddingTop: '16px',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: '0.8125rem' }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
              style={{
                padding: '8px 20px',
                fontSize: '0.8125rem',
                backgroundColor: expenseType === 'DIESEL_FUEL' ? '#DC2626' : 'var(--brand-primary)',
                borderColor: expenseType === 'DIESEL_FUEL' ? '#DC2626' : 'var(--brand-primary)',
              }}
            >
              {isSubmitting ? 'Recording Outlay...' : 'Confirm & Log Outlay'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
