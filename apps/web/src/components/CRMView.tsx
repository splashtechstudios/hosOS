'use client';

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  UserCheck, 
  Search, 
  Plus, 
  Crown, 
  MessageSquare, 
  Phone, 
  Mail, 
  Building2, 
  Calendar, 
  DollarSign, 
  Filter, 
  CheckCircle2,
  Clock,
  Sparkles,
  Tag
} from 'lucide-react';
import { GuestProfile, CorporateDeal, StaffUser, CRMDealStage } from '@hosos/types';
import { INITIAL_GUEST_PROFILES, INITIAL_CORPORATE_DEALS } from '@/lib/mockData';

export default function CRMView({ 
  activeStaff, 
  defaultTab = 'GUESTS' 
}: { 
  activeStaff: StaffUser; 
  defaultTab?: 'GUESTS' | 'CORPORATE_PIPELINE';
}) {
  const [activeTab, setActiveTab] = useState<'GUESTS' | 'CORPORATE_PIPELINE'>(defaultTab);

  React.useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  const [guestList, setGuestList] = useState<GuestProfile[]>(INITIAL_GUEST_PROFILES);
  const [dealList, setDealList] = useState<CorporateDeal[]>(INITIAL_CORPORATE_DEALS);
  const [searchQuery, setSearchQuery] = useState('');

  // New Guest Modal State
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestPhone, setNewGuestPhone] = useState('');
  const [newGuestCompany, setNewGuestCompany] = useState('');
  const [newGuestPref, setNewGuestPref] = useState('High Floor, Sea View');

  // New Deal Modal State
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [newDealTitle, setNewDealTitle] = useState('');
  const [newDealCompany, setNewDealCompany] = useState('');
  const [newDealValue, setNewDealValue] = useState(12000000);
  const [newDealVenue, setNewDealVenue] = useState('Grand Marina Banquet Hall');

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getLoyaltyBadge = (tier: string) => {
    switch (tier) {
      case 'PLATINUM_VIP':
        return <span className="badge badge-purple"><Crown size={12} /> Platinum VIP</span>;
      case 'GOLD':
        return <span className="badge badge-dirty"><Crown size={12} /> Gold VIP</span>;
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

  const filteredGuests = guestList.filter(g => {
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Briefcase size={24} color="var(--brand-primary)" />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Enterprise Guest & Corporate Accounts CRM
              </h2>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Unified customer directory, VIP guest preferences, corporate clients, and high-value event deals pipeline.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', backgroundColor: 'var(--bg-secondary)', padding: '3px', borderRadius: 'var(--radius-sm)' }}>
              <button
                onClick={() => setActiveTab('GUESTS')}
                style={{
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  borderRadius: '4px',
                  backgroundColor: activeTab === 'GUESTS' ? '#FFFFFF' : 'transparent',
                  color: activeTab === 'GUESTS' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  boxShadow: activeTab === 'GUESTS' ? 'var(--shadow-subtle)' : 'none',
                }}
              >
                VIP Guest Directory ({guestList.length})
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
                  boxShadow: activeTab === 'CORPORATE_PIPELINE' ? 'var(--shadow-subtle)' : 'none',
                }}
              >
                Corporate Deals & Event Pipeline ({dealList.length})
              </button>
            </div>

            {activeTab === 'GUESTS' ? (
              <button onClick={() => setIsGuestModalOpen(true)} className="btn-primary">
                <Plus size={15} />
                <span>+ Onboard VIP Guest Profile</span>
              </button>
            ) : (
              <button onClick={() => setIsDealModalOpen(true)} className="btn-primary">
                <Plus size={15} />
                <span>+ Create Corporate Event Deal</span>
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
              placeholder="Search guests by name, phone (+234), or corporate affiliation (e.g. Chevron, Zenith)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', border: 'none', padding: '6px 0', fontSize: '0.875rem' }}
            />
          </div>

          {/* Guest Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '16px',
          }}>
            {filteredGuests.map((guest) => (
              <div key={guest.id} className="ent-card-interactive" style={{ padding: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {guest.fullName}
                      </h3>
                      {getLoyaltyBadge(guest.loyaltyTier)}
                    </div>
                    {guest.corporateCompanyName && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--brand-primary)', fontWeight: 600, marginTop: '2px' }}>
                        <Building2 size={13} />
                        <span>{guest.corporateCompanyName}</span>
                      </div>
                    )}
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Lifetime Spend
                    </div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                      {formatNaira(guest.totalLifetimeSpend)}
                    </div>
                  </div>
                </div>

                {/* Stays & Orders Pill Stats */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '8px',
                  background: 'var(--bg-secondary)',
                  padding: '10px',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '14px',
                  fontSize: '0.75rem',
                }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Total Stays:</span>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{guest.totalStaysCount} stays</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>F&B Orders:</span>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{guest.totalDiningOrdersCount} meals</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Loyalty Points:</span>
                    <div style={{ fontWeight: 700, color: 'var(--brand-primary)', fontSize: '0.9rem' }}>{guest.loyaltyPoints.toLocaleString()} pts</div>
                  </div>
                </div>

                {/* Preferences & Dietary Tags */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                    Personal Preferences & Restrictions
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {guest.roomPreferences.map((p, i) => (
                      <span key={i} className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                        🛏️ {p}
                      </span>
                    ))}
                    {guest.dietaryRestrictions.map((d, i) => (
                      <span key={i} className="badge badge-dirty" style={{ fontSize: '0.7rem' }}>
                        🍽️ {d}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Contact & WhatsApp Bar */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border-color)',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={12} color="var(--brand-primary)" /> {guest.phone}
                    </span>
                  </div>

                  {guest.whatsappOptIn && (
                    <span className="badge badge-clean" style={{ fontSize: '0.65rem' }}>
                      <MessageSquare size={11} /> WhatsApp Active
                    </span>
                  )}
                </div>

                {/* Executive Notes */}
                <div style={{ marginTop: '10px', fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', background: '#FAFAFA', padding: '6px 10px', borderRadius: '4px' }}>
                  "{guest.notes}"
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. TAB B: CORPORATE DEALS & EVENT PIPELINE */}
      {activeTab === 'CORPORATE_PIPELINE' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="ent-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Active Corporate Accounts & Banquet Pipeline
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
                      <td>
                        {getStageBadge(deal.stage)}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {formatNaira(deal.dealValue)}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--emerald-primary)' }}>
                        {formatNaira(deal.depositPaid)}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: deal.balanceDue > 0 ? 'var(--amber-primary)' : 'var(--text-muted)' }}>
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
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px',
        }}>
          <div className="ent-card" style={{ width: '100%', maxWidth: '500px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '14px', color: 'var(--text-primary)' }}>
              Onboard VIP Guest into CRM
            </h3>
            <form onSubmit={handleAddGuest} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                  Full Name & Title
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
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
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
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
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
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
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
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px',
        }}>
          <div className="ent-card" style={{ width: '100%', maxWidth: '520px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '14px', color: 'var(--text-primary)' }}>
              Create Corporate Event Deal
            </h3>
            <form onSubmit={handleAddDeal} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
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
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
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
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
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
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
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
