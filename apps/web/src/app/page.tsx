'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import DashboardView from '@/components/DashboardView';
import CRMView from '@/components/CRMView';
import RoomAuditView from '@/components/RoomAuditView';
import StaffOnboardingView from '@/components/StaffOnboardingView';
import RBACView from '@/components/RBACView';
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
  ENTERPRISE_ORG,
} from '@/lib/mockData';
import { Room, StaffUser, RoomTimelineItem, RoomStatus, UserRole } from '@hosos/types';

export default function HosOSEnterpriseApp() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [staffList, setStaffList] = useState<StaffUser[]>(INITIAL_STAFF);
  const [activeStaff, setActiveStaff] = useState<StaffUser>(INITIAL_STAFF[0]); // Alhaji Ibrahim Danjuma (GM)
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
      headline: `Payment Received & Credited to Folio (${data.method.replace(/_/g, ' ')})`,
      details: `Received ₦${data.amount.toLocaleString()} via ${data.method.replace(/_/g, ' ')}. Receipt / Ref: ${data.reference}. Verified by cashier.`,
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

    const updatedRoom: Room = {
      ...selectedRoom,
      status: data.status,
    };

    setSelectedRoom(updatedRoom);
    setRooms(prev => prev.map(r => r.id === updatedRoom.id ? updatedRoom : r));

    const newTimelineItem: RoomTimelineItem = {
      id: `tl-${Date.now()}`,
      timestamp: nowIso,
      category: 'OCCUPANCY',
      headline: `Room Status Changed to ${data.status.replace(/_/g, ' ')}`,
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
      headline: `POS F&B Order Charged to Room #${roomNumber}`,
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

  // 6. Handle Switching Active Role from RBAC View
  const handleSelectRole = (newRole: UserRole) => {
    const matchingStaff = staffList.find(s => s.role === newRole);
    if (matchingStaff) {
      setActiveStaff(matchingStaff);
      alert(`Active user switched to ${matchingStaff.name} with role: ${newRole}`);
    } else {
      setActiveStaff({
        ...activeStaff,
        role: newRole,
      });
      alert(`Role temporarily assigned: ${newRole}`);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
      
      {/* Universal Enterprise Light Navigation */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        staffList={staffList}
        activeStaff={activeStaff}
        onStaffChange={setActiveStaff}
      />

      {/* Main Tab Content Container */}
      <main style={{ flex: 1, maxWidth: '1440px', width: '100%', margin: '0 auto', padding: '0 24px 60px 24px' }}>
        
        {/* Module 1: Executive Dashboard & Performance Reports */}
        {currentTab === 'dashboard' && (
          <DashboardView activeStaff={activeStaff} />
        )}

        {/* Module 2: Enterprise Guest & Corporate CRM */}
        {currentTab === 'crm' && (
          <CRMView activeStaff={activeStaff} />
        )}

        {/* Module 3: Room 360° Internal Audit & Occupancy State */}
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

        {/* Module 4: Staff Onboarding Pipeline & Organisation Hierarchy */}
        {currentTab === 'onboarding' && (
          <StaffOnboardingView activeStaff={activeStaff} />
        )}

        {/* Module 5: Multi-Role RBAC Security Matrix */}
        {currentTab === 'rbac' && (
          <RBACView
            activeStaff={activeStaff}
            onSelectRole={handleSelectRole}
          />
        )}

        {/* Module 6: Front Desk & Tape Chart */}
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

        {/* Module 7: Restaurant & Bar POS */}
        {currentTab === 'pos' && (
          <POSView
            rooms={rooms}
            activeStaff={activeStaff}
            onPostChargeToRoom={handlePostChargeToRoom}
          />
        )}

        {/* Module 8: Stores & Spirit Tot Control */}
        {currentTab === 'inventory' && (
          <InventoryView activeStaff={activeStaff} />
        )}

        {/* Module 9: Diesel & Facilities Energy OPEX */}
        {currentTab === 'facilities' && (
          <FacilitiesView activeStaff={activeStaff} />
        )}

        {/* Module 10: Night Audit & Flash Reports */}
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

      {/* Enterprise Light Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-color)',
        padding: '16px 24px',
        backgroundColor: '#FFFFFF',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <strong>{ENTERPRISE_ORG.name}</strong> • {ENTERPRISE_ORG.registrationNumber} • HosOS Enterprise v2.4
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>Lagos/WAT: UTC+1</span>
          <span>Role-Based Access Control (RBAC) Active</span>
          <span>Zero-Trust Staff Action Logging</span>
          <span>Tax TIN: {ENTERPRISE_ORG.taxId}</span>
        </div>
      </footer>

    </div>
  );
}
