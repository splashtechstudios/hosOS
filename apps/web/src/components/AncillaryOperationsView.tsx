'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Plus, 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Tag, 
  Search, 
  Filter, 
  DollarSign, 
  Layers, 
  Car, 
  Shirt, 
  Activity, 
  Check, 
  X, 
  CreditCard,
  Building2,
  FileText
} from 'lucide-react';
import { StaffUser } from '@hosos/types';
import { hasPermission } from '@/lib/rbac';
import { useFeedback } from '@/context/FeedbackContext';

export interface AncillaryServiceItem {
  id: string;
  serviceId: string;
  name: string;
  group: string; // 'Laundry & Dry-Cleaning' | 'Transport & Transfers' | 'Spa & Wellness' | 'Concierge'
  price: number;
  duration: string;
  description?: string;
  isAvailable: boolean;
  amenities?: string[];
}

export interface AncillaryOrder {
  orderId: string;
  guestName: string;
  roomNumber: string;
  serviceId: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  specialInstructions?: string;
  status: 'PENDING' | 'IN_SERVICE' | 'READY_FOR_DELIVERY' | 'COMPLETED';
  billingMode: 'ROOM_FOLIO' | 'DIRECT_SETTLEMENT';
  paymentMethod?: 'POS' | 'TRANSFER' | 'CASH' | 'SPLIT';
  orderedAt: string;
  promisedBy: string;
  handledByStaff: string;
}

const INITIAL_ANCILLARY_SERVICES: AncillaryServiceItem[] = [
  {
    id: 'anc-01',
    serviceId: 'anc-01',
    name: 'Suit & Agbada Steam Dry-Clean',
    group: 'Laundry & Dry-Cleaning',
    price: 5000,
    duration: 'Same Day (6 hrs)',
    description: 'Professional delicate steam dry-cleaning, crisp pressing and protective garment bagging.',
    isAvailable: true,
    amenities: ['Steam Sanitization', 'Crisp Starching', 'Protective Hanger Bag'],
  },
  {
    id: 'anc-02',
    serviceId: 'anc-02',
    name: 'Standard Wash & Iron (Per Piece)',
    group: 'Laundry & Dry-Cleaning',
    price: 1500,
    duration: '24 Hours Turnaround',
    description: 'Gentle laundering and crisp pressing for shirts, trousers, and evening wear.',
    isAvailable: true,
    amenities: ['Color Safe Detergents', 'Steam Pressing'],
  },
  {
    id: 'anc-03',
    serviceId: 'anc-03',
    name: 'VIP Executive Airport Chauffeur Transfer',
    group: 'Transport & Transfers',
    price: 45000,
    duration: 'One Way (Air-Conditioned SUV)',
    description: 'Air-conditioned luxury SUV transfer to/from nearest airport with dedicated protocol driver.',
    isAvailable: true,
    amenities: ['Chilled Bottled Water', 'Fibre 5G Hotspot In-Car', 'Climate Control'],
  },
  {
    id: 'anc-04',
    serviceId: 'anc-04',
    name: 'Full Body Swedish Massage & Wellness',
    group: 'Spa & Wellness',
    price: 25000,
    duration: '60 Mins',
    description: 'Therapeutic muscle relaxation session by licensed resort wellness masseuse.',
    isAvailable: true,
    amenities: ['Aromatherapy Oils', 'Private Spa Suite', 'Hot Stone Option'],
  },
  {
    id: 'anc-05',
    serviceId: 'anc-05',
    name: 'Executive Chauffeur Full-Day City Charter',
    group: 'Transport & Transfers',
    price: 85000,
    duration: 'Full Day (8:00 AM - 06:00 PM)',
    description: 'Dedicated luxury vehicle and driver for executive town visits and inter-city commutes.',
    isAvailable: true,
    amenities: ['Dedicated Security Driver', 'Unlimited In-City Kilometres', 'Fuel Included'],
  },
  {
    id: 'anc-06',
    serviceId: 'anc-06',
    name: 'Express 2-Hour Laundry Turnaround (Per Piece)',
    group: 'Laundry & Dry-Cleaning',
    price: 3500,
    duration: 'Express 2 Hours',
    description: 'Priority rapid laundering and instant press for urgent guest departures.',
    isAvailable: true,
    amenities: ['Priority Queue', 'Express Steam Press'],
  },
];

const INITIAL_ACTIVE_ORDERS: AncillaryOrder[] = [
  {
    orderId: 'ANC-8801',
    guestName: 'Chief Babatunde Adeleke',
    roomNumber: 'Room 204 (Presidential)',
    serviceId: 'anc-01',
    serviceName: 'Suit & Agbada Steam Dry-Clean',
    quantity: 3,
    unitPrice: 5000,
    totalAmount: 15000,
    specialInstructions: 'Extra starch on the white agbada sleeves. Deliver before 06:00 PM.',
    status: 'IN_SERVICE',
    billingMode: 'ROOM_FOLIO',
    orderedAt: '11:15 AM',
    promisedBy: '05:30 PM',
    handledByStaff: 'Victoria Omole',
  },
  {
    orderId: 'ANC-8802',
    guestName: 'Dr. Amina Bello',
    roomNumber: 'Room 108 (Executive)',
    serviceId: 'anc-03',
    serviceName: 'VIP Executive Airport Chauffeur Transfer',
    quantity: 1,
    unitPrice: 45000,
    totalAmount: 45000,
    specialInstructions: 'Flight departure at 04:30 PM. Needs pickup at resort lobby by 02:00 PM.',
    status: 'PENDING',
    billingMode: 'DIRECT_SETTLEMENT',
    paymentMethod: 'TRANSFER',
    orderedAt: '12:00 PM',
    promisedBy: '02:00 PM',
    handledByStaff: 'Ahmed Manager',
  },
  {
    orderId: 'ANC-8803',
    guestName: 'Engnr Omole',
    roomNumber: 'Executive Suite',
    serviceId: 'anc-04',
    serviceName: 'Full Body Swedish Massage & Wellness',
    quantity: 1,
    unitPrice: 25000,
    totalAmount: 25000,
    specialInstructions: 'Focus on shoulder and neck relaxation.',
    status: 'COMPLETED',
    billingMode: 'ROOM_FOLIO',
    orderedAt: '09:30 AM',
    promisedBy: '11:00 AM',
    handledByStaff: 'Victoria Omole',
  },
];

interface AncillaryOperationsViewProps {
  activeStaff: StaffUser;
  onBack?: () => void;
}

export default function AncillaryOperationsView({ activeStaff, onBack }: AncillaryOperationsViewProps) {
  const { showSuccess, showFailed, showConfirm } = useFeedback();
  const [services, setServices] = useState<AncillaryServiceItem[]>(INITIAL_ANCILLARY_SERVICES);
  const [orders, setOrders] = useState<AncillaryOrder[]>(INITIAL_ACTIVE_ORDERS);
  const [activeTab, setActiveTab] = useState<'ORDERS' | 'SERVICES'>('ORDERS');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // New Order Modal State
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [roomNumber, setRoomNumber] = useState('Room 101');
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.serviceId || '');
  const [orderQuantity, setOrderQuantity] = useState<number>(1);
  const [billingMode, setBillingMode] = useState<'ROOM_FOLIO' | 'DIRECT_SETTLEMENT'>('ROOM_FOLIO');
  const [directPaymentMethod, setDirectPaymentMethod] = useState<'POS' | 'TRANSFER' | 'CASH' | 'SPLIT'>('POS');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // New Service Offering Modal State (Admin)
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceGroup, setNewServiceGroup] = useState('Laundry & Dry-Cleaning');
  const [newServicePrice, setNewServicePrice] = useState<number | ''>(5000);
  const [newServiceDuration, setNewServiceDuration] = useState('Same Day');
  const [newServiceDesc, setNewServiceDesc] = useState('');

  const isSuperAdmin = activeStaff.role === 'SUPERADMIN' || activeStaff.role === 'OWNER' || (activeStaff.role as any) === 'ADMIN';

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const selectedService = services.find(s => s.serviceId === selectedServiceId) || services[0];
  const calculatedTotal = (selectedService?.price || 0) * (orderQuantity || 1);

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !selectedService) return;

    const newOrder: AncillaryOrder = {
      orderId: `ANC-${Date.now().toString().slice(-4)}`,
      guestName: guestName.trim(),
      roomNumber: roomNumber.trim(),
      serviceId: selectedService.serviceId,
      serviceName: selectedService.name,
      quantity: orderQuantity,
      unitPrice: selectedService.price,
      totalAmount: calculatedTotal,
      specialInstructions: specialInstructions.trim() || undefined,
      status: 'PENDING',
      billingMode,
      paymentMethod: billingMode === 'DIRECT_SETTLEMENT' ? directPaymentMethod : undefined,
      orderedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      promisedBy: selectedService.duration,
      handledByStaff: activeStaff.name,
    };

    setOrders([newOrder, ...orders]);
    setIsOrderModalOpen(false);
    showSuccess(
      'Service Order Dispatched',
      `${selectedService.name} ordered for ${guestName} (${roomNumber}). Billed via ${billingMode === 'ROOM_FOLIO' ? 'Room Folio' : directPaymentMethod}.`
    );

    // Reset form
    setGuestName('');
    setSpecialInstructions('');
    setOrderQuantity(1);
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim() || newServicePrice === '') return;

    const newItem: AncillaryServiceItem = {
      id: `anc-${Date.now().toString().slice(-4)}`,
      serviceId: `anc-${Date.now().toString().slice(-4)}`,
      name: newServiceName.trim(),
      group: newServiceGroup,
      price: Number(newServicePrice),
      duration: newServiceDuration.trim(),
      description: newServiceDesc.trim(),
      isAvailable: true,
      amenities: ['Resort Quality Assurance'],
    };

    setServices([...services, newItem]);
    setIsServiceModalOpen(false);
    showSuccess('New Offering Registered', `${newServiceName} added to [${newServiceGroup}].`);

    setNewServiceName('');
    setNewServiceDesc('');
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: AncillaryOrder['status']) => {
    setOrders(orders.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o));
    showSuccess('Order Updated', `Order #${orderId} marked as ${newStatus.replace(/_/g, ' ')}.`);
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.serviceName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: AncillaryOrder['status']) => {
    switch (status) {
      case 'PENDING':
        return <span className="badge badge-brand">⏳ Pending Queue</span>;
      case 'IN_SERVICE':
        return <span className="badge badge-purple" style={{ animation: 'pulse 2s infinite' }}>⚙ In Progress</span>;
      case 'READY_FOR_DELIVERY':
        return <span className="badge badge-dirty">🚚 Ready for Delivery</span>;
      case 'COMPLETED':
        return <span className="badge badge-clean">✓ Delivered & Settled</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px 0 60px' }}>
      
      {/* Top Header */}
      <div className="ent-card" style={{ padding: '24px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {onBack && (
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
                  <ArrowLeft size={14} /> Back
                </button>
              )}
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                Ancillary Operations Board
              </h2>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '6px', marginBottom: 0 }}>
              Dedicated operational desk for Laundry & Dry-Cleaning turnaround, Airport VIP Chauffeurs, and Wellness Spa services.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setIsOrderModalOpen(true)}
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.825rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={15} />
              <span>+ New Service Request</span>
            </button>

            {isSuperAdmin && (
              <button
                onClick={() => setIsServiceModalOpen(true)}
                className="btn-secondary"
                style={{ padding: '8px 16px', fontSize: '0.825rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={15} />
                <span>+ Add Service Offering</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Selector: Active Service Orders vs Service Offerings Catalog */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '24px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          <button
            onClick={() => setActiveTab('ORDERS')}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              fontSize: '0.825rem',
              fontWeight: activeTab === 'ORDERS' ? 800 : 600,
              backgroundColor: activeTab === 'ORDERS' ? 'var(--brand-primary)' : 'var(--bg-secondary)',
              color: activeTab === 'ORDERS' ? '#FFFFFF' : 'var(--text-secondary)',
              border: `1px solid ${activeTab === 'ORDERS' ? 'var(--brand-primary)' : 'var(--border-subtle)'}`,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Clock size={14} />
            <span>Active Service Orders & Turnaround ({orders.filter(o => o.status !== 'COMPLETED').length} Active)</span>
          </button>

          <button
            onClick={() => setActiveTab('SERVICES')}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              fontSize: '0.825rem',
              fontWeight: activeTab === 'SERVICES' ? 800 : 600,
              backgroundColor: activeTab === 'SERVICES' ? 'var(--brand-primary)' : 'var(--bg-secondary)',
              color: activeTab === 'SERVICES' ? '#FFFFFF' : 'var(--text-secondary)',
              border: `1px solid ${activeTab === 'SERVICES' ? 'var(--brand-primary)' : 'var(--border-subtle)'}`,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Tag size={14} />
            <span>Service Catalog & Price List ({services.length} Offerings)</span>
          </button>
        </div>
      </div>

      {/* TAB 1: ACTIVE ORDERS QUEUE */}
      {activeTab === 'ORDERS' && (
        <div className="ent-card" style={{ padding: '24px' }}>
          
          {/* Filters Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, maxWidth: '360px' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search guest, room, or order #..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', paddingLeft: '32px', fontSize: '0.825rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {(['ALL', 'PENDING', 'IN_SERVICE', 'READY_FOR_DELIVERY', 'COMPLETED'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.725rem',
                    fontWeight: statusFilter === st ? 800 : 600,
                    backgroundColor: statusFilter === st ? 'var(--brand-primary)' : 'var(--bg-secondary)',
                    color: statusFilter === st ? '#FFFFFF' : 'var(--text-secondary)',
                    border: `1px solid ${statusFilter === st ? 'var(--brand-primary)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                  }}
                >
                  {st.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Table */}
          <div style={{ overflowX: 'auto' }}>
            <table className="ent-table" style={{ width: '100%', fontSize: '0.825rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-secondary)', textAlign: 'left' }}>
                  <th style={{ padding: '10px 14px' }}>Order ID</th>
                  <th style={{ padding: '10px 14px' }}>Guest & Room</th>
                  <th style={{ padding: '10px 14px' }}>Service Requested</th>
                  <th style={{ padding: '10px 14px' }}>Qty / Turnaround</th>
                  <th style={{ padding: '10px 14px' }}>Amount & Billing</th>
                  <th style={{ padding: '10px 14px' }}>Status</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      No ancillary service orders matching current criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => (
                    <tr key={ord.orderId} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--brand-primary)' }}>
                        #{ord.orderId}
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500 }}>{ord.orderedAt}</div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{ord.guestName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--brand-primary)', fontWeight: 600 }}>{ord.roomNumber}</div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{ord.serviceName}</div>
                        {ord.specialInstructions && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '2px' }}>
                            "{ord.specialInstructions}"
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 700 }}>{ord.quantity} Unit(s)</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>SLA: {ord.promisedBy}</div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--emerald-primary)' }}>
                          {formatNaira(ord.totalAmount)}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: ord.billingMode === 'ROOM_FOLIO' ? '#2563eb' : '#059669', fontWeight: 700 }}>
                          {ord.billingMode === 'ROOM_FOLIO' ? 'Room Folio Charge' : `Direct: ${ord.paymentMethod || 'Paid'}`}
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        {getStatusBadge(ord.status)}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          {ord.status === 'PENDING' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(ord.orderId, 'IN_SERVICE')}
                              style={{
                                padding: '5px 10px',
                                fontSize: '0.72rem',
                                backgroundColor: '#7C3AED',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '5px',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              Start Service
                            </button>
                          )}
                          {ord.status === 'IN_SERVICE' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(ord.orderId, 'READY_FOR_DELIVERY')}
                              style={{
                                padding: '5px 10px',
                                fontSize: '0.72rem',
                                backgroundColor: '#D97706',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '5px',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              Ready for Delivery
                            </button>
                          )}
                          {ord.status === 'READY_FOR_DELIVERY' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(ord.orderId, 'COMPLETED')}
                              style={{
                                padding: '5px 10px',
                                fontSize: '0.72rem',
                                backgroundColor: '#059669',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '5px',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              Deliver & Close
                            </button>
                          )}
                          {ord.status === 'COMPLETED' && (
                            <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <CheckCircle2 size={12} /> Fulfilled
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SERVICE CATALOG & PRICING */}
      {activeTab === 'SERVICES' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {services.map((item) => (
            <div key={item.serviceId} className="ent-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                    {item.group}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, color: 'var(--emerald-primary)', fontSize: '1.15rem' }}>
                    {formatNaira(item.price)}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                  {item.name}
                </h3>

                <div style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px' }}>
                  <Clock size={13} />
                  <span>Turnaround / Duration: {item.duration}</span>
                </div>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 14px', lineHeight: 1.45 }}>
                  {item.description}
                </p>

                {item.amenities && item.amenities.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                    {item.amenities.map(am => (
                      <span key={am} style={{ fontSize: '0.68rem', padding: '3px 8px', borderRadius: '4px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                        ✓ {am}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>
                  ● Active Service Offering
                </span>
                <button
                  onClick={() => {
                    setSelectedServiceId(item.serviceId);
                    setIsOrderModalOpen(true);
                  }}
                  className="btn-primary"
                  style={{ padding: '6px 14px', fontSize: '0.75rem' }}
                >
                  Order Service
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: NEW SERVICE ORDER */}
      {isOrderModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120, padding: '20px' }}>
          <div className="ent-card" style={{ width: '100%', maxWidth: '520px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Dispatch Ancillary Service
                </h3>
              </div>
              <button type="button" onClick={() => setIsOrderModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Guest Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Alh. Ibrahim Danjuma"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    required
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Room Number
                  </label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    required
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Select Ancillary Service
                </label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  style={{ width: '100%' }}
                >
                  {services.map(s => (
                    <option key={s.serviceId} value={s.serviceId}>
                      {s.name} — {formatNaira(s.price)} ({s.duration})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Quantity / Units
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(Number(e.target.value))}
                    required
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Billing Option
                  </label>
                  <select
                    value={billingMode}
                    onChange={(e) => setBillingMode(e.target.value as any)}
                    style={{ width: '100%' }}
                  >
                    <option value="ROOM_FOLIO">Charge to Room Folio</option>
                    <option value="DIRECT_SETTLEMENT">Direct Settlement (Walk-In)</option>
                  </select>
                </div>
              </div>

              {billingMode === 'DIRECT_SETTLEMENT' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Payment Channel
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    {(['POS', 'TRANSFER', 'CASH', 'SPLIT'] as const).map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setDirectPaymentMethod(m)}
                        style={{
                          padding: '6px',
                          fontSize: '0.72rem',
                          fontWeight: directPaymentMethod === m ? 800 : 600,
                          backgroundColor: directPaymentMethod === m ? 'var(--brand-primary)' : 'var(--bg-secondary)',
                          color: directPaymentMethod === m ? '#FFFFFF' : 'var(--text-secondary)',
                          border: `1px solid ${directPaymentMethod === m ? 'var(--brand-primary)' : 'var(--border-color)'}`,
                          borderRadius: '6px',
                          cursor: 'pointer',
                        }}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Special Laundry / Concierge Instructions
                </label>
                <textarea
                  placeholder="e.g. Light starch, hang on wooden hanger, pickup shoes for polish..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  rows={2}
                  style={{ width: '100%', fontSize: '0.8rem' }}
                />
              </div>

              {/* Total Summary */}
              <div style={{ padding: '12px 16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Service Charge:</span>
                <span style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--emerald-primary)', fontFamily: 'var(--font-mono)' }}>
                  {formatNaira(calculatedTotal)}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button type="button" onClick={() => setIsOrderModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Confirm & Dispatch Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD SERVICE OFFERING (ADMIN) */}
      {isServiceModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120, padding: '20px' }}>
          <div className="ent-card" style={{ width: '100%', maxWidth: '480px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Register Ancillary Service Offering
              </h3>
              <button type="button" onClick={() => setIsServiceModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateService} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Service Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Leather Shoe Shining & Buffing"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  required
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Category Group
                  </label>
                  <select
                    value={newServiceGroup}
                    onChange={(e) => setNewServiceGroup(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="Laundry & Dry-Cleaning">Laundry & Dry-Cleaning</option>
                    <option value="Transport & Transfers">Transport & Transfers</option>
                    <option value="Spa & Wellness">Spa & Wellness</option>
                    <option value="Concierge">Concierge</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Standard Rate (₦)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(Number(e.target.value))}
                    required
                    style={{ width: '100%', fontFamily: 'var(--font-mono)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Turnaround SLA / Duration
                </label>
                <input
                  type="text"
                  placeholder="e.g. 4 Hours Turnaround, 45 Mins, Per Trip"
                  value={newServiceDuration}
                  onChange={(e) => setNewServiceDuration(e.target.value)}
                  required
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Description
                </label>
                <textarea
                  placeholder="Service scope, deliverables, and guest requirements..."
                  value={newServiceDesc}
                  onChange={(e) => setNewServiceDesc(e.target.value)}
                  rows={2}
                  style={{ width: '100%', fontSize: '0.8rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsServiceModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Service Offering
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
