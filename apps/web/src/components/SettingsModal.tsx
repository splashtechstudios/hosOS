'use client';

import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Building2,
  CheckCircle2,
  X,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Sun,
  Flame,
  Zap,
} from 'lucide-react';
import { useFeedback } from '@/context/FeedbackContext';
import {
  getEnableBlocksSetting,
  setEnableBlocksSetting,
} from '@/lib/systemSettings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoomsRefreshed?: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  onRoomsRefreshed,
}: SettingsModalProps) {
  const { showToast, showConfirm, showSuccess } = useFeedback();
  const [enableBlocks, setEnableBlocks] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEnableBlocks(getEnableBlocksSetting());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleBlocks = (newVal: boolean) => {
    setEnableBlocks(newVal);
    setEnableBlocksSetting(newVal);
    showToast({
      type: 'info',
      title: newVal ? 'Blocks Hierarchy Enabled' : 'Blocks Organization Disabled',
      message: newVal
        ? 'Room Blocks (A1, B1, etc.) are now active across inventory filters and room builders.'
        : 'Blocks disabled. Rooms can now be named freely without required block prefixes.',
    });
    if (onRoomsRefreshed) onRoomsRefreshed();
  };

  const handleCleanAllBlocks = async () => {
    showConfirm(
      'Clean Up All Blocks Now?',
      'This will remove all "Block A1", "Wing A", "Block B" prefixes from every room in your database, leaving clean names like "Room 1", "Room 2", etc. Continue?',
      async () => {
        try {
          setIsCleaning(true);
          const res = await fetch('/api/rooms', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'cleanAllBlocks' }),
          });
          const data = await res.json();
          if (data.success) {
            // Also clean room meta in localStorage
            try {
              const meta = JSON.parse(localStorage.getItem('hosos_room_meta') || '{}');
              const cleanMeta: Record<string, any> = {};
              for (const [k, v] of Object.entries(meta)) {
                const cleanKey = k.replace(/^(?:Block\s+[A-Za-z0-9]+\s+|Wing\s+[A-Za-z0-9]+\s+|Villa\s+Wing\s+)/i, '').trim();
                cleanMeta[cleanKey] = v;
              }
              localStorage.setItem('hosos_room_meta', JSON.stringify(cleanMeta));
            } catch (_) {}

            showSuccess('Rooms Cleaned', 'All block prefixes removed! Rooms are now cleanly named.');
            if (onRoomsRefreshed) onRoomsRefreshed();
          } else {
            showToast({ type: 'error', title: 'Error', message: data.error || 'Failed to clean blocks.' });
          }
        } catch (err: any) {
          showToast({ type: 'error', title: 'Error', message: err.message || 'Network error.' });
        } finally {
          setIsCleaning(false);
        }
      }
    );
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-modal)',
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--bg-secondary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sliders size={20} color="var(--brand-primary)" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Architecture &amp; System Settings
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Configure resort property topology, block naming, and power telemetry
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              padding: '6px',
              borderRadius: '8px',
              cursor: 'pointer',
              color: 'var(--text-muted)',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Setting 1: Enable Blocks Organization */}
          <div
            style={{
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              backgroundColor: enableBlocks ? '#EFF6FF' : 'var(--bg-primary)',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Building2 size={16} color={enableBlocks ? 'var(--brand-primary)' : 'var(--text-secondary)'} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Room Blocks Hierarchy (Block A, B, C)
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  {enableBlocks
                    ? 'Active: Rooms are grouped into designated wings/blocks (e.g. Block A1, Block B1). Turn this off if your property only uses direct room numbers (e.g. Room 1, Room 2).'
                    : 'Disabled: Room numbers operate directly without forced block prefixes (e.g. "Room 1", "Room 2"). Clean and simple for standard boutique resorts.'}
                </p>
              </div>

              {/* iOS-style toggle */}
              <button
                type="button"
                onClick={() => handleToggleBlocks(!enableBlocks)}
                style={{
                  width: '50px',
                  height: '28px',
                  borderRadius: '14px',
                  backgroundColor: enableBlocks ? 'var(--brand-primary)' : '#CBD5E1',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  flexShrink: 0,
                  transition: 'background-color 0.2s ease',
                  padding: '2px',
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '12px',
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    transform: enableBlocks ? 'translateX(22px)' : 'translateX(0)',
                    transition: 'transform 0.2s ease',
                  }}
                />
              </button>
            </div>
          </div>

          {/* Setting 2: One-Click Strip Blocks Utility */}
          <div
            style={{
              padding: '16px',
              borderRadius: '12px',
              border: '1px dashed var(--border-color)',
              backgroundColor: 'var(--bg-secondary)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Sparkles size={16} color="var(--amber-primary)" />
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Strip Block Prefixes from Inventory
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Normalize "Block A1 Room 1" → "Room 1" across all database records and cache.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCleanAllBlocks}
                disabled={isCleaning}
                className="btn-secondary"
                style={{
                  fontSize: '0.78rem',
                  padding: '8px 14px',
                  borderColor: 'var(--amber-primary)',
                  color: 'var(--amber-primary)',
                  fontWeight: 700,
                }}
              >
                <RefreshCw size={13} className={isCleaning ? 'animate-spin' : ''} />
                <span>{isCleaning ? 'Cleaning...' : 'Clean Up All Blocks Now'}</span>
              </button>
            </div>
          </div>

          {/* Property System Context Banner */}
          <div
            style={{
              padding: '14px 16px',
              borderRadius: '10px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <ShieldCheck size={20} color="var(--emerald-primary)" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              <strong>HosOS Core Engine:</strong> Changes are saved to local persistent storage and synchronized with your enterprise role configuration.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'flex-end',
            backgroundColor: 'var(--bg-secondary)',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="btn-primary"
            style={{ padding: '8px 20px', fontSize: '0.825rem' }}
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
}
