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
  Trash2,
  Edit2,
  X,
  Lock
} from 'lucide-react';
import { StaffUser, StaffOnboardingRecord, DepartmentType, UserRole } from '@hosos/types';
import { ENTERPRISE_ORG, INITIAL_STAFF_ONBOARDING, INITIAL_STAFF } from '@/lib/mockData';
import { useFeedback } from '@/context/FeedbackContext';
import { hasPermission } from '@/lib/rbac';

export default function StaffOnboardingView({ activeStaff }: { activeStaff: StaffUser }) {
  const { showSuccess, showFailed, showConfirm } = useFeedback();
  const [onboardingList, setOnboardingList] = useState<StaffOnboardingRecord[]>(INITIAL_STAFF_ONBOARDING);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const isSuperAdmin = activeStaff.role === 'SUPERADMIN' || activeStaff.role === 'OWNER' || (activeStaff.role as any) === 'ADMIN';
  const canManageUsers = isSuperAdmin || hasPermission(activeStaff.role, 'users.manage', activeStaff.id);
  const canDeleteUsers = isSuperAdmin || hasPermission(activeStaff.role, 'users.delete', activeStaff.id);

  // Edit Staff State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffOnboardingRecord | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editRoleAssigned, setEditRoleAssigned] = useState<UserRole>('WAITER');
  const [editDepartment, setEditDepartment] = useState<DepartmentType>('FOOD_AND_BEVERAGE');
  const [editPhoneNumber, setEditPhoneNumber] = useState('');
  const [editPosQuickPin, setEditPosQuickPin] = useState('');
  const [editSalaryTier, setEditSalaryTier] = useState('');
  const [editBankName, setEditBankName] = useState('');
  const [editBankAccountNumber, setEditBankAccountNumber] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

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

  const openEditModal = (emp: StaffOnboardingRecord) => {
    setEditingStaff(emp);
    setEditFullName(emp.fullName);
    setEditRoleAssigned(emp.roleAssigned);
    setEditDepartment(emp.department);
    setEditPhoneNumber(emp.phoneNumber);
    setEditPosQuickPin(emp.posQuickPinIssued || '1234');
    setEditSalaryTier(emp.salaryTier || 'Standard Personnel');
    setEditBankName(emp.bankName || 'Zenith Bank PLC');
    setEditBankAccountNumber(emp.bankAccountNumber || '');
    setIsEditModalOpen(true);
  };

  const handleUpdateStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;

    setIsUpdating(true);
    try {
      const res = await fetch('/api/staff', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingStaff.id,
          email: editingStaff.email,
          name: editFullName.trim(),
          role: editRoleAssigned,
          department: editDepartment,
          phone: editPhoneNumber.trim(),
          pinCode: editPosQuickPin.trim(),
          salaryTier: editSalaryTier.trim(),
          bankName: editBankName.trim(),
          bankAccountNumber: editBankAccountNumber.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Update local list
        setOnboardingList((prev) =>
          prev.map((emp) =>
            emp.id === editingStaff.id || emp.email === editingStaff.email
              ? {
                  ...emp,
                  fullName: editFullName.trim(),
                  roleAssigned: editRoleAssigned,
                  designation: editRoleAssigned.replace(/_/g, ' '),
                  department: editDepartment,
                  phoneNumber: editPhoneNumber.trim(),
                  posQuickPinIssued: editPosQuickPin.trim(),
                  salaryTier: editSalaryTier.trim(),
                  bankName: editBankName.trim(),
                  bankAccountNumber: editBankAccountNumber.trim(),
                }
              : emp
          )
        );

        showSuccess(
          'Staff Details Updated',
          `Changes to ${editFullName} (${editRoleAssigned}) have been saved to MongoDB Atlas.`
        );
        setIsEditModalOpen(false);
        setEditingStaff(null);
      } else {
        showFailed('Update Error', data.error || 'Failed to update staff user.');
      }
    } catch (err: any) {
      showFailed('Update Failed', err.message || 'Network error updating staff user.');
    } finally {
      setIsUpdating(false);
    }
  };

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
      posQuickPinIssued: posQuickPin,
      onboardedByStaffName: activeStaff.name,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email: finalEmail,
          password: 'Password@123',
          role: roleAssigned,
          department,
          pinCode: posQuickPin,
          phone: phoneNumber,
          nin: ninOrIdNumber,
          salaryTier,
          bankName,
          bankAccountNumber,
          onboardedBy: activeStaff.name,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOnboardingList([newRecord, ...onboardingList]);
        setIsWizardOpen(false);
        showSuccess(
          'Staff Member Onboarded & Active',
          `${fullName} has been granted access as ${roleAssigned}. POS Quick-PIN ${posQuickPin} issued.`
        );
      } else {
        showFailed('Onboarding Error', data.error || 'Failed to persist staff user to database.');
      }
    } catch (err: any) {
      showFailed('Network Error', err.message || 'Could not reach server.');
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
                Organisation Hierarchy & Staff Directory
              </h2>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Official personnel directory, national identity registration, RBAC role presets, and live credential management.
            </p>
          </div>

          {canManageUsers && (
            <button onClick={() => setIsWizardOpen(true)} className="btn-primary">
              <UserPlus size={16} />
              <span>+ Onboard New Staff Member</span>
            </button>
          )}
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
                {(canManageUsers || canDeleteUsers) && <th style={{ textAlign: 'right' }}>Actions</th>}
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
                  {(canManageUsers || canDeleteUsers) && (
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        {canManageUsers && (
                          <button
                            onClick={() => openEditModal(emp)}
                            className="btn-secondary"
                            style={{
                              padding: '5px 9px',
                              fontSize: '0.725rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              borderRadius: '6px',
                            }}
                            title="Edit user details, role, department, and PIN"
                          >
                            <Edit2 size={12} color="var(--brand-primary)" />
                            <span>Edit</span>
                          </button>
                        )}
                        {canDeleteUsers && (
                          <button
                            onClick={() => handleDeleteUser(emp.id, emp.email, emp.fullName)}
                            className="btn-danger"
                            style={{
                              padding: '5px 9px',
                              fontSize: '0.725rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              borderRadius: '6px',
                            }}
                            title="Delete staff member permanently from database"
                          >
                            <Trash2 size={12} />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Staff Modal */}
      {isEditModalOpen && editingStaff && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 110,
          padding: '20px',
        }}>
          <div className="ent-card" style={{ width: '100%', maxWidth: '580px', padding: '26px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Edit2 size={20} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Edit Staff Member Profile
                </h3>
              </div>
              <button
                type="button"
                onClick={() => { setIsEditModalOpen(false); setEditingStaff(null); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateStaffSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  required
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                    Assigned Role
                  </label>
                  <select
                    value={editRoleAssigned}
                    onChange={(e) => setEditRoleAssigned(e.target.value as UserRole)}
                    style={{ width: '100%' }}
                  >
                    <option value="SUPERADMIN">SUPERADMIN (Master Governance)</option>
                    <option value="OWNER">OWNER (Executive Board)</option>
                    <option value="MANAGER">MANAGER (Operations Manager)</option>
                    <option value="ACCOUNTANT">ACCOUNTANT (Financial Controller)</option>
                    <option value="FRONT_DESK">FRONT_DESK (Front Desk)</option>
                    <option value="CASHIER">CASHIER (Cashier / POS)</option>
                    <option value="WAITER">WAITER (Floor Server)</option>
                    <option value="BARTENDER">BARTENDER (Main Bar)</option>
                    <option value="CHEF">CHEF (Head Chef)</option>
                    <option value="HOUSEKEEPING">HOUSEKEEPING (Lead)</option>
                    <option value="MAINTENANCE">MAINTENANCE (Engineer)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                    Department
                  </label>
                  <select
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value as DepartmentType)}
                    style={{ width: '100%' }}
                  >
                    <option value="FOOD_AND_BEVERAGE">Food & Beverage</option>
                    <option value="ROOMS_DIVISION">Rooms Division</option>
                    <option value="ACCOUNTS_FINANCE">Accounts & Finance</option>
                    <option value="MAINTENANCE_ENGINEERING">Maintenance & Engineering</option>
                    <option value="HUMAN_RESOURCES_SECURITY">HR & Security</option>
                    <option value="EXECUTIVE">Executive Management</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={editPhoneNumber}
                    onChange={(e) => setEditPhoneNumber(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                    POS Quick PIN
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={editPosQuickPin}
                    onChange={(e) => setEditPosQuickPin(e.target.value)}
                    style={{ width: '100%', textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                    Bank Name
                  </label>
                  <select
                    value={editBankName}
                    onChange={(e) => setEditBankName(e.target.value)}
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
                    NUBAN Account
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={editBankAccountNumber}
                    onChange={(e) => setEditBankAccountNumber(e.target.value)}
                    style={{ width: '100%', fontFamily: 'var(--font-mono)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => { setIsEditModalOpen(false); setEditingStaff(null); }}
                  className="btn-secondary"
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Saving Changes...' : 'Save & Sync to Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
