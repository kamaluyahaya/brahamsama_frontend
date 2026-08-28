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
  Printer,
  PlusCircle
} from 'lucide-react';
import ReportPreviewModal from '@/components/ReportPreviewModal';
import ModalPortal from '@/components/ModalPortal';
import { buildNativePrintHTML } from '@/utils/printClient';


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

  // Portal Credentials Editor State
  const [credUsername, setCredUsername] = useState('');
  const [credPassword, setCredPassword] = useState('');
  const [isUpdatingCreds, setIsUpdatingCreds] = useState(false);

  // Motorcycle Assignment State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningClient, setAssigningClient] = useState<Client | null>(null);
  const [clientMotorcycles, setClientMotorcycles] = useState<any[]>([]);
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

  useEffect(() => {
    if (selectedClient) {
      fetch(`/api/clients/${selectedClient.id}/motorcycles`)
        .then(res => res.json())
        .then(data => setClientMotorcycles(data))
        .catch(err => console.error(err));
    } else {
      setClientMotorcycles([]);
    }
  }, [selectedClient]);

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
        fetchClients();
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

  const handleUpdateCredentials = async () => {
    if (!selectedClient) return;
    if (!credUsername.trim()) {
      alert('Username is required.');
      return;
    }
    setIsUpdatingCreds(true);
    try {
      const res = await fetch(`/api/clients/${selectedClient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: credUsername.trim(),
          password: credPassword ? credPassword : undefined
        })
      });
      if (res.ok) {
        alert('Portal credentials updated successfully!');
        fetchClients();
        setShowDetailModal(false);
      } else {
        const data = await res.json();
        alert('Error: ' + data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Connection to server failed.');
    } finally {
      setIsUpdatingCreds(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg md:text-xl font-bold tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
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
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800/80">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm">
              <thead className="bg-slate-100 dark:bg-slate-955">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Passport</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tricycles</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Disbursement Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900/20">
                {clients.map((client: any) => (
                  <tr
                    key={client.id}
                    className="hover:bg-slate-100/40 dark:hover:bg-slate-800/20 cursor-pointer transition-colors"
                    onClick={() => { setSelectedClient(client); setCredUsername(client.username || ''); setCredPassword(''); setShowDetailModal(true); }}
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
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300">{client.phone || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-650 dark:text-slate-350 font-bold">{client.tricycles_count || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300">{client.date_of_first_disbursement || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2">
                        <button
                          className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 transition-all flex items-center gap-1.5"
                          onClick={() => { setSelectedClient(client); setCredUsername(client.username || ''); setCredPassword(''); setShowDetailModal(true); }}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>
                        <button
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
                          onClick={() => { setAssigningClient(client); setMcForm({
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
                          }); setShowAssignModal(true); }}
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Assign</span>
                        </button>
                      </div>
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
        <ModalPortal>
          <div
            className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setShowDetailModal(false)}
          >
            <div
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-[0.5rem] shadow-2xl overflow-hidden my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 p-6 pb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Client: {selectedClient.name}</h3>
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
                      <span className="text-slate-800 dark:text-white">{selectedClient.branch_name || selectedClient.office || 'N/A'}</span>
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

                  <div className="space-y-2 bg-slate-50 dark:bg-slate-955/40 border border-slate-200 dark:border-slate-850 rounded-xl p-4 md:col-span-2">
                    <h4 className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>Assigned Tricycles ({clientMotorcycles.length})</span>
                    </h4>
                    {clientMotorcycles.length === 0 ? (
                      <p className="text-xs text-slate-500 py-2">No tricycles assigned to this client yet.</p>
                    ) : (
                      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left">
                          <thead className="bg-slate-100 dark:bg-slate-900">
                            <tr>
                              <th className="px-3 py-2 font-semibold">File No</th>
                              <th className="px-3 py-2 font-semibold">Vehicle Details</th>
                              <th className="px-3 py-2 font-semibold">Chassis No</th>
                              <th className="px-3 py-2 font-semibold">Purchase Date</th>
                              <th className="px-3 py-2 font-semibold">Total Disbursed</th>
                              <th className="px-3 py-2 font-semibold">Utility Charges</th>
                              <th className="px-3 py-2 font-semibold">Daily Return</th>
                              <th className="px-3 py-2 font-semibold">Term</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {clientMotorcycles.map((mc) => (
                              <tr key={mc.id} className="hover:bg-slate-55 dark:hover:bg-slate-850/50">
                                <td className="px-3 py-2 whitespace-nowrap">{mc.file_no || 'N/A'}</td>
                                <td className="px-3 py-2 whitespace-nowrap">{mc.vehicle_type_chassis || 'N/A'}</td>
                                <td className="px-3 py-2 whitespace-nowrap">{mc.chassis_no || 'N/A'}</td>
                                <td className="px-3 py-2 whitespace-nowrap">{mc.date_of_purchase || 'N/A'}</td>
                                <td className="px-3 py-2 whitespace-nowrap">₦{parseFloat(mc.total_disbursed_amount || 0).toLocaleString()}</td>
                                <td className="px-3 py-2 whitespace-nowrap">₦{parseFloat(mc.utility_charges || 0).toLocaleString()}</td>
                                <td className="px-3 py-2 whitespace-nowrap">₦{parseFloat(mc.daily_return || 0).toLocaleString()}</td>
                                <td className="px-3 py-2 whitespace-nowrap">{mc.duration_of_completion || 'N/A'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-6 space-y-4">
                  <h4 className="text-xs font-bold text-violet-650 dark:text-violet-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>Client Portal Access Credentials</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Username</label>
                      <input
                        type="text"
                        value={credUsername}
                        onChange={(e) => setCredUsername(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-xs"
                        placeholder="Configure login username"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Password (Leave blank to keep current)</label>
                      <input
                        type="password"
                        value={credPassword}
                        onChange={(e) => setCredPassword(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-xs"
                        placeholder="Configure login password"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleUpdateCredentials}
                    disabled={isUpdatingCreds}
                    className="bg-violet-605 hover:bg-violet-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-md active:scale-95"
                  >
                    {isUpdatingCreds ? 'Updating...' : 'Save Portal Credentials'}
                  </button>
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
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 active:scale-95"
                    onClick={() => {
                      // NATIVE CSV EXPORT TRIGGER
                      let csv = '\uFEFF';
                      csv += `"BRAHAM SAMA OPERATIONS & MANAGEMENT SYSTEM"\n`;
                      csv += `"RC No: 7121543 | Kano State Branch"\n`;
                      csv += `"CEO: Braham Sama"\n`;
                      csv += `"Report: CLIENT PROFILE REPORT"\n`;
                      csv += `"Generated on: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}"\n\n"RECORD METADATA"\n`;

                      const metadata = [
                        ['Client Name', selectedClient.name],
                        ['File Number', selectedClient.file_no],
                        ['Phone Number', selectedClient.phone],
                        ['Email Address', selectedClient.email_address],
                        ['Office Branch', selectedClient.branch_name || selectedClient.office || 'N/A'],
                        ['Home Address', selectedClient.residential_address],
                        ['Government ID Details', selectedClient.id_details],
                        ['Bank Name', selectedClient.bank_name],
                        ['Account Name', selectedClient.account_name],
                        ['Account Number', selectedClient.account_number],
                        ['Vehicle Type / Chassis', selectedClient.vehicle_type_chassis],
                        ['No of Motorcycles', selectedClient.no_of_motorcycles],
                        ['Chassis Number', selectedClient.chassis_no],
                        ['Total Disbursed Amount', selectedClient.total_disbursed_amount ? `₦${selectedClient.total_disbursed_amount.toLocaleString()}` : '₦0'],
                        ['Utility Charges', selectedClient.utility_charges ? `₦${selectedClient.utility_charges.toLocaleString()}` : '₦0'],
                        ['Contract Term', selectedClient.duration_of_completion],
                        ['Date of Purchase', selectedClient.date_of_purchase],
                        ['First Disbursement Date', selectedClient.date_of_first_disbursement],
                        ['Final Disbursement Date', selectedClient.final_disbursement]
                      ];

                      metadata.forEach(([l, v]) => {
                        const labelEsc = String(l).replace(/"/g, '""');
                        const valEsc = String(v ?? 'N/A').replace(/"/g, '""');
                        csv += `"${labelEsc}","${valEsc}"\n`;
                      });

                      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `client_profile_${selectedClient.file_no || 'export'}_${new Date().toISOString().split('T')[0]}.csv`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }}
                  >
                    <span>Export CSV</span>
                  </button>

                  <button
                    className="bg-slate-700 hover:bg-slate-650 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 active:scale-95"
                    onClick={() => {
                      // NATIVE PRINT TRIGGER (Instant print using iframe to avoid new tab)
                      let frame = document.getElementById('print-iframe') as HTMLIFrameElement;
                      if (!frame) {
                        frame = document.createElement('iframe');
                        frame.id = 'print-iframe';
                        frame.style.position = 'fixed';
                        frame.style.right = '0';
                        frame.style.bottom = '0';
                        frame.style.width = '0';
                        frame.style.height = '0';
                        frame.style.border = '0';
                        document.body.appendChild(frame);
                      }
                      const doc = frame.contentDocument || frame.contentWindow?.document;
                      if (doc) {
                        doc.open();
                        doc.write(buildNativePrintHTML(selectedClient, true));
                        doc.close();
                      }
                    }}
                  >
                    <span>Print</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {showAssignModal && assigningClient && (
        <ModalPortal>
          <div
            className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => { setShowAssignModal(false); setAssigningClient(null); }}
          >
            <div
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl relative overflow-hidden transition-all transform scale-100 flex flex-col max-h-[90vh]"
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
                    <label className="text-[11px] font-bold text-slate-550 uppercase tracking-wider">Total Disbursed (₦)</label>
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
    </div>
  );
}
