'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Edit3, 
  Trash2, 
  Clock, 
  Users, 
  DollarSign, 
  Layers, 
  CheckCircle2, 
  Sparkles, 
  ArrowLeft,
  LayoutGrid,
  List,
  Filter,
  X,
  Calendar,
  Tag,
  UserPlus,
  LogOut,
  ShieldCheck,
  CreditCard,
  FileText,
  AlertTriangle,
  Play
} from 'lucide-react';
import { StaffUser } from '@hosos/types';
import { hasPermission } from '@/lib/rbac';
import { useFeedback } from '@/context/FeedbackContext';

export type HallOperationalStatus = 'AVAILABLE' | 'RESERVED' | 'EVENT_IN_PROGRESS' | 'CLEANING_TURNAROUND' | 'MAINTENANCE';

export interface EventBookingData {
  bookingId: string;
  eventName: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  date: string;
  timeSlot: string;
  totalAmount: number;
  depositPaid: number;
  balanceDue: number;
  paymentMethod: 'POS' | 'TRANSFER' | 'CASH' | 'SPLIT';
  splitDetails?: {
    method1: string;
    amount1: number;
    method2: string;
    amount2: number;
  };
  status: 'CONFIRMED' | 'IN_PROGRESS' | 'CONCLUDED';
  bookedBy?: string;
}

export interface ServiceItemData {
  id: string;
  serviceId: string;
  name: string;
  group: string;
  price: number;
  duration: string;
  capacity?: number;
  description?: string;
  status: HallOperationalStatus;
  amenities?: string[];
  currentEvent?: EventBookingData | null;
  bookingHistory?: any[];
  isAvailable: boolean;
  addedBy?: string;
}

interface HallsAndServicesViewProps {
  activeStaff: StaffUser;
  onBack: () => void;
  defaultGroup?: string;
}

const CANONICAL_GROUPS = ['Rooms', 'Kitchen', 'Drinks', 'Halls and Events'];

const STANDARD_VENUE_AMENITIES = [
  'Central Air Conditioning',
  'Acoustic Sound Treatment',
  'Dual 4K Laser Projectors',
  'Intelligent Stage Lighting',
  'Backup Generator 250kVA',
  'VIP Dressing Suites',
  'Banquet Tables & Chiavari Chairs',
  'High-Speed Dedicated Wi-Fi',
  'Podium & Wireless Lapel Mics',
  'Dedicated Restrooms',
  'Outdoor Lawn Canopy',
];

export default function HallsAndServicesView({ activeStaff, onBack, defaultGroup = 'Halls and Events' }: HallsAndServicesViewProps) {
  const { showSuccess, showFailed, showConfirm } = useFeedback();
  const [services, setServices] = useState<ServiceItemData[]>([]);
  const [groups, setGroups] = useState<string[]>(['Rooms', 'Kitchen', 'Drinks', 'Halls and Events', 'Laundry & Ancillary Services']);
  const [selectedGroup, setSelectedGroup] = useState<string>(defaultGroup);
  const [activeStatusTab, setActiveStatusTab] = useState<'ALL' | HallOperationalStatus>('ALL');
  const [displayMode, setDisplayMode] = useState<'CARDS' | 'LIST'>('CARDS');
  const [isLoading, setIsLoading] = useState(true);

  // Permission Checks
  const isSuperAdmin = activeStaff.role === 'SUPERADMIN' || activeStaff.role === 'OWNER' || (activeStaff.role as any) === 'ADMIN';
  const canBookHall = isSuperAdmin || hasPermission(activeStaff.role, 'halls.book' as any, activeStaff.id);
  const canCheckInHall = isSuperAdmin || hasPermission(activeStaff.role, 'halls.checkin' as any, activeStaff.id);
  const canCheckOutHall = isSuperAdmin || hasPermission(activeStaff.role, 'halls.checkout' as any, activeStaff.id);
  const canManageHalls = isSuperAdmin || hasPermission(activeStaff.role, 'halls.manage' as any, activeStaff.id) || hasPermission(activeStaff.role, 'services.manage', activeStaff.id);

  // Modal State: Create / Edit Venue or Service
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ServiceItemData | null>(null);
  const [name, setName] = useState('');
  const [group, setGroup] = useState('Halls and Events');
  const [isCreatingNewGroup, setIsCreatingNewGroup] = useState(false);
  const [customGroupName, setCustomGroupName] = useState('');
  const [price, setPrice] = useState<number | ''>(250000);
  const [duration, setDuration] = useState('Full Day (8:00 AM - 06:00 PM)');
  const [capacity, setCapacity] = useState<number | ''>(300);
  const [description, setDescription] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [customAmenityInput, setCustomAmenityInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Modal State: Book / Reserve Venue (Operates like Room Check-In)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingVenue, setBookingVenue] = useState<ServiceItemData | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('+234 80');
  const [clientEmail, setClientEmail] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('2026-10-30');
  const [eventTimeSlot, setEventTimeSlot] = useState('10:00 AM - 06:00 PM');
  const [bookingTotalAmount, setBookingTotalAmount] = useState<number>(500000);
  const [depositPaid, setDepositPaid] = useState<number>(250000);
  const [paymentMethod, setPaymentMethod] = useState<'POS' | 'TRANSFER' | 'CASH' | 'SPLIT'>('TRANSFER');
  const [splitMethod1, setSplitMethod1] = useState('TRANSFER');
  const [splitAmount1, setSplitAmount1] = useState<number>(200000);
  const [splitMethod2, setSplitMethod2] = useState('CASH');
  const [splitAmount2, setSplitAmount2] = useState<number>(50000);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  // Modal State: Conclude Event & Check-Out
  const [isCheckOutModalOpen, setIsCheckOutModalOpen] = useState(false);
  const [checkOutVenue, setCheckOutVenue] = useState<ServiceItemData | null>(null);
  const [settlementPaymentMethod, setSettlementPaymentMethod] = useState<'POS' | 'TRANSFER' | 'CASH' | 'SPLIT'>('POS');
  const [settleSplit1, setSettleSplit1] = useState('POS');
  const [settleAmount1, setSettleAmount1] = useState<number>(0);
  const [settleSplit2, setSettleSplit2] = useState('CASH');
  const [settleAmount2, setSettleAmount2] = useState<number>(0);
  const [isConcluding, setIsConcluding] = useState(false);

  // Modal State: Event Folio / Details
  const [viewingFolioVenue, setViewingFolioVenue] = useState<ServiceItemData | null>(null);

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/services');
      const data = await res.json();
      if (data.success && data.services) {
        setServices(data.services);
        if (data.groups && data.groups.length > 0) {
          setGroups(data.groups);
        }
      }
    } catch (err: any) {
      console.warn('Could not load services:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setName('');
    setGroup(selectedGroup === 'ALL' ? 'Halls and Events' : selectedGroup);
    setIsCreatingNewGroup(false);
    setCustomGroupName('');
    setPrice(selectedGroup === 'Halls and Events' ? 450000 : 5000);
    setDuration(selectedGroup === 'Halls and Events' ? 'Full Day (8:00 AM - 06:00 PM)' : 'Same Day');
    setCapacity(selectedGroup === 'Halls and Events' ? 300 : 0);
    setDescription('');
    setSelectedAmenities(selectedGroup === 'Halls and Events' ? ['Central Air Conditioning', 'Acoustic Sound Treatment', 'Stage & Lighting'] : []);
    setIsModalOpen(true);
  };

  const openEditModal = (item: ServiceItemData) => {
    setEditingItem(item);
    setName(item.name);
    setGroup(item.group);
    setIsCreatingNewGroup(false);
    setCustomGroupName('');
    setPrice(item.price);
    setDuration(item.duration);
    setCapacity(item.capacity || 0);
    setDescription(item.description || '');
    setSelectedAmenities(item.amenities || []);
    setIsModalOpen(true);
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const addCustomAmenity = () => {
    if (!customAmenityInput.trim()) return;
    const trimmed = customAmenityInput.trim();
    if (!selectedAmenities.includes(trimmed)) {
      setSelectedAmenities([...selectedAmenities, trimmed]);
    }
    setCustomAmenityInput('');
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || price === '' || !duration.trim()) return;

    const finalGroup = isCreatingNewGroup && customGroupName.trim()
      ? customGroupName.trim()
      : group;

    setIsSaving(true);
    try {
      if (editingItem) {
        const res = await fetch('/api/services', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceId: editingItem.serviceId,
            name: name.trim(),
            group: finalGroup,
            price: Number(price),
            duration: duration.trim(),
            capacity: Number(capacity) || 0,
            description: description.trim(),
            amenities: selectedAmenities,
            updatedBy: activeStaff.name,
          }),
        });
        const data = await res.json();
        if (data.success) {
          showSuccess('Venue / Service Updated', `${name} settings saved to database.`);
          setIsModalOpen(false);
          fetchServices();
        } else {
          showFailed('Update Error', data.error || 'Failed to update service.');
        }
      } else {
        const res = await fetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            group: finalGroup,
            price: Number(price),
            duration: duration.trim(),
            capacity: Number(capacity) || 0,
            description: description.trim(),
            amenities: selectedAmenities,
            addedBy: activeStaff.name,
          }),
        });
        const data = await res.json();
        if (data.success) {
          showSuccess('New Venue Created', `${name} successfully added to group [${finalGroup}].`);
          setIsModalOpen(false);
          fetchServices();
        } else {
          showFailed('Creation Error', data.error || 'Failed to create service.');
        }
      }
    } catch (err: any) {
      showFailed('Network Error', err.message || 'Could not communicate with server.');
    } finally {
      setIsSaving(false);
    }
  };

  // Open Event Booking Modal (Check-In flow for halls)
  const openBookingModal = (venue: ServiceItemData) => {
    setBookingVenue(venue);
    setBookingTotalAmount(venue.price);
    setDepositPaid(Math.round(venue.price * 0.5));
    setClientName('');
    setClientPhone('+234 80');
    setClientEmail('');
    setEventName('');
    setEventDate(new Date().toISOString().split('T')[0]);
    setEventTimeSlot('10:00 AM - 06:00 PM');
    setPaymentMethod('TRANSFER');
    setSplitAmount1(Math.round(venue.price * 0.35));
    setSplitAmount2(Math.round(venue.price * 0.15));
    setIsBookingModalOpen(true);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingVenue || !clientName.trim() || !eventName.trim()) return;

    const balanceDue = Math.max(0, bookingTotalAmount - depositPaid);
    const bookingPayload: EventBookingData = {
      bookingId: `EVT-${Date.now().toString().slice(-6)}`,
      eventName: eventName.trim(),
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientEmail: clientEmail.trim(),
      date: eventDate,
      timeSlot: eventTimeSlot,
      totalAmount: bookingTotalAmount,
      depositPaid,
      balanceDue,
      paymentMethod,
      splitDetails: paymentMethod === 'SPLIT' ? {
        method1: splitMethod1,
        amount1: splitAmount1,
        method2: splitMethod2,
        amount2: splitAmount2,
      } : undefined,
      status: 'CONFIRMED',
      bookedBy: activeStaff.name,
    };

    setIsSubmittingBooking(true);
    try {
      const res = await fetch('/api/services', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: bookingVenue.serviceId,
          action: 'BOOK_HALL',
          currentEvent: bookingPayload,
          updatedBy: activeStaff.name,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showSuccess(
          'Venue Reserved Successfully!',
          `"${eventName}" booked at ${bookingVenue.name} for ${clientName}.`,
          `Deposit of ${formatNaira(depositPaid)} verified via ${paymentMethod}. Folio #${bookingPayload.bookingId} issued.`
        );
        setIsBookingModalOpen(false);
        fetchServices();
      } else {
        showFailed('Booking Failed', data.error || 'Server rejected booking.');
      }
    } catch (err: any) {
      showFailed('Network Error', err.message);
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // Start Event / Check-in
  const handleStartEvent = (venue: ServiceItemData) => {
    showConfirm(
      'Start Event / Check-In Venue?',
      `Transition "${venue.name}" to EVENT IN PROGRESS for "${venue.currentEvent?.eventName || 'Booked Event'}"? This indicates active venue usage.`,
      async () => {
        try {
          const res = await fetch('/api/services', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              serviceId: venue.serviceId,
              action: 'START_EVENT',
              updatedBy: activeStaff.name,
            }),
          });
          const data = await res.json();
          if (data.success) {
            showSuccess('Event Started!', `${venue.name} is now marked as EVENT IN PROGRESS.`);
            fetchServices();
          } else {
            showFailed('Error', data.error);
          }
        } catch (err: any) {
          showFailed('Network Error', err.message);
        }
      },
      { confirmText: 'Start Event Now', variant: 'emerald' }
    );
  };

  // Open Conclude Event / Check-Out Modal
  const openCheckOutModal = (venue: ServiceItemData) => {
    setCheckOutVenue(venue);
    const balance = venue.currentEvent?.balanceDue || 0;
    setSettleAmount1(Math.round(balance * 0.7));
    setSettleAmount2(balance - Math.round(balance * 0.7));
    setIsCheckOutModalOpen(true);
  };

  const handleConcludeEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkOutVenue) return;

    setIsConcluding(true);
    try {
      const res = await fetch('/api/services', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: checkOutVenue.serviceId,
          action: 'CONCLUDE_EVENT',
          updatedBy: activeStaff.name,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showSuccess(
          'Event Concluded & Bill Settled!',
          `"${checkOutVenue.name}" has been released to CLEANING & TURNAROUND.`,
          `Folio settled via ${settlementPaymentMethod}. Archived in venue history.`
        );
        setIsCheckOutModalOpen(false);
        fetchServices();
      } else {
        showFailed('Error', data.error);
      }
    } catch (err: any) {
      showFailed('Network Error', err.message);
    } finally {
      setIsConcluding(false);
    }
  };

  // Mark Clean & Ready
  const handleMarkClean = (venue: ServiceItemData) => {
    showConfirm(
      'Mark Venue Clean & Available?',
      `Confirm that "${venue.name}" post-event teardown, sanitization, and equipment inspection have been completed?`,
      async () => {
        try {
          const res = await fetch('/api/services', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              serviceId: venue.serviceId,
              action: 'MARK_CLEAN',
              updatedBy: activeStaff.name,
            }),
          });
          const data = await res.json();
          if (data.success) {
            showSuccess('Venue Clean & Ready!', `"${venue.name}" is now AVAILABLE for new bookings.`);
            fetchServices();
          } else {
            showFailed('Error', data.error);
          }
        } catch (err: any) {
          showFailed('Network Error', err.message);
        }
      },
      { confirmText: 'Mark Clean & Available', variant: 'emerald' }
    );
  };

  const handleDeleteService = (serviceId: string, serviceName: string) => {
    showConfirm(
      'Delete Service / Venue?',
      `Are you sure you want to delete "${serviceName}"? This will remove it from available catalogs in MongoDB Atlas.`,
      async () => {
        try {
          const res = await fetch(`/api/services?serviceId=${encodeURIComponent(serviceId)}`, {
            method: 'DELETE',
          });
          const data = await res.json();
          if (data.success) {
            showSuccess('Service Deleted', `"${serviceName}" has been removed.`);
            fetchServices();
          } else {
            showFailed('Deletion Error', data.error || 'Failed to delete service.');
          }
        } catch (err: any) {
          showFailed('Error', err.message);
        }
      },
      { variant: 'danger', confirmText: 'Yes, Delete', cancelText: 'Cancel' }
    );
  };

  // Status Filter Tabs (Identical to Room Status Tabs!)
  const statusTabs: Array<{ id: 'ALL' | HallOperationalStatus; label: string; count: number; color: string; bg: string }> = [
    { id: 'ALL', label: 'All Venues', count: services.filter(s => selectedGroup === 'ALL' || s.group.toLowerCase() === selectedGroup.toLowerCase()).length, color: 'var(--brand-primary)', bg: 'var(--bg-secondary)' },
    { id: 'AVAILABLE', label: 'Available', count: services.filter(s => (selectedGroup === 'ALL' || s.group.toLowerCase() === selectedGroup.toLowerCase()) && s.status === 'AVAILABLE').length, color: '#059669', bg: '#F0FDF4' },
    { id: 'RESERVED', label: 'Reserved / Booked', count: services.filter(s => (selectedGroup === 'ALL' || s.group.toLowerCase() === selectedGroup.toLowerCase()) && s.status === 'RESERVED').length, color: '#2563eb', bg: '#EFF6FF' },
    { id: 'EVENT_IN_PROGRESS', label: 'In Progress (Active)', count: services.filter(s => (selectedGroup === 'ALL' || s.group.toLowerCase() === selectedGroup.toLowerCase()) && s.status === 'EVENT_IN_PROGRESS').length, color: '#7C3AED', bg: '#F5F3FF' },
    { id: 'CLEANING_TURNAROUND', label: 'Cleaning & Reset', count: services.filter(s => (selectedGroup === 'ALL' || s.group.toLowerCase() === selectedGroup.toLowerCase()) && s.status === 'CLEANING_TURNAROUND').length, color: '#D97706', bg: '#FFFBEB' },
    { id: 'MAINTENANCE', label: 'Maintenance', count: services.filter(s => (selectedGroup === 'ALL' || s.group.toLowerCase() === selectedGroup.toLowerCase()) && s.status === 'MAINTENANCE').length, color: '#E11D48', bg: '#FFF1F2' },
  ];

  const filteredServices = services.filter((item) => {
    const matchesGroup = selectedGroup === 'ALL' || item.group.toLowerCase() === selectedGroup.toLowerCase();
    const matchesStatus = activeStatusTab === 'ALL' || item.status === activeStatusTab;
    return matchesGroup && matchesStatus;
  });

  const getStatusBadge = (status: HallOperationalStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return <span className="badge badge-clean">✓ Available</span>;
      case 'RESERVED':
        return <span className="badge badge-brand">● Reserved / Booked</span>;
      case 'EVENT_IN_PROGRESS':
        return <span className="badge badge-purple" style={{ animation: 'pulse 2s infinite' }}>⚡ Event In Progress</span>;
      case 'CLEANING_TURNAROUND':
        return <span className="badge badge-dirty">🧹 Cleaning & Reset</span>;
      case 'MAINTENANCE':
        return <span className="badge badge-rose">🔧 Maintenance</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px 0 60px' }}>
      
      {/* Top Header & Navigation Bar */}
      <div className="ent-card" style={{ padding: '20px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={onBack}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                }}
              >
                <ArrowLeft size={14} /> Back to Command Hub
              </button>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                Halls, Venues & Ancillary Operations Board
              </h2>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '6px', marginBottom: 0 }}>
              Symmetrical operational board for banquet halls, auditoriums, wedding gardens, and laundry ancillary services.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* View Mode Toggle: Cards vs List */}
            <div style={{ display: 'flex', backgroundColor: 'var(--bg-secondary)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => setDisplayMode('CARDS')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  fontWeight: displayMode === 'CARDS' ? 800 : 600,
                  borderRadius: '6px',
                  backgroundColor: displayMode === 'CARDS' ? 'var(--brand-primary)' : 'transparent',
                  color: displayMode === 'CARDS' ? '#FFFFFF' : 'var(--text-secondary)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <LayoutGrid size={13} />
                <span>Cards</span>
              </button>
              <button
                onClick={() => setDisplayMode('LIST')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  fontWeight: displayMode === 'LIST' ? 800 : 600,
                  borderRadius: '6px',
                  backgroundColor: displayMode === 'LIST' ? 'var(--brand-primary)' : 'transparent',
                  color: displayMode === 'LIST' ? '#FFFFFF' : 'var(--text-secondary)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <List size={13} />
                <span>List</span>
              </button>
            </div>

            {/* Super Admin Create Button */}
            {canManageHalls && (
              <button onClick={openAddModal} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.825rem' }}>
                <Plus size={15} />
                <span>+ Add Venue / Service</span>
              </button>
            )}
          </div>
        </div>

        {/* Department Group Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '20px', flexWrap: 'wrap', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          <button
            onClick={() => setSelectedGroup('ALL')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: selectedGroup === 'ALL' ? 800 : 600,
              backgroundColor: selectedGroup === 'ALL' ? 'var(--brand-primary)' : 'var(--bg-secondary)',
              color: selectedGroup === 'ALL' ? '#FFFFFF' : 'var(--text-secondary)',
              border: `1px solid ${selectedGroup === 'ALL' ? 'var(--brand-primary)' : 'var(--border-subtle)'}`,
              cursor: 'pointer',
            }}
          >
            All Groups ({services.length})
          </button>

          {groups.map((grp) => {
            const count = services.filter((s) => s.group.toLowerCase() === grp.toLowerCase()).length;
            const isSelected = selectedGroup.toLowerCase() === grp.toLowerCase();
            return (
              <button
                key={grp}
                onClick={() => setSelectedGroup(grp)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: isSelected ? 800 : 600,
                  backgroundColor: isSelected ? 'var(--brand-primary)' : 'var(--bg-secondary)',
                  color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                  border: `1px solid ${isSelected ? 'var(--brand-primary)' : 'var(--border-subtle)'}`,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>{grp}</span>
                <span style={{
                  fontSize: '0.65rem',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : 'var(--border-color)',
                  color: isSelected ? '#FFFFFF' : 'var(--text-muted)',
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Status Switcher Tabs (Symmetrical to Front Desk Room Tabs!) */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
          {statusTabs.map((tab) => {
            const isSelected = activeStatusTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveStatusTab(tab.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: isSelected ? 800 : 600,
                  backgroundColor: isSelected ? tab.color : 'transparent',
                  color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                  border: `1px solid ${isSelected ? tab.color : 'var(--border-subtle)'}`,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{tab.label}</span>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '1px 5px',
                  borderRadius: '8px',
                  backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : 'var(--bg-secondary)',
                  color: isSelected ? '#FFFFFF' : 'var(--text-muted)',
                }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Services & Venues Content: CARDS Display */}
      {displayMode === 'CARDS' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '20px',
        }}>
          {filteredServices.map((item) => (
            <div
              key={item.serviceId}
              className="ent-card"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderTop: item.status === 'EVENT_IN_PROGRESS'
                  ? '4px solid #7C3AED'
                  : item.status === 'RESERVED'
                  ? '4px solid #2563EB'
                  : item.status === 'CLEANING_TURNAROUND'
                  ? '4px solid #D97706'
                  : '4px solid #059669',
                position: 'relative',
              }}
            >
              <div>
                {/* Header Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                    {item.group}
                  </span>
                  {getStatusBadge(item.status)}
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                  {item.name}
                </h3>

                {item.description && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 12px', lineHeight: 1.5 }}>
                    {item.description}
                  </p>
                )}

                {/* Capacity & Price Strip */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', marginBottom: '14px' }}>
                  {item.capacity ? (
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Capacity</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#8B5CF6' }}>Up to {item.capacity} Guests</div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Turnaround</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.duration}</div>
                    </div>
                  )}

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Standard Rate</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--emerald-primary)', fontFamily: 'var(--font-mono)' }}>
                      {formatNaira(item.price)}
                    </div>
                  </div>
                </div>

                {/* Amenities Badges */}
                {item.amenities && item.amenities.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '14px' }}>
                    {item.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        style={{
                          fontSize: '0.68rem',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          backgroundColor: 'rgba(37,99,235,0.06)',
                          color: 'var(--brand-primary)',
                          border: '1px solid rgba(37,99,235,0.15)',
                          fontWeight: 600,
                        }}
                      >
                        ✓ {amenity}
                      </span>
                    ))}
                  </div>
                )}

                {/* Current Active or Reserved Event Strip */}
                {item.currentEvent && (
                  <div style={{ padding: '12px', background: item.status === 'EVENT_IN_PROGRESS' ? '#F5F3FF' : '#EFF6FF', borderRadius: '8px', border: `1px solid ${item.status === 'EVENT_IN_PROGRESS' ? '#DDD6FE' : '#BFDBFE'}`, marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: item.status === 'EVENT_IN_PROGRESS' ? '#6D28D9' : '#1D4ED8', textTransform: 'uppercase' }}>
                        {item.status === 'EVENT_IN_PROGRESS' ? '⚡ Ongoing Event' : '📅 Confirmed Booking'}
                      </span>
                      <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-secondary)' }}>
                        {item.currentEvent.timeSlot}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                      {item.currentEvent.eventName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Client: <strong>{item.currentEvent.clientName}</strong> ({item.currentEvent.clientPhone})
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                      <span>Deposit: <strong>{formatNaira(item.currentEvent.depositPaid)}</strong></span>
                      <span style={{ color: item.currentEvent.balanceDue > 0 ? '#E11D48' : '#059669', fontWeight: 700 }}>
                        Balance: {formatNaira(item.currentEvent.balanceDue)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Interactive Operational Actions (Symmetrical to Check-in / Check-out) */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', marginTop: '10px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {/* Booking action for Available venues */}
                    {item.status === 'AVAILABLE' && canBookHall && (
                      <button
                        onClick={() => openBookingModal(item)}
                        className="btn-primary"
                        style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                      >
                        <Calendar size={13} />
                        <span>Book Venue</span>
                      </button>
                    )}

                    {/* Start event for Reserved venues */}
                    {item.status === 'RESERVED' && canCheckInHall && (
                      <button
                        onClick={() => handleStartEvent(item)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.75rem',
                          backgroundColor: '#059669',
                          color: '#FFFFFF',
                          borderRadius: '6px',
                          border: 'none',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <Play size={12} fill="#FFFFFF" />
                        <span>Start Event</span>
                      </button>
                    )}

                    {/* Conclude event for In-Progress venues */}
                    {item.status === 'EVENT_IN_PROGRESS' && canCheckOutHall && (
                      <button
                        onClick={() => openCheckOutModal(item)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.75rem',
                          backgroundColor: '#E11D48',
                          color: '#FFFFFF',
                          borderRadius: '6px',
                          border: 'none',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <LogOut size={13} />
                        <span>Conclude & Settle</span>
                      </button>
                    )}

                    {/* Mark Clean for Turnaround venues */}
                    {item.status === 'CLEANING_TURNAROUND' && (
                      <button
                        onClick={() => handleMarkClean(item)}
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.75rem', color: '#059669', borderColor: '#86EFAC', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                      >
                        <Sparkles size={13} color="#059669" />
                        <span>Mark Clean</span>
                      </button>
                    )}

                    {/* View Folio if event exists */}
                    {item.currentEvent && (
                      <button
                        onClick={() => setViewingFolioVenue(item)}
                        className="btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <FileText size={12} />
                        <span>Folio</span>
                      </button>
                    )}
                  </div>

                  {/* Admin settings */}
                  {canManageHalls && (
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button
                        onClick={() => openEditModal(item)}
                        className="btn-secondary"
                        style={{ padding: '5px 8px', fontSize: '0.72rem' }}
                        title="Edit Venue Settings & Amenities"
                      >
                        <Edit3 size={12} color="var(--brand-primary)" />
                      </button>
                      <button
                        onClick={() => handleDeleteService(item.serviceId, item.name)}
                        className="btn-danger"
                        style={{ padding: '5px 8px', fontSize: '0.72rem' }}
                        title="Delete Venue"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Services Content: LIST Display */}
      {displayMode === 'LIST' && (
        <div className="ent-card" style={{ padding: '20px' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="ent-table" style={{ width: '100%', fontSize: '0.825rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-secondary)', textAlign: 'left' }}>
                  <th style={{ padding: '10px 14px' }}>Venue / Service</th>
                  <th style={{ padding: '10px 14px' }}>Department Group</th>
                  <th style={{ padding: '10px 14px' }}>Capacity / Turnaround</th>
                  <th style={{ padding: '10px 14px' }}>Standard Rate</th>
                  <th style={{ padding: '10px 14px' }}>Current Status</th>
                  <th style={{ padding: '10px 14px' }}>Current Event / Client</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((item) => (
                  <tr key={item.serviceId} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {item.name}
                      {item.amenities && item.amenities.length > 0 && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--brand-primary)', fontWeight: 500, marginTop: '2px' }}>
                          {item.amenities.slice(0, 3).join(' • ')} {item.amenities.length > 3 ? `+${item.amenities.length - 3} more` : ''}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className="badge badge-purple" style={{ fontSize: '0.68rem' }}>{item.group}</span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      {item.capacity ? `${item.capacity} Guests` : item.duration}
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--emerald-primary)' }}>
                      {formatNaira(item.price)}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      {getStatusBadge(item.status)}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      {item.currentEvent ? (
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.currentEvent.eventName}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.currentEvent.clientName}</div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        {item.status === 'AVAILABLE' && canBookHall && (
                          <button onClick={() => openBookingModal(item)} className="btn-primary" style={{ padding: '4px 8px', fontSize: '0.7rem' }}>
                            Book
                          </button>
                        )}
                        {item.status === 'RESERVED' && canCheckInHall && (
                          <button onClick={() => handleStartEvent(item)} style={{ padding: '4px 8px', fontSize: '0.7rem', backgroundColor: '#059669', color: '#fff', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
                            Start
                          </button>
                        )}
                        {item.status === 'EVENT_IN_PROGRESS' && canCheckOutHall && (
                          <button onClick={() => openCheckOutModal(item)} style={{ padding: '4px 8px', fontSize: '0.7rem', backgroundColor: '#E11D48', color: '#fff', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
                            Conclude
                          </button>
                        )}
                        {item.status === 'CLEANING_TURNAROUND' && (
                          <button onClick={() => handleMarkClean(item)} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem', color: '#059669' }}>
                            Clean
                          </button>
                        )}
                        {canManageHalls && (
                          <button onClick={() => openEditModal(item)} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem' }}>
                            <Edit3 size={11} color="var(--brand-primary)" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: Book / Reserve Venue (Operates Symmetrically like Room Check-In) */}
      {isBookingModalOpen && bookingVenue && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120, padding: '20px' }}>
          <div className="ent-card" style={{ width: '100%', maxWidth: '600px', padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calendar size={22} color="var(--brand-primary)" />
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Reserve & Book Venue: {bookingVenue.name}
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                    Standard Rate: {formatNaira(bookingVenue.price)} · Capacity: {bookingVenue.capacity} Guests
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => setIsBookingModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Event Title / Purpose
                </label>
                <input
                  type="text"
                  placeholder="e.g. TotalEnergies Annual General Meeting, Adewale Wedding Gala Reception"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  required
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Client / Corporate Host Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Chief Babatunde Adeleke"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    required
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Phone Contact
                  </label>
                  <input
                    type="text"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    required
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    required
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Time Slot / Schedule (12-Hour)
                  </label>
                  <input
                    type="text"
                    value={eventTimeSlot}
                    onChange={(e) => setEventTimeSlot(e.target.value)}
                    placeholder="10:00 AM - 06:00 PM"
                    required
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Price & Deposit */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Agreed Hall Fee (₦ NGN)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={bookingTotalAmount}
                    onChange={(e) => setBookingTotalAmount(Number(e.target.value))}
                    required
                    style={{ width: '100%', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Deposit Paid Now (₦ NGN)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={bookingTotalAmount}
                    value={depositPaid}
                    onChange={(e) => setDepositPaid(Number(e.target.value))}
                    required
                    style={{ width: '100%', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--emerald-primary)' }}
                  />
                </div>
              </div>

              {/* Payment Method Selector (POS, Transfer, Cash, Split) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Settlement Method for Deposit
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {(['POS', 'TRANSFER', 'CASH', 'SPLIT'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: paymentMethod === m ? 800 : 600,
                        backgroundColor: paymentMethod === m ? 'var(--brand-primary)' : 'var(--bg-secondary)',
                        color: paymentMethod === m ? '#FFFFFF' : 'var(--text-secondary)',
                        border: `1px solid ${paymentMethod === m ? 'var(--brand-primary)' : 'var(--border-color)'}`,
                        cursor: 'pointer',
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                {paymentMethod === 'SPLIT' && (
                  <div style={{ marginTop: '10px', padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-primary)' }}>
                      Split Dual-Channel Deposit Breakdown
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px' }}>
                      <select value={splitMethod1} onChange={(e) => setSplitMethod1(e.target.value)}>
                        <option value="TRANSFER">Transfer</option>
                        <option value="POS">POS Terminal</option>
                        <option value="CASH">Cash</option>
                      </select>
                      <input
                        type="number"
                        placeholder="Amount 1"
                        value={splitAmount1}
                        onChange={(e) => setSplitAmount1(Number(e.target.value))}
                        style={{ fontFamily: 'var(--font-mono)' }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px' }}>
                      <select value={splitMethod2} onChange={(e) => setSplitMethod2(e.target.value)}>
                        <option value="CASH">Cash</option>
                        <option value="TRANSFER">Transfer</option>
                        <option value="POS">POS Terminal</option>
                      </select>
                      <input
                        type="number"
                        placeholder="Amount 2"
                        value={splitAmount2}
                        onChange={(e) => setSplitAmount2(Number(e.target.value))}
                        style={{ fontFamily: 'var(--font-mono)' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div style={{ padding: '10px 14px', backgroundColor: 'rgba(37,99,235,0.06)', borderRadius: '6px', fontSize: '0.78rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>Remaining Balance Due on Event Day:</span>
                <span style={{ fontWeight: 800, color: '#E11D48', fontFamily: 'var(--font-mono)' }}>
                  {formatNaira(Math.max(0, bookingTotalAmount - depositPaid))}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsBookingModalOpen(false)} className="btn-secondary" disabled={isSubmittingBooking}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmittingBooking}>
                  {isSubmittingBooking ? 'Recording Reservation...' : 'Confirm Venue Reservation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Conclude Event & Check-Out Modal */}
      {isCheckOutModalOpen && checkOutVenue && checkOutVenue.currentEvent && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 125, padding: '20px' }}>
          <div className="ent-card" style={{ width: '100%', maxWidth: '520px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <LogOut size={22} color="#E11D48" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Conclude Event & Settle Folio
                </h3>
              </div>
              <button type="button" onClick={() => setIsCheckOutModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConcludeEventSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {checkOutVenue.currentEvent.eventName}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Venue: {checkOutVenue.name} · Host: {checkOutVenue.currentEvent.clientName}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                  <span>Total Event Bill:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{formatNaira(checkOutVenue.currentEvent.totalAmount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span>Deposit Previously Paid:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--emerald-primary)' }}>-{formatNaira(checkOutVenue.currentEvent.depositPaid)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 900, color: '#E11D48', marginTop: '4px' }}>
                  <span>Outstanding Balance to Settle:</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>{formatNaira(checkOutVenue.currentEvent.balanceDue)}</span>
                </div>
              </div>

              {checkOutVenue.currentEvent.balanceDue > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Settle Final Balance Via
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    {(['POS', 'TRANSFER', 'CASH', 'SPLIT'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSettlementPaymentMethod(m)}
                        style={{
                          padding: '7px 8px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: settlementPaymentMethod === m ? 800 : 600,
                          backgroundColor: settlementPaymentMethod === m ? '#E11D48' : 'var(--bg-secondary)',
                          color: settlementPaymentMethod === m ? '#FFFFFF' : 'var(--text-secondary)',
                          border: `1px solid ${settlementPaymentMethod === m ? '#E11D48' : 'var(--border-color)'}`,
                          cursor: 'pointer',
                        }}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button type="button" onClick={() => setIsCheckOutModalOpen(false)} className="btn-secondary" disabled={isConcluding}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isConcluding}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '6px',
                    backgroundColor: '#E11D48',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.825rem',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {isConcluding ? 'Processing Settlement...' : 'Settle Bill & Release Venue to Turnaround'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: View Event Folio */}
      {viewingFolioVenue && viewingFolioVenue.currentEvent && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 130, padding: '20px' }}>
          <div className="ent-card" style={{ width: '100%', maxWidth: '500px', padding: '26px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Event Folio #{viewingFolioVenue.currentEvent.bookingId}
                </h3>
              </div>
              <button onClick={() => setViewingFolioVenue(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Event Title:</span>
                <span style={{ fontWeight: 800 }}>{viewingFolioVenue.currentEvent.eventName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Client Name:</span>
                <span style={{ fontWeight: 700 }}>{viewingFolioVenue.currentEvent.clientName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Phone Contact:</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{viewingFolioVenue.currentEvent.clientPhone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Scheduled Date & Time:</span>
                <span style={{ fontWeight: 700 }}>{viewingFolioVenue.currentEvent.date} ({viewingFolioVenue.currentEvent.timeSlot})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Amount:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800 }}>{formatNaira(viewingFolioVenue.currentEvent.totalAmount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#F0FDF4', borderRadius: '6px' }}>
                <span style={{ color: '#166534' }}>Deposit Paid ({viewingFolioVenue.currentEvent.paymentMethod}):</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#166534' }}>{formatNaira(viewingFolioVenue.currentEvent.depositPaid)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#FFF1F2', borderRadius: '6px' }}>
                <span style={{ color: '#9F1239' }}>Balance Due:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#9F1239' }}>{formatNaira(viewingFolioVenue.currentEvent.balanceDue)}</span>
              </div>
            </div>

            <button onClick={() => setViewingFolioVenue(null)} className="btn-primary" style={{ width: '100%', marginTop: '16px' }}>
              Close Folio
            </button>
          </div>
        </div>
      )}

      {/* MODAL 4: Add / Edit Venue or Service Settings with Amenities Management */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110, padding: '20px' }}>
          <div className="ent-card" style={{ width: '100%', maxWidth: '600px', padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Building2 size={22} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {editingItem ? 'Edit Venue / Service Settings' : 'Add New Hall, Event Venue or Service'}
                </h3>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveService} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Venue / Service Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Osieka Grand Ballroom, Royal VIP Suite, Suit Laundry Dry-Clean"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Assign to Department Group
                </label>
                {!isCreatingNewGroup ? (
                  <select
                    value={group}
                    onChange={(e) => {
                      if (e.target.value === '__CREATE_NEW__') {
                        setIsCreatingNewGroup(true);
                      } else {
                        setGroup(e.target.value);
                      }
                    }}
                    style={{ width: '100%' }}
                  >
                    {groups.map((grp) => (
                      <option key={grp} value={grp}>{grp}</option>
                    ))}
                    <option value="__CREATE_NEW__">+ Create a new custom group...</option>
                  </select>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Type custom group name"
                      value={customGroupName}
                      onChange={(e) => setCustomGroupName(e.target.value)}
                      required
                      style={{ flex: 1 }}
                      autoFocus
                    />
                    <button type="button" onClick={() => setIsCreatingNewGroup(false)} className="btn-secondary" style={{ fontSize: '0.75rem' }}>
                      Use Existing
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Standard Rate (₦ NGN)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    style={{ width: '100%', fontFamily: 'var(--font-mono)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Duration / Turnaround
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    required
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Capacity (Attendees - Optional for Halls)
                </label>
                <input
                  type="number"
                  min={0}
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value === '' ? '' : Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Amenities Management */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Venue Amenities & Equipment (Click to toggle)
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                  {STANDARD_VENUE_AMENITIES.map((amenity) => {
                    const isSelected = selectedAmenities.includes(amenity);
                    return (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => toggleAmenity(amenity)}
                        style={{
                          padding: '4px 9px',
                          borderRadius: '12px',
                          fontSize: '0.7rem',
                          fontWeight: isSelected ? 700 : 500,
                          backgroundColor: isSelected ? 'var(--brand-primary)' : 'var(--bg-secondary)',
                          color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                          border: `1px solid ${isSelected ? 'var(--brand-primary)' : 'var(--border-color)'}`,
                          cursor: 'pointer',
                        }}
                      >
                        {isSelected ? '✓ ' : '+ '} {amenity}
                      </button>
                    );
                  })}
                </div>

                {/* Add Custom Amenity Input */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Add custom amenity tag (e.g. Red Carpet, Video Drone)"
                    value={customAmenityInput}
                    onChange={(e) => setCustomAmenityInput(e.target.value)}
                    style={{ flex: 1, fontSize: '0.78rem' }}
                  />
                  <button type="button" onClick={addCustomAmenity} className="btn-secondary" style={{ fontSize: '0.75rem' }}>
                    + Add Tag
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Description & Specifications
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.825rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary" disabled={isSaving}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSaving}>
                  {isSaving ? 'Saving...' : editingItem ? 'Save Updates' : 'Create Venue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
