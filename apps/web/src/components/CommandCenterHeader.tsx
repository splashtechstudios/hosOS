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
  Flame,
  Menu
} from 'lucide-react';

interface CommandCenterHeaderProps {
  currentView: string;
  onNavigate: (viewId: string) => void;
  currentUser: StaffUser;
  onLogout: () => void;
  onOpenAddStaff: () => void;
  onOpenQuickOrder?: () => void;
  onOpenQuickMaintenance?: () => void;
  onOpenRecordExpense?: () => void;
  onToggleMobileMenu?: () => void;
}

export default function CommandCenterHeader({
  currentView,
  onNavigate,
  currentUser,
  onLogout,
  onOpenAddStaff,
  onOpenQuickOrder,
  onOpenQuickMaintenance,
  onOpenRecordExpense,
  onToggleMobileMenu,
}: CommandCenterHeaderProps) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState(false);
  const [cmdSearch, setCmdSearch] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Notifications List
  const notifications: Array<{
    id: string;
    severity: string;
    title: string;
    desc: string;
    time: string;
    badgeClass: string;
  }> = [];

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
        padding: '0 16px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: 'var(--shadow-xs)',
        gap: '12px',
      }}>
        
        {/* Left Section: Mobile Menu Trigger + Brand Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {onToggleMobileMenu && (
            <button
              type="button"
              onClick={onToggleMobileMenu}
              aria-label="Open Navigation Drawer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '7px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
              }}
            >
              <Menu size={18} />
            </button>
          )}

          {/* Mobile Brand Identity Logo (Icon Only) */}
          <div className="show-on-mobile-flex" style={{ display: isMobile ? 'flex' : 'none', alignItems: 'center' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-color)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}>
              <img
                src="/osieka-logo.jpg"
                alt="Osieka Resort Logo"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>

        {/* Search Field (Hidden on Mobile) */}
        {!isMobile && (
          <div className="hide-on-mobile" style={{ flex: 1, maxWidth: '460px' }}>
            <button
              onClick={() => setIsCmdPaletteOpen(true)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '7px 14px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-muted)',
                fontSize: '0.8125rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Search size={15} color="var(--text-muted)" />
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
        )}

        {/* Right Section: Quick Expense (Plus Icon on Mobile), Notification & User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '10px', marginLeft: isMobile ? 'auto' : '0' }}>
          
          {/* Quick Expense / Diesel Trigger (Plus icon on mobile) */}
          {onOpenRecordExpense && (
            <button
              type="button"
              onClick={onOpenRecordExpense}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: isMobile ? '7px 9px' : '6px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#FEF2F2',
                border: '1.5px solid #FECACA',
                color: '#DC2626',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
              title="Record operational expense or fuel outlay"
            >
              <span className="show-on-mobile-inline" style={{ display: isMobile ? 'inline-flex' : 'none', alignItems: 'center', justifyContent: 'center' }}>
                <Plus size={17} color="#DC2626" strokeWidth={2.8} />
              </span>
              <span className="hide-on-mobile" style={{ display: isMobile ? 'none' : 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Fuel size={14} color="#DC2626" />
                <span>Record Expense</span>
              </span>
            </button>
          )}

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
                cursor: 'pointer',
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
                  {notifications.length === 0 ? (
                    <div style={{ padding: '36px 20px', textAlign: 'center' }}>
                      <CheckCircle2 size={32} color="var(--emerald-primary)" style={{ margin: '0 auto 8px' }} />
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        All Systems Normal
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        No pending operational alerts or critical warnings.
                      </div>
                    </div>
                  ) : (
                    notifications.map(n => (
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
                    ))
                  )}
                </div>

                <div style={{
                  padding: '10px 16px',
                  backgroundColor: 'var(--bg-subtle)',
                  borderTop: '1px solid var(--border-color)',
                  textAlign: 'center',
                }}>
                  <button
                    onClick={() => { onNavigate('loss-prevention'); setIsNotificationsOpen(false); }}
                    style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-primary)', background: 'transparent', cursor: 'pointer' }}
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
                cursor: 'pointer',
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
                {(currentUser?.name || 'Staff User').split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {currentUser?.name || 'Staff Member'}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  {(currentUser?.role || 'Staff').replace(/_/g, ' ')}
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
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>{currentUser?.name || 'Staff Member'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{currentUser?.email}</div>
                  <div style={{ marginTop: '6px', display: 'flex', gap: '4px' }}>
                    <span className="badge badge-purple">{(currentUser?.role || 'Staff').replace(/_/g, ' ')}</span>
                    <span className="badge badge-neutral">{currentUser?.department || 'Operations'}</span>
                  </div>
                </div>

                <div style={{ paddingTop: '6px' }}>
                  <button
                    onClick={() => { setIsUserMenuOpen(false); onLogout(); }}
                    className="btn-ghost"
                    style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--rose-primary)', cursor: 'pointer' }}
                  >
                    <LogOut size={14} color="var(--rose-primary)" />
                    <span>Logout</span>
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
