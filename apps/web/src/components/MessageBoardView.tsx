'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  Mail,
  Phone,
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  RefreshCw,
  Download,
  Copy,
  UserPlus,
  Archive,
  Send,
  Sparkles,
  Inbox,
  Users,
  ArrowLeft,
  Check,
  ExternalLink,
} from 'lucide-react';
import { StaffUser } from '@hosos/types';
import { hasPermission, isReadOnlyAuditor } from '@/lib/rbac';
import { useFeedback } from '@/context/FeedbackContext';
import type { IContactMessage, IEmailSubscriber } from '@/models/MessageBoard';

interface MessageBoardViewProps {
  activeStaff: StaffUser;
  defaultSubmenu?: 'MESSAGES' | 'EMAIL_LIST';
  onSwitchSubmenu?: (sub: 'MESSAGES' | 'EMAIL_LIST') => void;
  onBack?: () => void;
}

export default function MessageBoardView({
  activeStaff,
  defaultSubmenu = 'MESSAGES',
  onSwitchSubmenu,
  onBack,
}: MessageBoardViewProps) {
  const { showToast, showConfirm } = useFeedback();
  const [activeTab, setActiveTab] = useState<'MESSAGES' | 'EMAIL_LIST'>(defaultSubmenu);

  useEffect(() => {
    setActiveTab(defaultSubmenu);
  }, [defaultSubmenu]);

  const [messages, setMessages] = useState<IContactMessage[]>([]);
  const [subscribers, setSubscribers] = useState<IEmailSubscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters for Message Board
  const [messageFilter, setMessageFilter] = useState<'ALL' | 'UNREAD' | 'FOLLOWED_UP' | 'ARCHIVED'>('ALL');
  const [messageSearch, setMessageSearch] = useState('');

  // Filters & Add Form for Email List
  const [emailSourceFilter, setEmailSourceFilter] = useState<string>('ALL');
  const [emailSearch, setEmailSearch] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [newSubEmail, setNewSubEmail] = useState('');
  const [newSubPhone, setNewSubPhone] = useState('');
  const [isAddingSub, setIsAddingSub] = useState(false);
  const [copiedEmails, setCopiedEmails] = useState(false);

  const isAuditor = isReadOnlyAuditor(activeStaff.role);
  const canFollowUp =
    !isAuditor &&
    (hasPermission(activeStaff.role, 'messages.followup', activeStaff.id) ||
      hasPermission(activeStaff.role, 'reservations.followup', activeStaff.id) ||
      activeStaff.role === 'SUPERADMIN' ||
      activeStaff.role === 'OWNER' ||
      activeStaff.role === 'MANAGER' ||
      activeStaff.role === 'GENERAL_MANAGER' ||
      activeStaff.role === 'FRONT_DESK');
  const canDeleteMessage =
    !isAuditor &&
    (hasPermission(activeStaff.role, 'messages.delete', activeStaff.id) ||
      activeStaff.role === 'SUPERADMIN' ||
      activeStaff.role === 'OWNER');
  const canManageEmails =
    !isAuditor &&
    (hasPermission(activeStaff.role, 'emails.manage', activeStaff.id) ||
      activeStaff.role === 'SUPERADMIN' ||
      activeStaff.role === 'OWNER' ||
      activeStaff.role === 'MANAGER' ||
      activeStaff.role === 'GENERAL_MANAGER' ||
      activeStaff.role === 'FRONT_DESK');
  const canDeleteEmail =
    !isAuditor &&
    (hasPermission(activeStaff.role, 'emails.delete', activeStaff.id) ||
      activeStaff.role === 'SUPERADMIN' ||
      activeStaff.role === 'OWNER');

  const fetchBoardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/messages');
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
        setSubscribers(data.subscribers || []);
      }
    } catch (err) {
      console.warn('Error loading message board:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoardData();
  }, [fetchBoardData]);

  const handleTabSwitch = (tab: 'MESSAGES' | 'EMAIL_LIST') => {
    setActiveTab(tab);
    if (onSwitchSubmenu) {
      onSwitchSubmenu(tab);
    }
  };

  const handleUpdateMessage = async (
    messageId: string,
    payload: {
      status?: IContactMessage['status'];
      followUpChannel?: IContactMessage['followUpChannel'];
      staffNotes?: string;
    }
  ) => {
    try {
      const res = await fetch('/api/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId,
          ...payload,
          staffName: activeStaff.name,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchBoardData();
        showToast({
          type: 'success',
          title: 'Message Updated',
          message: payload.followUpChannel
            ? `Logged ${payload.followUpChannel} follow-up by ${activeStaff.name}.`
            : `Message status updated to ${payload.status}.`,
        });
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Update Error',
        message: err.message || 'Could not update message.',
      });
    }
  };

  const handleDeleteMessage = (msg: IContactMessage) => {
    if (!canDeleteMessage) {
      showToast({
        type: 'error',
        title: 'Permission Denied',
        message: 'You do not have permission to delete messages from the Message Board.',
      });
      return;
    }
    showConfirm(
      'Delete Inquiry Message',
      `Are you sure you want to permanently delete message #${msg.messageId} from ${msg.fullName}?`,
      async () => {
        try {
          const res = await fetch(
            `/api/messages?messageId=${encodeURIComponent(msg.messageId)}&role=${encodeURIComponent(
              activeStaff.role
            )}&permissionGranted=${canDeleteMessage}`,
            { method: 'DELETE' }
          );
          const data = await res.json();
          if (data.success) {
            setMessages((prev) => prev.filter((m) => m.messageId !== msg.messageId));
            showToast({
              type: 'info',
              title: 'Message Deleted',
              message: `Inquiry #${msg.messageId} removed from the Message Board.`,
            });
          } else {
            showToast({ type: 'error', title: 'Delete Blocked', message: data.error || 'Could not delete.' });
          }
        } catch (err: any) {
          showToast({ type: 'error', title: 'Error', message: err.message });
        }
      },
      { confirmText: 'Delete Message', variant: 'danger' }
    );
  };

  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubEmail.trim()) return;
    setIsAddingSub(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'SUBSCRIBER',
          name: newSubName.trim() || 'Resort Guest',
          email: newSubEmail.trim(),
          phone: newSubPhone.trim(),
          source: 'MANUAL_ENTRY',
          tags: ['Concierge Added'],
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewSubName('');
        setNewSubEmail('');
        setNewSubPhone('');
        fetchBoardData();
        showToast({
          type: 'success',
          title: 'Email Added to List',
          message: `${newSubEmail} has been added to the Osieka Resort email list.`,
        });
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setIsAddingSub(false);
    }
  };

  const handleToggleSubscriberStatus = async (sub: IEmailSubscriber) => {
    const nextStatus = sub.status === 'ACTIVE' ? 'UNSUBSCRIBED' : 'ACTIVE';
    try {
      await fetch('/api/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriberId: sub.subscriberId,
          status: nextStatus,
        }),
      });
      fetchBoardData();
      showToast({
        type: 'info',
        title: 'Subscriber Updated',
        message: `${sub.email} marked as ${nextStatus}.`,
      });
    } catch (_) {}
  };

  const handleDeleteSubscriber = (sub: IEmailSubscriber) => {
    if (!canDeleteEmail) {
      showToast({
        type: 'error',
        title: 'Permission Denied',
        message: 'You do not have permission to delete subscribers from the Email List.',
      });
      return;
    }
    showConfirm(
      'Remove Email Subscriber',
      `Are you sure you want to remove ${sub.email} (${sub.name}) from the email list?`,
      async () => {
        try {
          const res = await fetch(
            `/api/messages?subscriberId=${encodeURIComponent(sub.subscriberId)}&role=${encodeURIComponent(
              activeStaff.role
            )}&permissionGranted=${canDeleteEmail}`,
            { method: 'DELETE' }
          );
          const data = await res.json();
          if (data.success) {
            setSubscribers((prev) => prev.filter((s) => s.subscriberId !== sub.subscriberId));
            showToast({
              type: 'info',
              title: 'Subscriber Removed',
              message: `${sub.email} removed from the email list.`,
            });
          }
        } catch (err: any) {
          showToast({ type: 'error', title: 'Error', message: err.message });
        }
      },
      { confirmText: 'Remove Email', variant: 'danger' }
    );
  };

  const handleCopyAllEmails = () => {
    const activeEmails = subscribers
      .filter((s) => s.status === 'ACTIVE' && s.email)
      .map((s) => s.email)
      .join(', ');
    if (!activeEmails) {
      showToast({ type: 'info', title: 'No Active Emails', message: 'There are no active emails to copy.' });
      return;
    }
    navigator.clipboard.writeText(activeEmails);
    setCopiedEmails(true);
    setTimeout(() => setCopiedEmails(false), 2500);
    showToast({
      type: 'success',
      title: 'Email List Copied',
      message: `Copied ${subscribers.filter((s) => s.status === 'ACTIVE').length} active email addresses to clipboard.`,
    });
  };

  const handleExportCsv = () => {
    const headers = ['Subscriber ID', 'Name', 'Email', 'Phone', 'Source', 'Status', 'Subscribed At'];
    const rows = filteredSubscribers.map((s) => [
      s.subscriberId,
      `"${(s.name || '').replace(/"/g, '""')}"`,
      s.email,
      s.phone || '',
      s.source,
      s.status,
      s.subscribedAt,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `osieka-resort-email-list-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredMessages = messages.filter((m) => {
    if (messageFilter !== 'ALL' && m.status !== messageFilter) return false;
    if (messageSearch.trim()) {
      const q = messageSearch.toLowerCase();
      return (
        m.fullName.toLowerCase().includes(q) ||
        (m.email || '').toLowerCase().includes(q) ||
        m.phone.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q) ||
        m.messageId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredSubscribers = subscribers.filter((s) => {
    if (emailSourceFilter !== 'ALL' && s.source !== emailSourceFilter) return false;
    if (emailSearch.trim()) {
      const q = emailSearch.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.phone || '').toLowerCase().includes(q) ||
        s.subscriberId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const unreadMessagesCount = messages.filter((m) => m.status === 'UNREAD').length;
  const followedUpCount = messages.filter((m) => m.status === 'FOLLOWED_UP').length;
  const activeSubscribersCount = subscribers.filter((s) => s.status === 'ACTIVE').length;

  return (
    <div style={{ paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header Banner */}
      <div
        className="ent-card"
        style={{
          padding: '20px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          color: '#FFFFFF',
          border: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              <ArrowLeft size={15} />
              <span>Hub</span>
            </button>
          )}
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'rgba(217, 119, 54, 0.2)',
              border: '1px solid rgba(217, 119, 54, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#F59E0B',
            }}
          >
            {activeTab === 'MESSAGES' ? <MessageSquare size={22} /> : <Mail size={22} />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                {activeTab === 'MESSAGES'
                  ? 'Concierge Message Board'
                  : 'Email List & Dispatch Subscribers'}
              </h1>
              <span
                className="badge"
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  color: '#34D399',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                }}
              >
                Live Website Sync
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '4px 0 0 0' }}>
              {activeTab === 'MESSAGES'
                ? 'All inquiries submitted from the Osieka Resort website contact form with instant WhatsApp, Call & Email follow-up triggers.'
                : 'Unified email directory collected from the Contact Form, Osieka Dispatch Newsletter, and Reservation Portal.'}
            </p>
          </div>
        </div>

        {/* Submenu Switcher Pills (Messages Board vs Email List Submenu) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: 'rgba(255,255,255,0.08)',
              padding: '4px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <button
              onClick={() => handleTabSwitch('MESSAGES')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '7px',
                fontSize: '0.8rem',
                fontWeight: 700,
                backgroundColor: activeTab === 'MESSAGES' ? '#2563EB' : 'transparent',
                color: activeTab === 'MESSAGES' ? '#FFFFFF' : '#CBD5E1',
              }}
            >
              <Inbox size={15} />
              <span>Contact Messages ({messages.length})</span>
              {unreadMessagesCount > 0 && (
                <span
                  style={{
                    backgroundColor: '#EF4444',
                    color: '#FFFFFF',
                    fontSize: '0.65rem',
                    padding: '1px 6px',
                    borderRadius: '999px',
                    fontWeight: 800,
                  }}
                >
                  {unreadMessagesCount} new
                </span>
              )}
            </button>

            <button
              onClick={() => handleTabSwitch('EMAIL_LIST')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '7px',
                fontSize: '0.8rem',
                fontWeight: 700,
                backgroundColor: activeTab === 'EMAIL_LIST' ? '#2563EB' : 'transparent',
                color: activeTab === 'EMAIL_LIST' ? '#FFFFFF' : '#CBD5E1',
              }}
            >
              <Mail size={15} />
              <span>Email List Submenu ({subscribers.length})</span>
            </button>
          </div>

          <button
            onClick={fetchBoardData}
            className="btn-secondary"
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: '#FFFFFF',
              borderColor: 'rgba(255,255,255,0.2)',
            }}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '14px',
        }}
      >
        <div className="ent-kpi-card" onClick={() => handleTabSwitch('MESSAGES')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Total Contact Messages
            </span>
            <MessageSquare size={16} color="var(--brand-primary)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {messages.length}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Website Contact Form submissions
          </span>
        </div>

        <div className="ent-kpi-card" onClick={() => { handleTabSwitch('MESSAGES'); setMessageFilter('UNREAD'); }} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Unread Inquiries
            </span>
            <Clock size={16} color="var(--amber-primary)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--amber-primary)' }}>
            {unreadMessagesCount}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Awaiting concierge response
          </span>
        </div>

        <div className="ent-kpi-card" onClick={() => { handleTabSwitch('MESSAGES'); setMessageFilter('FOLLOWED_UP'); }} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Followed Up
            </span>
            <CheckCircle2 size={16} color="var(--emerald-primary)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--emerald-primary)' }}>
            {followedUpCount}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Contacted via WhatsApp, Call or Email
          </span>
        </div>

        <div className="ent-kpi-card" onClick={() => handleTabSwitch('EMAIL_LIST')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Active Email Subscribers
            </span>
            <Users size={16} color="var(--purple-primary)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--purple-primary)' }}>
            {activeSubscribersCount}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Collected from Contact, Newsletter & Bookings
          </span>
        </div>
      </div>

      {/* TAB 1: CONTACT FORM MESSAGE BOARD */}
      {activeTab === 'MESSAGES' && (
        <div className="ent-card" style={{ padding: '20px' }}>
          {/* Filter & Search Bar */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '18px',
              paddingBottom: '14px',
              borderBottom: '1px solid var(--border-color)',
            }}
          >
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {(
                [
                  { id: 'ALL', label: `All Messages (${messages.length})` },
                  { id: 'UNREAD', label: `Unread (${unreadMessagesCount})` },
                  { id: 'FOLLOWED_UP', label: `Followed Up (${followedUpCount})` },
                  { id: 'ARCHIVED', label: `Archived (${messages.filter((m) => m.status === 'ARCHIVED').length})` },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setMessageFilter(tab.id)}
                  className={messageFilter === tab.id ? 'btn-primary' : 'btn-secondary'}
                  style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 12px',
                minWidth: '260px',
              }}
            >
              <Search size={14} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search sender, phone, email, topic..."
                value={messageSearch}
                onChange={(e) => setMessageSearch(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                  fontSize: '0.8rem',
                  width: '100%',
                }}
              />
            </div>
          </div>

          {/* Message Cards List */}
          {filteredMessages.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <MessageSquare size={36} style={{ margin: '0 auto 10px auto', opacity: 0.4 }} />
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                No contact messages match your filter
              </div>
              <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                Messages submitted via the website Contact Form appear here automatically in real time.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {filteredMessages.map((msg) => {
                const cleanDigits = (msg.phone || '').replace(/\D/g, '');
                const waDigits = cleanDigits.startsWith('0')
                  ? `234${cleanDigits.slice(1)}`
                  : cleanDigits || '2348074538555';
                const waText = encodeURIComponent(
                  `Hello ${msg.firstName}, thank you for contacting Osieka Resort regarding "${msg.subject}". How may our concierge assist you today?`
                );

                return (
                  <div
                    key={msg.messageId}
                    style={{
                      border:
                        msg.status === 'UNREAD'
                          ? '1.5px solid var(--brand-primary)'
                          : '1px solid var(--border-color)',
                      borderRadius: '10px',
                      padding: '16px 18px',
                      backgroundColor: msg.status === 'UNREAD' ? '#F8FAFF' : '#FFFFFF',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    {/* Header Row */}
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '10px',
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                            {msg.fullName}
                          </span>
                          <span className="badge badge-brand">{msg.subject}</span>
                          <span
                            className={`badge ${
                              msg.status === 'UNREAD'
                                ? 'badge-warning'
                                : msg.status === 'FOLLOWED_UP'
                                ? 'badge-success'
                                : 'badge-neutral'
                            }`}
                          >
                            {msg.status.replace(/_/g, ' ')}
                          </span>
                          {msg.followUpChannel && msg.followUpChannel !== 'NONE' && (
                            <span className="badge badge-purple">
                              Followed up via {msg.followUpChannel}
                            </span>
                          )}
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            #{msg.messageId}
                          </span>
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            flexWrap: 'wrap',
                            fontSize: '0.78rem',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                            <Phone size={13} color="var(--emerald-primary)" />
                            {msg.phone}
                          </span>
                          {msg.email && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Mail size={13} color="var(--brand-primary)" />
                              {msg.email}
                            </span>
                          )}
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                            <Clock size={12} />
                            {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : 'Just now'}
                          </span>
                        </div>
                      </div>

                      {/* Follow-Up & Action Buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {canFollowUp && (
                          <>
                            <a
                              href={`https://wa.me/${waDigits}?text=${waText}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={() =>
                                handleUpdateMessage(msg.messageId, {
                                  status: 'FOLLOWED_UP',
                                  followUpChannel: 'WHATSAPP',
                                })
                              }
                              className="btn-primary"
                              style={{
                                backgroundColor: '#10B981',
                                fontSize: '0.75rem',
                                padding: '6px 12px',
                                textDecoration: 'none',
                              }}
                            >
                              <Send size={13} />
                              <span>WhatsApp Reply</span>
                            </a>

                            <a
                              href={`tel:${msg.phone}`}
                              onClick={() =>
                                handleUpdateMessage(msg.messageId, {
                                  status: 'FOLLOWED_UP',
                                  followUpChannel: 'CALLED',
                                })
                              }
                              className="btn-secondary"
                              style={{ fontSize: '0.75rem', padding: '6px 12px', textDecoration: 'none' }}
                            >
                              <Phone size={13} />
                              <span>Call Guest</span>
                            </a>

                            {msg.email && (
                              <a
                                href={`mailto:${msg.email}?subject=${encodeURIComponent(
                                  `Re: ${msg.subject} — Osieka Resort`
                                )}`}
                                onClick={() =>
                                  handleUpdateMessage(msg.messageId, {
                                    status: 'FOLLOWED_UP',
                                    followUpChannel: 'EMAIL',
                                  })
                                }
                                className="btn-secondary"
                                style={{ fontSize: '0.75rem', padding: '6px 12px', textDecoration: 'none' }}
                              >
                                <Mail size={13} />
                                <span>Email</span>
                              </a>
                            )}

                            {msg.status === 'UNREAD' && (
                              <button
                                onClick={() => handleUpdateMessage(msg.messageId, { status: 'READ' })}
                                className="btn-secondary"
                                style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                              >
                                <Check size={13} />
                                <span>Mark Read</span>
                              </button>
                            )}

                            {msg.status !== 'ARCHIVED' && (
                              <button
                                onClick={() => handleUpdateMessage(msg.messageId, { status: 'ARCHIVED' })}
                                className="btn-ghost"
                                title="Archive Inquiry"
                                style={{ padding: '6px 8px' }}
                              >
                                <Archive size={14} />
                              </button>
                            )}
                          </>
                        )}

                        {canDeleteMessage && (
                          <button
                            onClick={() => handleDeleteMessage(msg)}
                            className="btn-ghost"
                            title="Delete Message"
                            style={{ padding: '6px 8px', color: 'var(--rose-primary)' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Message Content Box */}
                    <div
                      style={{
                        backgroundColor: 'var(--bg-secondary)',
                        padding: '12px 14px',
                        borderRadius: '8px',
                        fontSize: '0.84rem',
                        color: 'var(--text-primary)',
                        lineHeight: 1.55,
                        borderLeft: '3px solid var(--brand-primary)',
                      }}
                    >
                      {msg.message}
                    </div>

                    {msg.followedUpBy && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--emerald-text)' }}>
                        ✓ Last followed up by <strong>{msg.followedUpBy}</strong> via{' '}
                        <strong>{msg.followUpChannel}</strong>{' '}
                        {msg.followedUpAt ? `on ${new Date(msg.followedUpAt).toLocaleString()}` : ''}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EMAIL LIST SUBMENU */}
      {activeTab === 'EMAIL_LIST' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Quick Add Email Subscriber Card */}
          {canManageEmails && (
            <div className="ent-card" style={{ padding: '16px 20px' }}>
              <div
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <UserPlus size={15} color="var(--brand-primary)" />
                <span>Add Guest Email to Osieka Dispatch List</span>
              </div>
              <form
                onSubmit={handleAddSubscriber}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '10px',
                  alignItems: 'center',
                }}
              >
                <input
                  type="text"
                  placeholder="Guest Full Name"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                />
                <input
                  type="email"
                  required
                  placeholder="Email Address *"
                  value={newSubEmail}
                  onChange={(e) => setNewSubEmail(e.target.value)}
                />
                <input
                  type="tel"
                  placeholder="Phone / WhatsApp (Optional)"
                  value={newSubPhone}
                  onChange={(e) => setNewSubPhone(e.target.value)}
                />
                <button type="submit" disabled={isAddingSub} className="btn-primary" style={{ height: '38px' }}>
                  <UserPlus size={14} />
                  <span>{isAddingSub ? 'Adding...' : 'Add to Email List'}</span>
                </button>
              </form>
            </div>
          )}

          {/* Subscribers Directory Table */}
          <div className="ent-card" style={{ padding: '20px' }}>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { id: 'ALL', label: `All Sources (${subscribers.length})` },
                  {
                    id: 'NEWSLETTER_FORM',
                    label: `Newsletter (${subscribers.filter((s) => s.source === 'NEWSLETTER_FORM').length})`,
                  },
                  {
                    id: 'CONTACT_FORM',
                    label: `Contact Form (${subscribers.filter((s) => s.source === 'CONTACT_FORM').length})`,
                  },
                  {
                    id: 'RESERVATION_PORTAL',
                    label: `Reservations (${subscribers.filter((s) => s.source === 'RESERVATION_PORTAL').length})`,
                  },
                ].map((src) => (
                  <button
                    key={src.id}
                    onClick={() => setEmailSourceFilter(src.id)}
                    className={emailSourceFilter === src.id ? 'btn-primary' : 'btn-secondary'}
                    style={{ padding: '6px 12px', fontSize: '0.76rem' }}
                  >
                    {src.label}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '6px 12px',
                    minWidth: '220px',
                  }}
                >
                  <Search size={14} color="var(--text-muted)" />
                  <input
                    type="text"
                    placeholder="Search email or name..."
                    value={emailSearch}
                    onChange={(e) => setEmailSearch(e.target.value)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      padding: 0,
                      fontSize: '0.8rem',
                      width: '100%',
                    }}
                  />
                </div>

                <button onClick={handleCopyAllEmails} className="btn-secondary">
                  {copiedEmails ? <Check size={14} color="var(--emerald-primary)" /> : <Copy size={14} />}
                  <span>{copiedEmails ? 'Copied!' : 'Copy All Emails'}</span>
                </button>

                <button onClick={handleExportCsv} className="btn-primary">
                  <Download size={14} />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            <div className="ent-table-container">
              <table className="ent-table">
                <thead>
                  <tr>
                    <th>Subscriber ID</th>
                    <th>Guest Name</th>
                    <th>Email Address</th>
                    <th>Phone / WhatsApp</th>
                    <th>Collection Source</th>
                    <th>Interests / Tags</th>
                    <th>Subscribed Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscribers.map((sub) => (
                    <tr key={sub.subscriberId}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {sub.subscriberId}
                      </td>
                      <td style={{ fontWeight: 700 }}>{sub.name}</td>
                      <td>
                        <a
                          href={`mailto:${sub.email}`}
                          style={{
                            color: 'var(--brand-primary)',
                            fontWeight: 600,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Mail size={13} />
                          <span>{sub.email}</span>
                        </a>
                      </td>
                      <td>{sub.phone || '—'}</td>
                      <td>
                        <span
                          className={`badge ${
                            sub.source === 'CONTACT_FORM'
                              ? 'badge-brand'
                              : sub.source === 'NEWSLETTER_FORM'
                              ? 'badge-purple'
                              : 'badge-success'
                          }`}
                        >
                          {sub.source.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {(sub.tags || ['General']).map((t, i) => (
                            <span key={i} className="badge badge-neutral">
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleDateString() : 'Today'}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            sub.status === 'ACTIVE' ? 'badge-active' : 'badge-warning'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {canManageEmails && (
                            <button
                              onClick={() => handleToggleSubscriberStatus(sub)}
                              className="btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                            >
                              {sub.status === 'ACTIVE' ? 'Unsubscribe' : 'Reactivate'}
                            </button>
                          )}
                          {canDeleteEmail && (
                            <button
                              onClick={() => handleDeleteSubscriber(sub)}
                              className="btn-ghost"
                              style={{ padding: '4px 6px', color: 'var(--rose-primary)' }}
                              title="Remove Subscriber"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredSubscribers.length === 0 && (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                        No email subscribers found matching your filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
