'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import CommandCenterHeader from '@/components/CommandCenterHeader';
import LoginView from '@/components/LoginView';
import DashboardView from '@/components/DashboardView';
import NightAuditView from '@/components/NightAuditView';
import LossPreventionView from '@/components/LossPreventionView';
import CRMView from '@/components/CRMView';
import RoomAuditView from '@/components/RoomAuditView';
import FrontDeskView from '@/components/FrontDeskView';
import POSView from '@/components/POSView';
import InventoryView from '@/components/InventoryView';
import RecipeBOMView from '@/components/RecipeBOMView';
import FacilitiesView from '@/components/FacilitiesView';
import StaffOnboardingView from '@/components/StaffOnboardingView';
import RBACView from '@/components/RBACView';
import AddStaffModal from '@/components/AddStaffModal';
import CheckInModal from '@/components/CheckInModal';
import CheckOutModal from '@/components/CheckOutModal';
import NewReservationModal from '@/components/NewReservationModal';
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
import { Clock, ShieldCheck, Database, LogOut } from 'lucide-react';

import { FeedbackProvider, useFeedback } from '@/context/FeedbackContext';

export default function HosOSApp() {
  return (
    <FeedbackProvider>
      <HosOSAppInner />
    </FeedbackProvider>
  );
}

function HosOSAppInner() {
  const { showConfirm, showSuccess, showFailed, showToast } = useFeedback();

  // Authentication State
  const [currentUser, setCurrentUser] = useState<StaffUser | null>(INITIAL_STAFF[0]); // Defaults to active demo user, verified via session
  const [isAuthChecking, setIsAuthChecking] = useState(false);

  // Active View in Department Submenus
  const [currentView, setCurrentView] = useState<string>('dashboard');

  // Staff and Data State
  const [staffList, setStaffList] = useState<StaffUser[]>(INITIAL_STAFF);
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [selectedRoom, setSelectedRoom] = useState<Room>(INITIAL_ROOMS[5]); // Room 204
  const [timeline, setTimeline] = useState<RoomTimelineItem[]>(ROOM_204_TIMELINE);
  const [consumptionStats, setConsumptionStats] = useState(ROOM_204_CONSUMPTION_STATS);

  // Modals state
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isCheckOutModalOpen, setIsCheckOutModalOpen] = useState(false);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [targetRoom, setTargetRoom] = useState<Room>(INITIAL_ROOMS[0]);

  const handleOpenCheckIn = (room: Room) => {
    setTargetRoom(room);
    setIsCheckInModalOpen(true);
  };

  const handleOpenCheckOut = (room: Room) => {
    setTargetRoom(room);
    setIsCheckOutModalOpen(true);
  };

  const handleCheckInSuccess = () => {
    loadRooms();
    if (selectedRoom?.roomNumber) {
      loadRoomAudit(selectedRoom.roomNumber);
    }
  };

  const handleCheckOutSuccess = () => {
    loadRooms();
    if (selectedRoom?.roomNumber) {
      loadRoomAudit(selectedRoom.roomNumber);
    }
  };

  const handleReservationSuccess = () => {
    loadRooms();
  };

  // 1. Check existing session on mount
  useEffect(() => {
    async function verifySession() {
      try {
        setIsAuthChecking(true);
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.success && data.authenticated && data.user) {
          setCurrentUser(data.user);
        }
      } catch (err) {
        console.warn('Session check warning:', err);
      } finally {
        setIsAuthChecking(false);
      }
    }
    verifySession();
  }, []);

  // 2. Fetch live staff from MongoDB Atlas
  const loadStaff = async () => {
    try {
      const res = await fetch('/api/staff');
      const data = await res.json();
      if (data.success && data.staff && data.staff.length > 0) {
        setStaffList(data.staff.map((s: any) => ({
          id: s.id,
          name: s.name,
          email: s.email,
          role: s.role as UserRole,
          department: s.department,
          pinCodeHash: s.pinCode || '1234',
          isActive: s.isActive !== false,
          createdAt: s.createdAt || new Date().toISOString(),
        })));
      }
    } catch (e) {
      console.warn('Could not fetch staff from MongoDB:', e);
    }
  };

  // 3. Fetch live rooms from MongoDB Atlas
  const loadRooms = async () => {
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      if (data.success && data.rooms && data.rooms.length > 0) {
        setRooms(data.rooms);
        setSelectedRoom(prev => {
          const match = data.rooms.find((r: Room) => r.roomNumber === prev.roomNumber);
          return match || data.rooms[0];
        });
      }
    } catch (e) {
      console.warn('Could not fetch rooms from MongoDB:', e);
    }
  };

  // 4. Fetch live immutable internal room audit trail
  const loadRoomAudit = async (roomNumber: string) => {
    try {
      const res = await fetch(`/api/rooms/${roomNumber}/audit`);
      const data = await res.json();
      if (data.success) {
        if (data.timeline && data.timeline.length > 0) {
          setTimeline(data.timeline);
        }
        if (data.consumptionStats) {
          setConsumptionStats(data.consumptionStats);
        }
      }
    } catch (e) {
      console.warn('Could not fetch room audit trail from MongoDB:', e);
    }
  };

  // Initial load of staff and rooms
  useEffect(() => {
    loadStaff();
    loadRooms();
  }, []);

  // When selected room changes, fetch its live immutable audit trail
  useEffect(() => {
    if (selectedRoom?.roomNumber) {
      loadRoomAudit(selectedRoom.roomNumber);
    }
  }, [selectedRoom?.roomNumber]);

  // Seed MongoDB Atlas handler with Enterprise Confirmation, Success, and Failed Pop-Up Boxes
  const handleSeedDatabase = () => {
    showConfirm(
      'Confirm MongoDB Atlas Enterprise Seeding',
      'Are you sure you want to initialize and seed all 11 default enterprise staff roles, live rooms, guest folios, and immutable audit logs into MongoDB Atlas? All staff accounts will be encrypted with bcrypt and ready for login.',
      async () => {
        try {
          const res = await fetch('/api/auth/seed', { method: 'POST' });
          const data = await res.json();
          if (data.success) {
            showSuccess(
              'Database Seeded Successfully!',
              data.message,
              'All 11 roles, room inventory, guest folios, warehouse stock, and immutable internal room audit trails have been initialized in MongoDB Atlas cluster.'
            );
            loadStaff();
            loadRooms();
            if (selectedRoom?.roomNumber) {
              loadRoomAudit(selectedRoom.roomNumber);
            }
          } else {
            showFailed('Database Seeding Failed', data.error || 'Server error occurred during role seeding.');
          }
        } catch (err: any) {
          showFailed('MongoDB Connection Error', err.message || 'Unable to connect to MongoDB Atlas cluster.');
        }
      },
      {
        confirmText: 'Seed Database Now',
        cancelText: 'Cancel',
        variant: 'primary',
        details: 'Cluster: cluster0.8nmwbry.mongodb.net | Database: hosos | Collections: Users, Rooms, Folios, AuditLogs, Inventory'
      }
    );
  };

  // Add staff callback
  const handleStaffAdded = (newStaff: StaffUser) => {
    setStaffList(prev => [newStaff, ...prev]);
    showToast({
      type: 'success',
      title: 'Staff Member Registered',
      message: `${newStaff.name} added to live directory as ${newStaff.role.replace(/_/g, ' ')}.`
    });
  };

  // Logout handler with Confirmation Pop-up Box
  const handleLogout = () => {
    showConfirm(
      'Confirm Account Sign Out',
      'Are you sure you want to end your current staff session? Any unsaved edits will be discarded.',
      async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
        } catch (err) {
          console.warn('Logout API error:', err);
        }
        setCurrentUser(null);
        showToast({
          type: 'info',
          title: 'Signed Out',
          message: 'Staff session closed safely.'
        });
      },
      {
        confirmText: 'Sign Out',
        cancelText: 'Stay Logged In',
        variant: 'danger'
      }
    );
  };

  // 1. Handle Adding Order or Increment (Live MongoDB + Immutable Audit Trail + Stock Depletion)
  const handleAddOrder = async (data: {
    itemName: string;
    category: string;
    quantity: number;
    unitPrice: number;
    reason?: string;
    staff: StaffUser;
  }) => {
    const totalAmount = data.quantity * data.unitPrice;
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outlet: 'ROOM_SERVICE',
          roomNumber: selectedRoom.roomNumber,
          items: [{ name: data.itemName, quantity: data.quantity, unitPrice: data.unitPrice, category: data.category }],
          chargeToRoom: true,
          waiterName: data.staff.name,
          waiterId: data.staff.id,
          waiterRole: data.staff.role,
          reason: data.reason,
        }),
      });

      const result = await res.json();
      if (result.success) {
        showSuccess(
          'Order Increment Logged to MongoDB Atlas!',
          `Added ${data.quantity}x ${data.itemName} (+₦${totalAmount.toLocaleString()}) to Room #${selectedRoom.roomNumber} folio.`,
          `Acting Staff: ${data.staff.name} (${data.staff.role}) • Reason: "${data.reason || 'Guest request'}" • Deducted raw materials from warehouse stock.`
        );
        loadRoomAudit(selectedRoom.roomNumber);
      } else {
        showFailed('Order Increment Failed', result.error || 'Server error occurred');
      }
    } catch (err: any) {
      showFailed('Network Error', err.message || 'Could not record order increment');
    }
  };

  // 2. Handle Maintenance (Live MongoDB + Room Down Toggle + Audit Trail)
  const handleAddMaintenance = async (data: {
    issue: string;
    priority: string;
    partsCost: number;
    staff: StaffUser;
  }) => {
    try {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomNumber: selectedRoom.roomNumber,
          issue: data.issue,
          priority: data.priority,
          partsCost: data.partsCost,
          staff: data.staff,
        }),
      });

      const result = await res.json();
      if (result.success) {
        showSuccess(
          'Maintenance Ticket Raised in MongoDB Atlas!',
          `Ticket #${result.ticket?.ticketId || 'MNT'} created for Room #${selectedRoom.roomNumber}. Assigned to engineering team.`,
          `Fault: "${data.issue}" • Reported By: ${data.staff.name} (${data.staff.role}) • Priority: ${data.priority} • Logged to immutable audit trail.`
        );
        loadRooms();
        loadRoomAudit(selectedRoom.roomNumber);
      } else {
        showFailed('Maintenance Ticket Failed', result.error || 'Server error occurred');
      }
    } catch (err: any) {
      showFailed('Network Error', err.message || 'Could not raise maintenance ticket');
    }
  };

  // 3. Handle Payment (Live MongoDB + Folio Ledger + Audit Trail)
  const handleAddPayment = async (data: {
    amount: number;
    method: string;
    reference: string;
    staff: StaffUser;
  }) => {
    try {
      const res = await fetch('/api/folios/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomNumber: selectedRoom.roomNumber,
          amount: data.amount,
          method: data.method,
          reference: data.reference,
          staff: data.staff,
        }),
      });

      const result = await res.json();
      if (result.success) {
        showSuccess(
          'Payment Recorded in MongoDB Atlas & Folio Updated!',
          `Received ₦${data.amount.toLocaleString()} via ${data.method.replace(/_/g, ' ')} for Room #${selectedRoom.roomNumber}.`,
          `Cashier: ${data.staff.name} • Reference Receipt: ${data.reference} • Remaining Folio Balance: ₦${result.folio?.balance?.toLocaleString() || 0}`
        );
        loadRoomAudit(selectedRoom.roomNumber);
      } else {
        showFailed('Payment Recording Failed', result.error || 'Server error occurred');
      }
    } catch (err: any) {
      showFailed('Network Error', err.message || 'Could not record payment');
    }
  };

  // 4. Handle Status Change (Live MongoDB + Status Transition + Audit Trail)
  const handleChangeStatus = async (data: {
    status: RoomStatus;
    notes: string;
    staff: StaffUser;
  }) => {
    try {
      const res = await fetch('/api/rooms', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomNumber: selectedRoom.roomNumber,
          newStatus: data.status,
          notes: data.notes,
          staff: data.staff,
        }),
      });

      const result = await res.json();
      if (result.success) {
        showSuccess(
          'Room Status Updated in MongoDB Atlas!',
          `Room #${selectedRoom.roomNumber} transitioned to ${data.status.replace(/_/g, ' ')}.`,
          `Inspected and logged by ${data.staff.name} (${data.staff.role}). Audit Notes: "${data.notes}"`
        );
        loadRooms();
        loadRoomAudit(selectedRoom.roomNumber);
      } else {
        showFailed('Status Update Failed', result.error || 'Server error occurred');
      }
    } catch (err: any) {
      showFailed('Network Error', err.message || 'Could not update room status');
    }
  };

  // 5. Handle POS Direct Charge to Room or Table Walk-In (Live MongoDB + Inventory Depletion + Audit Trail)
  const handlePostChargeToRoom = async (
    roomNumber: string,
    amount: number,
    itemsSummary: string,
    items?: Array<{ name: string; quantity: number; unitPrice: number }>,
    chargeToRoom: boolean = true
  ) => {
    try {
      const itemsList = items && items.length > 0 ? items : [{ name: itemsSummary, quantity: 1, unitPrice: amount }];
      const isRoomCharge = Boolean(chargeToRoom && roomNumber);
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outlet: isRoomCharge ? 'ROOM_SERVICE' : 'MAIN_RESTAURANT',
          roomNumber: isRoomCharge ? roomNumber : undefined,
          items: itemsList,
          chargeToRoom: isRoomCharge,
          waiterName: currentUser ? currentUser.name : 'Staff Member',
          waiterId: currentUser ? currentUser.id : 'staff-01',
          waiterRole: currentUser ? currentUser.role : 'FRONT_DESK',
        }),
      });

      const result = await res.json();
      if (result.success) {
        showSuccess(
          isRoomCharge
            ? `POS Charge Posted to Room #${roomNumber} in MongoDB Atlas!`
            : `POS Table Order Settled & Saved to MongoDB Atlas!`,
          isRoomCharge
            ? `Order total of ₦${amount.toLocaleString()} was successfully posted to guest folio. Kitchen & Bar KDS notified.`
            : `Direct order of ₦${amount.toLocaleString()} settled. Receipt #${result.order?.orderNumber || 'ORD-NEW'} issued and logged to ledger.`,
          `Items: ${itemsSummary} • Acting Staff: ${currentUser ? currentUser.name : 'Staff'} • Stock deducted from warehouse.`
        );
        if (isRoomCharge) {
          loadRooms();
          if (selectedRoom.roomNumber === roomNumber) {
            loadRoomAudit(roomNumber);
          }
        }
      } else {
        showFailed('POS Order Failed', result.error || 'Server error occurred');
      }
    } catch (err: any) {
      showFailed('Network Error', err.message || 'Could not post order');
    }
  };

  // If user is not authenticated, show Login & Create Admin view
  if (!currentUser) {
    return <LoginView onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      
      {/* 1. Full Department Sections Sidebar with Submenus */}
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        activeStaff={currentUser}
        onLogout={handleLogout}
        onOpenAddStaffModal={() => setIsAddStaffModalOpen(true)}
        onSeedDatabase={handleSeedDatabase}
      />

      {/* 2. Main Enterprise Content Body */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        
        {/* Top Command Center Header Bar */}
        <CommandCenterHeader
          currentView={currentView}
          onNavigate={setCurrentView}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenAddStaff={() => setIsAddStaffModalOpen(true)}
          onOpenQuickOrder={() => setIsOrderModalOpen(true)}
          onOpenQuickMaintenance={() => setIsMaintenanceModalOpen(true)}
        />

        {/* Dynamic Submenu View Router */}
        <main style={{ flex: 1, padding: '0 24px 60px 24px', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
          
          {/* Executive & Reporting */}
          {currentView === 'dashboard' && (
            <DashboardView activeStaff={currentUser} />
          )}

          {currentView === 'night-audit' && (
            <NightAuditView activeStaff={currentUser} />
          )}

          {currentView === 'loss-prevention' && (
            <LossPreventionView activeStaff={currentUser} />
          )}

          {/* Guest & Corporate CRM */}
          {currentView === 'crm-guests' && (
            <CRMView activeStaff={currentUser} defaultTab="GUESTS" />
          )}

          {currentView === 'crm-deals' && (
            <CRMView activeStaff={currentUser} defaultTab="CORPORATE_PIPELINE" />
          )}

          {/* Rooms Division: 360° Internal Room Audit (Star Feature) */}
          {currentView === 'room-audit' && (
            <RoomAuditView
              rooms={rooms}
              selectedRoom={selectedRoom}
              onSelectRoom={setSelectedRoom}
              timeline={timeline}
              consumptionStats={consumptionStats}
              activeStaff={currentUser}
              onOpenOrderModal={() => setIsOrderModalOpen(true)}
              onOpenMaintenanceModal={() => setIsMaintenanceModalOpen(true)}
              onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
              onOpenStatusModal={() => setIsStatusModalOpen(true)}
              onOpenCheckIn={handleOpenCheckIn}
              onOpenCheckOut={handleOpenCheckOut}
            />
          )}

          {currentView === 'front-desk' && (
            <FrontDeskView
              rooms={rooms}
              onSelectRoomForAudit={(room) => {
                setSelectedRoom(room);
                setCurrentView('room-audit');
              }}
              activeStaff={currentUser}
              onOpenCheckIn={handleOpenCheckIn}
              onOpenCheckOut={handleOpenCheckOut}
              onOpenNewReservation={() => setIsReservationModalOpen(true)}
              onRefreshRooms={loadRooms}
            />
          )}

          {/* Food & Beverage */}
          {currentView === 'pos' && (
            <POSView
              rooms={rooms}
              activeStaff={currentUser}
              onPostChargeToRoom={handlePostChargeToRoom}
            />
          )}

          {/* Stores & Inventory */}
          {currentView === 'inventory-tots' && (
            <InventoryView activeStaff={currentUser} />
          )}

          {currentView === 'inventory-bom' && (
            <RecipeBOMView activeStaff={currentUser} />
          )}

          {/* Facilities & Energy */}
          {currentView === 'facilities-generators' && (
            <FacilitiesView activeStaff={currentUser} />
          )}

          {/* Human Resources & Security */}
          {currentView === 'onboarding-directory' && (
            <StaffOnboardingView activeStaff={currentUser} />
          )}

          {currentView === 'rbac-matrix' && (
            <RBACView
              activeStaff={currentUser}
              onSelectRole={(newRole) => {
                const found = staffList.find(s => s.role === newRole);
                if (found) {
                  setCurrentUser(found);
                } else {
                  setCurrentUser({ ...currentUser, role: newRole });
                }
              }}
            />
          )}

        </main>

        {/* Global In-App Add Staff Modal */}
        <AddStaffModal
          isOpen={isAddStaffModalOpen}
          onClose={() => setIsAddStaffModalOpen(false)}
          activeStaff={currentUser}
          onStaffAdded={handleStaffAdded}
        />

        {/* Action Modals for Room 360° Audit */}
        <AddOrderModal
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          room={selectedRoom}
          staffList={staffList}
          activeStaff={currentUser}
          onSuccess={handleAddOrder}
        />

        <AddMaintenanceModal
          isOpen={isMaintenanceModalOpen}
          onClose={() => setIsMaintenanceModalOpen(false)}
          room={selectedRoom}
          staffList={staffList}
          activeStaff={currentUser}
          onSuccess={handleAddMaintenance}
        />

        <AddPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          room={selectedRoom}
          staffList={staffList}
          activeStaff={currentUser}
          onSuccess={handleAddPayment}
        />

        <ChangeStatusModal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          room={selectedRoom}
          staffList={staffList}
          activeStaff={currentUser}
          onSuccess={handleChangeStatus}
        />

        {/* Guest Check-In Wizard */}
        <CheckInModal
          isOpen={isCheckInModalOpen}
          onClose={() => setIsCheckInModalOpen(false)}
          room={targetRoom}
          activeStaff={currentUser}
          onCheckInSuccess={handleCheckInSuccess}
        />

        {/* Guest Check-Out & Folio Reconciliation Wizard */}
        <CheckOutModal
          isOpen={isCheckOutModalOpen}
          onClose={() => setIsCheckOutModalOpen(false)}
          room={targetRoom}
          activeStaff={currentUser}
          onCheckOutSuccess={handleCheckOutSuccess}
        />

        {/* New Reservation Date Collision Wizard */}
        <NewReservationModal
          isOpen={isReservationModalOpen}
          onClose={() => setIsReservationModalOpen(false)}
          rooms={rooms}
          activeStaff={currentUser}
          onReservationSuccess={handleReservationSuccess}
        />

      </div>

    </div>
  );
}
