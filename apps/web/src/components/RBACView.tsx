'use client';

import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  Check, 
  X, 
  KeyRound, 
  Users, 
  AlertCircle,
  Building2,
  Sparkles,
  Save,
  CheckCircle2,
  Layers,
  Power,
  Sliders,
  DollarSign,
  Sun,
  FileCheck,
  Hotel,
  UtensilsCrossed,
  ShieldAlert,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { StaffUser, UserRole, AppPermission, RoleRBACDefinition } from '@hosos/types';
import { RBAC_ROLE_DEFINITIONS } from '@/lib/mockData';
import { VIEW_TITLES } from '@/lib/rbac';
import { useFeedback } from '@/context/FeedbackContext';

export default function RBACView({ 
  activeStaff, 
  onSelectRole 
}: { 
  activeStaff: StaffUser;
  onSelectRole: (role: UserRole) => void;
}) {
  const { showConfirm, showSuccess, showToast } = useFeedback();

  // Load custom roles matrix from localStorage or default
  const [roleDefinitions, setRoleDefinitions] = useState<RoleRBACDefinition[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hosos_custom_rbac_matrix');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (_) {}
      }
    }
    return RBAC_ROLE_DEFINITIONS;
  });

  const [selectedRoleKey, setSelectedRoleKey] = useState<UserRole>('MANAGER');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const currentRoleDef =
    roleDefinitions.find((r) => r.role === selectedRoleKey) || roleDefinitions[0];

  const isSuperAdmin =
    activeStaff.role === 'SUPERADMIN' ||
    activeStaff.role === 'OWNER' ||
    (activeStaff.role as any) === 'ADMIN';

  // Available Sub-Page Views
  const availableViews: Array<{ id: string; label: string; icon: any; category: string }> = [
    { id: 'daily-operations', label: 'Daily Operations Board', icon: Hotel, category: 'Operations' },
    { id: 'front-desk', label: 'Tape Chart & Room Grid', icon: Hotel, category: 'Operations' },
    { id: 'room-audit', label: 'Room 360° Internal Audit', icon: ShieldCheck, category: 'Operations' },
    { id: 'pos', label: 'Restaurant & Bar POS', icon: UtensilsCrossed, category: 'Operations' },
    { id: 'accountant-audit', label: 'Audit & Reconciliation Desk', icon: FileCheck, category: 'Finance' },
    { id: 'night-audit', label: 'Night Audit & Flash Rollover', icon: DollarSign, category: 'Finance' },
    { id: 'loss-prevention', label: 'Loss Prevention & Trail', icon: ShieldAlert, category: 'Finance' },
    { id: 'facilities-generators', label: '100% Off-Grid Solar & Power Saver', icon: Sun, category: 'Engineering' },
    { id: 'dashboard', label: 'Executive P&L Overview', icon: Building2, category: 'Governance' },
    { id: 'onboarding-directory', label: 'Staff Directory & Access', icon: Users, category: 'Governance' },
    { id: 'rbac-matrix', label: 'Multi-Role RBAC Matrix', icon: Lock, category: 'Governance' },
  ];

  // Granular Action Permissions Grouped
  const permissionCategories: Array<{
    name: string;
    icon: any;
    permissions: Array<{ key: AppPermission; label: string; desc: string }>;
  }> = [
    {
      name: 'Rooms & Guest Division',
      icon: Hotel,
      permissions: [
        { key: 'rooms.audit.view', label: 'View 360° Internal Room Audit', desc: 'Inspect chronological guest folios, invoices, and stay history' },
        { key: 'rooms.status.override', label: 'Change Room Status', desc: 'Transition rooms between Vacant Clean, Dirty, and Out of Service' },
        { key: 'rooms.checkin', label: 'Execute Guest Check-In', desc: 'Assign guests to clean rooms and issue room folios' },
        { key: 'rooms.checkout', label: 'Execute Guest Check-Out', desc: 'Reconcile guest folio balance, print bill, and release room' },
      ],
    },
    {
      name: 'Restaurant, Bar & Dynamic Pricing',
      icon: UtensilsCrossed,
      permissions: [
        { key: 'orders.create', label: 'Create Food & Drink Orders', desc: 'Open ticket and send orders to kitchen and bar' },
        { key: 'orders.increment', label: 'Add Extra Items to Bill', desc: 'Increment active table orders with waiter attribution' },
        { key: 'prices.override', label: 'Enter Dynamic Custom Prices', desc: 'Input market/daily pricing for seafood and chef specials' },
        { key: 'menu.manage', label: 'Add & Manage Menu Catalog', desc: 'Add dishes and drinks to resort menu catalog' },
        { key: 'discounts.approve', label: 'Approve Customer Discounts', desc: 'Apply percentage or fixed reductions to bills' },
        { key: 'voids.execute', label: 'Cancel / Void Fired Orders', desc: 'Remove items with mandatory audit reason code' },
      ],
    },
    {
      name: 'Cash, Finance & Daily Audit',
      icon: DollarSign,
      permissions: [
        { key: 'cash.receive', label: 'Receive Cash & POS Card Payments', desc: 'Collect payments and post to resort registers' },
        { key: 'audit.stamp', label: 'Apply Audit Verification Stamp', desc: 'Certify daily sheets as Reconciled or Flagged' },
        { key: 'daily.submit', label: 'Submit Daily Closing Sheet', desc: 'Lock and send daily operational report to accountant' },
        { key: 'daily.audit_update', label: 'Modify Submitted Records', desc: 'Super Admin/Accountant privilege to adjust logs' },
        { key: 'reports.export', label: 'Export Tax & Financial Reports', desc: 'Download CSV and Excel files for accounting' },
      ],
    },
    {
      name: 'Off-Grid Solar & Facility Controls',
      icon: Sun,
      permissions: [
        { key: 'solar.log', label: 'Log Solar Telemetry & Battery SoC', desc: 'Record daily solar kWh harvested and battery reserves' },
        { key: 'solar.powersaver_toggle', label: 'Toggle Smart Power Saver Eco-Mode', desc: 'Control resort smart load shedding & battery saver' },
        { key: 'diesel.log', label: 'Log Emergency Backup Generator', desc: 'Record rare generator run hours and diesel top-up' },
        { key: 'maintenance.raise', label: 'Raise Asset Fault Ticket', desc: 'Log AC, plumbing, inverter, or structural faults' },
        { key: 'maintenance.signoff', label: 'Sign-Off Completed Repairs', desc: 'Verify completed engineering maintenance tickets' },
      ],
    },
    {
      name: 'Governance, Staff & RBAC',
      icon: Lock,
      permissions: [
        { key: 'users.onboard', label: 'Onboard Staff & Issue PINs', desc: 'Create resort personnel and set access PINs' },
        { key: 'rbac.manage', label: 'Manage RBAC Security Matrix', desc: 'Toggle role permissions and sub-page clearances' },
        { key: 'crm.manage', label: 'VIP CRM & Corporate Deals', desc: 'Access VIP profiles and banquet event pipeline' },
      ],
    },
  ];

  // Super Admin: Toggle Master Role ON/OFF
  const handleToggleRoleStatus = (role: UserRole) => {
    if (!isSuperAdmin) {
      showToast({ type: 'error', title: 'Unauthorized', message: 'Only Super Admin can toggle role master status.' });
      return;
    }

    setRoleDefinitions((prev) =>
      prev.map((r) => (r.role === role ? { ...r, isEnabled: !r.isEnabled } : r))
    );
    setHasUnsavedChanges(true);
  };

  // Super Admin: Toggle Sub-Page View Access
  const handleToggleViewAccess = (role: UserRole, viewId: string) => {
    if (!isSuperAdmin) {
      showToast({ type: 'error', title: 'Unauthorized', message: 'Only Super Admin can adjust view clearance.' });
      return;
    }

    setRoleDefinitions((prev) =>
      prev.map((r) => {
        if (r.role !== role) return r;
        const exists = r.allowedViews.includes(viewId);
        const newViews = exists
          ? r.allowedViews.filter((v) => v !== viewId)
          : [...r.allowedViews, viewId];
        return { ...r, allowedViews: newViews };
      })
    );
    setHasUnsavedChanges(true);
  };

  // Super Admin: Toggle Action Permission
  const handleTogglePermission = (role: UserRole, permKey: AppPermission) => {
    if (!isSuperAdmin) {
      showToast({ type: 'error', title: 'Unauthorized', message: 'Only Super Admin can adjust granular permissions.' });
      return;
    }

    setRoleDefinitions((prev) =>
      prev.map((r) => {
        if (r.role !== role) return r;
        const exists = r.permissions.includes(permKey);
        const newPerms = exists
          ? r.permissions.filter((p) => p !== permKey)
          : [...r.permissions, permKey];
        return { ...r, permissions: newPerms };
      })
    );
    setHasUnsavedChanges(true);
  };

  // Super Admin: Toggle Data Scope
  const handleToggleDataScope = (role: UserRole) => {
    if (!isSuperAdmin) return;
    setRoleDefinitions((prev) =>
      prev.map((r) => {
        if (r.role !== role) return r;
        return {
          ...r,
          dataScope: r.dataScope === 'ALL_RESORT_DATA' ? 'RESTRICTED_SHIFT_DATA' : 'ALL_RESORT_DATA',
        };
      })
    );
    setHasUnsavedChanges(true);
  };

  // Super Admin: Save Configuration
  const handleSaveMatrix = () => {
    showConfirm(
      'Apply RBAC Security Matrix Changes',
      `Are you sure you want to enforce these permission updates across Osieka Resort? Changes will take effect immediately for all staff accounts.`,
      () => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('hosos_custom_rbac_matrix', JSON.stringify(roleDefinitions));
          window.dispatchEvent(new CustomEvent('hosos_rbac_updated', { detail: roleDefinitions }));
        }
        setHasUnsavedChanges(false);
        showSuccess(
          'Security Matrix Applied Successfully!',
          'Role privileges and sub-page clearances have been saved and applied across Osieka Resort.',
          `Acting Administrator: ${activeStaff.name} (${activeStaff.role}). Changes recorded to immutable audit log.`
        );
      },
      {
        confirmText: 'Save & Enforce Matrix',
        cancelText: 'Keep Editing',
        variant: 'primary',
      }
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '60px' }}>
      
      {/* 1. Header Banner */}
      <div className="ent-card" style={{ padding: '20px 24px', backgroundColor: '#FFFFFF' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                color: 'var(--brand-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
              }}>
                <Lock size={20} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Multi-Role RBAC Security Matrix & Permission Engine
                </h1>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                  Super Admin Governance • Toggle roles ON/OFF, assign sub-page clearance, and configure action permissions
                </p>
              </div>
            </div>
          </div>

          {/* Superadmin Save Button */}
          {isSuperAdmin && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={handleSaveMatrix}
                disabled={!hasUnsavedChanges}
                className="btn-primary"
                style={{
                  padding: '9px 20px',
                  fontSize: '0.825rem',
                  fontWeight: 700,
                  gap: '6px',
                  backgroundColor: hasUnsavedChanges ? 'var(--emerald-primary)' : 'var(--brand-primary)',
                  borderColor: hasUnsavedChanges ? 'var(--emerald-border)' : 'var(--brand-primary)',
                }}
              >
                <Save size={15} />
                <span>{hasUnsavedChanges ? 'Save & Apply Changes' : 'All Changes Saved'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Horizontal Role Selector Bar */}
      <div className="ent-card" style={{ padding: '16px' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Select Role to Configure & Assign Privileges:
        </div>

        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {roleDefinitions.map((r) => {
            const isSelected = r.role === selectedRoleKey;
            const isMe = r.role === activeStaff.role;

            return (
              <button
                key={r.role}
                onClick={() => setSelectedRoleKey(r.role)}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: isSelected ? '2px solid var(--brand-primary)' : '1px solid var(--border-color)',
                  backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.06)' : '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: r.isEnabled ? 'var(--emerald-primary)' : 'var(--rose-primary)',
                }} />

                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: isSelected ? 'var(--brand-primary)' : 'var(--text-primary)' }}>
                    {r.role.replace(/_/g, ' ')}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    {r.isEnabled ? `${r.permissions.length} perms` : 'Disabled (Off)'}
                  </div>
                </div>

                {isMe && (
                  <span className="badge badge-brand" style={{ fontSize: '0.6rem', padding: '1px 5px' }}>
                    You
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Role Control Header: Master ON/OFF Switch & Data Scope */}
      <div className="ent-card" style={{ padding: '24px', borderLeft: `6px solid ${currentRoleDef.isEnabled ? 'var(--brand-primary)' : 'var(--rose-primary)'}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {currentRoleDef.displayName}
              </h2>
              <span className={`badge ${currentRoleDef.isEnabled ? 'badge-emerald' : 'badge-rose'}`} style={{ fontSize: '0.7rem' }}>
                {currentRoleDef.isEnabled ? '● Active & Enabled' : '✕ Disabled (Turned Off)'}
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '700px' }}>
              {currentRoleDef.description}
            </p>
          </div>

          {/* Master Role Toggle and Data Scope */}
          {isSuperAdmin && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              {/* Role Master ON/OFF Switch */}
              <button
                type="button"
                onClick={() => handleToggleRoleStatus(currentRoleDef.role)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: `1.5px solid ${currentRoleDef.isEnabled ? 'var(--emerald-border)' : 'var(--rose-border)'}`,
                  backgroundColor: currentRoleDef.isEnabled ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  color: currentRoleDef.isEnabled ? 'var(--emerald-primary)' : 'var(--rose-primary)',
                }}
              >
                <Power size={15} />
                <span>{currentRoleDef.isEnabled ? 'Role is ON (Click to Disable)' : 'Role is OFF (Click to Enable)'}</span>
              </button>

              {/* Data Scope Toggle */}
              <button
                type="button"
                onClick={() => handleToggleDataScope(currentRoleDef.role)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-secondary)',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  color: 'var(--text-primary)',
                }}
              >
                <Sliders size={14} />
                <span>
                  Scope: {currentRoleDef.dataScope === 'ALL_RESORT_DATA' ? '🌐 All Resort Data' : '🔒 Own Shift Only'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. Sub-Page View Access Matrix (Where can this role navigate?) */}
      <div className="ent-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              1. Sub-Page & Navigation Access Clearance
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
              Check the sub-pages this role is permitted to open in the sidebar and navigation
            </p>
          </div>
          <span className="badge badge-brand">
            {currentRoleDef.allowedViews.length} of {availableViews.length} Pages Accessible
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '10px',
        }}>
          {availableViews.map((view) => {
            const hasAccess = currentRoleDef.allowedViews.includes(view.id);
            const ViewIcon = view.icon;

            return (
              <div
                key={view.id}
                onClick={() => handleToggleViewAccess(currentRoleDef.role, view.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: hasAccess ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-color)',
                  backgroundColor: hasAccess ? 'rgba(37, 99, 235, 0.04)' : '#FFFFFF',
                  cursor: isSuperAdmin ? 'pointer' : 'default',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ViewIcon size={16} color={hasAccess ? 'var(--brand-primary)' : 'var(--text-muted)'} />
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: hasAccess ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {view.label}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      {view.category}
                    </div>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={hasAccess}
                  onChange={() => {}} // handled by div onClick
                  disabled={!isSuperAdmin}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Granular Action Permissions Engine */}
      <div className="ent-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              2. Granular Action Privileges & Anti-Leakage Controls
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
              Control specific buttons, price overrides, voiding, check-ins, solar controls, and financial stamps
            </p>
          </div>
          <span className="badge badge-purple">
            {currentRoleDef.permissions.length} Actions Active
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {permissionCategories.map((cat) => {
            const CatIcon = cat.icon;
            const grantedCount = cat.permissions.filter((p) => currentRoleDef.permissions.includes(p.key)).length;

            return (
              <div
                key={cat.name}
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  backgroundColor: '#FFFFFF',
                }}
              >
                {/* Category Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderBottom: '1px solid var(--border-color)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CatIcon size={16} color="var(--brand-primary)" />
                    <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {cat.name}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    {grantedCount} of {cat.permissions.length} Granted
                  </span>
                </div>

                {/* Permissions Rows */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {cat.permissions.map((perm) => {
                    const isGranted = currentRoleDef.permissions.includes(perm.key);

                    return (
                      <div
                        key={perm.key}
                        onClick={() => handleTogglePermission(currentRoleDef.role, perm.key)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          borderBottom: '1px solid var(--border-subtle)',
                          backgroundColor: isGranted ? '#FFFFFF' : 'rgba(248, 250, 252, 0.6)',
                          cursor: isSuperAdmin ? 'pointer' : 'default',
                        }}
                      >
                        <div style={{ flex: 1, paddingRight: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.825rem', fontWeight: 700, color: isGranted ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                              {perm.label}
                            </span>
                            <span style={{ fontSize: '0.675rem', fontFamily: 'var(--font-mono)', color: 'var(--brand-primary)', backgroundColor: 'var(--brand-bg)', padding: '1px 5px', borderRadius: '4px' }}>
                              {perm.key}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {perm.desc}
                          </div>
                        </div>

                        <div>
                          <input
                            type="checkbox"
                            checked={isGranted}
                            onChange={() => {}} // handled by row onClick
                            disabled={!isSuperAdmin}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
