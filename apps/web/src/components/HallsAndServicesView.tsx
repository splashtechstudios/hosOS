'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Edit3, 
  Trash2, 
  Clock, 
  Users, 
  DollarSign, 
  Layers, 
  CheckCircle2, 
  Sparkles, 
  ArrowLeft,
  LayoutGrid,
  List,
  Filter,
  X,
  Calendar,
  Tag
} from 'lucide-react';
import { StaffUser } from '@hosos/types';
import { hasPermission } from '@/lib/rbac';
import { useFeedback } from '@/context/FeedbackContext';

export interface ServiceItemData {
  id: string;
  serviceId: string;
  name: string;
  group: string;
  price: number;
  duration: string;
  capacity?: number;
  description?: string;
  isAvailable: boolean;
  addedBy?: string;
}

interface HallsAndServicesViewProps {
  activeStaff: StaffUser;
  onBack: () => void;
  defaultGroup?: string;
}

const CANONICAL_GROUPS = ['Rooms', 'Kitchen', 'Drinks', 'Halls and Events'];

export default function HallsAndServicesView({ activeStaff, onBack, defaultGroup = 'Halls and Events' }: HallsAndServicesViewProps) {
  const { showSuccess, showFailed, showConfirm } = useFeedback();
  const [services, setServices] = useState<ServiceItemData[]>([]);
  const [groups, setGroups] = useState<string[]>(['Rooms', 'Kitchen', 'Drinks', 'Halls and Events', 'Laundry & Ancillary Services']);
  const [selectedGroup, setSelectedGroup] = useState<string>(defaultGroup);
  const [displayMode, setDisplayMode] = useState<'CARDS' | 'LIST'>('CARDS');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ServiceItemData | null>(null);
  const [name, setName] = useState('');
  const [group, setGroup] = useState('Halls and Events');
  const [isCreatingNewGroup, setIsCreatingNewGroup] = useState(false);
  const [customGroupName, setCustomGroupName] = useState('');
  const [price, setPrice] = useState<number | ''>(150000);
  const [duration, setDuration] = useState('Full Day (8am - 6pm)');
  const [capacity, setCapacity] = useState<number | ''>(250);
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const isSuperAdmin = activeStaff.role === 'SUPERADMIN' || activeStaff.role === 'OWNER' || (activeStaff.role as any) === 'ADMIN';
  const canManageServices = isSuperAdmin || hasPermission(activeStaff.role, 'services.manage', activeStaff.id);

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/services');
      const data = await res.json();
      if (data.success && data.services) {
        setServices(data.services);
        if (data.groups && data.groups.length > 0) {
          setGroups(data.groups);
        }
      }
    } catch (err: any) {
      console.warn('Could not load services:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setName('');
    setGroup(selectedGroup === 'ALL' ? 'Halls and Events' : selectedGroup);
    setIsCreatingNewGroup(false);
    setCustomGroupName('');
    setPrice(selectedGroup === 'Halls and Events' ? 250000 : 5000);
    setDuration(selectedGroup === 'Halls and Events' ? 'Full Day (8am - 6pm)' : 'Same Day');
    setCapacity(selectedGroup === 'Halls and Events' ? 300 : 0);
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: ServiceItemData) => {
    setEditingItem(item);
    setName(item.name);
    setGroup(item.group);
    setIsCreatingNewGroup(false);
    setCustomGroupName('');
    setPrice(item.price);
    setDuration(item.duration);
    setCapacity(item.capacity || 0);
    setDescription(item.description || '');
    setIsModalOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || price === '' || !duration.trim()) return;

    const finalGroup = isCreatingNewGroup && customGroupName.trim()
      ? customGroupName.trim()
      : group;

    setIsSaving(true);
    try {
      if (editingItem) {
        // PATCH
        const res = await fetch('/api/services', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceId: editingItem.serviceId,
            name: name.trim(),
            group: finalGroup,
            price: Number(price),
            duration: duration.trim(),
            capacity: Number(capacity) || 0,
            description: description.trim(),
            updatedBy: activeStaff.name,
          }),
        });
        const data = await res.json();
        if (data.success) {
          showSuccess(
            'Service Updated',
            `${name} has been updated in group [${finalGroup}] and saved to database.`
          );
          setIsModalOpen(false);
          fetchServices();
        } else {
          showFailed('Update Error', data.error || 'Failed to update service.');
        }
      } else {
        // POST
        const res = await fetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            group: finalGroup,
            price: Number(price),
            duration: duration.trim(),
            capacity: Number(capacity) || 0,
            description: description.trim(),
            addedBy: activeStaff.name,
          }),
        });
        const data = await res.json();
        if (data.success) {
          showSuccess(
            'New Service Created',
            `${name} successfully added to group [${finalGroup}] and live on Osieka Resort systems.`
          );
          setIsModalOpen(false);
          fetchServices();
        } else {
          showFailed('Creation Error', data.error || 'Failed to create service.');
        }
      }
    } catch (err: any) {
      showFailed('Network Error', err.message || 'Could not communicate with server.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteService = (serviceId: string, serviceName: string) => {
    showConfirm(
      'Delete Service / Venue?',
      `Are you sure you want to delete "${serviceName}"? This will remove it from available catalogs and groups in MongoDB Atlas.`,
      async () => {
        try {
          const res = await fetch(`/api/services?serviceId=${encodeURIComponent(serviceId)}`, {
            method: 'DELETE',
          });
          const data = await res.json();
          if (data.success) {
            showSuccess('Service Deleted', `"${serviceName}" has been removed from catalogs.`);
            fetchServices();
          } else {
            showFailed('Deletion Error', data.error || 'Failed to delete service.');
          }
        } catch (err: any) {
          showFailed('Error', err.message);
        }
      },
      {
        variant: 'danger',
        confirmText: 'Yes, Delete',
        cancelText: 'Cancel',
      }
    );
  };

  const filteredServices = selectedGroup === 'ALL'
    ? services
    : services.filter(s => s.group.toLowerCase() === selectedGroup.toLowerCase());

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px 0 60px' }}>
      
      {/* Top Header & Navigation Bar */}
      <div className="ent-card" style={{ padding: '20px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                <ArrowLeft size={14} /> Back to Command Hub
              </button>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                Halls, Venues & Ancillary Services Catalog
              </h2>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '6px', marginBottom: 0 }}>
              Official catalog of all event halls, banquet grounds, laundry packages, and custom resort ancillary offerings.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* View Mode Toggle: Cards vs List */}
            <div style={{ display: 'flex', backgroundColor: 'var(--bg-secondary)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => setDisplayMode('CARDS')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  fontWeight: displayMode === 'CARDS' ? 800 : 600,
                  borderRadius: '6px',
                  backgroundColor: displayMode === 'CARDS' ? 'var(--brand-primary)' : 'transparent',
                  color: displayMode === 'CARDS' ? '#FFFFFF' : 'var(--text-secondary)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <LayoutGrid size={13} />
                <span>Cards</span>
              </button>
              <button
                onClick={() => setDisplayMode('LIST')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  fontWeight: displayMode === 'LIST' ? 800 : 600,
                  borderRadius: '6px',
                  backgroundColor: displayMode === 'LIST' ? 'var(--brand-primary)' : 'transparent',
                  color: displayMode === 'LIST' ? '#FFFFFF' : 'var(--text-secondary)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <List size={13} />
                <span>List</span>
              </button>
            </div>

            {/* Super Admin Create Button */}
            {canManageServices && (
              <button onClick={openAddModal} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.825rem' }}>
                <Plus size={15} />
                <span>+ Add Service / Venue</span>
              </button>
            )}
          </div>
        </div>

        {/* Group Selector Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '20px', flexWrap: 'wrap', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          <button
            onClick={() => setSelectedGroup('ALL')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: selectedGroup === 'ALL' ? 800 : 600,
              backgroundColor: selectedGroup === 'ALL' ? 'var(--brand-primary)' : 'var(--bg-secondary)',
              color: selectedGroup === 'ALL' ? '#FFFFFF' : 'var(--text-secondary)',
              border: `1px solid ${selectedGroup === 'ALL' ? 'var(--brand-primary)' : 'var(--border-subtle)'}`,
              cursor: 'pointer',
            }}
          >
            All Groups ({services.length})
          </button>

          {groups.map((grp) => {
            const count = services.filter((s) => s.group.toLowerCase() === grp.toLowerCase()).length;
            const isSelected = selectedGroup.toLowerCase() === grp.toLowerCase();
            return (
              <button
                key={grp}
                onClick={() => setSelectedGroup(grp)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: isSelected ? 800 : 600,
                  backgroundColor: isSelected ? 'var(--brand-primary)' : 'var(--bg-secondary)',
                  color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                  border: `1px solid ${isSelected ? 'var(--brand-primary)' : 'var(--border-subtle)'}`,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>{grp}</span>
                <span style={{
                  fontSize: '0.65rem',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : 'var(--border-color)',
                  color: isSelected ? '#FFFFFF' : 'var(--text-muted)',
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Services Content: CARDS Display */}
      {displayMode === 'CARDS' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px',
        }}>
          {filteredServices.map((item) => (
            <div
              key={item.serviceId}
              className="ent-card"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderTop: item.group === 'Halls and Events' ? '4px solid #8B5CF6' : '4px solid var(--brand-primary)',
                position: 'relative',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                    {item.group}
                  </span>
                  <span className={`badge ${item.isAvailable ? 'badge-clean' : 'badge-dirty'}`} style={{ fontSize: '0.68rem' }}>
                    {item.isAvailable ? 'Available' : 'Reserved / Maintenance'}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                  {item.name}
                </h3>

                {item.description && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 14px', lineHeight: 1.5 }}>
                    {item.description}
                  </p>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '14px 0', padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <Clock size={13} /> Duration / Turnaround:
                    </span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.duration}</span>
                  </div>

                  {Boolean(item.capacity && item.capacity > 0) && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <Users size={13} /> Venue Capacity:
                      </span>
                      <span style={{ fontWeight: 700, color: '#8B5CF6' }}>Up to {item.capacity} Guests</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', alignItems: 'center', paddingTop: '4px', borderTop: '1px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Official Standard Rate:</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--emerald-primary)', fontFamily: 'var(--font-mono)' }}>
                      {formatNaira(item.price)}
                    </span>
                  </div>
                </div>
              </div>

              {canManageServices && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                  <button
                    onClick={() => openEditModal(item)}
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Edit3 size={13} color="var(--brand-primary)" />
                    <span>Edit Settings</span>
                  </button>
                  <button
                    onClick={() => handleDeleteService(item.serviceId, item.name)}
                    className="btn-danger"
                    style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Services Content: LIST Display */}
      {displayMode === 'LIST' && (
        <div className="ent-card" style={{ padding: '20px' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="ent-table" style={{ width: '100%', fontSize: '0.825rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-secondary)', textAlign: 'left' }}>
                  <th style={{ padding: '10px 14px' }}>Service / Venue Name</th>
                  <th style={{ padding: '10px 14px' }}>Department Group</th>
                  <th style={{ padding: '10px 14px' }}>Duration / Schedule</th>
                  <th style={{ padding: '10px 14px' }}>Capacity</th>
                  <th style={{ padding: '10px 14px' }}>Standard Price</th>
                  <th style={{ padding: '10px 14px' }}>Status</th>
                  {canManageServices && <th style={{ padding: '10px 14px', textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((item) => (
                  <tr key={item.serviceId} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {item.name}
                      {item.description && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                          {item.description}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className="badge badge-purple" style={{ fontSize: '0.68rem' }}>{item.group}</span>
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {item.duration}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      {item.capacity ? `${item.capacity} Guests` : '—'}
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--emerald-primary)' }}>
                      {formatNaira(item.price)}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className={`badge ${item.isAvailable ? 'badge-clean' : 'badge-dirty'}`} style={{ fontSize: '0.65rem' }}>
                        {item.isAvailable ? 'Available' : 'Reserved'}
                      </span>
                    </td>
                    {canManageServices && (
                      <td style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            onClick={() => openEditModal(item)}
                            className="btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                          >
                            <Edit3 size={12} color="var(--brand-primary)" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteService(item.serviceId, item.name)}
                            className="btn-danger"
                            style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Service Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 110,
          padding: '20px',
        }}>
          <div className="ent-card" style={{ width: '100%', maxWidth: '580px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Building2 size={22} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {editingItem ? 'Edit Service / Venue Details' : 'Add New Hall, Event Venue or Service'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveService} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Service / Hall / Venue Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Osieka Grand Ballroom, Royal VIP Suite, Suit Laundry Steam Dry-Clean"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{ width: '100%' }}
                />
              </div>

              {/* Group Selector with Dynamic "+ Create New Group" Option */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Assign to Department Group
                </label>
                {!isCreatingNewGroup ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      value={group}
                      onChange={(e) => {
                        if (e.target.value === '__CREATE_NEW__') {
                          setIsCreatingNewGroup(true);
                        } else {
                          setGroup(e.target.value);
                        }
                      }}
                      style={{ flex: 1 }}
                    >
                      {groups.map((grp) => (
                        <option key={grp} value={grp}>{grp}</option>
                      ))}
                      <option value="__CREATE_NEW__">+ Create a new custom group...</option>
                    </select>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Type custom group name (e.g. Wellness Spa, Boat Cruise)"
                      value={customGroupName}
                      onChange={(e) => setCustomGroupName(e.target.value)}
                      required
                      style={{ flex: 1 }}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setIsCreatingNewGroup(false)}
                      className="btn-secondary"
                      style={{ fontSize: '0.75rem' }}
                    >
                      Use Existing
                    </button>
                  </div>
                )}
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Baseline resort groups: Rooms, Kitchen, Drinks, Halls and Events.
                </div>
              </div>

              {/* Price and Duration */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Standard Price (₦ NGN)
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="250000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    style={{ width: '100%', fontFamily: 'var(--font-mono)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Duration / Turnaround
                  </label>
                  <input
                    type="text"
                    placeholder="Full Day (8am - 6pm), Per Hour, 24 Hours, Per Piece"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    required
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Capacity (For Halls and Events) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Capacity (Guests / Attendees - Optional for Halls)
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder="e.g. 500 (Leave 0 for laundry/ancillary items)"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value === '' ? '' : Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Description & Specifications
                </label>
                <textarea
                  placeholder="Audio-visual equipment, air conditioning, staging, included amenities..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.825rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving to Database...' : editingItem ? 'Save Updates' : 'Create Service & Add to Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
