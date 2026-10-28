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
  LogOut,
  CreditCard,
  FileText,
  AlertTriangle,
  Play,
  UtensilsCrossed,
  Wine,
  PlusCircle,
  Receipt
} from 'lucide-react';
import { StaffUser } from '@hosos/types';
import { hasPermission } from '@/lib/rbac';
import { useFeedback } from '@/context/FeedbackContext';

export type HallOperationalStatus = 'AVAILABLE' | 'RESERVED' | 'EVENT_IN_PROGRESS' | 'CLEANING_TURNAROUND' | 'MAINTENANCE';

export interface CateringLineItem {
  id: string;
  category: 'FOOD' | 'DRINK';
  name: string;
  unitPrice: number;
  quantity: number;
  total: number;
  notes?: string;
}

export interface EventBookingData {
  bookingId: string;
  eventName: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  date: string;
  timeSlot: string; // 12-hour format e.g. "10:00 AM - 06:00 PM"
  venueFee: number;
  cateringItems?: CateringLineItem[];
  foodTotal: number;
  drinksTotal: number;
  totalAmount: number; // venueFee + foodTotal + drinksTotal
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

export interface VenueItemData {
  id: string;
  serviceId: string;
  name: string;
  group: string; // 'Halls and Events' | 'Indoor Venues' | 'Outdoor Grounds' | 'Conference'
  price: number;
  duration: string;
  capacity?: number;
  description?: string;
  isAvailable: boolean;
  status: HallOperationalStatus;
  amenities?: string[];
  currentEvent?: EventBookingData;
  bookingHistory?: Array<{
    bookingId: string;
    eventName: string;
    clientName: string;
    date: string;
    totalAmount: number;
    status: string;
  }>;
  addedBy?: string;
}

interface HallsAndServicesViewProps {
  activeStaff: StaffUser;
  onBack: () => void;
  defaultGroup?: string;
}

const PRESET_FOOD_MENUS: Array<{ name: string; price: number; desc: string }> = [
  { name: 'Executive Royal Buffet (Jollof, Fried Rice, Asun, Croaker Fish & Chicken)', price: 6500, desc: 'Full multi-course luxury banquet buffet with salad and dessert' },
  { name: 'Standard Banquet Pack (Party Jollof Rice, Salad & Quarter Chicken)', price: 4000, desc: 'Hot gourmet foil pack with fried plantains' },
  { name: 'Gourmet Small Chops Platter (Samosa, Spring Rolls, Puff-Puff, Peppered Gizzard)', price: 2500, desc: 'Cocktail finger foods platter (5 pieces per guest)' },
  { name: 'Pounded Yam & Choice of Native Soup (Egusi / Seafood Okro & Goat Meat)', price: 5500, desc: 'Traditional Nigerian luxury feast' },
];

const PRESET_DRINK_MENUS: Array<{ name: string; price: number; desc: string }> = [
  { name: 'Assorted Soft Drinks & Juice Crate (24 Cans/Bottles)', price: 18000, desc: 'Coca-Cola, Fanta, Sprite, Chivita & 5 Alive mix' },
  { name: 'Premium Heineken & Beer Crate (24 Bottles)', price: 36000, desc: 'Chilled Heineken, Stella & Guinness Stout' },
  { name: 'Luxury Champagne (Moët & Chandon Imperial Brut) Bottle', price: 85000, desc: 'Chilled French champagne with dedicated flutes' },
  { name: 'Pure Spring Water Carton (12 Bottles x 75cl)', price: 4500, desc: 'Chilled bottled mineral water' },
];

const STANDARD_VENUE_AMENITIES = [
  'Central Air Conditioning',
  'Acoustic Sound Treatment',
  'Dual 4K Laser Projectors',
  'Intelligent Stage Lighting',
  '100% Off-Grid Solar & BESS Power',
  'VIP Dressing Suites',
  'Banquet Tables & Chiavari Chairs',
  'High-Speed Dedicated Wi-Fi',
  'Podium & Wireless Lapel Mics',
  'Dedicated Restrooms',
  'Outdoor Lawn Canopy',
];

export default function HallsAndServicesView({ activeStaff, onBack, defaultGroup = 'Halls and Events' }: HallsAndServicesViewProps) {
  const { showSuccess, showFailed, showConfirm } = useFeedback();
  const [venues, setVenues] = useState<VenueItemData[]>([]);
  const [venueCategories, setVenueCategories] = useState<string[]>(['ALL', 'Halls and Events', 'Indoor Venues', 'Outdoor Grounds', 'Conference']);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeStatusTab, setActiveStatusTab] = useState<'ALL' | HallOperationalStatus>('ALL');
  const [displayMode, setDisplayMode] = useState<'CARDS' | 'LIST'>('CARDS');
  const [isLoading, setIsLoading] = useState(true);

  // Permission Checks
  const isSuperAdmin = activeStaff.role === 'SUPERADMIN' || activeStaff.role === 'OWNER' || (activeStaff.role as any) === 'ADMIN';
  const canBookHall = isSuperAdmin || hasPermission(activeStaff.role, 'halls.book' as any, activeStaff.id);
  const canCheckInHall = isSuperAdmin || hasPermission(activeStaff.role, 'halls.checkin' as any, activeStaff.id);
  const canCheckOutHall = isSuperAdmin || hasPermission(activeStaff.role, 'halls.checkout' as any, activeStaff.id);
  const canManageHalls = isSuperAdmin || hasPermission(activeStaff.role, 'halls.manage' as any, activeStaff.id) || hasPermission(activeStaff.role, 'services.manage', activeStaff.id);

  // Modal State: Create / Edit Venue
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VenueItemData | null>(null);
  const [name, setName] = useState('');
  const [group, setGroup] = useState('Halls and Events');
  const [isCreatingNewGroup, setIsCreatingNewGroup] = useState(false);
  const [customGroupName, setCustomGroupName] = useState('');
  const [price, setPrice] = useState<number | ''>(450000);
  const [duration, setDuration] = useState('Full Day (8:00 AM - 06:00 PM)');
  const [capacity, setCapacity] = useState<number | ''>(300);
  const [description, setDescription] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [customAmenityInput, setCustomAmenityInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Modal State: Book / Reserve Venue (Operates symmetrically to Room Check-In + F&B Catering Add-Ons)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingVenue, setBookingVenue] = useState<VenueItemData | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('+234 80');
  const [clientEmail, setClientEmail] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('2026-10-30');
  const [eventTimeSlot, setEventTimeSlot] = useState('10:00 AM - 06:00 PM');
  
  // Financial & Catering Add-on State
  const [baseVenueFee, setBaseVenueFee] = useState<number>(500000);
  const [cateringItems, setCateringItems] = useState<CateringLineItem[]>([]);
  
  // Custom Food / Drink Add Inputs
  const [showFoodPicker, setShowFoodPicker] = useState(false);
  const [showDrinkPicker, setShowDrinkPicker] = useState(false);
  const [customItemCategory, setCustomItemCategory] = useState<'FOOD' | 'DRINK'>('FOOD');
  const [customItemName, setCustomItemName] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState<number | ''>(4000);
  const [customItemQty, setCustomItemQty] = useState<number>(50);

  // Deposit & Payment
  const [depositPaid, setDepositPaid] = useState<number>(250000);
  const [paymentMethod, setPaymentMethod] = useState<'POS' | 'TRANSFER' | 'CASH' | 'SPLIT'>('TRANSFER');
  const [splitMethod1, setSplitMethod1] = useState('TRANSFER');
  const [splitAmount1, setSplitAmount1] = useState<number>(200000);
  const [splitMethod2, setSplitMethod2] = useState('CASH');
  const [splitAmount2, setSplitAmount2] = useState<number>(50000);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  // Modal State: Conclude Event & Check-Out
  const [isCheckOutModalOpen, setIsCheckOutModalOpen] = useState(false);
  const [checkOutVenue, setCheckOutVenue] = useState<VenueItemData | null>(null);
  const [settlementPaymentMethod, setSettlementPaymentMethod] = useState<'POS' | 'TRANSFER' | 'CASH' | 'SPLIT'>('POS');
  const [settleSplit1, setSettleSplit1] = useState('POS');
  const [settleAmount1, setSettleAmount1] = useState<number>(0);
  const [settleSplit2, setSettleSplit2] = useState('CASH');
  const [settleAmount2, setSettleAmount2] = useState<number>(0);
  const [isConcluding, setIsConcluding] = useState(false);

  // Modal State: Event Folio / Details
  const [viewingFolioVenue, setViewingFolioVenue] = useState<VenueItemData | null>(null);

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Live Catering Calculations
  const foodTotal = cateringItems
    .filter(i => i.category === 'FOOD')
    .reduce((sum, item) => sum + item.total, 0);

  const drinksTotal = cateringItems
    .filter(i => i.category === 'DRINK')
    .reduce((sum, item) => sum + item.total, 0);

  const contractGrandTotal = (baseVenueFee || 0) + foodTotal + drinksTotal;
  const balanceDue = Math.max(0, contractGrandTotal - (depositPaid || 0));

  const fetchVenues = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/services');
      const data = await res.json();
      if (data.success && data.services) {
        // Filter strictly to venues / halls (exclude laundry/dry cleaning items)
        const venueItems: VenueItemData[] = data.services.filter((s: any) => 
          s.group.toLowerCase().includes('hall') || 
          s.group.toLowerCase().includes('event') || 
          s.group.toLowerCase().includes('venue') ||
          (s.capacity && s.capacity > 0)
        );
        setVenues(venueItems);
      }
    } catch (err: any) {
      console.warn('Could not load venues:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setName('');
    setGroup('Halls and Events');
    setIsCreatingNewGroup(false);
    setCustomGroupName('');
    setPrice(450000);
    setDuration('Full Day (8:00 AM - 06:00 PM)');
    setCapacity(300);
    setDescription('');
    setSelectedAmenities(['Central Air Conditioning', 'Acoustic Sound Treatment', 'Stage & Lighting', '100% Off-Grid Solar & BESS Power']);
    setIsModalOpen(true);
  };

  const openEditModal = (item: VenueItemData) => {
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

  const handleSaveVenue = async (e: React.FormEvent) => {
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
          showSuccess('Venue Updated', `${name} settings saved to database.`);
          setIsModalOpen(false);
          fetchVenues();
        } else {
          showFailed('Update Error', data.error || 'Failed to update venue.');
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
          showSuccess('New Venue Created', `${name} successfully added to database.`);
          setIsModalOpen(false);
          fetchVenues();
        } else {
          showFailed('Creation Error', data.error || 'Failed to create venue.');
        }
      }
    } catch (err: any) {
      showFailed('Network Error', err.message || 'Could not communicate with server.');
    } finally {
      setIsSaving(false);
    }
  };

  // Open Event Booking Modal (Check-In flow with Catering Add-Ons)
  const openBookingModal = (venue: VenueItemData) => {
    setBookingVenue(venue);
    setBaseVenueFee(venue.price);
    setCateringItems([]);
    setClientName('');
    setClientPhone('+234 80');
    setClientEmail('');
    setEventName('');
    setEventDate(new Date().toISOString().split('T')[0]);
    setEventTimeSlot('10:00 AM - 06:00 PM');
    setDepositPaid(Math.round(venue.price * 0.5));
    setPaymentMethod('TRANSFER');
    setSplitAmount1(Math.round(venue.price * 0.35));
    setSplitAmount2(Math.round(venue.price * 0.15));
    setIsBookingModalOpen(true);
  };

  // Add Preset or Custom Catering Item
  const handleAddCateringItem = (category: 'FOOD' | 'DRINK', itemName: string, unitPrice: number, qty: number) => {
    if (!itemName || unitPrice <= 0 || qty <= 0) return;
    const newItem: CateringLineItem = {
      id: `cat-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      category,
      name: itemName,
      unitPrice,
      quantity: qty,
      total: unitPrice * qty,
    };
    setCateringItems([...cateringItems, newItem]);
    
    // Auto-update deposit recommendation
    const newGrandTotal = baseVenueFee + foodTotal + drinksTotal + newItem.total;
    setDepositPaid(Math.round(newGrandTotal * 0.5));
    setSplitAmount1(Math.round(newGrandTotal * 0.35));
    setSplitAmount2(Math.round(newGrandTotal * 0.15));
  };

  const handleRemoveCateringItem = (id: string) => {
    const updated = cateringItems.filter(i => i.id !== id);
    setCateringItems(updated);
    const newFood = updated.filter(i => i.category === 'FOOD').reduce((s, i) => s + i.total, 0);
    const newDrinks = updated.filter(i => i.category === 'DRINK').reduce((s, i) => s + i.total, 0);
    const newGrandTotal = baseVenueFee + newFood + newDrinks;
    setDepositPaid(Math.round(newGrandTotal * 0.5));
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingVenue || !clientName.trim() || !eventName.trim()) return;

    const bookingPayload: EventBookingData = {
      bookingId: `EVT-${Date.now().toString().slice(-6)}`,
      eventName: eventName.trim(),
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientEmail: clientEmail.trim(),
      date: eventDate,
      timeSlot: eventTimeSlot,
      venueFee: baseVenueFee,
      cateringItems,
      foodTotal,
      drinksTotal,
      totalAmount: contractGrandTotal,
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
          'Venue & Catering Reserved!',
          `"${eventName}" booked at ${bookingVenue.name} for ${clientName}.`,
          `Grand Total: ${formatNaira(contractGrandTotal)} (Venue: ${formatNaira(baseVenueFee)}, Food: ${formatNaira(foodTotal)}, Drinks: ${formatNaira(drinksTotal)}). Deposit: ${formatNaira(depositPaid)} verified via ${paymentMethod}.`
        );
        setIsBookingModalOpen(false);
        fetchVenues();
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
  const handleStartEvent = (venue: VenueItemData) => {
    showConfirm(
      'Start Event / Check-In Venue?',
      `Transition "${venue.name}" to EVENT IN PROGRESS for "${venue.currentEvent?.eventName || 'Booked Event'}"? Dispatches catering orders to Kitchen & Bar.`,
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
            fetchVenues();
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
  const openCheckOutModal = (venue: VenueItemData) => {
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
          'Event Concluded & Folio Settled!',
          `"${checkOutVenue.name}" has been released to CLEANING & RESET.`,
          `Final balance settled via ${settlementPaymentMethod}. Revenue reconciled across Banqueting, Kitchen, and Bar ledgers.`
        );
        setIsCheckOutModalOpen(false);
        fetchVenues();
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
  const handleMarkClean = (venue: VenueItemData) => {
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
            showSuccess('Venue Ready', `${venue.name} is now Available for new reservations.`);
            fetchVenues();
          } else {
            showFailed('Error', data.error);
          }
        } catch (err: any) {
          showFailed('Network Error', err.message);
        }
      },
      { confirmText: 'Confirm Ready', variant: 'emerald' }
    );
  };

  const handleDeleteVenue = (serviceId: string, venueName: string) => {
    showConfirm(
      'Delete Venue?',
      `Are you sure you want to permanently delete "${venueName}"? This cannot be undone.`,
      async () => {
        try {
          const res = await fetch(`/api/services?serviceId=${serviceId}`, {
            method: 'DELETE',
          });
          const data = await res.json();
          if (data.success) {
            showSuccess('Venue Deleted', `${venueName} has been removed.`);
            fetchVenues();
          } else {
            showFailed('Delete Error', data.error);
          }
        } catch (err: any) {
          showFailed('Network Error', err.message);
        }
      },
      { confirmText: 'Delete Venue', variant: 'danger' }
    );
  };

  // Status Filter Tabs (Symmetrical to Room Status Tabs)
  const statusTabs: Array<{ id: 'ALL' | HallOperationalStatus; label: string; count: number; color: string; bg: string }> = [
    { id: 'ALL', label: 'All Venues', count: venues.length, color: 'var(--brand-primary)', bg: 'var(--bg-secondary)' },
    { id: 'AVAILABLE', label: 'Available', count: venues.filter(v => v.status === 'AVAILABLE').length, color: '#059669', bg: '#F0FDF4' },
    { id: 'RESERVED', label: 'Reserved / Booked', count: venues.filter(v => v.status === 'RESERVED').length, color: '#2563eb', bg: '#EFF6FF' },
    { id: 'EVENT_IN_PROGRESS', label: 'Event In Progress', count: venues.filter(v => v.status === 'EVENT_IN_PROGRESS').length, color: '#7C3AED', bg: '#F5F3FF' },
    { id: 'CLEANING_TURNAROUND', label: 'Cleaning & Reset', count: venues.filter(v => v.status === 'CLEANING_TURNAROUND').length, color: '#D97706', bg: '#FFFBEB' },
    { id: 'MAINTENANCE', label: 'Maintenance', count: venues.filter(v => v.status === 'MAINTENANCE').length, color: '#E11D48', bg: '#FFF1F2' },
  ];

  const filteredVenues = venues.filter((item) => {
    const matchesCategory = selectedCategory === 'ALL' || item.group.toLowerCase() === selectedCategory.toLowerCase();
    const matchesStatus = activeStatusTab === 'ALL' || item.status === activeStatusTab;
    return matchesCategory && matchesStatus;
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
      <div className="ent-card" style={{ padding: '24px 32px' }}>
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
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                Halls, Venues & Event Banqueting Board
              </h2>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '6px', marginBottom: 0 }}>
              Dedicated operational desk for banquet ballrooms, conference halls, wedding gardens, and banquet catering accounting.
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
                <span>+ Add Venue / Hall</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Filter Tabs (Symmetrical to Room Status Matrix) */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '20px', flexWrap: 'wrap', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          {statusTabs.map((tab) => {
            const isSelected = activeStatusTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveStatusTab(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: isSelected ? 800 : 600,
                  backgroundColor: isSelected ? 'var(--brand-primary)' : 'var(--bg-secondary)',
                  color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                  border: `1px solid ${isSelected ? 'var(--brand-primary)' : 'var(--border-subtle)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : 'var(--bg-card)',
                    color: isSelected ? '#FFFFFF' : tab.color,
                    padding: '1px 7px',
                    borderRadius: '10px',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Venues Grid / Cards Display */}
      {displayMode === 'CARDS' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
          {filteredVenues.map((item) => (
            <div
              key={item.serviceId}
              className="ent-card"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderLeft: `5px solid ${
                  item.status === 'AVAILABLE' ? '#059669' :
                  item.status === 'RESERVED' ? '#2563eb' :
                  item.status === 'EVENT_IN_PROGRESS' ? '#7C3AED' :
                  item.status === 'CLEANING_TURNAROUND' ? '#D97706' : '#E11D48'
                }`,
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  {getStatusBadge(item.status)}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, color: 'var(--emerald-primary)', fontSize: '1.25rem' }}>
                      {formatNaira(item.price)}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Standard Rack Rate
                    </div>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                  {item.name}
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  {item.capacity ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: 'var(--brand-primary)' }}>
                      <Users size={13} /> {item.capacity} Guests Max
                    </span>
                  ) : null}
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={13} /> {item.duration}
                  </span>
                </div>

                {item.description && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: 1.45 }}>
                    {item.description}
                  </p>
                )}

                {/* Standard Amenities Chips */}
                {item.amenities && item.amenities.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                    {item.amenities.slice(0, 4).map((am) => (
                      <span
                        key={am}
                        style={{
                          fontSize: '0.68rem',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--bg-secondary)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        ✓ {am}
                      </span>
                    ))}
                    {item.amenities.length > 4 && (
                      <span style={{ fontSize: '0.68rem', color: 'var(--brand-primary)', fontWeight: 700, alignSelf: 'center' }}>
                        +{item.amenities.length - 4} more
                      </span>
                    )}
                  </div>
                )}

                {/* Current Active Event Banner with F&B Breakdown */}
                {item.currentEvent && (
                  <div
                    style={{
                      padding: '12px 14px',
                      backgroundColor: 'var(--bg-secondary)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      marginBottom: '16px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
                        CURRENT EVENT FOLIO
                      </span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                        #{item.currentEvent.bookingId}
                      </span>
                    </div>

                    <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      {item.currentEvent.eventName}
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Host: {item.currentEvent.clientName} ({item.currentEvent.clientPhone})
                    </div>

                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', gap: '10px' }}>
                      <span>📅 {item.currentEvent.date}</span>
                      <span>🕒 {item.currentEvent.timeSlot}</span>
                    </div>

                    {/* Catering Summary if food/drinks booked */}
                    {(item.currentEvent.foodTotal > 0 || item.currentEvent.drinksTotal > 0) && (
                      <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px dashed var(--border-subtle)', display: 'flex', gap: '8px', fontSize: '0.7rem' }}>
                        {item.currentEvent.foodTotal > 0 && (
                          <span style={{ color: '#ea580c', fontWeight: 700 }}>
                            🍲 Meals: {formatNaira(item.currentEvent.foodTotal)}
                          </span>
                        )}
                        {item.currentEvent.drinksTotal > 0 && (
                          <span style={{ color: '#9333ea', fontWeight: 700 }}>
                            🍾 Drinks: {formatNaira(item.currentEvent.drinksTotal)}
                          </span>
                        )}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem' }}>
                      <span>Contract Total:</span>
                      <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                        {formatNaira(item.currentEvent.totalAmount)}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                      <span>Deposit Paid:</span>
                      <span style={{ fontWeight: 800, color: 'var(--emerald-primary)', fontFamily: 'var(--font-mono)' }}>
                        {formatNaira(item.currentEvent.depositPaid)} ({item.currentEvent.paymentMethod})
                      </span>
                    </div>

                    {item.currentEvent.balanceDue > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#E11D48' }}>
                        <span>Balance Due:</span>
                        <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                          {formatNaira(item.currentEvent.balanceDue)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  
                  {/* Book button for Available venues */}
                  {item.status === 'AVAILABLE' && canBookHall && (
                    <button
                      onClick={() => openBookingModal(item)}
                      className="btn-primary"
                      style={{ padding: '6px 14px', fontSize: '0.75rem' }}
                    >
                      Reserve & Add Catering
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
                      <span>Mark Ready</span>
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
                      onClick={() => handleDeleteVenue(item.serviceId, item.name)}
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
          ))}
        </div>
      )}

      {/* Venues Content: LIST Display */}
      {displayMode === 'LIST' && (
        <div className="ent-card" style={{ padding: '20px' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="ent-table" style={{ width: '100%', fontSize: '0.825rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-secondary)', textAlign: 'left' }}>
                  <th style={{ padding: '10px 14px' }}>Venue Name</th>
                  <th style={{ padding: '10px 14px' }}>Max Capacity</th>
                  <th style={{ padding: '10px 14px' }}>Rack Rate</th>
                  <th style={{ padding: '10px 14px' }}>Current Status</th>
                  <th style={{ padding: '10px 14px' }}>Current Event / Client</th>
                  <th style={{ padding: '10px 14px' }}>Catering Add-Ons</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVenues.map((item) => (
                  <tr key={item.serviceId} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {item.name}
                      {item.amenities && item.amenities.length > 0 && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--brand-primary)', fontWeight: 500, marginTop: '2px' }}>
                          {item.amenities.slice(0, 3).join(' • ')}
                        </div>
                      )}
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
                    <td style={{ padding: '12px 14px' }}>
                      {item.currentEvent ? (
                        <div style={{ fontSize: '0.72rem' }}>
                          <div>Meals: {formatNaira(item.currentEvent.foodTotal || 0)}</div>
                          <div>Drinks: {formatNaira(item.currentEvent.drinksTotal || 0)}</div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        {item.status === 'AVAILABLE' && canBookHall && (
                          <button onClick={() => openBookingModal(item)} className="btn-primary" style={{ padding: '4px 10px', fontSize: '0.72rem' }}>
                            Reserve
                          </button>
                        )}
                        {item.status === 'RESERVED' && canCheckInHall && (
                          <button onClick={() => handleStartEvent(item)} style={{ padding: '4px 10px', fontSize: '0.72rem', backgroundColor: '#059669', color: '#FFFFFF', border: 'none', borderRadius: '5px', fontWeight: 700, cursor: 'pointer' }}>
                            Start Event
                          </button>
                        )}
                        {item.status === 'EVENT_IN_PROGRESS' && canCheckOutHall && (
                          <button onClick={() => openCheckOutModal(item)} style={{ padding: '4px 10px', fontSize: '0.72rem', backgroundColor: '#E11D48', color: '#FFFFFF', border: 'none', borderRadius: '5px', fontWeight: 700, cursor: 'pointer' }}>
                            Conclude
                          </button>
                        )}
                        {item.status === 'CLEANING_TURNAROUND' && (
                          <button onClick={() => handleMarkClean(item)} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.72rem' }}>
                            Mark Ready
                          </button>
                        )}
                        {item.currentEvent && (
                          <button onClick={() => setViewingFolioVenue(item)} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.72rem' }}>
                            Folio
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

      {/* MODAL 1: BOOKING & CATERING ADD-ONS MODAL */}
      {isBookingModalOpen && bookingVenue && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120, padding: '20px' }}>
          <div className="ent-card" style={{ width: '100%', maxWidth: '640px', maxHeight: '92vh', overflowY: 'auto', padding: '28px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                  Event Reservation & Banquet Catering
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                  Venue: <strong style={{ color: 'var(--brand-primary)' }}>{bookingVenue.name}</strong> • Max Capacity: {bookingVenue.capacity || 0} Guests
                </p>
              </div>
              <button type="button" onClick={() => setIsBookingModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Event & Client Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Event Title / Occasion
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Chief Adeleke Golden Jubilee Banquet"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    required
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Organizer / Host Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Alhaji Ibrahim Danjuma"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    required
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
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
                    12-Hour Time Slot
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

              {/* SECTION: Base Hall Rental Fee */}
              <div style={{ padding: '14px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.825rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      1. Base Hall Rental Fee (Venue Contract)
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Allocated directly to Corporate Events & Banqueting Revenue
                    </div>
                  </div>
                  <div style={{ width: '160px' }}>
                    <input
                      type="number"
                      min={0}
                      value={baseVenueFee}
                      onChange={(e) => setBaseVenueFee(Number(e.target.value))}
                      style={{ width: '100%', fontFamily: 'var(--font-mono)', fontWeight: 800, textAlign: 'right' }}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: Food & Meals Catering Add-Ons */}
              <div style={{ padding: '14px', backgroundColor: 'rgba(234, 88, 12, 0.04)', borderRadius: '8px', border: '1px solid rgba(234, 88, 12, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UtensilsCrossed size={16} color="#ea580c" />
                    <div>
                      <div style={{ fontSize: '0.825rem', fontWeight: 800, color: '#ea580c' }}>
                        2. Banquet Food & Catering Packages
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        Dispatched & credited to Kitchen & Meals Ledger
                      </div>
                    </div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#ea580c', fontSize: '0.9rem' }}>
                    {formatNaira(foodTotal)}
                  </span>
                </div>

                {/* Added Food Line Items */}
                {cateringItems.filter(i => i.category === 'FOOD').length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                    {cateringItems.filter(i => i.category === 'FOOD').map(item => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-card)', padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem', border: '1px solid var(--border-subtle)' }}>
                        <div>
                          <strong style={{ color: 'var(--text-primary)' }}>{item.name}</strong>
                          <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>
                            ({item.quantity} plates @ {formatNaira(item.unitPrice)})
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#ea580c' }}>
                            {formatNaira(item.total)}
                          </span>
                          <button type="button" onClick={() => handleRemoveCateringItem(item.id)} style={{ background: 'none', border: 'none', color: '#E11D48', cursor: 'pointer', padding: 0 }}>
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick Add Presets */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {PRESET_FOOD_MENUS.map(m => (
                    <button
                      key={m.name}
                      type="button"
                      onClick={() => handleAddCateringItem('FOOD', m.name, m.price, 100)}
                      style={{
                        padding: '4px 8px',
                        fontSize: '0.68rem',
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid rgba(234, 88, 12, 0.3)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        color: 'var(--text-primary)',
                      }}
                    >
                      + Add {m.name.slice(0, 24)}... (100 @ {formatNaira(m.price)})
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION: Drinks & Bar Packages */}
              <div style={{ padding: '14px', backgroundColor: 'rgba(147, 51, 234, 0.04)', borderRadius: '8px', border: '1px solid rgba(147, 51, 234, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Wine size={16} color="#9333ea" />
                    <div>
                      <div style={{ fontSize: '0.825rem', fontWeight: 800, color: '#9333ea' }}>
                        3. Bar & Beverage Packages
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        Dispatched & credited to Bar & Drinks Ledger
                      </div>
                    </div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#9333ea', fontSize: '0.9rem' }}>
                    {formatNaira(drinksTotal)}
                  </span>
                </div>

                {/* Added Drinks Line Items */}
                {cateringItems.filter(i => i.category === 'DRINK').length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                    {cateringItems.filter(i => i.category === 'DRINK').map(item => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-card)', padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem', border: '1px solid var(--border-subtle)' }}>
                        <div>
                          <strong style={{ color: 'var(--text-primary)' }}>{item.name}</strong>
                          <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>
                            ({item.quantity} units @ {formatNaira(item.unitPrice)})
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#9333ea' }}>
                            {formatNaira(item.total)}
                          </span>
                          <button type="button" onClick={() => handleRemoveCateringItem(item.id)} style={{ background: 'none', border: 'none', color: '#E11D48', cursor: 'pointer', padding: 0 }}>
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick Add Presets */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {PRESET_DRINK_MENUS.map(m => (
                    <button
                      key={m.name}
                      type="button"
                      onClick={() => handleAddCateringItem('DRINK', m.name, m.price, 10)}
                      style={{
                        padding: '4px 8px',
                        fontSize: '0.68rem',
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid rgba(147, 51, 234, 0.3)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        color: 'var(--text-primary)',
                      }}
                    >
                      + Add {m.name.slice(0, 24)}... (10 @ {formatNaira(m.price)})
                    </button>
                  ))}
                </div>
              </div>

              {/* FINANCIAL RECONCILIATION SUMMARY */}
              <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-primary)', textTransform: 'uppercase' }}>
                  Departmental Accounting Allocation
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                  <span>Corporate Events & Venues:</span>
                  <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{formatNaira(baseVenueFee)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                  <span>Kitchen & Meals:</span>
                  <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#ea580c' }}>{formatNaira(foodTotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                  <span>Bar & Drinks:</span>
                  <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#9333ea' }}>{formatNaira(drinksTotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 900, borderTop: '1px solid var(--border-subtle)', paddingTop: '6px', marginTop: '4px' }}>
                  <span>Grand Total Event Contract:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--emerald-primary)' }}>{formatNaira(contractGrandTotal)}</span>
                </div>
              </div>

              {/* Deposit Payment & Settlement Channel */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Deposit Paid Now (₦)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={contractGrandTotal}
                    value={depositPaid}
                    onChange={(e) => setDepositPaid(Number(e.target.value))}
                    required
                    style={{ width: '100%', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--emerald-primary)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Balance Due on Event Day (₦)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={formatNaira(balanceDue)}
                    style={{ width: '100%', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#E11D48', backgroundColor: 'var(--bg-secondary)' }}
                  />
                </div>
              </div>

              {/* Settlement Channel (POS, Transfer, Cash, Split) */}
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
                        padding: '8px',
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
                        value={splitAmount2}
                        onChange={(e) => setSplitAmount2(Number(e.target.value))}
                        style={{ fontFamily: 'var(--font-mono)' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsBookingModalOpen(false)} className="btn-secondary" disabled={isSubmittingBooking}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmittingBooking}>
                  {isSubmittingBooking ? 'Recording Reservation & Dispatch...' : 'Confirm Reservation & Catering Contract'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CONCLUDE EVENT & SETTLE FOLIO */}
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
              <div style={{ padding: '14px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  {checkOutVenue.currentEvent.eventName}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Venue: {checkOutVenue.name} • Host: {checkOutVenue.currentEvent.clientName}
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.8rem' }}>
                  <span>Contract Grand Total:</span>
                  <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{formatNaira(checkOutVenue.currentEvent.totalAmount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span>Advance Deposit Paid:</span>
                  <span style={{ fontWeight: 800, color: 'var(--emerald-primary)', fontFamily: 'var(--font-mono)' }}>{formatNaira(checkOutVenue.currentEvent.depositPaid)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 900, color: '#E11D48', marginTop: '4px' }}>
                  <span>Remaining Folio Balance:</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>{formatNaira(checkOutVenue.currentEvent.balanceDue)}</span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Final Settlement Channel
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {(['POS', 'TRANSFER', 'CASH', 'SPLIT'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSettlementPaymentMethod(m)}
                      style={{
                        padding: '8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: settlementPaymentMethod === m ? 800 : 600,
                        backgroundColor: settlementPaymentMethod === m ? 'var(--brand-primary)' : 'var(--bg-secondary)',
                        color: settlementPaymentMethod === m ? '#FFFFFF' : 'var(--text-secondary)',
                        border: `1px solid ${settlementPaymentMethod === m ? 'var(--brand-primary)' : 'var(--border-color)'}`,
                        cursor: 'pointer',
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsCheckOutModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-danger" style={{ backgroundColor: '#E11D48', borderColor: '#E11D48' }} disabled={isConcluding}>
                  {isConcluding ? 'Reconciling Ledgers...' : 'Conclude Event & Send to Cleaning'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW EVENT FOLIO DETAILS */}
      {viewingFolioVenue && viewingFolioVenue.currentEvent && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 125, padding: '20px' }}>
          <div className="ent-card" style={{ width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Receipt size={20} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Event Folio #{viewingFolioVenue.currentEvent.bookingId}
                </h3>
              </div>
              <button type="button" onClick={() => setViewingFolioVenue(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                  {viewingFolioVenue.currentEvent.eventName}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Venue: <strong>{viewingFolioVenue.name}</strong> • Client: <strong>{viewingFolioVenue.currentEvent.clientName}</strong> ({viewingFolioVenue.currentEvent.clientPhone})
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Schedule: {viewingFolioVenue.currentEvent.date} ({viewingFolioVenue.currentEvent.timeSlot})
                </div>
              </div>

              {/* Line Items Breakdown */}
              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-secondary)', fontWeight: 800, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  ITEMIZED CONTRACT & CATERING BILL
                </div>
                
                <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span>Venue Rental Contract ({viewingFolioVenue.name})</span>
                  <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{formatNaira(viewingFolioVenue.currentEvent.venueFee || viewingFolioVenue.price)}</span>
                </div>

                {viewingFolioVenue.currentEvent.cateringItems && viewingFolioVenue.currentEvent.cateringItems.map((item) => (
                  <div key={item.id} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                    <span>
                      {item.category === 'FOOD' ? '🍲' : '🍾'} {item.name} ({item.quantity} @ {formatNaira(item.unitPrice)})
                    </span>
                    <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: item.category === 'FOOD' ? '#ea580c' : '#9333ea' }}>
                      {formatNaira(item.total)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Accounting Split Card */}
              <div style={{ padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontWeight: 800, color: 'var(--brand-primary)', marginBottom: '4px' }}>
                  Departmental Revenue Routing
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Banqueting & Venues:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{formatNaira(viewingFolioVenue.currentEvent.venueFee || viewingFolioVenue.price)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ea580c' }}>
                  <span>Kitchen & Meals:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{formatNaira(viewingFolioVenue.currentEvent.foodTotal || 0)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9333ea' }}>
                  <span>Bar & Drinks:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{formatNaira(viewingFolioVenue.currentEvent.drinksTotal || 0)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, borderTop: '1px solid var(--border-subtle)', paddingTop: '6px', marginTop: '4px' }}>
                  <span>Contract Grand Total:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--emerald-primary)' }}>{formatNaira(viewingFolioVenue.currentEvent.totalAmount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                  <span>Deposit Paid:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--emerald-primary)' }}>{formatNaira(viewingFolioVenue.currentEvent.depositPaid)} ({viewingFolioVenue.currentEvent.paymentMethod})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#E11D48' }}>
                  <span>Balance Due:</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>{formatNaira(viewingFolioVenue.currentEvent.balanceDue)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" onClick={() => setViewingFolioVenue(null)} className="btn-secondary">
                  Close Folio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: CREATE / EDIT VENUE (ADMIN) */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120, padding: '20px' }}>
          <div className="ent-card" style={{ width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {editingItem ? 'Edit Venue Settings' : 'Create New Event Venue'}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveVenue} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Venue Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Osieka Grand Ballroom, Royal Diamond Conference Hall"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Standard Rental Fee (₦ NGN)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    required
                    style={{ width: '100%', fontFamily: 'var(--font-mono)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Guest Capacity
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    placeholder="e.g. 500"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Standard Duration / Slot
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. Full Day (8:00 AM - 06:00 PM), Half Day (4 hrs)"
                  required
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Description / Features
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Acoustic sound setup, smart video screens, stage, lighting..."
                  rows={2}
                  style={{ width: '100%', fontSize: '0.8rem' }}
                />
              </div>

              {/* Standard Amenities Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Venue Amenities & Equipment
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '120px', overflowY: 'auto', padding: '6px', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px' }}>
                  {STANDARD_VENUE_AMENITIES.map((am) => {
                    const isSelected = selectedAmenities.includes(am);
                    return (
                      <button
                        key={am}
                        type="button"
                        onClick={() => toggleAmenity(am)}
                        style={{
                          padding: '4px 8px',
                          fontSize: '0.7rem',
                          borderRadius: '4px',
                          backgroundColor: isSelected ? 'var(--brand-primary)' : 'var(--bg-card)',
                          color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                          border: `1px solid ${isSelected ? 'var(--brand-primary)' : 'var(--border-subtle)'}`,
                          cursor: 'pointer',
                        }}
                      >
                        {isSelected ? '✓ ' : '+ '} {am}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary" disabled={isSaving}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSaving}>
                  {isSaving ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Venue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
