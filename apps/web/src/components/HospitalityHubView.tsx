'use client';

import React, { useState, useEffect } from 'react';
import { 
  Hotel, 
  UtensilsCrossed, 
  Wine,
  Building2,
  ChevronRight,
  Users,
  CheckCircle2,
  Clock,
  Wrench,
  TrendingUp,
  Star,
  Sparkles,
  Layers,
  Plus
} from 'lucide-react';
import { StaffUser, Room } from '@hosos/types';
import { hasPermission } from '@/lib/rbac';

interface HospitalityHubViewProps {
  activeStaff: StaffUser;
  rooms: Room[];
  onNavigate: (view: 'rooms' | 'kitchen' | 'bar' | 'halls', group?: string) => void;
}

export default function HospitalityHubView({ activeStaff, rooms, onNavigate }: HospitalityHubViewProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDesktop, setIsDesktop] = useState(true);

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

  const occupiedCount = rooms.filter(r => r.status === 'OCCUPIED').length;
  const vacantCleanCount = rooms.filter(r => r.status === 'VACANT_CLEAN').length;
  const vacantDirtyCount = rooms.filter(r => r.status === 'VACANT_DIRTY').length;
  const maintenanceCount = rooms.filter(r => r.status === 'MAINTENANCE' || r.status === 'OUT_OF_ORDER').length;
  const totalRooms = rooms.length;
  const occupancyPct = totalRooms > 0 ? Math.round((occupiedCount / totalRooms) * 100) : 0;

  const canViewRooms = hasPermission(activeStaff.role, 'rooms.audit.view');
  const canViewPOS = hasPermission(activeStaff.role, 'orders.create');
  const isSuperAdmin = activeStaff.role === 'SUPERADMIN' || activeStaff.role === 'OWNER' || (activeStaff.role as any) === 'ADMIN';
  const canManageServices = isSuperAdmin || hasPermission(activeStaff.role, 'services.manage', activeStaff.id);

  const formatTime = (d: Date) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const formatDate = (d: Date) => d.toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

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
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        borderRadius: '20px',
        padding: '36px 42px',
        color: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(37,99,235,0.3) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '10%', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(147,51,234,0.2) 0%, transparent 70%)', borderRadius: '50%' }} />

        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(37,99,235,0.5)', fontSize: '1.4rem', fontWeight: 900 }}>
                H
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Osieka Luxury Resort</div>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#FFFFFF', margin: 0, letterSpacing: '-0.03em' }}>Hospitality Command Hub</h1>
              </div>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem', margin: 0, maxWidth: '520px' }}>
              Welcome back, <strong style={{ color: '#93C5FD' }}>{activeStaff.name}</strong>. Access departmental boards across Rooms, Kitchen, Drinks, Halls and Events.
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1 }}>
              {formatTime(currentTime)}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '6px' }}>{formatDate(currentTime)}</div>
            <div style={{ marginTop: '10px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <span style={{ background: 'rgba(37,99,235,0.25)', border: '1px solid rgba(59,130,246,0.4)', color: '#93C5FD', fontSize: '0.72rem', fontWeight: 700, padding: '4px 10px', borderRadius: '20px' }}>
                {activeStaff.role.replace(/_/g, ' ')}
              </span>
              <span style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)', color: '#6EE7B7', fontSize: '0.72rem', fontWeight: 700, padding: '4px 10px', borderRadius: '20px' }}>
                Active Session
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '28px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {[
            { label: 'Total Rooms', value: totalRooms, color: '#93C5FD', icon: Hotel },
            { label: 'Occupied Now', value: `${occupiedCount} (${occupancyPct}%)`, color: '#6EE7B7', icon: Users },
            { label: 'Ready to Check-In', value: vacantCleanCount, color: '#FDE68A', icon: CheckCircle2 },
            { label: 'Need Attention', value: vacantDirtyCount + maintenanceCount, color: '#FCA5A5', icon: Star },
          ].map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Icon size={14} color={m.color} />
                  <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</span>
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: m.color, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>{m.value}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4 Primary Department Cards: Rooms, Kitchen, Drinks, Halls and Events */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isDesktop ? 'repeat(4, 1fr)' : 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
      }}>
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
                background: hub.locked ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' : hub.gradient,
                borderRadius: '20px',
                padding: '28px 24px',
                cursor: hub.locked ? 'not-allowed' : 'pointer',
                position: 'relative',
                overflow: 'hidden',
                border: `1px solid ${hub.locked ? 'rgba(255,255,255,0.06)' : hub.borderColor}`,
                boxShadow: isHovered && !hub.locked ? `0 20px 60px ${hub.shadowColor}, 0 4px 16px rgba(0,0,0,0.3)` : '0 4px 16px rgba(0,0,0,0.15)',
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
              <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '140px', height: '140px', background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

              {hub.locked && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', zIndex: 5 }}>
                  Permission Required
                </div>
              )}

              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={26} color="#FFFFFF" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FFFFFF', margin: 0, letterSpacing: '-0.02em' }}>{hub.label}</h2>
                    <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.65)', margin: 0, marginTop: '2px' }}>{hub.sublabel}</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
                  {hub.stats.map((stat) => (
                    <div key={stat.label} style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '10px 12px' }}>
                      <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.55)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>{stat.label}</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 900, color: stat.color, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>{stat.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: isHovered && !hub.locked ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '10px 14px', transition: 'all 0.2s ease' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <TrendingUp size={13} color="rgba(255,255,255,0.7)" />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>{hub.action}</span>
                  </div>
                  <ChevronRight size={16} color="rgba(255,255,255,0.7)" style={{ transform: isHovered && !hub.locked ? 'translateX(4px)' : 'translateX(0)', transition: 'transform 0.2s ease' }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ancillary Services & Custom Groups Banner */}
      <div className="ent-card" style={{ padding: '20px 24px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} color="var(--brand-primary)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Laundry & Ancillary Services
              </h3>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              Dry cleaning, laundry wash & press, VIP airport chauffeur transfers, spa sessions, and custom department services.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigate('halls', 'Laundry & Ancillary Services')}
              className="btn-secondary"
              style={{ fontSize: '0.78rem', padding: '8px 14px' }}
            >
              <span>View Laundry & Ancillary Services</span>
            </button>

            {canManageServices && (
              <button
                onClick={() => onNavigate('halls', 'ALL')}
                className="btn-primary"
                style={{ fontSize: '0.78rem', padding: '8px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={14} />
                <span>+ Create Service / Group</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
        Click any department card to enter its operational board · Permissions strictly governed by Multi-Role RBAC Matrix
      </div>
    </div>
  );
}
