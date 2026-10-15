'use client';

import React from 'react';
import { StaffUser } from '@hosos/types';
import { 
  Building2, 
  ShieldCheck, 
  Clock, 
  Wifi, 
  UserCheck, 
  Hotel, 
  UtensilsCrossed, 
  Package, 
  Fuel, 
  FileText,
  Search
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  staffList: StaffUser[];
  activeStaff: StaffUser;
  onStaffChange: (staff: StaffUser) => void;
}

export default function Navbar({
  currentTab,
  onTabChange,
  staffList,
  activeStaff,
  onStaffChange,
}: NavbarProps) {
  const tabs = [
    { id: 'room-audit', label: 'Room 360° Audit', icon: ShieldCheck, badge: 'Crucial' },
    { id: 'front-desk', label: 'Front Desk & Rooms', icon: Hotel },
    { id: 'pos', label: 'Restaurant & Bar POS', icon: UtensilsCrossed },
    { id: 'inventory', label: 'Stores & Bar Tots', icon: Package },
    { id: 'facilities', label: 'Diesel & Generators', icon: Fuel },
    { id: 'night-audit', label: 'Night Audit & Flash', icon: FileText },
  ];

  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      backgroundColor: 'rgba(6, 10, 19, 0.92)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '0 24px',
    }}>
      {/* Top Banner: Brand + Status + Staff Switcher */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 0',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #E0A96D 0%, #9B6A32 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(224, 169, 109, 0.3)',
          }}>
            <Building2 size={24} color="#060A13" strokeWidth={2.4} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.25rem', letterSpacing: '-0.02em', color: '#FFF' }}>
                HosOS <span style={{ color: 'var(--gold-primary)', fontWeight: 400 }}>| Oseika Resort</span>
              </h1>
              <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>Enterprise PMS</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Hospitality Operating System • Hotel, Dining, Lounge & Events
            </p>
          </div>
        </div>

        {/* Center: System Status & Nigeria Time */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '0.75rem',
          }}>
            <span className="pulse-dot pulse-dot-green"></span>
            <span style={{ color: 'var(--emerald-primary)', fontWeight: 600 }}>SYSTEM LIVE</span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ color: 'var(--text-secondary)' }}>LAN Mesh Sync Active</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-secondary)',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
          }}>
            <Clock size={14} color="var(--gold-primary)" />
            <span>2026-10-15 18:45 WAT</span>
          </div>
        </div>

        {/* Right: Active Staff Profile (Who is logging actions) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-md)',
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #38BDF8 0%, #1E40AF 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.8rem',
              color: '#FFF',
            }}>
              {activeStaff.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {activeStaff.name}
                </span>
                <span className="badge badge-purple" style={{ fontSize: '0.6rem', padding: '2px 6px' }}>
                  {activeStaff.role.replace('_', ' ')}
                </span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                PIN: {activeStaff.pinCodeHash} • Shift #SHT-01
              </div>
            </div>

            {/* Quick Switch Staff */}
            <select
              value={activeStaff.id}
              onChange={(e) => {
                const selected = staffList.find(s => s.id === e.target.value);
                if (selected) onStaffChange(selected);
              }}
              style={{
                marginLeft: '8px',
                padding: '4px 8px',
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
              title="Switch active user to test action attribution"
            >
              {staffList.map(s => (
                <option key={s.id} value={s.id}>
                  Switch to: {s.name} ({s.role.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bottom Tabs: Navigation */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 0',
        overflowX: 'auto',
      }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: isActive ? 'var(--gold-bg)' : 'transparent',
                color: isActive ? 'var(--gold-primary)' : 'var(--text-secondary)',
                borderBottom: isActive ? '2px solid var(--gold-primary)' : '2px solid transparent',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.875rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span style={{
                  fontSize: '0.65rem',
                  background: 'var(--gold-primary)',
                  color: '#060A13',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  fontWeight: 800,
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
