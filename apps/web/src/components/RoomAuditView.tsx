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
  CheckCircle2,
  Search
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
        return <span className="badge badge-clean">Clean & Inspected</span>;
      case 'OCCUPIED':
        return <span className="badge badge-brand">Occupied</span>;
      case 'VACANT_DIRTY':
        return <span className="badge badge-dirty">Housekeeping Dirty</span>;
      case 'MAINTENANCE':
      case 'OUT_OF_ORDER':
        return <span className="badge badge-maintenance">Under Maintenance</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              All Resort Rooms & Live Occupancy State
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Click any room to open its internal 360° audit timeline, order increments, and maintenance logs.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="badge badge-brand">{rooms.filter(r => r.status === 'OCCUPIED').length} Occupied</span>
            <span className="badge badge-clean">{rooms.filter(r => r.status === 'VACANT_CLEAN').length} Clean</span>
            <span className="badge badge-dirty">{rooms.filter(r => r.status === 'VACANT_DIRTY').length} Dirty</span>
            <span className="badge badge-maintenance">{rooms.filter(r => r.status === 'MAINTENANCE').length} Maint</span>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
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
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isSelected ? 'var(--brand-bg)' : '#FFFFFF',
                  border: isSelected ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-color)',
                  boxShadow: isSelected ? 'var(--shadow-card)' : 'var(--shadow-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    color: isSelected ? 'var(--brand-primary)' : 'var(--text-primary)',
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
                    <span style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>👤 {room.currentGuestName}</span>
                  ) : (
                    <span>Floor {room.floor} • {formatNaira(room.rackRatePerNight)}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. SELECTED ROOM HEADER & 360° AUDIT METRICS BANNER */}
      <div className="ent-card" style={{ padding: '24px', borderLeft: '4px solid var(--brand-primary)' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Room {selectedRoom.roomNumber} Internal 360° Audit
              </h2>
              {getStatusBadge(selectedRoom.status)}
              <span className="badge badge-neutral">{selectedRoom.roomTypeName}</span>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '6px' }}>
              {selectedRoom.currentGuestName ? (
                <span>
                  Occupied by <strong style={{ color: 'var(--text-primary)' }}>{selectedRoom.currentGuestName}</strong> • Active Folio: <strong style={{ color: 'var(--brand-primary)', fontFamily: 'var(--font-mono)' }}>{selectedRoom.currentFolioId || '#FOL-204-89'}</strong> • Check-In: 14:10 WAT (Mary Okon)
                </span>
              ) : (
                <span>Currently {selectedRoom.status.replace(/_/g, ' ')} • Floor {selectedRoom.floor} • Rack Rate: {formatNaira(selectedRoom.rackRatePerNight)}/night</span>
              )}
            </p>
          </div>

          {/* Action Buttons to Log Actions live with Staff PIN attribution */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <button
              onClick={onOpenOrderModal}
              className="btn-primary"
              title="Add food/drink order or increment existing order"
            >
              <UtensilsCrossed size={15} />
              <span>+ Order / Increment Item</span>
            </button>

            <button
              onClick={onOpenMaintenanceModal}
              className="btn-secondary"
              title="Raise ticket or log repairs with parts cost"
            >
              <Wrench size={15} color="var(--amber-primary)" />
              <span>+ Log Maintenance</span>
            </button>

            <button
              onClick={onOpenPaymentModal}
              className="btn-secondary"
              title="Receive cash, POS or transfer credited to room"
            >
              <Banknote size={15} color="var(--emerald-primary)" />
              <span>+ Receive Money</span>
            </button>

            <button
              onClick={onOpenStatusModal}
              className="btn-secondary"
              title="Change occupancy state with staff PIN"
            >
              <BedDouble size={15} color="var(--brand-primary)" />
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
          borderTop: '1px solid var(--border-color)',
        }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Total F&B Orders Billed
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
              {formatNaira(totalOrdersSum)}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Across {consumptionStats.reduce((a, c) => a + c.totalQuantity, 0)} meal & beverage portions
            </div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Money Received Towards Room
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--emerald-primary)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
              {formatNaira(totalPaymentsReceived)}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Verified deposits & POS cards
            </div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Maintenance Repairs Incurred
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--amber-primary)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
              {formatNaira(maintenanceCostSum)}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Parts consumed & labor verified
            </div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Current Folio Balance
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--brand-primary)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
              {formatNaira(selectedRoom.rackRatePerNight + totalOrdersSum - totalPaymentsReceived)}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--emerald-primary)', marginTop: '2px', fontWeight: 600 }}>
              Credit Cap: ₦200,000 (Safe)
            </div>
          </div>
        </div>
      </div>

      {/* 3. SECTION A: CUMULATIVE FOOD & DRINK CONSUMPTION TABLE */}
      {/* "See the number of times a meal or drink is ordered, the price it was sold at" */}
      <div className="ent-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UtensilsCrossed size={18} color="var(--brand-primary)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Room {selectedRoom.roomNumber} Food & Drink Consumption Breakdown
              </h3>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Audit list of every dish and beverage served to this room, order counts, exact unit price charged, and staff attribution.
            </p>
          </div>
          <span className="badge badge-brand">{consumptionStats.length} Unique Menu Items</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="ent-table">
            <thead>
              <tr>
                <th>Item Ordered</th>
                <th>Station</th>
                <th style={{ textAlign: 'center' }}>Times Ordered</th>
                <th style={{ textAlign: 'right' }}>Price Sold At</th>
                <th style={{ textAlign: 'right' }}>Total Billed</th>
                <th>Logged By Staff</th>
                <th>Last Order Time</th>
              </tr>
            </thead>
            <tbody>
              {consumptionStats.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {item.itemName}
                  </td>
                  <td>
                    <span className={item.category === 'KITCHEN_FOOD' ? 'badge badge-brand' : 'badge badge-purple'}>
                      {item.category === 'KITCHEN_FOOD' ? 'Kitchen Food' : 'Bar / Beverage'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{
                      backgroundColor: 'var(--brand-bg)',
                      color: 'var(--brand-primary)',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                    }}>
                      {item.totalQuantity}x
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {formatNaira(item.unitPriceCharged)}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--brand-primary)' }}>
                    {formatNaira(item.totalSpent)}
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <User size={13} color="var(--brand-primary)" />
                      <span>{item.orderedByStaff}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                    {formatTimestamp(item.lastOrderedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. SECTION B: 360° ACTIVITY TIMELINE (INCREMENTS, MAINTENANCE, PAYMENTS, STAFF & DATE) */}
      <div className="ent-card" style={{ padding: '24px' }}>
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
              <Clock size={18} color="var(--brand-primary)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Chronological Audit Trail (Who, What, When & Increments)
              </h3>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Every single order addition, maintenance repair, occupancy change, or cash receipt is stamped with time and staff name.
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
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: filterCategory === f.id ? 'var(--brand-primary)' : 'var(--bg-secondary)',
                  color: filterCategory === f.id ? '#FFFFFF' : 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
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
          gap: '16px',
        }}>
          {/* Vertical Timeline Axis */}
          <div style={{
            position: 'absolute',
            left: '11px',
            top: '8px',
            bottom: '8px',
            width: '2px',
            backgroundColor: 'var(--border-color)',
          }}></div>

          {filteredTimeline.map((event) => {
            let badgeClass = 'badge badge-brand';
            if (event.category === 'ORDER_INCREMENT') badgeClass = 'badge badge-brand';
            else if (event.category === 'MAINTENANCE') badgeClass = 'badge badge-dirty';
            else if (event.category === 'PAYMENT') badgeClass = 'badge badge-clean';
            else if (event.category === 'OCCUPANCY') badgeClass = 'badge badge-neutral';

            return (
              <div 
                key={event.id}
                style={{
                  position: 'relative',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '16px',
                  boxShadow: 'var(--shadow-subtle)',
                }}
              >
                {/* Timeline Dot */}
                <div style={{
                  position: 'absolute',
                  left: '-31px',
                  top: '18px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  border: '2px solid var(--brand-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--brand-primary)' }}></div>
                </div>

                {/* Header: Date, Category & Staff Attribution */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginBottom: '8px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-muted)',
                      backgroundColor: 'var(--bg-secondary)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                    }}>
                      {formatTimestamp(event.timestamp)}
                    </span>
                    <span className={badgeClass} style={{ fontSize: '0.65rem' }}>
                      {event.category.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Staff Attribution Badge */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: 'var(--bg-secondary)',
                    padding: '3px 10px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                  }}>
                    <User size={12} color="var(--brand-primary)" />
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      Logged by: {event.actor.staffName}
                    </span>
                    <span className="badge badge-purple" style={{ fontSize: '0.6rem', padding: '1px 5px' }}>
                      {event.actor.role.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Headline & Amount */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {event.headline}
                  </h4>
                  {event.amount !== undefined && (
                    <span style={{
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      fontFamily: 'var(--font-mono)',
                      color: event.category === 'PAYMENT' ? 'var(--emerald-primary)' : 'var(--brand-primary)',
                    }}>
                      {event.category === 'PAYMENT' ? `+${formatNaira(event.amount)}` : formatNaira(event.amount)}
                    </span>
                  )}
                </div>

                {/* Event Details */}
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
                  {event.details}
                </p>

                {/* Meta details (Refs, Prices) */}
                {event.meta && (
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '12px',
                    marginTop: '8px',
                    paddingTop: '8px',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                  }}>
                    {event.meta.orderNumber && (
                      <span style={{ color: 'var(--brand-primary)' }}>
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
                      <span style={{ color: 'var(--text-secondary)' }}>
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
