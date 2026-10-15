'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import LoginView from '@/components/LoginView';
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
import AddStaffModal from '@/components/AddStaffModal';
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

export default function HosOSApp() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<StaffUser | null>(INITIAL_STAFF[0]); // Defaults to Super Admin for easy access
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

  // Auto-seed and fetch live staff from MongoDB Atlas on mount
  useEffect(() => {
    async function loadStaff() {
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
        console.warn('Could not fetch staff from MongoDB on mount:', e);
      }
    }
    loadStaff();
  }, []);

  // Seed MongoDB handler
  const handleSeedDatabase = async () => {
    try {
      const res = await fetch('/api/auth/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(`Success: Seeded ${data.users.length} staff roles into MongoDB Atlas!`);
        // Refresh staff list
        const staffRes = await fetch('/api/staff');
        const staffData = await staffRes.json();
        if (staffData.success) {
          setStaffList(staffData.staff);
        }
      } else {
        alert(`Database seed message: ${data.error}`);
      }
    } catch (err: any) {
      alert(`MongoDB connection message: ${err.message}`);
    }
  };

  // Add staff callback
  const handleStaffAdded = (newStaff: StaffUser) => {
    setStaffList(prev => [newStaff, ...prev]);
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
  };

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
        staffId: currentUser ? currentUser.id : 'staff-01',
        staffName: currentUser ? currentUser.name : 'Mary Okon',
        role: currentUser ? currentUser.role : 'FRONT_DESK',
      },
      meta: {
        orderNumber: `POS-${Math.floor(1000 + Math.random() * 9000)}`,
      },
    };

    setTimeline(prev => [newTimelineItem, ...prev]);
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
        
        {/* Top Header Bar */}
        <header style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--border-color)',
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                {ENTERPRISE_ORG.name}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>/</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                {currentView.replace(/-/g, ' ')}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--emerald-bg)',
              border: '1px solid var(--emerald-border)',
              padding: '4px 10px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              color: 'var(--emerald-primary)',
              fontWeight: 600,
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--emerald-primary)' }}></span>
              <span>Atlas MongoDB Connected</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '1px solid var(--border-color)', paddingLeft: '14px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'var(--brand-primary)',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}>
                {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {currentUser.name}
              </div>
              <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>
                {currentUser.role.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic Submenu View Router */}
        <main style={{ flex: 1, padding: '0 24px 60px 24px', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
          
          {/* Executive & Reporting */}
          {(currentView === 'dashboard' || currentView === 'loss-prevention') && (
            <DashboardView activeStaff={currentUser} />
          )}

          {currentView === 'night-audit' && (
            <NightAuditView activeStaff={currentUser} />
          )}

          {/* Guest & Corporate CRM */}
          {(currentView === 'crm-guests' || currentView === 'crm-deals') && (
            <CRMView activeStaff={currentUser} />
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
          {(currentView === 'inventory-tots' || currentView === 'inventory-bom') && (
            <InventoryView activeStaff={currentUser} />
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

      </div>

    </div>
  );
}
