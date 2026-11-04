'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2, Home, ShieldCheck } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
  showHomeButton?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('HosOS Workspace ErrorBoundary caught an exception:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  handleClearCacheAndReload = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('hosos_custom_rbac_matrix_v2');
        localStorage.removeItem('hosos_user_permission_overrides');
        localStorage.removeItem('hosos_reservations_cache');
        localStorage.removeItem('hosos_active_user');
        localStorage.removeItem('hosos_sidebar_visible');
        sessionStorage.clear();
      } catch (e) {
        console.warn('Could not clear local storage:', e);
      }
      window.location.reload();
    }
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '380px',
          width: '100%',
        }}>
          <div className="ent-card" style={{
            maxWidth: '580px',
            width: '100%',
            padding: '32px 28px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-lg)',
            borderTop: '4px solid var(--danger-primary)',
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#FEF2F2',
              color: 'var(--danger-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              border: '1.5px solid #FECACA',
            }}>
              <AlertTriangle size={28} />
            </div>

            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginBottom: '8px',
              letterSpacing: '-0.02em',
            }}>
              {this.props.fallbackTitle || 'Component Discrepancy Protected'}
            </h3>

            <p style={{
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              marginBottom: '16px',
            }}>
              HosOS isolated an unexpected state discrepancy. Your active staff session and MongoDB database remain protected.
            </p>

            {this.state.error?.message && (
              <div style={{
                padding: '10px 14px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--rose-primary)',
                textAlign: 'left',
                marginBottom: '20px',
                overflowX: 'auto',
                maxHeight: '100px',
              }}>
                {this.state.error.message}
              </div>
            )}

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              flexWrap: 'wrap',
            }}>
              <button
                type="button"
                onClick={this.handleReload}
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.8rem', gap: '6px' }}
              >
                <RefreshCw size={14} />
                <span>Reload Workspace</span>
              </button>

              {this.props.onReset && (
                <button
                  type="button"
                  onClick={this.handleReset}
                  className="btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '0.8rem', gap: '6px' }}
                >
                  <Home size={14} />
                  <span>Return to Command Hub</span>
                </button>
              )}

              <button
                type="button"
                onClick={this.handleClearCacheAndReload}
                className="btn-ghost"
                style={{
                  padding: '8px 14px',
                  fontSize: '0.78rem',
                  color: 'var(--rose-primary)',
                  gap: '6px',
                  border: '1px solid #FECACA',
                  backgroundColor: '#FFF5F5',
                }}
                title="Clears stale local storage tokens and reloads"
              >
                <Trash2 size={13} />
                <span>Clear Local Cache &amp; Reload</span>
              </button>
            </div>

            <div style={{
              marginTop: '20px',
              paddingTop: '14px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
            }}>
              <ShieldCheck size={14} color="var(--emerald-primary)" />
              <span>Session &amp; Database Integrity Preserved</span>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
