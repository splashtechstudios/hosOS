'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  AlertTriangle,
  X,
  ArrowRight,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export type FeedbackType = 'SUCCESS' | 'FAILED' | 'CONFIRM' | 'INFO';

export interface FeedbackModalOptions {
  type: FeedbackType;
  title: string;
  message: string;
  details?: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'danger' | 'warning' | 'emerald';
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

export interface ToastOptions {
  id?: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  duration?: number;
}

interface FeedbackContextType {
  showModal: (options: FeedbackModalOptions) => void;
  showSuccess: (title: string, message: string, details?: string | ReactNode) => void;
  showFailed: (title: string, message: string, details?: string | ReactNode) => void;
  showConfirm: (
    title: string,
    message: string,
    onConfirm: () => void | Promise<void>,
    options?: Partial<FeedbackModalOptions>
  ) => void;
  showToast: (options: ToastOptions) => void;
  closeModal: () => void;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [modalOptions, setModalOptions] = useState<FeedbackModalOptions | null>(null);
  const [toasts, setToasts] = useState<ToastOptions[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showModal = (options: FeedbackModalOptions) => {
    setModalOptions(options);
  };

  const closeModal = () => {
    if (modalOptions?.onCancel) {
      modalOptions.onCancel();
    }
    setModalOptions(null);
    setIsSubmitting(false);
  };

  const showSuccess = (title: string, message: string, details?: string | ReactNode) => {
    setModalOptions({
      type: 'SUCCESS',
      title,
      message,
      details,
      confirmText: 'Great, Continue',
      variant: 'emerald',
    });
  };

  const showFailed = (title: string, message: string, details?: string | ReactNode) => {
    setModalOptions({
      type: 'FAILED',
      title,
      message,
      details,
      confirmText: 'Dismiss',
      variant: 'danger',
    });
  };

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void | Promise<void>,
    options?: Partial<FeedbackModalOptions>
  ) => {
    setModalOptions({
      type: 'CONFIRM',
      title,
      message,
      onConfirm,
      confirmText: options?.confirmText || 'Yes, Confirm',
      cancelText: options?.cancelText || 'Cancel',
      variant: options?.variant || 'primary',
      details: options?.details,
    });
  };

  const showToast = ({ type, title, message, duration = 4000 }: ToastOptions) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast = { id, type, title, message, duration };
    setToasts(prev => [newToast, ...prev]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleConfirm = async () => {
    if (modalOptions?.onConfirm) {
      setIsSubmitting(true);
      try {
        await modalOptions.onConfirm();
      } finally {
        setIsSubmitting(false);
        setModalOptions(null);
      }
    } else {
      setModalOptions(null);
    }
  };

  const getIcon = (type: FeedbackType, variant?: string) => {
    switch (type) {
      case 'SUCCESS':
        return (
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            backgroundColor: 'var(--emerald-bg)',
            color: 'var(--emerald-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 0 8px rgba(16, 185, 129, 0.12)',
          }}>
            <CheckCircle2 size={30} strokeWidth={2.5} />
          </div>
        );
      case 'FAILED':
        return (
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            backgroundColor: 'var(--rose-bg)',
            color: 'var(--rose-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 0 8px rgba(239, 68, 68, 0.12)',
          }}>
            <AlertCircle size={30} strokeWidth={2.5} />
          </div>
        );
      case 'CONFIRM':
        if (variant === 'danger') {
          return (
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: 'var(--rose-bg)',
              color: 'var(--rose-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 0 8px rgba(239, 68, 68, 0.12)',
            }}>
              <AlertTriangle size={28} strokeWidth={2.2} />
            </div>
          );
        }
        return (
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            backgroundColor: 'var(--brand-bg)',
            color: 'var(--brand-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 0 8px rgba(37, 99, 235, 0.12)',
          }}>
            <HelpCircle size={28} strokeWidth={2.2} />
          </div>
        );
      default:
        return (
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            backgroundColor: 'var(--brand-bg)',
            color: 'var(--brand-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Sparkles size={28} />
          </div>
        );
    }
  };

  return (
    <FeedbackContext.Provider
      value={{
        showModal,
        showSuccess,
        showFailed,
        showConfirm,
        showToast,
        closeModal,
      }}
    >
      {children}

      {/* Global Confirmation / Success / Failed Pop-Up Modal */}
      {modalOptions && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(5px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.15s ease-out',
          }}
          onClick={closeModal}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              width: '100%',
              maxWidth: '480px',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-modal)',
              border: '1px solid var(--border-color)',
              overflow: 'hidden',
              animation: 'scaleIn 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close Icon */}
            <button
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                color: 'var(--text-muted)',
                padding: '4px',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={18} />
            </button>

            {/* Modal Body */}
            <div style={{ padding: '32px 28px 24px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              
              {/* Icon Banner */}
              <div style={{ marginBottom: '18px' }}>
                {getIcon(modalOptions.type, modalOptions.variant)}
              </div>

              {/* Title */}
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                lineHeight: 1.3,
                marginBottom: '8px',
              }}>
                {modalOptions.title}
              </h3>

              {/* Message */}
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                maxWidth: '400px',
                marginBottom: modalOptions.details ? '16px' : '0',
              }}>
                {modalOptions.message}
              </p>

              {/* Optional Details Callout Box */}
              {modalOptions.details && (
                <div style={{
                  width: '100%',
                  marginTop: '12px',
                  padding: '12px 14px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.8125rem',
                  color: 'var(--text-primary)',
                  textAlign: 'left',
                  lineHeight: 1.4,
                  wordBreak: 'break-word',
                }}>
                  {modalOptions.details}
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div style={{
              padding: '16px 28px 20px 28px',
              backgroundColor: 'var(--bg-subtle)',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end',
            }}>
              {/* Cancel Button (only for CONFIRM) */}
              {modalOptions.type === 'CONFIRM' && (
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '9px 16px', fontSize: '0.85rem' }}
                >
                  {modalOptions.cancelText || 'Cancel'}
                </button>
              )}

              {/* Confirm / Continue Button */}
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSubmitting}
                className={
                  modalOptions.variant === 'danger'
                    ? 'btn-primary'
                    : modalOptions.variant === 'emerald'
                    ? 'btn-primary'
                    : 'btn-primary'
                }
                style={{
                  flex: 1,
                  padding: '9px 16px',
                  fontSize: '0.85rem',
                  backgroundColor:
                    modalOptions.variant === 'danger'
                      ? 'var(--rose-primary)'
                      : modalOptions.variant === 'emerald'
                      ? 'var(--emerald-primary)'
                      : 'var(--brand-primary)',
                }}
              >
                {isSubmitting ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Processing...</span>
                  </span>
                ) : (
                  <span>{modalOptions.confirmText || 'Proceed'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Floating Toast Container (Bottom-Right) */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 1100,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '380px',
        width: '100%',
        pointerEvents: 'none',
      }}>
        {toasts.map(t => (
          <div
            key={t.id}
            style={{
              pointerEvents: 'auto',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-dropdown)',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              animation: 'slideInRight 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              borderLeft:
                t.type === 'success'
                  ? '4px solid var(--emerald-primary)'
                  : t.type === 'error'
                  ? '4px solid var(--rose-primary)'
                  : t.type === 'warning'
                  ? '4px solid var(--amber-primary)'
                  : '4px solid var(--brand-primary)',
            }}
          >
            <div style={{ marginTop: '2px' }}>
              {t.type === 'success' && <CheckCircle2 size={18} color="var(--emerald-primary)" />}
              {t.type === 'error' && <AlertCircle size={18} color="var(--rose-primary)" />}
              {t.type === 'warning' && <AlertTriangle size={18} color="var(--amber-primary)" />}
              {t.type === 'info' && <Sparkles size={18} color="var(--brand-primary)" />}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              {t.title && (
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                  {t.title}
                </div>
              )}
              <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {t.message}
              </div>
            </div>

            <button
              onClick={() => t.id && removeToast(t.id)}
              style={{
                background: 'transparent',
                color: 'var(--text-muted)',
                padding: '2px',
                borderRadius: '4px',
              }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
}
