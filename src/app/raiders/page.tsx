'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Bike,
  Plus,
  Eye,
  Save,
  Trash2,
  X,
  Calendar,
  Search,
  User,
  ShieldAlert,
  FileText,
  Printer,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Users,
  Edit2
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

export default function RaidersPage() {
  const [raiders, setRaiders] = useState<Raider[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [passportPreview, setPassportPreview] = useState<string | null>(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRaider, setSelectedRaider] = useState<Raider | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    if (!showAddModal) {
      setStep(1);
      setPassportPreview(null);
      return;
    }
    fetch('/api/raiders/available-vehicles')
      .then(res => res.ok ? res.json() : [])
      .then(data => setAvailableVehicles(data))
      .catch(err => console.error('Error fetching available vehicles:', err));

    fetch('/api/raiders/next-tempo-no')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.nextTempoNo) {
          setFormData(prev => ({
            ...prev,
            tempo_reg_no: prev.tempo_reg_no || data.nextTempoNo
          }));
        }
      })
      .catch(err => console.error('Error fetching next tempo reg no:', err));
  }, [showAddModal]);

  const steps = [
    { number: 1, name: 'Raider Profile', icon: User },
    { number: 2, name: 'Guarantor & Surety', icon: Users },
    { number: 3, name: 'Vehicle & Asset', icon: Bike },
    { number: 4, name: 'Preview & Confirm', icon: CheckCircle2 },
  ];

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    date_of_appointment: new Date().toISOString().split('T')[0],
    govt_id: '',
    guarantor_name: '',
    guarantor_phone: '',
    guarantor_gov_id: '',
    tempo_reg_no: '',
    plate_no: '',
    date_of_purchase: '',
    duration_of_completion: '',
    amount: '',
    surety_name: '',
    surety_phone: '',
    md_leader_id: '',
    client_id: '',
    client_motorcycle_id: '',
  });

  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchRaiders();
  }, [search]);

  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setShowAddModal(true);
    }
  }, [searchParams]);

  useEffect(() => {
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
    async function fetchClients() {
      try {
        const res = await fetch('/api/clients');
        if (res.ok) {
          const data = await res.json();
          setClients(data);
        }
      } catch (err) {
        console.error('Error fetching clients:', err);
      }
    }
    fetchManagers();
    fetchClients();
  }, []);

  async function fetchRaiders() {
    try {
      setLoading(true);
      const res = await fetch(`/api/raiders?search=${encodeURIComponent(search)}`);
      if (res.ok) {
        const data = await res.json();
        setRaiders(data);
      }
    } catch (err) {
      console.error('Error fetching raiders:', err);
    } finally {
      setLoading(false);
    }
  }

  const router = useRouter();

  function viewRaiderDetails(id: number) {
    router.push(`/raiders/${id}`);
  }

  const getRemainingDays = (dateStr: string) => {
    if (!dateStr) return null;
    const targetDate = new Date(dateStr);
    const today = new Date();
    targetDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (isNaN(targetDate.getTime())) return null;

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleVehicleSelect = (value: string) => {
    const vehicle = availableVehicles.find(v => v.id.toString() === value);
    setFormData(prev => ({
      ...prev,
      client_motorcycle_id: value,
      date_of_purchase: vehicle?.date_of_purchase || prev.date_of_purchase,
      amount: vehicle?.total_disbursed_amount ? String(vehicle.total_disbursed_amount) : prev.amount,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPassportFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPassportPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    setFormError(null);
    if (step === 1 && !formData.name.trim()) {
      setFormError('Raider Full Name is required.');
      return;
    }
    if (step < 4) {
      setStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setFormError(null);
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!formData.name.trim()) {
      setStep(1);
      setFormError('Raider Full Name is required.');
      return;
    }
    if (step < 4) {
      handleNext();
      return;
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });
      if (passportFile) {
        data.append('passport', passportFile);
      }

      const res = await fetch('/api/raiders', {
        method: 'POST',
        body: data,
      });

      if (res.ok) {
        setShowAddModal(false);
        setStep(1);
        setFormData({
          name: '',
          phone: '',
          address: '',
          date_of_appointment: new Date().toISOString().split('T')[0],
          govt_id: '',
          guarantor_name: '',
          guarantor_phone: '',
          guarantor_gov_id: '',
          tempo_reg_no: '',
          plate_no: '',
          date_of_purchase: '',
          duration_of_completion: '',
          amount: '',
          surety_name: '',
          surety_phone: '',
          md_leader_id: '',
          client_id: '',
          client_motorcycle_id: '',
        });
        setPassportFile(null);
        setPassportPreview(null);
        setFormError(null);
        fetchRaiders();
      } else {
        const errData = await res.json();
        setFormError(errData.message || 'Failed to save raider record');
      }
    } catch (err) {
      console.error(err);
      setFormError('Failed to save raider record. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteRaider = async (id: number) => {
    if (!confirm('Are you sure you want to delete this Raider record?')) return;
    try {
      const res = await fetch(`/api/raiders/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchRaiders();
        setShowDetailModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Change manager state
  const [newMgrId, setNewMgrId] = useState<string>('');
  const [isChangingMgr, setIsChangingMgr] = useState(false);

  const handleChangeManager = async () => {
    if (!selectedRaider) return;
    setIsChangingMgr(true);
    try {
      const res = await fetch(`/api/raiders/${selectedRaider.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ md_leader_id: newMgrId === '' ? null : Number(newMgrId) }),
      });
      if (res.ok) {
        // Re-fetch detail
        const detailRes = await fetch(`/api/raiders/${selectedRaider.id}`);
        if (detailRes.ok) {
          const detailData = await detailRes.json();
          setSelectedRaider(detailData);
          setNewMgrId('');
        }
        fetchRaiders();
      } else {
        const errData = await res.json();
        alert('Error: ' + errData.message);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to change manager.');
    } finally {
      setIsChangingMgr(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg md:text-xl font-bold tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
          <Bike className="w-5 h-5 text-cyan-500" />
          <span>Raider Deployment (Asst Manager Hub)</span>
        </h2>
        <button
          className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-violet-500/10 flex items-center gap-2 text-sm"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="w-4 h-4" />
          <span>Deploy New Raider</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm relative flex items-center">
        <Search className="w-4 h-4 text-slate-400 absolute left-8 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by Raider name, phone, Plate No, or Tempo Reg No..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800/80 rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 text-sm"
        />
      </div>

      {/* Raiders Table */}
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
        ) : raiders.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">No raiders registered. Click 'Deploy New Raider' to register one.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800/80">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm">
              <thead className="bg-slate-100 dark:bg-slate-955">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Photo</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Plate No</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tempo Reg No</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Appointment Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900/20">
                {raiders.map((raider) => (
                  <tr
                    key={raider.id}
                    className="hover:bg-slate-100/40 dark:hover:bg-slate-800/20 cursor-pointer transition-colors"
                    onClick={() => viewRaiderDetails(raider.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {raider.passport_url ? (
                        <img src={raider.passport_url} alt="Raider" className="w-10 h-10 rounded-full object-cover border border-slate-300 dark:border-slate-707" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                          <User className="w-5 h-5" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-850 dark:text-white">{raider.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300">{raider.phone || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-650 dark:text-emerald-400 border border-emerald-500/20">
                        {raider.plate_no || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300">{raider.tempo_reg_no || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300">{raider.date_of_appointment || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <Link
                        href={`/raiders/${raider.id}`}
                        className="bg-slate-105 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-707 transition-all flex items-center gap-1.5 inline-flex"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View file</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Raider Modal */}
      {showAddModal && (
        <ModalPortal>
          <div 
            className="fixed inset-0 bg-slate-900/60 dark:bg-slate-955/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setShowAddModal(false)}
          >
            <div 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-none rounded-[0.5rem] p-6 shadow-2xl space-y-6 my-auto"
              onClick={(e) => e.stopPropagation()}
            >
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Deploy New Raider & Asset</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Asset finance deployment & guarantor verification</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-lg">
                  Step {step} of 4
                </span>
                <button className="text-slate-400 hover:text-slate-650 dark:hover:text-white" onClick={() => setShowAddModal(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div className="bg-slate-50 dark:bg-slate-955/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5">
              <div className="relative w-full px-8">
                {/* Progress bar line */}
                <div className="absolute top-1/2 left-12 right-12 h-0.5 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0" />
                <div
                  className="absolute top-1/2 h-0.5 bg-cyan-600 -translate-y-1/2 transition-all duration-300 z-0"
                  style={{
                    left: '52px',
                    right: step === 1
                      ? 'calc(100% - 52px)'
                      : step === 2
                        ? 'calc(66.6% - 20px)'
                        : step === 3
                          ? 'calc(33.3% - 20px)'
                          : '52px',
                  }}
                />

                <div className="relative flex justify-between w-full z-10">
                  {steps.map((s) => {
                    const Icon = s.icon;
                    const isCompleted = step > s.number;
                    const isActive = step === s.number;

                    return (
                      <div key={s.number} className="relative z-10 flex flex-col items-center gap-1.5">
                        <button
                          type="button"
                          disabled={s.number > step}
                          onClick={() => setStep(s.number)}
                          className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 font-semibold text-xs ${isCompleted
                            ? 'bg-cyan-600 border-cyan-600 text-white'
                            : isActive
                              ? 'bg-white dark:bg-slate-900 border-cyan-600 text-cyan-600 dark:text-white shadow-lg shadow-cyan-500/10 scale-110'
                              : 'bg-slate-50 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-slate-400'
                            }`}
                        >
                          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : s.number}
                        </button>
                        <span className={`text-[10px] font-bold tracking-wide uppercase ${isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400'}`}>
                          {s.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {formError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center justify-between animate-fadeIn">
                  <span>{formError}</span>
                  <button type="button" onClick={() => setFormError(null)} className="text-rose-400 hover:text-rose-600 font-bold ml-2">×</button>
                </div>
              )}

              {/* STEP 1: Raider Profile Info */}
              {step === 1 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-2">1. Raider Profile Info</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Passport upload preview widget */}
                    <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-950/40 text-center space-y-3">
                      {passportPreview ? (
                        <img
                          src={passportPreview}
                          alt="Passport Preview"
                          className="w-24 h-24 rounded-2xl object-cover border border-cyan-500/30 shadow-md"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-800">
                          <User className="w-8 h-8" />
                        </div>
                      )}
                      <label className="cursor-pointer bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs px-3 py-1.5 rounded-xl transition-all shadow-md">
                        Upload Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Inputs */}
                    <div className="md:col-span-2 space-y-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase">Full Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={(e) => {
                            setFormError(null);
                            handleInputChange(e);
                          }}
                          required
                          className={`bg-slate-50 dark:bg-slate-955 border ${formError && !formData.name.trim() ? 'border-rose-500 focus:ring-rose-500/50' : 'border-slate-300 dark:border-slate-800 focus:ring-cyan-500/50'} rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 text-sm transition-colors`}
                          placeholder="Raider Full Name"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase">Phone Number</label>
                        <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm" placeholder="Raider Phone Number" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase">Date of Appointment</label>
                      <input type="date" name="date_of_appointment" value={formData.date_of_appointment} onChange={handleInputChange} className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase">Government ID (NIN/DL)</label>
                      <input type="text" name="govt_id" value={formData.govt_id} onChange={handleInputChange} className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm" placeholder="License/ID Details" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase">Assign Manager</label>
                      <select name="md_leader_id" value={formData.md_leader_id} onChange={handleInputChange} className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm">
                        <option value="">-- Choose Manager --</option>
                        {managers.map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Address</label>
                    <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm" placeholder="Home Address details" />
                  </div>
                </div>
              )}

              {/* STEP 2: Guarantor & Shortee Surety Info */}
              {step === 2 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-2">2. Guarantor & Shortee Surety Info</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Guarantor Full Name</label>
                      <input type="text" name="guarantor_name" value={formData.guarantor_name} onChange={handleInputChange} className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm" placeholder="Guarantor Name" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Guarantor Phone No</label>
                      <input type="text" name="guarantor_phone" value={formData.guarantor_phone} onChange={handleInputChange} className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm" placeholder="Guarantor Phone" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Guarantor ID</label>
                      <input type="text" name="guarantor_gov_id" value={formData.guarantor_gov_id} onChange={handleInputChange} className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm" placeholder="Guarantor NIN/DL Details" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">* Shortee Surety Full Name</label>
                      <input type="text" name="surety_name" value={formData.surety_name} onChange={handleInputChange} className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm" placeholder="Surety Full Name" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">* Shortee Surety Phone No</label>
                      <input type="text" name="surety_phone" value={formData.surety_phone} onChange={handleInputChange} className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm" placeholder="Surety Phone No" />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Vehicle Specifications & Asset Finance */}
              {step === 3 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-2">3. Vehicle Specifications & Asset Finance</h4>

                  <div className="bg-slate-50 dark:bg-slate-955/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Select Available Client Vehicle *
                    </label>
                    <select
                      name="client_motorcycle_id"
                      value={formData.client_motorcycle_id}
                      onChange={(e) => handleVehicleSelect(e.target.value)}
                      className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm"
                    >
                      <option value="">-- Choose unassigned vehicle --</option>
                      {availableVehicles.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.client_name || 'Client'} &bull; {v.file_no || 'No File'} &bull; {v.vehicle_type_chassis || 'N/A'}
                        </option>
                      ))}
                    </select>
                    {availableVehicles.length === 0 && (
                      <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                        No unassigned client vehicles available. Assign a tricycle to a client first.
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">TEMPO REG NO</label>
                      <input type="text" name="tempo_reg_no" value={formData.tempo_reg_no} onChange={handleInputChange} className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-505/50 text-sm" placeholder="Tempo Reg No" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">PLATE REG NO</label>
                      <input type="text" name="plate_no" value={formData.plate_no} onChange={handleInputChange} className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm" placeholder="Plate Number" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Date of Purchase</label>
                      <input type="date" name="date_of_purchase" value={formData.date_of_purchase} onChange={handleInputChange} className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-505/50 text-sm" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Duration of Completion</label>
                      <input type="date" name="duration_of_completion" value={formData.duration_of_completion} onChange={handleInputChange} className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm" />
                      {formData.duration_of_completion && (() => {
                        const days = getRemainingDays(formData.duration_of_completion);
                        if (days === null) return null;
                        return (
                          <span className={`text-[10px] font-bold mt-1 uppercase tracking-wide ${days > 0 ? 'text-emerald-600 dark:text-emerald-400' :
                            days === 0 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
                            }`}>
                            {days > 0 ? `${days} days remaining` :
                              days === 0 ? 'Completes today' : `Overdue by ${Math.abs(days)} days`}
                          </span>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Asset Cost / Amount (₦)</label>
                      <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm" placeholder="e.g. 850000" />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Preview & Confirm */}
              {step === 4 && (
                <div className="space-y-4 animate-fadeIn">
                  <h4 className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-2">4. Preview & Confirm Details</h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 dark:bg-slate-955/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col items-center justify-center p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/50 text-center">
                      {passportPreview ? (
                        <img src={passportPreview} alt="Raider Preview" className="w-24 h-24 rounded-2xl object-cover border border-cyan-500/30 shadow-md" />
                      ) : (
                        <div className="w-24 h-24 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400">
                          <User className="w-8 h-8" />
                        </div>
                      )}
                      <span className="text-[10px] font-bold text-slate-450 dark:text-slate-550 uppercase tracking-wider mt-2">Raider Photo</span>
                    </div>

                    <div className="md:col-span-2 space-y-4">
                      <div>
                        <h5 className="text-[10px] font-bold text-cyan-600 dark:text-cyan-455 uppercase tracking-wider mb-2">Raider Profile</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                          <div><span className="text-slate-400 dark:text-slate-500 font-semibold">Name:</span> <span className="font-bold text-slate-700 dark:text-white">{formData.name}</span></div>
                          <div><span className="text-slate-400 dark:text-slate-500 font-semibold">Phone:</span> <span className="font-bold text-slate-700 dark:text-white">{formData.phone || 'N/A'}</span></div>
                          <div><span className="text-slate-400 dark:text-slate-500 font-semibold">Appointment:</span> <span className="font-bold text-slate-700 dark:text-white">{formData.date_of_appointment || 'N/A'}</span></div>
                          <div><span className="text-slate-400 dark:text-slate-500 font-semibold">Govt ID:</span> <span className="font-bold text-slate-700 dark:text-white">{formData.govt_id || 'N/A'}</span></div>
                          <div><span className="text-slate-400 dark:text-slate-500 font-semibold">Manager:</span> <span className="font-bold text-slate-700 dark:text-white">{managers.find(m => m.id.toString() === formData.md_leader_id)?.name || 'None'}</span></div>
                          <div className="sm:col-span-2"><span className="text-slate-400 dark:text-slate-500 font-semibold">Address:</span> <span className="font-bold text-slate-700 dark:text-white">{formData.address || 'N/A'}</span></div>
                        </div>
                      </div>

                      <hr className="border-slate-200 dark:border-slate-800" />

                      <div>
                        <h5 className="text-[10px] font-bold text-cyan-600 dark:text-cyan-455 uppercase tracking-wider mb-2">Guarantor & Surety</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                          <div><span className="text-slate-400 dark:text-slate-500 font-semibold">Guarantor:</span> <span className="font-bold text-slate-700 dark:text-white">{formData.guarantor_name || 'N/A'}</span></div>
                          <div><span className="text-slate-400 dark:text-slate-500 font-semibold">Guarantor Phone:</span> <span className="font-bold text-slate-700 dark:text-white">{formData.guarantor_phone || 'N/A'}</span></div>
                          <div><span className="text-slate-400 dark:text-slate-500 font-semibold">Guarantor ID:</span> <span className="font-bold text-slate-700 dark:text-white">{formData.guarantor_gov_id || 'N/A'}</span></div>
                          <div><span className="text-slate-400 dark:text-slate-500 font-semibold">Surety:</span> <span className="font-bold text-slate-700 dark:text-white">{formData.surety_name || 'N/A'}</span></div>
                          <div><span className="text-slate-400 dark:text-slate-500 font-semibold">Surety Phone:</span> <span className="font-bold text-slate-700 dark:text-white">{formData.surety_phone || 'N/A'}</span></div>
                        </div>
                      </div>

                      <hr className="border-slate-200 dark:border-slate-800" />

                      <div>
                        <h5 className="text-[10px] font-bold text-cyan-600 dark:text-cyan-455 uppercase tracking-wider mb-2">Vehicle Specifications & Asset Finance</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-1.5 text-xs">
                          <div><span className="text-slate-400 dark:text-slate-500 font-semibold">Tempo Reg:</span> <span className="font-bold text-slate-700 dark:text-white">{formData.tempo_reg_no || 'N/A'}</span></div>
                          <div><span className="text-slate-400 dark:text-slate-500 font-semibold">Plate Reg:</span> <span className="font-bold text-slate-700 dark:text-white">{formData.plate_no || 'N/A'}</span></div>
                          <div><span className="text-slate-400 dark:text-slate-500 font-semibold">Purchase Date:</span> <span className="font-bold text-slate-700 dark:text-white">{formData.date_of_purchase || 'N/A'}</span></div>
                          <div><span className="text-slate-400 dark:text-slate-500 font-semibold">Duration:</span> <span className="font-bold text-slate-700 dark:text-white">{formData.duration_of_completion || 'N/A'}</span></div>
                          <div><span className="text-slate-400 dark:text-slate-500 font-semibold">Asset Cost:</span> <span className="font-bold text-emerald-600 dark:text-emerald-400">₦{formData.amount ? Number(formData.amount).toLocaleString() : 'N/A'}</span></div>
                          <div><span className="text-slate-400 dark:text-slate-500 font-semibold">Source Vehicle:</span> <span className="font-bold text-slate-700 dark:text-white">{availableVehicles.find(v => v.id.toString() === formData.client_motorcycle_id)?.file_no || 'Manual entry'}</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-800 pt-6">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={step === 1}
                  className="px-6 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 text-slate-700 dark:text-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                {step < 4 ? (
                  <button
                    key="next-btn"
                    type="button"
                    onClick={handleNext}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2"
                  >
                    <span>Next Step</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    key="submit-btn"
                    type="submit"
                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2"
                    disabled={isSubmitting}
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSubmitting ? 'Saving...' : 'Deploy Raider Asset'}</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </ModalPortal>
      )}

    </div>
  );
}

