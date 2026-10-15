'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import RoomAuditView from '@/components/RoomAuditView';
import FrontDeskView from '@/components/FrontDeskView';
import POSView from '@/components/POSView';
import InventoryView from '@/components/InventoryView';
import FacilitiesView from '@/components/FacilitiesView';
import NightAuditView from '@/components/NightAuditView';
import {
  AddOrderModal,
  AddMaintenanceModal,
  AddPaymentModal,
  ChangeStatusModal,
} from '@/components/ActionModals';
import {
  INITIAL_STAFF,
  INITIAL_ROOMS,
  ROOM_204_TIMELINE,
  ROOM_204_CONSUMPTION_STATS,
} from '@/lib/mockData';
import { Room, StaffUser, RoomTimelineItem, RoomStatus } from '@hosos/types';

export default function HosOSApp() {
  const [currentTab, setCurrentTab] = useState<string>('room-audit');
  const [staffList, setStaffList] = useState<StaffUser[]>(INITIAL_STAFF);
  const [activeStaff, setActiveStaff] = useState<StaffUser>(INITIAL_STAFF[1]); // Mary Okon
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [selectedRoom, setSelectedRoom] = useState<Room>(INITIAL_ROOMS[5]); // Room 204
  const [timeline, setTimeline] = useState<RoomTimelineItem[]>(ROOM_204_TIMELINE);
  const [consumptionStats, setConsumptionStats] = useState(ROOM_204_CONSUMPTION_STATS);

  // Modal triggers
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // 1. Handle Adding Order or Increment
  const handleAddOrder = (data: {
    itemName: string;
    category: string;
    quantity: number;
    unitPrice: number;
    reason?: string;
    staff: StaffUser;
  }) => {
    const totalAmount = data.quantity * data.unitPrice;
    const nowIso = new Date().toISOString();

    // Update consumption table
    setConsumptionStats(prev => {
      const existing = prev.find(p => p.itemName === data.itemName);
      if (existing) {
        return prev.map(p => {
          if (p.itemName === data.itemName) {
            return {
              ...p,
              totalQuantity: p.totalQuantity + data.quantity,
              totalSpent: p.totalSpent + totalAmount,
              lastOrderedAt: nowIso,
              orderedByStaff: `${data.staff.name} (${data.staff.role})`,
            };
          }
          return p;
        });
      }
      return [
        {
          id: `item-${Date.now()}`,
          itemName: data.itemName,
          category: data.category,
          totalQuantity: data.quantity,
          unitPriceCharged: data.unitPrice,
          totalSpent: totalAmount,
          lastOrderedAt: nowIso,
          orderedByStaff: `${data.staff.name} (${data.staff.role})`,
        },
        ...prev,
      ];
    });

    // Append to 360° Timeline
    const newTimelineItem: RoomTimelineItem = {
      id: `tl-${Date.now()}`,
      timestamp: nowIso,
      category: 'ORDER_INCREMENT',
      headline: `Order Increment Logged (+${data.quantity}x ${data.itemName})`,
      details: data.reason 
        ? `Added ${data.quantity}x ${data.itemName} @ ₦${data.unitPrice.toLocaleString()} each (+₦${totalAmount.toLocaleString()}). Reason: "${data.reason}"`
        : `Added ${data.quantity}x ${data.itemName} @ ₦${data.unitPrice.toLocaleString()} each (+₦${totalAmount.toLocaleString()}).`,
      amount: totalAmount,
      actor: {
        staffId: data.staff.id,
        staffName: data.staff.name,
        role: data.staff.role,
      },
      meta: {
        orderNumber: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
        priceSnapshot: data.unitPrice,
      },
    };

    setTimeline(prev => [newTimelineItem, ...prev]);
  };

  // 2. Handle Maintenance
  const handleAddMaintenance = (data: {
    issue: string;
    priority: string;
    partsCost: number;
    staff: StaffUser;
  }) => {
    const nowIso = new Date().toISOString();
    const ticketId = `MNT-2026-0${Math.floor(110 + Math.random() * 50)}`;

    const newTimelineItem: RoomTimelineItem = {
      id: `tl-${Date.now()}`,
      timestamp: nowIso,
      category: 'MAINTENANCE',
      headline: `Maintenance Ticket Raised & Logged (${ticketId})`,
      details: `Fault: "${data.issue}". Priority: ${data.priority}. Parts Cost Incurred: ₦${data.partsCost.toLocaleString()}.`,
      amount: data.partsCost,
      actor: {
        staffId: data.staff.id,
        staffName: data.staff.name,
        role: data.staff.role,
      },
      meta: {
        ticketNumber: ticketId,
      },
    };

    setTimeline(prev => [newTimelineItem, ...prev]);
  };

  // 3. Handle Payment
  const handleAddPayment = (data: {
    amount: number;
    method: string;
    reference: string;
    staff: StaffUser;
  }) => {
    const nowIso = new Date().toISOString();

    const newTimelineItem: RoomTimelineItem = {
      id: `tl-${Date.now()}`,
      timestamp: nowIso,
      category: 'PAYMENT',
      headline: `Payment Received & Credited to Folio (${data.method.replace('_', ' ')})`,
      details: `Received ₦${data.amount.toLocaleString()} via ${data.method.replace('_', ' ')}. Receipt / Ref: ${data.reference}. Verified by cashier.`,
      amount: data.amount,
      actor: {
        staffId: data.staff.id,
        staffName: data.staff.name,
        role: data.staff.role,
      },
      meta: {
        receiptNumber: data.reference,
      },
    };

    setTimeline(prev => [newTimelineItem, ...prev]);
  };

  // 4. Handle Status Change
  const handleChangeStatus = (data: {
    status: RoomStatus;
    notes: string;
    staff: StaffUser;
  }) => {
    const nowIso = new Date().toISOString();
    const prevStatus = selectedRoom.status;

    // Update in room list
    const updatedRoom: Room = {
      ...selectedRoom,
      status: data.status,
    };

    setSelectedRoom(updatedRoom);
    setRooms(prev => prev.map(r => r.id === updatedRoom.id ? updatedRoom : r));

    // Append to timeline
    const newTimelineItem: RoomTimelineItem = {
      id: `tl-${Date.now()}`,
      timestamp: nowIso,
      category: 'OCCUPANCY',
      headline: `Room Status Changed to ${data.status.replace('_', ' ')}`,
      details: `Status transitioned from ${prevStatus} to ${data.status}. Audit Notes: "${data.notes}".`,
      actor: {
        staffId: data.staff.id,
        staffName: data.staff.name,
        role: data.staff.role,
      },
    };

    setTimeline(prev => [newTimelineItem, ...prev]);
  };

  // 5. Handle POS Direct Charge to Room
  const handlePostChargeToRoom = (roomNumber: string, amount: number, itemsSummary: string) => {
    const nowIso = new Date().toISOString();

    const newTimelineItem: RoomTimelineItem = {
      id: `tl-${Date.now()}`,
      timestamp: nowIso,
      category: 'ORDER',
      headline: `POS F&B Order Charged to Room ${roomNumber}`,
      details: `Items ordered: ${itemsSummary}. Total Amount: ₦${amount.toLocaleString()}. Fired to kitchen/bar KDS.`,
      amount: amount,
      actor: {
        staffId: activeStaff.id,
        staffName: activeStaff.name,
        role: activeStaff.role,
      },
      meta: {
        orderNumber: `POS-${Math.floor(1000 + Math.random() * 9000)}`,
      },
    };

    setTimeline(prev => [newTimelineItem, ...prev]);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Universal Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        staffList={staffList}
        activeStaff={activeStaff}
        onStaffChange={setActiveStaff}
      />

      {/* Main Tab Content Container */}
      <main style={{ flex: 1, maxWidth: '1440px', width: '100%', margin: '0 auto', padding: '0 24px 60px 24px' }}>
        {currentTab === 'room-audit' && (
          <RoomAuditView
            rooms={rooms}
            selectedRoom={selectedRoom}
            onSelectRoom={setSelectedRoom}
            timeline={timeline}
            consumptionStats={consumptionStats}
            activeStaff={activeStaff}
            onOpenOrderModal={() => setIsOrderModalOpen(true)}
            onOpenMaintenanceModal={() => setIsMaintenanceModalOpen(true)}
            onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
            onOpenStatusModal={() => setIsStatusModalOpen(true)}
          />
        )}

        {currentTab === 'front-desk' && (
          <FrontDeskView
            rooms={rooms}
            onSelectRoomForAudit={(room) => {
              setSelectedRoom(room);
              setCurrentTab('room-audit');
            }}
            activeStaff={activeStaff}
          />
        )}

        {currentTab === 'pos' && (
          <POSView
            rooms={rooms}
            activeStaff={activeStaff}
            onPostChargeToRoom={handlePostChargeToRoom}
          />
        )}

        {currentTab === 'inventory' && (
          <InventoryView activeStaff={activeStaff} />
        )}

        {currentTab === 'facilities' && (
          <FacilitiesView activeStaff={activeStaff} />
        )}

        {currentTab === 'night-audit' && (
          <NightAuditView activeStaff={activeStaff} />
        )}
      </main>

      {/* Action Modals */}
      <AddOrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        room={selectedRoom}
        staffList={staffList}
        activeStaff={activeStaff}
        onSuccess={handleAddOrder}
      />

      <AddMaintenanceModal
        isOpen={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
        room={selectedRoom}
        staffList={staffList}
        activeStaff={activeStaff}
        onSuccess={handleAddMaintenance}
      />

      <AddPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        room={selectedRoom}
        staffList={staffList}
        activeStaff={activeStaff}
        onSuccess={handleAddPayment}
      />

      <ChangeStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        room={selectedRoom}
        staffList={staffList}
        activeStaff={activeStaff}
        onSuccess={handleChangeStatus}
      />

      {/* Footer info bar */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '16px 24px',
        backgroundColor: 'rgba(6, 10, 19, 0.95)',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div>
          HosOS v1.0 Enterprise • Oseika Resort & Suites • 360° Internal Room Audit Enabled
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>Lagos/WAT: UTC+1</span>
          <span>Zero-Trust Staff Action Logging</span>
          <span>LAN Resilient Offline Sync</span>
        </div>
      </footer>
    </div>
  );
}
