'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  ClipboardList, 
  Plus, 
  Eye, 
  Save, 
  Trash2, 
  X, 
  Search,
  Phone,
  User,
  Printer,
  Edit2,
  Bike,
  CheckSquare,
  Square,
  AlertTriangle,
  ArrowRightLeft,
  Lock,
  Unlock
} from 'lucide-react';
import ReportPreviewModal from '@/components/ReportPreviewModal';
import ModalPortal from '@/components/ModalPortal';

interface Payment {
  id: number;
  date: string;
  amount: number;
  receipt_no: string;
}

interface AssignedRaider {
  id: number;
  name: string;
  plate_no?: string;
  tempo_reg_no?: string;
}

interface MDLeader {
  id: number;
  name: string;
  phone: string;
  tempo_account: string;
  reports: string;
  username?: string;
  password?: string;
  created_at?: string;
  assigned_vehicles_count?: number;
  payments?: Payment[];
  raiders?: AssignedRaider[];
}

export default function MDLeadersPage() {
  const [leaders, setLeaders] = useState<MDLeader[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLeader, setSelectedLeader] = useState<MDLeader | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  // Assign Vehicles Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningLeader, setAssigningLeader] = useState<MDLeader | null>(null);
  const [allRaiders, setAllRaiders] = useState<any[]>([]);
  const [selectedRaiderIds, setSelectedRaiderIds] = useState<number[]>([]);
  const [isSavingAssign, setIsSavingAssign] = useState(false);
  const [pendingReassignRaider, setPendingReassignRaider] = useState<any | null>(null);
  const [assignModalTab, setAssignModalTab] = useState<'available' | 'unavailable' | 'all'>('available');

  const handleOpenAssignModal = async (leader: MDLeader) => {
    setAssigningLeader(leader);
    setIsSavingAssign(false);
    setPendingReassignRaider(null);
    setAssignModalTab('available');
    try {
      const [raidersRes, leaderDetailRes] = await Promise.all([
        fetch('/api/raiders'),
        fetch(`/api/md-leaders/${leader.id}`)
      ]);
      const raidersData = raidersRes.ok ? await raidersRes.json() : [];
      const leaderData = leaderDetailRes.ok ? await leaderDetailRes.json() : null;

      setAllRaiders(raidersData);
      if (leaderData && leaderData.raiders) {
        setSelectedRaiderIds(leaderData.raiders.map((r: any) => r.id));
      } else {
        setSelectedRaiderIds([]);
      }
      setShowAssignModal(true);
    } catch (err) {
      console.error(err);
      alert('Error loading vehicles list');
    }
  };

  const handleToggleRaider = (id: number) => {
    setSelectedRaiderIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleRaiderItemClick = (r: any) => {
    if (!assigningLeader) return;
    const isCurrentlyChecked = selectedRaiderIds.includes(r.id);
    const isAssignedToOther = r.md_leader_id && String(r.md_leader_id) !== String(assigningLeader.id);

    if (isAssignedToOther && !isCurrentlyChecked) {
      // Trigger warning modal for re-assignment
      setPendingReassignRaider(r);
    } else {
      // Direct toggle
      handleToggleRaider(r.id);
    }
  };

  const handleSaveVehicleAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningLeader) return;
    setIsSavingAssign(true);
    try {
      const res = await fetch(`/api/md-leaders/${assigningLeader.id}/assign-raiders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raiderIds: selectedRaiderIds })
      });
      if (res.ok) {
        alert('Vehicles & riders successfully assigned to manager!');
        setShowAssignModal(false);
        fetchLeaders();
      } else {
        const data = await res.json();
        alert('Error: ' + data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save assignment');
    } finally {
      setIsSavingAssign(false);
    }
  };

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    tempo_account: '',
    reports: '',
    username: '',
    password: '',
  });

  const [credUsername, setCredUsername] = useState('');
  const [credPassword, setCredPassword] = useState('');
  const [isUpdatingCreds, setIsUpdatingCreds] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Manager Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', tempo_account: '', reports: '' });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const handleOpenEditManager = () => {
    if (!selectedLeader) return;
    setEditForm({
      name: selectedLeader.name || '',
      phone: selectedLeader.phone || '',
      tempo_account: selectedLeader.tempo_account || '',
      reports: selectedLeader.reports || '',
    });
    setShowEditModal(true);
  };

  const handleSaveEditManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeader) return;
    setIsSavingEdit(true);
    try {
      const res = await fetch(`/api/md-leaders/${selectedLeader.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setShowEditModal(false);
        // Refresh detail
        const detailRes = await fetch(`/api/md-leaders/${selectedLeader.id}`);
        if (detailRes.ok) {
          const detailData = await detailRes.json();
          setSelectedLeader(detailData);
        }
        fetchLeaders();
      } else {
        const errData = await res.json();
        alert('Error: ' + errData.message);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update manager.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  useEffect(() => {
    fetchLeaders();
  }, [search]);

  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setShowAddModal(true);
    }
  }, [searchParams]);

  async function fetchLeaders() {
    try {
      setLoading(true);
      const res = await fetch(`/api/md-leaders?search=${encodeURIComponent(search)}`);
      if (res.ok) {
        const data = await res.json();
        setLeaders(data);
      }
    } catch (err) {
      console.error('Error fetching leaders:', err);
    } finally {
      setLoading(false);
    }
  }

  const router = useRouter();

  function viewLeaderDetails(id: number) {
    router.push(`/md-leaders/${id}`);
  }

  const handleUpdateCredentials = async () => {
    if (!selectedLeader) return;
    setIsUpdatingCreds(true);
    try {
      const res = await fetch(`/api/md-leaders/${selectedLeader.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: credUsername,
          password: credPassword || undefined,
        }),
      });

      if (res.ok) {
        alert('Manager credentials successfully updated!');
        const detailsRes = await fetch(`/api/md-leaders/${selectedLeader.id}`);
        if (detailsRes.ok) {
          const detailsData = await detailsRes.json();
          setSelectedLeader(detailsData);
        }
      } else {
        const errData = await res.json();
        alert('Error: ' + errData.message);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update credentials');
    } finally {
      setIsUpdatingCreds(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return alert('Name is required');

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/md-leaders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowAddModal(false);
        setFormData({
          name: '',
          phone: '',
          tempo_account: '',
          reports: '',
          username: '',
          password: '',
        });
        fetchLeaders();
      } else {
        const errData = await res.json();
        alert('Error: ' + errData.message);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save manager record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteLeader = async (id: number) => {
    if (!confirm('Are you sure you want to delete this leader record?')) return;
    try {
      const res = await fetch(`/api/md-leaders/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchLeaders();
        setShowDetailModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg md:text-xl font-bold tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-violet-500" />
          <span>Managers</span>
        </h2>
        <button 
          className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-violet-500/10 flex items-center gap-2 text-sm"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="w-4 h-4" />
          <span>Add Manager</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm relative flex items-center">
        <Search className="w-4 h-4 text-slate-400 absolute left-8 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by manager name, phone, or Tempo Account..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800/80 rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 text-sm"
        />
      </div>

      {/* Leaders Table */}
      <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm">
        {loading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading manager files...</p>
        ) : leaders.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">No managers found. Click 'Add Manager' to register one.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800/80">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm">
              <thead className="bg-slate-105 dark:bg-slate-950">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider">Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider">Phone No</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider">Tempo Account Code</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider">Assigned Squad Vehicles</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900/20">
                {leaders.map((leader) => (
                  <tr 
                    key={leader.id} 
                    className="hover:bg-slate-100/40 dark:hover:bg-slate-800/20 cursor-pointer transition-colors"
                    onClick={() => viewLeaderDetails(leader.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-800 dark:text-white">{leader.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-650 dark:text-slate-300">{leader.phone || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-650 dark:text-cyan-400 border border-cyan-500/20">
                        {leader.tempo_account || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Bike className="w-3.5 h-3.5" />
                        <span>{(leader.assigned_vehicles_count !== undefined && leader.assigned_vehicles_count !== null) ? leader.assigned_vehicles_count : (leader.raiders?.length || 0)} Vehicles</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenAssignModal(leader)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                          title="Assign Vehicles"
                        >
                          <Bike className="w-3.5 h-3.5" />
                          <span>Assign Vehicles</span>
                        </button>

                        <Link 
                          href={`/md-leaders/${leader.id}`}
                          className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 transition-all flex items-center gap-1.5 inline-flex"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Leader Modal */}
      {showAddModal && (
        <ModalPortal>
          <div 
            className="fixed inset-0 bg-slate-900/60 dark:bg-slate-955/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setShowAddModal(false)}
          >
            <div 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-[0.5rem] p-6 shadow-2xl space-y-6 my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Register Manager</h3>
                <button className="text-slate-400 hover:text-slate-650 dark:hover:text-white" onClick={() => setShowAddModal(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Manager Full Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm" placeholder="Full Name" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase">Phone Number</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm" placeholder="e.g. +234..." />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase">Tempo Account Identifier</label>
                  <input type="text" name="tempo_account" value={formData.tempo_account} onChange={handleInputChange} className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm" placeholder="e.g. TM/AC-1002" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Operational Reports / Notes</label>
                  <textarea name="reports" value={formData.reports} onChange={handleInputChange} className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm" placeholder="Notes, reports or remarks regarding this manager's squad" rows={4} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Portal Username (Optional)</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                      placeholder="Configure login username"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Portal Password (Optional)</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                      placeholder="Configure login password"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-800 pt-6">
                  <button type="button" className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2" disabled={isSubmitting}>
                    <Save className="w-4 h-4" />
                    <span>{isSubmitting ? 'Saving...' : 'Register Manager'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Edit Manager Modal */}
      {showEditModal && selectedLeader && (
        <ModalPortal>
          <div
            className="fixed inset-0 bg-slate-900/60 dark:bg-slate-955/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => !isSavingEdit && setShowEditModal(false)}
          >
            <div
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-600">
                    <Edit2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Edit Manager</h3>
                    <p className="text-[10px] text-slate-400">{selectedLeader.name}</p>
                  </div>
                </div>
                <button onClick={() => setShowEditModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEditManager} className="p-6 space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Tempo Account Code</label>
                  <input
                    type="text"
                    value={editForm.tempo_account}
                    onChange={(e) => setEditForm(prev => ({ ...prev, tempo_account: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-xs"
                    placeholder="e.g. TM/AC-1002"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Operational Reports / Notes</label>
                  <textarea
                    rows={4}
                    value={editForm.reports}
                    onChange={(e) => setEditForm(prev => ({ ...prev, reports: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-xs resize-none"
                    placeholder="Operational notes about this manager..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    disabled={isSavingEdit}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="bg-amber-500 hover:bg-amber-400 text-white font-semibold text-xs px-6 py-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {isSavingEdit ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

      {selectedLeader && (
        <ReportPreviewModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          title="Manager Squad Report"
          recordData={[
            { label: 'Manager Name', value: selectedLeader.name },
            { label: 'Phone Number', value: selectedLeader.phone },
            { label: 'Tempo Account', value: selectedLeader.tempo_account },
            { label: 'Operational Reports', value: selectedLeader.reports || 'No reports filed.' },
          ]}
          tables={[
            {
              title: 'Assigned Raiders Squad',
              headers: ['Raider Name', 'Tempo Reg No'],
              rows: (selectedLeader.raiders || []).map(r => [
                r.name,
                r.tempo_reg_no || 'No Tempo'
              ])
            },
            {
              title: 'Collections / Payments History',
              headers: ['Date', 'Receipt No', 'Amount Collected'],
              rows: (selectedLeader.payments || []).map(p => [
                p.date,
                p.receipt_no,
                `₦${p.amount.toLocaleString()}`
              ])
            }
          ]}
        />
      )}

      {/* Assign Vehicles Modal */}
      {showAssignModal && assigningLeader && (() => {
        const availableRaiders = allRaiders.filter(
          r => !r.md_leader_id || String(r.md_leader_id) === String(assigningLeader.id)
        );
        const unavailableRaiders = allRaiders.filter(
          r => r.md_leader_id && String(r.md_leader_id) !== String(assigningLeader.id)
        );

        const displayedRaiders = 
          assignModalTab === 'available' ? availableRaiders :
          assignModalTab === 'unavailable' ? unavailableRaiders : allRaiders;

        return (
          <ModalPortal>
            <div
              className="fixed inset-0 bg-slate-900/60 dark:bg-slate-955/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 overflow-y-auto"
              onClick={() => !isSavingAssign && setShowAssignModal(false)}
            >
              <div
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-2xl p-6 shadow-2xl space-y-5 my-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Bike className="w-5 h-5 text-emerald-500" />
                      <span>Assign Squad Vehicles &amp; Riders ({assigningLeader.name})</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Each vehicle/rider can belong to strictly <strong>one manager</strong> for daily returns collection.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-slate-400 hover:text-slate-650 dark:hover:text-white"
                    onClick={() => !isSavingAssign && setShowAssignModal(false)}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 bg-slate-100 dark:bg-slate-955 p-1 rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setAssignModalTab('available')}
                    className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      assignModalTab === 'available'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Available ({availableRaiders.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssignModalTab('unavailable')}
                    className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      assignModalTab === 'unavailable'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Assigned to Others ({unavailableRaiders.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssignModalTab('all')}
                    className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      assignModalTab === 'all'
                        ? 'bg-slate-700 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>All ({allRaiders.length})</span>
                  </button>
                </div>

                {assignModalTab === 'unavailable' && (
                  <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] p-3 rounded-xl flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                    <div>
                      <strong>Reassignment Notice:</strong> Tapping an unavailable vehicle will prompt a confirmation to reassign it from its current manager to <strong>{assigningLeader.name}</strong>.
                    </div>
                  </div>
                )}

                <form onSubmit={handleSaveVehicleAssignment} className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      Selected for {assigningLeader.name}: <span className="text-emerald-600 dark:text-emerald-400">{selectedRaiderIds.length} vehicle(s)</span>
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedRaiderIds(availableRaiders.map(r => r.id))}
                        className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        Select All Available
                      </button>
                      <span className="text-slate-300 dark:text-slate-700">|</span>
                      <button
                        type="button"
                        onClick={() => setSelectedRaiderIds([])}
                        className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1 border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-955/30">
                    {displayedRaiders.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-6">
                        No vehicles found in this category.
                      </p>
                    ) : (
                      displayedRaiders.map((r) => {
                        const isChecked = selectedRaiderIds.includes(r.id);
                        const hasOtherManager = r.md_leader_id && String(r.md_leader_id) !== String(assigningLeader.id);

                        return (
                          <div
                            key={r.id}
                            onClick={() => handleRaiderItemClick(r)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                              isChecked
                                ? 'bg-emerald-500/10 border-emerald-500/40 dark:bg-emerald-950/20 shadow-sm'
                                : hasOtherManager
                                ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-400/40 dark:bg-amber-950/10'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={isChecked ? 'text-emerald-600 dark:text-emerald-400' : hasOtherManager ? 'text-amber-500' : 'text-slate-400'}>
                                {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-slate-800 dark:text-white flex flex-wrap items-center gap-2">
                                  <span>🏍️ {r.name}</span>
                                  {hasOtherManager ? (
                                    <span className="text-[9px] bg-amber-500/15 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-semibold flex items-center gap-1">
                                      <Lock className="w-2.5 h-2.5" />
                                      Assigned to: {r.md_leader_name || `Manager #${r.md_leader_id}`}
                                    </span>
                                  ) : !r.md_leader_id ? (
                                    <span className="text-[9px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-semibold flex items-center gap-1">
                                      <Unlock className="w-2.5 h-2.5" />
                                      Unassigned
                                    </span>
                                  ) : (
                                    <span className="text-[9px] bg-blue-500/15 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30 font-semibold">
                                      Current Manager
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  Plate: {r.plate_no || 'N/A'} &bull; Chassis: {r.chassis || 'N/A'} {r.client_name ? `&bull; Client: ${r.client_name}` : ''}
                                </div>
                              </div>
                            </div>
                            {r.amount ? (
                              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 shrink-0">
                                ₦{Number(r.amount).toLocaleString()}
                              </span>
                            ) : null}
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowAssignModal(false)}
                      disabled={isSavingAssign}
                      className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingAssign}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-6 py-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {isSavingAssign ? 'Saving Assignment...' : 'Save Vehicle Assignment'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </ModalPortal>
        );
      })()}

      {/* Reassignment Warning Modal */}
      {pendingReassignRaider && assigningLeader && (
        <ModalPortal>
          <div
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[100000] flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setPendingReassignRaider(null)}
          >
            <div
              className="bg-white dark:bg-slate-900 border border-amber-500/30 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="p-2.5 bg-amber-500/10 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">
                    Reassign Vehicle &amp; Rider?
                  </h4>
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                    Manager Transfer Warning
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-955 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <p className="leading-relaxed">
                  Vehicle/Rider <strong className="text-slate-900 dark:text-white">{pendingReassignRaider.name}</strong> ({pendingReassignRaider.plate_no ? `Plate: ${pendingReassignRaider.plate_no}` : 'No Plate'}) is currently assigned to another manager.
                </p>

                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-800 dark:text-amber-300 font-medium">
                    <span className="text-[11px]">Current Manager:</span>
                    <span className="font-bold">{pendingReassignRaider.md_leader_name || `Manager #${pendingReassignRaider.md_leader_id}`}</span>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 py-0.5 text-slate-400 dark:text-slate-500">
                    <ArrowRightLeft className="w-4 h-4 text-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Reassigning To</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-800 dark:text-emerald-300 font-medium">
                    <span className="text-[11px]">New Manager:</span>
                    <span className="font-bold">{assigningLeader.name}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 italic">
                  Continuing will remove this vehicle from <strong>{pendingReassignRaider.md_leader_name || 'its current manager'}</strong> and assign it to <strong>{assigningLeader.name}</strong> upon saving.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPendingReassignRaider(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleToggleRaider(pendingReassignRaider.id);
                    setPendingReassignRaider(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  Continue &amp; Reassign
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
