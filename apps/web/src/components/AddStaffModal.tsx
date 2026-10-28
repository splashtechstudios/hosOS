'use client';

import React, { useState } from 'react';
import { X, UserPlus, ShieldCheck, KeyRound, Building2 } from 'lucide-react';
import { StaffUser, UserRole, DepartmentType } from '@hosos/types';
import { useFeedback } from '@/context/FeedbackContext';

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeStaff: StaffUser;
  onStaffAdded: (newStaff: StaffUser) => void;
}

export default function AddStaffModal({
  isOpen,
  onClose,
  activeStaff,
  onStaffAdded,
}: AddStaffModalProps) {
  const { showConfirm, showSuccess, showFailed } = useFeedback();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Staff123!');
  const [role, setRole] = useState<UserRole>('WAITER');
  const [department, setDepartment] = useState<DepartmentType>('FOOD_AND_BEVERAGE');
  const [pinCode, setPinCode] = useState('3344');
  const [phone, setPhone] = useState('+234 80');
  const [nin, setNin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    showConfirm(
      `Confirm Staff Onboarding: ${name}`,
      `Are you sure you want to onboard ${name} as ${role.replace(/_/g, ' ')} in department ${department}? They will be registered in MongoDB Atlas with direct login access.`,
      async () => {
        setIsSubmitting(true);
        setErrorMsg(null);

        try {
          const res = await fetch('/api/staff', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name,
              email,
              password,
              role,
              department,
              pinCode,
              phone,
              nin,
              onboardedBy: `${activeStaff.name} (${activeStaff.role})`,
            }),
          });

          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(data.error || 'Failed to add staff member');
          }

          const createdStaffUser: StaffUser = {
            id: data.staff.id || `staff-${Date.now()}`,
            name: data.staff.name,
            email: data.staff.email,
            role: data.staff.role as UserRole,
            department: data.staff.department as any,
            pinCodeHash: data.staff.pinCode,
            isActive: true,
            createdAt: new Date().toISOString(),
          };

          onStaffAdded(createdStaffUser);
          onClose();
          showSuccess(
            'Staff Member Onboarded Successfully!',
            `Staff member ${createdStaffUser.name} added to MongoDB Atlas and assigned role ${createdStaffUser.role}.`,
            `Email: ${createdStaffUser.email} • Password: ${password} • Quick PIN: ${pinCode}`
          );
        } catch (err: any) {
          setErrorMsg(err.message || 'Error creating staff');
          showFailed('Staff Onboarding Failed', err.message || 'Could not save staff to MongoDB Atlas.');
        } finally {
          setIsSubmitting(false);
        }
      },
      {
        confirmText: 'Onboard Staff Member',
        variant: 'primary',
        details: `Role: ${role} | Department: ${department} | Email: ${email}`
      }
    );
  };

  return (
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
      <div className="ent-card" style={{ width: '100%', maxWidth: '580px', padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={22} color="var(--brand-primary)" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              In-App Add Staff Member
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {errorMsg && (
          <div style={{
            padding: '10px 14px',
            backgroundColor: 'var(--rose-bg)',
            color: 'var(--rose-primary)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem',
            marginBottom: '14px',
            fontWeight: 600,
          }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Full Legal Name
              </label>
              <input
                type="text"
                placeholder="e.g. Samuel Adeleke"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Login Password
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Login Email
              </label>
              <input
                type="email"
                placeholder="staff@osiekaresort.ng"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Select Staff Role */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 90px', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Select Staff Role
              </label>
              <select
                value={role}
                onChange={(e) => {
                  const r = e.target.value as UserRole;
                  setRole(r);
                  if (r === 'WAITER' || r === 'BARTENDER' || r === 'CHEF') setDepartment('FOOD_AND_BEVERAGE');
                  else if (r === 'FRONT_DESK' || r === 'HOUSEKEEPING') setDepartment('ROOMS_DIVISION');
                  else if (r === 'CASHIER' || r === 'ACCOUNTANT') setDepartment('ACCOUNTS_FINANCE');
                  else if (r === 'MAINTENANCE') setDepartment('MAINTENANCE_ENGINEERING');
                  else if (r === 'STOREKEEPER') setDepartment('FOOD_AND_BEVERAGE');
                }}
                style={{ width: '100%', fontWeight: 600 }}
              >
                <option value="OWNER">OWNER / Board</option>
                <option value="GENERAL_MANAGER">GENERAL MANAGER</option>
                <option value="FRONT_DESK">FRONT DESK Supervisor</option>
                <option value="CASHIER">CASHIER (Chief Cashier)</option>
                <option value="WAITER">WAITER (F&B Server)</option>
                <option value="BARTENDER">BARTENDER (Main Bar)</option>
                <option value="CHEF">CHEF (Executive Kitchen)</option>
                <option value="HOUSEKEEPING">HOUSEKEEPING Lead</option>
                <option value="MAINTENANCE">MAINTENANCE Engineer</option>
                <option value="ACCOUNTANT">ACCOUNTANT / Controller</option>
                <option value="STOREKEEPER">STOREKEEPER</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
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
                <option value="MAINTENANCE_ENGINEERING">Maintenance & Eng</option>
                <option value="EXECUTIVE">Executive Suite</option>
                <option value="HUMAN_RESOURCES_SECURITY">HR & Security</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Quick PIN
              </label>
              <input
                type="text"
                maxLength={4}
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                style={{ width: '100%', textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
              />
            </div>
          </div>

          <div style={{
            background: 'var(--brand-bg)',
            border: '1px solid var(--brand-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            fontSize: '0.75rem',
            color: 'var(--brand-primary)',
          }}>
            ℹ️ <strong>Instant Login Access:</strong> This staff member will be saved in MongoDB Atlas. They can immediately log in on the login page using <strong>{email || 'their email'}</strong> and password <strong>{password}</strong> without any OTP.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Saving to Database...' : 'Save & Onboard Staff'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
