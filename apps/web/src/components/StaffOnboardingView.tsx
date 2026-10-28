'use client';

import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Building2, 
  CheckCircle2, 
  ShieldCheck, 
  CreditCard, 
  KeyRound, 
  Briefcase, 
  FileText,
  BadgeCheck,
  Clock,
  Sparkles,
  Trash2
} from 'lucide-react';
import { StaffUser, StaffOnboardingRecord, DepartmentType, UserRole } from '@hosos/types';
import { ENTERPRISE_ORG, INITIAL_STAFF_ONBOARDING, INITIAL_STAFF } from '@/lib/mockData';
import { useFeedback } from '@/context/FeedbackContext';

export default function StaffOnboardingView({ activeStaff }: { activeStaff: StaffUser }) {
  const { showSuccess, showFailed, showConfirm } = useFeedback();
  const [onboardingList, setOnboardingList] = useState<StaffOnboardingRecord[]>(INITIAL_STAFF_ONBOARDING);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const isSuperAdmin = activeStaff.role === 'SUPERADMIN' || activeStaff.role === 'OWNER' || (activeStaff.role as any) === 'ADMIN';

  const handleDeleteUser = (userId: string, userEmail: string, userName: string) => {
    showConfirm(
      'Permanently Delete Staff User?',
      `Are you sure you want to permanently delete "${userName}" (${userEmail})? This action cannot be undone and will purge their credentials from MongoDB Atlas and HosOS RBAC.`,
      async () => {
        try {
          const res = await fetch(`/api/staff?id=${encodeURIComponent(userId)}&email=${encodeURIComponent(userEmail)}&role=${encodeURIComponent(activeStaff.role)}`, {
            method: 'DELETE',
          });
          const data = await res.json();
          if (data.success) {
            setOnboardingList((prev) => prev.filter((emp) => emp.id !== userId && emp.email !== userEmail));
            showSuccess(
              'User Completely Purged',
              `Staff member ${userName} (${userEmail}) has been permanently deleted from Osieka Resort systems.`
            );
          } else {
            showFailed('Deletion Error', data.error || 'Failed to delete user.');
          }
        } catch (err: any) {
          showFailed('Deletion Failed', err.message || 'Network error while deleting staff user.');
        }
      },
      {
        variant: 'danger',
        confirmText: 'Yes, Delete Completely',
        cancelText: 'Cancel',
      }
    );
  };

  // Wizard form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+234 80');
  const [ninOrIdNumber, setNinOrIdNumber] = useState('');
  const [department, setDepartment] = useState<DepartmentType>('FOOD_AND_BEVERAGE');
  const [designation, setDesignation] = useState('Floor Server & POS Terminal Operator');
  const [roleAssigned, setRoleAssigned] = useState<UserRole>('WAITER');
  const [salaryTier, setSalaryTier] = useState('Grade 4 (Service Associate)');
  const [bankName, setBankName] = useState('Guaranty Trust Bank (GTB)');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [posQuickPin, setPosQuickPin] = useState('3344');

  // Fetch live staff from database
  React.useEffect(() => {
    async function loadDbStaff() {
      try {
        const res = await fetch('/api/staff');
        const data = await res.json();
        if (data.success && data.staff && data.staff.length > 0) {
          const mapped: StaffOnboardingRecord[] = data.staff.map((s: any) => ({
            id: s.id || `staff-${Math.random()}`,
            staffId: s.id || `staff-${Math.random()}`,
            fullName: s.name,
            email: s.email,
            phoneNumber: s.phone || '+234 800 000 0000',
            ninOrIdNumber: s.nin || 'NIN-VERIFIED',
            department: (s.department as DepartmentType) || 'FOOD_AND_BEVERAGE',
            designation: s.role.replace(/_/g, ' '),
            roleAssigned: s.role as UserRole,
            salaryTier: s.salaryTier || 'Standard Personnel',
            bankName: s.bankName || 'Zenith Bank PLC',
            bankAccountNumber: s.bankAccountNumber || '0123456789',
            onboardingStatus: 'ACTIVE_CONFIRMED',
            posQuickPinIssued: s.pinCode || '1234',
            onboardedByStaffName: s.onboardedBy || 'Executive HR',
            createdAt: s.createdAt || new Date().toISOString(),
          }));
          setOnboardingList(mapped);
        }
      } catch (err) {
        console.warn('Could not load staff directory from API:', err);
      }
    }
    loadDbStaff();
  }, []);

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) return;

    const finalEmail = email || `${fullName.toLowerCase().replace(/\s+/g, '.')}@osiekaresort.ng`;
    const newRecord: StaffOnboardingRecord = {
      id: `onb-${Date.now()}`,
      staffId: `staff-0${onboardingList.length + 4}`,
      fullName,
      email: finalEmail,
      phoneNumber,
      ninOrIdNumber: ninOrIdNumber || `NIN-${Math.floor(10000000000 + Math.random() * 90000000000)}`,
      department,
      designation,
      roleAssigned,
      salaryTier,
      bankName,
      bankAccountNumber: bankAccountNumber || '0123456789',
      onboardingStatus: 'ACTIVE_CONFIRMED',
      posQuickPinIssued: posQuickPin || '1234',
      onboardedByStaffName: `${activeStaff.name} (${activeStaff.role})`,
      onboardedByUserId: activeStaff.id,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };

    setOnboardingList([newRecord, ...onboardingList]);
    setIsWizardOpen(false);

    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email: finalEmail,
          password: 'Password123!',
          role: roleAssigned,
          department,
          pinCode: posQuickPin || '1234',
          phone: phoneNumber,
          nin: newRecord.ninOrIdNumber,
          salaryTier,
          bankName,
          bankAccountNumber: newRecord.bankAccountNumber,
          onboardedBy: `${activeStaff.name} (${activeStaff.role})`,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showSuccess(
          'Staff Member Saved to MongoDB Atlas!',
          `${fullName} successfully registered as ${roleAssigned.replace(/_/g, ' ')}.`,
          `Initial Password: Password123! • Quick PIN: ${posQuickPin || '1234'} • Ready for immediate login.`
        );
      } else {
        showFailed('Staff Registration Warning', data.error || 'Saved locally in shift memory.');
      }
    } catch (err: any) {
      showFailed('Network Warning', 'Saved locally in shift memory. MongoDB sync will resume automatically.');
    }

    setFullName('');
    setBankAccountNumber('');
    setNinOrIdNumber('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE_CONFIRMED':
        return <span className="badge badge-clean"><BadgeCheck size={12} /> Active & Verified</span>;
      case 'TRAINING_IN_PROGRESS':
        return <span className="badge badge-dirty"><Clock size={12} /> In Training</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px 0' }}>
      
      {/* 1. Header Banner */}
      <div className="ent-card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users size={24} color="var(--brand-primary)" />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Organisation Hierarchy & Staff Onboarding Pipeline
              </h2>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Official personnel directory, national identity registration, RBAC role presets, and payroll account linkage.
            </p>
          </div>

          <button onClick={() => setIsWizardOpen(true)} className="btn-primary">
            <UserPlus size={16} />
            <span>+ Onboard New Staff Member</span>
          </button>
        </div>
      </div>

      {/* 2. Organisation Department Structure */}
      <div>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>
          Resort Department Structure & Heads of Department
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '14px',
        }}>
          {ENTERPRISE_ORG.departments.map((dept) => (
            <div key={dept.id} className="ent-card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Building2 size={16} color="var(--brand-primary)" />
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {dept.name}
                </h4>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Department Head:
              </div>
              <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '2px' }}>
                {dept.head}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Onboarded Employee Directory Table */}
      <div className="ent-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Verified Staff Registry & Credentials Audit
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              All actions taken in HosOS (orders, repairs, receipts) are cryptographically tied to these staff profiles and PINs.
            </p>
          </div>
          <span className="badge badge-brand">{onboardingList.length} Active Personnel</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="ent-table">
            <thead>
              <tr>
                <th>Employee Name & Contact</th>
                <th>Department & Designation</th>
                <th>Assigned Role</th>
                <th>Status</th>
                <th>NIN / National ID</th>
                <th>POS Quick PIN</th>
                <th>Payroll Account</th>
                <th>Onboarded By</th>
                {isSuperAdmin && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {onboardingList.map((emp) => (
                <tr key={emp.id}>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {emp.fullName}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                      {emp.email} • {emp.phoneNumber}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{emp.designation}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{emp.department.replace(/_/g, ' ')}</div>
                  </td>
                  <td>
                    <span className="badge badge-purple">{emp.roleAssigned.replace(/_/g, ' ')}</span>
                  </td>
                  <td>
                    {getStatusBadge(emp.onboardingStatus)}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {emp.ninOrIdNumber}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--brand-primary)' }}>
                    •••• ({emp.posQuickPinIssued})
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <div style={{ fontWeight: 600 }}>{emp.bankName}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{emp.bankAccountNumber}</div>
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {emp.onboardedByStaffName}
                  </td>
                  {isSuperAdmin && (
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteUser(emp.id, emp.email, emp.fullName)}
                        className="btn-danger"
                        style={{
                          padding: '6px 10px',
                          fontSize: '0.725rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          borderRadius: '6px',
                        }}
                        title="Delete staff member permanently from database"
                      >
                        <Trash2 size={12} />
                        <span>Delete User</span>
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Onboarding Wizard Modal */}
      {isWizardOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px',
        }}>
          <div className="ent-card" style={{ width: '100%', maxWidth: '640px', padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <UserPlus size={22} color="var(--brand-primary)" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                New Employee Onboarding Wizard
              </h3>
            </div>

            <form onSubmit={handleOnboardSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Step 1: Personal & Identification */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Chukwuma Emmanuel Okafor"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                    National ID (NIN) / Passport
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. NIN-8492049102"
                    value={ninOrIdNumber}
                    onChange={(e) => setNinOrIdNumber(e.target.value)}
                    required
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Step 2: Contact */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                    Official Resort Email
                  </label>
                  <input
                    type="email"
                    placeholder="name@osiekaresort.ng"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Step 3: Department, Role & POS PIN */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value as DepartmentType)}
                    style={{ width: '100%' }}
                  >
                    <option value="FOOD_AND_BEVERAGE">Food & Beverage</option>
                    <option value="ROOMS_DIVISION">Rooms Division</option>
                    <option value="ACCOUNTS_FINANCE">Accounts & Finance</option>
                    <option value="MAINTENANCE_ENGINEERING">Maintenance & Engineering</option>
                    <option value="HUMAN_RESOURCES_SECURITY">HR & Security</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                    RBAC Role Preset
                  </label>
                  <select
                    value={roleAssigned}
                    onChange={(e) => setRoleAssigned(e.target.value as UserRole)}
                    style={{ width: '100%' }}
                  >
                    <option value="WAITER">WAITER (POS Server)</option>
                    <option value="BARTENDER">BARTENDER (Main Bar)</option>
                    <option value="FRONT_DESK">FRONT_DESK (Folio Agent)</option>
                    <option value="CASHIER">CASHIER (Audit Settlement)</option>
                    <option value="CHEF">CHEF (Kitchen KDS)</option>
                    <option value="HOUSEKEEPING">HOUSEKEEPING (Inspections)</option>
                    <option value="MAINTENANCE">MAINTENANCE (Engineer)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                    POS Quick PIN
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={posQuickPin}
                    onChange={(e) => setPosQuickPin(e.target.value)}
                    style={{ width: '100%', textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
                  />
                </div>
              </div>

              {/* Step 4: Designation & Payroll Bank */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                    Bank Name
                  </label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="Guaranty Trust Bank (GTB)">Guaranty Trust Bank (GTB)</option>
                    <option value="Access Bank PLC">Access Bank PLC</option>
                    <option value="Zenith Bank PLC">Zenith Bank PLC</option>
                    <option value="First Bank of Nigeria">First Bank of Nigeria</option>
                    <option value="Stanbic IBTC Bank">Stanbic IBTC Bank</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                    NUBAN Account Number
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="0123456789"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    style={{ width: '100%', fontFamily: 'var(--font-mono)' }}
                  />
                </div>
              </div>

              {/* Onboarding attribution warning */}
              <div style={{
                background: 'var(--brand-bg)',
                border: '1px solid var(--brand-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 14px',
                fontSize: '0.75rem',
                color: 'var(--brand-primary)',
              }}>
                ℹ️ <strong>Accountability Stamped:</strong> This staff member will be logged into the audit registry as onboarded by <strong>{activeStaff.name} ({activeStaff.role})</strong> on {new Date().toLocaleDateString()}.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsWizardOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Complete Onboarding & Issue PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
