'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Plus, Trash2, X, Search, ShieldAlert, Save, MapPin, Phone } from 'lucide-react';
import ModalPortal from '@/components/ModalPortal';

interface Branch {
  id: number;
  name: string;
  location?: string | null;
  phone?: string | null;
  description?: string | null;
  created_at?: string;
}

export default function BranchesPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    phone: '',
    description: '',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        setCurrentUser(userObj);
        if (userObj.role === 'Admin') {
          fetchBranches();
        }
      }
    }
  }, [search]);

  async function fetchBranches() {
    try {
      setLoading(true);
      const res = await fetch('/api/branches');
      if (res.ok) {
        const data = await res.json();
        const filtered = data.filter((b: Branch) =>
          b.name.toLowerCase().includes(search.toLowerCase()) ||
          (b.location && b.location.toLowerCase().includes(search.toLowerCase()))
        );
        setBranches(filtered);
      }
    } catch (err) {
      console.error('Error fetching branches:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Branch name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setShowAddModal(false);
        setFormData({ name: '', location: '', phone: '', description: '' });
        fetchBranches();
      } else {
        setError(data.message || 'Failed to register branch.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection to operations servers failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteBranch = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete branch: "${name}"? Clients assigned to this branch will be unlinked.`)) return;

    try {
      const res = await fetch(`/api/branches/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchBranches();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete branch.');
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

  if (currentUser.role !== 'Admin') {
    return (
      <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 p-6 rounded-2xl flex flex-col gap-3 max-w-2xl mt-4">
        <div className="flex items-center gap-2 font-bold text-base">
          <ShieldAlert className="w-5 h-5 text-rose-500" />
          <span>Access Clearance Level Required</span>
        </div>
        <p className="text-sm leading-relaxed">
          You are currently signed in with a **Staff** access account. Only registered **System Administrators** are permitted to register or manage company branches.
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
          <Building2 className="w-5 h-5 text-violet-500" />
          <span>Branch Administration</span>
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-violet-500/10 flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Branch</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm relative flex items-center">
        <Search className="w-4 h-4 text-slate-400 absolute left-8 pointer-events-none" />
        <input
          type="text"
          placeholder="Search branch by name or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800/80 rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
        />
      </div>

      <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm">
        {loading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading branches list...</p>
        ) : branches.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">No branches found. Click &quot;Add New Branch&quot; to register one.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800/80">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm">
              <thead className="bg-slate-100 dark:bg-slate-950">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Branch Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900/20">
                {branches.map((branch) => (
                  <tr key={branch.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/10 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-850 dark:text-white flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <span>{branch.name}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {branch.location || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 text-xs">
                      <div className="flex items-center gap-1"><Phone className="w-3 h-3" />{branch.phone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => deleteBranch(branch.id, branch.name)}
                        className="bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white text-xs font-semibold p-1.5 rounded-lg border border-rose-500/20 transition-all"
                        title="Delete Branch"
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

      {showAddModal && (
        <ModalPortal>
          <div
            className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setShowAddModal(false)}
          >
            <div
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-[0.5rem] p-6 shadow-2xl space-y-6 my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add New Branch</h3>
                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-white" onClick={() => setShowAddModal(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleAddBranch} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Branch Name *</label>
                  <div className="relative flex items-center">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="e.g. Head Office, Tudun Wada" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Location</label>
                    <div className="relative flex items-center">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
                      <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="e.g. Kano State" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Phone</label>
                    <div className="relative flex items-center">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
                      <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Branch contact" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Additional notes about this branch" rows={3} className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm" />
                </div>

                <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-800 pt-6">
                  <button type="button" className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2" disabled={isSubmitting}>
                    <Save className="w-4 h-4" />
                    <span>{isSubmitting ? 'Saving...' : 'Add Branch'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
