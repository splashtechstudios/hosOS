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
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Hotel size={24} color="var(--gold-primary)" />
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                Front Desk Operations & Tape Chart Board
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
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
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  backgroundColor: filterFloor === f.id ? 'var(--gold-primary)' : 'rgba(255,255,255,0.05)',
                  color: filterFloor === f.id ? '#060A13' : 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
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
          let statusColor = 'var(--emerald-primary)';
          let statusBadgeClass = 'badge badge-clean';
          let statusText = 'Vacant Clean';

          if (room.status === 'OCCUPIED') {
            statusColor = 'var(--sky-primary)';
            statusBadgeClass = 'badge badge-occupied';
            statusText = 'Occupied';
          } else if (room.status === 'VACANT_DIRTY') {
            statusColor = 'var(--amber-primary)';
            statusBadgeClass = 'badge badge-dirty';
            statusText = 'Vacant Dirty';
          } else if (room.status === 'MAINTENANCE' || room.status === 'OUT_OF_ORDER') {
            statusColor = 'var(--rose-primary)';
            statusBadgeClass = 'badge badge-maintenance';
            statusText = 'Maintenance';
          }

          return (
            <div 
              key={room.id}
              className="glass-card-interactive"
              style={{ padding: '20px', borderTop: `4px solid ${statusColor}` }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#FFF' }}>
                    Room {room.roomNumber}
                  </span>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {room.roomTypeName} • Floor {room.floor}
                  </div>
                </div>
                <span className={statusBadgeClass}>{statusText}</span>
              </div>

              {room.currentGuestName ? (
                <div style={{
                  background: 'rgba(56, 189, 248, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px',
                  marginBottom: '14px',
                }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    In-House Guest
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFF', marginTop: '2px' }}>
                    👤 {room.currentGuestName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--sky-primary)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                    Folio: {room.currentFolioId || '#FOL-204-89'}
                  </div>
                </div>
              ) : (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px',
                  marginBottom: '14px',
                }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Standard Rack Rate
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--gold-primary)', fontFamily: 'var(--font-mono)' }}>
                    {formatNaira(room.rackRatePerNight)} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>/ night</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {room.lastCleanedAt ? `Cleaned at 11:30 by ${room.lastCleanedByStaffName}` : 'Ready for reservation'}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => onSelectRoomForAudit(room)}
                  className="btn-gold"
                  style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem', padding: '8px 12px' }}
                >
                  <ShieldCheck size={14} />
                  <span>View 360° Internal Audit</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
