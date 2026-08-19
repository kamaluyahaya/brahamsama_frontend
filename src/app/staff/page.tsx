'use client';

import React, { useState, useEffect } from 'react';
import { Users, User, Plus, Trash2, X, Search, ShieldAlert, KeyRound, Save } from 'lucide-react';

interface Staff {
  id: number;
  name: string;
  username: string;
  role: string;
  phone?: string | null;
  email?: string | null;
  created_at?: string;
}

export default function StaffPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals & Forms
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'Staff',
    phone: '',
    email: '',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        setCurrentUser(userObj);
        if (userObj.role === 'Admin') {
          fetchStaff();
        }
      }
    }
  }, [search]);

  async function fetchStaff() {
    try {
      setLoading(true);
      const res = await fetch('/api/staff');
      if (res.ok) {
        const data = await res.json();
        // Filter locally by search query
        const filtered = data.filter((s: Staff) => 
          s.name.toLowerCase().includes(search.toLowerCase()) || 
          s.username.toLowerCase().includes(search.toLowerCase()) || 
          (s.email && s.email.toLowerCase().includes(search.toLowerCase()))
        );
        setStaffList(filtered);
      }
    } catch (err) {
      console.error('Error fetching staff list:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.username || !formData.password || !formData.role) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }

    if (formData.password.length < 5) {
      setError('Password must be at least 5 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setShowAddModal(false);
        setFormData({
          name: '',
          username: '',
          password: '',
          role: 'Staff',
          phone: '',
          email: '',
        });
        fetchStaff();
      } else {
        setError(data.message || 'Failed to register staff.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection to operations servers failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteStaff = async (id: number, username: string) => {
    if (username === 'admin') {
      alert('The System Administrator account is protected and cannot be deleted.');
      return;
    }

    if (currentUser && currentUser.id === id) {
      alert('You cannot delete your own logged-in account.');
      return;
    }

    if (!confirm(`Are you sure you want to delete staff account: "${username}"?`)) return;

    try {
      const res = await fetch(`/api/staff/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchStaff();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete account.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to database.');
    }
  };

  if (!currentUser) {
    return (
      <div className="text-slate-500 dark:text-slate-400 text-sm animate-pulse">
        Connecting to Command Center security clearance...
      </div>
    );
  }

  // Admin access guard check
  if (currentUser.role !== 'Admin') {
    return (
      <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 p-6 rounded-2xl flex flex-col gap-3 max-w-2xl mt-4">
        <div className="flex items-center gap-2 font-bold text-base">
          <ShieldAlert className="w-5 h-5 text-rose-500" />
          <span>Access Clearance Level Required</span>
        </div>
        <p className="text-sm leading-relaxed">
          You are currently signed in with a **Staff** access account. Only registered **System Administrators** are permitted to register, modify, or delete command center staff credentials. 
        </p>
        <p className="text-xs text-slate-500">
          If you believe this is in error, please contact Braham Sama Operations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg md:text-xl font-bold tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-violet-505" />
          <span>Staff Directory Management</span>
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-violet-600 hover:bg-violet-505 text-white font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-violet-500/10 flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Staff</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm relative flex items-center">
        <Search className="w-4 h-4 text-slate-400 absolute left-8 pointer-events-none" />
        <input
          type="text"
          placeholder="Search staff by name, username, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800/80 rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-505 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
        />
      </div>

      {/* Staff List Table */}
      <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm">
        {loading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading Staff accounts list...</p>
        ) : staffList.length === 0 ? (
          <p className="text-sm text-slate-450 dark:text-slate-550 text-center py-4">No staff members found matching search query.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800/80">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm">
              <thead className="bg-slate-100 dark:bg-slate-950">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-505 dark:text-slate-400 uppercase tracking-wider">Staff Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-505 dark:text-slate-400 uppercase tracking-wider">Username</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-505 dark:text-slate-400 uppercase tracking-wider">Clearance Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Contact Details</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900/20">
                {staffList.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/10 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-850 dark:text-white flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500 font-bold text-xs">
                        {staff.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()}
                      </div>
                      <span>{staff.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-700 dark:text-slate-300 font-mono font-semibold">{staff.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${staff.role === 'Admin'
                        ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20'
                        : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20'
                        }`}>
                        {staff.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-350 text-xs">
                      <div>📧 {staff.email || 'N/A'}</div>
                      <div className="mt-0.5">📞 {staff.phone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => deleteStaff(staff.id, staff.username)}
                        disabled={staff.username === 'admin' || (currentUser && currentUser.id === staff.id)}
                        className="bg-rose-500/10 hover:bg-rose-500 disabled:opacity-30 disabled:hover:bg-rose-500/10 disabled:text-rose-600 text-rose-600 hover:text-white text-xs font-semibold p-1.5 rounded-lg border border-rose-500/20 disabled:border-rose-500/10 transition-all"
                        title={staff.username === 'admin' ? 'Protect Admin Account' : 'Delete Account'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-[0.5rem] p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Register Operations Staff</h3>
              <button className="text-slate-400 hover:text-slate-655 dark:hover:text-white" onClick={() => setShowAddModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="bg-rose-505/10 border border-rose-505/20 text-rose-605 dark:text-rose-450 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleAddStaff} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Full Staff Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="e.g. John Doe" className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-505 dark:text-slate-400 uppercase tracking-wider">Role Clearance *</label>
                  <select name="role" value={formData.role} onChange={handleInputChange} className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-505/50 text-sm">
                    <option value="Staff">Staff (Standard Officer)</option>
                    <option value="Admin">Admin (Full Control)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Username *</label>
                  <input type="text" name="username" value={formData.username} onChange={handleInputChange} required placeholder="Login username" className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Login Password *</label>
                  <div className="relative flex items-center">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
                    <input type="password" name="password" value={formData.password} onChange={handleInputChange} required placeholder="Password credentials" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="staff@brahamsama.com" className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Phone Number</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Mobile number" className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm" />
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-800 pt-6">
                <button type="button" className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="bg-violet-600 hover:bg-violet-505 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2" disabled={isSubmitting}>
                  <Save className="w-4 h-4" />
                  <span>{isSubmitting ? 'Saving...' : 'Register Staff'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
