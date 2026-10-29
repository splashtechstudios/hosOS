'use client';

import React, { useState, useEffect } from 'react';
import { Room, StaffUser } from '@hosos/types';
import { useFeedback } from '@/context/FeedbackContext';
import { hasPermission } from '@/lib/rbac';
import {
  STANDARD_ROOM_AMENITIES,
  STANDARD_ROOM_DESCRIPTION,
  VIP_SUITE_AMENITIES,
  VIP_SUITE_DESCRIPTION,
} from '@/lib/mockData';
import {
  Hotel,
  UserPlus,
  LogOut,
  ShieldCheck,
  Search,
  Download,
  Sparkles,
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
  Star,
  Building2,
  Trash2,
  Check,
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

type RoomTab = 'ALL_STATUS' | 'VACANT_CLEAN' | 'VACANT_DIRTY' | 'OCCUPIED' | 'MAINTENANCE';
type ViewMode = 'CARDS' | 'LIST';

const COLOR_PRESETS = [
  { label: 'Emerald Standard', value: '#059669', bg: '#ECFDF5' },
  { label: 'Amber VIP Gold', value: '#D97706', bg: '#FFFBEB' },
  { label: 'Ocean Blue', value: '#2563eb', bg: '#EFF6FF' },
  { label: 'Royal Purple', value: '#7C3AED', bg: '#F5F3FF' },
  { label: 'Terracotta', value: '#EA580C', bg: '#FFF7ED' },
  { label: 'Lagoon Teal', value: '#0D9488', bg: '#F0FDFA' },
  { label: 'Rose Red', value: '#E11D48', bg: '#FFF1F2' },
  { label: 'Slate', value: '#475569', bg: '#F8FAFC' },
];

const ALL_AMENITY_PRESETS = [
  '100% Off-Grid Solar Power',
  'Solar Inverter AC',
  'Room Service',
  'En-Suite Bath',
  'Spacious Executive Layout',
  '24/7 Off-Grid Solar AC & TV',
  'Priority VIP Concierge',
  'Luxury En-Suite',
  'Plush Double Bed',
  'Executive King Bedding',
  'Flat-Screen Satellite TV',
  'Tranquil Views',
  'High Speed Wi-Fi',
  'Mini Bar Refrigerator',
  'Executive Work Desk',
];

const BLOCK_PRESETS = [
  'Block A1',
  'Block A2',
  'Block A3',
  'Block B1',
  'Block B2',
  'Block B3',
  'Block B4',
  'Block C1',
  'Block C2',
  'Block C3',
  'Block C4',
];

function getRoomMeta(): Record<string, { displayName?: string; colorTag?: string; colorBg?: string }> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem('hosos_room_meta') || '{}');
  } catch {
    return {};
  }
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
  const [activeTab, setActiveTab] = useState<RoomTab>('ALL_STATUS');
  const [blockFilter, setBlockFilter] = useState<string>('ALL');
  const [tierFilter, setTierFilter] = useState<'ALL' | 'STANDARD' | 'VIP'>('ALL');
  const [viewMode, setViewMode] = useState<ViewMode>('CARDS');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 900);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [roomMeta, setRoomMeta] = useState<
    Record<string, { displayName?: string; colorTag?: string; colorBg?: string }>
  >({});

  // Room Settings (Edit) Modal State
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [editRoomNumber, setEditRoomNumber] = useState('');
  const [editBlockName, setEditBlockName] = useState('');
  const [editTier, setEditTier] = useState<'Standard Room' | 'Executive VIP Suite'>('Standard Room');
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editColor, setEditColor] = useState('#059669');
  const [editColorBg, setEditColorBg] = useState('#ECFDF5');
  const [editPrice, setEditPrice] = useState(10000);
  const [editAmenities, setEditAmenities] = useState<string[]>([]);
  const [editCustomAmenityInput, setEditCustomAmenityInput] = useState('');
  const [priceEdits, setPriceEdits] = useState<Record<string, number>>({});
  const [isSavingPrice, setIsSavingPrice] = useState(false);

  const [, setRbacTick] = useState(0);
  useEffect(() => {
    const onRbacUpdate = () => setRbacTick((t) => t + 1);
    window.addEventListener('hosos_rbac_updated', onRbacUpdate);
    return () => window.removeEventListener('hosos_rbac_updated', onRbacUpdate);
  }, []);

  const canCheckIn = hasPermission(activeStaff.role, 'rooms.checkin', activeStaff.id);
  const canCheckOut = hasPermission(activeStaff.role, 'rooms.checkout', activeStaff.id);
  const canStatusOverride = hasPermission(activeStaff.role, 'rooms.status.override', activeStaff.id);
  const canCustomizeRooms = hasPermission(activeStaff.role, 'rooms.customize', activeStaff.id);
  const canCreateRoom = hasPermission(activeStaff.role, 'rooms.create', activeStaff.id);
  const canManageAmenities = hasPermission(activeStaff.role, 'rooms.manage_amenities', activeStaff.id);
  const canDeleteRoom = hasPermission(activeStaff.role, 'rooms.delete', activeStaff.id);
  const canExportReports = hasPermission(activeStaff.role, 'reports.export', activeStaff.id);

  // Create Room Modal State
  const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] = useState(false);
  const [selectedBlockBuilder, setSelectedBlockBuilder] = useState('Block A1');
  const [selectedUnitBuilder, setSelectedUnitBuilder] = useState('Room 1');
  const [newRoomNumber, setNewRoomNumber] = useState('Block A4 Room 1');
  const [newRoomTypeName, setNewRoomTypeName] = useState<'Standard Room' | 'Executive VIP Suite'>('Standard Room');
  const [newCustomName, setNewCustomName] = useState('Standard Room');
  const [newDescription, setNewDescription] = useState(STANDARD_ROOM_DESCRIPTION);
  const [newFloor, setNewFloor] = useState(1);
  const [newRackRate, setNewRackRate] = useState(10000);
  const [newColorTag, setNewColorTag] = useState('#059669');
  const [newColorBg, setNewColorBg] = useState('#ECFDF5');
  const [newAmenities, setNewAmenities] = useState<string[]>([...STANDARD_ROOM_AMENITIES]);
  const [customAmenityInput, setCustomAmenityInput] = useState('');
  const [isSubmittingRoom, setIsSubmittingRoom] = useState(false);

  const handleSelectCreateTier = (tier: 'Standard Room' | 'Executive VIP Suite') => {
    setNewRoomTypeName(tier);
    setNewCustomName(tier);
    if (tier === 'Executive VIP Suite') {
      setNewRackRate(15000);
      setNewDescription(VIP_SUITE_DESCRIPTION);
      setNewAmenities([...VIP_SUITE_AMENITIES]);
      setNewColorTag('#D97706');
      setNewColorBg('#FFFBEB');
    } else {
      setNewRackRate(10000);
      setNewDescription(STANDARD_ROOM_DESCRIPTION);
      setNewAmenities([...STANDARD_ROOM_AMENITIES]);
      setNewColorTag('#059669');
      setNewColorBg('#ECFDF5');
    }
  };

  const toggleNewAmenity = (name: string) => {
    setNewAmenities((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
    );
  };

  const handleAddCustomAmenity = () => {
    if (!customAmenityInput.trim()) return;
    if (!newAmenities.includes(customAmenityInput.trim())) {
      setNewAmenities((prev) => [...prev, customAmenityInput.trim()]);
    }
    setCustomAmenityInput('');
  };

  const toggleEditAmenity = (name: string) => {
    setEditAmenities((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
    );
  };

  const handleAddEditCustomAmenity = () => {
    if (!editCustomAmenityInput.trim()) return;
    if (!editAmenities.includes(editCustomAmenityInput.trim())) {
      setEditAmenities((prev) => [...prev, editCustomAmenityInput.trim()]);
    }
    setEditCustomAmenityInput('');
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomNumber.trim()) {
      showToast({
        type: 'error',
        title: 'Room Name Required',
        message: 'Please specify the room name (e.g. Block A1 Room 1).',
      });
      return;
    }
    setIsSubmittingRoom(true);
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomNumber: newRoomNumber.trim(),
          blockName: selectedBlockBuilder,
          roomTypeName: newRoomTypeName,
          description: newDescription,
          customName: newCustomName || newRoomTypeName,
          floor: Number(newFloor),
          rackRatePerNight: Number(newRackRate),
          colorTag: newColorTag,
          colorBg: newColorBg,
          amenities: newAmenities,
          createdBy: activeStaff.name,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showSuccess(
          'Room Created & Added to Inventory!',
          `${newRoomNumber} (${newRoomTypeName}) is now live in Osieka Resort CRM.`,
          `Rate: ₦${Number(newRackRate).toLocaleString()}/night • Amenities: ${newAmenities.join(', ')}`
        );
        setIsCreateRoomModalOpen(false);
        if (onRefreshRooms) onRefreshRooms();
      } else {
        showFailed('Failed to Create Room', data.error || 'Server error creating room');
      }
    } catch (err: any) {
      showFailed('Network Error', err.message);
    } finally {
      setIsSubmittingRoom(false);
    }
  };

  useEffect(() => {
    const local = getRoomMeta();
    const merged: Record<string, { displayName?: string; colorTag?: string; colorBg?: string }> = {
      ...local,
    };
    rooms.forEach((r) => {
      if (r.customName || r.colorTag || r.colorBg) {
        merged[r.roomNumber] = {
          displayName: r.customName || merged[r.roomNumber]?.displayName,
          colorTag: r.colorTag || merged[r.roomNumber]?.colorTag,
          colorBg: r.colorBg || merged[r.roomNumber]?.colorBg,
        };
      }
    });
    setRoomMeta(merged);
  }, [rooms]);

  const tabs: Array<{
    id: RoomTab;
    label: string;
    emoji: string;
    color: string;
    border: string;
    bg: string;
  }> = [
    { id: 'ALL_STATUS', label: 'All Rooms', emoji: '🏨', color: '#2563eb', border: '#BFDBFE', bg: '#EFF6FF' },
    { id: 'VACANT_CLEAN', label: 'Vacant Clean', emoji: '✓', color: '#059669', border: '#BBF7D0', bg: '#F0FDF4' },
    { id: 'VACANT_DIRTY', label: 'Vacant Dirty', emoji: '⚠', color: '#D97706', border: '#FDE68A', bg: '#FFFBEB' },
    { id: 'OCCUPIED', label: 'Occupied', emoji: '●', color: '#2563eb', border: 'var(--brand-border)', bg: 'var(--brand-bg)' },
    { id: 'MAINTENANCE', label: 'Maintenance', emoji: '🔧', color: '#E11D48', border: '#FECACA', bg: '#FEF2F2' },
  ];

  const formatNaira = (amount: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);

  const isRoomVip = (room: Room) =>
    /vip/i.test(room.roomTypeName || '') || /vip/i.test(roomMeta[room.roomNumber]?.displayName || '');

  const getRoomBlock = (room: Room) => {
    if (room.blockName) return room.blockName;
    const m = room.roomNumber.match(/^(Block\s+[A-Za-z0-9]+)/i);
    return m ? m[1] : 'Resort Wing';
  };

  const tabCounts = {
    ALL_STATUS: rooms.length,
    VACANT_CLEAN: rooms.filter((r) => r.status === 'VACANT_CLEAN').length,
    VACANT_DIRTY: rooms.filter((r) => r.status === 'VACANT_DIRTY').length,
    OCCUPIED: rooms.filter((r) => r.status === 'OCCUPIED').length,
    MAINTENANCE: rooms.filter((r) => r.status === 'MAINTENANCE' || r.status === 'OUT_OF_ORDER').length,
  };
  const totalRooms = rooms.length;
  const standardCount = rooms.filter((r) => !isRoomVip(r)).length;
  const vipCount = rooms.filter((r) => isRoomVip(r)).length;
  const occupancyPct = totalRooms > 0 ? Math.round((tabCounts.OCCUPIED / totalRooms) * 100) : 0;

  const filteredRooms = rooms.filter((r) => {
    const tabMatch =
      activeTab === 'ALL_STATUS'
        ? true
        : activeTab === 'MAINTENANCE'
        ? r.status === 'MAINTENANCE' || r.status === 'OUT_OF_ORDER'
        : r.status === activeTab;
    if (!tabMatch) return false;

    if (blockFilter !== 'ALL') {
      const b = getRoomBlock(r).toUpperCase();
      if (blockFilter === 'BLOCK_A' && !b.startsWith('BLOCK A')) return false;
      if (blockFilter === 'BLOCK_B' && !b.startsWith('BLOCK B')) return false;
      if (blockFilter === 'BLOCK_C' && !b.startsWith('BLOCK C')) return false;
      if (
        blockFilter !== 'BLOCK_A' &&
        blockFilter !== 'BLOCK_B' &&
        blockFilter !== 'BLOCK_C' &&
        b !== blockFilter.toUpperCase()
      ) {
        return false;
      }
    }

    if (tierFilter === 'VIP' && !isRoomVip(r)) return false;
    if (tierFilter === 'STANDARD' && isRoomVip(r)) return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const meta = roomMeta[r.roomNumber];
      return (
        r.roomNumber.toLowerCase().includes(q) ||
        getRoomBlock(r).toLowerCase().includes(q) ||
        r.currentGuestName?.toLowerCase().includes(q) ||
        r.roomTypeName.toLowerCase().includes(q) ||
        meta?.displayName?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleMarkRoomClean = (room: Room) => {
    if (!canStatusOverride) {
      showToast({
        type: 'error',
        title: 'Unauthorized',
        message: 'You do not have permission to change room status.',
      });
      return;
    }
    showConfirm(
      `Confirm Housekeeping Inspection: ${room.roomNumber}`,
      `Confirm that Housekeeping has sanitized, inspected, and made ${room.roomNumber} ready for guest arrival?`,
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
              `${room.roomNumber} transitioned to VACANT_CLEAN.`,
              `Signed off by ${activeStaff.name}. Logged to audit trail.`
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
        details: `${room.roomNumber} (${room.roomTypeName}) | Inspector: ${activeStaff.name}`,
      }
    );
  };

  // Quick 1-click toggle between Standard Room and Executive VIP Suite directly on card or inside settings
  const handleQuickToggleRoomTier = async (room: Room) => {
    if (!canCustomizeRooms) {
      showToast({
        type: 'error',
        title: 'Permission Required',
        message: 'You need the Edit Room Settings permission to switch between Standard and VIP.',
      });
      return;
    }
    const currentlyVip = isRoomVip(room);
    const nextTier = currentlyVip ? 'Standard Room' : 'Executive VIP Suite';
    const nextRate = currentlyVip ? 10000 : 15000;
    const nextColor = currentlyVip ? '#059669' : '#D97706';
    const nextBg = currentlyVip ? '#ECFDF5' : '#FFFBEB';
    const nextDesc = currentlyVip ? STANDARD_ROOM_DESCRIPTION : VIP_SUITE_DESCRIPTION;
    const nextAmenities = currentlyVip ? [...STANDARD_ROOM_AMENITIES] : [...VIP_SUITE_AMENITIES];

    try {
      const res = await fetch('/api/rooms', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomNumber: room.roomNumber,
          roomTypeName: nextTier,
          customName: nextTier,
          description: nextDesc,
          rackRatePerNight: nextRate,
          colorTag: nextColor,
          colorBg: nextBg,
          amenities: nextAmenities,
          staff: activeStaff,
          notes: `Switched ${room.roomNumber} tier to ${nextTier} (₦${nextRate.toLocaleString()}/night).`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const updated = {
          ...roomMeta,
          [room.roomNumber]: { displayName: nextTier, colorTag: nextColor, colorBg: nextBg },
        };
        setRoomMeta(updated);
        saveRoomMeta(updated);
        setPriceEdits((prev) => ({ ...prev, [room.roomNumber]: nextRate }));
        showToast({
          type: 'success',
          title: `Switched to ${nextTier}`,
          message: `${room.roomNumber} is now configured as ${nextTier} (${formatNaira(nextRate)}/night).`,
        });
        onRefreshRooms();
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Update Error', message: err.message });
    }
  };

  const openRoomAdmin = (room: Room) => {
    const meta = roomMeta[room.roomNumber] || {};
    const vip = isRoomVip(room);
    setEditingRoom(room);
    setEditRoomNumber(room.roomNumber);
    setEditBlockName(getRoomBlock(room));
    setEditTier(vip ? 'Executive VIP Suite' : 'Standard Room');
    setEditName(meta.displayName || room.customName || room.roomTypeName);
    setEditDescription(
      room.description || (vip ? VIP_SUITE_DESCRIPTION : STANDARD_ROOM_DESCRIPTION)
    );
    setEditColor(meta.colorTag || room.colorTag || (vip ? '#D97706' : '#059669'));
    setEditColorBg(meta.colorBg || room.colorBg || (vip ? '#FFFBEB' : '#ECFDF5'));
    setEditPrice(priceEdits[room.roomNumber] ?? room.rackRatePerNight);
    setEditAmenities(
      room.amenities && room.amenities.length > 0
        ? [...room.amenities]
        : vip
        ? [...VIP_SUITE_AMENITIES]
        : [...STANDARD_ROOM_AMENITIES]
    );
    setIsAdminModalOpen(true);
  };

  const handleSelectEditTierPreset = (tier: 'Standard Room' | 'Executive VIP Suite') => {
    setEditTier(tier);
    setEditName(tier);
    if (tier === 'Executive VIP Suite') {
      setEditPrice(15000);
      setEditDescription(VIP_SUITE_DESCRIPTION);
      setEditAmenities([...VIP_SUITE_AMENITIES]);
      setEditColor('#D97706');
      setEditColorBg('#FFFBEB');
    } else {
      setEditPrice(10000);
      setEditDescription(STANDARD_ROOM_DESCRIPTION);
      setEditAmenities([...STANDARD_ROOM_AMENITIES]);
      setEditColor('#059669');
      setEditColorBg('#ECFDF5');
    }
  };

  const saveRoomAdmin = async () => {
    if (!editingRoom) return;
    const finalRoomNum = editRoomNumber.trim() || editingRoom.roomNumber;
    const updated = {
      ...roomMeta,
      [finalRoomNum]: { displayName: editName || editTier, colorTag: editColor, colorBg: editColorBg },
    };
    setRoomMeta(updated);
    saveRoomMeta(updated);

    setIsSavingPrice(true);
    try {
      const res = await fetch('/api/rooms', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomNumber: editingRoom.roomNumber,
          newRoomNumber: finalRoomNum,
          blockName: editBlockName,
          roomTypeName: editTier,
          customName: editName || editTier,
          description: editDescription,
          colorTag: editColor,
          colorBg: editColorBg,
          rackRatePerNight: editPrice,
          amenities: editAmenities,
          staff: activeStaff,
          notes: `Room settings updated by ${activeStaff.name}: Name="${finalRoomNum}", Tier="${editTier}", Rate=${formatNaira(editPrice)}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPriceEdits((prev) => ({ ...prev, [finalRoomNum]: editPrice }));
        showSuccess(
          'Room Settings & Amenities Saved!',
          `${finalRoomNum} configured as ${editTier} (${formatNaira(editPrice)}/night).`,
          `Amenities (${editAmenities.length}): ${editAmenities.join(', ')}`
        );
        onRefreshRooms();
      } else {
        showFailed('Save Error', data.error || 'Could not update room settings.');
      }
    } catch {
      showSuccess('Room Settings Saved Locally', `${finalRoomNum} settings updated.`);
    } finally {
      setIsSavingPrice(false);
      setIsAdminModalOpen(false);
      setEditingRoom(null);
    }
  };

  const handleDeleteRoom = (room: Room) => {
    if (!canDeleteRoom) {
      showToast({
        type: 'error',
        title: 'Permission Denied',
        message: 'You do not have permission to delete rooms from inventory.',
      });
      return;
    }
    showConfirm(
      `Delete ${room.roomNumber} from Inventory`,
      `Are you sure you want to permanently remove ${room.roomNumber} (${room.roomTypeName}) from the resort database?`,
      async () => {
        try {
          const res = await fetch(
            `/api/rooms?roomNumber=${encodeURIComponent(room.roomNumber)}&role=${encodeURIComponent(
              activeStaff.role
            )}&permissionGranted=${canDeleteRoom}`,
            { method: 'DELETE' }
          );
          const data = await res.json();
          if (data.success) {
            setIsAdminModalOpen(false);
            setEditingRoom(null);
            showToast({
              type: 'info',
              title: 'Room Deleted',
              message: `${room.roomNumber} removed from inventory.`,
            });
            onRefreshRooms();
          } else {
            showFailed('Delete Blocked', data.error || 'Could not delete room.');
          }
        } catch (err: any) {
          showFailed('Error', err.message);
        }
      },
      { confirmText: 'Delete Room', variant: 'danger' }
    );
  };

  const activeTabConfig = tabs.find((t) => t.id === activeTab)!;

  const getRoomColor = (room: Room) =>
    roomMeta[room.roomNumber]?.colorTag || room.colorTag || (isRoomVip(room) ? '#D97706' : '#059669');
  const getRoomBg = (room: Room) =>
    roomMeta[room.roomNumber]?.colorBg || room.colorBg || (isRoomVip(room) ? '#FFFBEB' : '#ECFDF5');
  const getRoomDisplayName = (room: Room) =>
    roomMeta[room.roomNumber]?.displayName || room.customName || room.roomTypeName;

  const formatRoomHeading = (roomNumber: string) =>
    /^Block\s+/i.test(roomNumber) ? roomNumber : `Room #${roomNumber}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px 0' }}>
      {/* Header */}
      <div className="ent-card" style={{ padding: '20px 24px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {onBack && (
              <button
                onClick={onBack}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px',
                }}
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <Hotel size={24} color="var(--brand-primary)" />
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Osieka Resort — Block &amp; Room Inventory Board
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', margin: 0 }}>
                Internal CRM Block Naming (Blocks A1–A3, B1–B4, C1–C4) • Toggle Standard Room vs Executive VIP Suite per room
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* List / Cards toggle */}
            <div
              style={{
                display: 'flex',
                backgroundColor: 'var(--bg-secondary)',
                padding: '3px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
              }}
            >
              <button
                onClick={() => setViewMode('CARDS')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: viewMode === 'CARDS' ? '#FFFFFF' : 'transparent',
                  color: viewMode === 'CARDS' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: viewMode === 'CARDS' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                <LayoutGrid size={13} /> Cards
              </button>
              <button
                onClick={() => setViewMode('LIST')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: viewMode === 'LIST' ? '#FFFFFF' : 'transparent',
                  color: viewMode === 'LIST' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: viewMode === 'LIST' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                <List size={13} /> List
              </button>
            </div>

            {canCheckIn && (
              <button onClick={onOpenNewReservation} className="btn-primary" style={{ fontSize: '0.85rem' }}>
                <Plus size={16} /> <span>New Reservation</span>
              </button>
            )}

            {canCreateRoom && (
              <button
                onClick={() => setIsCreateRoomModalOpen(true)}
                className="btn-secondary"
                style={{ fontSize: '0.85rem', gap: '6px' }}
              >
                <Plus size={15} /> <span>Create Room &amp; Amenities</span>
              </button>
            )}

            {canExportReports && (
              <button
                onClick={() => window.open('/api/reports/export?type=TAX_SCHEDULE', '_blank')}
                className="btn-secondary"
                style={{ fontSize: '0.85rem' }}
              >
                <Download size={15} color="var(--brand-primary)" /> <span>Export Report</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(125px, 1fr))',
            gap: '12px',
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-color)',
          }}
        >
          {[
            { label: 'Total Block Rooms', value: totalRooms, bg: 'var(--bg-secondary)', border: 'var(--border-color)', color: 'var(--text-primary)' },
            { label: 'Standard Rooms', value: standardCount, bg: '#ECFDF5', border: '#A7F3D0', color: '#059669' },
            { label: 'Executive VIP Suites', value: vipCount, bg: '#FFFBEB', border: '#FDE68A', color: '#D97706' },
            { label: 'Vacant Clean', value: tabCounts.VACANT_CLEAN, bg: '#F0FDF4', border: '#BBF7D0', color: '#059669' },
            { label: 'Occupied', value: `${tabCounts.OCCUPIED} (${occupancyPct}%)`, bg: 'var(--brand-bg)', border: 'var(--brand-border)', color: 'var(--brand-primary)' },
            { label: 'Dirty / Maint.', value: tabCounts.VACANT_DIRTY + tabCounts.MAINTENANCE, bg: '#FEF2F2', border: '#FECACA', color: '#E11D48' },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: s.bg,
                border: `1px solid ${s.border}`,
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <span style={{ fontSize: '0.68rem', color: s.color, fontWeight: 700, textTransform: 'uppercase' }}>
                {s.label}
              </span>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: s.color, fontFamily: 'var(--font-mono)' }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Block & Tier Filter Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '10px',
            marginTop: '14px',
            paddingTop: '14px',
            borderTop: '1px dashed var(--border-color)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginRight: '4px' }}>
              BLOCKS:
            </span>
            {[
              { id: 'ALL', label: 'All Blocks (A, B, C)' },
              { id: 'BLOCK_A', label: 'Block A (A1–A3)' },
              { id: 'BLOCK_B', label: 'Block B (B1–B4)' },
              { id: 'BLOCK_C', label: 'Block C (C1–C4)' },
            ].map((b) => (
              <button
                key={b.id}
                onClick={() => setBlockFilter(b.id)}
                className={blockFilter === b.id ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '5px 11px', fontSize: '0.74rem' }}
              >
                <Building2 size={12} />
                <span>{b.label}</span>
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginRight: '4px' }}>
              TIER:
            </span>
            {[
              { id: 'ALL' as const, label: `All Tiers (${totalRooms})` },
              { id: 'STANDARD' as const, label: `Standard Room (${standardCount})` },
              { id: 'VIP' as const, label: `Executive VIP Suite (${vipCount})` },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTierFilter(t.id)}
                className={tierFilter === t.id ? 'btn-primary' : 'btn-secondary'}
                style={{
                  padding: '5px 11px',
                  fontSize: '0.74rem',
                  ...(tierFilter === t.id && t.id === 'VIP'
                    ? { backgroundColor: '#D97706', borderColor: '#D97706' }
                    : {}),
                }}
              >
                {t.id === 'VIP' && <Star size={12} />}
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Status Tab Bar + Search */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                borderRadius: '10px',
                border: activeTab === tab.id ? `2px solid ${tab.color}` : '1px solid var(--border-color)',
                backgroundColor: activeTab === tab.id ? tab.bg : '#FFFFFF',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.8rem',
                color: activeTab === tab.id ? tab.color : 'var(--text-secondary)',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
              <span
                style={{
                  background: activeTab === tab.id ? tab.color : 'var(--bg-secondary)',
                  color: activeTab === tab.id ? '#FFFFFF' : 'var(--text-muted)',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: '20px',
                }}
              >
                {tabCounts[tab.id]}
              </span>
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '260px' }}>
          <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '9px' }} />
          <input
            type="text"
            placeholder="Search Block A1 Room 1, VIP, guest..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ent-input"
            style={{ width: '100%', paddingLeft: '30px', fontSize: '0.75rem' }}
          />
        </div>
      </div>

      {/* Section heading */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: activeTabConfig.color, margin: 0 }}>
          {activeTabConfig.emoji} {activeTabConfig.label} ({filteredRooms.length})
        </h3>
        {canCustomizeRooms && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Settings size={13} />
            <span>
              Click <strong>Switch Tier</strong> or the <strong>Settings (⚙)</strong> button on any room to toggle{' '}
              <strong>Standard / VIP</strong>, rename Block/Room, or edit amenities
            </span>
          </div>
        )}
      </div>

      {/* Empty state */}
      {filteredRooms.length === 0 && (
        <div className="ent-card" style={{ padding: '60px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🏨</div>
          <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
            No Rooms Match Filter
          </h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
            Try switching to "All Rooms" or clearing your Block / Tier filter.
          </p>
        </div>
      )}

      {/* CARDS VIEW */}
      {viewMode === 'CARDS' && filteredRooms.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : '1fr',
            gap: '16px',
          }}
        >
          {filteredRooms.map((room) => {
            const vip = isRoomVip(room);
            const accent = getRoomColor(room);
            const accBg = getRoomBg(room);
            const displayName = getRoomDisplayName(room);
            const blockLabel = getRoomBlock(room);
            const price = priceEdits[room.roomNumber] ?? room.rackRatePerNight;
            const roomDesc =
              room.description || (vip ? VIP_SUITE_DESCRIPTION : STANDARD_ROOM_DESCRIPTION);
            const amenitiesList =
              room.amenities && room.amenities.length > 0
                ? room.amenities
                : vip
                ? VIP_SUITE_AMENITIES
                : STANDARD_ROOM_AMENITIES;

            return (
              <div
                key={room.id}
                className="ent-card-interactive"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderLeft: `4px solid ${accent}`,
                }}
              >
                <div>
                  {/* Top Row: Block + Room Name & Status / Settings */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '8px',
                      marginBottom: '10px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            padding: '2px 7px',
                            borderRadius: '4px',
                            backgroundColor: 'var(--bg-secondary)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-color)',
                          }}
                        >
                          {blockLabel}
                        </span>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '20px',
                            backgroundColor: vip ? '#FFFBEB' : '#ECFDF5',
                            color: vip ? '#B45309' : '#047857',
                            border: `1px solid ${vip ? '#FDE68A' : '#A7F3D0'}`,
                          }}
                        >
                          {vip ? '★ Executive VIP Suite' : 'Standard Room'}
                        </span>
                      </div>

                      <div
                        style={{
                          fontSize: '1.2rem',
                          fontWeight: 800,
                          color: 'var(--text-primary)',
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {formatRoomHeading(room.roomNumber)}
                      </div>

                      {displayName &&
                        displayName !== 'Standard Room' &&
                        displayName !== 'Executive VIP Suite' && (
                          <div style={{ fontSize: '0.75rem', color: accent, fontWeight: 700, marginTop: '2px' }}>
                            <Tag size={11} style={{ marginRight: '4px' }} />
                            {displayName}
                          </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '20px',
                          background:
                            room.status === 'VACANT_CLEAN'
                              ? '#F0FDF4'
                              : room.status === 'OCCUPIED'
                              ? '#EFF6FF'
                              : room.status === 'VACANT_DIRTY'
                              ? '#FFFBEB'
                              : '#FEF2F2',
                          color:
                            room.status === 'VACANT_CLEAN'
                              ? '#059669'
                              : room.status === 'OCCUPIED'
                              ? '#2563EB'
                              : room.status === 'VACANT_DIRTY'
                              ? '#D97706'
                              : '#E11D48',
                        }}
                      >
                        {room.status === 'VACANT_CLEAN'
                          ? '✓ Clean'
                          : room.status === 'VACANT_DIRTY'
                          ? '⚠ Dirty'
                          : room.status === 'OCCUPIED'
                          ? '● Occupied'
                          : '🔧 Maint.'}
                      </span>

                      {canCustomizeRooms && (
                        <button
                          onClick={() => openRoomAdmin(room)}
                          style={{
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            padding: '5px 7px',
                            cursor: 'pointer',
                            color: 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          title="Edit Room Name, Standard/VIP Tier, Amenities & Rate"
                        >
                          <Settings size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.45,
                      margin: '0 0 10px 0',
                    }}
                  >
                    {roomDesc}
                  </p>

                  {/* Amenities Checkmarks */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '4px 8px',
                      marginBottom: '12px',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {amenitiesList.slice(0, 4).map((amenity, idx) => (
                      <div
                        key={idx}
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        <span style={{ color: '#059669', fontWeight: 800 }}>✓</span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{amenity}</span>
                      </div>
                    ))}
                  </div>

                  {/* Status / Rate Box */}
                  {room.status === 'OCCUPIED' ? (
                    <div
                      style={{
                        background: '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        borderRadius: 'var(--radius-sm)',
                        padding: '10px 12px',
                        marginBottom: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.68rem', color: '#2563EB', textTransform: 'uppercase', fontWeight: 700 }}>
                          In-House Guest
                        </span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                          {formatNaira(price)}/night
                        </span>
                      </div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                        {room.currentGuestName || 'Checked-In Guest'}
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        background: accBg,
                        border: `1px solid ${accent}33`,
                        borderRadius: 'var(--radius-sm)',
                        padding: '10px 12px',
                        marginBottom: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.68rem', color: accent, textTransform: 'uppercase', fontWeight: 700 }}>
                          {vip ? 'Executive VIP Rate' : 'Standard Room Rate'}
                        </div>
                        <div
                          style={{
                            fontSize: '1.1rem',
                            fontWeight: 800,
                            color: 'var(--text-primary)',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {formatNaira(price)}{' '}
                          <span style={{ fontSize: '0.72rem', fontWeight: 400, color: 'var(--text-muted)' }}>
                            / night
                          </span>
                        </div>
                      </div>

                      {canCustomizeRooms && (
                        <button
                          type="button"
                          onClick={() => handleQuickToggleRoomTier(room)}
                          className="btn-secondary"
                          style={{ fontSize: '0.7rem', padding: '5px 9px' }}
                          title="1-Click Toggle between Standard Room and Executive VIP Suite"
                        >
                          Switch to {vip ? 'Standard' : 'VIP'}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Footer */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  {room.status === 'VACANT_CLEAN' && canCheckIn && (
                    <button
                      onClick={() => onOpenCheckIn(room)}
                      className="btn-primary"
                      style={{
                        width: '100%',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        backgroundColor: '#059669',
                      }}
                    >
                      <UserPlus size={14} /> <span>Check-In Guest</span>
                    </button>
                  )}
                  {room.status === 'OCCUPIED' && canCheckOut && (
                    <button
                      onClick={() => onOpenCheckOut(room)}
                      className="btn-primary"
                      style={{
                        width: '100%',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        backgroundColor: '#E11D48',
                      }}
                    >
                      <LogOut size={14} /> <span>Review &amp; Check-Out</span>
                    </button>
                  )}
                  {room.status === 'VACANT_DIRTY' && canStatusOverride && (
                    <button
                      onClick={() => handleMarkRoomClean(room)}
                      className="btn-secondary"
                      style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem', color: '#059669' }}
                    >
                      <Sparkles size={14} color="#059669" /> <span>Mark Inspected &amp; Clean</span>
                    </button>
                  )}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => onSelectRoomForAudit(room)}
                      className="btn-secondary"
                      style={{ flex: 1, justifyContent: 'center', fontSize: '0.78rem' }}
                    >
                      <ShieldCheck size={14} color="var(--brand-primary)" /> <span>360° Room Audit</span>
                    </button>
                    {canCustomizeRooms && (
                      <button
                        onClick={() => openRoomAdmin(room)}
                        className="btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                      >
                        <Edit3 size={13} /> <span>Edit</span>
                      </button>
                    )}
                  </div>
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
                {['Block', 'CRM Room Name', 'Accommodation Tier', 'Amenities', 'Rate / Night', 'Status', 'Guest', 'Actions'].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        padding: '10px 14px',
                        textAlign: 'left',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: 'var(--text-secondary)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filteredRooms.map((room) => {
                const vip = isRoomVip(room);
                const accent = getRoomColor(room);
                const price = priceEdits[room.roomNumber] ?? room.rackRatePerNight;

                return (
                  <tr key={room.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 14px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      {getRoomBlock(room)}
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '4px', height: '24px', borderRadius: '2px', backgroundColor: accent }} />
                        {formatRoomHeading(room.roomNumber)}
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          color: vip ? '#B45309' : '#047857',
                          background: vip ? '#FFFBEB' : '#ECFDF5',
                          padding: '3px 10px',
                          borderRadius: '20px',
                        }}
                      >
                        {vip ? '★ Executive VIP Suite' : 'Standard Room'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '0.72rem', color: 'var(--text-secondary)', maxWidth: '240px' }}>
                      {(room.amenities || []).slice(0, 3).join(' • ')}
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 800 }}>
                      {formatNaira(price)}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className="badge badge-neutral">{room.status.replace(/_/g, ' ')}</span>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '0.8rem' }}>{room.currentGuestName || '—'}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {canCustomizeRooms && (
                          <button
                            onClick={() => handleQuickToggleRoomTier(room)}
                            className="btn-secondary"
                            style={{ fontSize: '0.7rem', padding: '4px 8px' }}
                          >
                            Toggle {vip ? 'Standard' : 'VIP'}
                          </button>
                        )}
                        <button
                          onClick={() => onSelectRoomForAudit(room)}
                          className="btn-secondary"
                          style={{ fontSize: '0.7rem', padding: '4px 8px' }}
                        >
                          Audit
                        </button>
                        {canCustomizeRooms && (
                          <button
                            onClick={() => openRoomAdmin(room)}
                            className="btn-secondary"
                            style={{ fontSize: '0.7rem', padding: '4px 8px' }}
                          >
                            <Settings size={12} /> Settings
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

      {/* Room Settings & Customization Modal (Toggle VIP/Standard, Rename Block/Room, Edit Amenities & Rate) */}
      {isAdminModalOpen && editingRoom && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            className="ent-card"
            style={{
              width: '100%',
              maxWidth: '620px',
              padding: '28px',
              position: 'relative',
              maxHeight: '92vh',
              overflowY: 'auto',
            }}
          >
            <button
              onClick={() => {
                setIsAdminModalOpen(false);
                setEditingRoom(null);
              }}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(37,99,235,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Settings size={20} color="var(--brand-primary)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Room Settings: {editingRoom.roomNumber}
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                  Toggle Standard vs Executive VIP Suite, rename Block/Room, and customize features &amp; rate
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* 1. Standard Room vs Executive VIP Suite Toggle */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: 'var(--text-secondary)',
                    marginBottom: '6px',
                  }}
                >
                  1. Website Accommodation Tier (Standard vs Executive VIP Suite)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => handleSelectEditTierPreset('Standard Room')}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border:
                        editTier === 'Standard Room'
                          ? '2px solid #059669'
                          : '1px solid var(--border-color)',
                      backgroundColor: editTier === 'Standard Room' ? '#ECFDF5' : '#FFFFFF',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#047857' }}>
                        Standard Room
                      </span>
                      {editTier === 'Standard Room' && <Check size={15} color="#059669" />}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                      Default ₦10,000/night • Solar Inverter AC, En-Suite Bath
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectEditTierPreset('Executive VIP Suite')}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border:
                        editTier === 'Executive VIP Suite'
                          ? '2px solid #D97706'
                          : '1px solid var(--border-color)',
                      backgroundColor: editTier === 'Executive VIP Suite' ? '#FFFBEB' : '#FFFFFF',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#B45309' }}>
                        ★ Executive VIP Suite
                      </span>
                      {editTier === 'Executive VIP Suite' && <Check size={15} color="#D97706" />}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                      Default ₦15,000/night • Executive Layout, Priority Concierge
                    </div>
                  </button>
                </div>
              </div>

              {/* 2. CRM Room Naming & Block */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: 'var(--text-secondary)',
                      marginBottom: '6px',
                    }}
                  >
                    CRM Room Name / Identifier
                  </label>
                  <input
                    type="text"
                    value={editRoomNumber}
                    onChange={(e) => setEditRoomNumber(e.target.value)}
                    placeholder="e.g. Block A1 Room 1"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: 'var(--text-secondary)',
                      marginBottom: '6px',
                    }}
                  >
                    Block Group
                  </label>
                  <input
                    type="text"
                    list="osieka-block-presets"
                    value={editBlockName}
                    onChange={(e) => setEditBlockName(e.target.value)}
                    placeholder="e.g. Block A1"
                    style={{ width: '100%' }}
                  />
                  <datalist id="osieka-block-presets">
                    {BLOCK_PRESETS.map((b) => (
                      <option key={b} value={b} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* 3. Custom Subtitle & Rack Rate */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: 'var(--text-secondary)',
                      marginBottom: '6px',
                    }}
                  >
                    Display Subtitle / Tag
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Standard Room or Executive VIP Suite"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: 'var(--text-secondary)',
                      marginBottom: '6px',
                    }}
                  >
                    Rack Rate Per Night (₦)
                  </label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    min={0}
                    step={500}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* 4. Room Description */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: 'var(--text-secondary)',
                    marginBottom: '6px',
                  }}
                >
                  Room Description
                </label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              {/* 5. Room Features & Amenities */}
              {canManageAmenities && (
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: 'var(--text-secondary)',
                      marginBottom: '6px',
                    }}
                  >
                    Room Features &amp; Amenities ({editAmenities.length} active)
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px',
                      padding: '10px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      backgroundColor: '#F8FAFC',
                    }}
                  >
                    {Array.from(new Set([...ALL_AMENITY_PRESETS, ...editAmenities])).map((amenity) => {
                      const isSel = editAmenities.includes(amenity);
                      return (
                        <button
                          type="button"
                          key={amenity}
                          onClick={() => toggleEditAmenity(amenity)}
                          style={{
                            fontSize: '0.7rem',
                            padding: '4px 9px',
                            borderRadius: '20px',
                            border: isSel
                              ? '1.5px solid var(--brand-primary)'
                              : '1px solid var(--border-color)',
                            backgroundColor: isSel ? 'rgba(37, 99, 235, 0.1)' : '#FFFFFF',
                            color: isSel ? 'var(--brand-primary)' : 'var(--text-secondary)',
                            fontWeight: isSel ? 700 : 500,
                            cursor: 'pointer',
                          }}
                        >
                          {isSel ? '✓ ' : '+ '}
                          {amenity}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <input
                      type="text"
                      value={editCustomAmenityInput}
                      onChange={(e) => setEditCustomAmenityInput(e.target.value)}
                      placeholder="Add custom feature (e.g. Private Balcony, Starlight View)..."
                      style={{ flex: 1, fontSize: '0.78rem' }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddEditCustomAmenity();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddEditCustomAmenity}
                      className="btn-secondary"
                      style={{ fontSize: '0.78rem' }}
                    >
                      + Add Feature
                    </button>
                  </div>
                </div>
              )}

              {/* 6. Color Tag */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: 'var(--text-secondary)',
                    marginBottom: '6px',
                  }}
                >
                  <Palette size={13} style={{ marginRight: '5px' }} />
                  Card Color Accent
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      type="button"
                      key={preset.value}
                      onClick={() => {
                        setEditColor(preset.value);
                        setEditColorBg(preset.bg);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '7px 9px',
                        borderRadius: '8px',
                        border:
                          editColor === preset.value
                            ? `2px solid ${preset.value}`
                            : '1px solid var(--border-color)',
                        backgroundColor: preset.bg,
                        cursor: 'pointer',
                      }}
                    >
                      <div
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: preset.value,
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: preset.value }}>
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '10px',
                marginTop: '24px',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-color)',
              }}
            >
              <div>
                {canDeleteRoom && (
                  <button
                    type="button"
                    onClick={() => handleDeleteRoom(editingRoom)}
                    className="btn-ghost"
                    style={{ color: 'var(--rose-primary)', fontSize: '0.8rem' }}
                  >
                    <Trash2 size={14} />
                    <span>Delete Room</span>
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => {
                    setIsAdminModalOpen(false);
                    setEditingRoom(null);
                  }}
                  className="btn-secondary"
                  style={{ fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveRoomAdmin}
                  disabled={isSavingPrice}
                  className="btn-primary"
                  style={{ fontSize: '0.85rem' }}
                >
                  <Save size={14} /> {isSavingPrice ? 'Saving...' : 'Save Room Settings'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Room & Amenities Modal */}
      {isCreateRoomModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            zIndex: 1050,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            className="ent-card"
            style={{
              width: '100%',
              maxWidth: '600px',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '28px',
              backgroundColor: '#FFFFFF',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Hotel size={22} color="var(--brand-primary)" />
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Create New Block Room &amp; Configure Amenities
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                    Follow Osieka Resort naming (e.g. Block A1 Room 1) &amp; toggle Standard or VIP
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateRoomModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRoom} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Quick Block & Room Builder */}
              <div
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Quick Block Naming Builder (or type custom room name below)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', alignItems: 'center' }}>
                  <select
                    value={selectedBlockBuilder}
                    onChange={(e) => {
                      setSelectedBlockBuilder(e.target.value);
                      setNewRoomNumber(`${e.target.value} ${selectedUnitBuilder}`);
                    }}
                  >
                    {[...BLOCK_PRESETS, 'Block A4', 'Block B5', 'Block C5', 'Block D1', 'Block D2'].map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedUnitBuilder}
                    onChange={(e) => {
                      setSelectedUnitBuilder(e.target.value);
                      setNewRoomNumber(`${selectedBlockBuilder} ${e.target.value}`);
                    }}
                  >
                    {['Room 1', 'Room 2', 'Room 3', 'Room 4'].map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                  <span className="badge badge-brand" style={{ padding: '6px 10px' }}>
                    → {newRoomNumber}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--text-secondary)',
                      marginBottom: '4px',
                    }}
                  >
                    CRM Room Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newRoomNumber}
                    onChange={(e) => setNewRoomNumber(e.target.value)}
                    placeholder="e.g. Block A1 Room 1"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--text-secondary)',
                      marginBottom: '4px',
                    }}
                  >
                    Rate Per Night (₦) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={500}
                    value={newRackRate}
                    onChange={(e) => setNewRackRate(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Tier Toggle: Standard Room vs Executive VIP Suite */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--text-secondary)',
                    marginBottom: '6px',
                  }}
                >
                  Select Room Tier (Pre-loads Standard or VIP Features)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => handleSelectCreateTier('Standard Room')}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border:
                        newRoomTypeName === 'Standard Room'
                          ? '2px solid #059669'
                          : '1px solid var(--border-color)',
                      backgroundColor: newRoomTypeName === 'Standard Room' ? '#ECFDF5' : '#FFFFFF',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#047857' }}>Standard Room</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      ₦10,000/night • 100% Off-Grid Solar, Inverter AC, En-Suite
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectCreateTier('Executive VIP Suite')}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border:
                        newRoomTypeName === 'Executive VIP Suite'
                          ? '2px solid #D97706'
                          : '1px solid var(--border-color)',
                      backgroundColor: newRoomTypeName === 'Executive VIP Suite' ? '#FFFBEB' : '#FFFFFF',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#B45309' }}>
                      ★ Executive VIP Suite
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      ₦15,000/night • Executive Layout, Priority VIP Concierge
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--text-secondary)',
                    marginBottom: '4px',
                  }}
                >
                  Room Description
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Amenities Selector */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--text-secondary)',
                    marginBottom: '6px',
                  }}
                >
                  Room Amenities &amp; Features ({newAmenities.length} selected)
                </label>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                    padding: '8px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    backgroundColor: '#F8FAFC',
                  }}
                >
                  {Array.from(new Set([...ALL_AMENITY_PRESETS, ...newAmenities])).map((amenity) => {
                    const isSelected = newAmenities.includes(amenity);
                    return (
                      <button
                        type="button"
                        key={amenity}
                        onClick={() => toggleNewAmenity(amenity)}
                        style={{
                          fontSize: '0.7rem',
                          padding: '3px 8px',
                          borderRadius: '20px',
                          border: isSelected
                            ? '1.5px solid var(--brand-primary)'
                            : '1px solid var(--border-color)',
                          backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.1)' : '#FFFFFF',
                          color: isSelected ? 'var(--brand-primary)' : 'var(--text-secondary)',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer',
                        }}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {amenity}
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <input
                    type="text"
                    value={customAmenityInput}
                    onChange={(e) => setCustomAmenityInput(e.target.value)}
                    placeholder="Add custom amenity..."
                    style={{ flex: 1, fontSize: '0.75rem' }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomAmenity();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomAmenity}
                    className="btn-secondary"
                    style={{ fontSize: '0.75rem' }}
                  >
                    + Add
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateRoomModalOpen(false)}
                  className="btn-secondary"
                  disabled={isSubmittingRoom}
                >
                  Cancel
                </button>
                <button type="submit" disabled={isSubmittingRoom} className="btn-primary">
                  <Plus size={15} />
                  <span>{isSubmittingRoom ? 'Creating...' : 'Save & Publish Room'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
