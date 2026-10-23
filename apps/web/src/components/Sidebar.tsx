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
  CheckCircle2,
  Search,
  Sliders,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import { StaffUser } from '@hosos/types';
import { ENTERPRISE_ORG } from '@/lib/mockData';
import { canAccessView, hasPermission } from '@/lib/rbac';

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
  tag?: string;
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
  const [searchFilter, setSearchFilter] = useState('');
  const [rbacRevision, setRbacRevision] = useState(0);

  // Dynamically re-evaluate view clearance when Superadmin modifies RBAC matrix
  React.useEffect(() => {
    const handleRbacUpdate = () => {
      setRbacRevision((prev) => prev + 1);
    };
    window.addEventListener('hosos_rbac_updated', handleRbacUpdate);
    window.addEventListener('storage', handleRbacUpdate);
    return () => {
      window.removeEventListener('hosos_rbac_updated', handleRbacUpdate);
      window.removeEventListener('storage', handleRbacUpdate);
    };
  }, []);

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

  // Downsized Department Sections with Action Submenus
  const departmentSections: DepartmentSection[] = [
    {
      key: 'operations',
      name: 'Resort Operations',
      icon: Hotel,
      badge: 'Daily',
      submenus: [
        { id: 'daily-operations', label: 'Daily Operations Board', icon: LayoutDashboard, highlight: true, tag: 'Manager' },
        { id: 'front-desk', label: 'Tape Chart & Room Grid', icon: Hotel, tag: '60 Rooms' },
        { id: 'room-audit', label: 'Room 360° Internal Audit', icon: ShieldCheck, tag: 'Live Folio' },
        { id: 'pos', label: 'Restaurant & Bar POS', icon: UtensilsCrossed, tag: 'Terminal' },
      ],
    },
    {
      key: 'finance',
      name: 'Finance & Audit Desk',
      icon: FileText,
      badge: 'Sage',
      submenus: [
        { id: 'accountant-audit', label: 'Audit & Reconciliation Desk', icon: FileText, highlight: true, tag: 'Sage Core' },
        { id: 'night-audit', label: 'Night Audit & Flash', icon: DollarSign, tag: 'Rollover' },
        { id: 'loss-prevention', label: 'Loss Prevention Watchlist', icon: ShieldAlert, tag: 'Audit' },
      ],
    },
    {
      key: 'executive',
      name: 'Governance & Staff',
      icon: Building2,
      submenus: [
        { id: 'dashboard', label: 'Executive P&L Overview', icon: LayoutDashboard, tag: 'KPIs' },
        { id: 'onboarding-directory', label: 'Staff & Role Directory', icon: Users, tag: 'Atlas' },
        { id: 'rbac-matrix', label: 'Multi-Role RBAC Matrix', icon: Lock, tag: 'Governance' },
      ],
    },
  ];

  return (
    <aside style={{
      width: '260px',
      minWidth: '260px',
      height: '100vh',
      position: 'sticky',
      top: 0,
      backgroundColor: '#FFFFFF',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 45,
      boxShadow: 'var(--shadow-xs)',
    }}>
      
      {/* 1. Header: Enterprise Brand & Monolith Portal */}
      <div style={{
        padding: '14px 16px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        backgroundColor: '#FFFFFF',
      }}>
        <div style={{
          width: '34px',
          height: '34px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--brand-primary)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: '1rem',
          boxShadow: '0 2px 4px rgba(37, 99, 235, 0.25)',
        }}>
          H
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '0.875rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <span>HosOS</span>
            <span className="badge badge-brand" style={{ fontSize: '0.6rem', padding: '1px 5px' }}>
              CRM
            </span>
          </div>
          <div style={{
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            Osieka Luxury Resort
          </div>
        </div>
      </div>

      {/* 2. Quick Search Filter */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-sm)',
          padding: '6px 10px',
          border: '1px solid var(--border-color)',
        }}>
          <Search size={13} color="var(--text-muted)" />
          <input
            placeholder="Filter modules..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              padding: 0,
              fontSize: '0.75rem',
              outline: 'none',
              width: '100%',
              color: 'var(--text-primary)',
            }}
          />
        </div>
      </div>

      {/* 3. Department Sections with Action Submenus */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '10px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}>
        {departmentSections.map(dept => {
          const isCollapsed = collapsedDepts[dept.key] && !searchFilter;
          const DeptIcon = dept.icon;

          // 1. RBAC: Filter submenus by staff role clearance
          const roleAllowedSubmenus = dept.submenus.filter(s => canAccessView(activeStaff?.role, s.id));
          if (roleAllowedSubmenus.length === 0) return null;

          // 2. Filter submenus if search is active
          const visibleSubmenus = searchFilter
            ? roleAllowedSubmenus.filter(s => s.label.toLowerCase().includes(searchFilter.toLowerCase()))
            : roleAllowedSubmenus;

          if (visibleSubmenus.length === 0) return null;

          return (
            <div key={dept.key} style={{ display: 'flex', flexDirection: 'column' }}>
              
              {/* Department Header Accordion */}
              <button
                onClick={() => toggleDept(dept.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'transparent',
                  color: 'var(--text-muted)',
                  fontSize: '0.675rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <DeptIcon size={13} color="var(--text-muted)" />
                  <span>{dept.name}</span>
                </div>
                {isCollapsed ? (
                  <ChevronRight size={12} color="var(--text-muted)" />
                ) : (
                  <ChevronDown size={12} color="var(--text-muted)" />
                )}
              </button>

              {/* Action Submenus */}
              {!isCollapsed && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  marginTop: '2px',
                  paddingLeft: '4px',
                }}>
                  {visibleSubmenus.map(sub => {
                    const isActive = currentView === sub.id;
                    const SubIcon = sub.icon;

                    return (
                      <button
                        key={sub.id}
                        onClick={() => onNavigate(sub.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: isActive ? 'var(--brand-bg)' : 'transparent',
                          color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
                          fontSize: '0.8rem',
                          fontWeight: isActive ? 600 : 500,
                          textAlign: 'left',
                          width: '100%',
                          transition: 'all 0.12s ease',
                          borderLeft: isActive ? '3px solid var(--brand-primary)' : '3px solid transparent',
                        }}
                      >
                        <SubIcon size={14} color={isActive ? 'var(--brand-primary)' : 'var(--text-muted)'} />
                        <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {sub.label}
                        </span>
                        {sub.tag && (
                          <span style={{
                            fontSize: '0.625rem',
                            padding: '1px 5px',
                            borderRadius: '3px',
                            backgroundColor: isActive ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-secondary)',
                            color: isActive ? 'var(--brand-primary)' : 'var(--text-muted)',
                            fontWeight: 600,
                          }}>
                            {sub.tag}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 4. Footer: Staff User Card & Quick Add Staff */}
      <div style={{
        padding: '12px 14px',
        borderTop: '1px solid var(--border-color)',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        {/* In-App Add Staff Button (Admin/Executive Only) */}
        {hasPermission(activeStaff?.role, 'users.onboard') && (
          <button
            onClick={onOpenAddStaffModal}
            className="btn-primary"
            style={{ width: '100%', padding: '7px 10px', fontSize: '0.75rem', justifyContent: 'center' }}
          >
            <UserPlus size={14} />
            <span>+ In-App Add Staff</span>
          </button>
        )}

        {/* User Card */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 8px',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              backgroundColor: 'var(--brand-primary)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
              fontWeight: 700,
              flexShrink: 0,
            }}>
              {activeStaff.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div style={{ minWidth: 0, lineHeight: 1.2 }}>
              <div style={{
                fontSize: '0.75rem',
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
            title="Switch User / Logout"
            style={{
              padding: '4px',
              borderRadius: '4px',
              backgroundColor: 'transparent',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LogOut size={13} color="var(--rose-primary)" />
          </button>
        </div>
      </div>
    </aside>
  );
}
