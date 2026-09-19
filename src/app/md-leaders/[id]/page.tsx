'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Phone,
  Calendar,
  Printer,
  Trash2,
  Edit2,
  ClipboardList,
  Save,
  AlertTriangle,
  X,
  Bike
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
  created_at?: string;
  payments?: Payment[];
  raiders?: AssignedRaider[];
}

export default function MDLeaderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [leader, setLeader] = useState<MDLeader | null>(null);
  const [loading, setLoading] = useState(true);

  // Portal Credentials state
  const [credUsername, setCredUsername] = useState('');
  const [credPassword, setCredPassword] = useState('');
  const [isUpdatingCreds, setIsUpdatingCreds] = useState(false);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', tempo_account: '', reports: '' });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete & Report Modal States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchLeaderDetails();
  }, [id]);

  async function fetchLeaderDetails() {
    try {
      setLoading(true);
      const res = await fetch(`/api/md-leaders/${id}`);
      if (res.ok) {
        const data = await res.json();
        setLeader(data);
        setCredUsername(data.username || '');
      } else {
        setLeader(null);
      }
    } catch (err) {
      console.error('Error fetching manager details:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateCredentials = async () => {
    if (!leader) return;
    setIsUpdatingCreds(true);
    try {
      const res = await fetch(`/api/md-leaders/${leader.id}/credentials`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: credUsername,
          password: credPassword || undefined
        })
      });
      if (res.ok) {
        alert('Manager credentials updated successfully.');
        setCredPassword('');
        fetchLeaderDetails();
      } else {
        const errData = await res.json();
        alert('Failed to update credentials: ' + (errData.message || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Error updating credentials.');
    } finally {
      setIsUpdatingCreds(false);
    }
  };

  const handleOpenEditManager = () => {
    if (!leader) return;
    setEditForm({
      name: leader.name || '',
      phone: leader.phone || '',
      tempo_account: leader.tempo_account || '',
      reports: leader.reports || '',
    });
    setShowEditModal(true);
  };

  const handleSaveEditManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leader) return;
    setIsSavingEdit(true);
    try {
      const res = await fetch(`/api/md-leaders/${leader.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setShowEditModal(false);
        fetchLeaderDetails();
      } else {
        const errData = await res.json();
        alert('Failed to update manager: ' + (errData.message || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Error updating manager.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteLeader = async () => {
    if (!leader) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/md-leaders/${leader.id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/md-leaders');
      } else {
        alert('Failed to delete manager record.');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting manager record.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
          <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold">Loading Manager File...</span>
        </div>
      </div>
    );
  }

  if (!leader) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-2">
        <div className="max-w-4xl mx-auto space-y-6">
          <Link
            href="/md-leaders"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Managers
          </Link>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Manager Record Not Found</h2>
            <p className="text-sm text-slate-500">The requested manager record does not exist or has been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-4">
      <div className="mx-auto space-y-6">
        {/* Top Header Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <Link
              href="/md-leaders"
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95"
              title="Back to Managers"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {leader.name}
                </h1>
                {leader.tempo_account && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                    {leader.tempo_account}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manager File ID: #{leader.id} • Registered: {leader.created_at ? new Date(leader.created_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenEditManager}
              className="bg-amber-500 hover:bg-amber-400 text-white font-semibold text-xs px-3.5 sm:px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
              title="Edit Manager"
            >
              <Edit2 className="w-4 h-4" />
              <span className="hidden sm:inline">Edit Manager</span>
            </button>

            <button
              onClick={() => setShowReportModal(true)}
              className="bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs px-3.5 sm:px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
              title="Print / Export"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print / Export</span>
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-3 sm:px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
              title="Delete Manager"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        </div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Core Info & Portal Credentials */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="space-y-4 text-xs">
              <h3 className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider flex items-center gap-1.5">
                <ClipboardList className="w-4 h-4" />
                <span>Manager Profile</span>
              </h3>

              <div className="space-y-3 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
                <div className="flex justify-between py-1 border-b border-slate-150 dark:border-slate-850">
                  <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> Phone Number:
                  </span>
                  <span className="font-bold text-slate-800 dark:text-white">{leader.phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-150 dark:border-slate-850">
                  <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <User className="w-3.5 h-3.5" /> Tempo Account:
                  </span>
                  <span className="font-bold text-slate-800 dark:text-white">{leader.tempo_account || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Bike className="w-3.5 h-3.5" /> Assigned Squad:
                  </span>
                  <span className="font-bold text-slate-800 dark:text-white">{leader.raiders?.length || 0} Raiders</span>
                </div>
              </div>

              {/* Portal Access Credentials Card */}
              <div className="border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-3 bg-slate-50 dark:bg-slate-955">
                <h4 className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>Portal Access Credentials</span>
                </h4>
                <div className="space-y-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Username</label>
                    <input
                      type="text"
                      value={credUsername}
                      onChange={(e) => setCredUsername(e.target.value)}
                      className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-xs"
                      placeholder="Configure login username"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">New Password</label>
                    <input
                      type="password"
                      value={credPassword}
                      onChange={(e) => setCredPassword(e.target.value)}
                      className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-xs"
                      placeholder="Leave blank to keep current"
                    />
                  </div>
                </div>
                <button
                  onClick={handleUpdateCredentials}
                  disabled={isUpdatingCreds}
                  className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs py-2 rounded-xl transition-all shadow-md active:scale-95"
                >
                  {isUpdatingCreds ? 'Updating...' : 'Save Portal Credentials'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Operational Reports, Squad Raiders, Collections */}
          <div className="lg:col-span-2 space-y-6">
            {/* Operational Reports */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm">
              <h4 className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                Operational Reports & Remarks
              </h4>
              <div className="bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 p-4 rounded-xl text-xs text-slate-800 dark:text-slate-300 min-h-[90px] whitespace-pre-wrap leading-relaxed">
                {leader.reports || 'No operational reports filed.'}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Assigned Raiders Squad */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm">
                <h4 className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Assigned Raiders Squad</span>
                  <span className="text-[10px] bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/20 font-bold">
                    {leader.raiders?.length || 0}
                  </span>
                </h4>
                {!leader.raiders || leader.raiders.length === 0 ? (
                  <p className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-955 p-3 rounded-xl">
                    No raiders assigned to this manager squad yet.
                  </p>
                ) : (
                  <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                    {leader.raiders.map((r) => (
                      <Link
                        key={r.id}
                        href={`/raiders/${r.id}`}
                        className="p-3 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 hover:border-violet-500/40 rounded-xl text-xs flex justify-between items-center transition-all group"
                      >
                        <span className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-violet-600 dark:group-hover:text-violet-400">
                          🏍️ {r.name}
                        </span>
                        <span className="text-[10px] bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20 font-medium">
                          {r.plate_no || r.tempo_reg_no || 'No Plate'}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Collections History */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm">
                <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Collections History
                </h4>
                {!leader.payments || leader.payments.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">No payment logs recorded yet.</p>
                ) : (
                  <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                    {leader.payments.map((pay) => (
                      <div
                        key={pay.id}
                        className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                      >
                        <span className="text-slate-600 dark:text-slate-300">
                          📅 {pay.date} (Rec: {pay.receipt_no})
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          ₦{Number(pay.amount).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Manager Modal */}
      {showEditModal && (
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
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Edit Manager Information</h3>
                    <p className="text-[10px] text-slate-400">{leader.name}</p>
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
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Operational Reports / Notes</label>
                  <textarea
                    rows={3}
                    value={editForm.reports}
                    onChange={(e) => setEditForm(prev => ({ ...prev, reports: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-xs"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    disabled={isSavingEdit}
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="bg-amber-500 hover:bg-amber-400 text-white font-semibold text-xs px-5 py-2 rounded-xl shadow-md flex items-center gap-1.5"
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

      {/* Report Preview Modal */}
      {leader && (
        <ReportPreviewModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          title="Manager Profile Report"
          recordData={[
            { label: 'Manager Name', value: leader.name },
            { label: 'Phone Number', value: leader.phone },
            { label: 'Tempo Account Code', value: leader.tempo_account },
            { label: 'Portal Username', value: leader.username || 'Not set' },
            { label: 'Operational Reports', value: leader.reports },
          ]}
          tables={[
            {
              title: 'Assigned Raiders Squad',
              headers: ['Raider Name', 'Registration / Plate'],
              rows: (leader.raiders || []).map(r => [
                r.name,
                r.plate_no || r.tempo_reg_no || 'N/A'
              ])
            },
            {
              title: 'Collections History',
              headers: ['Date', 'Receipt No', 'Amount'],
              rows: (leader.payments || []).map(p => [
                p.date,
                p.receipt_no,
                `₦${Number(p.amount).toLocaleString()}`
              ])
            }
          ]}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <ModalPortal>
          <div
            className="fixed inset-0 bg-slate-900/60 dark:bg-slate-955/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4"
            onClick={() => !isDeleting && setShowDeleteModal(false)}
          >
            <div
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5 text-center my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-955/60 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center mx-auto text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Manager File?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Are you sure you want to delete <strong className="text-slate-800 dark:text-slate-200">&quot;{leader.name}&quot;</strong>?
                  This action cannot be undone and will unassign all raiders under this manager squad.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setShowDeleteModal(false)}
                  className="w-1/2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDeleteLeader}
                  className="w-1/2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-rose-500/20 active:scale-95 flex items-center justify-center gap-1.5"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete Manager'}
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
