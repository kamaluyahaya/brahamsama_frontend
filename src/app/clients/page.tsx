'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Users,
  User,
  Plus,
  X,
  Search,
  Eye,
  Pencil,
  Edit2,
  CreditCard,
  PlusCircle,
  FileText,
  Printer
} from 'lucide-react';
import ModalPortal from '@/components/ModalPortal';

interface Client {
  id: number;
  name: string;
  phone: string;
  email_address: string;
  residential_address: string;
  office: string;
  branch_id?: number | null;
  branch_name?: string | null;
  id_details: string;
  passport_url: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  file_no: string;
  date_of_purchase: string;
  date_of_first_disbursement: string;
  final_disbursement: string;
  vehicle_type_chassis: string;
  no_of_motorcycles?: number | null;
  chassis_no?: string | null;
  total_disbursed_amount?: number | null;
  utility_charges?: number | null;
  duration_of_completion?: string | null;
  created_at?: string;
  username?: string | null;
  password?: string | null;
}

function slugify(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// ---------------------------------------------------------------------------
// Module-level client list cache.
// Persists across client-side navigations within the same session.
// Keyed by the search string so different searches are cached independently.
// ---------------------------------------------------------------------------
const _clientsCache: Record<string, Client[]> = {};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const RECORDS_PER_PAGE = 10;
  const searchParams = useSearchParams();
  const router = useRouter();

  // Motorcycle Assignment State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningClient, setAssigningClient] = useState<Client | null>(null);
  const [mcForm, setMcForm] = useState({
    file_no: '',
    vehicle_type_chassis: '',
    chassis_no: '',
    date_of_purchase: '',
    duration_of_completion: '',
    date_of_first_disbursement: '',
    final_disbursement: '',
    total_disbursed_amount: '',
    utility_charges: '',
    daily_return: ''
  });
  const [isAssigning, setIsAssigning] = useState(false);

  // ── Edit Client Modal State ─────────────────────────────────────────────
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editForm, setEditForm] = useState<Partial<Client>>({});
  const [editPassportFile, setEditPassportFile] = useState<File | null>(null);
  const [editPassportPreview, setEditPassportPreview] = useState<string | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [branches, setBranches] = useState<{ id: number; name: string }[]>([]);

  const handleOpenEdit = (client: Client) => {
    setEditingClient(client);
    setEditForm({
      name: client.name || '',
      phone: client.phone || '',
      email_address: client.email_address || '',
      residential_address: client.residential_address || '',
      office: client.office || '',
      branch_id: client.branch_id ?? null,
      id_details: client.id_details || '',
      bank_name: client.bank_name || '',
      account_name: client.account_name || '',
      account_number: client.account_number || '',
      file_no: client.file_no || '',
      date_of_purchase: client.date_of_purchase || '',
      date_of_first_disbursement: client.date_of_first_disbursement || '',
      final_disbursement: client.final_disbursement || '',
      vehicle_type_chassis: client.vehicle_type_chassis || '',
      no_of_motorcycles: client.no_of_motorcycles ?? null,
      chassis_no: client.chassis_no || '',
      total_disbursed_amount: client.total_disbursed_amount ?? null,
      utility_charges: client.utility_charges ?? null,
      duration_of_completion: client.duration_of_completion || '',
    });
    setEditPassportFile(null);
    setEditPassportPreview(null);
    if (branches.length === 0) {
      fetch('/api/branches').then(r => r.json()).then(data => setBranches(data)).catch(() => { });
    }
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    setIsSavingEdit(true);
    try {
      const fd = new FormData();
      Object.entries(editForm).forEach(([k, v]) => {
        if (v !== null && v !== undefined) fd.append(k, String(v));
      });
      if (editPassportFile) fd.append('passport', editPassportFile);
      const res = await fetch(`/api/clients/${editingClient.id}`, {
        method: 'PUT',
        body: fd,
      });
      if (res.ok) {
        setShowEditModal(false);
        setEditingClient(null);
        // Invalidate cache and refresh list
        Object.keys(_clientsCache).forEach((k) => delete _clientsCache[k]);
        sessionStorage.setItem('dashboard_stats_cache_dirty', 'true');
        fetchClients(true);
      } else {
        const data = await res.json();
        alert('Error: ' + data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update client.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleAssignMotorcycle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningClient) return;
    setIsAssigning(true);
    try {
      const res = await fetch(`/api/clients/${assigningClient.id}/motorcycles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mcForm)
      });
      if (res.ok) {
        alert('Tricycle successfully assigned to client!');
        setShowAssignModal(false);
        setAssigningClient(null);
        setMcForm({
          file_no: '',
          vehicle_type_chassis: '',
          chassis_no: '',
          date_of_purchase: '',
          duration_of_completion: '',
          date_of_first_disbursement: '',
          final_disbursement: '',
          total_disbursed_amount: '',
          utility_charges: '',
          daily_return: ''
        });
        // Invalidate the cache so the updated count is shown immediately.
        Object.keys(_clientsCache).forEach((k) => delete _clientsCache[k]);
        sessionStorage.setItem('dashboard_stats_cache_dirty', 'true');
        fetchClients(true);
      } else {
        const data = await res.json();
        alert('Error: ' + data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to assign tricycle');
    } finally {
      setIsAssigning(false);
    }
  };

  useEffect(() => {
    // If another page (e.g. /clients/new or assign modal) set the dirty flag,
    // force a fresh fetch so the list reflects the new data.
    const dirty = sessionStorage.getItem('clients_cache_dirty') === 'true';
    if (dirty) {
      sessionStorage.removeItem('clients_cache_dirty');
      fetchClients(true);
    } else {
      fetchClients();
    }
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      router.push('/clients/new');
    }
  }, [searchParams, router]);

  async function fetchClients(forceRefresh = false) {
    // Serve from cache when available and no forced refresh is requested.
    if (!forceRefresh && _clientsCache[search]) {
      setClients(_clientsCache[search]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/clients?search=${encodeURIComponent(search)}`);
      if (res.ok) {
        const data = await res.json();
        _clientsCache[search] = data; // store in cache
        setClients(data);
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="space-y-6 pb-24 sm:pb-6 print:hidden">
        <div className="flex justify-between items-center">
          <h2 className="text-lg md:text-xl font-bold tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-violet-500" />
            <span>Clients</span>
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/10 flex items-center gap-2 text-sm"
              title="Print Client List / Save as PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <Link
              href="/clients/new"
              className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-violet-500/10 flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Client</span>
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-8 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by client name, phone number, or File No..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800/80 rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 text-sm"
          />
        </div>

        {/* Clients Table */}
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm">
          {loading ? (
            <div className="space-y-4 animate-pulse p-2">
              <div className="h-10 bg-slate-150 dark:bg-slate-800/50 rounded-xl w-full" />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-6 py-3 border-b border-slate-100 dark:border-slate-800/50 last:border-b-0">
                  <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/4" />
                    <div className="h-3 bg-slate-150 dark:bg-slate-800/60 rounded-md w-1/6" />
                  </div>
                  <div className="h-4 bg-slate-150 dark:bg-slate-800/60 rounded-md w-16 hidden sm:block" />
                  <div className="h-4 bg-slate-150 dark:bg-slate-800/60 rounded-md w-24 hidden md:block" />
                  <div className="h-4 bg-slate-150 dark:bg-slate-800/60 rounded-md w-20 hidden lg:block" />
                  <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-16 shrink-0" />
                </div>
              ))}
            </div>
          ) : clients.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">No clients found. Click &quot;Add Client Record&quot; to log one.</p>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800/80">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm">
                  <thead className="bg-slate-100 dark:bg-slate-955">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Client</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tricycles</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900/20">
                    {clients
                      .slice((currentPage - 1) * RECORDS_PER_PAGE, currentPage * RECORDS_PER_PAGE)
                      .map((client: any) => {
                        const clientSlug = slugify(client.name) || client.id;
                        return (
                          <tr
                            key={client.id}
                            className="hover:bg-slate-100/40 dark:hover:bg-slate-800/20 cursor-pointer transition-colors"
                            onClick={() => router.push(`/clients/${clientSlug}`)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                {client.passport_url ? (
                                  <img src={client.passport_url} alt="Passport" className="w-10 h-10 rounded-full object-cover border border-slate-300 dark:border-slate-700 shrink-0" />
                                ) : (
                                  <img
                                    src="/logo.jpeg"
                                    alt="Brahma Sama"
                                    className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                                  />
                                )}
                                <span className="font-bold text-slate-800 dark:text-white">{client.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300">{client.phone || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-650 dark:text-slate-350 font-bold">{client.tricycles_count || 0}</td>
                            <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                              <div className="flex gap-2">
                                <button
                                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 transition-all flex items-center gap-1.5"
                                  onClick={() => router.push(`/clients/${clientSlug}`)}
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>View Details</span>
                                </button>
                                <button
                                  className="bg-violet-100 hover:bg-violet-200 dark:bg-violet-900/40 dark:hover:bg-violet-800/60 text-violet-700 dark:text-violet-300 text-xs font-semibold px-3 py-1.5 rounded-lg border border-violet-300 dark:border-violet-700/50 transition-all flex items-center gap-1.5"
                                  onClick={() => handleOpenEdit(client)}
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
                                  onClick={() => {
                                    setAssigningClient(client); setMcForm({
                                      file_no: '',
                                      vehicle_type_chassis: '',
                                      chassis_no: '',
                                      date_of_purchase: '',
                                      duration_of_completion: '',
                                      date_of_first_disbursement: '',
                                      final_disbursement: '',
                                      total_disbursed_amount: '',
                                      utility_charges: '',
                                      daily_return: ''
                                    }); setShowAssignModal(true);
                                  }}
                                >
                                  <PlusCircle className="w-3.5 h-3.5" />
                                  <span>Assign</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              {clients.length > RECORDS_PER_PAGE && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 mb-8 sm:mb-0 px-2">
                  {/* Record count */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
                    Showing{' '}
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {(currentPage - 1) * RECORDS_PER_PAGE + 1}
                    </span>
                    {' '}–{' '}
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {Math.min(currentPage * RECORDS_PER_PAGE, clients.length)}
                    </span>
                    {' '}of{' '}
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{clients.length}</span>
                    {' '}clients
                  </p>

                  {/* Navigation buttons */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="flex-1 sm:flex-none px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-center"
                    >
                      ← Previous
                    </button>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 px-2 whitespace-nowrap">
                      Page {currentPage} of {Math.ceil(clients.length / RECORDS_PER_PAGE)}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(Math.ceil(clients.length / RECORDS_PER_PAGE), p + 1))}
                      disabled={currentPage === Math.ceil(clients.length / RECORDS_PER_PAGE)}
                      className="flex-1 sm:flex-none px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-center"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Motorcycle Assignment Modal */}


        {showAssignModal && assigningClient && (
          <ModalPortal>
            <div
              className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-0 md:p-4"
              onClick={() => { setShowAssignModal(false); setAssigningClient(null); }}
            >
              <div
                className="bg-white dark:bg-slate-900 border-0 md:border border-slate-200 dark:border-slate-800 rounded-none md:rounded-3xl w-full h-full md:h-auto max-w-none md:max-w-2xl max-h-none md:max-h-[90vh] shadow-2xl relative overflow-hidden transition-all transform scale-100 flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >

                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Assign Tricycle to {assigningClient.name}
                  </h3>
                  <button
                    onClick={() => { setShowAssignModal(false); setAssigningClient(null); }}
                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAssignMotorcycle} className="flex-1 overflow-y-auto p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">File No</label>
                      <input
                        type="text"
                        required
                        value={mcForm.file_no}
                        onChange={(e) => setMcForm({ ...mcForm, file_no: e.target.value })}
                        className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-850 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                        placeholder="e.g. BS/CL-409"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Vehicle Type / Chassis No</label>
                      <input
                        type="text"
                        required
                        value={mcForm.vehicle_type_chassis}
                        onChange={(e) => setMcForm({ ...mcForm, vehicle_type_chassis: e.target.value })}
                        className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-850 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                        placeholder="e.g. Bajaj Boxer - CH492"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Chassis Number</label>
                      <input
                        type="text"
                        required
                        value={mcForm.chassis_no}
                        onChange={(e) => setMcForm({ ...mcForm, chassis_no: e.target.value })}
                        className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-855 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                        placeholder="Enter chassis number"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-550 uppercase tracking-wider">Date of Purchase</label>
                      <input
                        type="date"
                        required
                        value={mcForm.date_of_purchase}
                        onChange={(e) => setMcForm({ ...mcForm, date_of_purchase: e.target.value })}
                        className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-850 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-505/50 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-550 uppercase tracking-wider">Duration of Completion</label>
                      <input
                        type="text"
                        required
                        value={mcForm.duration_of_completion}
                        onChange={(e) => setMcForm({ ...mcForm, duration_of_completion: e.target.value })}
                        className="bg-slate-55 dark:bg-slate-955 border border-slate-300 dark:border-slate-850 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                        placeholder="e.g. 18 Months"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-550 uppercase tracking-wider">Date of First Disb.</label>
                      <input
                        type="date"
                        required
                        value={mcForm.date_of_first_disbursement}
                        onChange={(e) => setMcForm({ ...mcForm, date_of_first_disbursement: e.target.value })}
                        className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-850 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-550/50 text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-550 uppercase tracking-wider">Date of Last Disb.</label>
                      <input
                        type="date"
                        required
                        value={mcForm.final_disbursement}
                        onChange={(e) => setMcForm({ ...mcForm, final_disbursement: e.target.value })}
                        className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-850 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-550/50 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-550 uppercase tracking-wider">Amount purchased (₦)</label>
                      <input
                        type="number"
                        required
                        value={mcForm.total_disbursed_amount}
                        onChange={(e) => setMcForm({ ...mcForm, total_disbursed_amount: e.target.value })}
                        className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-850 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                        placeholder="e.g. 500000"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-550 uppercase tracking-wider">Utility Charges (₦)</label>
                      <input
                        type="number"
                        required
                        value={mcForm.utility_charges}
                        onChange={(e) => setMcForm({ ...mcForm, utility_charges: e.target.value })}
                        className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-850 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                        placeholder="e.g. 15000"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-550 uppercase tracking-wider">Daily Return (₦)</label>
                      <input
                        type="number"
                        required
                        value={mcForm.daily_return}
                        onChange={(e) => setMcForm({ ...mcForm, daily_return: e.target.value })}
                        className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-855 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                        placeholder="e.g. 3000"
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => { setShowAssignModal(false); setAssigningClient(null); }}
                      className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm px-4 py-2 rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isAssigning}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                    >
                      {isAssigning ? 'Assigning...' : 'Assign Tricycle'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </ModalPortal>
        )}

        {/* ReportPreviewModal is removed entirely */}

        {/* ── Edit Client Modal ─────────────────────────────────────────── */}
        {showEditModal && editingClient && (
          <ModalPortal>
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[99999] flex items-start justify-center p-0 md:p-4 overflow-y-auto"
              onClick={() => !isSavingEdit && setShowEditModal(false)}
            >
              <div
                className="bg-white dark:bg-slate-900 border-0 md:border border-slate-200 dark:border-slate-800 w-full h-full md:h-auto max-w-none md:max-w-3xl md:max-h-[92vh] shadow-2xl relative overflow-hidden flex flex-col md:rounded-2xl my-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-950/60 flex items-center justify-center text-violet-600">
                      <Edit2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Edit Client Profile</h3>
                      <p className="text-[10px] text-slate-400">{editingClient.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto p-6 space-y-6">

                  {/* Passport Photo */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Passport Photo</label>
                    <div className="flex items-center gap-4">
                      {editPassportPreview ? (
                        <img src={editPassportPreview} className="w-20 h-20 rounded-xl object-cover border-2 border-violet-400" />
                      ) : editingClient.passport_url ? (
                        <img src={editingClient.passport_url} className="w-20 h-20 rounded-xl object-cover border-2 border-slate-300 dark:border-slate-700" />
                      ) : (
                        <img
                          src="/logo.jpeg"
                          alt="Brahma Sama"
                          className="w-20 h-20 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                        />
                      )}
                      <label className="cursor-pointer bg-slate-100 dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-violet-950/40 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-600 dark:text-slate-300 font-semibold transition-colors">
                        Change Photo
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setEditPassportFile(file);
                              const reader = new FileReader();
                              reader.onloadend = () => setEditPassportPreview(reader.result as string);
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Personal Info */}
                  <div>
                    <h4 className="text-[11px] font-bold text-violet-600 uppercase tracking-wider mb-3 flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Personal Information</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { label: 'Full Name', key: 'name', required: true },
                        { label: 'Phone Number', key: 'phone' },
                        { label: 'Email Address', key: 'email_address', type: 'email' },
                        { label: 'Government ID Details', key: 'id_details' },
                      ].map(({ label, key, required, type }) => (
                        <div key={key}>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">{label}{required && ' *'}</label>
                          <input
                            type={type || 'text'}
                            required={required}
                            value={(editForm as any)[key] || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, [key]: e.target.value }))}
                            className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-xs"
                          />
                        </div>
                      ))}
                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Residential Address</label>
                        <input
                          type="text"
                          value={editForm.residential_address || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, residential_address: e.target.value }))}
                          className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Branch / Office</label>
                        <select
                          value={editForm.branch_id || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, branch_id: e.target.value ? Number(e.target.value) : null }))}
                          className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-xs"
                        >
                          <option value="">-- Select Branch --</option>
                          {branches.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Bank & Financial */}
                  <div>
                    <h4 className="text-[11px] font-bold text-violet-600 uppercase tracking-wider mb-3 flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> Bank &amp; Financial Info</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { label: 'Bank Name', key: 'bank_name' },
                        { label: 'Account Name', key: 'account_name' },
                        { label: 'Account Number', key: 'account_number' },
                      ].map(({ label, key }) => (
                        <div key={key}>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">{label}</label>
                          <input
                            type="text"
                            value={(editForm as any)[key] || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, [key]: e.target.value }))}
                            className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contract & Vehicle Details */}
                  <div>
                    <h4 className="text-[11px] font-bold text-violet-600 uppercase tracking-wider mb-3 flex items-center gap-1.5"><PlusCircle className="w-3.5 h-3.5" /> Contract &amp; Vehicle Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { label: 'File No', key: 'file_no' },
                        { label: 'Vehicle Type / Chassis', key: 'vehicle_type_chassis' },
                        { label: 'Chassis No', key: 'chassis_no' },
                        { label: 'No. of Motorcycles', key: 'no_of_motorcycles', type: 'number' },
                        { label: 'Total Disbursed Amount (₦)', key: 'total_disbursed_amount', type: 'number' },
                        { label: 'Utility Charges (₦)', key: 'utility_charges', type: 'number' },
                        { label: 'Contract Duration', key: 'duration_of_completion' },
                        { label: 'Date of Purchase', key: 'date_of_purchase', type: 'date' },
                        { label: 'First Disbursement Date', key: 'date_of_first_disbursement', type: 'date' },
                        { label: 'Final Disbursement Date', key: 'final_disbursement', type: 'date' },
                      ].map(({ label, key, type }) => (
                        <div key={key}>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">{label}</label>
                          <input
                            type={type || 'text'}
                            step={type === 'number' ? 'any' : undefined}
                            value={(editForm as any)[key] ?? ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, [key]: type === 'number' ? (e.target.value === '' ? null : Number(e.target.value)) : e.target.value }))}
                            className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800 sticky bottom-0 bg-white dark:bg-slate-900 pb-2">
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
                      className="bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs px-6 py-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      {isSavingEdit ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </ModalPortal>
        )}
      </div>

      {/* Printable PDF Layout with Brahman Sama Branding */}
      <div className="hidden print:block w-full bg-white text-slate-900 p-2 relative">
        {/* Diagonal Watermark on Each Page */}
        <div className="print-watermark" aria-hidden="true">
          CONFIDENTIAL
        </div>
        {/* Brahman Sama Official Header */}
        <div className=" flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src="/logo.jpeg" alt="Brahman Sama Logo" className="w-16 h-16 object-contain " />
            <div>
              <h1 className="text-2xl font-extrabold uppercase tracking-wide text-slate-900">BRAHAM SAMA NIGERIA LIMITED</h1>
              <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Automobile & Vehicle Financing Services</p>
              <p className="text-xs text-slate-500">Official Client Record & Directory Report</p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-600">
            <p className="font-bold text-slate-800">Date Generated:</p>
            <p>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
            <p className="text-[10px] text-slate-400 mt-1">Total Records: {clients.length}</p>
          </div>
        </div>

        {/* Centered Document Title Banner */}
        <div className="text-center my-4 py-2">
          <h1 className="text-sm font-black uppercase tracking-widest text-slate-900">
            CLIENT RECORDS SYSTEM
          </h1>
        </div>

        {/* Client Table for PDF */}
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b-2 border-slate-300 text-slate-800 font-bold uppercase text-[10px] tracking-wider">
              <th className="py-2.5 px-3 border border-slate-300 w-[5%] text-center">#</th>
              <th className="py-2.5 px-3 border border-slate-300 w-[25%] whitespace-nowrap">Client Name</th>
              <th className="py-2.5 px-3 border border-slate-300 w-[15%] whitespace-nowrap">Phone / Email</th>
              <th className="py-2.5 px-3 border border-slate-300 w-[12%] whitespace-nowrap">Branch</th>
              <th className="py-2.5 px-3 border border-slate-300 w-[10%] whitespace-nowrap">File No</th>
              <th className="py-2.5 px-3 border border-slate-300 w-[18%] whitespace-nowrap">Bank Details</th>
              <th className="py-2.5 px-3 border border-slate-300 w-[15%]">Address</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client: any, idx: number) => (
              <tr key={client.id} className="border-b border-slate-200">
                <td className="py-2 px-3 border border-slate-200 font-semibold text-center">{idx + 1}</td>
                <td className="py-2 px-3 border border-slate-200 font-bold text-slate-900 leading-tight">{client.name}</td>
                <td className="py-2 px-3 border border-slate-200 whitespace-nowrap">
                  <div className="font-medium">{client.phone || '-'}</div>
                  <div className="text-[10px] text-slate-500">{client.email_address || ''}</div>
                </td>
                <td className="py-2 px-3 border border-slate-200 font-medium whitespace-nowrap">{client.branch_name || client.office || '-'}</td>
                <td className="py-2 px-3 border border-slate-200 font-mono text-[11px] whitespace-nowrap">{client.file_no || '-'}</td>
                <td className="py-2 px-3 border border-slate-200">
                  <div className="font-semibold leading-tight">{client.bank_name || '-'}</div>
                  <div className="text-[10px] font-mono text-slate-600">{client.account_number || ''}</div>
                </td>
                <td className="py-2 px-3 border border-slate-200 text-[10px] leading-normal">{client.residential_address || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
      </div>
    </>
  );
}
