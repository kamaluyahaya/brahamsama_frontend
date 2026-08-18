'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Users,
  User,
  Plus,
  Trash2,
  X,
  Search,
  CreditCard,
  Briefcase,
  Eye,
  Printer
} from 'lucide-react';
import ReportPreviewModal from '@/components/ReportPreviewModal';

interface Client {
  id: number;
  name: string;
  phone: string;
  email_address: string;
  residential_address: string;
  office: string;
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
  tempo_no?: string | null;
  total_disbursed_amount?: number | null;
  receipt_no?: string | null;
  duration_of_completion?: string | null;
  created_at?: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Form State
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    fetchClients();
  }, [search]);

  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      router.push('/clients/new');
    }
  }, [searchParams, router]);

  async function fetchClients() {
    try {
      setLoading(true);
      const res = await fetch(`/api/clients?search=${encodeURIComponent(search)}`);
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  }

  const deleteClient = async (id: number) => {
    if (!confirm('Are you sure you want to delete this client record?')) return;
    try {
      const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchClients();
        setShowDetailModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-violet-500" />
          <span>Client Administration (Clerks & Sec Logs)</span>
        </h2>
        <Link
          href="/clients/new"
          className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-violet-500/10 flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Client Record</span>
        </Link>
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
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading client records...</p>
        ) : clients.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">No clients found. Click 'Add Client Record' to log one.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800/80">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm">
              <thead className="bg-slate-100 dark:bg-slate-955">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Passport</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">File No</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Chassis / Vehicle</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Disbursement Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900/20">
                {clients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-slate-100/40 dark:hover:bg-slate-800/20 cursor-pointer transition-colors"
                    onClick={() => { setSelectedClient(client); setShowDetailModal(true); }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {client.passport_url ? (
                        <img src={client.passport_url} alt="Passport" className="w-10 h-10 rounded-full object-cover border border-slate-300 dark:border-slate-705" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                          <User className="w-5 h-5" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-850 dark:text-white">{client.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300">{client.file_no || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300">{client.phone || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300">{client.vehicle_type_chassis || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300">{client.date_of_first_disbursement || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 transition-all flex items-center gap-1.5"
                        onClick={() => { setSelectedClient(client); setShowDetailModal(true); }}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail View Modal */}
      {showDetailModal && selectedClient && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-[0.5rem] shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 p-6 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Client File Details: {selectedClient.name}</h3>
              <button className="text-slate-400 hover:text-slate-650 dark:hover:text-white" onClick={() => setShowDetailModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 scrollbar-none space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center gap-2 text-center md:border-r border-slate-150 dark:border-slate-850 pr-4">
                  {selectedClient.passport_url ? (
                    <img src={selectedClient.passport_url} alt={selectedClient.name} className="w-32 h-32 rounded-2xl object-cover border-2 border-violet-500/40 shadow-xl" />
                  ) : (
                    <div className="w-32 h-32 rounded-2xl bg-slate-100 dark:bg-slate-955 flex items-center justify-center text-slate-500 text-4xl border border-slate-200 dark:border-slate-800">
                      <User className="w-12 h-12" />
                    </div>
                  )}
                  <span className="text-xs text-slate-550 mt-1 font-semibold uppercase">Passport ID Photo</span>
                </div>

                <div className="md:col-span-2 space-y-3 text-sm">
                  <div className="grid grid-cols-2 py-1 border-b border-slate-150 dark:border-slate-850">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">File Number:</span>
                    <span className="text-slate-800 dark:text-white font-bold">{selectedClient.file_no || 'N/A'}</span>
                  </div>
                  <div className="grid grid-cols-2 py-1 border-b border-slate-150 dark:border-slate-850">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Phone Number:</span>
                    <span className="text-slate-800 dark:text-white">{selectedClient.phone || 'N/A'}</span>
                  </div>
                  <div className="grid grid-cols-2 py-1 border-b border-slate-150 dark:border-slate-850">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Email Address:</span>
                    <span className="text-slate-800 dark:text-white">{selectedClient.email_address || 'N/A'}</span>
                  </div>
                  <div className="grid grid-cols-2 py-1 border-b border-slate-150 dark:border-slate-850">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Government ID:</span>
                    <span className="text-slate-800 dark:text-white">{selectedClient.id_details || 'N/A'}</span>
                  </div>
                  <div className="grid grid-cols-2 py-1 border-b border-slate-150 dark:border-slate-850">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Office Branch:</span>
                    <span className="text-slate-800 dark:text-white">{selectedClient.office || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col py-1">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Home Address:</span>
                    <span className="text-slate-800 dark:text-white mt-1">{selectedClient.residential_address || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-200 dark:border-slate-800 pt-6">
                <div className="space-y-2 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-violet-650 dark:text-violet-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Bank Account Details</span>
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300"><strong>Bank:</strong> {selectedClient.bank_name || 'N/A'}</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300"><strong>Account Name:</strong> {selectedClient.account_name || 'N/A'}</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300"><strong>Account No:</strong> {selectedClient.account_number || 'N/A'}</p>
                </div>

                <div className="space-y-2 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-violet-655 dark:text-violet-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Asset & Finance Details</span>
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300"><strong>Chassis/Vehicle:</strong> {selectedClient.vehicle_type_chassis || 'N/A'}</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300"><strong>No of Motorcycles:</strong> {selectedClient.no_of_motorcycles || 'N/A'}</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300"><strong>Tempo Reg No:</strong> {selectedClient.tempo_no || 'N/A'}</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300"><strong>Purchase Date:</strong> {selectedClient.date_of_purchase || 'N/A'}</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300"><strong>First Disbursement:</strong> {selectedClient.date_of_first_disbursement || 'N/A'}</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300"><strong>Last Disbursement:</strong> {selectedClient.final_disbursement || 'N/A'}</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300"><strong>Total Disbursed:</strong> ₦{selectedClient.total_disbursed_amount ? selectedClient.total_disbursed_amount.toLocaleString() : '0'}</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300"><strong>Receipt No:</strong> {selectedClient.receipt_no || 'N/A'}</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300"><strong>Contract Term:</strong> {selectedClient.duration_of_completion || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-800 p-6 pt-4">
                  <button
                    className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5"
                    onClick={() => deleteClient(selectedClient.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Record</span>
                  </button>
                  <div className="flex gap-2">
                    <button
                      className="bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5"
                      onClick={() => setShowReportModal(true)}
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print / Export</span>
                    </button>
                    <button
                      className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all"
                      onClick={() => setShowDetailModal(false)}
                    >
                      Close File
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

      {selectedClient && (
        <ReportPreviewModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          title="Client Profile Report"
          passportUrl={selectedClient.passport_url}
          recordData={[
            { label: 'Client Name', value: selectedClient.name },
            { label: 'File Number', value: selectedClient.file_no },
            { label: 'Phone Number', value: selectedClient.phone },
            { label: 'Email Address', value: selectedClient.email_address },
            { label: 'Office Branch', value: selectedClient.office },
            { label: 'Home Address', value: selectedClient.residential_address },
            { label: 'Government ID Details', value: selectedClient.id_details },
            { label: 'Bank Name', value: selectedClient.bank_name },
            { label: 'Account Name', value: selectedClient.account_name },
            { label: 'Account Number', value: selectedClient.account_number },
            { label: 'Vehicle Type / Chassis', value: selectedClient.vehicle_type_chassis },
            { label: 'No of Motorcycles', value: selectedClient.no_of_motorcycles },
            { label: 'Tempo Registration No', value: selectedClient.tempo_no },
            { label: 'Total Disbursed Amount', value: selectedClient.total_disbursed_amount ? `₦${selectedClient.total_disbursed_amount.toLocaleString()}` : '₦0' },
            { label: 'Receipt Number', value: selectedClient.receipt_no },
            { label: 'Contract Term', value: selectedClient.duration_of_completion },
            { label: 'Date of Purchase', value: selectedClient.date_of_purchase },
            { label: 'First Disbursement Date', value: selectedClient.date_of_first_disbursement },
            { label: 'Final Disbursement Date', value: selectedClient.final_disbursement },
          ]}
        />
      )}
    </div>
  );
}
