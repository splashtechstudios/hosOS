'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Room, StaffUser } from '@hosos/types';
import { useFeedback } from '@/context/FeedbackContext';
import { hasPermission } from '@/lib/rbac';
import {
  MMENKO_ROOM_TIERS,
  STANDARD_ROOM_AMENITIES,
  STANDARD_ROOM_DESCRIPTION,
  VIP_SUITE_AMENITIES,
  VIP_SUITE_DESCRIPTION,
} from '@/lib/mockData';
import {
  getEnableBlocksSetting,
  cleanRoomNumberString,
} from '@/lib/systemSettings';
import SettingsModal from '@/components/SettingsModal';
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
  Sliders,
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

type RoomTab = 'ALL_STATUS' | 'VACANT_ALL' | 'VACANT_CLEAN' | 'VACANT_DIRTY' | 'OCCUPIED' | 'MAINTENANCE';
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
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<ViewMode>('CARDS');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDesktop, setIsDesktop] = useState(true);
  const [enableBlocks, setEnableBlocks] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  useEffect(() => {
    setEnableBlocks(getEnableBlocksSetting());
    const onSettingsUpdate = (e: any) => {
      if (e.detail?.enableBlocks !== undefined) {
        setEnableBlocks(e.detail.enableBlocks);
      } else {
        setEnableBlocks(getEnableBlocksSetting());
      }
    };
    window.addEventListener('hosos_settings_updated', onSettingsUpdate);
    return () => window.removeEventListener('hosos_settings_updated', onSettingsUpdate);
  }, []);

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
  const [editTier, setEditTier] = useState<string>('Standard Room');
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editColor, setEditColor] = useState('#FEA116');
  const [editColorBg, setEditColorBg] = useState('#FFFBEB');
  const [editPrice, setEditPrice] = useState(40000);
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
  const [newRoomNumber, setNewRoomNumber] = useState('Room 16');
  const [newRoomTypeName, setNewRoomTypeName] = useState<string>('Standard Room');
  const [newCustomName, setNewCustomName] = useState('Standard Room');
  const [newDescription, setNewDescription] = useState(MMENKO_ROOM_TIERS[0].description);
  const [newFloor, setNewFloor] = useState(1);
  const [newRackRate, setNewRackRate] = useState(40000);
  const [newColorTag, setNewColorTag] = useState('#FEA116');
  const [newColorBg, setNewColorBg] = useState('#FFFBEB');
  const [newAmenities, setNewAmenities] = useState<string[]>([...MMENKO_ROOM_TIERS[0].features]);
  const [customAmenityInput, setCustomAmenityInput] = useState('');
  const [isSubmittingRoom, setIsSubmittingRoom] = useState(false);

  const handleSelectCreateTier = (tierName: string) => {
    const tier =
      MMENKO_ROOM_TIERS.find((t) => t.name.toLowerCase() === tierName.toLowerCase()) ||
      MMENKO_ROOM_TIERS[0];
    setNewRoomTypeName(tier.name);
    setNewCustomName(tier.name);
    setNewRackRate(tier.rate);
    setNewDescription(tier.description);
    setNewAmenities([...tier.features]);
    setNewColorTag(tier.colorTag);
    setNewColorBg(tier.colorBg);
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
    { id: 'VACANT_ALL', label: 'All Vacant', emoji: '✨', color: '#059669', border: '#A7F3D0', bg: '#ECFDF5' },
    { id: 'VACANT_CLEAN', label: 'Vacant Clean', emoji: '✓', color: '#059669', border: '#BBF7D0', bg: '#F0FDF4' },
    { id: 'VACANT_DIRTY', label: 'Vacant Dirty', emoji: '⚠', color: '#D97706', border: '#FDE68A', bg: '#FFFBEB' },
    { id: 'OCCUPIED', label: 'Occupied', emoji: '●', color: '#DC2626', border: '#FECACA', bg: '#FEF2F2' },
    { id: 'MAINTENANCE', label: 'Maintenance', emoji: '🔧', color: '#7C3AED', border: '#DDD6FE', bg: '#F5F3FF' },
  ];

  const formatNaira = (amount: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);

  const getRoomTier = (room: Room) => {
    const tName = (room.roomTypeName || room.customName || '').trim();
    return (
      MMENKO_ROOM_TIERS.find(
        (t) =>
          t.name.toLowerCase() === tName.toLowerCase() ||
          t.id.toLowerCase() === (room.roomTypeId || '').toLowerCase()
      ) || MMENKO_ROOM_TIERS[0]
    );
  };

  const isRoomVip = (room: Room) => {
    const tier = getRoomTier(room);
    return tier.rate >= 100000 || /suite|executive|vip/i.test(tier.name);
  };

  const getRoomBlock = (room: Room) => {
    if (room.blockName) return room.blockName;
    const m = room.roomNumber.match(/^([A-Za-z0-9]+(?:\s+[A-Za-z0-9]+)?)/i);
    return m ? m[1] : 'Resort Wing';
  };

  const availableBlocks = useMemo(() => {
    const set = new Set<string>();
    rooms.forEach((r) => {
      const b = getRoomBlock(r);
      if (b) set.add(b);
    });
    return Array.from(set).sort();
  }, [rooms]);

  const tabCounts = useMemo(() => ({
    ALL_STATUS: rooms.length,
    VACANT_ALL: rooms.filter((r) => r.status === 'VACANT_CLEAN' || r.status === 'VACANT_DIRTY').length,
    VACANT_CLEAN: rooms.filter((r) => r.status === 'VACANT_CLEAN').length,
    VACANT_DIRTY: rooms.filter((r) => r.status === 'VACANT_DIRTY').length,
    OCCUPIED: rooms.filter((r) => r.status === 'OCCUPIED').length,
    MAINTENANCE: rooms.filter((r) => r.status === 'MAINTENANCE' || r.status === 'OUT_OF_ORDER').length,
  }), [rooms]);

  const tierCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    MMENKO_ROOM_TIERS.forEach((t) => {
      counts[t.name] = 0;
    });
    rooms.forEach((r) => {
      const tier = getRoomTier(r);
      counts[tier.name] = (counts[tier.name] || 0) + 1;
    });
    return counts;
  }, [rooms]);

  const totalRooms = rooms.length;
  const occupancyPct = totalRooms > 0 ? Math.round((tabCounts.OCCUPIED / totalRooms) * 100) : 0;

  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      const tabMatch =
        activeTab === 'ALL_STATUS'
          ? true
          : activeTab === 'VACANT_ALL'
          ? r.status === 'VACANT_CLEAN' || r.status === 'VACANT_DIRTY'
          : activeTab === 'MAINTENANCE'
          ? r.status === 'MAINTENANCE' || r.status === 'OUT_OF_ORDER'
          : r.status === activeTab;
      if (!tabMatch) return false;

      if (enableBlocks && blockFilter !== 'ALL') {
        const b = getRoomBlock(r).toUpperCase();
        const target = blockFilter.toUpperCase();
        const isMatch =
          b === target ||
          b.startsWith(target) ||
          target.startsWith(b) ||
          (target === 'BLOCK_A' && (b.includes('WING A') || b.includes('BLOCK A'))) ||
          (target === 'BLOCK_B' && (b.includes('WING B') || b.includes('BLOCK B'))) ||
          (target === 'BLOCK_C' && (b.includes('WING C') || b.includes('BLOCK C') || b.includes('VILLA')));
        if (!isMatch) return false;
      }

      if (tierFilter !== 'ALL') {
        const tier = getRoomTier(r);
        if (
          tier.name.toLowerCase() !== tierFilter.toLowerCase() &&
          tier.id.toLowerCase() !== tierFilter.toLowerCase()
        ) {
          return false;
        }
      }

      if (searchTerm) {
        const q = searchTerm.toLowerCase().trim();
        const meta = roomMeta[r.roomNumber];
        const statusClean = r.status.toLowerCase().replace(/_/g, ' ');
        return (
          r.roomNumber.toLowerCase().includes(q) ||
          getRoomBlock(r).toLowerCase().includes(q) ||
          r.currentGuestName?.toLowerCase().includes(q) ||
          r.roomTypeName.toLowerCase().includes(q) ||
          meta?.displayName?.toLowerCase().includes(q) ||
          statusClean.includes(q) ||
          (q === 'vacant' && (r.status === 'VACANT_CLEAN' || r.status === 'VACANT_DIRTY')) ||
          (q === 'occupied' && r.status === 'OCCUPIED') ||
          (q === 'clean' && r.status === 'VACANT_CLEAN') ||
          (q === 'dirty' && r.status === 'VACANT_DIRTY')
        );
      }
      return true;
    });
  }, [rooms, activeTab, blockFilter, tierFilter, searchTerm, roomMeta, enableBlocks]);

  const formatRoomHeading = (roomNumber: string) => {
    if (!enableBlocks) {
      return cleanRoomNumberString(roomNumber);
    }
    return roomNumber;
  };

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

  // Quick 1-click cycle through authentic landing page tiers
  const handleQuickToggleRoomTier = async (room: Room) => {
    if (!canCustomizeRooms) {
      showToast({
        type: 'error',
        title: 'Permission Required',
        message: 'You need the Edit Room Settings permission to switch room tier.',
      });
      return;
    }
    const currentTier = getRoomTier(room);
    const currentIndex = MMENKO_ROOM_TIERS.findIndex(
      (t) => t.name.toLowerCase() === currentTier.name.toLowerCase()
    );
    const nextIndex = (currentIndex + 1) % MMENKO_ROOM_TIERS.length;
    const nextTier = MMENKO_ROOM_TIERS[nextIndex];

    try {
      const res = await fetch('/api/rooms', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomNumber: room.roomNumber,
          roomTypeName: nextTier.name,
          customName: nextTier.name,
          description: nextTier.description,
          rackRatePerNight: nextTier.rate,
          colorTag: nextTier.colorTag,
          colorBg: nextTier.colorBg,
          amenities: [...nextTier.features],
          staff: activeStaff,
          notes: `Switched ${room.roomNumber} tier to ${nextTier.name} (₦${nextTier.rate.toLocaleString()}/night).`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const updated = {
          ...roomMeta,
          [room.roomNumber]: { displayName: nextTier.name, colorTag: nextTier.colorTag, colorBg: nextTier.colorBg },
        };
        setRoomMeta(updated);
        saveRoomMeta(updated);
        setPriceEdits((prev) => ({ ...prev, [room.roomNumber]: nextTier.rate }));
        showToast({
          type: 'success',
          title: `Switched to ${nextTier.name}`,
          message: `${room.roomNumber} is now configured as ${nextTier.name} (${formatNaira(nextTier.rate)}/night).`,
        });
        onRefreshRooms();
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Update Error', message: err.message });
    }
  };

  const openRoomAdmin = (room: Room) => {
    const meta = roomMeta[room.roomNumber] || {};
    const tier = getRoomTier(room);
    setEditingRoom(room);
    setEditRoomNumber(room.roomNumber);
    setEditBlockName(room.blockName || getRoomBlock(room));
    setEditTier(tier.name);
    setEditName(meta.displayName || room.customName || tier.name);
    setEditDescription(room.description || tier.description);
    setEditColor(meta.colorTag || room.colorTag || tier.colorTag);
    setEditColorBg(meta.colorBg || room.colorBg || tier.colorBg);
    setEditPrice(priceEdits[room.roomNumber] ?? (room.rackRatePerNight || tier.rate));
    setEditAmenities(
      room.amenities && room.amenities.length > 0
        ? [...room.amenities]
        : [...tier.features]
    );
    setIsAdminModalOpen(true);
  };

  const handleSelectEditTierPreset = (tierName: string) => {
    const tier =
      MMENKO_ROOM_TIERS.find((t) => t.name.toLowerCase() === tierName.toLowerCase()) ||
      MMENKO_ROOM_TIERS[0];
    setEditTier(tier.name);
    setEditName(tier.name);
    setEditPrice(tier.rate);
    setEditDescription(tier.description);
    setEditAmenities([...tier.features]);
    setEditColor(tier.colorTag);
    setEditColorBg(tier.colorBg);
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

            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="btn-secondary"
              style={{ fontSize: '0.85rem', gap: '6px' }}
              title="Resort Architecture, Blocks & System Settings"
            >
              <Sliders size={15} /> <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Stats strip - Clickable Quick Filters */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '12px',
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-color)',
          }}
        >
          {[
            {
              label: 'Total Hotel Rooms',
              value: totalRooms,
              bg: activeTab === 'ALL_STATUS' && tierFilter === 'ALL' ? '#DBEAFE' : 'var(--bg-secondary)',
              border: activeTab === 'ALL_STATUS' && tierFilter === 'ALL' ? '#3B82F6' : 'var(--border-color)',
              color: 'var(--text-primary)',
              action: () => {
                setActiveTab('ALL_STATUS');
                setTierFilter('ALL');
                setBlockFilter('ALL');
              },
            },
            ...MMENKO_ROOM_TIERS.map((tier) => ({
              label: tier.name,
              value: tierCounts[tier.name] || 0,
              bg: tierFilter === tier.name ? tier.colorBg : '#FFFFFF',
              border: tierFilter === tier.name ? tier.colorTag : 'var(--border-color)',
              color: tier.colorTag,
              action: () => {
                setTierFilter(tier.name);
                setActiveTab('ALL_STATUS');
              },
            })),
            {
              label: 'Vacant Clean',
              value: tabCounts.VACANT_CLEAN,
              bg: activeTab === 'VACANT_CLEAN' ? '#BBF7D0' : '#F0FDF4',
              border: activeTab === 'VACANT_CLEAN' ? '#059669' : '#BBF7D0',
              color: '#059669',
              action: () => setActiveTab('VACANT_CLEAN'),
            },
            {
              label: 'Occupied',
              value: `${tabCounts.OCCUPIED} (${occupancyPct}%)`,
              bg: activeTab === 'OCCUPIED' ? '#FECACA' : '#FEF2F2',
              border: activeTab === 'OCCUPIED' ? '#DC2626' : '#FECACA',
              color: '#DC2626',
              action: () => setActiveTab('OCCUPIED'),
            },
            {
              label: 'Dirty / Maint.',
              value: tabCounts.VACANT_DIRTY + tabCounts.MAINTENANCE,
              bg: activeTab === 'VACANT_DIRTY' || activeTab === 'MAINTENANCE' ? '#FED7AA' : '#FFF7ED',
              border: activeTab === 'VACANT_DIRTY' || activeTab === 'MAINTENANCE' ? '#EA580C' : '#FDBA74',
              color: '#C2410C',
              action: () => setActiveTab('VACANT_DIRTY'),
            },
          ].map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={s.action}
              style={{
                background: s.bg,
                border: `1.5px solid ${s.border}`,
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ fontSize: '0.68rem', color: s.color, fontWeight: 700, textTransform: 'uppercase' }}>
                {s.label}
              </span>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: s.color, fontFamily: 'var(--font-mono)' }}>
                {s.value}
              </div>
            </button>
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
          {enableBlocks && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginRight: '4px' }}>
                BLOCK / WING:
              </span>
              <button
                type="button"
                onClick={() => setBlockFilter('ALL')}
                className={blockFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '5px 11px', fontSize: '0.74rem' }}
              >
                <Building2 size={12} />
                <span>All Blocks ({totalRooms})</span>
              </button>
              {availableBlocks.map((bName) => {
                const countInBlock = rooms.filter((r) => getRoomBlock(r) === bName).length;
                return (
                  <button
                    key={bName}
                    type="button"
                    onClick={() => setBlockFilter(bName)}
                    className={blockFilter === bName ? 'btn-primary' : 'btn-secondary'}
                    style={{ padding: '5px 11px', fontSize: '0.74rem' }}
                  >
                    <Building2 size={12} />
                    <span>
                      {bName} ({countInBlock})
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginRight: '4px' }}>
              TIER:
            </span>
            <button
              onClick={() => setTierFilter('ALL')}
              className={tierFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '5px 11px', fontSize: '0.74rem' }}
            >
              <span>All Tiers ({totalRooms})</span>
            </button>
            {MMENKO_ROOM_TIERS.map((tier) => (
              <button
                key={tier.id}
                onClick={() => setTierFilter(tier.name)}
                className={tierFilter === tier.name ? 'btn-primary' : 'btn-secondary'}
                style={{
                  padding: '5px 11px',
                  fontSize: '0.74rem',
                  ...(tierFilter === tier.name
                    ? { backgroundColor: tier.colorTag, borderColor: tier.colorTag, color: '#FFFFFF' }
                    : {}),
                }}
              >
                {tier.rate >= 100000 && <Star size={12} />}
                <span>
                  {tier.name} ({tierCounts[tier.name] || 0})
                </span>
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
            const roomTier = getRoomTier(room);
            const vip = isRoomVip(room);
            const accent = roomTier.colorTag;
            const accBg = roomTier.colorBg;
            const displayName = getRoomDisplayName(room);
            const blockLabel = getRoomBlock(room);
            const price = priceEdits[room.roomNumber] ?? room.rackRatePerNight ?? roomTier.rate;
            const roomDesc = room.description || roomTier.description;
            const amenitiesList =
              room.amenities && room.amenities.length > 0
                ? room.amenities
                : [...roomTier.features];

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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        {enableBlocks && blockLabel && (
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
                        )}
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '20px',
                            backgroundColor: roomTier.colorBg,
                            color: roomTier.colorTag,
                            border: `1px solid ${roomTier.colorTag}40`,
                          }}
                        >
                          {roomTier.rate >= 100000 && '★ '}
                          {roomTier.name}
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
                        displayName !== roomTier.name && (
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
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenCheckOut(room);
                      }}
                      className="btn-primary"
                      style={{
                        width: '100%',
                        justifyContent: 'center',
                        fontSize: '0.825rem',
                        backgroundColor: '#DC2626',
                        borderColor: '#DC2626',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(220, 38, 38, 0.35)',
                      }}
                    >
                      <LogOut size={15} color="#FFFFFF" /> <span style={{ color: '#FFFFFF', fontWeight: 700 }}>Review &amp; Check-Out</span>
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
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {room.status === 'OCCUPIED' && canCheckOut && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenCheckOut(room);
                            }}
                            style={{
                              backgroundColor: '#DC2626',
                              borderColor: '#DC2626',
                              color: '#FFFFFF',
                              fontWeight: 700,
                              fontSize: '0.72rem',
                              padding: '5px 10px',
                              borderRadius: '5px',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <LogOut size={12} color="#FFFFFF" />
                            <span style={{ color: '#FFFFFF', fontWeight: 700 }}>Check-Out</span>
                          </button>
                        )}
                        {room.status === 'VACANT_CLEAN' && canCheckIn && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenCheckIn(room);
                            }}
                            style={{
                              backgroundColor: '#059669',
                              borderColor: '#059669',
                              color: '#FFFFFF',
                              fontWeight: 700,
                              fontSize: '0.72rem',
                              padding: '5px 10px',
                              borderRadius: '5px',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <UserPlus size={12} color="#FFFFFF" />
                            <span style={{ color: '#FFFFFF', fontWeight: 700 }}>Check-In</span>
                          </button>
                        )}
                        {room.status === 'VACANT_DIRTY' && canStatusOverride && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkRoomClean(room);
                            }}
                            style={{
                              backgroundColor: '#FFFBEB',
                              border: '1px solid #FDE68A',
                              color: '#D97706',
                              fontWeight: 700,
                              fontSize: '0.72rem',
                              padding: '5px 10px',
                              borderRadius: '5px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Sparkles size={12} color="#D97706" />
                            <span>Mark Clean</span>
                          </button>
                        )}
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
                    marginBottom: '8px',
                  }}
                >
                  1. Room Tier Preset (Landing Page Rates &amp; Amenities)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px' }}>
                  {MMENKO_ROOM_TIERS.map((tier) => {
                    const isSelected = editTier.toLowerCase() === tier.name.toLowerCase();
                    return (
                      <button
                        type="button"
                        key={tier.id}
                        onClick={() => handleSelectEditTierPreset(tier.name)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: isSelected ? `2px solid ${tier.colorTag}` : '1px solid var(--border-color)',
                          backgroundColor: isSelected ? tier.colorBg : '#FFFFFF',
                          textAlign: 'left',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.82rem', color: tier.colorTag }}>
                            {tier.name}
                          </span>
                          {isSelected && <Check size={14} color={tier.colorTag} />}
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                          {formatNaira(tier.rate)}/night
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {tier.features.slice(0, 2).join(' • ')}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. CRM Room Naming & Block */}
              {enableBlocks ? (
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
                      list="mmenko-block-presets"
                      value={editBlockName}
                      onChange={(e) => setEditBlockName(e.target.value)}
                      placeholder="e.g. Block A1"
                      style={{ width: '100%' }}
                    />
                    <datalist id="mmenko-block-presets">
                      {BLOCK_PRESETS.map((b) => (
                        <option key={b} value={b} />
                      ))}
                    </datalist>
                  </div>
                </div>
              ) : (
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
                    CRM Room Name / Number
                  </label>
                  <input
                    type="text"
                    value={editRoomNumber}
                    onChange={(e) => setEditRoomNumber(e.target.value)}
                    placeholder="e.g. Room 1"
                    style={{ width: '100%' }}
                  />
                </div>
              )}

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
              {/* Quick Block & Room Builder (Shown only when Room Blocks are enabled in Settings) */}
              {enableBlocks && (
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
              )}

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
                    placeholder={enableBlocks ? 'e.g. Block A1 Room 1' : 'e.g. Room 16'}
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

              {/* Room Tier Preset: Authentic 5 Landing Page Tiers */}
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
                  Select Room Tier Preset (Landing Page Rates &amp; Amenities)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px' }}>
                  {MMENKO_ROOM_TIERS.map((tier) => {
                    const isSelected = newRoomTypeName.toLowerCase() === tier.name.toLowerCase();
                    return (
                      <button
                        type="button"
                        key={tier.id}
                        onClick={() => handleSelectCreateTier(tier.name)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: isSelected ? `2px solid ${tier.colorTag}` : '1px solid var(--border-color)',
                          backgroundColor: isSelected ? tier.colorBg : '#FFFFFF',
                          textAlign: 'left',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.82rem', color: tier.colorTag }}>
                            {tier.name}
                          </span>
                          {isSelected && <Check size={14} color={tier.colorTag} />}
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                          {formatNaira(tier.rate)}/night
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {tier.features.slice(0, 2).join(' • ')}
                        </div>
                      </button>
                    );
                  })}
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
      {/* Architecture, Room Blocks & System Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onRoomsRefreshed={onRefreshRooms}
      />
    </div>
  );
}
