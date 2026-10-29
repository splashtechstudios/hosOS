'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Hotel,
  UtensilsCrossed,
  Wine,
  Building2,
  ChevronRight,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  Star,
  Layers,
  Plus,
  Phone,
  MessageSquare,
  Calendar,
  ShieldAlert,
  CreditCard,
  RefreshCw,
  PhoneCall,
  Check,
  XCircle,
  Sparkles,
} from 'lucide-react';
import { StaffUser, Room } from '@hosos/types';
import { hasPermission } from '@/lib/rbac';
import { useFeedback } from '@/context/FeedbackContext';

interface HospitalityHubViewProps {
  activeStaff: StaffUser;
  rooms: Room[];
  onNavigate: (view: 'rooms' | 'kitchen' | 'bar' | 'halls' | 'message-board' | 'message-emails', group?: string) => void;
  onOpenNewReservation?: () => void;
}

export interface LiveReservationItem {
  _id?: string;
  reservationNumber: string;
  roomNumber: string;
  roomType?: string;
  numberOfRooms?: number;
  guestsCount?: number;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  checkInDate: string;
  checkOutDate: string;
  nightsCount: number;
  ratePerNight: number;
  totalExpectedAmount: number;
  depositPaid: number;
  status: 'PENDING_PAYMENT' | 'CONFIRMED' | 'CHECKED_IN' | 'CANCELLED' | 'NO_SHOW';
  paymentStatus: 'AWAITING_PAYMENT' | 'PARTIAL_DEPOSIT' | 'PAID_CONFIRMED';
  followUpStatus: 'PENDING' | 'CALLED' | 'TEXTED' | 'CALLED_AND_TEXTED';
  lastFollowUpAt?: string;
  lastFollowUpBy?: string;
  followUpNotes?: string;
  source: string;
  specialRequests?: string;
  createdAt?: string;
}

export default function HospitalityHubView({
  activeStaff,
  rooms,
  onNavigate,
  onOpenNewReservation,
}: HospitalityHubViewProps) {
  const { showToast, showConfirm, showSuccess, showFailed } = useFeedback();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDesktop, setIsDesktop] = useState(true);

  // Live Reservations & Follow-Up Desk State
  const [reservations, setReservations] = useState<LiveReservationItem[]>([]);
  const [isLoadingReservations, setIsLoadingReservations] = useState(true);
  const [resFilter, setResFilter] = useState<'ALL' | 'AWAITING_PAYMENT' | 'HONOURED'>('ALL');
  const [updatingResId, setUpdatingResId] = useState<string | null>(null);

  const fetchReservations = useCallback(async () => {
    try {
      setIsLoadingReservations(true);
      const res = await fetch('/api/reservations');
      const data = await res.json();
      if (data.success && Array.isArray(data.reservations)) {
        setReservations(data.reservations);
      }
    } catch (err) {
      console.warn('Could not load reservations in Hospitality Hub:', err);
    } finally {
      setIsLoadingReservations(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
    const poll = setInterval(fetchReservations, 15000);
    return () => clearInterval(poll);
  }, [fetchReservations]);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const occupiedCount = rooms.filter((r) => r.status === 'OCCUPIED').length;
  const vacantCleanCount = rooms.filter((r) => r.status === 'VACANT_CLEAN').length;
  const vacantDirtyCount = rooms.filter((r) => r.status === 'VACANT_DIRTY').length;
  const maintenanceCount = rooms.filter(
    (r) => r.status === 'MAINTENANCE' || r.status === 'OUT_OF_ORDER'
  ).length;
  const totalRooms = rooms.length;
  const occupancyPct = totalRooms > 0 ? Math.round((occupiedCount / totalRooms) * 100) : 0;

  const [, setRbacTick] = useState(0);
  useEffect(() => {
    const onRbacUpdate = () => setRbacTick((t) => t + 1);
    window.addEventListener('hosos_rbac_updated', onRbacUpdate);
    return () => window.removeEventListener('hosos_rbac_updated', onRbacUpdate);
  }, []);

  const canViewRooms = hasPermission(activeStaff.role, 'rooms.audit.view', activeStaff.id);
  const canViewPOS = hasPermission(activeStaff.role, 'orders.create', activeStaff.id);
  const canViewBar = hasPermission(activeStaff.role, 'orders.bar.create', activeStaff.id) || canViewPOS;
  const canViewReservations = hasPermission(activeStaff.role, 'reservations.view', activeStaff.id);
  const canCreateReservation = hasPermission(activeStaff.role, 'reservations.create', activeStaff.id);
  const canFollowUpReservation = hasPermission(activeStaff.role, 'reservations.followup', activeStaff.id);
  const canConfirmReservationPayment = hasPermission(activeStaff.role, 'reservations.confirm_payment', activeStaff.id);
  const canCancelReservation = hasPermission(activeStaff.role, 'reservations.cancel', activeStaff.id);
  const canManageServices =
    hasPermission(activeStaff.role, 'services.create', activeStaff.id) ||
    hasPermission(activeStaff.role, 'services.manage', activeStaff.id);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-NG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const formatNaira = (amount: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount || 0);

  const normalizePhoneForWhatsApp = (rawPhone: string) => {
    const digits = (rawPhone || '').replace(/\D/g, '');
    if (digits.startsWith('0') && digits.length === 11) {
      return `234${digits.slice(1)}`;
    }
    if (digits.startsWith('234')) {
      return digits;
    }
    return digits || '2348074538555';
  };

  // Trigger Follow-Up Action ("CALLED" or "TEXTED")
  const handleFollowUpTrigger = async (
    resItem: LiveReservationItem,
    action: 'CALLED' | 'TEXTED',
    openChannel: boolean = false
  ) => {
    if (openChannel) {
      if (action === 'TEXTED') {
        const waPhone = normalizePhoneForWhatsApp(resItem.guestPhone);
        const msg = `Hello ${resItem.guestName}, this is Osieka Resort Concierge following up on your reservation (${resItem.reservationNumber}) for ${resItem.roomType || `Room #${resItem.roomNumber}`} from ${resItem.checkInDate} to ${resItem.checkOutDate} (Total: ${formatNaira(resItem.totalExpectedAmount)}). Please note that reservations are only honoured and kept after payment confirmation. Kindly share your payment confirmation receipt to guarantee your room. Thank you!`;
        window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`, '_blank');
      } else if (action === 'CALLED') {
        window.location.href = `tel:${resItem.guestPhone.replace(/\s+/g, '')}`;
      }
    }

    setUpdatingResId(resItem.reservationNumber);
    try {
      const response = await fetch('/api/reservations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservationNumber: resItem.reservationNumber,
          followUpAction: action,
          staffName: activeStaff.name,
        }),
      });
      const data = await response.json();
      if (data.success) {
        showToast({
          type: 'success',
          title: `Follow-Up Logged: ${action === 'CALLED' ? 'Called Guest' : 'Texted Guest'}`,
          message: `${resItem.guestName} (${resItem.reservationNumber}) marked as ${action} by ${activeStaff.name}.`,
        });
        fetchReservations();
      }
    } catch (err) {
      console.warn('Follow-up update error:', err);
    } finally {
      setUpdatingResId(null);
    }
  };

  // Confirm Payment & Honour Reservation
  const handleConfirmPayment = (resItem: LiveReservationItem) => {
    showConfirm(
      `Confirm Payment & Honour Reservation (${resItem.reservationNumber})`,
      `Has payment of ${formatNaira(resItem.totalExpectedAmount)} been verified for ${resItem.guestName}? Confirming payment officially honours this reservation and keeps ${resItem.roomType || `Room #${resItem.roomNumber}`} for ${resItem.checkInDate} to ${resItem.checkOutDate}.`,
      async () => {
        setUpdatingResId(resItem.reservationNumber);
        try {
          const response = await fetch('/api/reservations', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              reservationNumber: resItem.reservationNumber,
              confirmPayment: true,
              amountPaid: resItem.totalExpectedAmount,
              staffName: activeStaff.name,
            }),
          });
          const data = await response.json();
          if (data.success) {
            showSuccess(
              'Payment Verified — Reservation Honoured & Room Kept!',
              `${resItem.guestName}'s reservation (${resItem.reservationNumber}) is now PAID & CONFIRMED.`,
              `Amount Verified: ${formatNaira(resItem.totalExpectedAmount)} • Verified by ${activeStaff.name}`
            );
            fetchReservations();
          } else {
            showFailed('Update Failed', data.error || 'Could not confirm payment.');
          }
        } catch (err: any) {
          showFailed('Network Error', err.message || 'Could not confirm payment.');
        } finally {
          setUpdatingResId(null);
        }
      },
      {
        confirmText: 'Confirm Payment & Keep Room',
        cancelText: 'Cancel',
        variant: 'emerald',
        details: `Guest: ${resItem.guestName} (${resItem.guestPhone}) | Stay: ${resItem.checkInDate} → ${resItem.checkOutDate} | Amount: ${formatNaira(resItem.totalExpectedAmount)}`,
      }
    );
  };

  const handleCancelUnpaid = (resItem: LiveReservationItem) => {
    showConfirm(
      `Release Unpaid Reservation (${resItem.reservationNumber})`,
      `Cancel this unpaid reservation request for ${resItem.guestName}? Per resort policy, reservations are only honoured and kept after payment.`,
      async () => {
        setUpdatingResId(resItem.reservationNumber);
        try {
          await fetch('/api/reservations', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              reservationNumber: resItem.reservationNumber,
              status: 'CANCELLED',
              staffName: activeStaff.name,
            }),
          });
          showToast({
            type: 'info',
            title: 'Unpaid Reservation Released',
            message: `${resItem.reservationNumber} marked as cancelled.`,
          });
          fetchReservations();
        } finally {
          setUpdatingResId(null);
        }
      },
      {
        confirmText: 'Release Unpaid Booking',
        cancelText: 'Keep Pending',
        variant: 'danger',
      }
    );
  };

  const activeReservations = reservations.filter((r) => r.status !== 'CANCELLED');
  const awaitingPaymentList = activeReservations.filter(
    (r) => r.paymentStatus === 'AWAITING_PAYMENT' || r.depositPaid <= 0
  );
  const honouredList = activeReservations.filter(
    (r) => r.paymentStatus === 'PAID_CONFIRMED' || r.paymentStatus === 'PARTIAL_DEPOSIT' || r.depositPaid > 0
  );

  const displayedReservations =
    resFilter === 'AWAITING_PAYMENT'
      ? awaitingPaymentList
      : resFilter === 'HONOURED'
      ? honouredList
      : activeReservations;

  // Total canonical groups requested by user: Rooms, Kitchen, Drinks, Halls and Events
  const hubs = [
    {
      id: 'rooms' as const,
      label: 'Rooms',
      sublabel: 'Hotel Rooms & Suites Occupancy Board',
      icon: Hotel,
      gradient: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)',
      shadowColor: 'rgba(37, 99, 235, 0.40)',
      borderColor: 'rgba(59, 130, 246, 0.4)',
      stats: [
        { label: 'Occupied', value: occupiedCount, color: '#93C5FD' },
        { label: 'Clean', value: vacantCleanCount, color: '#6EE7B7' },
        { label: 'Dirty', value: vacantDirtyCount, color: '#FDE68A' },
        { label: 'Repair', value: maintenanceCount, color: '#FCA5A5' },
      ],
      action: `Open Rooms \u2022 ${occupancyPct}% Occupancy`,
      locked: !canViewRooms,
    },
    {
      id: 'kitchen' as const,
      label: 'Kitchen',
      sublabel: 'Food Orders & Kitchen KDS Board',
      icon: UtensilsCrossed,
      gradient: 'linear-gradient(135deg, #7c2d12 0%, #ea580c 50%, #fb923c 100%)',
      shadowColor: 'rgba(234, 88, 12, 0.40)',
      borderColor: 'rgba(251, 146, 60, 0.4)',
      stats: [
        { label: 'Menu Items', value: '24+', color: '#FDE68A' },
        { label: 'Open Orders', value: 'Live', color: '#6EE7B7' },
        { label: 'KDS Active', value: '3', color: '#93C5FD' },
        { label: 'Daily Special', value: '5', color: '#F9A8D4' },
      ],
      action: 'Open Kitchen Board',
      locked: !canViewPOS,
    },
    {
      id: 'bar' as const,
      label: 'Drinks',
      sublabel: 'Bar, Spirits & Beverage Orders',
      icon: Wine,
      gradient: 'linear-gradient(135deg, #4a044e 0%, #9333ea 50%, #a855f7 100%)',
      shadowColor: 'rgba(147, 51, 234, 0.40)',
      borderColor: 'rgba(168, 85, 247, 0.4)',
      stats: [
        { label: 'Bar Items', value: '36+', color: '#FDE68A' },
        { label: 'Active Tabs', value: 'Live', color: '#6EE7B7' },
        { label: 'Spirits', value: '12', color: '#93C5FD' },
        { label: 'Mixers', value: '8', color: '#F9A8D4' },
      ],
      action: 'Open Drinks Board',
      locked: !canViewPOS,
    },
    {
      id: 'halls' as const,
      label: 'Halls and Events',
      sublabel: 'Banquets, Venues & Event Grounds',
      icon: Building2,
      gradient: 'linear-gradient(135deg, #3b0764 0%, #6b21a8 50%, #9333ea 100%)',
      shadowColor: 'rgba(107, 33, 168, 0.40)',
      borderColor: 'rgba(147, 51, 234, 0.4)',
      stats: [
        { label: 'Venues', value: '4 Halls', color: '#FDE68A' },
        { label: 'Grand Hall', value: '600 Cap', color: '#6EE7B7' },
        { label: 'Conference', value: '250 Cap', color: '#93C5FD' },
        { label: 'Lawn Garden', value: '800 Cap', color: '#F9A8D4' },
      ],
      action: 'Open Halls & Venues Board',
      locked: false,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', padding: '24px 0 60px' }}>
      {/* Hero Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          borderRadius: '20px',
          padding: '36px 42px',
          color: '#FFFFFF',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-80px',
            right: '-80px',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(37,99,235,0.3) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-60px',
            left: '10%',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(147,51,234,0.2) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        <div
          style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '24px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(37,99,235,0.5)',
                  fontSize: '1.4rem',
                  fontWeight: 900,
                }}
              >
                H
              </div>
              <div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'rgba(255,255,255,0.6)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                >
                  Osieka Luxury Resort
                </div>
                <h1
                  style={{
                    fontSize: '1.6rem',
                    fontWeight: 900,
                    color: '#FFFFFF',
                    margin: 0,
                    letterSpacing: '-0.03em',
                  }}
                >
                  Hospitality Command Hub
                </h1>
              </div>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem', margin: 0, maxWidth: '520px' }}>
              Welcome back, <strong style={{ color: '#93C5FD' }}>{activeStaff.name}</strong>. Access departmental boards
              and manage incoming website &amp; phone reservations below.
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '2rem',
                fontWeight: 900,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}
            >
              {formatTime(currentTime)}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '6px' }}>
              {formatDate(currentTime)}
            </div>
            <div style={{ marginTop: '10px', display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                onClick={() => onNavigate('message-board')}
                style={{
                  background: 'rgba(217,119,54,0.25)',
                  border: '1px solid rgba(217,119,54,0.55)',
                  color: '#FDE68A',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '5px 12px',
                  borderRadius: '20px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <MessageSquare size={13} />
                <span>Message Board</span>
              </button>
              <button
                onClick={() => onNavigate('message-emails')}
                style={{
                  background: 'rgba(139,92,246,0.25)',
                  border: '1px solid rgba(139,92,246,0.5)',
                  color: '#DDD6FE',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '5px 12px',
                  borderRadius: '20px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <Users size={13} />
                <span>Email List</span>
              </button>
              <span
                style={{
                  background: 'rgba(37,99,235,0.25)',
                  border: '1px solid rgba(59,130,246,0.4)',
                  color: '#93C5FD',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '20px',
                }}
              >
                {activeStaff.role.replace(/_/g, ' ')}
              </span>
              <span
                style={{
                  background: 'rgba(16,185,129,0.2)',
                  border: '1px solid rgba(16,185,129,0.3)',
                  color: '#6EE7B7',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '20px',
                }}
              >
                Active Session
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {[
            { label: 'Total Rooms', value: totalRooms, color: '#93C5FD', icon: Hotel },
            { label: 'Occupied Now', value: `${occupiedCount} (${occupancyPct}%)`, color: '#6EE7B7', icon: Users },
            { label: 'Ready to Check-In', value: vacantCleanCount, color: '#FDE68A', icon: CheckCircle2 },
            {
              label: 'Awaiting Payment Follow-Up',
              value: awaitingPaymentList.length,
              color: '#FCA5A5',
              icon: PhoneCall,
            },
          ].map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.label}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Icon size={14} color={m.color} />
                  <span
                    style={{
                      fontSize: '0.7rem',
                      color: 'rgba(255,255,255,0.45)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {m.label}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: '1.3rem',
                    fontWeight: 900,
                    color: m.color,
                    fontFamily: 'var(--font-mono)',
                    lineHeight: 1,
                  }}
                >
                  {m.value}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4 Primary Department Cards: Rooms, Kitchen, Drinks, Halls and Events */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isDesktop ? 'repeat(4, 1fr)' : 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
        }}
      >
        {hubs.map((hub) => {
          const Icon = hub.icon;
          const isHovered = hoveredCard === hub.id;

          return (
            <div
              key={hub.id}
              id={`hub-card-${hub.id}`}
              onMouseEnter={() => setHoveredCard(hub.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => !hub.locked && onNavigate(hub.id)}
              style={{
                background: hub.locked
                  ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
                  : hub.gradient,
                borderRadius: '20px',
                padding: '28px 24px',
                cursor: hub.locked ? 'not-allowed' : 'pointer',
                position: 'relative',
                overflow: 'hidden',
                border: `1px solid ${hub.locked ? 'rgba(255,255,255,0.06)' : hub.borderColor}`,
                boxShadow:
                  isHovered && !hub.locked
                    ? `0 20px 60px ${hub.shadowColor}, 0 4px 16px rgba(0,0,0,0.3)`
                    : '0 4px 16px rgba(0,0,0,0.15)',
                transform: isHovered && !hub.locked ? 'translateY(-6px) scale(1.01)' : 'translateY(0) scale(1)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                opacity: hub.locked ? 0.6 : 1,
                color: '#FFFFFF',
                userSelect: 'none',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '290px',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-40px',
                  right: '-40px',
                  width: '140px',
                  height: '140px',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)',
                  borderRadius: '50%',
                  pointerEvents: 'none',
                }}
              />

              {hub.locked && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.7)',
                    zIndex: 5,
                  }}
                >
                  Permission Required
                </div>
              )}

              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '14px',
                      background: 'rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={26} color="#FFFFFF" />
                  </div>
                  <div>
                    <h2
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: 900,
                        color: '#FFFFFF',
                        margin: 0,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {hub.label}
                    </h2>
                    <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.65)', margin: 0, marginTop: '2px' }}>
                      {hub.sublabel}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
                  {hub.stats.map((stat) => (
                    <div
                      key={stat.label}
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '8px',
                        padding: '10px 12px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '0.62rem',
                          color: 'rgba(255,255,255,0.55)',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          marginBottom: '2px',
                        }}
                      >
                        {stat.label}
                      </div>
                      <div
                        style={{
                          fontSize: '1.15rem',
                          fontWeight: 900,
                          color: stat.color,
                          fontFamily: 'var(--font-mono)',
                          lineHeight: 1,
                        }}
                      >
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ position: 'relative', zIndex: 2 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: isHovered && !hub.locked ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <TrendingUp size={13} color="rgba(255,255,255,0.7)" />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>
                      {hub.action}
                    </span>
                  </div>
                  <ChevronRight
                    size={16}
                    color="rgba(255,255,255,0.7)"
                    style={{
                      transform: isHovered && !hub.locked ? 'translateX(4px)' : 'translateX(0)',
                      transition: 'transform 0.2s ease',
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* =========================================================================
          INCOMING RESERVATIONS & PAYMENT FOLLOW-UP DESK (HOSPITALITY HUB)
         ========================================================================= */}
      <div
        className="ent-card"
        style={{
          padding: '24px',
          borderRadius: '18px',
          border: '1px solid var(--border-color)',
          backgroundColor: '#FFFFFF',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {/* Section Header + Policy Callout */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '16px',
            paddingBottom: '18px',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--brand-bg)',
                  color: 'var(--brand-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Calendar size={20} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Reservations &amp; Payment Follow-Up Desk
                  </h3>
                  <span
                    style={{
                      backgroundColor: '#FEF3C7',
                      color: '#92400E',
                      border: '1px solid #FDE68A',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: '20px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <ShieldAlert size={12} /> Policy: Reservation Only Honoured &amp; Kept After Payment
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                  Hold guest contacts (WhatsApp &amp; Phone Call), trigger follow-up status (<strong>Called</strong> or{' '}
                  <strong>Texted</strong>), and confirm payment to lock &amp; honour rooms.
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Filter Tabs */}
            <div
              style={{
                display: 'flex',
                backgroundColor: 'var(--bg-secondary)',
                padding: '3px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
              }}
            >
              <button
                onClick={() => setResFilter('ALL')}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  borderRadius: '6px',
                  backgroundColor: resFilter === 'ALL' ? '#FFFFFF' : 'transparent',
                  color: resFilter === 'ALL' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  boxShadow: resFilter === 'ALL' ? 'var(--shadow-xs)' : 'none',
                }}
              >
                All Active ({activeReservations.length})
              </button>
              <button
                onClick={() => setResFilter('AWAITING_PAYMENT')}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  borderRadius: '6px',
                  backgroundColor: resFilter === 'AWAITING_PAYMENT' ? '#FFFBEB' : 'transparent',
                  color: resFilter === 'AWAITING_PAYMENT' ? '#B45309' : 'var(--text-secondary)',
                  boxShadow: resFilter === 'AWAITING_PAYMENT' ? 'var(--shadow-xs)' : 'none',
                }}
              >
                Awaiting Payment ({awaitingPaymentList.length})
              </button>
              <button
                onClick={() => setResFilter('HONOURED')}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  borderRadius: '6px',
                  backgroundColor: resFilter === 'HONOURED' ? '#ECFDF5' : 'transparent',
                  color: resFilter === 'HONOURED' ? '#047857' : 'var(--text-secondary)',
                  boxShadow: resFilter === 'HONOURED' ? 'var(--shadow-xs)' : 'none',
                }}
              >
                Paid &amp; Honoured ({honouredList.length})
              </button>
            </div>

            <button
              onClick={fetchReservations}
              className="btn-secondary"
              style={{ padding: '7px 12px', fontSize: '0.78rem' }}
              title="Refresh Reservations"
            >
              <RefreshCw size={14} className={isLoadingReservations ? 'animate-spin' : ''} />
              <span>Sync</span>
            </button>

            {onOpenNewReservation && canCreateReservation && (
              <button
                onClick={onOpenNewReservation}
                className="btn-primary"
                style={{ padding: '7px 14px', fontSize: '0.78rem' }}
              >
                <Plus size={14} />
                <span>+ Log Reservation</span>
              </button>
            )}
          </div>
        </div>

        {/* Reservations Cards / Table List */}
        {displayedReservations.length === 0 ? (
          <div style={{ padding: '42px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Calendar size={32} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
              No Reservations in This Filter
            </div>
            <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>
              New bookings submitted from the website or front desk will appear here automatically with guest WhatsApp &amp; phone contacts.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isDesktop ? 'repeat(2, 1fr)' : '1fr',
              gap: '16px',
              marginTop: '18px',
            }}
          >
            {displayedReservations.map((resItem) => {
              const isPaid =
                resItem.paymentStatus === 'PAID_CONFIRMED' ||
                resItem.paymentStatus === 'PARTIAL_DEPOSIT' ||
                resItem.depositPaid > 0;
              const isCalled =
                resItem.followUpStatus === 'CALLED' || resItem.followUpStatus === 'CALLED_AND_TEXTED';
              const isTexted =
                resItem.followUpStatus === 'TEXTED' || resItem.followUpStatus === 'CALLED_AND_TEXTED';
              const isBusy = updatingResId === resItem.reservationNumber;

              return (
                <div
                  key={resItem.reservationNumber}
                  style={{
                    border: `1.5px solid ${isPaid ? '#A7F3D0' : '#FDE68A'}`,
                    backgroundColor: isPaid ? '#F8FAFC' : '#FFFDF7',
                    borderRadius: '14px',
                    padding: '18px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '14px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {/* Top Row: Guest Name, Booking Ref, Payment Honour Status */}
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '10px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span
                            style={{
                              fontSize: '1.05rem',
                              fontWeight: 800,
                              color: 'var(--text-primary)',
                            }}
                          >
                            {resItem.guestName}
                          </span>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              backgroundColor: 'var(--bg-secondary)',
                              color: 'var(--text-secondary)',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              border: '1px solid var(--border-color)',
                            }}
                          >
                            {resItem.reservationNumber}
                          </span>
                          <span className="badge badge-brand" style={{ fontSize: '0.65rem' }}>
                            {(resItem.source || 'WEBSITE_BOOKING').replace(/_/g, ' ')}
                          </span>
                        </div>

                        <div
                          style={{
                            fontSize: '0.8rem',
                            color: 'var(--text-secondary)',
                            marginTop: '4px',
                            fontWeight: 600,
                          }}
                        >
                          {resItem.roomType || `Room #${resItem.roomNumber}`} (Room #{resItem.roomNumber}) •{' '}
                          {resItem.numberOfRooms || 1} Room(s) • {resItem.nightsCount} Night(s)
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Check-In: <strong>{resItem.checkInDate}</strong> → Check-Out:{' '}
                          <strong>{resItem.checkOutDate}</strong>
                        </div>
                      </div>

                      {/* Payment & Honour Status Badge */}
                      <div style={{ textAlign: 'right' }}>
                        {isPaid ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              backgroundColor: '#ECFDF5',
                              color: '#065F46',
                              border: '1px solid #6EE7B7',
                              padding: '4px 10px',
                              borderRadius: '20px',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                            }}
                          >
                            <CheckCircle2 size={13} /> Payment Verified • Room Kept
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              backgroundColor: '#FEF3C7',
                              color: '#92400E',
                              border: '1px solid #FCD34D',
                              padding: '4px 10px',
                              borderRadius: '20px',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                            }}
                          >
                            <Clock size={13} /> Awaiting Payment (Not Yet Honoured)
                          </span>
                        )}
                        <div
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '1.05rem',
                            fontWeight: 900,
                            color: 'var(--text-primary)',
                            marginTop: '6px',
                          }}
                        >
                          {formatNaira(resItem.totalExpectedAmount)}
                        </div>
                      </div>
                    </div>

                    {/* Guest Contact Hold Bar (Phone + WhatsApp + Email) */}
                    <div
                      style={{
                        marginTop: '12px',
                        padding: '10px 12px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid var(--border-color)',
                        borderRadius: '10px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '10px',
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                          Held Guest Contact (Call / WhatsApp)
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.88rem',
                              fontWeight: 800,
                              color: 'var(--text-primary)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                            }}
                          >
                            <Phone size={13} color="var(--brand-primary)" /> {resItem.guestPhone}
                          </span>
                          {resItem.guestEmail && (
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                              • {resItem.guestEmail}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Direct Call & WhatsApp Launchers */}
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleFollowUpTrigger(resItem, 'CALLED', true)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '6px 11px',
                            borderRadius: '8px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            backgroundColor: '#EFF6FF',
                            color: '#1D4ED8',
                            border: '1px solid #BFDBFE',
                          }}
                          title="Call Guest & Mark as Called"
                        >
                          <PhoneCall size={13} /> Call Now
                        </button>
                        <button
                          onClick={() => handleFollowUpTrigger(resItem, 'TEXTED', true)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '6px 11px',
                            borderRadius: '8px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            backgroundColor: '#ECFDF5',
                            color: '#047857',
                            border: '1px solid #A7F3D0',
                          }}
                          title="Open WhatsApp Follow-Up & Mark as Texted"
                        >
                          <MessageSquare size={13} /> WhatsApp
                        </button>
                      </div>
                    </div>

                    {resItem.specialRequests && (
                      <div
                        style={{
                          marginTop: '8px',
                          fontSize: '0.75rem',
                          color: 'var(--text-secondary)',
                          fontStyle: 'italic',
                        }}
                      >
                        Note: &ldquo;{resItem.specialRequests}&rdquo;
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Bar: Follow-Up Triggers ("Called" / "Texted") + Confirm Payment */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '8px',
                      paddingTop: '10px',
                      borderTop: '1px dashed var(--border-color)',
                    }}
                  >
                    {/* Follow-up status triggers */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                        Follow-Up Trigger:
                      </span>
                      {canFollowUpReservation ? (
                        <>
                          <button
                            disabled={isBusy}
                            onClick={() => handleFollowUpTrigger(resItem, 'CALLED', false)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              backgroundColor: isCalled ? '#1D4ED8' : '#FFFFFF',
                              color: isCalled ? '#FFFFFF' : 'var(--text-secondary)',
                              border: `1px solid ${isCalled ? '#1D4ED8' : 'var(--border-color)'}`,
                            }}
                          >
                            {isCalled ? <Check size={12} /> : <Phone size={12} />}
                            <span>{isCalled ? 'Called ✓' : 'Mark Called'}</span>
                          </button>

                          <button
                            disabled={isBusy}
                            onClick={() => handleFollowUpTrigger(resItem, 'TEXTED', false)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              backgroundColor: isTexted ? '#059669' : '#FFFFFF',
                              color: isTexted ? '#FFFFFF' : 'var(--text-secondary)',
                              border: `1px solid ${isTexted ? '#059669' : 'var(--border-color)'}`,
                            }}
                          >
                            {isTexted ? <Check size={12} /> : <MessageSquare size={12} />}
                            <span>{isTexted ? 'Texted ✓' : 'Mark Texted'}</span>
                          </button>
                        </>
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {resItem.followUpStatus.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>

                    {/* Payment Confirmation / Honour Trigger */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {!isPaid ? (
                        <>
                          {canConfirmReservationPayment && (
                            <button
                              disabled={isBusy}
                              onClick={() => handleConfirmPayment(resItem)}
                              className="btn-primary"
                              style={{
                                backgroundColor: '#059669',
                                padding: '6px 12px',
                                fontSize: '0.74rem',
                              }}
                            >
                              <CreditCard size={13} />
                              <span>Confirm Payment &amp; Honour</span>
                            </button>
                          )}
                          {canCancelReservation && (
                            <button
                              disabled={isBusy}
                              onClick={() => handleCancelUnpaid(resItem)}
                              className="btn-secondary"
                              style={{
                                padding: '6px 10px',
                                fontSize: '0.72rem',
                                color: 'var(--rose-primary)',
                              }}
                              title="Release unpaid reservation"
                            >
                              <XCircle size={13} />
                            </button>
                          )}
                        </>
                      ) : (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            color: '#059669',
                            fontWeight: 700,
                          }}
                        >
                          ✓ Honoured &amp; Guaranteed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Ancillary Services & Custom Groups Banner */}
      <div
        className="ent-card"
        style={{
          padding: '20px 24px',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} color="var(--brand-primary)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Laundry &amp; Ancillary Services
              </h3>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              Dry cleaning, laundry wash &amp; press, VIP airport chauffeur transfers, spa sessions, and custom
              department services.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigate('halls', 'Laundry & Ancillary Services')}
              className="btn-secondary"
              style={{ fontSize: '0.78rem', padding: '8px 14px' }}
            >
              <span>View Laundry &amp; Ancillary Services</span>
            </button>

            {canManageServices && (
              <button
                onClick={() => onNavigate('halls', 'ALL')}
                className="btn-primary"
                style={{
                  fontSize: '0.78rem',
                  padding: '8px 14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Plus size={14} />
                <span>+ Create Service / Group</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
        Click any department card to enter its operational board · Permissions strictly governed by Multi-Role RBAC
        Matrix
      </div>
    </div>
  );
}
