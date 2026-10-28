'use client';

import React, { useState, useEffect } from 'react';
import { Room, StaffUser } from '@hosos/types';
import { useFeedback } from '@/context/FeedbackContext';
import { hasPermission } from '@/lib/rbac';
import {
  Hotel,
  UserPlus,
  LogOut,
  CheckCircle2,
  ShieldCheck,
  Search,
  Download,
  Sparkles,
  Wrench,
  Plus,
  LayoutGrid,
  List,
  Settings,
  Tag,
  DollarSign,
  X,
  Save,
  Edit3,
  ArrowLeft,
  Palette,
} from 'lucide-react';

interface FrontDeskViewProps {
  rooms: Room[];
  onSelectRoomForAudit: (room: Room) => void;
  activeStaff: StaffUser;
  onOpenCheckIn: (room: Room) => void;
  onOpenCheckOut: (room: Room) => void;
  onOpenNewReservation: () => void;
  onRefreshRooms: () => void;
  onBack?: () => void;
}

type RoomTab = 'VACANT_CLEAN' | 'VACANT_DIRTY' | 'OCCUPIED' | 'MAINTENANCE';
type ViewMode = 'CARDS' | 'LIST';

// Room color tag presets
const COLOR_PRESETS = [
  { label: 'Ocean Blue', value: '#2563eb', bg: '#EFF6FF' },
  { label: 'Emerald', value: '#059669', bg: '#ECFDF5' },
  { label: 'Amber Gold', value: '#D97706', bg: '#FFFBEB' },
  { label: 'Purple', value: '#7C3AED', bg: '#F5F3FF' },
  { label: 'Rose Red', value: '#E11D48', bg: '#FFF1F2' },
  { label: 'Slate', value: '#475569', bg: '#F8FAFC' },
  { label: 'Teal', value: '#0D9488', bg: '#F0FDFA' },
  { label: 'Orange', value: '#EA580C', bg: '#FFF7ED' },
];

// Persisted room metadata (name + color) managed by admin
function getRoomMeta(): Record<string, { displayName?: string; colorTag?: string; colorBg?: string }> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem('hosos_room_meta') || '{}');
  } catch { return {}; }
}

function saveRoomMeta(meta: Record<string, { displayName?: string; colorTag?: string; colorBg?: string }>) {
  localStorage.setItem('hosos_room_meta', JSON.stringify(meta));
}

export default function FrontDeskView({
  rooms,
  onSelectRoomForAudit,
  activeStaff,
  onOpenCheckIn,
  onOpenCheckOut,
  onOpenNewReservation,
  onRefreshRooms,
  onBack,
}: FrontDeskViewProps) {
  const { showConfirm, showSuccess, showFailed, showToast } = useFeedback();
  const [activeTab, setActiveTab] = useState<RoomTab>('VACANT_CLEAN');
  const [viewMode, setViewMode] = useState<ViewMode>('CARDS');
  const [searchTerm, setSearchTerm] = useState('');
  const [roomMeta, setRoomMeta] = useState<Record<string, { displayName?: string; colorTag?: string; colorBg?: string }>>({});
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('#2563eb');
  const [editColorBg, setEditColorBg] = useState('#EFF6FF');
  const [editPrice, setEditPrice] = useState(0);
  const [priceEdits, setPriceEdits] = useState<Record<string, number>>({});
  const [isSavingPrice, setIsSavingPrice] = useState(false);

  const isSuperAdmin = activeStaff.role === 'SUPERADMIN' || activeStaff.role === 'OWNER' || (activeStaff.role as any) === 'ADMIN';
  const canCheckIn = hasPermission(activeStaff.role, 'rooms.checkin', activeStaff.id);
  const canCheckOut = hasPermission(activeStaff.role, 'rooms.checkout', activeStaff.id);
  const canStatusOverride = hasPermission(activeStaff.role, 'rooms.status.override', activeStaff.id);
  const canCustomizeRooms = isSuperAdmin || hasPermission(activeStaff.role, 'rooms.customize' as any, activeStaff.id) || hasPermission(activeStaff.role, 'prices.override', activeStaff.id);
  const canExportReports = isSuperAdmin || hasPermission(activeStaff.role, 'reports.export', activeStaff.id);

  useEffect(() => {
    setRoomMeta(getRoomMeta());
  }, []);

  const tabs: Array<{ id: RoomTab; label: string; emoji: string; color: string; border: string; bg: string }> = [
    { id: 'VACANT_CLEAN', label: 'Vacant Clean', emoji: '✓', color: '#059669', border: '#BBF7D0', bg: '#F0FDF4' },
    { id: 'VACANT_DIRTY', label: 'Vacant Dirty', emoji: '⚠', color: '#D97706', border: '#FDE68A', bg: '#FFFBEB' },
    { id: 'OCCUPIED', label: 'Occupied', emoji: '●', color: '#2563eb', border: 'var(--brand-border)', bg: 'var(--brand-bg)' },
    { id: 'MAINTENANCE', label: 'Maintenance', emoji: '🔧', color: '#E11D48', border: '#FECACA', bg: '#FEF2F2' },
  ];

  const formatNaira = (amount: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);

  const tabCounts = {
    VACANT_CLEAN: rooms.filter(r => r.status === 'VACANT_CLEAN').length,
    VACANT_DIRTY: rooms.filter(r => r.status === 'VACANT_DIRTY').length,
    OCCUPIED: rooms.filter(r => r.status === 'OCCUPIED').length,
    MAINTENANCE: rooms.filter(r => r.status === 'MAINTENANCE' || r.status === 'OUT_OF_ORDER').length,
  };
  const totalRooms = rooms.length;
  const occupancyPct = totalRooms > 0 ? Math.round((tabCounts.OCCUPIED / totalRooms) * 100) : 0;

  const filteredRooms = rooms.filter(r => {
    const tabMatch = activeTab === 'MAINTENANCE'
      ? (r.status === 'MAINTENANCE' || r.status === 'OUT_OF_ORDER')
      : r.status === activeTab;
    if (!tabMatch) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const meta = roomMeta[r.roomNumber];
      return (
        r.roomNumber.toLowerCase().includes(q) ||
        r.currentGuestName?.toLowerCase().includes(q) ||
        r.roomTypeName.toLowerCase().includes(q) ||
        meta?.displayName?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleMarkRoomClean = (room: Room) => {
    if (!canStatusOverride) {
      showToast({ type: 'error', title: 'Unauthorized', message: 'You do not have permission to change room status.' });
      return;
    }
    showConfirm(
      `Confirm Housekeeping Inspection: Room #${room.roomNumber}`,
      `Confirm that Housekeeping has sanitized, inspected, and made Room #${room.roomNumber} ready for guest arrival?`,
      async () => {
        try {
          const res = await fetch('/api/rooms', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomNumber: room.roomNumber, newStatus: 'VACANT_CLEAN', notes: `Inspected & sanitized by ${activeStaff.name} (${activeStaff.role}). Ready for guest arrival.`, staff: activeStaff }),
          });
          const data = await res.json();
          if (data.success) {
            showSuccess('Room Ready for Check-In!', `Room #${room.roomNumber} transitioned to VACANT_CLEAN.`, `Signed off by ${activeStaff.name}. Logged to audit trail.`);
            onRefreshRooms();
          } else {
            showFailed('Housekeeping Update Failed', data.error || 'Server error occurred');
          }
        } catch (err: any) {
          showFailed('Network Error', err.message || 'Could not update room status');
        }
      },
      { confirmText: 'Mark Vacant Clean', variant: 'emerald', details: `Room #${room.roomNumber} (${room.roomTypeName}) | Inspector: ${activeStaff.name}` }
    );
  };

  const openRoomAdmin = (room: Room) => {
    const meta = roomMeta[room.roomNumber] || {};
    setEditingRoom(room);
    setEditName(meta.displayName || room.roomTypeName);
    setEditColor(meta.colorTag || '#2563eb');
    setEditColorBg(meta.colorBg || '#EFF6FF');
    setEditPrice(priceEdits[room.roomNumber] ?? room.rackRatePerNight);
    setIsAdminModalOpen(true);
  };

  const saveRoomAdmin = async () => {
    if (!editingRoom) return;
    const updated = {
      ...roomMeta,
      [editingRoom.roomNumber]: { displayName: editName, colorTag: editColor, colorBg: editColorBg },
    };
    setRoomMeta(updated);
    saveRoomMeta(updated);

    // Attempt to save price to backend
    if (editPrice !== editingRoom.rackRatePerNight) {
      setIsSavingPrice(true);
      try {
        const res = await fetch('/api/rooms', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomNumber: editingRoom.roomNumber, rackRatePerNight: editPrice, staff: activeStaff, notes: `Rack rate updated to ${formatNaira(editPrice)} by ${activeStaff.name}` }),
        });
        const data = await res.json();
        if (data.success) {
          setPriceEdits(prev => ({ ...prev, [editingRoom.roomNumber]: editPrice }));
          showSuccess('Room Settings Saved', `Room #${editingRoom.roomNumber} name, color tag, and price updated successfully.`);
        } else {
          showToast({ type: 'warning', title: 'Name/Color Saved', message: 'Price update could not be saved to server. Try again.' });
        }
      } catch {
        showToast({ type: 'warning', title: 'Name/Color Saved', message: 'Could not reach server for price update.' });
      } finally {
        setIsSavingPrice(false);
      }
    } else {
      showSuccess('Room Settings Saved', `Room #${editingRoom.roomNumber} name and color tag updated.`);
    }
    setIsAdminModalOpen(false);
    setEditingRoom(null);
  };

  const activeTabConfig = tabs.find(t => t.id === activeTab)!;

  const getRoomColor = (room: Room) => roomMeta[room.roomNumber]?.colorTag || activeTabConfig.color;
  const getRoomBg = (room: Room) => roomMeta[room.roomNumber]?.colorBg || activeTabConfig.bg;
  const getRoomDisplayName = (room: Room) => roomMeta[room.roomNumber]?.displayName || room.roomTypeName;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px 0' }}>

      {/* Header */}
      <div className="ent-card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {onBack && (
              <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: '4px' }}>
                <ArrowLeft size={20} />
              </button>
            )}
            <Hotel size={24} color="var(--brand-primary)" />
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Rooms Division Board</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', margin: 0 }}>Real-time room occupancy grid, express check-in, folio reconciliation.</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* List / Cards toggle */}
            <div style={{ display: 'flex', backgroundColor: 'var(--bg-secondary)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <button
                onClick={() => setViewMode('CARDS')}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: viewMode === 'CARDS' ? '#FFFFFF' : 'transparent', color: viewMode === 'CARDS' ? 'var(--brand-primary)' : 'var(--text-secondary)', border: 'none', cursor: 'pointer', boxShadow: viewMode === 'CARDS' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
              >
                <LayoutGrid size={13} /> Cards
              </button>
              <button
                onClick={() => setViewMode('LIST')}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: viewMode === 'LIST' ? '#FFFFFF' : 'transparent', color: viewMode === 'LIST' ? 'var(--brand-primary)' : 'var(--text-secondary)', border: 'none', cursor: 'pointer', boxShadow: viewMode === 'LIST' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
              >
                <List size={13} /> List
              </button>
            </div>

            {canCheckIn && (
              <button onClick={onOpenNewReservation} className="btn-primary" style={{ fontSize: '0.85rem' }}>
                <Plus size={16} /> <span>New Reservation</span>
              </button>
            )}

            {canExportReports && (
              <button onClick={() => window.open('/api/reports/export?type=TAX_SCHEDULE', '_blank')} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
                <Download size={15} color="var(--brand-primary)" /> <span>Export Report</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
          {[
            { label: 'Occupancy', value: `${occupancyPct}%`, bg: 'var(--bg-secondary)', border: 'var(--border-color)', color: 'var(--brand-primary)' },
            { label: 'Vacant Clean', value: tabCounts.VACANT_CLEAN, bg: '#F0FDF4', border: '#BBF7D0', color: '#059669' },
            { label: 'Occupied', value: tabCounts.OCCUPIED, bg: 'var(--brand-bg)', border: 'var(--brand-border)', color: 'var(--brand-primary)' },
            { label: 'Dirty', value: tabCounts.VACANT_DIRTY, bg: '#FFFBEB', border: '#FDE68A', color: '#D97706' },
            { label: 'Maintenance', value: tabCounts.MAINTENANCE, bg: '#FEF2F2', border: '#FECACA', color: '#E11D48' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '0.7rem', color: s.color, fontWeight: 700, textTransform: 'uppercase' }}>{s.label}</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: s.color, fontFamily: 'var(--font-mono)' }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Bar + Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '10px',
                border: activeTab === tab.id ? `2px solid ${tab.color}` : '1px solid var(--border-color)',
                backgroundColor: activeTab === tab.id ? tab.bg : '#FFFFFF',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.82rem',
                color: activeTab === tab.id ? tab.color : 'var(--text-secondary)',
                transition: 'all 0.15s ease',
                boxShadow: activeTab === tab.id ? `0 2px 8px ${tab.color}22` : 'none',
              }}
            >
              <span style={{ fontSize: '0.9rem' }}>{tab.emoji}</span>
              <span>{tab.label}</span>
              <span style={{
                background: activeTab === tab.id ? tab.color : 'var(--bg-secondary)',
                color: activeTab === tab.id ? '#FFFFFF' : 'var(--text-muted)',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '20px',
                minWidth: '24px',
                textAlign: 'center',
              }}>
                {tabCounts[tab.id]}
              </span>
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

      {/* Section heading */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: activeTabConfig.color, margin: 0 }}>
          {activeTabConfig.emoji} {activeTabConfig.label} Rooms ({filteredRooms.length})
        </h3>
        {isSuperAdmin && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Settings size={13} />
            Click the settings icon on any room card to edit name, color tag &amp; price
          </div>
        )}
      </div>

      {/* Empty state */}
      {filteredRooms.length === 0 && (
        <div className="ent-card" style={{ padding: '60px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>
            {activeTab === 'VACANT_CLEAN' ? '✓' : activeTab === 'VACANT_DIRTY' ? '🧹' : activeTab === 'OCCUPIED' ? '🏨' : '🔧'}
          </div>
          <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>No {activeTabConfig.label} Rooms</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
            {searchTerm ? `No results for "${searchTerm}"` : `There are currently no rooms in ${activeTabConfig.label} status.`}
          </p>
        </div>
      )}

      {/* CARDS VIEW */}
      {viewMode === 'CARDS' && filteredRooms.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '16px' }}>
          {filteredRooms.map(room => {
            const accent = getRoomColor(room);
            const accBg = getRoomBg(room);
            const displayName = getRoomDisplayName(room);
            const price = priceEdits[room.roomNumber] ?? room.rackRatePerNight;

            return (
              <div
                key={room.id}
                className="ent-card-interactive"
                style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: `4px solid ${accent}` }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <span style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                        Room #{room.roomNumber}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <span style={{ fontSize: '0.8rem', color: accent, fontWeight: 700, background: accBg, padding: '2px 8px', borderRadius: '20px', border: `1px solid ${accent}33` }}>
                          <Tag size={10} style={{ marginRight: '3px' }} />
                          {displayName}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>Floor {room.floor}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px',
                        background: accBg, color: accent, border: `1px solid ${accent}44`,
                      }}>
                        {activeTab === 'VACANT_CLEAN' ? '✓ Clean' : activeTab === 'VACANT_DIRTY' ? '⚠ Dirty' : activeTab === 'OCCUPIED' ? '● Occupied' : '🔧 Maintenance'}
                      </span>
                      {canCustomizeRooms && (
                        <button
                          onClick={() => openRoomAdmin(room)}
                          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '4px 6px', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                          title="Admin: Edit room name, color & price"
                        >
                          <Settings size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Status-specific content */}
                  {room.status === 'OCCUPIED' ? (
                    <div style={{ background: accBg, border: `1px solid ${accent}33`, borderRadius: 'var(--radius-sm)', padding: '12px', marginBottom: '14px' }}>
                      <div style={{ fontSize: '0.7rem', color: accent, textTransform: 'uppercase', fontWeight: 700 }}>In-House Guest</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                        {room.currentGuestName || '—'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: accent, fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                        Folio: {room.currentFolioId || 'Pending'}
                      </div>
                    </div>
                  ) : room.status === 'VACANT_DIRTY' ? (
                    <div style={{ background: accBg, border: `1px solid ${accent}33`, borderRadius: 'var(--radius-sm)', padding: '12px', marginBottom: '14px' }}>
                      <div style={{ fontSize: '0.7rem', color: accent, textTransform: 'uppercase', fontWeight: 700 }}>Housekeeping Required</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: accent, marginTop: '2px' }}>Pending linen change & sanitization</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Rack Rate: {formatNaira(price)}/night</div>
                    </div>
                  ) : room.status === 'MAINTENANCE' || room.status === 'OUT_OF_ORDER' ? (
                    <div style={{ background: accBg, border: `1px solid ${accent}33`, borderRadius: 'var(--radius-sm)', padding: '12px', marginBottom: '14px' }}>
                      <div style={{ fontSize: '0.7rem', color: accent, textTransform: 'uppercase', fontWeight: 700 }}>Engineering Down</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: accent, marginTop: '2px' }}>Active work order in progress</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Room blocked from reservation</div>
                    </div>
                  ) : (
                    <div style={{ background: accBg, border: `1px solid ${accent}33`, borderRadius: 'var(--radius-sm)', padding: '12px', marginBottom: '14px' }}>
                      <div style={{ fontSize: '0.7rem', color: accent, textTransform: 'uppercase', fontWeight: 700 }}>Standard Rack Rate</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                        {formatNaira(price)} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>/ night</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '4px', fontWeight: 600 }}>✓ Cleaned & inspected by housekeeping</div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                  {room.status === 'VACANT_CLEAN' && canCheckIn && (
                    <button onClick={() => onOpenCheckIn(room)} className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem', backgroundColor: '#059669', borderColor: '#059669' }}>
                      <UserPlus size={14} /> <span>Check-In Guest</span>
                    </button>
                  )}
                  {room.status === 'OCCUPIED' && canCheckOut && (
                    <button onClick={() => onOpenCheckOut(room)} className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem', backgroundColor: '#E11D48', borderColor: '#E11D48' }}>
                      <LogOut size={14} /> <span>Review & Check-Out</span>
                    </button>
                  )}
                  {room.status === 'VACANT_DIRTY' && canStatusOverride && (
                    <button onClick={() => handleMarkRoomClean(room)} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem', color: '#059669' }}>
                      <Sparkles size={14} color="#059669" /> <span>Mark Inspected & Clean</span>
                    </button>
                  )}
                  <button onClick={() => onSelectRoomForAudit(room)} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem' }}>
                    <ShieldCheck size={14} color="var(--brand-primary)" /> <span>Open 360° Internal Audit</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === 'LIST' && filteredRooms.length > 0 && (
        <div className="ent-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                {['Room #', 'Type / Name', 'Floor', 'Rate / Night', 'Status', 'Guest', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRooms.map(room => {
                const accent = getRoomColor(room);
                const accBg = getRoomBg(room);
                const displayName = getRoomDisplayName(room);
                const price = priceEdits[room.roomNumber] ?? room.rackRatePerNight;

                return (
                  <tr key={room.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background-color 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-secondary)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '4px', height: '28px', borderRadius: '2px', backgroundColor: accent, flexShrink: 0 }} />
                        #{room.roomNumber}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: accent, background: accBg, padding: '3px 10px', borderRadius: '20px' }}>
                        {displayName}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Floor {room.floor}</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {formatNaira(price)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', background: accBg, color: accent }}>
                        {activeTab === 'VACANT_CLEAN' ? '✓ Clean' : activeTab === 'VACANT_DIRTY' ? '⚠ Dirty' : activeTab === 'OCCUPIED' ? '● Occupied' : '🔧 Maint.'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '160px' }}>
                      {room.currentGuestName || '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {room.status === 'VACANT_CLEAN' && canCheckIn && (
                          <button onClick={() => onOpenCheckIn(room)} className="btn-primary" style={{ fontSize: '0.72rem', padding: '5px 10px', backgroundColor: '#059669', borderColor: '#059669' }}>
                            <UserPlus size={12} /> Check-In
                          </button>
                        )}
                        {room.status === 'OCCUPIED' && canCheckOut && (
                          <button onClick={() => onOpenCheckOut(room)} className="btn-primary" style={{ fontSize: '0.72rem', padding: '5px 10px', backgroundColor: '#E11D48', borderColor: '#E11D48' }}>
                            <LogOut size={12} /> Check-Out
                          </button>
                        )}
                        {room.status === 'VACANT_DIRTY' && canStatusOverride && (
                          <button onClick={() => handleMarkRoomClean(room)} className="btn-secondary" style={{ fontSize: '0.72rem', padding: '5px 10px', color: '#059669' }}>
                            <Sparkles size={12} color="#059669" /> Mark Clean
                          </button>
                        )}
                        <button onClick={() => onSelectRoomForAudit(room)} className="btn-secondary" style={{ fontSize: '0.72rem', padding: '5px 10px' }}>
                          <ShieldCheck size={12} /> Audit
                        </button>
                        {canCustomizeRooms && (
                          <button onClick={() => openRoomAdmin(room)} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '4px 7px', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                            <Settings size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Admin Room Edit Modal */}
      {isAdminModalOpen && editingRoom && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="ent-card" style={{ width: '100%', maxWidth: '520px', padding: '32px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => { setIsAdminModalOpen(false); setEditingRoom(null); }} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Settings size={20} color="var(--brand-primary)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Admin: Room #{editingRoom.roomNumber} Settings</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>Edit display name, color tag, and pricing</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Display Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <Edit3 size={13} style={{ marginRight: '5px' }} />Room Display Name / Type
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="ent-input"
                  style={{ width: '100%' }}
                  placeholder="e.g. Presidential Suite, Deluxe Ocean View..."
                />
              </div>

              {/* Color Tag */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <Palette size={13} style={{ marginRight: '5px' }} />Color Tag (Used for room cards)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {COLOR_PRESETS.map(preset => (
                    <button
                      key={preset.value}
                      onClick={() => { setEditColor(preset.value); setEditColorBg(preset.bg); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 10px', borderRadius: '8px',
                        border: editColor === preset.value ? `2px solid ${preset.value}` : '1px solid var(--border-color)',
                        backgroundColor: preset.bg, cursor: 'pointer',
                        boxShadow: editColor === preset.value ? `0 0 0 3px ${preset.value}22` : 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: preset.value, flexShrink: 0 }} />
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: preset.value, whiteSpace: 'nowrap' }}>{preset.label}</span>
                    </button>
                  ))}
                </div>
                {/* Preview */}
                <div style={{ marginTop: '10px', padding: '10px 14px', background: editColorBg, border: `1px solid ${editColor}33`, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Tag size={13} color={editColor} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: editColor }}>Preview: {editName}</span>
                </div>
              </div>

              {/* Price */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <DollarSign size={13} style={{ marginRight: '5px' }} />Rack Rate Per Night (₦)
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.9rem' }}>₦</span>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={e => setEditPrice(Number(e.target.value))}
                    className="ent-input"
                    style={{ width: '100%', paddingLeft: '32px' }}
                    min={0}
                    step={1000}
                  />
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  Current rate: {formatNaira(editingRoom.rackRatePerNight)}/night. Changes are saved to the database.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '28px', justifyContent: 'flex-end' }}>
              <button onClick={() => { setIsAdminModalOpen(false); setEditingRoom(null); }} className="btn-secondary" style={{ fontSize: '0.85rem' }}>Cancel</button>
              <button onClick={saveRoomAdmin} disabled={isSavingPrice} className="btn-primary" style={{ fontSize: '0.85rem' }}>
                <Save size={14} /> {isSavingPrice ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
