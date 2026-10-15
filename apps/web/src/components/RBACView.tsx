'use client';

import React, { useState } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  Check, 
  X, 
  KeyRound, 
  Users, 
  UserCheck, 
  AlertCircle,
  Building2,
  Sparkles
} from 'lucide-react';
import { StaffUser, UserRole, AppPermission } from '@hosos/types';
import { RBAC_ROLE_DEFINITIONS } from '@/lib/mockData';

export default function RBACView({ 
  activeStaff, 
  onSelectRole 
}: { 
  activeStaff: StaffUser;
  onSelectRole: (role: UserRole) => void;
}) {
  const [selectedRoleForDetail, setSelectedRoleForDetail] = useState<UserRole>(activeStaff.role);

  const permissionsList: Array<{ key: AppPermission; label: string; desc: string }> = [
    { key: 'rooms.audit.view', label: 'View 360° Internal Room Audit', desc: 'Inspect chronological occupancy, orders, prices and tickets' },
    { key: 'rooms.status.override', label: 'Override Room Occupancy State', desc: 'Transition room between Clean, Dirty, Occupied, Maintenance' },
    { key: 'orders.create', label: 'Create POS Restaurant/Bar Order', desc: 'Open order ticket and fire KOT to Kitchen/Bar KDS' },
    { key: 'orders.increment', label: 'Increment Order Quantities/Items', desc: 'Add extra meals/drinks to active order with staff attribution' },
    { key: 'discounts.approve', label: 'Approve Discounts & Voids', desc: 'Elevated authorization required for price adjustments' },
    { key: 'voids.execute', label: 'Execute Bill Voids', desc: 'Cancel fired ticket with mandatory reason code' },
    { key: 'cash.receive', label: 'Receive Physical Cash & POS', desc: 'Collect cash drawer payments and settle folio transactions' },
    { key: 'maintenance.raise', label: 'Raise Maintenance Fault Ticket', desc: 'Log asset breakdown (AC, plumbing, electronics)' },
    { key: 'maintenance.signoff', label: 'Sign-off Maintenance Repair', desc: 'Verify completed repair and log replacement parts cost' },
    { key: 'reports.export', label: 'Export Tax & Financial Reports', desc: 'Download 7.5% VAT, P&L, and audit logs to Excel/PDF' },
    { key: 'users.onboard', label: 'Onboard Staff & Issue PINs', desc: 'Register new resort personnel and configure RBAC roles' },
    { key: 'crm.manage', label: 'Manage CRM & Corporate Deals', desc: 'Access VIP profiles and banquet event pipeline' },
    { key: 'diesel.log', label: 'Log Diesel & Generator Run Hours', desc: 'Input Perkins/Mikano hour meters and fuel discharge' },
  ];

  const currentRoleDef = RBAC_ROLE_DEFINITIONS.find(r => r.role === selectedRoleForDetail) || RBAC_ROLE_DEFINITIONS[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px 0' }}>
      
      {/* 1. Header Banner */}
      <div className="ent-card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Lock size={24} color="var(--brand-primary)" />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Multi-Role RBAC Security Matrix & Permission Engine
              </h2>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Zero-trust role-based access control. Every action is cryptographically attributed to authenticated staff roles and quick PINs.
            </p>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--brand-bg)',
            border: '1px solid var(--brand-border)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem',
            color: 'var(--brand-primary)',
            fontWeight: 700,
          }}>
            <ShieldCheck size={16} />
            <span>Active Role: {activeStaff.role.replace(/_/g, ' ')}</span>
          </div>
        </div>
      </div>

      {/* 2. Role Selector Strip for Inspection */}
      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text-primary)' }}>
          Select Role to Inspect Granular Permission Matrix
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '10px',
        }}>
          {RBAC_ROLE_DEFINITIONS.map((r) => {
            const isSelected = r.role === selectedRoleForDetail;
            const isCurrentUser = r.role === activeStaff.role;
            return (
              <button
                key={r.role}
                onClick={() => setSelectedRoleForDetail(r.role)}
                style={{
                  textAlign: 'left',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isSelected ? 'var(--brand-bg)' : '#FFFFFF',
                  border: isSelected ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-color)',
                  boxShadow: isSelected ? 'var(--shadow-card)' : 'var(--shadow-subtle)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.825rem', fontWeight: 700, color: isSelected ? 'var(--brand-primary)' : 'var(--text-primary)' }}>
                    {r.role.replace(/_/g, ' ')}
                  </span>
                  {isCurrentUser && (
                    <span className="badge badge-clean" style={{ fontSize: '0.6rem' }}>You</span>
                  )}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {r.permissions.length} Permissions Active
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Detailed Role Card */}
      <div className="ent-card" style={{ padding: '24px', borderLeft: '4px solid var(--brand-primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {currentRoleDef.displayName}
              </h3>
              <span className="badge badge-purple">{currentRoleDef.department}</span>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
              {currentRoleDef.description}
            </p>
          </div>

          <button
            onClick={() => onSelectRole(currentRoleDef.role)}
            className="btn-secondary"
            style={{ fontSize: '0.8rem' }}
          >
            Switch Active User to {currentRoleDef.role.replace(/_/g, ' ')}
          </button>
        </div>
      </div>

      {/* 4. Full Enterprise RBAC Permissions Matrix Table */}
      <div className="ent-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Permissions Granted to {currentRoleDef.displayName}
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Granular access control prevents revenue and stock leakage across departments.
            </p>
          </div>
          <span className="badge badge-brand">
            {currentRoleDef.permissions.length} of {permissionsList.length} Permissions
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="ent-table">
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>Status</th>
                <th>Permission Name</th>
                <th>System Scope Code</th>
                <th>Security Purpose & Anti-Leakage Guard</th>
              </tr>
            </thead>
            <tbody>
              {permissionsList.map((perm) => {
                const isGranted = currentRoleDef.permissions.includes(perm.key);
                return (
                  <tr key={perm.key} style={{ backgroundColor: isGranted ? '#FFFFFF' : '#FAFAFA' }}>
                    <td style={{ textAlign: 'center' }}>
                      {isGranted ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--emerald-bg)',
                          color: 'var(--emerald-primary)',
                        }}>
                          <Check size={13} strokeWidth={3} />
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: '#F1F5F9',
                          color: '#94A3B8',
                        }}>
                          <X size={13} />
                        </span>
                      )}
                    </td>

                    <td style={{ fontWeight: isGranted ? 700 : 500, color: isGranted ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {perm.label}
                    </td>

                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: isGranted ? 'var(--brand-primary)' : 'var(--text-muted)' }}>
                      {perm.key}
                    </td>

                    <td style={{ fontSize: '0.8rem', color: isGranted ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                      {perm.desc}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
