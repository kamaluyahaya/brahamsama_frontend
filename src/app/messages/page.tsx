'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Search, Trash2, Mail, Phone, User, RefreshCw, Calendar } from 'lucide-react';

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
            Contact Messages
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Messages submitted from the public-facing contact form.
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
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span className="text-xs text-slate-400 dark:text-slate-500">{formatDate(msg.created_at)}</span>
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
                  {selectedMessage.email && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                      <Mail className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Email</p>
                        <a href={`mailto:${selectedMessage.email}`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                          {selectedMessage.email}
                        </a>
                      </div>
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
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: Your message to Braham Sama`}
                    className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    Reply via Email
                  </a>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-10 flex flex-col items-center justify-center text-center">
                <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Select a message to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
