'use client';

import React, { useState } from 'react';
import { Room, StaffUser } from '@hosos/types';
import { useFeedback } from '@/context/FeedbackContext';
import {
  Hotel,
  UserPlus,
  LogOut,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Search,
  Calendar,
  KeyRound,
  Download,
  Sparkles,
  Wrench,
  Clock,
  Plus
} from 'lucide-react';

interface FrontDeskViewProps {
  rooms: Room[];
  onSelectRoomForAudit: (room: Room) => void;
  activeStaff: StaffUser;
  onOpenCheckIn: (room: Room) => void;
  onOpenCheckOut: (room: Room) => void;
  onOpenNewReservation: () => void;
  onRefreshRooms: () => void;
}

export default function FrontDeskView({
  rooms,
  onSelectRoomForAudit,
  activeStaff,
  onOpenCheckIn,
  onOpenCheckOut,
  onOpenNewReservation,
  onRefreshRooms,
}: FrontDeskViewProps) {
  const { showConfirm, showSuccess, showFailed } = useFeedback();
  const [filterFloor, setFilterFloor] = useState<number | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRooms = rooms.filter(r => {
    if (filterFloor !== 'ALL' && r.floor !== filterFloor) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const numMatch = r.roomNumber.toLowerCase().includes(q);
      const nameMatch = r.currentGuestName?.toLowerCase().includes(q);
      const typeMatch = r.roomTypeName.toLowerCase().includes(q);
      return numMatch || nameMatch || typeMatch;
    }
    return true;
  });

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const occupiedCount = rooms.filter(r => r.status === 'OCCUPIED').length;
  const cleanCount = rooms.filter(r => r.status === 'VACANT_CLEAN').length;
  const dirtyCount = rooms.filter(r => r.status === 'VACANT_DIRTY').length;
  const maintCount = rooms.filter(r => r.status === 'MAINTENANCE' || r.status === 'OUT_OF_ORDER').length;
  const occupancyPercentage = rooms.length > 0 ? Math.round((occupiedCount / rooms.length) * 100) : 0;

  // Mark room clean action for VACANT_DIRTY rooms
  const handleMarkRoomClean = (room: Room) => {
    showConfirm(
      `Confirm Housekeeping Inspection: Room #${room.roomNumber}`,
      `Confirm that Housekeeping has sanitized, inspected, and made Room #${room.roomNumber} ready for guest arrival?`,
      async () => {
        try {
          const res = await fetch('/api/rooms', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              roomNumber: room.roomNumber,
              newStatus: 'VACANT_CLEAN',
              notes: `Inspected & sanitized by ${activeStaff.name} (${activeStaff.role}). Ready for guest arrival.`,
              staff: activeStaff,
            }),
          });
          const data = await res.json();
          if (data.success) {
            showSuccess(
              'Room Ready for Check-In!',
              `Room #${room.roomNumber} transitioned to VACANT_CLEAN.`,
              `Housekeeping turnaround signed off by ${activeStaff.name}. Logged to internal audit trail.`
            );
            onRefreshRooms();
          } else {
            showFailed('Housekeeping Update Failed', data.error || 'Server error occurred');
          }
        } catch (err: any) {
          showFailed('Network Error', err.message || 'Could not update room status');
        }
      },
      {
        confirmText: 'Mark Vacant Clean',
        variant: 'emerald',
        details: `Room #${room.roomNumber} (${room.roomTypeName}) | Inspector: ${activeStaff.name}`
      }
    );
  };

  const handleDownloadTapeChart = () => {
    window.open('/api/reports/export?type=TAX_SCHEDULE', '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px 0' }}>
      
      {/* 1. Header Banner with Actions */}
      <div className="ent-card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Hotel size={24} color="var(--brand-primary)" />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Front Desk Operations & Tape Chart Board
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', marginTop: '4px' }}>
              Real-time room occupancy grid, express check-in, folio reconciliation, and consolidated tape chart.
            </p>
          </div>

          {/* Action Buttons: New Reservation & Download Report */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={onOpenNewReservation}
              className="btn-primary"
              style={{ fontSize: '0.85rem' }}
            >
              <Plus size={16} />
              <span>New Reservation</span>
            </button>

            <button
              onClick={handleDownloadTapeChart}
              className="btn-secondary"
              style={{ fontSize: '0.85rem' }}
              title="Download FIRS Tax Schedule & Occupancy Ledger"
            >
              <Download size={15} color="var(--brand-primary)" />
              <span>Export Tax Schedule</span>
            </button>
          </div>
        </div>

        {/* 2. Room Status Breakdown Metrics Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '12px',
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-color)',
        }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Occupancy</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brand-primary)', fontFamily: 'var(--font-mono)' }}>
              {occupancyPercentage}%
            </div>
          </div>

          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--emerald-primary)', fontWeight: 700, textTransform: 'uppercase' }}>Vacant Clean</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--emerald-primary)', fontFamily: 'var(--font-mono)' }}>
              {cleanCount} Rooms
            </div>
          </div>

          <div style={{ background: 'var(--brand-bg)', border: '1px solid var(--brand-border)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--brand-primary)', fontWeight: 700, textTransform: 'uppercase' }}>Occupied</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brand-primary)', fontFamily: 'var(--font-mono)' }}>
              {occupiedCount} Rooms
            </div>
          </div>

          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--amber-primary)', fontWeight: 700, textTransform: 'uppercase' }}>Vacant Dirty</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--amber-primary)', fontFamily: 'var(--font-mono)' }}>
              {dirtyCount} Rooms
            </div>
          </div>

          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--danger-primary)', fontWeight: 700, textTransform: 'uppercase' }}>Maintenance</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--danger-primary)', fontFamily: 'var(--font-mono)' }}>
              {maintCount} Rooms
            </div>
          </div>
        </div>

        {/* 3. Filter and Search Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
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
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: filterFloor === f.id ? 'var(--brand-primary)' : 'var(--bg-secondary)',
                  color: filterFloor === f.id ? '#FFFFFF' : 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', width: '240px' }}>
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '9px' }} />
            <input
              type="text"
              placeholder="Search room or guest..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ent-input"
              style={{ width: '100%', paddingLeft: '30px', fontSize: '0.75rem' }}
            />
          </div>
        </div>
      </div>

      {/* 4. Room Status Tape Chart Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
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
              style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
              <div>
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

                {room.status === 'OCCUPIED' ? (
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
                      👤 {room.currentGuestName || 'Chief Emeka Nwosu'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                      Active Folio: {room.currentFolioId || `FOL-2026-${room.roomNumber}`}
                    </div>
                  </div>
                ) : room.status === 'VACANT_DIRTY' ? (
                  <div style={{
                    background: '#FFFBEB',
                    border: '1px solid #FDE68A',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px',
                    marginBottom: '14px',
                  }}>
                    <div style={{ fontSize: '0.7rem', color: '#92400E', textTransform: 'uppercase', fontWeight: 700 }}>
                      Housekeeping Required
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#92400E', marginTop: '2px' }}>
                      Pending linen change & sanitization
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#B45309', marginTop: '4px' }}>
                      Rack Rate: {formatNaira(room.rackRatePerNight)}/night
                    </div>
                  </div>
                ) : room.status === 'MAINTENANCE' || room.status === 'OUT_OF_ORDER' ? (
                  <div style={{
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px',
                    marginBottom: '14px',
                  }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--danger-primary)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Engineering Down
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--danger-primary)', marginTop: '2px' }}>
                      Active Work Order in progress
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Room blocked from reservation
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
                    <div style={{ fontSize: '0.75rem', color: 'var(--emerald-primary)', marginTop: '4px', fontWeight: 600 }}>
                      ✓ Cleaned & inspected by housekeeping
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons based on room state */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                {room.status === 'VACANT_CLEAN' && (
                  <button
                    onClick={() => onOpenCheckIn(room)}
                    className="btn-primary"
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      backgroundColor: 'var(--emerald-primary)',
                      borderColor: 'var(--emerald-primary)',
                    }}
                  >
                    <UserPlus size={14} />
                    <span>Check-In Guest</span>
                  </button>
                )}

                {room.status === 'OCCUPIED' && (
                  <button
                    onClick={() => onOpenCheckOut(room)}
                    className="btn-primary"
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      backgroundColor: 'var(--danger-primary)',
                      borderColor: 'var(--danger-primary)',
                    }}
                  >
                    <LogOut size={14} />
                    <span>Review & Check-Out</span>
                  </button>
                )}

                {room.status === 'VACANT_DIRTY' && (
                  <button
                    onClick={() => handleMarkRoomClean(room)}
                    className="btn-secondary"
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      color: 'var(--emerald-primary)',
                    }}
                  >
                    <Sparkles size={14} color="var(--emerald-primary)" />
                    <span>Mark Inspected & Clean</span>
                  </button>
                )}

                <button
                  onClick={() => onSelectRoomForAudit(room)}
                  className="btn-secondary"
                  style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem' }}
                >
                  <ShieldCheck size={14} color="var(--brand-primary)" />
                  <span>Open 360° Internal Audit</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
