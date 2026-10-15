'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  LayoutDashboard, 
  FileText, 
  ShieldAlert, 
  Briefcase, 
  Users, 
  Hotel, 
  ShieldCheck, 
  UtensilsCrossed, 
  Receipt, 
  Package, 
  GlassWater, 
  Layers, 
  Fuel, 
  Wrench, 
  UserPlus, 
  Lock, 
  LogOut, 
  ChevronDown, 
  ChevronRight,
  Database,
  PlusCircle,
  KeyRound,
  CheckCircle2
} from 'lucide-react';
import { StaffUser } from '@hosos/types';
import { ENTERPRISE_ORG } from '@/lib/mockData';

interface SidebarProps {
  currentView: string;
  onNavigate: (viewId: string) => void;
  activeStaff: StaffUser;
  onLogout: () => void;
  onOpenAddStaffModal: () => void;
  onSeedDatabase: () => void;
}

interface SubMenuItem {
  id: string;
  label: string;
  icon: any;
  highlight?: boolean;
}

interface DepartmentSection {
  key: string;
  name: string;
  icon: any;
  badge?: string;
  submenus: SubMenuItem[];
}

export default function Sidebar({
  currentView,
  onNavigate,
  activeStaff,
  onLogout,
  onOpenAddStaffModal,
  onSeedDatabase,
}: SidebarProps) {
  // Collapsible department sections state
  const [collapsedDepts, setCollapsedDepts] = useState<Record<string, boolean>>({
    executive: false,
    crm: false,
    rooms: false,
    fb: false,
    inventory: false,
    facilities: false,
    hr: false,
  });

  const toggleDept = (deptKey: string) => {
    setCollapsedDepts(prev => ({ ...prev, [deptKey]: !prev[deptKey] }));
  };

  // Structured Department Sections with Action Submenus
  const departmentSections: DepartmentSection[] = [
    {
      key: 'executive',
      name: 'Executive & Reporting',
      icon: LayoutDashboard,
      submenus: [
        { id: 'dashboard', label: 'Executive Overview', icon: LayoutDashboard },
        { id: 'night-audit', label: 'Night Audit & Flash', icon: FileText },
        { id: 'loss-prevention', label: 'Loss Prevention Watchlist', icon: ShieldAlert },
      ],
    },
    {
      key: 'crm',
      name: 'Guest & Corporate CRM',
      icon: Briefcase,
      badge: 'CRM',
      submenus: [
        { id: 'crm-guests', label: 'VIP Guest Profiles', icon: Users },
        { id: 'crm-deals', label: 'Corporate Event Deals', icon: Briefcase },
      ],
    },
    {
      key: 'rooms',
      name: 'Rooms Division',
      icon: Hotel,
      badge: 'Audit Trail',
      submenus: [
        { id: 'room-audit', label: 'Room 360° Internal Audit', icon: ShieldCheck, highlight: true },
        { id: 'front-desk', label: 'Tape Chart & Room Grid', icon: Hotel },
      ],
    },
    {
      key: 'fb',
      name: 'Food & Beverage',
      icon: UtensilsCrossed,
      submenus: [
        { id: 'pos', label: 'Restaurant & Bar POS', icon: UtensilsCrossed },
      ],
    },
    {
      key: 'inventory',
      name: 'Stores & Inventory',
      icon: Package,
      submenus: [
        { id: 'inventory-tots', label: 'Bar Tot Dipstick Audit', icon: GlassWater },
        { id: 'inventory-bom', label: 'Recipe Bill of Materials', icon: Layers },
      ],
    },
    {
      key: 'facilities',
      name: 'Facilities & Energy',
      icon: Fuel,
      submenus: [
        { id: 'facilities-generators', label: 'Diesel & Generator Logs', icon: Fuel },
      ],
    },
    {
      key: 'hr',
      name: 'Human Resources & RBAC',
      icon: Users,
      submenus: [
        { id: 'onboarding-directory', label: 'Staff Directory', icon: Users },
        { id: 'rbac-matrix', label: 'Multi-Role RBAC Matrix', icon: Lock },
      ],
    },
  ];

  return (
    <aside style={{
      width: '280px',
      minWidth: '280px',
      height: '100vh',
      position: 'sticky',
      top: 0,
      backgroundColor: '#FFFFFF',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 40,
      boxShadow: 'var(--shadow-subtle)',
    }}>
      
      {/* 1. Header: Enterprise Brand & Monolith Portal */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--brand-primary)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          boxShadow: '0 2px 4px rgba(37, 99, 235, 0.25)',
        }}>
          <Building2 size={22} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              HosOS Enterprise
            </span>
            <span className="badge badge-brand" style={{ fontSize: '0.6rem', padding: '1px 4px' }}>
              v2.5
            </span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Oseika Resort & Suites • Lekki
          </div>
        </div>
      </div>

      {/* 2. Scrollable Department Menus & Submenus */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '14px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}>
        
        {/* Quick In-App Add Staff Action Button */}
        <button
          onClick={onOpenAddStaffModal}
          className="btn-primary"
          style={{
            width: '100%',
            justifyContent: 'center',
            fontSize: '0.8rem',
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <UserPlus size={15} />
          <span>+ In-App Add Staff Member</span>
        </button>

        {departmentSections.map((dept) => {
          const isCollapsed = collapsedDepts[dept.key];
          const DeptIcon = dept.icon;

          return (
            <div key={dept.key} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {/* Department Header Button */}
              <button
                onClick={() => toggleDept(dept.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'transparent',
                  color: 'var(--text-muted)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <DeptIcon size={13} color="var(--text-muted)" />
                  <span>{dept.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {dept.badge && (
                    <span className="badge badge-brand" style={{ fontSize: '0.55rem', padding: '0 4px' }}>
                      {dept.badge}
                    </span>
                  )}
                  {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                </div>
              </button>

              {/* Department Submenus */}
              {!isCollapsed && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingLeft: '8px' }}>
                  {dept.submenus.map((sub) => {
                    const SubIcon = sub.icon;
                    const isActive = currentView === sub.id;

                    return (
                      <button
                        key={sub.id}
                        onClick={() => onNavigate(sub.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '7px 10px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: isActive ? 'var(--brand-bg)' : 'transparent',
                          color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
                          fontSize: '0.8rem',
                          fontWeight: isActive ? 700 : 500,
                          textAlign: 'left',
                          width: '100%',
                          transition: 'all 0.15s ease',
                          borderLeft: isActive ? '3px solid var(--brand-primary)' : '3px solid transparent',
                        }}
                      >
                        <SubIcon size={14} color={isActive ? 'var(--brand-primary)' : 'var(--text-muted)'} />
                        <span style={{ flex: 1 }}>{sub.label}</span>
                        {sub.highlight && (
                          <span style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--brand-primary)',
                          }}></span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Database & Seeds Section */}
        <div style={{
          marginTop: 'auto',
          paddingTop: '12px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, padding: '0 8px' }}>
            Database & System
          </div>
          <button
            onClick={onSeedDatabase}
            className="btn-secondary"
            style={{
              fontSize: '0.75rem',
              padding: '6px 10px',
              justifyContent: 'flex-start',
              gap: '6px',
              width: '100%',
            }}
          >
            <Database size={13} color="var(--emerald-primary)" />
            <span>Seed 11 Roles to MongoDB</span>
          </button>
        </div>

      </div>

      {/* 3. Bottom: Active Staff Card & Sign Out */}
      <div style={{
        padding: '14px 16px',
        borderTop: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', maxWidth: '180px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'var(--brand-primary)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 700,
          }}>
            {activeStaff.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {activeStaff.name}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              {activeStaff.role.replace(/_/g, ' ')}
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          title="Sign out of HosOS Enterprise"
          style={{
            background: 'transparent',
            color: 'var(--text-muted)',
            padding: '6px',
            borderRadius: '4px',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--rose-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <LogOut size={16} />
        </button>
      </div>

    </aside>
  );
}
