'use client';

import React, { useState } from 'react';
import { 
  Room, 
  RoomTimelineItem, 
  StaffUser, 
  RoomStatus 
} from '@hosos/types';
import { 
  ShieldCheck, 
  Clock, 
  User, 
  UtensilsCrossed, 
  Wrench, 
  Banknote, 
  BedDouble, 
  PlusCircle, 
  Filter, 
  AlertCircle,
  TrendingUp,
  Receipt,
  FileCheck2,
  Calendar,
  Layers,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';

interface RoomAuditViewProps {
  rooms: Room[];
  selectedRoom: Room;
  onSelectRoom: (room: Room) => void;
  timeline: RoomTimelineItem[];
  consumptionStats: Array<{
    id: string;
    itemName: string;
    category: string;
    totalQuantity: number;
    unitPriceCharged: number;
    totalSpent: number;
    lastOrderedAt: string;
    orderedByStaff: string;
  }>;
  activeStaff: StaffUser;
  onOpenOrderModal: () => void;
  onOpenMaintenanceModal: () => void;
  onOpenPaymentModal: () => void;
  onOpenStatusModal: () => void;
}

export default function RoomAuditView({
  rooms,
  selectedRoom,
  onSelectRoom,
  timeline,
  consumptionStats,
  activeStaff,
  onOpenOrderModal,
  onOpenMaintenanceModal,
  onOpenPaymentModal,
  onOpenStatusModal,
}: RoomAuditViewProps) {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter timeline based on category
  const filteredTimeline = timeline.filter((item) => {
    if (filterCategory === 'ALL') return true;
    if (filterCategory === 'OCCUPANCY' && item.category === 'OCCUPANCY') return true;
    if (filterCategory === 'ORDERS' && (item.category === 'ORDER' || item.category === 'ORDER_INCREMENT')) return true;
    if (filterCategory === 'MAINTENANCE' && item.category === 'MAINTENANCE') return true;
    if (filterCategory === 'PAYMENTS' && item.category === 'PAYMENT') return true;
    return false;
  }).filter(item => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.headline.toLowerCase().includes(q) ||
      item.details.toLowerCase().includes(q) ||
      item.actor.staffName.toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status: RoomStatus) => {
    switch (status) {
      case 'VACANT_CLEAN':
        return <span className="badge badge-clean"><span className="pulse-dot pulse-dot-green"></span>Clean</span>;
      case 'OCCUPIED':
        return <span className="badge badge-occupied"><span className="pulse-dot pulse-dot-blue"></span>Occupied</span>;
      case 'VACANT_DIRTY':
        return <span className="badge badge-dirty"><span className="pulse-dot pulse-dot-amber"></span>Dirty</span>;
      case 'MAINTENANCE':
      case 'OUT_OF_ORDER':
        return <span className="badge badge-maintenance"><span className="pulse-dot pulse-dot-red"></span>Maintenance</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTimestamp = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('en-NG', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }) + ' WAT';
  };

  // Metrics calculation
  const totalOrdersSum = consumptionStats.reduce((acc, curr) => acc + curr.totalSpent, 0);
  const totalPaymentsReceived = timeline
    .filter(t => t.category === 'PAYMENT' && t.amount)
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const maintenanceCostSum = timeline
    .filter(t => t.category === 'MAINTENANCE' && t.amount)
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px 0' }}>
      
      {/* 1. TOP ROOM SELECTOR STRIP: See occupancy state of EVERY room */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFF' }}>
              All Resort Rooms & Live Occupancy State
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Click any room to open its internal 360° audit timeline, order increments, and maintenance logs.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span className="badge badge-occupied">{rooms.filter(r => r.status === 'OCCUPIED').length} Occupied</span>
            <span className="badge badge-clean">{rooms.filter(r => r.status === 'VACANT_CLEAN').length} Clean</span>
            <span className="badge badge-dirty">{rooms.filter(r => r.status === 'VACANT_DIRTY').length} Dirty</span>
            <span className="badge badge-maintenance">{rooms.filter(r => r.status === 'MAINTENANCE').length} Maint</span>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: '12px',
        }}>
          {rooms.map((room) => {
            const isSelected = room.roomNumber === selectedRoom.roomNumber;
            return (
              <button
                key={room.id}
                onClick={() => onSelectRoom(room)}
                style={{
                  textAlign: 'left',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  background: isSelected 
                    ? 'linear-gradient(135deg, rgba(224, 169, 109, 0.16) 0%, rgba(20, 30, 55, 0.95) 100%)' 
                    : 'var(--bg-card)',
                  border: isSelected ? '1.5px solid var(--gold-primary)' : '1px solid var(--border-subtle)',
                  boxShadow: isSelected ? '0 0 16px rgba(224, 169, 109, 0.25)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-heading)',
                    color: isSelected ? 'var(--gold-primary)' : '#FFF',
                  }}>
                    #{room.roomNumber}
                  </span>
                  {getStatusBadge(room.status)}
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {room.roomTypeName}
                </div>

                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {room.currentGuestName ? (
                    <span style={{ color: 'var(--sky-primary)' }}>👤 {room.currentGuestName}</span>
                  ) : (
                    <span>Floor {room.floor} • {formatNaira(room.rackRatePerNight)}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. SELECTED ROOM HEADER & 360° METRICS BANNER */}
      <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid var(--gold-primary)' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                Room {selectedRoom.roomNumber} Internal 360° Audit
              </h2>
              {getStatusBadge(selectedRoom.status)}
              <span className="badge badge-gold">{selectedRoom.roomTypeName}</span>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '6px' }}>
              {selectedRoom.currentGuestName ? (
                <span>
                  Occupied by <strong style={{ color: '#FFF' }}>{selectedRoom.currentGuestName}</strong> • Folio: <strong style={{ color: 'var(--gold-primary)', fontFamily: 'var(--font-mono)' }}>{selectedRoom.currentFolioId || '#FOL-204-89'}</strong> • Check-in: 14:10 WAT (Mary Okon)
                </span>
              ) : (
                <span>Currently {selectedRoom.status.replace('_', ' ')} • Floor {selectedRoom.floor} • Rack Rate: {formatNaira(selectedRoom.rackRatePerNight)}/night</span>
              )}
            </p>
          </div>

          {/* Action Buttons to Log Actions live with Staff PIN attribution */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <button
              onClick={onOpenOrderModal}
              className="btn-gold"
              title="Add food/drink order or increment existing order"
            >
              <UtensilsCrossed size={16} />
              <span>+ Order / Increment Item</span>
            </button>

            <button
              onClick={onOpenMaintenanceModal}
              className="btn-ghost"
              title="Raise ticket or log repairs with parts cost"
            >
              <Wrench size={16} color="var(--amber-primary)" />
              <span>+ Log Maintenance</span>
            </button>

            <button
              onClick={onOpenPaymentModal}
              className="btn-ghost"
              title="Receive cash, POS or transfer credited to room"
            >
              <Banknote size={16} color="var(--emerald-primary)" />
              <span>+ Receive Money</span>
            </button>

            <button
              onClick={onOpenStatusModal}
              className="btn-ghost"
              title="Change occupancy state with staff PIN"
            >
              <BedDouble size={16} color="var(--sky-primary)" />
              <span>Change Status</span>
            </button>
          </div>
        </div>

        {/* Financial & Activity Summary Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px solid var(--border-subtle)',
        }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Total F&B Orders Billed
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--gold-primary)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
              {formatNaira(totalOrdersSum)}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Across {consumptionStats.reduce((a, c) => a + c.totalQuantity, 0)} total meal & drink portions
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Money Received Towards Room
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--emerald-primary)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
              {formatNaira(totalPaymentsReceived)}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Deposits & POS cards fully receipted
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Maintenance Repairs Incurred
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--amber-primary)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
              {formatNaira(maintenanceCostSum)}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Parts replaced & technician sign-off
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Current Folio Balance
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFF', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
              {formatNaira(selectedRoom.rackRatePerNight + totalOrdersSum - totalPaymentsReceived)}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--sky-primary)', marginTop: '2px' }}>
              Credit Cap: ₦200,000 (Safe)
            </div>
          </div>
        </div>
      </div>

      {/* 3. SECTION A: CUMULATIVE FOOD & DRINK CONSUMPTION TABLE */}
      {/* "See the number of times a meal or drink is ordered, the price it was sold at" */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UtensilsCrossed size={20} color="var(--gold-primary)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                Room {selectedRoom.roomNumber} Food & Drink Consumption Breakdown
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Audit list of every dish and beverage served to this room, order counts, exact unit price charged, and staff attribution.
            </p>
          </div>
          <span className="badge badge-purple">{consumptionStats.length} Unique Menu Items</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                <th style={{ padding: '12px 14px' }}>Item Ordered</th>
                <th style={{ padding: '12px 14px' }}>Station</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Times Ordered</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Price Sold At</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Total Billed</th>
                <th style={{ padding: '12px 14px' }}>Logged By Staff</th>
                <th style={{ padding: '12px 14px' }}>Last Order Time</th>
              </tr>
            </thead>
            <tbody>
              {consumptionStats.map((item, idx) => (
                <tr 
                  key={item.id} 
                  style={{ 
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'
                  }}
                >
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: '#FFF' }}>
                    {item.itemName}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span className={item.category === 'KITCHEN_FOOD' ? 'badge badge-gold' : 'badge badge-occupied'}>
                      {item.category === 'KITCHEN_FOOD' ? 'Kitchen' : 'Bar / Lounge'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                    <span style={{
                      background: 'rgba(224, 169, 109, 0.15)',
                      color: 'var(--gold-primary)',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                    }}>
                      {item.totalQuantity}x
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {formatNaira(item.unitPriceCharged)}
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--gold-primary)' }}>
                    {formatNaira(item.totalSpent)}
                  </td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <User size={13} color="var(--sky-primary)" />
                      <span>{item.orderedByStaff}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                    {formatTimestamp(item.lastOrderedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. SECTION B: 360° ACTIVITY TIMELINE (INCREMENTS, MAINTENANCE, PAYMENTS, STAFF & DATE) */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          marginBottom: '20px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={20} color="var(--sky-primary)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                Chronological Audit Trail (Who, What, When & Increments)
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Immutable log where every single order addition, maintenance repair, occupancy change, or cash receipt is stamped with time and staff name.
            </p>
          </div>

          {/* Category Filter Buttons */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: 'All Actions' },
              { id: 'OCCUPANCY', label: 'Occupancy' },
              { id: 'ORDERS', label: 'Orders & Increments' },
              { id: 'MAINTENANCE', label: 'Maintenance' },
              { id: 'PAYMENTS', label: 'Money Received' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterCategory(f.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: filterCategory === f.id ? 'var(--gold-primary)' : 'rgba(255,255,255,0.05)',
                  color: filterCategory === f.id ? '#060A13' : 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Event Feed */}
        <div style={{
          position: 'relative',
          paddingLeft: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}>
          {/* Timeline Vertical Axis Line */}
          <div style={{
            position: 'absolute',
            left: '11px',
            top: '8px',
            bottom: '8px',
            width: '2px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          }}></div>

          {filteredTimeline.map((event) => {
            let nodeColor = 'var(--sky-primary)';
            let NodeIcon = Clock;
            if (event.category === 'ORDER_INCREMENT') {
              nodeColor = 'var(--gold-primary)';
              NodeIcon = TrendingUp;
            } else if (event.category === 'ORDER') {
              nodeColor = 'var(--gold-primary)';
              NodeIcon = UtensilsCrossed;
            } else if (event.category === 'MAINTENANCE') {
              nodeColor = 'var(--amber-primary)';
              NodeIcon = Wrench;
            } else if (event.category === 'PAYMENT') {
              nodeColor = 'var(--emerald-primary)';
              NodeIcon = Banknote;
            } else if (event.category === 'OCCUPANCY') {
              nodeColor = 'var(--sky-primary)';
              NodeIcon = BedDouble;
            }

            return (
              <div 
                key={event.id}
                style={{
                  position: 'relative',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 20px',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Timeline Node Dot */}
                <div style={{
                  position: 'absolute',
                  left: '-31px',
                  top: '18px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-primary)',
                  border: `2px solid ${nodeColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 0 10px ${nodeColor}40`,
                }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: nodeColor }}></div>
                </div>

                {/* Event Header: Date/Time + Category + Staff Attribution */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginBottom: '8px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-muted)',
                      background: 'rgba(255,255,255,0.05)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                    }}>
                      {formatTimestamp(event.timestamp)}
                    </span>
                    <span className="badge" style={{
                      backgroundColor: `${nodeColor}18`,
                      color: nodeColor,
                      border: `1px solid ${nodeColor}40`,
                      fontSize: '0.65rem',
                    }}>
                      {event.category.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Staff Attribution Badge */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(255,255,255,0.05)',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                  }}>
                    <User size={13} color="var(--gold-primary)" />
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      Logged by: {event.actor.staffName}
                    </span>
                    <span className="badge badge-purple" style={{ fontSize: '0.6rem', padding: '1px 5px' }}>
                      {event.actor.role.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Event Headline & Financial Impact */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFF' }}>
                    {event.headline}
                  </h4>
                  {event.amount !== undefined && (
                    <span style={{
                      fontSize: '1rem',
                      fontWeight: 800,
                      fontFamily: 'var(--font-mono)',
                      color: event.category === 'PAYMENT' ? 'var(--emerald-primary)' : 'var(--gold-primary)',
                    }}>
                      {event.category === 'PAYMENT' ? `+${formatNaira(event.amount)}` : formatNaira(event.amount)}
                    </span>
                  )}
                </div>

                {/* Event Details Text */}
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.5 }}>
                  {event.details}
                </p>

                {/* Extra Meta Badges (Receipt, Ticket, Items) */}
                {event.meta && (
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '10px',
                    marginTop: '10px',
                    paddingTop: '10px',
                    borderTop: '1px solid rgba(255,255,255,0.04)',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                  }}>
                    {event.meta.orderNumber && (
                      <span style={{ color: 'var(--gold-primary)' }}>
                        Order Ref: <strong>{event.meta.orderNumber}</strong>
                      </span>
                    )}
                    {event.meta.ticketNumber && (
                      <span style={{ color: 'var(--amber-primary)' }}>
                        Ticket Ref: <strong>{event.meta.ticketNumber}</strong>
                      </span>
                    )}
                    {event.meta.receiptNumber && (
                      <span style={{ color: 'var(--emerald-primary)' }}>
                        Receipt / Auth: <strong>{event.meta.receiptNumber}</strong>
                      </span>
                    )}
                    {event.meta.priceSnapshot && (
                      <span style={{ color: 'var(--sky-primary)' }}>
                        Unit Price Charged: {formatNaira(event.meta.priceSnapshot)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
