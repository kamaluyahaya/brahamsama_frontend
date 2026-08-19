'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
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
  Users
} from 'lucide-react';
import ReportPreviewModal from '@/components/ReportPreviewModal';

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
  chassis: string;
  tempo_reg_no: string;
  engine_no: string;
  plate_no: string;
  date_of_purchase: string;
  date_of_resell: string;
  duration_of_completion: string;
  amount: number;
  receipt_no: string;
  passport_url?: string;
  surety_name?: string | null;
  surety_phone?: string | null;
  md_leader_id?: number | null;
  md_leader_name?: string | null;
  payments?: Payment[];
  compliance?: Compliance[];
}

export default function RaidersPage() {
  const [raiders, setRaiders] = useState<Raider[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
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
    }
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
    date_of_appointment: '',
    govt_id: '',
    guarantor_name: '',
    guarantor_phone: '',
    guarantor_gov_id: '',
    chassis: '',
    tempo_reg_no: '',
    engine_no: '',
    plate_no: '',
    date_of_purchase: '',
    date_of_resell: '',
    duration_of_completion: '',
    amount: '',
    receipt_no: '',
    surety_name: '',
    surety_phone: '',
    md_leader_id: '',
  });

  const [passportFile, setPassportFile] = useState<File | null>(null);
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
    fetchManagers();
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

  async function viewRaiderDetails(id: number) {
    try {
      const res = await fetch(`/api/raiders/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedRaider(data);
        setShowDetailModal(true);
      }
    } catch (err) {
      console.error('Error fetching raider details:', err);
    }
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
    if (step === 1 && !formData.name) {
      alert('Raider Full Name is required.');
      return;
    }
    if (step < 4) {
      setStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return alert('Name is required');
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
        setFormData({
          name: '',
          phone: '',
          address: '',
          date_of_appointment: '',
          govt_id: '',
          guarantor_name: '',
          guarantor_phone: '',
          guarantor_gov_id: '',
          chassis: '',
          tempo_reg_no: '',
          engine_no: '',
          plate_no: '',
          date_of_purchase: '',
          date_of_resell: '',
          duration_of_completion: '',
          amount: '',
          receipt_no: '',
          surety_name: '',
          surety_phone: '',
          md_leader_id: '',
        });
        setPassportFile(null);
        setPassportPreview(null);
        fetchRaiders();
      } else {
        const errData = await res.json();
        alert('Error: ' + errData.message);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save raider record');
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
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
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Chassis</th>
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
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300">{raider.chassis || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300">{raider.date_of_appointment || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="bg-slate-105 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-707 transition-all flex items-center gap-1.5"
                        onClick={() => viewRaiderDetails(raider.id)}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View file</span>
                      </button>
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
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-955/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-none rounded-[0.5rem] p-6 shadow-2xl space-y-6">
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
                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm" placeholder="Raider Full Name" />
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Chassis Serial No</label>
                      <input type="text" name="chassis" value={formData.chassis} onChange={handleInputChange} className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm" placeholder="Chassis No" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">TEMPO REG NO</label>
                      <input type="text" name="tempo_reg_no" value={formData.tempo_reg_no} onChange={handleInputChange} className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-505/50 text-sm" placeholder="Tempo Reg No" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Engine Serial No</label>
                      <input type="text" name="engine_no" value={formData.engine_no} onChange={handleInputChange} className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-505/50 text-sm" placeholder="Engine No" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">PLATE REG NO</label>
                      <input type="text" name="plate_no" value={formData.plate_no} onChange={handleInputChange} className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm" placeholder="Plate Number" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Date of Purchase</label>
                      <input type="date" name="date_of_purchase" value={formData.date_of_purchase} onChange={handleInputChange} className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-505/50 text-sm" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase">Date of Resell</label>
                      <input type="date" name="date_of_resell" value={formData.date_of_resell} onChange={handleInputChange} className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-505/50 text-sm" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Asset Cost / Amount (₦)</label>
                      <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm" placeholder="e.g. 850000" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase">Receipt Number</label>
                      <input type="text" name="receipt_no" value={formData.receipt_no} onChange={handleInputChange} className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm" placeholder="Initial Receipt No" />
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
                          <div><span className="text-slate-400 dark:text-slate-500 font-semibold">Chassis No:</span> <span className="font-bold text-slate-700 dark:text-white">{formData.chassis || 'N/A'}</span></div>
                          <div><span className="text-slate-400 dark:text-slate-500 font-semibold">Tempo Reg:</span> <span className="font-bold text-slate-700 dark:text-white">{formData.tempo_reg_no || 'N/A'}</span></div>
                          <div><span className="text-slate-400 dark:text-slate-500 font-semibold">Engine No:</span> <span className="font-bold text-slate-700 dark:text-white">{formData.engine_no || 'N/A'}</span></div>
                          <div><span className="text-slate-400 dark:text-slate-500 font-semibold">Plate Reg:</span> <span className="font-bold text-slate-700 dark:text-white">{formData.plate_no || 'N/A'}</span></div>
                          <div><span className="text-slate-400 dark:text-slate-500 font-semibold">Purchase Date:</span> <span className="font-bold text-slate-700 dark:text-white">{formData.date_of_purchase || 'N/A'}</span></div>
                          <div><span className="text-slate-400 dark:text-slate-500 font-semibold">Resell Date:</span> <span className="font-bold text-slate-700 dark:text-white">{formData.date_of_resell || 'N/A'}</span></div>
                          <div><span className="text-slate-400 dark:text-slate-500 font-semibold">Duration:</span> <span className="font-bold text-slate-700 dark:text-white">{formData.duration_of_completion || 'N/A'}</span></div>
                          <div><span className="text-slate-400 dark:text-slate-500 font-semibold">Asset Cost:</span> <span className="font-bold text-emerald-600 dark:text-emerald-400">₦{formData.amount ? Number(formData.amount).toLocaleString() : 'N/A'}</span></div>
                          <div><span className="text-slate-400 dark:text-slate-500 font-semibold">Receipt No:</span> <span className="font-bold text-slate-700 dark:text-white">{formData.receipt_no || 'N/A'}</span></div>
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
      )}

      {/* Detail View Modal */}
      {showDetailModal && selectedRaider && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-955/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-3xl max-h-[90vh] flex flex-col rounded-[0.5rem] shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 p-6 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Raider File Details: {selectedRaider.name}</h3>
              <button className="text-slate-400 hover:text-slate-655 dark:hover:text-white" onClick={() => setShowDetailModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 scrollbar-none space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center gap-2 text-center md:border-r border-slate-150 dark:border-slate-850 pr-4">
                  {selectedRaider.passport_url ? (
                    <img src={selectedRaider.passport_url} alt={selectedRaider.name} className="w-32 h-32 rounded-2xl object-cover border-2 border-cyan-500/40 shadow-xl" />
                  ) : (
                    <div className="w-32 h-32 rounded-2xl bg-slate-100 dark:bg-slate-955 flex items-center justify-center text-slate-505 text-4xl border border-slate-200 dark:border-slate-80">
                      <User className="w-12 h-12" />
                    </div>
                  )}
                  <span className="text-xs text-slate-500 mt-1 font-semibold uppercase">Raider Photo ID</span>
                </div>

                <div className="md:col-span-2 space-y-3 text-sm">
                  <div className="grid grid-cols-2 py-1 border-b border-slate-150 dark:border-slate-850">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Phone Number:</span>
                    <span className="text-slate-800 dark:text-white">{selectedRaider.phone || 'N/A'}</span>
                  </div>
                  <div className="grid grid-cols-2 py-1 border-b border-slate-150 dark:border-slate-850">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Government ID:</span>
                    <span className="text-slate-800 dark:text-white">{selectedRaider.govt_id || 'N/A'}</span>
                  </div>
                  <div className="grid grid-cols-2 py-1 border-b border-slate-150 dark:border-slate-850">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Appointment Date:</span>
                    <span className="text-slate-800 dark:text-white">{selectedRaider.date_of_appointment || 'N/A'}</span>
                  </div>
                  <div className="grid grid-cols-2 py-1 border-b border-slate-150 dark:border-slate-850">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Assigned Manager:</span>
                    <span className="text-slate-800 dark:text-white font-bold">{selectedRaider.md_leader_name || 'None'}</span>
                  </div>
                  <div className="flex flex-col py-1">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Home Address:</span>
                    <span className="text-slate-800 dark:text-white mt-1">{selectedRaider.address || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-200 dark:border-slate-800 pt-6">
                <div className="space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-955/40 border border-slate-200 dark:border-slate-855 rounded-xl p-4 space-y-2">
                    <h4 className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      <span>Asset Guarantor & Shortee Surety</span>
                    </h4>
                    <p className="text-sm text-slate-700 dark:text-slate-305"><strong>Guarantor:</strong> {selectedRaider.guarantor_name || 'N/A'} ({selectedRaider.guarantor_phone || 'N/A'})</p>
                    <p className="text-sm text-slate-700 dark:text-slate-305"><strong>Guarantor ID:</strong> {selectedRaider.guarantor_gov_id || 'N/A'}</p>
                    <div className="border-t border-slate-200 dark:border-slate-800 my-2 pt-2">
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">* Shortee Surety</p>
                      <p className="text-sm text-slate-700 dark:text-slate-305"><strong>Name:</strong> {selectedRaider.surety_name || 'N/A'}</p>
                      <p className="text-sm text-slate-700 dark:text-slate-305"><strong>Phone:</strong> {selectedRaider.surety_phone || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-955/40 border border-slate-200 dark:border-slate-855 rounded-xl p-4 space-y-2">
                    <h4 className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Bike className="w-3.5 h-3.5" />
                      <span>Asset Specifications</span>
                    </h4>
                    <p className="text-sm text-slate-700 dark:text-slate-305"><strong>Plate Number:</strong> {selectedRaider.plate_no || 'N/A'}</p>
                    <p className="text-sm text-slate-700 dark:text-slate-305"><strong>Chassis Serial:</strong> {selectedRaider.chassis || 'N/A'}</p>
                    <p className="text-sm text-slate-700 dark:text-slate-305"><strong>Engine Serial:</strong> {selectedRaider.engine_no || 'N/A'}</p>
                    <p className="text-sm text-slate-700 dark:text-slate-305"><strong>Tempo Reg:</strong> {selectedRaider.tempo_reg_no || 'N/A'}</p>
                    <p className="text-sm text-slate-700 dark:text-slate-305"><strong>Purchase Date:</strong> {selectedRaider.date_of_purchase || 'N/A'}</p>
                    <p className="text-sm text-slate-700 dark:text-slate-305"><strong>Resell Date:</strong> {selectedRaider.date_of_resell || 'N/A'}</p>
                    <p className="text-sm text-slate-700 dark:text-slate-305"><strong>Contract Terms:</strong> {selectedRaider.duration_of_completion || 'N/A'}</p>
                    <p className="text-sm text-slate-700 dark:text-slate-305"><strong>Asset Cost:</strong> ₦{selectedRaider.amount ? selectedRaider.amount.toLocaleString() : 'N/A'}</p>
                    <p className="text-sm text-slate-700 dark:text-slate-305"><strong>Receipt Details:</strong> {selectedRaider.receipt_no || 'N/A'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-955/40 border border-slate-200 dark:border-slate-855 rounded-xl p-4 space-y-2">
                    <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Returns/Payments History</span>
                    </h4>
                    {selectedRaider.payments && selectedRaider.payments.length === 0 ? (
                      <p className="text-xs text-slate-500">No payment logs recorded yet.</p>
                    ) : (
                      <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                        {selectedRaider.payments?.map(pay => (
                          <div key={pay.id} className="flex justify-between items-center p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs">
                            <span className="text-slate-600 dark:text-slate-300">📅 {pay.date} (Rec: {pay.receipt_no})</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">₦{pay.amount.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-955/40 border border-slate-200 dark:border-slate-855 rounded-xl p-4 space-y-2">
                    <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Queries & Compliance History</span>
                    </h4>
                    {selectedRaider.compliance && selectedRaider.compliance.length === 0 ? (
                      <p className="text-xs text-slate-500">No compliance logs issued.</p>
                    ) : (
                      <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                        {selectedRaider.compliance?.map(comp => (
                          <div key={comp.id} className="p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{comp.subject}</span>
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${comp.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                }`}>{comp.status}</span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">{comp.details}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-800 p-6 pt-4">
                <button
                  className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5"
                  onClick={() => deleteRaider(selectedRaider.id)}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Raider</span>
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
                    className="bg-slate-200 hover:bg-slate-350 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all"
                    onClick={() => setShowDetailModal(false)}
                  >
                    Close File
                  </button>
                </div>
              </div>
            </div>
          </div>
      )}

          {selectedRaider && (
            <ReportPreviewModal
              isOpen={showReportModal}
              onClose={() => setShowReportModal(false)}
              title="Raider Asset Profile Report"
              passportUrl={selectedRaider.passport_url}
              recordData={[
                { label: 'Raider Name', value: selectedRaider.name },
                { label: 'Phone Number', value: selectedRaider.phone },
                { label: 'Appointment Date', value: selectedRaider.date_of_appointment },
                { label: 'Assigned Manager', value: selectedRaider.md_leader_name || 'None' },
                { label: 'Home Address', value: selectedRaider.address },
                { label: 'Government ID', value: selectedRaider.govt_id },
                { label: 'Guarantor Name', value: selectedRaider.guarantor_name },
                { label: 'Guarantor Phone', value: selectedRaider.guarantor_phone },
                { label: 'Guarantor Govt ID', value: selectedRaider.guarantor_gov_id },
                { label: 'Shortee Surety Name', value: selectedRaider.surety_name },
                { label: 'Shortee Surety Phone', value: selectedRaider.surety_phone },
                { label: 'Chassis Serial No', value: selectedRaider.chassis },
                { label: 'Tempo Registration No', value: selectedRaider.tempo_reg_no },
                { label: 'Engine Serial No', value: selectedRaider.engine_no },
                { label: 'Plate Registration No', value: selectedRaider.plate_no },
                { label: 'Asset Purchase Date', value: selectedRaider.date_of_purchase },
                { label: 'Asset Resell Date', value: selectedRaider.date_of_resell },
                { label: 'Contract terms', value: selectedRaider.duration_of_completion },
                { label: 'Asset Cost', value: selectedRaider.amount ? `₦${selectedRaider.amount.toLocaleString()}` : 'N/A' },
                { label: 'Initial Receipt Details', value: selectedRaider.receipt_no },
              ]}
              tables={[
                {
                  title: 'Returns / Payments History',
                  headers: ['Date', 'Receipt No', 'Amount'],
                  rows: (selectedRaider.payments || []).map(p => [
                    p.date,
                    p.receipt_no,
                    `₦${p.amount.toLocaleString()}`
                  ])
                },
                {
                  title: 'Queries & Compliance History',
                  headers: ['Date', 'Subject', 'Details', 'Status'],
                  rows: (selectedRaider.compliance || []).map(c => [
                    c.date,
                    c.subject,
                    c.details,
                    c.status
                  ])
                }
              ]}
            />
          )}
        </div>
      );
}

