'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Building,
  CreditCard,
  Plus,
  Edit2,
  Trash2,
  Printer,
  Download,
  Key,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  X,
  Bike
} from 'lucide-react';
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
}

interface ClientMotorcycle {
  id: number;
  client_id: number;
  file_no: string;
  vehicle_type_chassis: string;
  chassis_no: string;
  date_of_purchase: string;
  duration_of_completion: string;
  date_of_first_disbursement: string;
  final_disbursement: string;
  total_disbursed_amount: number;
  utility_charges: number;
  daily_return: number;
  created_at?: string;
}

const emptyMcForm = {
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
};

export default function ClientDetailPage() {
  const params = useParams();
  const slugParam = (params?.slug || params?.id) as string;
  const router = useRouter();

  const [client, setClient] = useState<Client | null>(null);
  const [motorcycles, setMotorcycles] = useState<ClientMotorcycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Portal credentials state
  const [credUsername, setCredUsername] = useState('');
  const [credPassword, setCredPassword] = useState('');
  const [isUpdatingCreds, setIsUpdatingCreds] = useState(false);

  // Bicycle Assign / Edit Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingMc, setEditingMc] = useState<ClientMotorcycle | null>(null);
  const [mcForm, setMcForm] = useState(emptyMcForm);
  const [isSavingMc, setIsSavingMc] = useState(false);

  // Delete Client Confirmation Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeletingClient, setIsDeletingClient] = useState(false);

  // Edit Client Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Client>>({});
  const [editPassportFile, setEditPassportFile] = useState<File | null>(null);
  const [editPassportPreview, setEditPassportPreview] = useState<string | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [branches, setBranches] = useState<{ id: number; name: string }[]>([]);

  const handleOpenEditClient = () => {
    if (!client) return;
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
      fetch('/api/branches').then(r => r.json()).then(data => setBranches(data)).catch(() => {});
    }
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;
    setIsSavingEdit(true);
    try {
      const fd = new FormData();
      Object.entries(editForm).forEach(([k, v]) => {
        if (v !== null && v !== undefined) fd.append(k, String(v));
      });
      if (editPassportFile) fd.append('passport', editPassportFile);

      const res = await fetch(`/api/clients/${client.id}`, {
        method: 'PUT',
        body: fd,
      });
      if (res.ok) {
        setShowEditModal(false);
        fetchClientDetails();
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

  useEffect(() => {
    if (slugParam) {
      fetchClientDetails();
    }
  }, [slugParam]);

  async function fetchClientDetails() {
    try {
      setLoading(true);
      const res = await fetch(`/api/clients/${encodeURIComponent(slugParam)}`);
      if (res.ok) {
        const data = await res.json();
        setClient(data);
        setCredUsername(data.username || '');
        fetchClientMotorcycles(data.id);
      } else {
        setNotFound(true);
      }
    } catch (err) {
      console.error('Error fetching client details:', err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  async function fetchClientMotorcycles(cId: number) {
    try {
      const res = await fetch(`/api/clients/${cId}/motorcycles`);
      if (res.ok) {
        const data = await res.json();
        setMotorcycles(data);
      }
    } catch (err) {
      console.error('Error fetching motorcycles:', err);
    }
  }

  const handleOpenAssign = () => {
    setEditingMc(null);
    setMcForm(emptyMcForm);
    setShowAssignModal(true);
  };

  const handleOpenEdit = (mc: ClientMotorcycle) => {
    setEditingMc(mc);
    setMcForm({
      file_no: mc.file_no || '',
      vehicle_type_chassis: mc.vehicle_type_chassis || '',
      chassis_no: mc.chassis_no || '',
      date_of_purchase: mc.date_of_purchase || '',
      duration_of_completion: mc.duration_of_completion || '',
      date_of_first_disbursement: mc.date_of_first_disbursement || '',
      final_disbursement: mc.final_disbursement || '',
      total_disbursed_amount: mc.total_disbursed_amount !== undefined && mc.total_disbursed_amount !== null ? String(mc.total_disbursed_amount) : '',
      utility_charges: mc.utility_charges !== undefined && mc.utility_charges !== null ? String(mc.utility_charges) : '',
      daily_return: mc.daily_return !== undefined && mc.daily_return !== null ? String(mc.daily_return) : ''
    });
    setShowAssignModal(true);
  };

  const handleSaveMotorcycle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;
    setIsSavingMc(true);
    try {
      const url = editingMc
        ? `/api/clients/${client.id}/motorcycles/${editingMc.id}`
        : `/api/clients/${client.id}/motorcycles`;
      const method = editingMc ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mcForm)
      });

      if (res.ok) {
        alert(editingMc ? 'Bicycle updated successfully!' : 'Bicycle successfully assigned to client!');
        setShowAssignModal(false);
        setEditingMc(null);
        setMcForm(emptyMcForm);
        fetchClientMotorcycles(client.id);
      } else {
        const data = await res.json();
        alert('Error: ' + data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save bicycle details');
    } finally {
      setIsSavingMc(false);
    }
  };

  const handleDeleteMotorcycle = async (mcId: number) => {
    if (!client) return;
    if (!confirm('Are you sure you want to delete this assigned bicycle record?')) return;
    try {
      const res = await fetch(`/api/clients/${client.id}/motorcycles/${mcId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        alert('Bicycle deleted successfully.');
        fetchClientMotorcycles(client.id);
      } else {
        const data = await res.json();
        alert('Error: ' + data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete bicycle.');
    }
  };

  const handleUpdateCredentials = async () => {
    if (!client) return;
    if (!credUsername.trim()) {
      alert('Username is required.');
      return;
    }
    setIsUpdatingCreds(true);
    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: credUsername.trim(),
          password: credPassword ? credPassword : undefined
        })
      });
      if (res.ok) {
        alert('Portal credentials updated successfully!');
        setCredPassword('');
        fetchClientDetails();
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

  const handleDeleteClient = async () => {
    if (!client) return;
    setIsDeletingClient(true);
    try {
      const res = await fetch(`/api/clients/${client.id}`, { method: 'DELETE' });
      if (res.ok) {
        setShowDeleteModal(false);
        router.push('/clients');
      } else {
        const data = await res.json();
        alert('Error: ' + data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete client record.');
    } finally {
      setIsDeletingClient(false);
    }
  };

  const handleExportCSV = () => {
    if (!client) return;
    let csv = '\uFEFF';
    csv += `"BRAHAM SAMA OPERATIONS & MANAGEMENT SYSTEM"\n`;
    csv += `"RC No: 7121543 | Kano State Branch"\n`;
    csv += `"CEO: Braham Sama"\n`;
    csv += `"Report: CLIENT PROFILE REPORT"\n`;
    csv += `"Generated on: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}"\n\n"RECORD METADATA"\n`;

    const metadata = [
      ['Client Name', client.name],
      ['File Number', client.file_no],
      ['Phone Number', client.phone],
      ['Email Address', client.email_address],
      ['Office Branch', client.branch_name || client.office || 'N/A'],
      ['Home Address', client.residential_address],
      ['Government ID Details', client.id_details],
      ['Bank Name', client.bank_name],
      ['Account Name', client.account_name],
      ['Account Number', client.account_number],
      ['Vehicle Type / Chassis', client.vehicle_type_chassis],
      ['No of Motorcycles', client.no_of_motorcycles],
      ['Chassis Number', client.chassis_no],
      ['Total Disbursed Amount', client.total_disbursed_amount ? `₦${client.total_disbursed_amount.toLocaleString()}` : '₦0'],
      ['Utility Charges', client.utility_charges ? `₦${client.utility_charges.toLocaleString()}` : '₦0'],
      ['Contract Term', client.duration_of_completion],
      ['Date of Purchase', client.date_of_purchase],
      ['First Disbursement Date', client.date_of_first_disbursement],
      ['Final Disbursement Date', client.final_disbursement]
    ];

    metadata.forEach(([l, v]) => {
      const labelEsc = String(l).replace(/"/g, '""');
      const valEsc = String(v ?? 'N/A').replace(/"/g, '""');
      csv += `"${labelEsc}","${valEsc}"\n`;
    });

    if (motorcycles.length > 0) {
      csv += `\n"ASSIGNED BICYCLES / MOTORCYCLES"\n`;
      csv += `"File No","Vehicle Details","Chassis No","Purchase Date","Total Disbursed","Utility Charges","Daily Return","Term"\n`;
      motorcycles.forEach(mc => {
        csv += `"${mc.file_no || ''}","${mc.vehicle_type_chassis || ''}","${mc.chassis_no || ''}","${mc.date_of_purchase || ''}","₦${(mc.total_disbursed_amount || 0).toLocaleString()}","₦${(mc.utility_charges || 0).toLocaleString()}","₦${(mc.daily_return || 0).toLocaleString()}","${mc.duration_of_completion || ''}"\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `client_profile_${client.file_no || 'export'}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    if (!client) return;
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
    const doc = frame.contentWindow?.document || frame.contentDocument;
    if (doc) {
      doc.open();
      doc.write(buildNativePrintHTML(client, true));
      doc.close();
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse max-w-6xl mx-auto">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-48" />
        <div className="h-64 bg-slate-100 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800" />
      </div>
    );
  }

  if (notFound || !client) {
    return (
      <div className="max-w-md mx-auto my-12 text-center space-y-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-xl">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Client Not Found</h2>
        <p className="text-sm text-slate-500">The requested client profile does not exist or was removed.</p>
        <Link
          href="/clients"
          className="inline-flex items-center gap-2 bg-violet-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-violet-500 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Clients</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 mx-auto pb-12">
      {/* Top Header & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Link
            href="/clients"
            className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
            title="Back to Clients"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-violet-100 dark:bg-violet-955/70 text-violet-700 dark:text-violet-300 text-xs font-bold px-2.5 py-1 rounded-lg border border-violet-200 dark:border-violet-800">
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Client Profile Details &amp; Fleet Management
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleOpenAssign}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-500/10 flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Assign Bicycle</span>
          </button>
          <button
            onClick={handleOpenEditClient}
            className="bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs px-3 sm:px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
            title="Edit Client"
          >
            <Edit2 className="w-4 h-4" />
            <span className="hidden sm:inline">Edit Client</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs px-3 sm:px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs px-3 sm:px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
            title="Print Profile"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print Profile</span>
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-3 sm:px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
            title="Delete Client"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Delete Client</span>
          </button>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Client Personal Card */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col items-center text-center">
            {client.passport_url ? (
              <img
                src={client.passport_url}
                alt={client.name}
                className="w-36 h-36 rounded-2xl object-cover border-2 border-violet-500/50 shadow-xl"
              />
            ) : (
              <div className="w-36 h-36 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-700">
                <User className="w-16 h-16" />
              </div>
            )}
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-4">{client.name}</h2>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{client.branch_name || client.office || 'Main Branch'}</span>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800/80 text-sm">
            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <Phone className="w-4 h-4 text-violet-500 shrink-0" />
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Phone</span>
                <span className="font-semibold">{client.phone || 'N/A'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <Mail className="w-4 h-4 text-violet-500 shrink-0" />
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Email</span>
                <span className="font-semibold break-all">{client.email_address || 'N/A'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <ShieldCheck className="w-4 h-4 text-violet-500 shrink-0" />
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Government ID</span>
                <span className="font-semibold">{client.id_details || 'N/A'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <MapPin className="w-4 h-4 text-violet-500 shrink-0" />
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Residential Address</span>
                <span className="font-semibold">{client.residential_address || 'N/A'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <Building className="w-4 h-4 text-violet-500 shrink-0" />
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Office Branch</span>
                <span className="font-semibold">{client.branch_name || client.office || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (2 spans): Financial Info & Credentials & Bicycles */}
        <div className="lg:col-span-2 space-y-6">
          {/* Financial & Bank Account */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span>Bank Account &amp; Disbursement Info</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-955/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/60">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Bank Name</span>
                <span className="text-sm font-bold text-slate-800 dark:text-white">{client.bank_name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Account Name</span>
                <span className="text-sm font-bold text-slate-800 dark:text-white">{client.account_name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Account Number</span>
                <span className="text-sm font-bold text-slate-800 dark:text-white">{client.account_number || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Client Portal Credentials Manager */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4" />
              <span>Client Portal Credentials</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Username</label>
                <input
                  type="text"
                  value={credUsername}
                  onChange={(e) => setCredUsername(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-xs"
                  placeholder="Portal login username"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Password (Leave blank to keep current)</label>
                <input
                  type="password"
                  value={credPassword}
                  onChange={(e) => setCredPassword(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-xs"
                  placeholder="New password"
                />
              </div>
            </div>

            <button
              onClick={handleUpdateCredentials}
              disabled={isUpdatingCreds}
              className="bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
            >
              {isUpdatingCreds ? 'Updating Credentials...' : 'Save Portal Credentials'}
            </button>
          </div>

          {/* Assigned Bicycles / Motorcycles Section */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider flex items-center gap-2">
                <Bike className="w-4 h-4" />
                <span>Assigned Bicycles ({motorcycles.length})</span>
              </h3>
              <button
                onClick={handleOpenAssign}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Assign New</span>
              </button>
            </div>

            {motorcycles.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 dark:bg-slate-955/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                <Bike className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No bicycles or tricycles assigned to this client yet.</p>
                <button
                  onClick={handleOpenAssign}
                  className="mt-3 text-xs font-semibold text-violet-600 hover:underline"
                >
                  Click to assign a bicycle
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left">
                  <thead className="bg-slate-100 dark:bg-slate-955">
                    <tr>
                      <th className="px-3.5 py-3 font-semibold">File No</th>
                      <th className="px-3.5 py-3 font-semibold">Vehicle Details</th>
                      <th className="px-3.5 py-3 font-semibold">Chassis No</th>
                      <th className="px-3.5 py-3 font-semibold">Purchase Date</th>
                      <th className="px-3.5 py-3 font-semibold">Disbursed</th>
                      <th className="px-3.5 py-3 font-semibold">Daily Return</th>
                      <th className="px-3.5 py-3 font-semibold">Term</th>
                      <th className="px-3.5 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900/30">
                    {motorcycles.map((mc) => (
                      <tr key={mc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="px-3.5 py-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">{mc.file_no || 'N/A'}</td>
                        <td className="px-3.5 py-3 whitespace-nowrap text-slate-700 dark:text-slate-300">{mc.vehicle_type_chassis || 'N/A'}</td>
                        <td className="px-3.5 py-3 whitespace-nowrap text-slate-700 dark:text-slate-300">{mc.chassis_no || 'N/A'}</td>
                        <td className="px-3.5 py-3 whitespace-nowrap text-slate-600 dark:text-slate-400">{mc.date_of_purchase || 'N/A'}</td>
                        <td className="px-3.5 py-3 whitespace-nowrap font-medium text-emerald-600 dark:text-emerald-400">
                          ₦{(mc.total_disbursed_amount || 0).toLocaleString()}
                        </td>
                        <td className="px-3.5 py-3 whitespace-nowrap font-medium text-violet-600 dark:text-violet-400">
                          ₦{(mc.daily_return || 0).toLocaleString()}
                        </td>
                        <td className="px-3.5 py-3 whitespace-nowrap text-slate-600 dark:text-slate-400">{mc.duration_of_completion || 'N/A'}</td>
                        <td className="px-3.5 py-3 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(mc)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-all"
                              title="Edit Bicycle"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteMotorcycle(mc.id)}
                              className="p-1.5 bg-rose-100 hover:bg-rose-200 dark:bg-rose-955/60 dark:hover:bg-rose-900/80 text-rose-600 dark:text-rose-400 rounded-lg transition-all"
                              title="Delete Bicycle"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
        </div>
      </div>

      {/* Bicycle Assign / Edit Modal */}
      {showAssignModal && (
        <ModalPortal>
          <div
            className="fixed inset-0 bg-slate-900/60 dark:bg-slate-955/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-0 md:p-4 overflow-y-auto"
            onClick={() => setShowAssignModal(false)}
          >
            <div
              className="bg-white dark:bg-slate-900 border-0 md:border border-slate-200 dark:border-slate-800 w-full h-full md:h-auto max-w-none md:max-w-xl max-h-none md:max-h-[90vh] flex flex-col rounded-none md:rounded-2xl shadow-2xl overflow-hidden my-0 md:my-auto"
              onClick={(e) => e.stopPropagation()}
            >

              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 p-6 pb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Bike className="w-5 h-5 text-violet-500" />
                  <span>{editingMc ? 'Edit Assigned Bicycle' : 'Assign New Bicycle / Vehicle'}</span>
                </h3>
                <button
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  onClick={() => setShowAssignModal(false)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveMotorcycle} className="overflow-y-auto flex-1 p-6 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">File Number</label>
                    <input
                      type="text"
                      value={mcForm.file_no}
                      onChange={(e) => setMcForm({ ...mcForm, file_no: e.target.value })}
                      placeholder="e.g. BS/MC/001"
                      className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500/50"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Vehicle Type / Details</label>
                    <input
                      type="text"
                      value={mcForm.vehicle_type_chassis}
                      onChange={(e) => setMcForm({ ...mcForm, vehicle_type_chassis: e.target.value })}
                      placeholder="e.g. TVS King Kargo"
                      className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500/50"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Chassis / Engine Number</label>
                    <input
                      type="text"
                      value={mcForm.chassis_no}
                      onChange={(e) => setMcForm({ ...mcForm, chassis_no: e.target.value })}
                      placeholder="e.g. CH12345678"
                      className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500/50"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Date of Purchase</label>
                    <input
                      type="date"
                      value={mcForm.date_of_purchase}
                      onChange={(e) => setMcForm({ ...mcForm, date_of_purchase: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500/50"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Total Disbursed Amount (₦)</label>
                    <input
                      type="number"
                      step="any"
                      value={mcForm.total_disbursed_amount}
                      onChange={(e) => setMcForm({ ...mcForm, total_disbursed_amount: e.target.value })}
                      placeholder="0.00"
                      className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500/50"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Daily Return Amount (₦)</label>
                    <input
                      type="number"
                      step="any"
                      value={mcForm.daily_return}
                      onChange={(e) => setMcForm({ ...mcForm, daily_return: e.target.value })}
                      placeholder="0.00"
                      className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500/50"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Utility Charges (₦)</label>
                    <input
                      type="number"
                      step="any"
                      value={mcForm.utility_charges}
                      onChange={(e) => setMcForm({ ...mcForm, utility_charges: e.target.value })}
                      placeholder="0.00"
                      className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500/50"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Contract Duration / Term</label>
                    <input
                      type="text"
                      value={mcForm.duration_of_completion}
                      onChange={(e) => setMcForm({ ...mcForm, duration_of_completion: e.target.value })}
                      placeholder="e.g. 18 Months"
                      className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500/50"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Date of First Disbursement</label>
                    <input
                      type="date"
                      value={mcForm.date_of_first_disbursement}
                      onChange={(e) => setMcForm({ ...mcForm, date_of_first_disbursement: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500/50"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Final Disbursement Date</label>
                    <input
                      type="date"
                      value={mcForm.final_disbursement}
                      onChange={(e) => setMcForm({ ...mcForm, final_disbursement: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500/50"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingMc}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2 rounded-xl transition-all shadow-md active:scale-95"
                  >
                    {isSavingMc ? 'Saving...' : editingMc ? 'Update Bicycle' : 'Save & Assign Bicycle'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Edit Client Modal */}
      {showEditModal && client && (
        <ModalPortal>
          <div
            className="fixed inset-0 bg-slate-900/60 dark:bg-slate-955/80 backdrop-blur-sm z-[99999] flex items-start justify-center p-0 md:p-4 overflow-y-auto"
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
                    <p className="text-[10px] text-slate-400">{client.name}</p>
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
                    ) : client.passport_url ? (
                      <img src={client.passport_url} className="w-20 h-20 rounded-xl object-cover border-2 border-slate-300 dark:border-slate-700" />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <User className="w-8 h-8 text-slate-400" />
                      </div>
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
                  <h4 className="text-[11px] font-bold text-violet-600 uppercase tracking-wider mb-3 flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> Bank & Financial Info</h4>
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

                {/* Contract Details */}
                <div>
                  <h4 className="text-[11px] font-bold text-violet-600 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Bike className="w-3.5 h-3.5" /> Contract & Vehicle Details</h4>
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

      {/* Delete Client Confirmation Modal */}
      {showDeleteModal && client && (
        <ModalPortal>
          <div
            className="fixed inset-0 bg-slate-900/60 dark:bg-slate-955/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4"
            onClick={() => !isDeletingClient && setShowDeleteModal(false)}
          >
            <div
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5 text-center my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-955/60 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center mx-auto text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Client Record?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Are you sure you want to delete <strong className="text-slate-800 dark:text-slate-200">&quot;{client.name}&quot;</strong> (File No: <strong>{client.file_no || 'N/A'}</strong>)?
                  This action cannot be undone and will permanently remove all associated portal credentials and records.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={isDeletingClient}
                  onClick={() => setShowDeleteModal(false)}
                  className="w-1/2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeletingClient}
                  onClick={handleDeleteClient}
                  className="w-1/2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-rose-500/20 active:scale-95 flex items-center justify-center gap-1.5"
                >
                  {isDeletingClient ? 'Deleting...' : 'Yes, Delete Client'}
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
