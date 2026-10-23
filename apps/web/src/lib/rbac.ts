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
    'onboarding-directory',
    'rbac-matrix',
  ],
  MANAGER: [
    'daily-operations',
    'front-desk',
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
    'onboarding-directory',
    'rbac-matrix',
  ],
  ACCOUNTANT: [
    'accountant-audit',
    'dashboard',
    'night-audit',
    'loss-prevention',
    'room-audit',
  ],
  FRONT_DESK: [
    'daily-operations',
    'front-desk',
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
  MANAGER: 'daily-operations',
  GENERAL_MANAGER: 'daily-operations',
  ACCOUNTANT: 'accountant-audit',
  FRONT_DESK: 'daily-operations',
  CASHIER: 'daily-operations',
  WAITER: 'pos',
  BARTENDER: 'pos',
  CHEF: 'pos',
  HOUSEKEEPING: 'front-desk',
  MAINTENANCE: 'room-audit',
  STOREKEEPER: 'daily-operations',
  ADMIN: 'dashboard',
};

/**
 * Human readable view titles
 */
export const VIEW_TITLES: Record<string, string> = {
  'daily-operations': 'Daily Operations Board',
  'accountant-audit': 'Audit & Reconciliation Desk',
  dashboard: 'Executive P&L Overview',
  'night-audit': 'Night Audit & Flash Rollover',
  'loss-prevention': 'Loss Prevention & Audit Trail',
  'crm-guests': 'VIP Guest Profiles',
  'crm-deals': 'Corporate Event Pipeline',
  'room-audit': 'Room 360° Internal Room Audit',
  'front-desk': 'Tape Chart & Room Grid',
  pos: 'Restaurant & Bar POS',
  'inventory-tots': 'Bar Tot Dipstick Audit',
  'inventory-bom': 'Recipe Bill of Materials',
  'facilities-generators': 'Diesel & Generator Logs',
  'onboarding-directory': 'Staff Directory & Access',
  'rbac-matrix': 'Multi-Role RBAC Matrix',
};

/**
 * Retrieves active role configuration (incorporating Superadmin custom saved matrix from localStorage)
 */
export function getActiveRoleDefinition(role: string | undefined | null): RoleRBACDefinition | undefined {
  if (!role) return undefined;
  const normalized = role.toUpperCase();

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('hosos_custom_rbac_matrix');
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
export function canAccessView(role: string | undefined | null, viewId: string): boolean {
  if (!role) return false;
  const normalized = role.toUpperCase();

  // Superadmin & Owner retain master governance access to prevent total lockouts
  if (normalized === 'SUPERADMIN' || normalized === 'OWNER') {
    return true;
  }

  const def = getActiveRoleDefinition(normalized);
  if (def) {
    // If Superadmin toggled this role completely OFF, deny access across board
    if (def.isEnabled === false) {
      return false;
    }
    // If Superadmin specifically configured allowed sub-page views for this role
    if (Array.isArray(def.allowedViews) && def.allowedViews.length > 0) {
      return def.allowedViews.includes(viewId);
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
 * Strictly enforced against Superadmin saved permissions.
 */
export function hasPermission(role: string | undefined | null, permission: AppPermission): boolean {
  if (!role) return false;
  const normalized = role.toUpperCase();

  if (normalized === 'SUPERADMIN' || normalized === 'OWNER') {
    return true;
  }

  const def = getActiveRoleDefinition(normalized);
  if (!def) return false;

  // If role is disabled by Superadmin, all actions are blocked
  if (def.isEnabled === false) {
    return false;
  }

  return def.permissions.includes(permission);
}

