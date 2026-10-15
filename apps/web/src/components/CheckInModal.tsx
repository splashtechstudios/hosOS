'use client';

import React, { useState } from 'react';
import { StaffUser, Room } from '@hosos/types';
import { useFeedback } from '@/context/FeedbackContext';
import { 
  UserCheck, 
  X, 
  Calendar, 
  CreditCard, 
  KeyRound, 
  Phone, 
  User, 
  Mail, 
  ShieldCheck, 
  Banknote,
  Send,
  Building2
} from 'lucide-react';

interface CheckInModalProps {
  room: Room;
  activeStaff: StaffUser;
  isOpen: boolean;
  onClose: () => void;
  onCheckInSuccess: () => void;
}

export default function CheckInModal({
  room,
  activeStaff,
  isOpen,
  onClose,
  onCheckInSuccess,
}: CheckInModalProps) {
  const { showConfirm, showSuccess, showFailed } = useFeedback();

  const [guestName, setGuestName] = useState('Chief Emeka Nwosu');
  const [guestPhone, setGuestPhone] = useState('+234 803 555 0192');
  const [guestEmail, setGuestEmail] = useState('emeka.nwosu@danfoss-energy.ng');
  const [nin, setNin] = useState('29481920491');
  const [nightsCount, setNightsCount] = useState(2);
  const [ratePerNight, setRatePerNight] = useState(room.rackRatePerNight || 65000);
  const [advancePayment, setAdvancePayment] = useState(ratePerNight);
  const [paymentMethod, setPaymentMethod] = useState<'POS_TERMINAL' | 'BANK_TRANSFER' | 'CASH'>('POS_TERMINAL');
  const [keycardNumber, setKeycardNumber] = useState(`KC-${room.roomNumber}-A`);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const baseTariff = ratePerNight * nightsCount;
  const vat = Math.round(baseTariff * 0.075);
  const consumptionTax = Math.round(baseTariff * 0.05);
  const totalExpectedFolio = baseTariff + vat + consumptionTax;
  const remainingDue = totalExpectedFolio - advancePayment;

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!guestName.trim()) {
      showFailed('Validation Error', 'Guest full name is required for check-in registration.');
      return;
    }

    showConfirm(
      `Confirm Guest Check-In: Room #${room.roomNumber}`,
      `Are you ready to activate occupancy for ${guestName} in Room #${room.roomNumber} (${room.roomTypeName}) for ${nightsCount} night(s)?`,
      async () => {
        setIsSubmitting(true);
        try {
          const res = await fetch('/api/rooms/check-in', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              roomNumber: room.roomNumber,
              guestName,
              guestPhone,
              guestEmail,
              nin,
              nightsCount,
              ratePerNight,
              advancePayment,
              paymentMethod,
              staff: activeStaff,
            }),
          });

          const data = await res.json();
          setIsSubmitting(false);

          if (data.success) {
            onClose();
            onCheckInSuccess();
            showSuccess(
              'Guest Checked In Successfully!',
              data.message,
              `Folio #${data.folio?.folioNumber || 'FOL-OPEN'} activated | Assigned Keycard: ${keycardNumber} | Welcome SMS dispatched to ${guestPhone} with Wi-Fi login credentials.`
            );
          } else {
            showFailed('Check-In Failed', data.error || 'Server error occurred during check-in.');
          }
        } catch (err: any) {
          setIsSubmitting(false);
          showFailed('Network Error', err.message || 'Could not communicate with check-in API.');
        }
      },
      {
        confirmText: 'Activate Check-In & Issue Key',
        variant: 'emerald',
        details: `Guest: ${guestName} | Room: #${room.roomNumber} (${room.roomTypeName}) | Advance Deposit: ${formatNaira(advancePayment)} (${paymentMethod.replace(/_/g, ' ')}) | Receptionist: ${activeStaff.name}`
      }
    );
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(6px)',
      zIndex: 999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        width: '100%',
        maxWidth: '560px',
        maxHeight: '92vh',
        overflowY: 'auto',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-modal)',
        border: '1px solid var(--border-color)',
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-secondary)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserCheck size={22} color="var(--brand-primary)" />
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Guest Check-In Registration — Room #{room.roomNumber}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {room.roomTypeName} • Floor {room.floor} • Base Rate: {formatNaira(room.rackRatePerNight)}/night
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleCheckInSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Guest Identity */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Guest Full Name *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Phone Number (for SMS Wi-Fi code) *
              </label>
              <input
                type="tel"
                required
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                style={{ width: '100%', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Email Address
              </label>
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                style={{ width: '100%', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                NIN / Passport / ID Number
              </label>
              <input
                type="text"
                value={nin}
                onChange={(e) => setNin(e.target.value)}
                style={{ width: '100%', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {/* Stay Details */}
          <div style={{ background: 'var(--bg-secondary)', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px' }}>
              STAY DURATION & ROOM TARIFF
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.725rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Nights Count
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={nightsCount}
                  onChange={(e) => setNightsCount(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.725rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Agreed Rate/Night
                </label>
                <input
                  type="number"
                  step={5000}
                  value={ratePerNight}
                  onChange={(e) => setRatePerNight(parseInt(e.target.value) || 0)}
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.725rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Keycard Identifier
                </label>
                <input
                  type="text"
                  value={keycardNumber}
                  onChange={(e) => setKeycardNumber(e.target.value)}
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span>Base Accommodation: {formatNaira(baseTariff)}</span>
              <span>VAT (7.5%) + Tax (5%): {formatNaira(vat + consumptionTax)}</span>
              <span style={{ fontWeight: 800, color: 'var(--brand-primary)' }}>Total: {formatNaira(totalExpectedFolio)}</span>
            </div>
          </div>

          {/* Advance Deposit & Payment */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Advance Deposit Amount (NGN)
              </label>
              <input
                type="number"
                step={5000}
                value={advancePayment}
                onChange={(e) => setAdvancePayment(parseInt(e.target.value) || 0)}
                style={{ width: '100%', fontSize: '0.85rem', fontWeight: 700 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Payment Channel
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                style={{ width: '100%', fontSize: '0.85rem' }}
              >
                <option value="POS_TERMINAL">Moniepoint POS Terminal</option>
                <option value="BANK_TRANSFER">Instant Bank Transfer</option>
                <option value="CASH">Physical Cash</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '8px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-color)',
          }}>
            <button type="button" onClick={onClose} disabled={isSubmitting} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
              style={{ backgroundColor: 'var(--emerald-primary)' }}
            >
              <ShieldCheck size={16} />
              <span>{isSubmitting ? 'Processing Check-In...' : 'Confirm Check-In & Issue Keycard'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
