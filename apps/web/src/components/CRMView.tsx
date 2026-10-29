'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Briefcase,
  Search,
  Plus,
  Crown,
  MessageSquare,
  Phone,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  PhoneCall,
  CreditCard,
  Check,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import { GuestProfile, CorporateDeal, StaffUser, CRMDealStage } from '@hosos/types';
import { INITIAL_GUEST_PROFILES, INITIAL_CORPORATE_DEALS } from '@/lib/mockData';
import { LiveReservationItem } from '@/components/HospitalityHubView';
import { useFeedback } from '@/context/FeedbackContext';

export default function CRMView({
  activeStaff,
  defaultTab = 'GUESTS',
}: {
  activeStaff: StaffUser;
  defaultTab?: 'GUESTS' | 'RESERVATIONS' | 'CORPORATE_PIPELINE';
}) {
  const { showToast, showConfirm, showSuccess, showFailed } = useFeedback();
  const [activeTab, setActiveTab] = useState<'GUESTS' | 'RESERVATIONS' | 'CORPORATE_PIPELINE'>(defaultTab);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  const [guestList, setGuestList] = useState<GuestProfile[]>(INITIAL_GUEST_PROFILES);
  const [dealList, setDealList] = useState<CorporateDeal[]>(INITIAL_CORPORATE_DEALS);
  const [reservations, setReservations] = useState<LiveReservationItem[]>([]);
  const [isLoadingReservations, setIsLoadingReservations] = useState(true);
  const [updatingResId, setUpdatingResId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // New Guest Modal State
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestPhone, setNewGuestPhone] = useState('');
  const [newGuestCompany, setNewGuestCompany] = useState('');
  const [newGuestPref, setNewGuestPref] = useState('High Floor, Garden View');

  // New Deal Modal State
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [newDealTitle, setNewDealTitle] = useState('');
  const [newDealCompany, setNewDealCompany] = useState('');
  const [newDealValue, setNewDealValue] = useState(12000000);
  const [newDealVenue, setNewDealVenue] = useState('Grand Marina Banquet Hall');

  // Fetch live reservations from /api/reservations and sync guests into CRM directory
  const fetchCRMReservations = useCallback(async () => {
    try {
      setIsLoadingReservations(true);
      const res = await fetch('/api/reservations');
      const data = await res.json();
      if (data.success && Array.isArray(data.reservations)) {
        const resItems: LiveReservationItem[] = data.reservations;
        setReservations(resItems);

        // Merge any new reservation guests into the CRM Guest Directory dynamically
        setGuestList((prevGuests) => {
          const existingNames = new Set(prevGuests.map((g) => g.fullName.toLowerCase()));
          const dynamicGuests: GuestProfile[] = [];

          resItems.forEach((r) => {
            if (r.guestName && !existingNames.has(r.guestName.toLowerCase())) {
              existingNames.add(r.guestName.toLowerCase());
              const isPaid =
                r.paymentStatus === 'PAID_CONFIRMED' ||
                r.paymentStatus === 'PARTIAL_DEPOSIT' ||
                r.depositPaid > 0;
              dynamicGuests.push({
                id: `crm-res-${r.reservationNumber}`,
                fullName: r.guestName,
                email: r.guestEmail || `${r.guestName.toLowerCase().replace(/\s+/g, '.')}@guest.osieka.com`,
                phone: r.guestPhone,
                nationalIdOrPassport: `RES-${r.reservationNumber}`,
                loyaltyTier: r.roomType?.includes('VIP') ? 'GOLD' : 'SILVER',
                loyaltyPoints: Math.round((r.totalExpectedAmount || 10000) / 100),
                totalLifetimeSpend: isPaid ? r.totalExpectedAmount : 0,
                totalStaysCount: 1,
                totalDiningOrdersCount: 0,
                roomPreferences: [r.roomType || `Room #${r.roomNumber}`],
                dietaryRestrictions: r.specialRequests ? [r.specialRequests] : ['None specified'],
                corporateCompanyName:
                  r.source === 'WEBSITE_BOOKING' ? 'Website Direct Booking' : r.source.replace(/_/g, ' '),
                whatsappOptIn: true,
                notes: `Reservation ${r.reservationNumber} (${r.checkInDate} → ${r.checkOutDate}) • ${
                  isPaid ? 'Payment Verified & Room Honoured' : 'Awaiting Payment Follow-Up'
                }`,
                lastVisitDate: r.checkInDate,
                createdAt: r.createdAt || new Date().toISOString(),
              });
            }
          });

          return [...dynamicGuests, ...prevGuests];
        });
      }
    } catch (err) {
      console.warn('Error fetching CRM reservations:', err);
    } finally {
      setIsLoadingReservations(false);
    }
  }, []);

  useEffect(() => {
    fetchCRMReservations();
    const interval = setInterval(fetchCRMReservations, 15000);
    return () => clearInterval(interval);
  }, [fetchCRMReservations]);

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

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

  const handleFollowUpTrigger = async (
    resItem: LiveReservationItem,
    action: 'CALLED' | 'TEXTED',
    openChannel: boolean = false
  ) => {
    if (openChannel) {
      if (action === 'TEXTED') {
        const waPhone = normalizePhoneForWhatsApp(resItem.guestPhone);
        const msg = `Hello ${resItem.guestName}, this is Osieka Resort CRM Desk following up on your reservation (${resItem.reservationNumber}) for ${resItem.roomType || `Room #${resItem.roomNumber}`} (${resItem.checkInDate} to ${resItem.checkOutDate}, Total: ${formatNaira(resItem.totalExpectedAmount)}). Please note that reservations are only honoured and kept after payment confirmation. Kindly confirm payment to secure your booking.`;
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
          title: `CRM Follow-Up Logged: ${action}`,
          message: `Marked ${resItem.guestName} (${resItem.reservationNumber}) as ${action}.`,
        });
        fetchCRMReservations();
      }
    } finally {
      setUpdatingResId(null);
    }
  };

  const handleConfirmPayment = (resItem: LiveReservationItem) => {
    showConfirm(
      `Confirm Payment & Honour Reservation (${resItem.reservationNumber})`,
      `Has payment of ${formatNaira(resItem.totalExpectedAmount)} been verified for ${resItem.guestName}? Per resort policy, reservations are only honoured and kept after payment.`,
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
              'Payment Confirmed — Reservation Honoured!',
              `${resItem.guestName}'s reservation (${resItem.reservationNumber}) is now PAID & KEPT.`,
              `Amount: ${formatNaira(resItem.totalExpectedAmount)} • Verified by ${activeStaff.name}`
            );
            fetchCRMReservations();
          } else {
            showFailed('Error', data.error || 'Could not confirm payment.');
          }
        } finally {
          setUpdatingResId(null);
        }
      },
      {
        confirmText: 'Confirm Payment & Honour Booking',
        cancelText: 'Cancel',
        variant: 'emerald',
      }
    );
  };

  const getLoyaltyBadge = (tier: string) => {
    switch (tier) {
      case 'PLATINUM_VIP':
        return (
          <span className="badge badge-purple">
            <Crown size={12} /> Platinum VIP
          </span>
        );
      case 'GOLD':
        return (
          <span className="badge badge-dirty">
            <Crown size={12} /> Gold VIP
          </span>
        );
      case 'SILVER':
        return <span className="badge badge-clean">Silver Tier</span>;
      default:
        return <span className="badge badge-neutral">Standard</span>;
    }
  };

  const getStageBadge = (stage: CRMDealStage) => {
    switch (stage) {
      case 'CONTRACT_QUOTED':
        return <span className="badge badge-brand">Contract Quoted</span>;
      case 'DEPOSIT_PAID':
        return <span className="badge badge-clean">Deposit Paid</span>;
      case 'EVENT_ACTIVE':
        return <span className="badge badge-purple">Event Active</span>;
      case 'SITE_INSPECTION':
        return <span className="badge badge-dirty">Site Inspection</span>;
      case 'INVOICED_SETTLED':
        return <span className="badge badge-clean">Fully Settled</span>;
      default:
        return <span className="badge badge-neutral">{stage}</span>;
    }
  };

  const filteredGuests = guestList.filter((g) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      g.fullName.toLowerCase().includes(q) ||
      g.phone.includes(q) ||
      (g.corporateCompanyName && g.corporateCompanyName.toLowerCase().includes(q))
    );
  });

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName) return;
    const createdGuest: GuestProfile = {
      id: `crm-gst-${Date.now()}`,
      fullName: newGuestName,
      email: `${newGuestName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      phone: newGuestPhone || '+234 800 000 0000',
      nationalIdOrPassport: 'NIN-TEMP-' + Math.floor(100000 + Math.random() * 900000),
      loyaltyTier: 'GOLD',
      loyaltyPoints: 1000,
      totalLifetimeSpend: 250000,
      totalStaysCount: 1,
      totalDiningOrdersCount: 2,
      roomPreferences: [newGuestPref],
      dietaryRestrictions: ['None specified'],
      corporateCompanyName: newGuestCompany || undefined,
      whatsappOptIn: true,
      notes: `Onboarded into CRM by ${activeStaff.name} on ${new Date().toLocaleDateString()}.`,
      lastVisitDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };
    setGuestList([createdGuest, ...guestList]);
    setIsGuestModalOpen(false);
    setNewGuestName('');
    setNewGuestPhone('');
    setNewGuestCompany('');
  };

  const handleAddDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDealTitle) return;
    const createdDeal: CorporateDeal = {
      id: `deal-${Date.now()}`,
      dealTitle: newDealTitle,
      companyName: newDealCompany || 'Private Event Client',
      contactPerson: 'Lead Coordinator',
      contactEmail: 'events@client.ng',
      contactPhone: '+234 803 123 4567',
      dealValue: newDealValue,
      depositPaid: Math.round(newDealValue * 0.5),
      balanceDue: Math.round(newDealValue * 0.5),
      stage: 'CONTRACT_QUOTED',
      hallOrLawn: newDealVenue,
      roomsBlocked: 10,
      eventDate: '2026-11-20',
      assignedAccountManager: `${activeStaff.name} (${activeStaff.role})`,
      createdAt: new Date().toISOString(),
    };
    setDealList([createdDeal, ...dealList]);
    setIsDealModalOpen(false);
    setNewDealTitle('');
    setNewDealCompany('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px 0' }}>
      {/* 1. Header Banner & View Toggle */}
      <div className="ent-card" style={{ padding: '20px 24px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Briefcase size={24} color="var(--brand-primary)" />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Enterprise Guest, Reservations &amp; Corporate CRM
              </h2>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Unified customer directory, live website &amp; front-desk reservations follow-up ledger, and corporate
              event deals pipeline.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'flex',
                backgroundColor: 'var(--bg-secondary)',
                padding: '3px',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <button
                onClick={() => setActiveTab('GUESTS')}
                style={{
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  borderRadius: '4px',
                  backgroundColor: activeTab === 'GUESTS' ? '#FFFFFF' : 'transparent',
                  color: activeTab === 'GUESTS' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  boxShadow: activeTab === 'GUESTS' ? 'var(--shadow-xs)' : 'none',
                }}
              >
                VIP Guest Directory ({guestList.length})
              </button>
              <button
                onClick={() => setActiveTab('RESERVATIONS')}
                style={{
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  borderRadius: '4px',
                  backgroundColor: activeTab === 'RESERVATIONS' ? '#FFFFFF' : 'transparent',
                  color: activeTab === 'RESERVATIONS' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  boxShadow: activeTab === 'RESERVATIONS' ? 'var(--shadow-xs)' : 'none',
                }}
              >
                Reservations &amp; Follow-Up ({reservations.length})
              </button>
              <button
                onClick={() => setActiveTab('CORPORATE_PIPELINE')}
                style={{
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  borderRadius: '4px',
                  backgroundColor: activeTab === 'CORPORATE_PIPELINE' ? '#FFFFFF' : 'transparent',
                  color: activeTab === 'CORPORATE_PIPELINE' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  boxShadow: activeTab === 'CORPORATE_PIPELINE' ? 'var(--shadow-xs)' : 'none',
                }}
              >
                Corporate Pipeline ({dealList.length})
              </button>
            </div>

            {activeTab === 'GUESTS' && (
              <button onClick={() => setIsGuestModalOpen(true)} className="btn-primary">
                <Plus size={15} />
                <span>+ Onboard VIP Guest</span>
              </button>
            )}
            {activeTab === 'RESERVATIONS' && (
              <button onClick={fetchCRMReservations} className="btn-secondary">
                <RefreshCw size={14} className={isLoadingReservations ? 'animate-spin' : ''} />
                <span>Refresh Live Bookings</span>
              </button>
            )}
            {activeTab === 'CORPORATE_PIPELINE' && (
              <button onClick={() => setIsDealModalOpen(true)} className="btn-primary">
                <Plus size={15} />
                <span>+ Create Corporate Deal</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. TAB A: GUEST CRM DIRECTORY */}
      {activeTab === 'GUESTS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Search bar */}
          <div className="ent-card" style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Search size={18} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search guests by name, phone (+234), or booking channel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', border: 'none', padding: '6px 0', fontSize: '0.875rem' }}
            />
          </div>

          {/* Guest Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: '16px',
            }}
          >
            {filteredGuests.map((guest) => (
              <div key={guest.id} className="ent-card-interactive" style={{ padding: '22px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '14px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {guest.fullName}
                      </h3>
                      {getLoyaltyBadge(guest.loyaltyTier)}
                    </div>
                    {guest.corporateCompanyName && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.75rem',
                          color: 'var(--brand-primary)',
                          fontWeight: 600,
                          marginTop: '2px',
                        }}
                      >
                        <Building2 size={13} />
                        <span>{guest.corporateCompanyName}</span>
                      </div>
                    )}
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                      }}
                    >
                      Lifetime Spend
                    </div>
                    <div
                      style={{
                        fontSize: '1.15rem',
                        fontWeight: 800,
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {formatNaira(guest.totalLifetimeSpend)}
                    </div>
                  </div>
                </div>

                {/* Stays & Orders Pill Stats */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '8px',
                    background: 'var(--bg-secondary)',
                    padding: '10px',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '14px',
                    fontSize: '0.75rem',
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Total Stays:</span>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                      {guest.totalStaysCount} stays
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>F&amp;B Orders:</span>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                      {guest.totalDiningOrdersCount} meals
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Loyalty Points:</span>
                    <div style={{ fontWeight: 700, color: 'var(--brand-primary)', fontSize: '0.9rem' }}>
                      {guest.loyaltyPoints.toLocaleString()} pts
                    </div>
                  </div>
                </div>

                {/* Preferences & Dietary Tags */}
                <div style={{ marginBottom: '12px' }}>
                  <div
                    style={{
                      fontSize: '0.7rem',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      marginBottom: '4px',
                    }}
                  >
                    Personal Preferences &amp; Notes
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {guest.roomPreferences.map((p, i) => (
                      <span key={i} className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                        🛏️ {p}
                      </span>
                    ))}
                    {guest.dietaryRestrictions.map((d, i) => (
                      <span key={i} className="badge badge-dirty" style={{ fontSize: '0.7rem' }}>
                        📋 {d}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Contact & WhatsApp Bar */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-color)',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <a
                      href={`tel:${guest.phone.replace(/\s+/g, '')}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: 'var(--brand-primary)',
                        fontWeight: 700,
                        textDecoration: 'none',
                      }}
                    >
                      <Phone size={12} /> {guest.phone}
                    </a>
                  </div>

                  <a
                    href={`https://wa.me/${normalizePhoneForWhatsApp(guest.phone)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="badge badge-clean"
                    style={{ fontSize: '0.68rem', textDecoration: 'none' }}
                  >
                    <MessageSquare size={11} /> Message on WhatsApp
                  </a>
                </div>

                {/* Executive Notes */}
                <div
                  style={{
                    marginTop: '10px',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    fontStyle: 'italic',
                    background: '#FAFAFA',
                    padding: '6px 10px',
                    borderRadius: '4px',
                  }}
                >
                  &ldquo;{guest.notes}&rdquo;
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. TAB B: LIVE WEBSITE & FRONT-DESK RESERVATIONS LEDGER */}
      {activeTab === 'RESERVATIONS' && (
        <div className="ent-card" style={{ padding: '24px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '18px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Live Website &amp; Concierge Reservations Follow-Up Ledger
                </h3>
                <span className="badge badge-dirty" style={{ fontSize: '0.7rem' }}>
                  <ShieldAlert size={11} /> Reservation Only Honoured &amp; Kept After Payment
                </span>
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                Connected directly to <code>/api/reservations</code>. Hold guest WhatsApp &amp; phone contacts, log
                follow-up calls/texts, and confirm payment to honour bookings.
              </p>
            </div>
          </div>

          <div className="ent-table-container">
            <table className="ent-table">
              <thead>
                <tr>
                  <th>Booking Ref</th>
                  <th>Guest &amp; Held Contacts</th>
                  <th>Room &amp; Stay Dates</th>
                  <th style={{ textAlign: 'right' }}>Total Amount</th>
                  <th>Payment Honour Status</th>
                  <th>Follow-Up Trigger (Called / Texted)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((resItem) => {
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
                    <tr key={resItem.reservationNumber}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                        {resItem.reservationNumber}
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                          {(resItem.source || 'WEBSITE_BOOKING').replace(/_/g, ' ')}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{resItem.guestName}</div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginTop: '4px',
                            flexWrap: 'wrap',
                          }}
                        >
                          <button
                            onClick={() => handleFollowUpTrigger(resItem, 'CALLED', true)}
                            className="badge badge-brand"
                            style={{ cursor: 'pointer', fontSize: '0.68rem' }}
                          >
                            <PhoneCall size={10} /> {resItem.guestPhone}
                          </button>
                          <button
                            onClick={() => handleFollowUpTrigger(resItem, 'TEXTED', true)}
                            className="badge badge-clean"
                            style={{ cursor: 'pointer', fontSize: '0.68rem' }}
                          >
                            <MessageSquare size={10} /> WhatsApp
                          </button>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700 }}>
                          {resItem.roomType || 'Standard Room'} (Room #{resItem.roomNumber})
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {resItem.checkInDate} → {resItem.checkOutDate} ({resItem.nightsCount} Night
                          {resItem.nightsCount > 1 ? 's' : ''})
                        </div>
                      </td>
                      <td
                        style={{
                          textAlign: 'right',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 800,
                          color: 'var(--text-primary)',
                        }}
                      >
                        {formatNaira(resItem.totalExpectedAmount)}
                      </td>
                      <td>
                        {isPaid ? (
                          <span className="badge badge-clean">
                            <CheckCircle2 size={11} /> Paid • Room Honoured &amp; Kept
                          </span>
                        ) : (
                          <span className="badge badge-dirty">
                            <Clock size={11} /> Awaiting Payment (Not Honoured)
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <button
                            disabled={isBusy}
                            onClick={() => handleFollowUpTrigger(resItem, 'CALLED', false)}
                            style={{
                              padding: '4px 9px',
                              borderRadius: '6px',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              backgroundColor: isCalled ? '#1D4ED8' : 'var(--bg-secondary)',
                              color: isCalled ? '#FFFFFF' : 'var(--text-secondary)',
                              border: `1px solid ${isCalled ? '#1D4ED8' : 'var(--border-color)'}`,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            {isCalled ? <Check size={11} /> : <Phone size={11} />}
                            {isCalled ? 'Called ✓' : 'Called'}
                          </button>
                          <button
                            disabled={isBusy}
                            onClick={() => handleFollowUpTrigger(resItem, 'TEXTED', false)}
                            style={{
                              padding: '4px 9px',
                              borderRadius: '6px',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              backgroundColor: isTexted ? '#059669' : 'var(--bg-secondary)',
                              color: isTexted ? '#FFFFFF' : 'var(--text-secondary)',
                              border: `1px solid ${isTexted ? '#059669' : 'var(--border-color)'}`,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            {isTexted ? <Check size={11} /> : <MessageSquare size={11} />}
                            {isTexted ? 'Texted ✓' : 'Texted'}
                          </button>
                        </div>
                        {resItem.lastFollowUpBy && (
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                            By {resItem.lastFollowUpBy}
                          </div>
                        )}
                      </td>
                      <td>
                        {!isPaid ? (
                          <button
                            disabled={isBusy}
                            onClick={() => handleConfirmPayment(resItem)}
                            className="btn-primary"
                            style={{
                              backgroundColor: '#059669',
                              padding: '5px 10px',
                              fontSize: '0.72rem',
                            }}
                          >
                            <CreditCard size={12} /> Confirm Payment
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#059669' }}>
                            ✓ Guaranteed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. TAB C: CORPORATE DEALS & EVENT PIPELINE */}
      {activeTab === 'CORPORATE_PIPELINE' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="ent-card" style={{ padding: '24px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Active Corporate Accounts &amp; Banquet Pipeline
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  High-ticket revenue: retreats, weddings, corporate galas, and room block bookings.
                </p>
              </div>
              <span className="badge badge-brand">
                Total Pipeline: {formatNaira(dealList.reduce((acc, curr) => acc + curr.dealValue, 0))}
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="ent-table">
                <thead>
                  <tr>
                    <th>Deal / Event Title</th>
                    <th>Corporate Client</th>
                    <th>Stage</th>
                    <th style={{ textAlign: 'right' }}>Total Deal Value</th>
                    <th style={{ textAlign: 'right' }}>Deposit Paid</th>
                    <th style={{ textAlign: 'right' }}>Balance Due</th>
                    <th>Hall / Lawn Reserved</th>
                    <th>Rooms Blocked</th>
                    <th>Account Manager</th>
                  </tr>
                </thead>
                <tbody>
                  {dealList.map((deal) => (
                    <tr key={deal.id}>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {deal.dealTitle}
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                          Date: {deal.eventDate}
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Building2 size={14} color="var(--brand-primary)" />
                          <span>{deal.companyName}</span>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {deal.contactPerson} ({deal.contactPhone})
                        </div>
                      </td>
                      <td>{getStageBadge(deal.stage)}</td>
                      <td
                        style={{
                          textAlign: 'right',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                        }}
                      >
                        {formatNaira(deal.dealValue)}
                      </td>
                      <td
                        style={{
                          textAlign: 'right',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 600,
                          color: 'var(--emerald-primary)',
                        }}
                      >
                        {formatNaira(deal.depositPaid)}
                      </td>
                      <td
                        style={{
                          textAlign: 'right',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          color: deal.balanceDue > 0 ? 'var(--amber-primary)' : 'var(--text-muted)',
                        }}
                      >
                        {formatNaira(deal.balanceDue)}
                      </td>
                      <td>
                        <span className="badge badge-neutral">{deal.hallOrLawn}</span>
                      </td>
                      <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        {deal.roomsBlocked} rms
                      </td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {deal.assignedAccountManager}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* New Guest Modal */}
      {isGuestModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
        >
          <div className="ent-card" style={{ width: '100%', maxWidth: '500px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '14px', color: 'var(--text-primary)' }}>
              Onboard VIP Guest into CRM
            </h3>
            <form onSubmit={handleAddGuest} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '4px',
                    fontWeight: 600,
                  }}
                >
                  Full Name &amp; Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chief (Mrs) Ngozi Okonjo"
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value)}
                  required
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      marginBottom: '4px',
                      fontWeight: 600,
                    }}
                  >
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+234 802 000 0000"
                    value={newGuestPhone}
                    onChange={(e) => setNewGuestPhone(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      marginBottom: '4px',
                      fontWeight: 600,
                    }}
                  >
                    Corporate Affiliation
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dangote Group"
                    value={newGuestCompany}
                    onChange={(e) => setNewGuestCompany(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '4px',
                    fontWeight: 600,
                  }}
                >
                  Room Preferences
                </label>
                <input
                  type="text"
                  value={newGuestPref}
                  onChange={(e) => setNewGuestPref(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsGuestModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save VIP Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Deal Modal */}
      {isDealModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
        >
          <div className="ent-card" style={{ width: '100%', maxWidth: '520px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '14px', color: 'var(--text-primary)' }}>
              Create Corporate Event Deal
            </h3>
            <form onSubmit={handleAddDeal} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '4px',
                    fontWeight: 600,
                  }}
                >
                  Event / Deal Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. MTN Nigeria Executive Strategy Retreat"
                  value={newDealTitle}
                  onChange={(e) => setNewDealTitle(e.target.value)}
                  required
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      marginBottom: '4px',
                      fontWeight: 600,
                    }}
                  >
                    Company Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MTN Nigeria"
                    value={newDealCompany}
                    onChange={(e) => setNewDealCompany(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      marginBottom: '4px',
                      fontWeight: 600,
                    }}
                  >
                    Deal Value (₦)
                  </label>
                  <input
                    type="number"
                    step={500000}
                    value={newDealValue}
                    onChange={(e) => setNewDealValue(Number(e.target.value))}
                    style={{ width: '100%', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '4px',
                    fontWeight: 600,
                  }}
                >
                  Resort Hall / Lawn Venue
                </label>
                <select
                  value={newDealVenue}
                  onChange={(e) => setNewDealVenue(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="Grand Marina Banquet Hall">Grand Marina Banquet Hall</option>
                  <option value="Palms Oceanfront Lawn">Palms Oceanfront Lawn</option>
                  <option value="Executive Boardroom Suite">Executive Boardroom Suite</option>
                  <option value="Full Resort Exclusivity">Full Resort Exclusivity</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsDealModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Corporate Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
