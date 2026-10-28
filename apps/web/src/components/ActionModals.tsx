'use client';

import React, { useState } from 'react';
import { StaffUser, Room, RoomStatus, SplitPaymentDetail, PaymentMethod } from '@hosos/types';
import { X, UtensilsCrossed, Wrench, Banknote, BedDouble, ShieldAlert, Check } from 'lucide-react';
import PaymentMethodSelector from './PaymentMethodSelector';

// Common PIN Check Box for Light Enterprise Theme
function PinInput({
  staffList,
  selectedStaff,
  onSelectStaff,
  pin,
  onPinChange,
  pinError,
}: {
  staffList: StaffUser[];
  selectedStaff: StaffUser;
  onSelectStaff: (staff: StaffUser) => void;
  pin: string;
  onPinChange: (p: string) => void;
  pinError: string | null;
}) {
  return (
    <div style={{
      background: 'var(--brand-bg)',
      border: '1px solid var(--brand-border)',
      borderRadius: 'var(--radius-sm)',
      padding: '12px 14px',
      marginTop: '14px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase' }}>
          Staff Authentication (Every Action Logs User & Time)
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '10px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
            Acting Staff Member
          </label>
          <select
            value={selectedStaff.id}
            onChange={(e) => {
              const s = staffList.find(st => st.id === e.target.value);
              if (s) onSelectStaff(s);
            }}
            style={{ width: '100%', fontSize: '0.8rem', backgroundColor: '#FFFFFF' }}
          >
            {staffList.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.role.replace(/_/g, ' ')})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
            Staff PIN Code
          </label>
          <input
            type="password"
            maxLength={4}
            placeholder="••••"
            value={pin}
            onChange={(e) => onPinChange(e.target.value)}
            style={{ width: '100%', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', backgroundColor: '#FFFFFF' }}
          />
        </div>
      </div>

      {pinError && (
        <div style={{ color: 'var(--rose-primary)', fontSize: '0.75rem', marginTop: '6px', fontWeight: 600 }}>
          ⚠️ {pinError}
        </div>
      )}
    </div>
  );
}

// 1. ORDER & INCREMENT MODAL
export function AddOrderModal({
  isOpen,
  onClose,
  room,
  staffList,
  activeStaff,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  room: Room;
  staffList: StaffUser[];
  activeStaff: StaffUser;
  onSuccess: (data: {
    itemName: string;
    category: string;
    quantity: number;
    unitPrice: number;
    reason?: string;
    staff: StaffUser;
  }) => void;
}) {
  const [selectedStaff, setSelectedStaff] = useState<StaffUser>(activeStaff);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  const [itemName, setItemName] = useState('Spicy Goat Meat Pepper Soup');
  const [category, setCategory] = useState<'KITCHEN_FOOD' | 'BAR_BEVERAGE'>('KITCHEN_FOOD');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(7500);
  const [reason, setReason] = useState('Guest ordered extra portion via phone');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) {
      setPinError('Staff PIN code is required to authorize this action');
      return;
    }
    if (pin !== selectedStaff.pinCodeHash) {
      setPinError('Invalid 4-digit PIN for selected staff member');
      return;
    }
    onSuccess({
      itemName,
      category,
      quantity,
      unitPrice,
      reason,
      staff: selectedStaff,
    });
    onClose();
  };

  const menuPresets = [
    { name: 'Spicy Goat Meat Pepper Soup', cat: 'KITCHEN_FOOD', price: 7500 },
    { name: 'Grilled Croaker Fish & Yam Chips', cat: 'KITCHEN_FOOD', price: 14500 },
    { name: 'Osieka Jollof Rice Special Platter', cat: 'KITCHEN_FOOD', price: 9500 },
    { name: 'Heineken Draught (Cold)', cat: 'BAR_BEVERAGE', price: 2500 },
    { name: 'Osieka Chapman Cocktail', cat: 'BAR_BEVERAGE', price: 3800 },
    { name: 'Hennessy VSOP (50ml Tot)', cat: 'BAR_BEVERAGE', price: 6500 },
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px',
    }}>
      <div className="ent-card" style={{ width: '100%', maxWidth: '520px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UtensilsCrossed size={20} color="var(--brand-primary)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Add Order / Increment to Room {room.roomNumber}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
              Quick Select Preset or Custom Item
            </label>
            <select
              value={itemName}
              onChange={(e) => {
                const preset = menuPresets.find(m => m.name === e.target.value);
                if (preset) {
                  setItemName(preset.name);
                  setCategory(preset.cat as any);
                  setUnitPrice(preset.price);
                } else {
                  setItemName(e.target.value);
                }
              }}
              style={{ width: '100%' }}
            >
              {menuPresets.map(m => (
                <option key={m.name} value={m.name}>
                  {m.name} (₦{m.price.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                Quantity to Add / Increment
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                Price Sold At (₦)
              </label>
              <input
                type="number"
                min={100}
                step={100}
                value={unitPrice}
                onChange={(e) => setUnitPrice(Number(e.target.value))}
                style={{ width: '100%', fontFamily: 'var(--font-mono)', fontWeight: 600 }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
              Increment Reason / Staff Notes
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Guest phoned for extra cold drinks"
              style={{ width: '100%' }}
            />
          </div>

          <PinInput
            staffList={staffList}
            selectedStaff={selectedStaff}
            onSelectStaff={setSelectedStaff}
            pin={pin}
            onPinChange={setPin}
            pinError={pinError}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Log Order Increment (+₦{(quantity * unitPrice).toLocaleString()})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 2. MAINTENANCE LOG MODAL
export function AddMaintenanceModal({
  isOpen,
  onClose,
  room,
  staffList,
  activeStaff,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  room: Room;
  staffList: StaffUser[];
  activeStaff: StaffUser;
  onSuccess: (data: {
    issue: string;
    priority: string;
    partsCost: number;
    staff: StaffUser;
  }) => void;
}) {
  const [selectedStaff, setSelectedStaff] = useState<StaffUser>(activeStaff);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  const [issue, setIssue] = useState('Balcony sliding glass door lock loose');
  const [priority, setPriority] = useState('HIGH');
  const [partsCost, setPartsCost] = useState(4500);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) {
      setPinError('Staff PIN code is required to authorize this action');
      return;
    }
    if (pin !== selectedStaff.pinCodeHash) {
      setPinError('Invalid 4-digit PIN for selected staff member');
      return;
    }
    onSuccess({ issue, priority, partsCost, staff: selectedStaff });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px',
    }}>
      <div className="ent-card" style={{ width: '100%', maxWidth: '500px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wrench size={20} color="var(--amber-primary)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Log Maintenance for Room {room.roomNumber}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
              Fault / Repair Description
            </label>
            <input
              type="text"
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="LOW">Low (Routine Check)</option>
                <option value="MEDIUM">Medium (General)</option>
                <option value="HIGH">High (Guest Impact)</option>
                <option value="EMERGENCY_ROOM_DOWN">Emergency (Room Down)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                Parts Cost Logged (₦)
              </label>
              <input
                type="number"
                min={0}
                step={500}
                value={partsCost}
                onChange={(e) => setPartsCost(Number(e.target.value))}
                style={{ width: '100%', fontFamily: 'var(--font-mono)' }}
              />
            </div>
          </div>

          <PinInput
            staffList={staffList}
            selectedStaff={selectedStaff}
            onSelectStaff={setSelectedStaff}
            pin={pin}
            onPinChange={setPin}
            pinError={pinError}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Log Maintenance Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 3. PAYMENT / MONEY RECEIVED MODAL
export function AddPaymentModal({
  isOpen,
  onClose,
  room,
  staffList,
  activeStaff,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  room: Room;
  staffList: StaffUser[];
  activeStaff: StaffUser;
  onSuccess: (data: {
    amount: number;
    method: string;
    reference: string;
    split?: SplitPaymentDetail[];
    staff: StaffUser;
  }) => void;
}) {
  const [selectedStaff, setSelectedStaff] = useState<StaffUser>(activeStaff);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  const [amount, setAmount] = useState(30000);
  const [paymentSelection, setPaymentSelection] = useState<{
    method: PaymentMethod;
    reference: string;
    split?: SplitPaymentDetail[];
    isValid: boolean;
  }>({
    method: 'POS_TERMINAL',
    reference: '',
    isValid: true,
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) {
      setPinError('Staff PIN code is required to authorize this action');
      return;
    }
    if (pin !== selectedStaff.pinCodeHash) {
      setPinError('Invalid 4-digit PIN for selected staff member');
      return;
    }
    if (!paymentSelection.isValid) {
      setPinError('Please balance the split payment amounts before submitting.');
      return;
    }
    onSuccess({
      amount,
      method: paymentSelection.method,
      reference: paymentSelection.reference,
      split: paymentSelection.split,
      staff: selectedStaff,
    });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px',
    }}>
      <div className="ent-card" style={{ width: '100%', maxWidth: '540px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Banknote size={20} color="var(--emerald-primary)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Receive Money for Room {room.roomNumber}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
              Amount Received (₦)
            </label>
            <input
              type="number"
              min={100}
              step={500}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              style={{ width: '100%', fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}
            />
          </div>

          {/* Payment Method Selector: POS, Transfer, Cash, Split */}
          <PaymentMethodSelector
            totalAmount={amount}
            initialMethod="POS_TERMINAL"
            onChange={setPaymentSelection}
          />

          <PinInput
            staffList={staffList}
            selectedStaff={selectedStaff}
            onSelectStaff={setSelectedStaff}
            pin={pin}
            onPinChange={setPin}
            pinError={pinError}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!paymentSelection.isValid}
              className="btn-primary"
              style={{ opacity: paymentSelection.isValid ? 1 : 0.6 }}
            >
              Post Payment & Print Receipt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 4. CHANGE OCCUPANCY STATUS MODAL
export function ChangeStatusModal({
  isOpen,
  onClose,
  room,
  staffList,
  activeStaff,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  room: Room;
  staffList: StaffUser[];
  activeStaff: StaffUser;
  onSuccess: (data: {
    status: RoomStatus;
    notes: string;
    staff: StaffUser;
  }) => void;
}) {
  const [selectedStaff, setSelectedStaff] = useState<StaffUser>(activeStaff);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  const [newStatus, setNewStatus] = useState<RoomStatus>(room.status);
  const [notes, setNotes] = useState('Status updated following routine inspection.');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) {
      setPinError('Staff PIN code is required to authorize this action');
      return;
    }
    if (pin !== selectedStaff.pinCodeHash) {
      setPinError('Invalid 4-digit PIN for selected staff member');
      return;
    }
    onSuccess({ status: newStatus, notes, staff: selectedStaff });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px',
    }}>
      <div className="ent-card" style={{ width: '100%', maxWidth: '480px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BedDouble size={20} color="var(--brand-primary)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Change Status for Room {room.roomNumber}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
              Target Occupancy State
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as RoomStatus)}
              style={{ width: '100%' }}
            >
              <option value="VACANT_CLEAN">Vacant Clean (Ready for Check-In)</option>
              <option value="OCCUPIED">Occupied (Guest In-House)</option>
              <option value="VACANT_DIRTY">Vacant Dirty (Housekeeping Required)</option>
              <option value="MAINTENANCE">Under Maintenance (Out of Order)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
              Transition Audit Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <PinInput
            staffList={staffList}
            selectedStaff={selectedStaff}
            onSelectStaff={setSelectedStaff}
            pin={pin}
            onPinChange={setPin}
            pinError={pinError}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Confirm Status Change
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
