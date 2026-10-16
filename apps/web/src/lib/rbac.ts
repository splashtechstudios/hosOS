import { UserRole, AppPermission } from '@hosos/types';
import { RBAC_ROLE_DEFINITIONS } from './mockData';

export type ExtendedRole = UserRole | 'ADMIN';

/**
 * Enterprise view identifiers mapped to authorized roles
 */
export const ROLE_VIEW_ACCESS: Record<ExtendedRole, string[]> = {
  OWNER: [
    'dashboard',
    'night-audit',
    'loss-prevention',
    'crm-guests',
    'crm-deals',
    'room-audit',
    'front-desk',
    'pos',
    'inventory-tots',
    'inventory-bom',
    'facilities-generators',
    'onboarding-directory',
    'rbac-matrix',
  ],
  GENERAL_MANAGER: [
    'dashboard',
    'night-audit',
    'loss-prevention',
    'crm-guests',
    'crm-deals',
    'room-audit',
    'front-desk',
    'pos',
    'inventory-tots',
    'inventory-bom',
    'facilities-generators',
    'onboarding-directory',
    'rbac-matrix',
  ],
  FRONT_DESK: [
    'front-desk',
    'room-audit',
    'crm-guests',
    'pos',
  ],
  CASHIER: [
    'pos',
    'room-audit',
    'night-audit',
    'dashboard',
  ],
  WAITER: [
    'pos',
  ],
  BARTENDER: [
    'pos',
    'inventory-tots',
  ],
  CHEF: [
    'pos',
    'inventory-bom',
  ],
  HOUSEKEEPING: [
    'front-desk',
    'room-audit',
  ],
  MAINTENANCE: [
    'facilities-generators',
    'room-audit',
  ],
  ACCOUNTANT: [
    'dashboard',
    'night-audit',
    'loss-prevention',
    'room-audit',
    'crm-deals',
  ],
  STOREKEEPER: [
    'inventory-tots',
    'inventory-bom',
    'facilities-generators',
  ],
  ADMIN: [
    'dashboard',
    'night-audit',
    'loss-prevention',
    'crm-guests',
    'crm-deals',
    'room-audit',
    'front-desk',
    'pos',
    'inventory-tots',
    'inventory-bom',
    'facilities-generators',
    'onboarding-directory',
    'rbac-matrix',
  ],
};

/**
 * Default initial home view for each role
 */
export const ROLE_DEFAULT_VIEW: Record<ExtendedRole, string> = {
  OWNER: 'dashboard',
  GENERAL_MANAGER: 'dashboard',
  FRONT_DESK: 'front-desk',
  CASHIER: 'pos',
  WAITER: 'pos',
  BARTENDER: 'pos',
  CHEF: 'pos',
  HOUSEKEEPING: 'front-desk',
  MAINTENANCE: 'facilities-generators',
  ACCOUNTANT: 'dashboard',
  STOREKEEPER: 'inventory-tots',
  ADMIN: 'dashboard',
};

/**
 * Human readable view titles
 */
export const VIEW_TITLES: Record<string, string> = {
  dashboard: 'Executive Overview',
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
 * Checks whether a given role has authorization to access a specific view.
 */
export function canAccessView(role: string | undefined | null, viewId: string): boolean {
  if (!role) return false;
  const normalized = role.toUpperCase() as ExtendedRole;
  const allowedViews = ROLE_VIEW_ACCESS[normalized];
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
 */
export function hasPermission(role: string | undefined | null, permission: AppPermission): boolean {
  if (!role) return false;
  const normalized = role.toUpperCase();
  if (normalized === 'OWNER' || normalized === 'GENERAL_MANAGER' || normalized === 'ADMIN') {
    return true;
  }
  const def = RBAC_ROLE_DEFINITIONS.find(r => r.role === normalized);
  if (!def) return false;
  return def.permissions.includes(permission);
}
