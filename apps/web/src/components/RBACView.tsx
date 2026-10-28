'use client';

import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  X, 
  Users, 
  Building2,
  Save,
  Layers,
  Power,
  Sliders,
  DollarSign,
  Sun,
  FileCheck,
  Hotel,
  UtensilsCrossed,
  ShieldAlert,
  UserCog,
  Star,
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  Settings,
  Eye,
  EyeOff,
  Database,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { StaffUser, UserRole, AppPermission, RoleRBACDefinition } from '@hosos/types';
import { RBAC_ROLE_DEFINITIONS, INITIAL_STAFF } from '@/lib/mockData';
import { VIEW_TITLES } from '@/lib/rbac';
import { useFeedback } from '@/context/FeedbackContext';

// =========================================
// Per-User Custom Permission Overrides
// These are stored in localStorage under 'hosos_user_permission_overrides'
// Structure: { [userId]: { grantedPermissions: AppPermission[], deniedPermissions: AppPermission[], allowedViews: string[] } }
// =========================================
function getUserOverrides(): Record<string, { grantedPermissions: AppPermission[]; deniedPermissions: AppPermission[]; allowedViews: string[]; elevatedRole?: UserRole }> {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem('hosos_user_permission_overrides') || '{}'); } catch { return {}; }
}
function saveUserOverrides(overrides: Record<string, { grantedPermissions: AppPermission[]; deniedPermissions: AppPermission[]; allowedViews: string[]; elevatedRole?: UserRole }>) {
  localStorage.setItem('hosos_user_permission_overrides', JSON.stringify(overrides));
}

export const getUserPermissionOverride = (userId: string) => getUserOverrides()[userId];

type ConfigTab = 'ROLES' | 'USERS';

export default function RBACView({ 
  activeStaff, 
  onSelectRole 
}: { 
  activeStaff: StaffUser;
  onSelectRole: (role: UserRole) => void;
}) {
  const { showConfirm, showSuccess, showToast } = useFeedback();

  // == Role-level matrix state ==
  const [roleDefinitions, setRoleDefinitions] = useState<RoleRBACDefinition[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hosos_custom_rbac_matrix');
      if (saved) { try { return JSON.parse(saved); } catch (_) {} }
    }
    return RBAC_ROLE_DEFINITIONS;
  });

  const [selectedRoleKey, setSelectedRoleKey] = useState<UserRole>('MANAGER');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // == User-level overrides state ==
  const [staffList, setStaffList] = useState<StaffUser[]>(INITIAL_STAFF);
  const [userOverrides, setUserOverrides] = useState<Record<string, { grantedPermissions: AppPermission[]; deniedPermissions: AppPermission[]; allowedViews: string[]; elevatedRole?: UserRole }>>({});
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [hasUnsavedUserChanges, setHasUnsavedUserChanges] = useState(false);

  // == Tab ==
  const [configTab, setConfigTab] = useState<ConfigTab>('ROLES');

  // == Master Database Purge (Superadmin Only) ==
  const CLEAR_PAGE_MODULES = [
    { id: 'ROOMS_FOLIOS', label: 'Hospitality Command Hub & Front Desk', desc: 'Guest folios, active check-ins, room stay history (resets rooms to clean)' },
    { id: 'ORDERS_POS', label: 'Kitchen & Bar POS Outlets', desc: 'Food tickets, bar tabs, kitchen orders, drink dispense logs' },
    { id: 'HALLS_EVENTS', label: 'Halls, Banqueting & Event Venues', desc: 'Event hall reservations, active event folios, booking histories' },
    { id: 'SERVICES_ANCILLARY', label: 'Laundry & Ancillary Services', desc: 'Ancillary services catalog and guest laundry orders' },
    { id: 'DAILY_SHEETS', label: 'Daily Operational Sheets', desc: 'Manager daily shift closing sheets and cash drawer reconciliations' },
    { id: 'MAINTENANCE_TICKETS', label: 'Facilities & Engineering Tickets', desc: 'Asset fault tickets, repair history, and maintenance logs' },
    { id: 'NIGHT_AUDITS', label: 'Night Audit & Flash Rollover Engine', desc: 'End-of-day night audit logs and historical flash records' },
    { id: 'AUDIT_TRAILS', label: '360° Internal Room Audit Trails', desc: 'Immutable internal room audit histories and telemetry records' },
  ];

  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [purgeConfirmationCode, setPurgeConfirmationCode] = useState('');
  const [purgeResetType, setPurgeResetType] = useState<'OPERATIONAL_TRANSACTIONS' | 'FULL_FACTORY_RESET'>('OPERATIONAL_TRANSACTIONS');
  const [selectedPurgeModules, setSelectedPurgeModules] = useState<string[]>(CLEAR_PAGE_MODULES.map(m => m.id));
  const [isPurging, setIsPurging] = useState(false);
  const [purgeSummary, setPurgeSummary] = useState<any | null>(null);

  const togglePurgeModule = (id: string) => {
    setSelectedPurgeModules(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleSelectAllModules = () => {
    if (selectedPurgeModules.length === CLEAR_PAGE_MODULES.length) {
      setSelectedPurgeModules([]);
    } else {
      setSelectedPurgeModules(CLEAR_PAGE_MODULES.map(m => m.id));
    }
  };

  const handleExecutePurge = async () => {
    if (purgeConfirmationCode !== 'CLEAR_ALL_DATA' && purgeConfirmationCode !== 'CLEAR_DATA') {
      showToast({ type: 'error', title: 'Confirmation Mismatch', message: 'You must type CLEAR_ALL_DATA or CLEAR_DATA in capital letters to authorize.' });
      return;
    }
    if (selectedPurgeModules.length === 0) {
      showToast({ type: 'error', title: 'No Modules Selected', message: 'Please toggle at least one page module to clear.' });
      return;
    }
    setIsPurging(true);
    try {
      const res = await fetch('/api/admin/clear-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmationCode: purgeConfirmationCode,
          requestedBy: activeStaff.name,
          resetType: purgeResetType,
          targets: selectedPurgeModules,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPurgeSummary(data.summary);
        showToast({
          type: 'success',
          title: 'Database Reset Executed',
          message: 'Selected page modules and data points have been completely purged from MongoDB Atlas.',
        });
      } else {
        showToast({ type: 'error', title: 'Purge Failed', message: data.error || 'Could not clear database.' });
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Network Error', message: err.message });
    } finally {
      setIsPurging(false);
    }
  };

  useEffect(() => {
    setUserOverrides(getUserOverrides());
    // Load live staff from API
    fetch('/api/staff')
      .then(r => r.json())
      .then(d => { if (d.success && d.staff?.length > 0) setStaffList(d.staff); })
      .catch(() => {});
  }, []);

  const currentRoleDef = roleDefinitions.find((r) => r.role === selectedRoleKey) || roleDefinitions[0];
  const isSuperAdmin = activeStaff.role === 'SUPERADMIN' || activeStaff.role === 'OWNER' || (activeStaff.role as any) === 'ADMIN';

  const selectedUser = staffList.find(s => s.id === selectedUserId);
  const selectedUserOverride = selectedUserId ? (userOverrides[selectedUserId] || { grantedPermissions: [], deniedPermissions: [], allowedViews: [] }) : null;

  // Available Sub-Page Views (Streamlined: Hub replaces daily ops & pos)
  const availableViews: Array<{ id: string; label: string; icon: any; category: string }> = [
    { id: 'front-desk', label: 'Hospitality Command Hub', icon: Hotel, category: 'Operations' },
    { id: 'room-audit', label: 'Room 360° Internal Audit', icon: ShieldCheck, category: 'Operations' },
    { id: 'accountant-audit', label: 'Audit & Reconciliation Desk', icon: FileCheck, category: 'Finance' },
    { id: 'night-audit', label: 'Night Audit & Flash Rollover', icon: DollarSign, category: 'Finance' },
    { id: 'loss-prevention', label: 'Loss Prevention & Trail', icon: ShieldAlert, category: 'Finance' },
    { id: 'facilities-generators', label: 'Off-Grid Solar & Power Saver', icon: Sun, category: 'Engineering' },
    { id: 'dashboard', label: 'Executive P&L Overview', icon: Building2, category: 'Governance' },
    { id: 'onboarding-directory', label: 'Staff Directory & Access', icon: Users, category: 'Governance' },
    { id: 'rbac-matrix', label: 'Multi-Role RBAC Matrix', icon: Lock, category: 'Governance' },
  ];

  // Granular Action Permissions
  const permissionCategories: Array<{ name: string; icon: any; permissions: Array<{ key: AppPermission; label: string; desc: string }> }> = [
    {
      name: 'Rooms & Guest Division',
      icon: Hotel,
      permissions: [
        { key: 'rooms.audit.view', label: 'View 360° Room Audit', desc: 'Inspect guest folios, invoices, stay history' },
        { key: 'rooms.status.override', label: 'Change Room Status', desc: 'Transition rooms: Vacant Clean, Dirty, Out of Service' },
        { key: 'rooms.checkin', label: 'Execute Guest Check-In', desc: 'Assign guests to clean rooms and issue folios' },
        { key: 'rooms.checkout', label: 'Execute Guest Check-Out', desc: 'Reconcile folio balance, print bill, release room' },
        { key: 'rooms.customize', label: 'Customize Room Names, Tags & Prices', desc: 'Edit custom display names, color tags, and adjust rack rate prices' },
        { key: 'rooms.create', label: 'Create New Rooms & Suites', desc: 'Add new rooms into resort inventory with number, floor, rack rate, colors, and amenities' },
        { key: 'rooms.manage_amenities', label: 'Manage Room Amenities', desc: 'Add and configure standard & bespoke room amenities (WiFi, Jacuzzi, Smart TV, etc.)' },
      ],
    },
    {
      name: 'Halls, Banqueting & Event Venues',
      icon: Building2,
      permissions: [
        { key: 'halls.book', label: 'Book & Reserve Halls & Venues', desc: 'Create event reservations with client details, 12-hour time slots, and split payments' },
        { key: 'halls.checkin', label: 'Start Event (Check-In)', desc: 'Transition reserved hall to Event In Progress and open event folio' },
        { key: 'halls.checkout', label: 'Conclude Event & Settle Bill (Check-Out)', desc: 'Reconcile bill, collect balance, and release venue to Cleaning & Turnaround' },
        { key: 'halls.manage', label: 'Create & Configure Halls & Venues', desc: 'Add new venues, set hourly/daily rates, duration, capacity, and amenities' },
      ],
    },
    {
      name: 'Restaurant, Bar & Dynamic Pricing',
      icon: UtensilsCrossed,
      permissions: [
        { key: 'orders.create', label: 'Create Food & Drink Orders', desc: 'Open ticket and send orders to kitchen and bar' },
        { key: 'orders.increment', label: 'Add Extra Items to Bill', desc: 'Increment active table orders with attribution' },
        { key: 'prices.override', label: 'Enter Dynamic Custom Prices', desc: 'Input market/daily pricing for seafood and chef specials' },
        { key: 'menu.manage', label: 'Add & Manage Menu Catalog', desc: 'Add dishes and drinks to resort menu catalog' },
        { key: 'services.manage', label: 'Manage Ancillary Services', desc: 'Create and configure laundry and ancillary offerings' },
        { key: 'discounts.approve', label: 'Approve Customer Discounts', desc: 'Apply percentage or fixed reductions to bills' },
        { key: 'voids.execute', label: 'Cancel / Void Fired Orders', desc: 'Remove items with mandatory audit reason code' },
      ],
    },
    {
      name: 'Cash, Finance & Daily Audit',
      icon: DollarSign,
      permissions: [
        { key: 'cash.receive', label: 'Receive Cash & POS Payments', desc: 'Collect payments and post to resort registers' },
        { key: 'payment.split', label: 'Execute Split Multi-Channel Settlements', desc: 'Settle transactions across two combined payment methods (POS, Transfer, Cash)' },
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
        { key: 'solar.powersaver_toggle', label: 'Toggle Smart Power Saver Mode', desc: 'Control resort smart load shedding & battery saver' },
        { key: 'diesel.log', label: 'Log Emergency Backup Generator', desc: 'Record generator run hours and diesel top-up' },
        { key: 'maintenance.raise', label: 'Raise Asset Fault Ticket', desc: 'Log AC, plumbing, inverter, or structural faults' },
        { key: 'maintenance.signoff', label: 'Sign-Off Completed Repairs', desc: 'Verify completed engineering maintenance tickets' },
      ],
    },
    {
      name: 'Governance, Staff & RBAC',
      icon: Lock,
      permissions: [
        { key: 'users.onboard', label: 'Onboard Staff & Issue PINs', desc: 'Create resort personnel and set access PINs' },
        { key: 'users.manage', label: 'Edit & Update Staff Details', desc: 'Modify names, roles, departments, salaries, and PIN codes' },
        { key: 'users.delete', label: 'Purge & Delete Staff Users', desc: 'Permanently remove staff members from Osieka Resort systems' },
        { key: 'rbac.manage', label: 'Manage RBAC Security Matrix', desc: 'Toggle role permissions and sub-page clearances' },
        { key: 'crm.manage', label: 'VIP CRM & Corporate Deals', desc: 'Access VIP profiles and banquet event pipeline' },
        { key: 'sidebar.toggle', label: 'Toggle Navigation Sidebar Access', desc: 'Permission to show, hide or configure the navigation sidebar' },
        { key: 'database.clear', label: 'Superadmin Master Database Purge', desc: 'Wipe all operational transactions, folios, orders, and reset database' },
      ],
    },
  ];

  // === Role Matrix Handlers ===
  const handleToggleRoleStatus = (role: UserRole) => {
    if (!isSuperAdmin) { showToast({ type: 'error', title: 'Unauthorized', message: 'Only Super Admin can toggle role master status.' }); return; }
    setRoleDefinitions(prev => prev.map(r => r.role === role ? { ...r, isEnabled: !r.isEnabled } : r));
    setHasUnsavedChanges(true);
  };

  const handleToggleViewAccess = (role: UserRole, viewId: string) => {
    if (!isSuperAdmin) { showToast({ type: 'error', title: 'Unauthorized', message: 'Only Super Admin can adjust view clearance.' }); return; }
    setRoleDefinitions(prev => prev.map(r => {
      if (r.role !== role) return r;
      const exists = r.allowedViews.includes(viewId);
      return { ...r, allowedViews: exists ? r.allowedViews.filter(v => v !== viewId) : [...r.allowedViews, viewId] };
    }));
    setHasUnsavedChanges(true);
  };

  const handleTogglePermission = (role: UserRole, permKey: AppPermission) => {
    if (!isSuperAdmin) { showToast({ type: 'error', title: 'Unauthorized', message: 'Only Super Admin can adjust granular permissions.' }); return; }
    setRoleDefinitions(prev => prev.map(r => {
      if (r.role !== role) return r;
      const exists = r.permissions.includes(permKey);
      return { ...r, permissions: exists ? r.permissions.filter(p => p !== permKey) : [...r.permissions, permKey] };
    }));
    setHasUnsavedChanges(true);
  };

  const handleToggleDataScope = (role: UserRole) => {
    if (!isSuperAdmin) return;
    setRoleDefinitions(prev => prev.map(r => r.role !== role ? r : { ...r, dataScope: r.dataScope === 'ALL_RESORT_DATA' ? 'RESTRICTED_SHIFT_DATA' : 'ALL_RESORT_DATA' }));
    setHasUnsavedChanges(true);
  };

  const handleToggleRoleSidebar = (role: UserRole) => {
    if (!isSuperAdmin) {
      showToast({ type: 'error', title: 'Unauthorized', message: 'Only Super Admin can toggle role sidebar status.' });
      return;
    }
    setRoleDefinitions(prev => prev.map(r => {
      if (r.role !== role) return r;
      const currentVal = r.hasSidebar ?? (r.role === 'SUPERADMIN' || r.role === 'OWNER' || r.role === 'ACCOUNTANT' || r.role === 'GENERAL_MANAGER');
      return { ...r, hasSidebar: !currentVal };
    }));
    setHasUnsavedChanges(true);
  };

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
        showSuccess('Security Matrix Applied!', 'Role privileges and sub-page clearances saved and applied across the resort.', `Administrator: ${activeStaff.name} (${activeStaff.role}). Changes recorded to immutable audit log.`);
      },
      { confirmText: 'Save & Enforce Matrix', cancelText: 'Keep Editing', variant: 'primary' }
    );
  };

  // === User-Level Override Handlers ===
  const toggleUserGrantedPermission = (userId: string, permKey: AppPermission) => {
    setUserOverrides(prev => {
      const current = prev[userId] || { grantedPermissions: [], deniedPermissions: [], allowedViews: [] };
      const isGranted = current.grantedPermissions.includes(permKey);
      return {
        ...prev,
        [userId]: {
          ...current,
          grantedPermissions: isGranted ? current.grantedPermissions.filter(p => p !== permKey) : [...current.grantedPermissions, permKey],
          // Remove from denied if granting
          deniedPermissions: current.deniedPermissions.filter(p => p !== permKey),
        }
      };
    });
    setHasUnsavedUserChanges(true);
  };

  const toggleUserDeniedPermission = (userId: string, permKey: AppPermission) => {
    setUserOverrides(prev => {
      const current = prev[userId] || { grantedPermissions: [], deniedPermissions: [], allowedViews: [] };
      const isDenied = current.deniedPermissions.includes(permKey);
      return {
        ...prev,
        [userId]: {
          ...current,
          deniedPermissions: isDenied ? current.deniedPermissions.filter(p => p !== permKey) : [...current.deniedPermissions, permKey],
          // Remove from granted if denying
          grantedPermissions: current.grantedPermissions.filter(p => p !== permKey),
        }
      };
    });
    setHasUnsavedUserChanges(true);
  };

  const toggleUserViewAccess = (userId: string, viewId: string) => {
    setUserOverrides(prev => {
      const current = prev[userId] || { grantedPermissions: [], deniedPermissions: [], allowedViews: [] };
      const has = current.allowedViews.includes(viewId);
      return { ...prev, [userId]: { ...current, allowedViews: has ? current.allowedViews.filter(v => v !== viewId) : [...current.allowedViews, viewId] } };
    });
    setHasUnsavedUserChanges(true);
  };

  const setUserElevatedRole = (userId: string, role: UserRole | '') => {
    setUserOverrides(prev => {
      const current = prev[userId] || { grantedPermissions: [], deniedPermissions: [], allowedViews: [] };
      return { ...prev, [userId]: { ...current, elevatedRole: role || undefined } };
    });
    setHasUnsavedUserChanges(true);
  };

  const handleSaveUserOverrides = () => {
    showConfirm(
      'Apply Per-User Permission Overrides',
      `Save custom permission grants and denials for individual staff? These override their role defaults for specific actions and views.`,
      () => {
        saveUserOverrides(userOverrides);
        window.dispatchEvent(new CustomEvent('hosos_rbac_updated', { detail: { userOverrides } }));
        setHasUnsavedUserChanges(false);
        showSuccess('User Overrides Saved!', 'Custom permissions applied to individual staff accounts.', `Administrator: ${activeStaff.name}. Changes effective immediately.`);
      },
      { confirmText: 'Save User Overrides', cancelText: 'Keep Editing', variant: 'primary' }
    );
  };

  const filteredStaff = staffList.filter(s =>
    !userSearch || s.name.toLowerCase().includes(userSearch.toLowerCase()) || s.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '60px' }}>

      {/* Header Banner */}
      <div className="ent-card" style={{ padding: '20px 24px', backgroundColor: '#FFFFFF' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={20} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Multi-Role RBAC Security Matrix & Permission Engine</h1>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Super Admin Governance · Toggle roles, assign sub-page clearance, configure action permissions, and grant per-user elevated access
              </p>
            </div>
          </div>

          {isSuperAdmin && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {configTab === 'ROLES' && (
                <button type="button" onClick={handleSaveMatrix} disabled={!hasUnsavedChanges} className="btn-primary" style={{ padding: '9px 20px', fontSize: '0.825rem', fontWeight: 700, backgroundColor: hasUnsavedChanges ? 'var(--emerald-primary)' : 'var(--brand-primary)' }}>
                  <Save size={15} /> <span>{hasUnsavedChanges ? 'Save & Apply Changes' : 'All Changes Saved'}</span>
                </button>
              )}
              {configTab === 'USERS' && (
                <button type="button" onClick={handleSaveUserOverrides} disabled={!hasUnsavedUserChanges} className="btn-primary" style={{ padding: '9px 20px', fontSize: '0.825rem', fontWeight: 700, backgroundColor: hasUnsavedUserChanges ? 'var(--emerald-primary)' : 'var(--brand-primary)' }}>
                  <Save size={15} /> <span>{hasUnsavedUserChanges ? 'Save User Overrides' : 'Overrides Saved'}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', gap: '4px', marginTop: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '0' }}>
          {([
            { id: 'ROLES', label: 'Role-Level Matrix', icon: Layers, desc: 'Configure permissions per role' },
            { id: 'USERS', label: 'Per-User Overrides', icon: UserCog, desc: 'Elevated or restricted individual access' },
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setConfigTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px 8px 0 0', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                backgroundColor: configTab === tab.id ? 'var(--brand-primary)' : 'transparent',
                color: configTab === tab.id ? '#FFFFFF' : 'var(--text-secondary)',
                border: configTab === tab.id ? '1px solid var(--brand-primary)' : '1px solid transparent',
                borderBottom: configTab === tab.id ? 'none' : 'none',
                marginBottom: '-1px',
                transition: 'all 0.15s ease',
              }}
            >
              <tab.icon size={14} />
              <span>{tab.label}</span>
              {tab.id === 'USERS' && (
                <span style={{ background: 'rgba(255,255,255,0.2)', fontSize: '0.7rem', padding: '1px 6px', borderRadius: '20px' }}>
                  {Object.keys(userOverrides).length} custom
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ===== ROLES TAB ===== */}
      {configTab === 'ROLES' && (
        <>
          {/* Role Selector Bar */}
          <div className="ent-card" style={{ padding: '16px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Select Role to Configure & Assign Privileges:
            </div>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {roleDefinitions.map(r => {
                const isSelected = r.role === selectedRoleKey;
                const isMe = r.role === activeStaff.role;
                return (
                  <button key={r.role} onClick={() => setSelectedRoleKey(r.role)} style={{ padding: '10px 14px', borderRadius: '8px', border: isSelected ? '2px solid var(--brand-primary)' : '1px solid var(--border-color)', backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.06)' : '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, transition: 'all 0.15s ease' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: r.isEnabled ? 'var(--emerald-primary)' : 'var(--rose-primary)', display: 'block', flexShrink: 0 }} />
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: isSelected ? 'var(--brand-primary)' : 'var(--text-primary)' }}>{r.role.replace(/_/g, ' ')}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{r.isEnabled ? `${r.permissions.length} perms` : 'Disabled'}</div>
                    </div>
                    {isMe && <span className="badge badge-brand" style={{ fontSize: '0.6rem', padding: '1px 5px' }}>You</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Role Control Header */}
          <div className="ent-card" style={{ padding: '24px', borderLeft: `6px solid ${currentRoleDef.isEnabled ? 'var(--brand-primary)' : 'var(--rose-primary)'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{currentRoleDef.displayName}</h2>
                  <span className={`badge ${currentRoleDef.isEnabled ? 'badge-emerald' : 'badge-rose'}`} style={{ fontSize: '0.7rem' }}>
                    {currentRoleDef.isEnabled ? '● Active & Enabled' : '✕ Disabled'}
                  </span>
                  <span className={`badge ${currentRoleDef.hasSidebar ? 'badge-brand' : 'badge-neutral'}`} style={{ fontSize: '0.7rem' }}>
                    {currentRoleDef.hasSidebar ? 'Sidebar: Enabled (Multi-Menu)' : 'Sidebar: Disabled (Hub Only)'}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '700px' }}>{currentRoleDef.description}</p>
              </div>

              {isSuperAdmin && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <button type="button" onClick={() => handleToggleRoleStatus(currentRoleDef.role)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: `1.5px solid ${currentRoleDef.isEnabled ? 'var(--emerald-border)' : 'var(--rose-border)'}`, backgroundColor: currentRoleDef.isEnabled ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', color: currentRoleDef.isEnabled ? 'var(--emerald-primary)' : 'var(--rose-primary)' }}>
                    <Power size={15} />
                    <span>{currentRoleDef.isEnabled ? 'Role is ON (Click to Disable)' : 'Role is OFF (Click to Enable)'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleRoleSidebar(currentRoleDef.role)}
                    title={currentRoleDef.hasSidebar ? 'Click to disable sidebar for this role (locks user to single Command Hub flow)' : 'Click to enable sidebar for this role (grants multi-menu navigation)'}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: `1.5px solid ${currentRoleDef.hasSidebar ? 'var(--brand-primary)' : 'var(--border-color)'}`,
                      backgroundColor: currentRoleDef.hasSidebar ? 'rgba(37, 99, 235, 0.08)' : 'var(--bg-secondary)',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      color: currentRoleDef.hasSidebar ? 'var(--brand-primary)' : 'var(--text-muted)'
                    }}
                  >
                    {currentRoleDef.hasSidebar ? <Eye size={14} /> : <EyeOff size={14} />}
                    <span>Sidebar: {currentRoleDef.hasSidebar ? 'Enabled' : 'Disabled (Hub Only)'}</span>
                  </button>
                  <button type="button" onClick={() => handleToggleDataScope(currentRoleDef.role)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                    <Sliders size={14} />
                    <span>Scope: {currentRoleDef.dataScope === 'ALL_RESORT_DATA' ? '🌐 All Resort Data' : '🔒 Own Shift Only'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sub-Page View Access */}
          <div className="ent-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>1. Sub-Page & Navigation Access Clearance</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Check which sub-pages this role can open in the sidebar and navigation</p>
              </div>
              <span className="badge badge-brand">{currentRoleDef.allowedViews.length} of {availableViews.length} Pages Accessible</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
              {availableViews.map(view => {
                const hasAccess = currentRoleDef.allowedViews.includes(view.id);
                const ViewIcon = view.icon;
                return (
                  <div key={view.id} onClick={() => handleToggleViewAccess(currentRoleDef.role, view.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '8px', border: hasAccess ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-color)', backgroundColor: hasAccess ? 'rgba(37, 99, 235, 0.04)' : '#FFFFFF', cursor: isSuperAdmin ? 'pointer' : 'default', transition: 'all 0.15s ease' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <ViewIcon size={16} color={hasAccess ? 'var(--brand-primary)' : 'var(--text-muted)'} />
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: hasAccess ? 'var(--text-primary)' : 'var(--text-muted)' }}>{view.label}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{view.category}</div>
                      </div>
                    </div>
                    <input type="checkbox" checked={hasAccess} onChange={() => {}} disabled={!isSuperAdmin} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Granular Permissions */}
          <div className="ent-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>2. Granular Action Privileges & Anti-Leakage Controls</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Control specific buttons, price overrides, voiding, check-ins, solar controls, and financial stamps</p>
              </div>
              <span className="badge badge-purple">{currentRoleDef.permissions.length} Actions Active</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {permissionCategories.map(cat => {
                const CatIcon = cat.icon;
                const grantedCount = cat.permissions.filter(p => currentRoleDef.permissions.includes(p.key)).length;
                return (
                  <div key={cat.name} style={{ border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CatIcon size={16} color="var(--brand-primary)" />
                        <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>{cat.name}</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>{grantedCount} of {cat.permissions.length} Granted</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {cat.permissions.map(perm => {
                        const isGranted = currentRoleDef.permissions.includes(perm.key);
                        return (
                          <div key={perm.key} onClick={() => handleTogglePermission(currentRoleDef.role, perm.key)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', backgroundColor: isGranted ? '#FFFFFF' : 'rgba(248, 250, 252, 0.6)', cursor: isSuperAdmin ? 'pointer' : 'default' }}>
                            <div style={{ flex: 1, paddingRight: '16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '0.825rem', fontWeight: 700, color: isGranted ? 'var(--text-primary)' : 'var(--text-muted)' }}>{perm.label}</span>
                                <span style={{ fontSize: '0.675rem', fontFamily: 'var(--font-mono)', color: 'var(--brand-primary)', backgroundColor: 'var(--brand-bg)', padding: '1px 5px', borderRadius: '4px' }}>{perm.key}</span>
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{perm.desc}</div>
                            </div>
                            <input type="checkbox" checked={isGranted} onChange={() => {}} disabled={!isSuperAdmin} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ===== USERS TAB ===== */}
      {configTab === 'USERS' && (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px', alignItems: 'start' }}>
          {/* Staff List Panel */}
          <div className="ent-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 14px' }}>
              <UserCog size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              Staff Members
            </h3>
            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <Search size={13} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '9px' }} />
              <input type="text" placeholder="Search staff..." value={userSearch} onChange={e => setUserSearch(e.target.value)} className="ent-input" style={{ width: '100%', paddingLeft: '28px', fontSize: '0.78rem' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '60vh', overflowY: 'auto' }}>
              {filteredStaff.map(staff => {
                const hasOverrides = Boolean(userOverrides[staff.id]);
                const isSelected = selectedUserId === staff.id;
                return (
                  <button key={staff.id} onClick={() => setSelectedUserId(staff.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '8px', border: isSelected ? '2px solid var(--brand-primary)' : '1px solid var(--border-color)', backgroundColor: isSelected ? 'rgba(37,99,235,0.05)' : '#FFFFFF', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s ease' }}>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: isSelected ? 'var(--brand-primary)' : 'var(--text-primary)' }}>{staff.name}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>{staff.role.replace(/_/g, ' ')}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      {hasOverrides && <span style={{ fontSize: '0.62rem', fontWeight: 700, background: 'rgba(234,88,12,0.1)', color: '#EA580C', padding: '2px 6px', borderRadius: '20px', border: '1px solid rgba(234,88,12,0.2)' }}>Custom</span>}
                      {userOverrides[staff.id]?.elevatedRole && (
                        <span style={{ fontSize: '0.62rem', fontWeight: 700, background: 'rgba(147,51,234,0.1)', color: '#9333EA', padding: '2px 6px', borderRadius: '20px' }}>
                          <Star size={9} style={{ marginRight: '2px' }} />
                          Elevated
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* User Permission Editor Panel */}
          <div>
            {!selectedUser ? (
              <div className="ent-card" style={{ padding: '60px 32px', textAlign: 'center' }}>
                <UserCog size={40} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
                <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>Select a Staff Member</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                  Choose a staff member from the list to configure custom elevated permissions or individual access overrides.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* User Header */}
                <div className="ent-card" style={{ padding: '20px 24px', borderLeft: '6px solid var(--brand-primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                      <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{selectedUser.name}</h2>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                        Base Role: <strong>{selectedUser.role.replace(/_/g, ' ')}</strong> · Custom overrides are layered on top of the role defaults
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                          <Star size={11} style={{ marginRight: '4px' }} />ELEVATED ROLE GRANT
                        </label>
                        <select
                          value={selectedUserOverride?.elevatedRole || ''}
                          onChange={e => setUserElevatedRole(selectedUser.id, e.target.value as UserRole | '')}
                          style={{ fontSize: '0.8rem', minWidth: '180px' }}
                        >
                          <option value="">— No Elevation (Use Base Role) —</option>
                          {roleDefinitions.map(r => (
                            <option key={r.role} value={r.role}>{r.role.replace(/_/g, ' ')}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {selectedUserOverride?.elevatedRole && (
                    <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(147,51,234,0.06)', border: '1px solid rgba(147,51,234,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Star size={14} color="#9333EA" />
                      <span style={{ fontSize: '0.8rem', color: '#7C3AED', fontWeight: 700 }}>
                        This user has been elevated to <strong>{selectedUserOverride.elevatedRole.replace(/_/g, ' ')}</strong> level. Their effective permissions come from this elevated role, plus any additional grants below.
                      </span>
                    </div>
                  )}
                </div>

                {/* View Access Overrides */}
                <div className="ent-card" style={{ padding: '20px' }}>
                  <div style={{ marginBottom: '14px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Additional View Access Grants</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Grant this user access to specific pages beyond their role default</p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px' }}>
                    {availableViews.map(view => {
                      const isGranted = selectedUserOverride?.allowedViews.includes(view.id);
                      const ViewIcon = view.icon;
                      return (
                        <div key={view.id} onClick={() => toggleUserViewAccess(selectedUser.id, view.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '8px', border: isGranted ? '1.5px solid #059669' : '1px solid var(--border-color)', backgroundColor: isGranted ? '#F0FDF4' : '#FFFFFF', cursor: isSuperAdmin ? 'pointer' : 'default', transition: 'all 0.15s ease' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ViewIcon size={14} color={isGranted ? '#059669' : 'var(--text-muted)'} />
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: isGranted ? '#065F46' : 'var(--text-muted)' }}>{view.label}</span>
                          </div>
                          <input type="checkbox" checked={!!isGranted} onChange={() => {}} disabled={!isSuperAdmin} style={{ width: '15px', height: '15px', cursor: 'pointer' }} />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Permission Grants & Denials */}
                <div className="ent-card" style={{ padding: '20px' }}>
                  <div style={{ marginBottom: '14px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Per-Action Permission Overrides</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                      <span style={{ color: '#059669', fontWeight: 700 }}>✓ Grant</span> = Allow this action even if the role does not have it. 
                      &nbsp;<span style={{ color: '#E11D48', fontWeight: 700 }}>✕ Deny</span> = Block this action even if the role normally has it.
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {permissionCategories.map(cat => {
                      const CatIcon = cat.icon;
                      return (
                        <div key={cat.name} style={{ border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                            <CatIcon size={14} color="var(--brand-primary)" />
                            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>{cat.name}</span>
                          </div>
                          <div>
                            {cat.permissions.map(perm => {
                              const isGranted = selectedUserOverride?.grantedPermissions.includes(perm.key);
                              const isDenied = selectedUserOverride?.deniedPermissions.includes(perm.key);
                              return (
                                <div key={perm.key} style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)', gap: '12px', backgroundColor: isGranted ? '#F0FDF4' : isDenied ? '#FFF1F2' : 'transparent' }}>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isGranted ? '#065F46' : isDenied ? '#9F1239' : 'var(--text-primary)' }}>{perm.label}</span>
                                      <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--brand-primary)', backgroundColor: 'var(--brand-bg)', padding: '1px 5px', borderRadius: '4px' }}>{perm.key}</span>
                                    </div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '1px' }}>{perm.desc}</div>
                                  </div>
                                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                                    {/* Grant button */}
                                    <button
                                      onClick={() => toggleUserGrantedPermission(selectedUser.id, perm.key)}
                                      style={{
                                        display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, cursor: isSuperAdmin ? 'pointer' : 'not-allowed',
                                        background: isGranted ? '#059669' : 'transparent',
                                        color: isGranted ? '#FFFFFF' : '#059669',
                                        border: `1px solid ${isGranted ? '#059669' : '#BBF7D0'}`,
                                        transition: 'all 0.15s ease',
                                      }}
                                      disabled={!isSuperAdmin}
                                    >
                                      <Eye size={11} /> Grant
                                    </button>
                                    {/* Deny button */}
                                    <button
                                      onClick={() => toggleUserDeniedPermission(selectedUser.id, perm.key)}
                                      style={{
                                        display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, cursor: isSuperAdmin ? 'pointer' : 'not-allowed',
                                        background: isDenied ? '#E11D48' : 'transparent',
                                        color: isDenied ? '#FFFFFF' : '#E11D48',
                                        border: `1px solid ${isDenied ? '#E11D48' : '#FECACA'}`,
                                        transition: 'all 0.15s ease',
                                      }}
                                      disabled={!isSuperAdmin}
                                    >
                                      <EyeOff size={11} /> Deny
                                    </button>
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
            )}
          </div>
        </div>
      )}

      {/* ===== SUPERADMIN DANGER ZONE: MASTER DATABASE PURGE ===== */}
      {isSuperAdmin && (
        <div className="ent-card" style={{ padding: '24px', border: '1.5px solid #FDA4AF', backgroundColor: '#FFF1F2', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertTriangle size={22} color="#E11D48" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#9F1239', margin: 0 }}>
                  Master Database Purge & Hard Reset (Super Admin Only)
                </h3>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#881337', marginTop: '6px', maxWidth: '750px', lineHeight: 1.5 }}>
                Irreversible destructive operation. Allows Super Admin to wipe all orders, folios, receipts, daily operational sheets, and reset all rooms back to pristine clean vacant state.
              </p>
            </div>
            <button
              onClick={() => {
                setPurgeConfirmationCode('');
                setPurgeSummary(null);
                setIsPurgeModalOpen(true);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                backgroundColor: '#E11D48',
                color: '#FFFFFF',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(225, 29, 72, 0.25)',
              }}
            >
              <Trash2 size={16} />
              <span>Clear All Operational Data...</span>
            </button>
          </div>
        </div>
      )}

      {/* Database Purge Confirmation Modal */}
      {isPurgeModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 120,
          padding: '20px',
        }}>
          <div className="ent-card" style={{ width: '100%', maxWidth: '580px', padding: '28px', border: '2px solid #E11D48' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertTriangle size={24} color="#E11D48" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#9F1239', margin: 0 }}>
                  Master Database Reset
                </h3>
              </div>
              <button
                type="button"
                onClick={() => { setIsPurgeModalOpen(false); setPurgeSummary(null); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {purgeSummary ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '14px', backgroundColor: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '8px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#166534', margin: '0 0 6px' }}>
                    ✓ Database Purge Completed Successfully!
                  </h4>
                  <ul style={{ fontSize: '0.8rem', color: '#14532D', margin: 0, paddingLeft: '18px', lineHeight: 1.6 }}>
                    <li>Orders purged: <strong>{purgeSummary.ordersPurged}</strong></li>
                    <li>Folios / invoices purged: <strong>{purgeSummary.foliosPurged}</strong></li>
                    <li>Daily operational sheets purged: <strong>{purgeSummary.sheetsPurged}</strong></li>
                    <li>Maintenance tickets purged: <strong>{purgeSummary.ticketsPurged}</strong></li>
                    <li>Rooms reset to vacant clean: <strong>{purgeSummary.roomsReset}</strong></li>
                  </ul>
                </div>
                <button
                  onClick={() => { setIsPurgeModalOpen(false); setPurgeSummary(null); }}
                  className="btn-primary"
                  style={{ width: '100%' }}
                >
                  Done & Close
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '12px 14px', backgroundColor: '#FFF1F2', border: '1px solid #FECACA', borderRadius: '8px', fontSize: '0.8rem', color: '#9F1239', lineHeight: 1.5 }}>
                  ⚠️ <strong>Warning:</strong> This will delete every single operational transaction, guest folio, order increment, and daily closure from MongoDB Atlas. All rooms will be reset to vacant clean.
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      Select Pages & Data Models to Clear:
                    </label>
                    <button
                      type="button"
                      onClick={handleSelectAllModules}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--brand-primary)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      {selectedPurgeModules.length === CLEAR_PAGE_MODULES.length ? 'Deselect All' : 'Select All Pages (Full Wipe)'}
                    </button>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                    gap: '8px',
                    maxHeight: '260px',
                    overflowY: 'auto',
                    padding: '8px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    backgroundColor: '#F8FAFC',
                  }}>
                    {CLEAR_PAGE_MODULES.map(mod => {
                      const isChecked = selectedPurgeModules.includes(mod.id);
                      return (
                        <div
                          key={mod.id}
                          onClick={() => togglePurgeModule(mod.id)}
                          style={{
                            padding: '10px 12px',
                            borderRadius: '6px',
                            border: isChecked ? '1.5px solid var(--rose-primary)' : '1px solid var(--border-color)',
                            backgroundColor: isChecked ? '#FFF1F2' : '#FFFFFF',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isChecked ? '#9F1239' : 'var(--text-primary)' }}>
                              {mod.label}
                            </span>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              style={{ cursor: 'pointer' }}
                            />
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.3 }}>
                            {mod.desc}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Select Reset Scope
                  </label>
                  <select
                    value={purgeResetType}
                    onChange={(e) => setPurgeResetType(e.target.value as any)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.825rem' }}
                  >
                    <option value="OPERATIONAL_TRANSACTIONS">Operational Transactions (Folios, Orders, Shift Closures)</option>
                    <option value="FULL_FACTORY_RESET">Full Factory Reset (Transactions + Dynamic Menu Items + Ancillary Services)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Type <code style={{ color: '#E11D48', backgroundColor: '#FFF1F2', padding: '2px 6px', borderRadius: '4px' }}>CLEAR_ALL_DATA</code> or <code style={{ color: '#E11D48', backgroundColor: '#FFF1F2', padding: '2px 6px', borderRadius: '4px' }}>CLEAR_DATA</code> to authorize:
                  </label>
                  <input
                    type="text"
                    value={purgeConfirmationCode}
                    onChange={(e) => setPurgeConfirmationCode(e.target.value)}
                    placeholder="CLEAR_ALL_DATA"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      border: '1.5px solid #FDA4AF',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setIsPurgeModalOpen(false)}
                    className="btn-secondary"
                    disabled={isPurging}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleExecutePurge}
                    disabled={(purgeConfirmationCode !== 'CLEAR_ALL_DATA' && purgeConfirmationCode !== 'CLEAR_DATA') || selectedPurgeModules.length === 0 || isPurging}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: (purgeConfirmationCode === 'CLEAR_ALL_DATA' || purgeConfirmationCode === 'CLEAR_DATA') && selectedPurgeModules.length > 0 ? '#E11D48' : '#94A3B8',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '0.825rem',
                      cursor: (purgeConfirmationCode === 'CLEAR_ALL_DATA' || purgeConfirmationCode === 'CLEAR_DATA') && selectedPurgeModules.length > 0 ? 'pointer' : 'not-allowed',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Trash2 size={14} />
                    <span>
                      {isPurging
                        ? 'Purging Data...'
                        : selectedPurgeModules.length === CLEAR_PAGE_MODULES.length
                        ? 'Confirm & Wipe Entire Database (All Pages)'
                        : `Confirm & Purge Selected (${selectedPurgeModules.length} Pages)`}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
