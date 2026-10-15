'use client';

import React from 'react';
import { StaffUser, UserRole } from '@hosos/types';
import { ENTERPRISE_ORG, RBAC_ROLE_DEFINITIONS } from '@/lib/mockData';
import { 
  Building2, 
  ShieldCheck, 
  Clock, 
  Hotel, 
  UtensilsCrossed, 
  Package, 
  Fuel, 
  FileText,
  Users,
  Briefcase,
  KeyRound,
  LayoutDashboard,
  ChevronDown,
  Lock
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
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'crm', label: 'Guest & Corporate CRM', icon: Briefcase, badge: 'Enterprise' },
    { id: 'room-audit', label: 'Room 360° Internal Audit', icon: ShieldCheck, badge: 'Audit Trail' },
    { id: 'onboarding', label: 'Staff Onboarding & HR', icon: Users },
    { id: 'rbac', label: 'Multi-Role RBAC Matrix', icon: Lock },
    { id: 'front-desk', label: 'Front Desk & Tape Chart', icon: Hotel },
    { id: 'pos', label: 'Restaurant & Bar POS', icon: UtensilsCrossed },
    { id: 'inventory', label: 'Stores & Bar Tots', icon: Package },
    { id: 'facilities', label: 'Energy & Diesel Logs', icon: Fuel },
    { id: 'night-audit', label: 'Night Audit & Flash', icon: FileText },
  ];

  const currentRoleDef = RBAC_ROLE_DEFINITIONS.find(r => r.role === activeStaff.role);

  return (
    <header style={{
      borderBottom: '1px solid var(--border-color)',
      backgroundColor: 'var(--bg-surface)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: 'var(--shadow-subtle)',
    }}>
      {/* Top Banner: Enterprise Identity + Live Shift Status + Active Staff RBAC Controller */}
      <div style={{
        padding: '12px 24px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        {/* Organisation Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--brand-primary)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(37, 99, 235, 0.25)',
          }}>
            <Building2 size={22} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                HosOS Enterprise
              </span>
              <span className="badge badge-brand" style={{ fontSize: '0.65rem' }}>
                v2.4 Enterprise CRM & PMS
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {ENTERPRISE_ORG.name} • {ENTERPRISE_ORG.registrationNumber}
            </div>
          </div>
        </div>

        {/* Center: System Status & Time */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--emerald-bg)',
            border: '1px solid var(--emerald-border)',
            padding: '4px 10px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            color: 'var(--emerald-primary)',
            fontWeight: 600,
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--emerald-primary)' }}></span>
            <span>LAGOS HUB ACTIVE</span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>FIRS VAT 7.5% Verified</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-mono)',
          }}>
            <Clock size={14} color="var(--brand-primary)" />
            <span>2026-10-15 19:25 WAT</span>
          </div>
        </div>

        {/* Right: Active Role & Staff Identity Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
          }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: 'var(--brand-primary)',
              color: '#FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}>
              {activeStaff.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {activeStaff.name}
                </span>
                <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>
                  {activeStaff.role.replace('_', ' ')}
                </span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                PIN: {activeStaff.pinCodeHash} • Department: {activeStaff.department}
              </div>
            </div>

            {/* Quick Staff Switcher for RBAC Testing */}
            <select
              value={activeStaff.id}
              onChange={(e) => {
                const s = staffList.find(st => st.id === e.target.value);
                if (s) onStaffChange(s);
              }}
              style={{
                fontSize: '0.75rem',
                padding: '4px 8px',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
              title="Switch user to test multi-role RBAC permissions"
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

      {/* Enterprise Navigation Tabs Bar */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        overflowX: 'auto',
        gap: '4px',
        background: '#FFFFFF',
      }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 14px',
                fontSize: '0.825rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
                backgroundColor: 'transparent',
                borderBottom: isActive ? '2.5px solid var(--brand-primary)' : '2.5px solid transparent',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={15} color={isActive ? 'var(--brand-primary)' : 'var(--text-muted)'} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span style={{
                  fontSize: '0.625rem',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  fontWeight: 700,
                  backgroundColor: isActive ? 'var(--brand-bg)' : '#F1F5F9',
                  color: isActive ? 'var(--brand-primary)' : '#64748B',
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
