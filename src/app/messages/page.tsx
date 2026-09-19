'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Search, Trash2, Mail, Phone, User, RefreshCw, Calendar, Send, X, ExternalLink } from 'lucide-react';

interface ContactMessage {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  message: string;
  created_at: string;
}

export default function MessagesPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  // Reply modal state
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [replySubject, setReplySubject] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [replyNotification, setReplyNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        setCurrentUser(userObj);
        if (userObj.role === 'Admin') {
          fetchMessages();
        } else {
          setLoading(false);
        }
      }
    }
  }, []);

  async function fetchMessages() {
    try {
      setLoading(true);
      const res = await fetch('/api/contact');
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  }

  async function deleteMessage(id: number) {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      setDeleting(id);
      const res = await fetch(`/api/contact/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessages(prev => prev.filter(m => m.id !== id));
        if (selectedMessage?.id === id) setSelectedMessage(null);
      }
    } catch (err) {
      console.error('Failed to delete message:', err);
    } finally {
      setDeleting(null);
    }
  }

  function openReplyModal(msg: ContactMessage) {
    setSelectedMessage(msg);
    setReplySubject(`Re: Inquiry from ${msg.name} - Braham Sama`);
    setReplyBody(`Dear ${msg.name},\n\nThank you for reaching out to Braham Sama Nig Ltd.\n\n\n\nBest regards,\nBraham Sama Operations & Management`);
    setReplyNotification(null);
    setIsReplyOpen(true);
  }

  async function handleSendEmailReply() {
    if (!selectedMessage || !selectedMessage.email) return;
    if (!replySubject.trim() || !replyBody.trim()) {
      setReplyNotification({ type: 'error', text: 'Subject and reply message body cannot be empty.' });
      return;
    }

    setSendingReply(true);
    setReplyNotification(null);

    try {
      const res = await fetch('/api/contact/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: selectedMessage.email,
          name: selectedMessage.name,
          subject: replySubject,
          message: replyBody,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setReplyNotification({ type: 'success', text: data.message || 'Email sent successfully!' });
        setTimeout(() => {
          setIsReplyOpen(false);
          setReplyNotification(null);
        }, 1800);
      } else {
        setReplyNotification({ type: 'error', text: data.message || 'Failed to send email reply.' });
      }
    } catch (err: any) {
      console.error(err);
      setReplyNotification({ type: 'error', text: 'Error connecting to server. Please try again.' });
    } finally {
      setSendingReply(false);
    }
  }

  const filtered = messages.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    (m.email && m.email.toLowerCase().includes(search.toLowerCase())) ||
    (m.phone && m.phone.includes(search)) ||
    m.message.toLowerCase().includes(search.toLowerCase())
  );

  function formatDate(dateStr: string) {
    try {
      return new Date(dateStr).toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  }

  if (currentUser && currentUser.role !== 'Admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Access restricted to Admins only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20">
              <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </span>
            Contact Messages & Replies
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Manage public contact form inquiries and send direct email replies.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full font-medium">
            {messages.length} message{messages.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={fetchMessages}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, email, phone or message..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all placeholder-slate-400"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">Loading messages...</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-semibold">No messages found</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
            {search ? 'Try a different search term.' : 'Messages from the contact form will appear here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Message List */}
          <div className="space-y-3">
            {filtered.map(msg => (
              <div
                key={msg.id}
                onClick={() => setSelectedMessage(msg)}
                className={`group relative cursor-pointer rounded-2xl border p-4 transition-all duration-200 hover:shadow-md ${
                  selectedMessage?.id === msg.id
                    ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                      {msg.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{msg.name}</p>
                      {msg.email && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{msg.email}</p>
                      )}
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 line-clamp-2">{msg.message}</p>
                    </div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); deleteMessage(msg.id); }}
                    disabled={deleting === msg.id}
                    className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  >
                    <Trash2 className={`w-4 h-4 ${deleting === msg.id ? 'animate-pulse' : ''}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span className="text-xs text-slate-400 dark:text-slate-500">{formatDate(msg.created_at)}</span>
                  </div>
                  {msg.email && (
                    <button
                      onClick={(e) => { e.stopPropagation(); openReplyModal(msg); }}
                      className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
                    >
                      <Mail className="w-3 h-3" /> Reply
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Message Detail Panel */}
          <div className="lg:sticky lg:top-6">
            {selectedMessage ? (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg">
                      {selectedMessage.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg">{selectedMessage.name}</h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500">Message #{selectedMessage.id}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteMessage(selectedMessage.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  {selectedMessage.email ? (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                      <Mail className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Email Address</p>
                        <a href={`mailto:${selectedMessage.email}`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate block">
                          {selectedMessage.email}
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-400 text-xs">
                      No email address provided by user for this submission.
                    </div>
                  )}
                  {selectedMessage.phone && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                      <Phone className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Phone</p>
                        <a href={`tel:${selectedMessage.phone}`} className="text-sm text-slate-900 dark:text-white">
                          {selectedMessage.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                    <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Received</p>
                      <p className="text-sm text-slate-900 dark:text-white">{formatDate(selectedMessage.created_at)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Message</p>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {selectedMessage.message}
                  </div>
                </div>

                {selectedMessage.email && (
                  <div className="mt-6 space-y-2">
                    <button
                      onClick={() => openReplyModal(selectedMessage)}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-sm"
                    >
                      <Mail className="w-4 h-4" />
                      Compose Email Reply
                    </button>
                    <a
                      href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent(`Re: Inquiry from ${selectedMessage.name} - Braham Sama`)}&body=${encodeURIComponent(`Dear ${selectedMessage.name},\n\n`)}`}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 font-medium text-xs transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      Open in Mail Client
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-10 flex flex-col items-center justify-center text-center">
                <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Select a message to view details & reply</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admin Reply Composer Modal */}
      {isReplyOpen && selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Mail className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 dark:text-white">Reply to {selectedMessage.name}</h3>
              </div>
              <button
                onClick={() => setIsReplyOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                  Recipient Email
                </label>
                <input
                  type="text"
                  readOnly
                  value={selectedMessage.email || ''}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-800 outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={replySubject}
                  onChange={e => setReplySubject(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl text-sm border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                  Reply Message
                </label>
                <textarea
                  rows={6}
                  value={replyBody}
                  onChange={e => setReplyBody(e.target.value)}
                  className="w-full p-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl text-sm border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none font-sans"
                />
              </div>

              {replyNotification && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium ${
                    replyNotification.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                  }`}
                >
                  {replyNotification.text}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50">
              <a
                href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent(replySubject)}&body=${encodeURIComponent(replyBody)}`}
                onClick={() => {
                  setReplyNotification({ type: 'success', text: 'Opened in your mail app!' });
                  setTimeout(() => setIsReplyOpen(false), 1200);
                }}
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white font-medium"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Launch Default Mail Client
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsReplyOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={sendingReply}
                  onClick={handleSendEmailReply}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm flex items-center gap-2 shadow-sm transition-colors"
                >
                  <Send className={`w-4 h-4 ${sendingReply ? 'animate-spin' : ''}`} />
                  {sendingReply ? 'Sending Email...' : 'Send Email Reply'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

