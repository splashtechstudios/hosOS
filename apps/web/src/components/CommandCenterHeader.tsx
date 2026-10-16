'use client';

import React, { useState, useEffect } from 'react';
import { StaffUser } from '@hosos/types';
import { ENTERPRISE_ORG } from '@/lib/mockData';
import { canAccessView, hasPermission } from '@/lib/rbac';
import {
  Building2,
  Search,
  Bell,
  ChevronDown,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Clock,
  LogOut,
  UserPlus,
  Hotel,
  UtensilsCrossed,
  Fuel,
  FileText,
  AlertTriangle,
  X,
  Sparkles,
  Command,
  ArrowRight,
  Database,
  Sliders,
  Check,
  Flame
} from 'lucide-react';

interface CommandCenterHeaderProps {
  currentView: string;
  onNavigate: (viewId: string) => void;
  currentUser: StaffUser;
  onLogout: () => void;
  onOpenAddStaff: () => void;
  onOpenQuickOrder?: () => void;
  onOpenQuickMaintenance?: () => void;
}

export default function CommandCenterHeader({
  currentView,
  onNavigate,
  currentUser,
  onLogout,
  onOpenAddStaff,
  onOpenQuickOrder,
  onOpenQuickMaintenance,
}: CommandCenterHeaderProps) {
  const [selectedProperty, setSelectedProperty] = useState('main');
  const [isPropertyMenuOpen, setIsPropertyMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState(false);
  const [cmdSearch, setCmdSearch] = useState('');
  const [unreadCount, setUnreadCount] = useState(3);

  // Keyboard shortcut listener for ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCmdPaletteOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsCmdPaletteOpen(false);
        setIsNotificationsOpen(false);
        setIsUserMenuOpen(false);
        setIsPropertyMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Notifications List
  const notifications = [
    {
      id: 'notif-1',
      severity: 'CRITICAL',
      title: 'Diesel Fuel Tank Level Critical',
      desc: 'Bulk Storage Tank 1 at 24% capacity (840L remaining). Est. runtime: 18h at current load.',
      time: '12m ago',
      badgeClass: 'badge-danger',
    },
    {
      id: 'notif-2',
      severity: 'AUDIT',
      title: 'Room 204 Order Increment Flagged',
      desc: '+2x Hennessy VSOP (₦180,000) added to Room 204. Price snapshot matched master ledger.',
      time: '34m ago',
      badgeClass: 'badge-warning',
    },
    {
      id: 'notif-3',
      severity: 'CRM',
      title: 'VIP Guest Checked In',
      desc: 'Senator Adeleke Bello (VIP Platinum) checked into Penthouse Suite 304.',
      time: '1h ago',
      badgeClass: 'badge-vip',
    },
    {
      id: 'notif-4',
      severity: 'MAINTENANCE',
      title: 'Room 102 AC Compressor Serviced',
      desc: 'Engr. Tunde Bakare logged maintenance completion with digital inspection sign-off.',
      time: '2h ago',
      badgeClass: 'badge-success',
    },
  ];

  // Command palette searchable items
  const cmdItems = [
    { id: 'dashboard', category: 'Navigation', title: 'Executive Overview & KPIs', icon: Building2 },
    { id: 'room-audit', category: 'Rooms Division', title: 'Room 360° Internal Audit (Live Room Ledger)', icon: ShieldCheck },
    { id: 'front-desk', category: 'Rooms Division', title: 'Front Desk & Tape Chart Grid', icon: Hotel },
    { id: 'crm-guests', category: 'CRM', title: 'VIP Guest Profiles & Folio Records', icon: UserPlus },
    { id: 'crm-deals', category: 'CRM', title: 'Corporate Event Deals Pipeline (Kanban)', icon: FileText },
    { id: 'pos', category: 'Food & Beverage', title: 'Restaurant & Bar Touchscreen POS', icon: UtensilsCrossed },
    { id: 'inventory-tots', category: 'Stores & Stock', title: 'Bar Tot Dipstick & Shrinkage Audit', icon: Sliders },
    { id: 'inventory-bom', category: 'Stores & Stock', title: 'Recipe Bill of Materials (BOM) & Food Costing', icon: FileText },
    { id: 'facilities-generators', category: 'Infrastructure', title: 'Diesel Tank & 500kVA Generator Run Logs', icon: Fuel },
    { id: 'night-audit', category: 'Finance', title: 'Automated Night Audit & Midnight Rollover', icon: FileText },
    { id: 'loss-prevention', category: 'Integrity', title: 'Loss Prevention & Void Watchlist', icon: AlertTriangle },
    { id: 'onboarding-directory', category: 'HR', title: 'Staff Directory (MongoDB Atlas Personnel)', icon: UserPlus },
    { id: 'rbac-matrix', category: 'Security', title: 'Multi-Role RBAC Matrix & Role Simulator', icon: ShieldCheck },
  ];

  const filteredCmdItems = cmdItems.filter(item =>
    canAccessView(currentUser?.role, item.id) &&
    (item.title.toLowerCase().includes(cmdSearch.toLowerCase()) ||
     item.category.toLowerCase().includes(cmdSearch.toLowerCase()))
  );

  const getBreadcrumbTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'Executive & Reporting / Overview';
      case 'night-audit': return 'Executive & Reporting / Night Audit & Rollover';
      case 'loss-prevention': return 'Executive & Reporting / Loss Prevention Watchlist';
      case 'crm-guests': return 'Guest & Corporate CRM / VIP Profiles';
      case 'crm-deals': return 'Guest & Corporate CRM / Corporate Deals Pipeline';
      case 'room-audit': return 'Rooms Division / Room 360° Internal Audit';
      case 'front-desk': return 'Rooms Division / Tape Chart & Room Grid';
      case 'pos': return 'Food & Beverage / Restaurant & Bar POS';
      case 'inventory-tots': return 'Stores & Inventory / Bar Tot Dipstick Audit';
      case 'inventory-bom': return 'Stores & Inventory / Recipe Bill of Materials';
      case 'facilities-generators': return 'Facilities & Energy / Diesel & Generator Logs';
      case 'onboarding-directory': return 'Human Resources / Personnel Directory';
      case 'rbac-matrix': return 'Security & Access / Multi-Role RBAC Matrix';
      default: return currentView;
    }
  };

  return (
    <>
      <header style={{
        height: '56px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: 'var(--shadow-xs)',
      }}>
        
        {/* Left Section: Property Switcher & Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          
          {/* Property Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsPropertyMenuOpen(!isPropertyMenuOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 10px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              <Building2 size={15} color="var(--brand-primary)" />
              <span>
                {selectedProperty === 'main' ? 'Oseika Resort (Main Complex)' : 'Phase 2 Beachfront Annex'}
              </span>
              <ChevronDown size={14} color="var(--text-muted)" />
            </button>

            {isPropertyMenuOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '6px',
                width: '280px',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-dropdown)',
                padding: '6px',
                zIndex: 60,
              }}>
                <div style={{ padding: '6px 10px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Select Operating Property
                </div>
                <div
                  onClick={() => { setSelectedProperty('main'); setIsPropertyMenuOpen(false); }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    backgroundColor: selectedProperty === 'main' ? 'var(--brand-bg)' : 'transparent',
                    color: selectedProperty === 'main' ? 'var(--brand-primary)' : 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                  }}
                >
                  <div>
                    <div>Oseika Luxury Resort & Convention</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>60 Rooms · 3 Convention Halls · 4 Outlets</div>
                  </div>
                  {selectedProperty === 'main' && <Check size={14} color="var(--brand-primary)" />}
                </div>

                <div
                  onClick={() => { setSelectedProperty('beachfront'); setIsPropertyMenuOpen(false); }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    backgroundColor: selectedProperty === 'beachfront' ? 'var(--brand-bg)' : 'transparent',
                    color: selectedProperty === 'beachfront' ? 'var(--brand-primary)' : 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                  }}
                >
                  <div>
                    <div>Oseika Beachfront Annex & Marina</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>24 Luxury Chalets · Waterfront Deck</div>
                  </div>
                  {selectedProperty === 'beachfront' && <Check size={14} color="var(--brand-primary)" />}
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-color)' }}></div>

          {/* Breadcrumb Path */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Oseika HosOS</span>
            <span style={{ color: 'var(--text-muted)' }}>/</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{getBreadcrumbTitle()}</span>
          </div>
        </div>

        {/* Center: Global Command Search Trigger (⌘K) */}
        <div style={{ flex: 1, maxWidth: '420px', margin: '0 24px' }}>
          <button
            onClick={() => setIsCmdPaletteOpen(true)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 12px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)',
              fontSize: '0.8125rem',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search size={14} color="var(--text-muted)" />
              <span>Search rooms, guests, folios, staff...</span>
            </div>
            <kbd style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
              padding: '2px 6px',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              fontSize: '0.7rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)',
            }}>
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Section: Status, Actions, Notifications & Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          {/* Live MongoDB Sync Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--emerald-bg)',
            border: '1px solid var(--emerald-border)',
            padding: '4px 8px',
            borderRadius: 'var(--radius-xs)',
            fontSize: '0.7rem',
            color: 'var(--emerald-text)',
            fontWeight: 600,
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--emerald-primary)',
              boxShadow: '0 0 6px var(--emerald-primary)',
            }}></span>
            <span>Atlas MongoDB Active</span>
          </div>

          {/* Quick Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {hasPermission(currentUser?.role, 'users.onboard') && (
              <button
                onClick={onOpenAddStaff}
                className="btn-primary"
                style={{ padding: '5px 10px', fontSize: '0.75rem' }}
              >
                <UserPlus size={13} />
                <span>Add Staff</span>
              </button>
            )}

            {hasPermission(currentUser?.role, 'orders.create') && (
              <button
                onClick={() => onNavigate('pos')}
                className="btn-secondary"
                style={{ padding: '5px 10px', fontSize: '0.75rem' }}
              >
                <UtensilsCrossed size={13} color="var(--brand-primary)" />
                <span>Quick POS</span>
              </button>
            )}
          </div>

          {/* Notification Bell with Badge */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                if (!isNotificationsOpen) setUnreadCount(0);
              }}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: isNotificationsOpen ? 'var(--brand-bg)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--border-color)',
                position: 'relative',
              }}
            >
              <Bell size={16} color={isNotificationsOpen ? 'var(--brand-primary)' : 'var(--text-secondary)'} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  backgroundColor: 'var(--rose-primary)',
                  color: '#FFFFFF',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #FFFFFF',
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Drawer Popover */}
            {isNotificationsOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                width: '360px',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-dropdown)',
                zIndex: 70,
                overflow: 'hidden',
              }}>
                <div style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: 'var(--bg-subtle)',
                }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    Enterprise Activity & Alerts
                  </div>
                  <span className="badge badge-brand">Live Feed</span>
                </div>

                <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--border-subtle)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className={`badge ${n.badgeClass}`} style={{ fontSize: '0.65rem' }}>
                          {n.severity}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{n.time}</span>
                      </div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {n.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {n.desc}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{
                  padding: '10px 16px',
                  backgroundColor: 'var(--bg-subtle)',
                  borderTop: '1px solid var(--border-color)',
                  textAlign: 'center',
                }}>
                  <button
                    onClick={() => { onNavigate('loss-prevention'); setIsNotificationsOpen(false); }}
                    style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-primary)', background: 'transparent' }}
                  >
                    View All Audit Trails →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar & Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: isUserMenuOpen ? 'var(--bg-secondary)' : 'transparent',
                border: '1px solid transparent',
              }}
            >
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: 'var(--brand-primary)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}>
                {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {currentUser.name}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  {currentUser.role.replace(/_/g, ' ')}
                </div>
              </div>
              <ChevronDown size={14} color="var(--text-muted)" />
            </button>

            {isUserMenuOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '6px',
                width: '240px',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-dropdown)',
                padding: '6px',
                zIndex: 70,
              }}>
                <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>{currentUser.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{currentUser.email}</div>
                  <div style={{ marginTop: '6px', display: 'flex', gap: '4px' }}>
                    <span className="badge badge-purple">{currentUser.role.replace(/_/g, ' ')}</span>
                    <span className="badge badge-neutral">{currentUser.department}</span>
                  </div>
                </div>

                <div style={{ padding: '6px 0' }}>
                  {canAccessView(currentUser?.role, 'onboarding-directory') && (
                    <button
                      onClick={() => { onNavigate('onboarding-directory'); setIsUserMenuOpen(false); }}
                      className="btn-ghost"
                      style={{ width: '100%', justifyContent: 'flex-start' }}
                    >
                      <UserPlus size={14} />
                      <span>Staff Directory & Profile</span>
                    </button>
                  )}
                  {canAccessView(currentUser?.role, 'rbac-matrix') && (
                    <button
                      onClick={() => { onNavigate('rbac-matrix'); setIsUserMenuOpen(false); }}
                      className="btn-ghost"
                      style={{ width: '100%', justifyContent: 'flex-start' }}
                    >
                      <ShieldCheck size={14} />
                      <span>Role & Permissions</span>
                    </button>
                  )}
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '6px' }}>
                  <button
                    onClick={() => { setIsUserMenuOpen(false); onLogout(); }}
                    className="btn-ghost"
                    style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--rose-primary)' }}
                  >
                    <LogOut size={14} color="var(--rose-primary)" />
                    <span>Switch Role / Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Command Palette Dialog (⌘K) */}
      {isCmdPaletteOpen && (
        <div
          className="cmd-palette-backdrop"
          onClick={() => setIsCmdPaletteOpen(false)}
        >
          <div
            className="cmd-palette-box"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 18px',
              borderBottom: '1px solid var(--border-color)',
            }}>
              <Search size={18} color="var(--brand-primary)" />
              <input
                autoFocus
                placeholder="Type a command or jump to room, deal, department..."
                value={cmdSearch}
                onChange={(e) => setCmdSearch(e.target.value)}
                style={{
                  flex: 1,
                  border: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  outline: 'none',
                  boxShadow: 'none',
                  padding: 0,
                }}
              />
              <kbd style={{
                padding: '2px 6px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '4px',
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
              }}>
                ESC
              </kbd>
            </div>

            {/* Quick Actions Shortcuts */}
            <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '8px' }}>
              <div style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                padding: '6px 12px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Quick Navigation & Workspaces
              </div>

              {filteredCmdItems.map(item => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.id}
                    className="cmd-palette-item"
                    onClick={() => {
                      onNavigate(item.id);
                      setIsCmdPaletteOpen(false);
                    }}
                  >
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <IconComponent size={15} color="var(--brand-primary)" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.title}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.category}</div>
                    </div>
                    <ArrowRight size={14} color="var(--text-muted)" />
                  </div>
                );
              })}

              {filteredCmdItems.length === 0 && (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No matching commands found for "{cmdSearch}"
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: '8px 16px',
              backgroundColor: 'var(--bg-subtle)',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
            }}>
              <span>Navigation: Use arrow keys & Enter</span>
              <span>HosOS Enterprise Multi-Role v2.4</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
