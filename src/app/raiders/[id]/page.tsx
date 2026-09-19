'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Phone,
  Calendar,
  ShieldAlert,
  Printer,
  Trash2,
  Edit2,
  Bike,
  Building,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  X
} from 'lucide-react';
import ReportPreviewModal from '@/components/ReportPreviewModal';
import ModalPortal from '@/components/ModalPortal';

interface Payment {
  id: number;
  date: string;
  amount: number;
  receipt_no: string;
}

interface Compliance {
  id: number;
  date: string;
  subject: string;
  details: string;
  status: string;
}

interface Raider {
  id: number;
  name: string;
  phone: string;
  address: string;
  date_of_appointment: string;
  govt_id: string;
  guarantor_name: string;
  guarantor_phone: string;
  guarantor_gov_id: string;
  tempo_reg_no: string;
  plate_no: string;
  date_of_purchase: string;
  duration_of_completion: string;
  amount: number;
  passport_url?: string;
  surety_name?: string | null;
  surety_phone?: string | null;
  md_leader_id?: number | null;
  md_leader_name?: string | null;
  client_id?: number | null;
  client_name?: string | null;
  payments?: Payment[];
  compliance?: Compliance[];
}

export default function RaiderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [raider, setRaider] = useState<Raider | null>(null);
  const [managers, setManagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [newMgrId, setNewMgrId] = useState<string>('');
  const [isChangingMgr, setIsChangingMgr] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchRaiderDetails();
    fetchManagers();
  }, [id]);

  async function fetchRaiderDetails() {
    try {
      setLoading(true);
      const res = await fetch(`/api/raiders/${id}`);
      if (res.ok) {
        const data = await res.json();
        setRaider(data);
        setNewMgrId(data.md_leader_id ? data.md_leader_id.toString() : '');
      } else {
        setRaider(null);
      }
    } catch (err) {
      console.error('Error fetching raider details:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchManagers() {
    try {
      const res = await fetch('/api/md-leaders');
      if (res.ok) {
        const data = await res.json();
        setManagers(data);
      }
    } catch (err) {
      console.error('Error fetching managers:', err);
    }
  }

  const handleChangeManager = async () => {
    if (!raider) return;
    try {
      setIsChangingMgr(true);
      const res = await fetch(`/api/raiders/${raider.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          md_leader_id: newMgrId === '' ? null : Number(newMgrId),
        }),
      });
      if (res.ok) {
        await fetchRaiderDetails();
      } else {
        const errData = await res.json();
        alert('Failed to reassign manager: ' + (errData.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error updating manager:', err);
      alert('Error updating manager.');
    } finally {
      setIsChangingMgr(false);
    }
  };

  const handleDeleteRaider = async () => {
    if (!raider) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/raiders/${raider.id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/raiders');
      } else {
        alert('Failed to delete raider record.');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting raider record.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
          <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold">Loading Raider Profile...</span>
        </div>
      </div>
    );
  }

  if (!raider) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Link
            href="/raiders"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Raiders
          </Link>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Raider Record Not Found</h2>
            <p className="text-sm text-slate-500">The requested raider record does not exist or has been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
      <div className=" mx-auto space-y-6">
        {/* Top Header / Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <Link
              href="/raiders"
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95"
              title="Back to Raiders"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {raider.name}
                </h1>
                {raider.plate_no && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {raider.plate_no}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Raider File ID: #{raider.id} • Appointed: {raider.date_of_appointment || 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowReportModal(true)}
              className="bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs px-3.5 sm:px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
              title="Print / Export Report"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print / Export</span>
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-3 sm:px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
              title="Delete Raider"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Delete Raider</span>
            </button>
          </div>
        </div>

        {/* Main Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Photo & Core Info */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="flex flex-col items-center text-center space-y-3 pb-6 border-b border-slate-150 dark:border-slate-850">
              {raider.passport_url ? (
                <img
                  src={raider.passport_url}
                  alt={raider.name}
                  className="w-36 h-36 rounded-2xl object-cover border-2 border-cyan-500/40 shadow-xl"
                />
              ) : (
                <div className="w-36 h-36 rounded-2xl bg-slate-100 dark:bg-slate-955 flex items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-800">
                  <User className="w-14 h-14" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{raider.name}</h3>
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider">
                  Raider Passport ID
                </span>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-150 dark:border-slate-850">
                <span className="font-semibold text-slate-500 dark:text-slate-400">Phone Number:</span>
                <span className="font-bold text-slate-800 dark:text-white">{raider.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-150 dark:border-slate-850">
                <span className="font-semibold text-slate-500 dark:text-slate-400">Government ID:</span>
                <span className="font-bold text-slate-800 dark:text-white">{raider.govt_id || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-150 dark:border-slate-850">
                <span className="font-semibold text-slate-500 dark:text-slate-400">Appointment Date:</span>
                <span className="font-bold text-slate-800 dark:text-white">{raider.date_of_appointment || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-150 dark:border-slate-850">
                <span className="font-semibold text-slate-500 dark:text-slate-400">Assigned Manager:</span>
                <span className="font-bold text-slate-800 dark:text-white">{raider.md_leader_name || 'None'}</span>
              </div>

              {/* Reassign Manager Widget */}
              <div className="pt-2 pb-1 space-y-2 border-b border-slate-150 dark:border-slate-850">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Edit2 className="w-3 h-3" /> Reassign Manager
                </span>
                <div className="flex gap-2">
                  <select
                    value={newMgrId}
                    onChange={(e) => setNewMgrId(e.target.value)}
                    className="flex-1 bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-xs"
                  >
                    <option value="">-- No Manager / Unassign --</option>
                    {managers.map((m: any) => (
                      <option key={m.id} value={m.id}>
                        {m.name} {m.tempo_account ? `(${m.tempo_account})` : ''}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={isChangingMgr || (newMgrId === '' && !raider.md_leader_id) || (Number(newMgrId) === raider.md_leader_id)}
                    onClick={handleChangeManager}
                    className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-white font-semibold text-xs px-3.5 py-1.5 rounded-xl transition-all shadow-sm active:scale-95"
                  >
                    {isChangingMgr ? '...' : 'Apply'}
                  </button>
                </div>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-150 dark:border-slate-850">
                <span className="font-semibold text-slate-500 dark:text-slate-400">Assigned Client:</span>
                <span className="font-bold text-slate-800 dark:text-white">{raider.client_name || 'None'}</span>
              </div>

              <div className="flex flex-col py-1">
                <span className="font-semibold text-slate-500 dark:text-slate-400">Home Address:</span>
                <span className="text-slate-800 dark:text-white mt-1 leading-relaxed">{raider.address || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Asset Details, Guarantor, Payments & Compliance */}
          <div className="lg:col-span-2 space-y-6">
            {/* Top Cards: Guarantor & Asset Specifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Guarantor & Surety */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm">
                <h4 className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>Asset Guarantor & Surety</span>
                </h4>
                <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  <p><strong>Guarantor:</strong> {raider.guarantor_name || 'N/A'} ({raider.guarantor_phone || 'N/A'})</p>
                  <p><strong>Guarantor ID:</strong> {raider.guarantor_gov_id || 'N/A'}</p>
                </div>
                <hr className="border-slate-200 dark:border-slate-800 my-2" />
                <div className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Shortee Surety</p>
                  <p><strong>Name:</strong> {raider.surety_name || 'N/A'}</p>
                  <p><strong>Phone:</strong> {raider.surety_phone || 'N/A'}</p>
                </div>
              </div>

              {/* Asset Specifications */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm">
                <h4 className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Bike className="w-4 h-4" />
                  <span>Asset Specifications</span>
                </h4>
                <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  <p><strong>Plate Number:</strong> {raider.plate_no || 'N/A'}</p>
                  <p><strong>Tempo Reg:</strong> {raider.tempo_reg_no || 'N/A'}</p>
                  <p><strong>Purchase Date:</strong> {raider.date_of_purchase || 'N/A'}</p>
                  <p><strong>Contract Terms:</strong> {raider.duration_of_completion || 'N/A'}</p>
                  <p><strong>Asset Cost:</strong> <span className="text-emerald-600 dark:text-emerald-400 font-bold">₦{raider.amount ? Number(raider.amount).toLocaleString() : 'N/A'}</span></p>
                </div>
              </div>
            </div>

            {/* Bottom Cards: Returns/Payments & Compliance History */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Returns/Payments History */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm">
                <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>Returns / Payments History</span>
                </h4>
                {!raider.payments || raider.payments.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">No payment logs recorded yet.</p>
                ) : (
                  <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                    {raider.payments.map((pay) => (
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

              {/* Queries & Compliance History */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm">
                <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Queries & Compliance History</span>
                </h4>
                {!raider.compliance || raider.compliance.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">No compliance logs issued.</p>
                ) : (
                  <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                    {raider.compliance.map((comp) => (
                      <div
                        key={comp.id}
                        className="p-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs space-y-1"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{comp.subject}</span>
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${comp.status === 'Resolved'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                              }`}
                          >
                            {comp.status}
                          </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{comp.details}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Preview Modal */}
      {raider && (
        <ReportPreviewModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          title="Raider Asset Profile Report"
          passportUrl={raider.passport_url}
          recordData={[
            { label: 'Raider Name', value: raider.name },
            { label: 'Phone Number', value: raider.phone },
            { label: 'Appointment Date', value: raider.date_of_appointment },
            { label: 'Assigned Manager', value: raider.md_leader_name || 'None' },
            { label: 'Assigned Client', value: raider.client_name || 'None' },
            { label: 'Home Address', value: raider.address },
            { label: 'Government ID', value: raider.govt_id },
            { label: 'Plate Number', value: raider.plate_no },
            { label: 'Tempo Reg No', value: raider.tempo_reg_no },
            { label: 'Guarantor Name', value: raider.guarantor_name },
            { label: 'Guarantor Phone', value: raider.guarantor_phone },
            { label: 'Surety Name', value: raider.surety_name || 'N/A' },
            { label: 'Surety Phone', value: raider.surety_phone || 'N/A' },
            { label: 'Purchase Date', value: raider.date_of_purchase },
            { label: 'Duration Terms', value: raider.duration_of_completion },
            { label: 'Asset Cost', value: raider.amount ? `₦${Number(raider.amount).toLocaleString()}` : 'N/A' },
          ]}
          payments={raider.payments}
          compliance={raider.compliance}
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
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Raider File?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Are you sure you want to delete <strong className="text-slate-800 dark:text-slate-200">&quot;{raider.name}&quot;</strong>?
                  This action cannot be undone and will permanently remove all associated record logs.
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
                  onClick={handleDeleteRaider}
                  className="w-1/2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-rose-500/20 active:scale-95 flex items-center justify-center gap-1.5"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete Raider'}
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
