'use client';

import React, { useState } from 'react';
import { StaffUser, Room, RoomStatus } from '@hosos/types';
import { X, UtensilsCrossed, Wrench, Banknote, BedDouble, ShieldAlert, Check } from 'lucide-react';

// Common PIN Check Pill
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
      background: 'rgba(224, 169, 109, 0.06)',
      border: '1px solid rgba(224, 169, 109, 0.25)',
      borderRadius: 'var(--radius-sm)',
      padding: '12px',
      marginTop: '16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold-primary)', textTransform: 'uppercase' }}>
          Staff Authentication Required (Every Action Logs User & Time)
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '10px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
            Acting Staff Member
          </label>
          <select
            value={selectedStaff.id}
            onChange={(e) => {
              const s = staffList.find(st => st.id === e.target.value);
              if (s) onSelectStaff(s);
            }}
            style={{ width: '100%', fontSize: '0.8rem' }}
          >
            {staffList.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.role.replace('_', ' ')})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
            Staff PIN Code
          </label>
          <input
            type="password"
            maxLength={4}
            placeholder={selectedStaff.pinCodeHash}
            value={pin}
            onChange={(e) => onPinChange(e.target.value)}
            style={{ width: '100%', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {pinError && (
        <div style={{ color: 'var(--rose-primary)', fontSize: '0.75rem', marginTop: '6px' }}>
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
    if (pin && pin !== selectedStaff.pinCodeHash) {
      setPinError(`Invalid PIN! Hint for demo: Use ${selectedStaff.pinCodeHash}`);
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
    { name: 'Oseika Jollof Rice Special Platter', cat: 'KITCHEN_FOOD', price: 9500 },
    { name: 'Heineken Draught (Cold)', cat: 'BAR_BEVERAGE', price: 2500 },
    { name: 'Oseika Chapman Cocktail', cat: 'BAR_BEVERAGE', price: 3800 },
    { name: 'Hennessy VSOP (50ml Tot)', cat: 'BAR_BEVERAGE', price: 6500 },
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px',
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '520px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UtensilsCrossed size={20} color="var(--gold-primary)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
              Add Order / Increment to Room {room.roomNumber}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Quick Select Preset or Enter Custom Item
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
              style={{ width: '100%', fontSize: '0.85rem' }}
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
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Quantity to Add / Increment
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                style={{ width: '100%', fontSize: '0.85rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Price Sold At (₦)
              </label>
              <input
                type="number"
                min={100}
                step={100}
                value={unitPrice}
                onChange={(e) => setUnitPrice(Number(e.target.value))}
                style={{ width: '100%', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Increment Reason / Waiter Log
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Guest phoned for extra cold drinks"
              style={{ width: '100%', fontSize: '0.85rem' }}
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
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn-gold">
              Log Order & Increment (+₦{(quantity * unitPrice).toLocaleString()})
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
    if (pin && pin !== selectedStaff.pinCodeHash) {
      setPinError(`Invalid PIN! Hint: Use ${selectedStaff.pinCodeHash}`);
      return;
    }
    onSuccess({ issue, priority, partsCost, staff: selectedStaff });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px',
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wrench size={20} color="var(--amber-primary)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
              Log Maintenance for Room {room.roomNumber}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Fault / Repair Description
            </label>
            <input
              type="text"
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              style={{ width: '100%', fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={{ width: '100%', fontSize: '0.85rem' }}
              >
                <option value="LOW">Low (Cosmetic)</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High (Guest Impact)</option>
                <option value="EMERGENCY_ROOM_DOWN">Emergency (Room Down)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Parts Cost Logged (₦)
              </label>
              <input
                type="number"
                min={0}
                step={500}
                value={partsCost}
                onChange={(e) => setPartsCost(Number(e.target.value))}
                style={{ width: '100%', fontSize: '0.85rem' }}
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
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn-gold">
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
    staff: StaffUser;
  }) => void;
}) {
  const [selectedStaff, setSelectedStaff] = useState<StaffUser>(activeStaff);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  const [amount, setAmount] = useState(30000);
  const [method, setMethod] = useState('PHYSICAL_CASH');
  const [reference, setReference] = useState('RCT-2026-9938');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin && pin !== selectedStaff.pinCodeHash) {
      setPinError(`Invalid PIN! Hint: Use ${selectedStaff.pinCodeHash}`);
      return;
    }
    onSuccess({ amount, method, reference, staff: selectedStaff });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px',
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Banknote size={20} color="var(--emerald-primary)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
              Receive Money for Room {room.roomNumber}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Amount Received (₦)
            </label>
            <input
              type="number"
              min={1000}
              step={1000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              style={{ width: '100%', fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Payment Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                style={{ width: '100%', fontSize: '0.85rem' }}
              >
                <option value="PHYSICAL_CASH">Physical Cash (Till-A)</option>
                <option value="POS_TERMINAL">POS Terminal Card</option>
                <option value="BANK_TRANSFER">Bank Transfer (Verified)</option>
                <option value="PAYSTACK">Paystack Online Link</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Receipt / Terminal Ref
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                style={{ width: '100%', fontSize: '0.85rem' }}
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
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn-gold">
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
    if (pin && pin !== selectedStaff.pinCodeHash) {
      setPinError(`Invalid PIN! Hint: Use ${selectedStaff.pinCodeHash}`);
      return;
    }
    onSuccess({ status: newStatus, notes, staff: selectedStaff });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px',
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BedDouble size={20} color="var(--sky-primary)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
              Change Status for Room {room.roomNumber}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Target Occupancy State
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as RoomStatus)}
              style={{ width: '100%', fontSize: '0.85rem' }}
            >
              <option value="VACANT_CLEAN">Vacant Clean (Ready for Check-In)</option>
              <option value="OCCUPIED">Occupied (Guest In-House)</option>
              <option value="VACANT_DIRTY">Vacant Dirty (Housekeeping Required)</option>
              <option value="MAINTENANCE">Under Maintenance (Out of Order)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Transition Audit Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ width: '100%', fontSize: '0.85rem' }}
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
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn-gold">
              Confirm Status Change
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
