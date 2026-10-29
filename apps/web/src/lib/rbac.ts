import { UserRole, AppPermission, RoleRBACDefinition } from '@hosos/types';
import { RBAC_ROLE_DEFINITIONS } from './mockData';

export type ExtendedRole = UserRole | 'ADMIN';

/**
 * Enterprise view identifiers mapped to authorized roles
 */
export const ROLE_VIEW_ACCESS: Record<ExtendedRole, string[]> = {
  SUPERADMIN: [
    'dashboard',
    'daily-operations',
    'accountant-audit',
    'room-audit',
    'front-desk',
    'pos',
    'night-audit',
    'loss-prevention',
    'halls-services',
    'ancillary-services',
    'message-board',
    'message-emails',
    'onboarding-directory',
    'rbac-matrix',
  ],
  OWNER: [
    'dashboard',
    'daily-operations',
    'accountant-audit',
    'room-audit',
    'front-desk',
    'pos',
    'night-audit',
    'loss-prevention',
    'halls-services',
    'ancillary-services',
    'message-board',
    'message-emails',
    'onboarding-directory',
    'rbac-matrix',
  ],
  MANAGER: [
    'daily-operations',
    'front-desk',
    'halls-services',
    'ancillary-services',
    'message-board',
    'message-emails',
    'room-audit',
  ],
  GENERAL_MANAGER: [
    'dashboard',
    'daily-operations',
    'accountant-audit',
    'room-audit',
    'front-desk',
    'pos',
    'night-audit',
    'loss-prevention',
    'halls-services',
    'ancillary-services',
    'message-board',
    'message-emails',
    'onboarding-directory',
    'rbac-matrix',
  ],
  ACCOUNTANT: [
    'accountant-audit',
    'dashboard',
    'night-audit',
    'loss-prevention',
    'room-audit',
    'message-board',
    'message-emails',
  ],
  FRONT_DESK: [
    'daily-operations',
    'front-desk',
    'halls-services',
    'ancillary-services',
    'message-board',
    'message-emails',
    'room-audit',
    'pos',
  ],
  CASHIER: [
    'daily-operations',
    'pos',
    'room-audit',
    'dashboard',
  ],
  WAITER: [
    'pos',
  ],
  BARTENDER: [
    'pos',
  ],
  CHEF: [
    'pos',
  ],
  HOUSEKEEPING: [
    'front-desk',
    'room-audit',
  ],
  MAINTENANCE: [
    'facilities-generators',
    'room-audit',
  ],
  STOREKEEPER: [
    'inventory-tots',
    'inventory-bom',
  ],
  ADMIN: [
    'dashboard',
    'daily-operations',
    'accountant-audit',
    'room-audit',
    'front-desk',
    'pos',
    'night-audit',
    'loss-prevention',
    'message-board',
    'message-emails',
    'onboarding-directory',
    'rbac-matrix',
  ],
};

/**
 * Default initial home view for each role
 */
export const ROLE_DEFAULT_VIEW: Record<ExtendedRole, string> = {
  SUPERADMIN: 'dashboard',
  OWNER: 'dashboard',
  MANAGER: 'front-desk',
  GENERAL_MANAGER: 'front-desk',
  ACCOUNTANT: 'accountant-audit',
  FRONT_DESK: 'front-desk',
  CASHIER: 'front-desk',
  WAITER: 'front-desk',
  BARTENDER: 'front-desk',
  CHEF: 'front-desk',
  HOUSEKEEPING: 'front-desk',
  MAINTENANCE: 'room-audit',
  STOREKEEPER: 'front-desk',
  ADMIN: 'dashboard',
};

/**
 * Human readable view titles
 */
export const VIEW_TITLES: Record<string, string> = {
  'daily-operations': 'Hospitality Command Hub',
  'accountant-audit': 'Audit & Reconciliation Desk',
  dashboard: 'Executive P&L Overview',
  'night-audit': 'Night Audit & Flash Rollover',
  'loss-prevention': 'Loss Prevention & Audit Trail',
  'crm-guests': 'VIP Guest Profiles',
  'crm-deals': 'Corporate Event Pipeline',
  'room-audit': 'Room 360° Internal Room Audit',
  'front-desk': 'Hospitality Command Hub',
  'hospitality-hub': 'Hospitality Command Hub',
  'halls-services': 'Halls, Venues & Event Banqueting Board',
  'ancillary-services': 'Ancillary Operations Board (Laundry & Spa)',
  'message-board': 'Concierge Message Board',
  'message-emails': 'Email List & Dispatch Subscribers',
  pos: 'Hospitality Command Hub',
  'inventory-tots': 'Bar Tot Dipstick Audit',
  'inventory-bom': 'Recipe Bill of Materials',
  'facilities-generators': 'Off-Grid Solar Microgrid & Power Saver',
  'onboarding-directory': 'Staff Directory & Access',
  'rbac-matrix': 'Multi-Role RBAC Matrix',
};

export const RBAC_STORAGE_KEY = 'hosos_custom_rbac_matrix_v2';

/**
 * Retrieves per-user permission overrides (grants and denials) from localStorage.
 * These are configured by SuperAdmin in the RBAC Per-User Overrides panel.
 */
function getUserPermissionOverrides(userId?: string | null) {
  if (!userId || typeof window === 'undefined') return null;
  try {
    const overrides = JSON.parse(localStorage.getItem('hosos_user_permission_overrides') || '{}');
    if (overrides[userId]) return overrides[userId];
    // Also check case-insensitive or email match if stored under another key
    const lowerId = userId.toLowerCase();
    for (const [k, v] of Object.entries(overrides)) {
      if (k.toLowerCase() === lowerId || (v as any)?.email?.toLowerCase() === lowerId) {
        return v as any;
      }
    }
    return undefined;
  } catch { return null; }
}

/**
 * Retrieves active role configuration (incorporating Superadmin custom saved matrix from localStorage)
 */
export function getActiveRoleDefinition(role: string | undefined | null): RoleRBACDefinition | undefined {
  if (!role) return undefined;
  const normalized = role.toUpperCase() === 'ADMIN' ? 'SUPERADMIN' : role.toUpperCase();

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(RBAC_STORAGE_KEY);
      if (saved) {
        const parsed: RoleRBACDefinition[] = JSON.parse(saved);
        const match = parsed.find((r) => r.role === normalized);
        if (match) return match;
      }
    } catch (_) {}
  }

  return RBAC_ROLE_DEFINITIONS.find((r) => r.role === normalized);
}

/**
 * Checks whether an account is strictly a Read-Only Auditor (Accountant)
 * The accountant has full visibility but zero mutation permissions across board.
 */
export function isReadOnlyAuditor(role: string | undefined | null): boolean {
  if (!role) return false;
  return role.toUpperCase() === 'ACCOUNTANT';
}

/**
 * Checks whether a given role has authorization to access a specific view.
 * Superadmin matrix configuration is strictly enforced in real time.
 */
export function canAccessView(role: string | undefined | null, viewId: string, userId?: string | null): boolean {
  if (!role) return false;
  const normalized = role.toUpperCase();

  // Superadmin & Owner retain master governance access to prevent total lockouts
  if (normalized === 'SUPERADMIN' || normalized === 'OWNER') {
    return true;
  }

  // Check per-user view access overrides first
  if (userId) {
    const userOverride = getUserPermissionOverrides(userId);
    if (userOverride) {
      // If user has been elevated to a different role, use that role's views
      if (userOverride.elevatedRole) {
        const elevatedNorm = userOverride.elevatedRole.toUpperCase();
        if (elevatedNorm === 'SUPERADMIN' || elevatedNorm === 'OWNER') return true;
        const elevatedDef = getActiveRoleDefinition(elevatedNorm);
        if (elevatedDef?.allowedViews.includes(viewId)) return true;
      }
      // Extra views granted to this specific user
      if (userOverride.allowedViews.includes(viewId)) return true;
    }
  }

  const def = getActiveRoleDefinition(normalized);
  if (def) {
    // If Superadmin toggled this role completely OFF, deny access across board
    if (def.isEnabled === false) {
      return false;
    }
    // If Superadmin specifically configured allowed sub-page views for this role
    if (Array.isArray(def.allowedViews) && def.allowedViews.length > 0) {
      if (def.allowedViews.includes(viewId)) return true;
      if (
        (viewId === 'message-board' || viewId === 'message-emails') &&
        (def.allowedViews.includes('front-desk') ||
          def.allowedViews.includes('message-board') ||
          def.allowedViews.includes('accountant-audit'))
      ) {
        return true;
      }
      return false;
    }
  }

  const allowedViews = ROLE_VIEW_ACCESS[normalized as ExtendedRole];
  if (!allowedViews) return false;
  return allowedViews.includes(viewId);
}

/**
 * Returns the default home view route for a role.
 */
export function getDefaultViewForRole(role: string | undefined | null): string {
  if (!role) return 'dashboard';
  const normalized = role.toUpperCase() as ExtendedRole;
  return ROLE_DEFAULT_VIEW[normalized] || 'dashboard';
}

/**
 * Checks whether a given role holds a specific AppPermission.
 * Strictly enforced against Superadmin saved permissions and per-user overrides.
 */
export function hasPermission(role: string | undefined | null, permission: AppPermission, userId?: string | null): boolean {
  if (!role) return false;
  const normalized = role.toUpperCase() === 'ADMIN' ? 'SUPERADMIN' : role.toUpperCase();

  // Prevent Superadmin from ever locking themselves out of the RBAC Permissions page itself
  if (normalized === 'SUPERADMIN' && permission === 'rbac.manage') {
    return true;
  }

  // 1. Check per-user overrides FIRST (applies to all users and roles)
  if (userId) {
    const userOverride = getUserPermissionOverrides(userId);
    if (userOverride) {
      // Explicit deny always blocks the action
      if (userOverride.deniedPermissions?.includes(permission)) return false;
      // Explicit grant always allows the action
      if (userOverride.grantedPermissions?.includes(permission)) return true;
      // If user has an elevated role, check that elevated role's active permissions
      if (userOverride.elevatedRole) {
        const elevatedNorm = userOverride.elevatedRole.toUpperCase() === 'ADMIN' ? 'SUPERADMIN' : userOverride.elevatedRole.toUpperCase();
        const elevatedDef = getActiveRoleDefinition(elevatedNorm);
        if (elevatedDef && elevatedDef.isEnabled !== false) {
          return elevatedDef.permissions.includes(permission);
        }
      }
    }
  }

  // 2. Check Role-Level Matrix permissions
  const def = getActiveRoleDefinition(normalized);
  if (!def) return false;

  // If role is disabled by Superadmin, all actions are blocked
  if (def.isEnabled === false) {
    return false;
  }

  return def.permissions.includes(permission);
}

/**
 * Determines if the navigation sidebar is enabled for a given role based on the RBAC matrix configuration.
 * Manager role defaults to false (single-flow Command Hub).
 * Superadmin, Owner, Accountant, and General Manager default to true (multi-menu access).
 */
export function isSidebarEnabledForRole(role: string | undefined | null): boolean {
  if (!role) return false;
  const normalized = role.toUpperCase();
  const def = getActiveRoleDefinition(normalized);
  if (def && typeof def.hasSidebar === 'boolean') {
    return def.hasSidebar;
  }
  // Default fallback if not explicitly set in matrix:
  return normalized === 'SUPERADMIN' || normalized === 'OWNER' || normalized === 'ACCOUNTANT' || normalized === 'GENERAL_MANAGER';
}
