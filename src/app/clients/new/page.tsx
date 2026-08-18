'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  ArrowLeft,
  ArrowRight,
  Save,
  CreditCard,
  Briefcase,
  CheckCircle2
} from 'lucide-react';

export default function NewClientPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [raiders, setRaiders] = useState<any[]>([]);
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [passportPreview, setPassportPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email_address: '',
    residential_address: '',
    office: '',
    id_details: '',
    bank_name: '',
    account_name: '',
    account_number: '',
    file_no: '',
    date_of_purchase: '',
    date_of_first_disbursement: '',
    final_disbursement: '',
    vehicle_type_chassis: '',
    no_of_motorcycles: '',
    tempo_no: '',
    total_disbursed_amount: '',
    receipt_no: '',
    duration_of_completion: '',
  });

  useEffect(() => {
    async function fetchRaiders() {
      try {
        const res = await fetch('/api/raiders');
        if (res.ok) {
          const data = await res.json();
          setRaiders(data);
        }
      } catch (err) {
        console.error('Error fetching raiders:', err);
      }
    }
    fetchRaiders();
  }, []);

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
      alert('Client Name is required.');
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
    if (!formData.name) {
      alert('Client Name is required');
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

      const res = await fetch('/api/clients', {
        method: 'POST',
        body: data,
      });

      if (res.ok) {
        router.push('/clients');
      } else {
        const errData = await res.json();
        alert('Error: ' + errData.message);
      }
    } catch (err) {
      console.error('Error creating client:', err);
      alert('Failed to save client record');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Steps definitions
  const steps = [
    { number: 1, name: 'Personal Profile', icon: User },
    { number: 2, name: 'Financial details', icon: CreditCard },
    { number: 3, name: 'Asset & Finance', icon: Briefcase },
    { number: 4, name: 'Preview & Confirm', icon: CheckCircle2 },
  ];

  return (
    <div className=" mx-auto space-y-6 py-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href="/clients"
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200 rounded-xl transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Log New Client Record</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Clerks and Secretarial entry desk</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-3 py-1 bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 rounded-lg">
          Step {step} of 4
        </span>
      </div>

      {/* Stepper Progress Bar */}
      <div className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
        <div className="relative w-full px-8">
          {/* Progress bar line */}
          <div className="absolute top-1/2 left-12 right-12 h-0.5 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0" />
          <div
            className="absolute top-1/2 h-0.5 bg-violet-600 -translate-y-1/2 transition-all duration-300 z-0"
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
            {steps.map((s, idx) => {
              const Icon = s.icon;
              const isCompleted = step > s.number;
              const isActive = step === s.number;

              return (
                <div key={s.number} className="relative z-10 flex flex-col items-center gap-2">
                  <button
                    type="button"
                    disabled={s.number > step}
                    onClick={() => setStep(s.number)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 font-semibold text-sm ${isCompleted
                      ? 'bg-violet-600 border-violet-600 text-white'
                      : isActive
                        ? 'bg-white dark:bg-slate-900 border-violet-600 text-violet-600 dark:text-white shadow-lg shadow-violet-500/10 scale-110'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400'
                      }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : s.number}
                  </button>
                  <span className={`text-xs font-semibold tracking-wide ${isActive ? 'text-violet-600 dark:text-violet-400 font-bold' : 'text-slate-400'}`}>
                    {s.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: Personal Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-4">1. Personal & Contact Info</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Passport upload preview widget */}
                  <div className="md:col-span-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-950/40 text-center space-y-3">
                    {passportPreview ? (
                      <img
                        src={passportPreview}
                        alt="Passport Preview"
                        className="w-28 h-28 rounded-2xl object-cover border border-violet-500/30 shadow-md"
                      />
                    ) : (
                      <div className="w-28 h-28 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-800">
                        <User className="w-10 h-10" />
                      </div>
                    )}
                    <label className="cursor-pointer bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md">
                      Upload Passport
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
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                        placeholder="e.g. John Doe"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Phone Number</label>
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                          placeholder="e.g. +234..."
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Email Address</label>
                        <input
                          type="email"
                          name="email_address"
                          value={formData.email_address}
                          onChange={handleInputChange}
                          className="bg-slate-50 dark:bg-slate-955 border border-slate-305 border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                          placeholder="e.g. john@example.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Government ID Details</label>
                  <input
                    type="text"
                    name="id_details"
                    value={formData.id_details}
                    onChange={handleInputChange}
                    className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                    placeholder="NIN / Driver's License No"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Office / Branch</label>
                  <input
                    type="text"
                    name="office"
                    value={formData.office}
                    onChange={handleInputChange}
                    className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                    placeholder="e.g. Head Office"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Residential Address</label>
                <textarea
                  name="residential_address"
                  value={formData.residential_address}
                  onChange={handleInputChange}
                  className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                  placeholder="Home Address details"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* STEP 2: Financial Details */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-sm font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-4">2. Financials & Bank Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-505 dark:text-slate-400 uppercase">Bank Name</label>
                    <input
                      type="text"
                      name="bank_name"
                      value={formData.bank_name}
                      onChange={handleInputChange}
                      className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                      placeholder="e.g. Zenith Bank"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-505 dark:text-slate-400 uppercase">Account Name</label>
                    <input
                      type="text"
                      name="account_name"
                      value={formData.account_name}
                      onChange={handleInputChange}
                      className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                      placeholder="e.g. Account Name"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-505 dark:text-slate-400 uppercase">Account Number</label>
                    <input
                      type="text"
                      name="account_number"
                      value={formData.account_number}
                      onChange={handleInputChange}
                      className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                      placeholder="e.g. 1012345678"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Asset Details */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-sm font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-4">3. Purchase, Asset & Disbursement Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">File No</label>
                    <input
                      type="text"
                      name="file_no"
                      value={formData.file_no}
                      onChange={handleInputChange}
                      className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                      placeholder="e.g. BS/CL-409"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Vehicle Type / Chassis No</label>
                    <input
                      type="text"
                      name="vehicle_type_chassis"
                      value={formData.vehicle_type_chassis}
                      onChange={handleInputChange}
                      className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                      placeholder="e.g. Bajaj Boxer - CH492"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">No of Motorcycles</label>
                    <input
                      type="number"
                      name="no_of_motorcycles"
                      value={formData.no_of_motorcycles}
                      onChange={handleInputChange}
                      className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                      placeholder="e.g. 1"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Select Tempo No.</label>
                  <select
                    name="tempo_no"
                    value={formData.tempo_no}
                    onChange={handleInputChange}
                    className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                  >
                    <option value="">-- Choose Tempo --</option>
                    {raiders.filter(r => r.tempo_reg_no).map(r => (
                      <option key={r.id} value={r.tempo_reg_no}>{r.tempo_reg_no} ({r.name})</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Date of Purchase</label>
                  <input
                    type="date"
                    name="date_of_purchase"
                    value={formData.date_of_purchase}
                    onChange={handleInputChange}
                    className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-505/50 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-505 dark:text-slate-400 uppercase">Duration of Completion</label>
                  <input
                    type="text"
                    name="duration_of_completion"
                    value={formData.duration_of_completion}
                    onChange={handleInputChange}
                    className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                    placeholder="e.g. 18 Months"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase">Date of First Disb.</label>
                  <input
                    type="date"
                    name="date_of_first_disbursement"
                    value={formData.date_of_first_disbursement}
                    onChange={handleInputChange}
                    className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-550/50 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase">Date of Last Disb.</label>
                  <input
                    type="date"
                    name="final_disbursement"
                    value={formData.final_disbursement}
                    onChange={handleInputChange}
                    className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-550/50 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Total Disbursed (₦)</label>
                  <input
                    type="number"
                    name="total_disbursed_amount"
                    value={formData.total_disbursed_amount}
                    onChange={handleInputChange}
                    className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                    placeholder="e.g. 500000"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Receipt No</label>
                  <input
                    type="text"
                    name="receipt_no"
                    value={formData.receipt_no}
                    onChange={handleInputChange}
                    className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                    placeholder="e.g. REC-1192"
                  />
                </div>
              </div>
            </div>
          )}
          {/* STEP 4: Preview & Confirmation */}
          {step === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-sm font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-2">4. Review & Confirm Details</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Please review all information carefully before deploying the client record to the system.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile Card */}
                <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 p-4 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-violet-600 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>Personal Profile</span>
                  </h4>
                  <div className="flex gap-4 items-center">
                    {passportPreview ? (
                      <img src={passportPreview} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-violet-500/20 shadow-sm" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                        <User className="w-6 h-6" />
                      </div>
                    )}
                    <div className="text-xs space-y-1">
                      <p><strong>Name:</strong> {formData.name}</p>
                      <p><strong>Phone:</strong> {formData.phone || 'N/A'}</p>
                      <p><strong>Email:</strong> {formData.email_address || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="text-xs space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <p><strong>Government ID:</strong> {formData.id_details || 'N/A'}</p>
                    <p><strong>Office / Branch:</strong> {formData.office || 'N/A'}</p>
                    <p><strong>Residential Address:</strong> {formData.residential_address || 'N/A'}</p>
                  </div>
                </div>

                {/* Financial details Card */}
                <div className="bg-slate-50 dark:bg-slate-955/40 border border-slate-200 dark:border-slate-850 p-4 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-violet-600 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-1 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Bank & Account Details</span>
                  </h4>
                  <div className="text-xs space-y-2">
                    <p><strong>Bank Name:</strong> {formData.bank_name || 'N/A'}</p>
                    <p><strong>Account Name:</strong> {formData.account_name || 'N/A'}</p>
                    <p><strong>Account Number:</strong> {formData.account_number || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Asset & Finance Card */}
              <div className="bg-slate-50 dark:bg-slate-955/40 border border-slate-200 dark:border-slate-850 p-4 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-violet-600 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-1 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Asset purchase & Finance Details</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <p><strong>File Number:</strong> {formData.file_no || 'N/A'}</p>
                    <p><strong>Chassis / Vehicle:</strong> {formData.vehicle_type_chassis || 'N/A'}</p>
                    <p><strong>No of Motorcycles:</strong> {formData.no_of_motorcycles || 'N/A'}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p><strong>Select Tempo No.:</strong> {formData.tempo_no || 'N/A'}</p>
                    <p><strong>Date of Purchase:</strong> {formData.date_of_purchase || 'N/A'}</p>
                    <p><strong>Contract Term:</strong> {formData.duration_of_completion || 'N/A'}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p><strong>First Disbursement:</strong> {formData.date_of_first_disbursement || 'N/A'}</p>
                    <p><strong>Last Disbursement:</strong> {formData.final_disbursement || 'N/A'}</p>
                    <p><strong>Total Disbursed:</strong> ₦{formData.total_disbursed_amount ? parseInt(formData.total_disbursed_amount).toLocaleString() : '0'}</p>
                    <p><strong>Receipt Number:</strong> {formData.receipt_no || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-800 pt-6 mt-4">
            <button
              type="button"
              onClick={step === 1 ? () => router.push('/clients') : handlePrev}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{step === 1 ? 'Cancel' : 'Previous Step'}</span>
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-1.5 shadow-md shadow-violet-500/10"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 shadow-md shadow-violet-500/10"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving Record...' : 'Deploy Client Profile'}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
