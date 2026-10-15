'use client';

import React, { useState } from 'react';
import { StaffUser, Room } from '@hosos/types';
import { 
  UtensilsCrossed, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  Banknote, 
  Send, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle,
  Receipt,
  Clock,
  UserCheck
} from 'lucide-react';

interface POSViewProps {
  rooms: Room[];
  activeStaff: StaffUser;
  onPostChargeToRoom: (roomNumber: string, amount: number, itemsSummary: string) => void;
}

export default function POSView({
  rooms,
  activeStaff,
  onPostChargeToRoom,
}: POSViewProps) {
  const [selectedOutlet, setSelectedOutlet] = useState<'RESTAURANT' | 'POOL_BAR' | 'LOUNGE'>('RESTAURANT');
  const [orderType, setOrderType] = useState<'DINE_IN' | 'ROOM_SERVICE' | 'BAR_TAB'>('ROOM_SERVICE');
  const [selectedRoomNumber, setSelectedRoomNumber] = useState('204');
  
  // Cart state
  const [cart, setCart] = useState<Array<{ id: string; name: string; price: number; quantity: number }>>([
    { id: 'm-1', name: 'Spicy Goat Meat Pepper Soup', price: 7500, quantity: 2 },
    { id: 'm-4', name: 'Heineken Draught (Cold)', price: 2500, quantity: 3 },
  ]);

  // Transfer verification simulation state
  const [transferPending, setTransferPending] = useState(false);
  const [transferVerified, setTransferVerified] = useState(false);

  const menuItems = [
    { id: 'm-1', name: 'Spicy Goat Meat Pepper Soup', cat: 'Kitchen', price: 7500 },
    { id: 'm-2', name: 'Grilled Croaker Fish & Yam Chips', cat: 'Kitchen', price: 14500 },
    { id: 'm-3', name: 'Oseika Jollof Rice Special Platter', cat: 'Kitchen', price: 9500 },
    { id: 'm-4', name: 'Heineken Draught (Cold)', cat: 'Bar', price: 2500 },
    { id: 'm-5', name: 'Oseika Chapman Cocktail', cat: 'Bar', price: 3800 },
    { id: 'm-6', name: 'Hennessy VSOP (50ml Tot)', cat: 'Bar', price: 6500 },
    { id: 'm-7', name: 'Club Sandwich & French Fries', cat: 'Kitchen', price: 6000 },
    { id: 'm-8', name: 'Fresh Tropical Coconut Water', cat: 'Bar', price: 2000 },
  ];

  const addToCart = (item: { id: string; name: string; price: number }) => {
    setCart((prev) => {
      const existing = prev.find(p => p.id === item.id);
      if (existing) {
        return prev.map(p => p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(p => p.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(p => {
      if (p.id === id) {
        const newQ = p.quantity + delta;
        return newQ > 0 ? { ...p, quantity: newQ } : p;
      }
      return p;
    }));
  };

  const subtotal = cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  const vat = Math.round(subtotal * 0.075);
  const serviceCharge = Math.round(subtotal * 0.1);
  const total = subtotal + vat + serviceCharge;

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleChargeToRoom = () => {
    const summary = cart.map(c => `${c.quantity}x ${c.name}`).join(', ');
    onPostChargeToRoom(selectedRoomNumber, total, summary);
    alert(`Order of ${formatNaira(total)} posted to Room ${selectedRoomNumber} Folio! Logged under staff: ${activeStaff.name}`);
    setCart([]);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', padding: '24px 0' }}>
      
      {/* Left: Outlet Switcher + Menu Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Outlet & Mode Bar */}
        <div className="glass-card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['RESTAURANT', 'POOL_BAR', 'LOUNGE'] as const).map(outlet => (
                <button
                  key={outlet}
                  onClick={() => setSelectedOutlet(outlet)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    backgroundColor: selectedOutlet === outlet ? 'var(--gold-primary)' : 'rgba(255,255,255,0.05)',
                    color: selectedOutlet === outlet ? '#060A13' : 'var(--text-secondary)',
                  }}
                >
                  {outlet.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Station:</span>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value as any)}
                style={{ fontSize: '0.8rem' }}
              >
                <option value="ROOM_SERVICE">Room Service Delivery</option>
                <option value="DINE_IN">Table Dine-In</option>
                <option value="BAR_TAB">Bar Tab</option>
              </select>
            </div>
          </div>
        </div>

        {/* Menu Cards */}
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px', color: '#FFF' }}>
            {selectedOutlet.replace('_', ' ')} Active Menu
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '14px',
          }}>
            {menuItems.map((item) => (
              <div
                key={item.id}
                onClick={() => addToCart(item)}
                className="glass-card-interactive"
                style={{ padding: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span className={item.cat === 'Kitchen' ? 'badge badge-gold' : 'badge badge-occupied'}>
                      {item.cat}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--emerald-primary)', fontWeight: 600 }}>
                      Available
                    </span>
                  </div>

                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFF' }}>
                    {item.name}
                  </h4>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--gold-primary)' }}>
                    {formatNaira(item.price)}
                  </span>
                  <button
                    className="btn-ghost"
                    style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(item);
                    }}
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nigeria Operational Feature: Manual Bank Transfer Verification Protocol */}
        <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid var(--amber-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <ShieldAlert size={20} color="var(--amber-primary)" />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFF' }}>
              Anti-Fraud: Manual Bank Transfer Verification Queue
            </h4>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Prevents fake bank credit SMS and screenshot scams. Waiters log the transfer claim, which must be verified against resort accounts by the central cashier before orders are released.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
            <button
              onClick={() => {
                setTransferPending(true);
                setTransferVerified(false);
              }}
              className="btn-ghost"
              style={{ fontSize: '0.8rem' }}
            >
              Simulate Guest Transfer (₦35,000 via GTBank)
            </button>

            {transferPending && !transferVerified && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-dirty">Awaiting Cashier Verification</span>
                <button
                  onClick={() => {
                    setTransferVerified(true);
                    setTransferPending(false);
                  }}
                  className="btn-gold"
                  style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                >
                  Cashier Verify & Release
                </button>
              </div>
            )}

            {transferVerified && (
              <span className="badge badge-clean">
                <CheckCircle2 size={12} /> Verified by Fatima Sanusi (Funds Confirmed)
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Right: Active Ticket / Cart Drawer */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: 'fit-content' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Active Order Ticket</h3>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Server: <strong style={{ color: '#FFF' }}>{activeStaff.name}</strong>
            </div>
          </div>
          <span className="badge badge-gold">KOT Firing</span>
        </div>

        {/* Room / Destination Selector */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
            Bill Destination
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              onClick={() => setOrderType('ROOM_SERVICE')}
              style={{
                padding: '8px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: orderType === 'ROOM_SERVICE' ? 'var(--gold-primary)' : 'rgba(255,255,255,0.05)',
                color: orderType === 'ROOM_SERVICE' ? '#060A13' : 'var(--text-secondary)',
              }}
            >
              Charge Room
            </button>
            <button
              onClick={() => setOrderType('DINE_IN')}
              style={{
                padding: '8px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: orderType === 'DINE_IN' ? 'var(--gold-primary)' : 'rgba(255,255,255,0.05)',
                color: orderType === 'DINE_IN' ? '#060A13' : 'var(--text-secondary)',
              }}
            >
              Direct Cash/POS
            </button>
          </div>

          {orderType === 'ROOM_SERVICE' && (
            <div style={{ marginTop: '8px' }}>
              <select
                value={selectedRoomNumber}
                onChange={(e) => setSelectedRoomNumber(e.target.value)}
                style={{ width: '100%', fontSize: '0.85rem' }}
              >
                {rooms.map(r => (
                  <option key={r.id} value={r.roomNumber}>
                    Room {r.roomNumber} ({r.currentGuestName || 'Unassigned'})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Cart Item List */}
        <div style={{
          maxHeight: '260px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          paddingRight: '4px',
          marginBottom: '16px',
        }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Order is empty. Tap menu items to add.
            </div>
          ) : (
            cart.map((item) => (
              <div 
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 10px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                }}
              >
                <div style={{ maxWidth: '160px' }}>
                  <div style={{ fontWeight: 600, color: '#FFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {formatNaira(item.price)} each
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px' }}>
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      style={{ padding: '2px 6px', background: 'transparent', color: 'var(--text-muted)' }}
                    >
                      <Minus size={12} />
                    </button>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, minWidth: '16px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      style={{ padding: '2px 6px', background: 'transparent', color: 'var(--text-muted)' }}
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', minWidth: '60px', textAlign: 'right' }}>
                    {formatNaira(item.price * item.quantity)}
                  </span>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    style={{ background: 'transparent', color: 'var(--rose-primary)', padding: '2px' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Calculation Totals */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          fontSize: '0.85rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span>Subtotal</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>{formatNaira(subtotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span>VAT (7.5%)</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>{formatNaira(vat)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span>Service Charge (10%)</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>{formatNaira(serviceCharge)}</span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            color: '#FFF',
            fontWeight: 800,
            fontSize: '1.2rem',
            marginTop: '8px',
            paddingTop: '8px',
            borderTop: '1px solid var(--border-subtle)',
          }}>
            <span>Total</span>
            <span style={{ color: 'var(--gold-primary)', fontFamily: 'var(--font-mono)' }}>
              {formatNaira(total)}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div style={{ marginTop: '18px' }}>
          {orderType === 'ROOM_SERVICE' ? (
            <button
              onClick={handleChargeToRoom}
              disabled={cart.length === 0}
              className="btn-gold"
              style={{ width: '100%', justifyContent: 'center', opacity: cart.length === 0 ? 0.5 : 1 }}
            >
              <Receipt size={16} />
              <span>Charge to Room {selectedRoomNumber} Folio</span>
            </button>
          ) : (
            <button
              onClick={() => {
                alert(`Order settled via Cash/POS! Logged by ${activeStaff.name}`);
                setCart([]);
              }}
              disabled={cart.length === 0}
              className="btn-gold"
              style={{ width: '100%', justifyContent: 'center', opacity: cart.length === 0 ? 0.5 : 1 }}
            >
              <CreditCard size={16} />
              <span>Settle Payment & Print Receipt</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
