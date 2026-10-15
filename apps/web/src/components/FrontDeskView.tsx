'use client';

import React, { useState } from 'react';
import { Room, StaffUser } from '@hosos/types';
import { Hotel, UserPlus, CheckCircle2, ShieldCheck, CreditCard, Search, Calendar, KeyRound } from 'lucide-react';

interface FrontDeskViewProps {
  rooms: Room[];
  onSelectRoomForAudit: (room: Room) => void;
  activeStaff: StaffUser;
}

export default function FrontDeskView({
  rooms,
  onSelectRoomForAudit,
  activeStaff,
}: FrontDeskViewProps) {
  const [filterFloor, setFilterFloor] = useState<number | 'ALL'>('ALL');

  const filteredRooms = rooms.filter(r => {
    if (filterFloor === 'ALL') return true;
    return r.floor === filterFloor;
  });

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px 0' }}>
      
      {/* Header Banner */}
      <div className="ent-card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Hotel size={24} color="var(--brand-primary)" />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Front Desk Operations & Tape Chart Board
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', marginTop: '4px' }}>
              Real-time room occupancy grid, keycard management, and consolidated guest folio monitors.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { id: 'ALL', label: 'All Floors' },
              { id: 1, label: 'Floor 1 (Ground)' },
              { id: 2, label: 'Floor 2 (Deluxe)' },
              { id: 3, label: 'Floor 3 (Penthouse)' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterFloor(f.id as any)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  backgroundColor: filterFloor === f.id ? 'var(--brand-primary)' : 'var(--bg-secondary)',
                  color: filterFloor === f.id ? '#FFFFFF' : 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Room Status Tape Chart Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px',
      }}>
        {filteredRooms.map((room) => {
          let statusBadgeClass = 'badge badge-clean';
          let statusText = 'Vacant Clean';

          if (room.status === 'OCCUPIED') {
            statusBadgeClass = 'badge badge-brand';
            statusText = 'Occupied';
          } else if (room.status === 'VACANT_DIRTY') {
            statusBadgeClass = 'badge badge-dirty';
            statusText = 'Vacant Dirty';
          } else if (room.status === 'MAINTENANCE' || room.status === 'OUT_OF_ORDER') {
            statusBadgeClass = 'badge badge-maintenance';
            statusText = 'Maintenance';
          }

          return (
            <div 
              key={room.id}
              className="ent-card-interactive"
              style={{ padding: '20px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                    Room #{room.roomNumber}
                  </span>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {room.roomTypeName} • Floor {room.floor}
                  </div>
                </div>
                <span className={statusBadgeClass}>{statusText}</span>
              </div>

              {room.currentGuestName ? (
                <div style={{
                  background: 'var(--brand-bg)',
                  border: '1px solid var(--brand-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px',
                  marginBottom: '14px',
                }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--brand-primary)', textTransform: 'uppercase', fontWeight: 700 }}>
                    In-House Guest
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                    👤 {room.currentGuestName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                    Active Folio: {room.currentFolioId || '#FOL-204-89'}
                  </div>
                </div>
              ) : (
                <div style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px',
                  marginBottom: '14px',
                }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Standard Rack Rate
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    {formatNaira(room.rackRatePerNight)} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>/ night</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {room.lastCleanedAt ? `Cleaned by ${room.lastCleanedByStaffName}` : 'Ready for reservation'}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <button
                onClick={() => onSelectRoomForAudit(room)}
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem' }}
              >
                <ShieldCheck size={14} color="var(--brand-primary)" />
                <span>Open 360° Internal Audit</span>
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
}
