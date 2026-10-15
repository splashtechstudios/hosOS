'use client';

import React, { useState } from 'react';
import { StaffUser, Room } from '@hosos/types';
import { useFeedback } from '@/context/FeedbackContext';
import {
  Calendar,
  X,
  User,
  Phone,
  Mail,
  Hotel,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Building2,
  FileText
} from 'lucide-react';

interface NewReservationModalProps {
  rooms: Room[];
  activeStaff: StaffUser;
  isOpen: boolean;
  onClose: () => void;
  onReservationSuccess: () => void;
}

export default function NewReservationModal({
  rooms,
  activeStaff,
  isOpen,
  onClose,
  onReservationSuccess,
}: NewReservationModalProps) {
  const { showConfirm, showSuccess, showFailed } = useFeedback();

  // Set default dates: check-in tomorrow, check-out in 3 days
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const future = new Date(tomorrow);
  future.setDate(future.getDate() + 2);

  const formatDateForInput = (d: Date) => d.toISOString().split('T')[0];

  const [selectedRoomNumber, setSelectedRoomNumber] = useState(rooms[0]?.roomNumber || '101');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('+234 ');
  const [guestEmail, setGuestEmail] = useState('');
  const [checkInDate, setCheckInDate] = useState(formatDateForInput(tomorrow));
  const [checkOutDate, setCheckOutDate] = useState(formatDateForInput(future));
  const [source, setSource] = useState<'DIRECT_WALK_IN' | 'PHONE' | 'WHATSAPP' | 'WEBSITE_BOOKING' | 'CORPORATE'>('WHATSAPP');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedRoom = rooms.find(r => r.roomNumber === selectedRoomNumber) || rooms[0];
  const [ratePerNight, setRatePerNight] = useState<number>(selectedRoom?.rackRatePerNight || 65000);
  const [depositPaid, setDepositPaid] = useState<number>(0);

  // When room changes, sync rack rate
  const handleRoomChange = (roomNum: string) => {
    setSelectedRoomNumber(roomNum);
    const found = rooms.find(r => r.roomNumber === roomNum);
    if (found) {
      setRatePerNight(found.rackRatePerNight);
    }
  };

  if (!isOpen) return null;

  // Calculate nights
  const start = new Date(checkInDate);
  const end = new Date(checkOutDate);
  const diffTime = Math.max(0, end.getTime() - start.getTime());
  const nightsCount = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const totalBaseTariff = nightsCount * ratePerNight;
  const vat = Math.round(totalBaseTariff * 0.075);
  const consumptionTax = Math.round(totalBaseTariff * 0.05);
  const totalExpectedAmount = totalBaseTariff + vat + consumptionTax;

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!guestName.trim()) {
      showFailed('Validation Error', 'Guest full name is required for reservation booking.');
      return;
    }

    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      showFailed('Invalid Dates', 'Check-out date must be later than check-in date.');
      return;
    }

    showConfirm(
      `Confirm Room Reservation: Room #${selectedRoomNumber}`,
      `Book Room #${selectedRoomNumber} (${selectedRoom?.roomTypeName || 'Room'}) for ${guestName} from ${checkInDate} to ${checkOutDate} (${nightsCount} night(s))?`,
      async () => {
        setIsSubmitting(true);
        try {
          const res = await fetch('/api/reservations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              roomNumber: selectedRoomNumber,
              guestName,
              guestPhone,
              guestEmail,
              checkInDate,
              checkOutDate,
              ratePerNight,
              depositPaid,
              source,
              specialRequests,
              staff: activeStaff,
            }),
          });

          const data = await res.json();
          setIsSubmitting(false);

          if (res.status === 409) {
            // Double-booking collision detected
            showFailed(
              'Double-Booking Collision Detected!',
              data.error || `Room #${selectedRoomNumber} has an overlapping booking for the chosen dates. Please select an alternate room or adjust stay dates.`
            );
            return;
          }

          if (data.success) {
            onClose();
            onReservationSuccess();
            showSuccess(
              'Reservation Successfully Confirmed!',
              data.message,
              `Booking Ref: ${data.reservation?.reservationNumber || 'RES'} | Room #${selectedRoomNumber} | Total Expected: ${formatNaira(totalExpectedAmount)} | Deposit Secured: ${formatNaira(depositPaid)} | Channel: ${source.replace(/_/g, ' ')}`
            );
          } else {
            showFailed('Reservation Failed', data.error || 'Server error occurred during booking.');
          }
        } catch (err: any) {
          setIsSubmitting(false);
          showFailed('Network Error', err.message || 'Could not communicate with reservations API.');
        }
      },
      {
        confirmText: 'Confirm & Secure Booking',
        cancelText: 'Cancel',
        variant: 'primary',
        details: `Guest: ${guestName} | Room: #${selectedRoomNumber} | Duration: ${nightsCount} Nights (${checkInDate} -> ${checkOutDate}) | Booked By: ${activeStaff.name}`
      }
    );
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.7)',
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
        maxWidth: '580px',
        maxHeight: '94vh',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: 'var(--brand-bg)',
              color: 'var(--brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Calendar size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                New Room Reservation
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Date-range booking engine with automated double-booking collision prevention.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Room Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Select Room Inventory
            </label>
            <select
              value={selectedRoomNumber}
              onChange={(e) => handleRoomChange(e.target.value)}
              className="ent-input"
              style={{ width: '100%', fontWeight: 600 }}
            >
              {rooms.map(r => (
                <option key={r.id} value={r.roomNumber}>
                  Room #{r.roomNumber} - {r.roomTypeName} (Floor {r.floor}) • Rack: {formatNaira(r.rackRatePerNight)}/night
                </option>
              ))}
            </select>
          </div>

          {/* Guest Personal Information */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Guest Full Name *
              </label>
              <div style={{ position: 'relative' }}>
                <User size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Chief Adeyemi Thomas"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="ent-input"
                  style={{ width: '100%', paddingLeft: '32px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Phone Number *
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                <input
                  type="text"
                  required
                  placeholder="+234 803 000 0000"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="ent-input"
                  style={{ width: '100%', paddingLeft: '32px' }}
                />
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Email Address (Optional)
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
              <input
                type="email"
                placeholder="guest@company.ng"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="ent-input"
                style={{ width: '100%', paddingLeft: '32px' }}
              />
            </div>
          </div>

          {/* Stay Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Check-In Date *
              </label>
              <input
                type="date"
                required
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="ent-input"
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Check-Out Date *
              </label>
              <input
                type="date"
                required
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="ent-input"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Booking Channel & Rate Per Night */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Booking Channel
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as any)}
                className="ent-input"
                style={{ width: '100%' }}
              >
                <option value="WHATSAPP">WhatsApp Direct Concierge</option>
                <option value="PHONE">Direct Phone Call</option>
                <option value="DIRECT_WALK_IN">Front Desk Walk-In</option>
                <option value="WEBSITE_BOOKING">Official Website Portal</option>
                <option value="CORPORATE">Corporate Retainer Account</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Rate per Night (₦)
              </label>
              <input
                type="number"
                value={ratePerNight}
                onChange={(e) => setRatePerNight(Number(e.target.value))}
                className="ent-input"
                style={{ width: '100%', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
              />
            </div>
          </div>

          {/* Advance Deposit Paid */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Advance Booking Deposit Paid (₦)
            </label>
            <input
              type="number"
              value={depositPaid}
              onChange={(e) => setDepositPaid(Number(e.target.value))}
              placeholder="0"
              className="ent-input"
              style={{ width: '100%', fontFamily: 'var(--font-mono)' }}
            />
          </div>

          {/* Special Requests */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Special Requests / VIP Amenities
            </label>
            <textarea
              rows={2}
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="e.g. Airport pickup required, high floor preferred, quiet room, late check-in"
              className="ent-input"
              style={{ width: '100%', resize: 'none' }}
            />
          </div>

          {/* Financial Calculation Summary Box */}
          <div style={{
            backgroundColor: 'var(--brand-bg)',
            border: '1px solid var(--brand-border)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              <span>Stay Duration:</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{nightsCount} Night(s)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              <span>Base Tariff ({nightsCount} x {formatNaira(ratePerNight)}):</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formatNaira(totalBaseTariff)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              <span>Nigerian FIRS VAT (7.5%):</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{formatNaira(vat)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              <span>Lagos/State Consumption Tax (5%):</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{formatNaira(consumptionTax)}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '1rem',
              fontWeight: 800,
              color: 'var(--brand-primary)',
              paddingTop: '8px',
              borderTop: '1px dashed var(--brand-border)',
            }}>
              <span>Total Expected Folio:</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{formatNaira(totalExpectedAmount)}</span>
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            paddingTop: '12px',
            borderTop: '1px solid var(--border-color)',
          }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              <CheckCircle2 size={16} />
              <span>{isSubmitting ? 'Verifying Availability...' : 'Confirm Reservation'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
