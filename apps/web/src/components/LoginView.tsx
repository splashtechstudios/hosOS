'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  Lock, 
  Mail, 
  KeyRound, 
  UserPlus, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle,
  CheckCircle2,
  Database,
  Sparkles,
  Users
} from 'lucide-react';
import { StaffUser, UserRole } from '@hosos/types';
import { useFeedback } from '@/context/FeedbackContext';
import { SEEDED_ACCOUNTS } from '@/lib/seededAccounts';
import { ENTERPRISE_ORG } from '@/lib/mockData';

interface LoginViewProps {
  onLoginSuccess: (user: StaffUser) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const { showConfirm, showSuccess, showFailed, showToast } = useFeedback();
  const [mode, setMode] = useState<'LOGIN' | 'CREATE_ADMIN'>('LOGIN');

  // Login form state
  const [email, setEmail] = useState('admin@osiekaresort.ng');
  const [password, setPassword] = useState('Admin123!');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Create Admin form state
  const [adminName, setAdminName] = useState('Alhaji Ibrahim Danjuma');
  const [adminEmail, setAdminEmail] = useState('owner@osiekaresort.ng');
  const [adminPassword, setAdminPassword] = useState('OwnerSecure2026!');
  const [adminPin, setAdminPin] = useState('1001');

  // Seed status state
  const [seedStatus, setSeedStatus] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed');
      }

        showToast({
          type: 'success',
          title: 'Authenticated Successfully',
          message: `Signed in as ${data.user.name} (${data.user.role.replace(/_/g, ' ')}).`
        });

        onLoginSuccess({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role as UserRole,
          department: data.user.department as any,
          pinCodeHash: data.user.pinCode,
          isActive: true,
          createdAt: new Date().toISOString(),
        });
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check credentials.');
      showFailed(
        'Authentication Failed',
        err.message || 'Incorrect password or account not found in MongoDB Atlas. No OTP is required.',
        'Use one of the instant role accounts below or create Super Admin.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: adminName,
          email: adminEmail,
          password: adminPassword,
          pinCode: adminPin,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create Super Admin');
      }

      showSuccess(
        'Super Admin Initialized Successfully!',
        `${data.user.name} registered as Super Admin in MongoDB Atlas. Access granted.`,
        `Email: ${data.user.email} • Role: OWNER • Quick PIN: ${data.user.pinCode}`
      );

      onLoginSuccess({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: 'OWNER',
        department: 'EXECUTIVE',
        pinCodeHash: data.user.pinCode,
        isActive: true,
        createdAt: new Date().toISOString(),
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not create Admin account');
      showFailed('Super Admin Creation Failed', err.message || 'Could not register admin in MongoDB Atlas.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeedAllRoles = () => {
    showConfirm(
      'Confirm MongoDB Atlas Role Seeding',
      'Seed all 11 default resort roles into MongoDB Atlas? This will update passwords and enable 1-click login for all staff.',
      async () => {
        setSeedStatus('Seeding roles into MongoDB Atlas...');
        try {
          const res = await fetch('/api/auth/seed', { method: 'POST' });
          const data = await res.json();
          if (data.success) {
            setSeedStatus(`✓ Successfully seeded ${data.users.length} staff roles into MongoDB Atlas!`);
            showSuccess(
              'Roles Seeded Successfully!',
              `Seeded ${data.users.length} staff roles into MongoDB Atlas cluster.`,
              'All 11 accounts are active and can sign in without OTP.'
            );
          } else {
            setSeedStatus(`⚠️ Seed error: ${data.error}`);
            showFailed('Database Seed Failed', data.error);
          }
        } catch (err: any) {
          setSeedStatus(`⚠️ Connection error: ${err.message}`);
          showFailed('MongoDB Connection Error', err.message);
        }
      },
      {
        confirmText: 'Seed Database Now',
        variant: 'primary'
      }
    );
  };

  const handleQuickRoleFill = (acc: typeof SEEDED_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setMode('LOGIN');
    // Immediate login
    setTimeout(() => {
      onLoginSuccess({
        id: `staff-${acc.role.toLowerCase()}`,
        name: acc.name,
        email: acc.email,
        role: acc.role as UserRole,
        department: acc.department as any,
        pinCodeHash: acc.pinCode,
        isActive: true,
        createdAt: new Date().toISOString(),
      });
    }, 100);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px 20px',
    }}>
      
      {/* Container Card */}
      <div style={{ width: '100%', maxWidth: '980px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--brand-primary)',
            color: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
            marginBottom: '12px',
          }}>
            <Building2 size={28} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            HosOS Enterprise Portal
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {ENTERPRISE_ORG.name} • {ENTERPRISE_ORG.registrationNumber} • Lekki Phase 1, Lagos
          </p>
        </div>

        {/* Main Grid: Login Box + Seed Accounts Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '20px', alignItems: 'stretch' }}>
          
          {/* Left Column: Form Box */}
          <div className="ent-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              {/* Tab Switcher: Login vs Create Admin */}
              <div style={{
                display: 'flex',
                backgroundColor: 'var(--bg-secondary)',
                padding: '3px',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '20px',
              }}>
                <button
                  type="button"
                  onClick={() => { setMode('LOGIN'); setErrorMsg(null); }}
                  style={{
                    flex: 1,
                    padding: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    borderRadius: '4px',
                    backgroundColor: mode === 'LOGIN' ? '#FFFFFF' : 'transparent',
                    color: mode === 'LOGIN' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                    boxShadow: mode === 'LOGIN' ? 'var(--shadow-subtle)' : 'none',
                  }}
                >
                  Staff Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('CREATE_ADMIN'); setErrorMsg(null); }}
                  style={{
                    flex: 1,
                    padding: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    borderRadius: '4px',
                    backgroundColor: mode === 'CREATE_ADMIN' ? '#FFFFFF' : 'transparent',
                    color: mode === 'CREATE_ADMIN' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                    boxShadow: mode === 'CREATE_ADMIN' ? 'var(--shadow-subtle)' : 'none',
                  }}
                >
                  Create Admin
                </button>
              </div>

              {errorMsg && (
                <div style={{
                  padding: '10px 14px',
                  backgroundColor: 'var(--rose-bg)',
                  border: '1px solid var(--rose-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--rose-primary)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <AlertCircle size={15} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Login Mode Form */}
              {mode === 'LOGIN' && (
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Official Staff Email Address
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. admin@osiekaresort.ng"
                        required
                        style={{ width: '100%', paddingLeft: '34px' }}
                      />
                      <Mail size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Password (No OTP Required)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', paddingLeft: '34px' }}
                      />
                      <Lock size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Direct instant sign-in without OTP SMS delays.
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '10px', marginTop: '6px' }}
                  >
                    <span>{isLoading ? 'Authenticating...' : 'Sign In to Enterprise Portal'}</span>
                    <ArrowRight size={15} />
                  </button>
                </form>
              )}

              {/* Create Admin Mode Form */}
              {mode === 'CREATE_ADMIN' && (
                <form onSubmit={handleCreateAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Full Legal Name
                    </label>
                    <input
                      type="text"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      required
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Admin Email Address
                    </label>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      required
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 100px', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        Password
                      </label>
                      <input
                        type="password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        required
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        Quick PIN
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        value={adminPin}
                        onChange={(e) => setAdminPin(e.target.value)}
                        style={{ width: '100%', textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '10px', marginTop: '6px' }}
                  >
                    <span>{isLoading ? 'Creating Super Admin...' : 'Create Super Admin & Sign In'}</span>
                    <ShieldCheck size={16} />
                  </button>
                </form>
              )}
            </div>

            {/* Bottom info */}
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              Connected to MongoDB Atlas cluster0.8nmwbry.mongodb.net
            </div>
          </div>

          {/* Right Column: Pre-Seeded Staff Role Accounts for Instant Login */}
          <div className="ent-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Seeded Role Accounts (Instant 1-Click Login)
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Click any staff role below to sign in instantly with their verified credentials:
                </p>
              </div>

              <button
                type="button"
                onClick={handleSeedAllRoles}
                className="btn-secondary"
                style={{ fontSize: '0.75rem', padding: '5px 10px', gap: '4px' }}
                title="Sync and seed all 11 roles to MongoDB Atlas"
              >
                <Database size={13} color="var(--emerald-primary)" />
                <span>Seed Atlas DB</span>
              </button>
            </div>

            {seedStatus && (
              <div style={{
                padding: '8px 12px',
                backgroundColor: 'var(--brand-bg)',
                border: '1px solid var(--brand-border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                color: 'var(--brand-primary)',
                fontWeight: 600,
                marginBottom: '10px',
              }}>
                {seedStatus}
              </div>
            )}

            {/* Scrollable Role Grid */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              maxHeight: '440px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              paddingRight: '4px',
            }}>
              {SEEDED_ACCOUNTS.map((acc) => (
                <div
                  key={acc.email}
                  onClick={() => handleQuickRoleFill(acc)}
                  className="ent-card-interactive"
                  style={{
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {acc.name}
                      </span>
                      <span className="badge badge-purple" style={{ fontSize: '0.625rem' }}>
                        {acc.role.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {acc.email} • Pass: <strong>{acc.password}</strong> • PIN: <strong>{acc.pinCode}</strong>
                    </div>
                  </div>

                  <span style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    Login →
                  </span>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
