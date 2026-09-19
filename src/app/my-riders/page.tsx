'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Bike,
  Coins,
  TrendingUp,
  Search,
  Phone,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  PlusCircle,
  X,
  Receipt,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface RaiderItem {
  id: number;
  name: string;
  phone?: string;
  plate_no?: string;
  chassis?: string;
  tempo_reg_no?: string;
  client_name?: string;
  amount?: number | string;
  passport_url?: string;
  vehicle_type_chassis?: string;
  vehicle_file_no?: string;
  vehicle_daily_return?: number | string;
  daily_return?: number | string;
}

interface PaymentItem {
  id: number;
  date: string;
  amount: number;
  receipt_no: string;
  raider_id?: number;
  comments?: string;
}

export default function MyRidersPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [raiders, setRaiders] = useState<RaiderItem[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [managerName, setManagerName] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Log Return Modal
  const [showLogReturnModal, setShowLogReturnModal] = useState(false);
  const [selectedRaiderForReturn, setSelectedRaiderForReturn] = useState<RaiderItem | null>(null);
  const [returnForm, setReturnForm] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    receipt_no: '',
    comments: ''
  });
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  // Calendar Modal State
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedRaiderForCalendar, setSelectedRaiderForCalendar] = useState<RaiderItem | null>(null);
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState<Date>(new Date());

  // Payment Details Modal State
  const [showPaymentDetailsModal, setShowPaymentDetailsModal] = useState(false);
  const [selectedPaymentDetails, setSelectedPaymentDetails] = useState<{ payment: PaymentItem; rider: RaiderItem } | null>(null);

  // Custom In-App Notice Modal State (replaces browser alerts)
  const [noticeModal, setNoticeModal] = useState<{ isOpen: boolean; title: string; message: string; type?: 'warning' | 'info' | 'error' | 'success' }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning'
  });

  const getRiderMetrics = (raiderId: number, dateOfPurchase?: string) => {
    const rPayments = payments.filter(p => p.raider_id === raiderId);
    const paymentDates = new Set(rPayments.map(p => p.date));
    const today = new Date();

    let startDate = dateOfPurchase ? new Date(dateOfPurchase) : new Date(today.getFullYear(), today.getMonth(), 1);
    if (isNaN(startDate.getTime())) {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    }

    const startDateStr = startDate.toISOString().split('T')[0];
    const totalPaidDays = paymentDates.size;
    let totalMissedDays = 0;

    let cursor = new Date(startDate);
    while (cursor <= today) {
      const cursorStr = cursor.toISOString().split('T')[0];
      if (!paymentDates.has(cursorStr)) {
        totalMissedDays++;
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    return { totalPaidDays, totalMissedDays, rPayments, paymentDates, startDate, startDateStr };
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('currentUser');
      if (!storedUser) return;
      const parsed = JSON.parse(storedUser);
      setCurrentUser(parsed);
      setManagerName(parsed.name || 'Manager');
      loadManagerData(parsed.id);
    }
  }, []);

  const loadManagerData = async (managerId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/md-leaders/${managerId}`);
      if (res.ok) {
        const data = await res.json();
        setRaiders(data.raiders || []);
        setPayments(data.payments || []);
        if (data.name) setManagerName(data.name);
      }
    } catch (err) {
      console.error('Error fetching manager squad riders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenLogReturn = (raider: RaiderItem, targetDate?: string) => {
    const rawStart = (raider as any)?.date_of_purchase || (raider as any)?.date_of_appointment;
    let startDateStr = '';
    if (rawStart) {
      const d = new Date(rawStart);
      if (!isNaN(d.getTime())) {
        startDateStr = d.toISOString().split('T')[0];
      }
    }
    const todayStr = new Date().toISOString().split('T')[0];

    if (!startDateStr || startDateStr > todayStr) {
      setNoticeModal({
        isOpen: true,
        title: 'Rider Has Not Started Yet',
        message: `Rider "${raider.name}" has not started work yet.\n\nStart Date: ${startDateStr || 'Not assigned'}\n\nYou cannot record daily returns until the rider's official start date begins.`,
        type: 'warning'
      });
      return;
    }

    if (targetDate && startDateStr && targetDate < startDateStr) {
      setNoticeModal({
        isOpen: true,
        title: 'Invalid Return Date',
        message: `Cannot record daily return for ${targetDate}.\n\nThis date is BEFORE ${raider.name}'s start date of ${startDateStr}.`,
        type: 'warning'
      });
      return;
    }

    setSelectedRaiderForReturn(raider);
    const rate = getRiderDailyRate(raider);
    setReturnForm({
      date: targetDate || todayStr,
      amount: rate > 0 ? String(rate) : '',
      receipt_no: `REC-${Date.now().toString().slice(-6)}`,
      comments: targetDate ? `Return logged for ${targetDate}` : ''
    });
    setShowLogReturnModal(true);
  };

  const handleSaveReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedRaiderForReturn) return;

    // Check if return date is before rider start date
    const rawStart = (selectedRaiderForReturn as any)?.date_of_purchase || (selectedRaiderForReturn as any)?.date_of_appointment;
    let startDateStr = '';
    if (rawStart) {
      const d = new Date(rawStart);
      if (!isNaN(d.getTime())) {
        startDateStr = d.toISOString().split('T')[0];
      }
    }

    if (startDateStr && returnForm.date < startDateStr) {
      setNoticeModal({
        isOpen: true,
        title: 'Prior Date Restricted',
        message: `Cannot record daily return for ${returnForm.date}.\n\nThis collection date is BEFORE ${selectedRaiderForReturn.name}'s start date of ${startDateStr}. Returns can only be recorded from the start date onwards.`,
        type: 'warning'
      });
      return;
    }

    // Check for duplicate return on the exact same date (already completed)
    const existingPayment = payments.find(
      p => p.raider_id === selectedRaiderForReturn.id && p.date === returnForm.date
    );
    if (existingPayment) {
      setNoticeModal({
        isOpen: true,
        title: 'Return Already Completed',
        message: `A return payment of ₦${Number(existingPayment.amount).toLocaleString()} has ALREADY been completed for ${selectedRaiderForReturn.name} on ${returnForm.date}.\n\nDaily return for this date is completed and cannot be recorded again.`,
        type: 'warning'
      });
      return;
    }

    setIsSubmittingReturn(true);

    try {
      const res = await fetch('/api/accounts/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: returnForm.date,
          amount: parseFloat(returnForm.amount) || 0,
          raider_id: selectedRaiderForReturn.id,
          md_leader_id: currentUser.id,
          receipt_no: returnForm.receipt_no,
          comments: returnForm.comments
        })
      });

      if (res.ok) {
        setShowLogReturnModal(false);
        setNoticeModal({
          isOpen: true,
          title: 'Return Logged Successfully',
          message: `Daily return of ₦${parseFloat(returnForm.amount || '0').toLocaleString()} has been logged for ${selectedRaiderForReturn.name} (${returnForm.date}).`,
          type: 'success'
        });
        loadManagerData(currentUser.id);
      } else {
        const errData = await res.json();
        setNoticeModal({
          isOpen: true,
          title: 'Error Logging Return',
          message: errData.message || 'An error occurred while saving the daily return.',
          type: 'error'
        });
      }
    } catch (err) {
      console.error(err);
      setNoticeModal({
        isOpen: true,
        title: 'Submission Failed',
        message: 'Failed to log return due to a network connection issue.',
        type: 'error'
      });
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  const filteredRaiders = raiders.filter(r => {
    const q = searchQuery.toLowerCase();
    return (
      r.name?.toLowerCase().includes(q) ||
      r.plate_no?.toLowerCase().includes(q) ||
      r.tempo_reg_no?.toLowerCase().includes(q) ||
      r.chassis?.toLowerCase().includes(q) ||
      r.client_name?.toLowerCase().includes(q)
    );
  });

  const getRiderDailyRate = (r: RaiderItem) => {
    const vReturn = parseFloat(String(r.vehicle_daily_return || r.daily_return || 0));
    if (vReturn > 0) return vReturn;

    const rAmt = parseFloat(String(r.amount || 0));
    if (rAmt > 0 && rAmt < 30000) return rAmt;

    return 0;
  };

  const totalExpectedDaily = raiders.reduce((sum, r) => sum + getRiderDailyRate(r), 0);
  const totalCollectedAllTime = payments.reduce((sum, p) => sum + (parseFloat(String(p.amount || 0)) || 0), 0);
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCollected = payments
    .filter(p => p.date === todayStr)
    .reduce((sum, p) => sum + (parseFloat(String(p.amount || 0)) || 0), 0);

  const calendarDays = (() => {
    if (!currentCalendarMonth) return [];
    const year = currentCalendarMonth.getFullYear();
    const month = currentCalendarMonth.getMonth();
    const startOfMonth = new Date(year, month, 1);
    const days = [];

    const startDayOfWeek = startOfMonth.getDay();
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    const lastDay = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= lastDay; d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  })();

  const calendarMonthName = currentCalendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  const navigateMonth = (direction: number) => {
    const next = new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth() + direction, 1);
    setCurrentCalendarMonth(next);
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 md:p-10 mx-auto space-y-5 min-h-screen">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-violet-600/10 dark:bg-violet-600/20 border border-violet-500/30 text-violet-600 dark:text-violet-400 rounded-2xl shadow-sm">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                My Squad Riders
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Assigned riders for <strong>{managerName}</strong> &bull; Daily returns collection portal.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search rider, plate, tempo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            />
          </div>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Squad Riders</span>
            <Users className="w-5 h-5 text-violet-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {raiders.length} <span className="text-xs font-semibold text-slate-400">Riders</span>
          </div>
          <p className="text-[11px] text-slate-400">Active riders assigned to your squad</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Expected Daily Returns</span>
            <Coins className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            ₦{totalExpectedDaily.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400">Sum of daily collection rates from squad</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Today's Collections Logged</span>
            <TrendingUp className="w-5 h-5 text-cyan-500" />
          </div>
          <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400">
            ₦{todayCollected.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400">Total collected today ({todayStr})</p>
        </div>
      </div>

      {/* Riders Grid List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bike className="w-5 h-5 text-violet-500" />
            <span>Assigned Squad Riders ({filteredRaiders.length})</span>
          </h2>
        </div>

        {filteredRaiders.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-3">
            <Bike className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Squad Riders Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery ? 'No riders matched your search query.' : 'There are currently no riders assigned to your squad. Contact admin to assign riders to your manager account.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRaiders.map((r) => {
              const riderPayments = payments.filter(p => p.raider_id === r.id);
              const totalRiderCollected = riderPayments.reduce((sum, p) => sum + (parseFloat(String(p.amount || 0)) || 0), 0);
              const lastPayment = riderPayments.length > 0 ? riderPayments[0] : null;
              const hasPaidToday = riderPayments.some(p => p.date === todayStr);
              const metrics = getRiderMetrics(r.id, (r as any).date_of_purchase || (r as any).date_of_appointment);
              const rawStart = (r as any).date_of_purchase || (r as any).date_of_appointment;
              let startDateStr = '';
              if (rawStart) {
                const d = new Date(rawStart);
                if (!isNaN(d.getTime())) {
                  startDateStr = d.toISOString().split('T')[0];
                }
              }
              const hasStarted = Boolean(startDateStr && startDateStr <= todayStr);

              return (
                <div
                  key={r.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between space-y-3 group relative overflow-hidden"
                >
                  {/* Top Gradient Bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 via-indigo-500 to-emerald-500" />

                  <div className="space-y-3 pt-0.5">
                    {/* Header: Passport Avatar + Name + Badges */}
                    <div className="flex items-start gap-3">
                      {/* Avatar Ring Container */}
                      <div className="relative shrink-0">
                        {r.passport_url ? (
                          <img
                            src={r.passport_url}
                            alt={r.name}
                            className="w-12 h-12 rounded-xl object-cover ring-2 ring-violet-500/20 dark:ring-violet-500/40 shadow-sm group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/10 via-indigo-500/10 to-violet-600/20 ring-2 ring-violet-500/20 dark:ring-violet-500/40 flex items-center justify-center text-violet-600 dark:text-violet-400 font-bold shadow-sm group-hover:scale-105 transition-transform duration-300">
                            <User className="w-6 h-6" />
                          </div>
                        )}
                        {/* Status Pulse Dot */}
                        <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${hasPaidToday ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                            {r.name}
                          </h3>
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border border-slate-700/50 shrink-0">
                            #{r.tempo_reg_no || 'RIDER'}
                          </span>
                        </div>

                        {r.client_name && (
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                            🏢 <span className="text-slate-700 dark:text-slate-300 font-semibold">{r.client_name}</span>
                          </p>
                        )}

                        <div className="mt-1.5 flex flex-wrap items-center gap-1">
                          {hasPaidToday ? (
                            <span className="text-[9px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" /> Paid Today
                            </span>
                          ) : (
                            <span className="text-[9px] bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-0.5">
                              <AlertCircle className="w-2.5 h-2.5 text-amber-500" /> Pending Return
                            </span>
                          )}

                          {metrics.totalMissedDays > 0 ? (
                            <span className="text-[9px] bg-rose-500/15 text-rose-700 dark:text-rose-300 font-bold px-2 py-0.5 rounded-full border border-rose-500/30 flex items-center gap-0.5">
                              <AlertCircle className="w-2.5 h-2.5 text-rose-500" /> {metrics.totalMissedDays} {metrics.totalMissedDays === 1 ? 'Missed Day' : 'Missed Days'}
                            </span>
                          ) : (
                            <span className="text-[9px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" /> 0 Missed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Specifications Unified Box */}
                    <div className="bg-slate-50 dark:bg-slate-955/60 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-2.5 space-y-1.5 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Tempo Reg</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white text-[11px] truncate block">{r.tempo_reg_no || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Plate Number</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white text-[11px] truncate block">{r.plate_no || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="border-t border-slate-200/60 dark:border-slate-800/60 pt-1.5 grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Chassis / Vehicle</span>
                          <span className="font-mono font-semibold text-slate-700 dark:text-slate-300 text-[11px] truncate block" title={r.chassis || r.vehicle_type_chassis}>{r.chassis || r.vehicle_type_chassis || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Phone Contact</span>
                          {r.phone ? (
                            <a href={`tel:${r.phone}`} className="font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 text-[11px] truncate">
                              <Phone className="w-2.5 h-2.5 shrink-0" /> <span className="truncate">{r.phone}</span>
                            </a>
                          ) : (
                            <span className="text-slate-400 text-[11px]">N/A</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Financial Summary: Daily Collection Rate & Total Rider Collected */}
                    <div className="space-y-1.5">
                      <div className="grid grid-cols-2 gap-1.5 text-xs">
                        <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-teal-500/10 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-500/25 dark:border-emerald-500/35 rounded-xl py-1.5 px-2.5">
                          <span className="text-[9px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-extrabold block">
                            Daily Rate
                          </span>
                          <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                            {getRiderDailyRate(r) > 0 ? `₦${getRiderDailyRate(r).toLocaleString()}` : '₦0'}
                          </span>
                        </div>

                        <div className="bg-gradient-to-r from-violet-500/10 via-indigo-500/5 to-purple-500/10 dark:from-violet-950/40 dark:to-purple-950/30 border border-violet-500/25 dark:border-violet-500/35 rounded-xl py-1.5 px-2.5">
                          <span className="text-[9px] uppercase tracking-wider text-violet-700 dark:text-violet-400 font-extrabold block">
                            Total Collected
                          </span>
                          <span className="text-sm font-black text-violet-600 dark:text-violet-400 tracking-tight">
                            ₦{totalRiderCollected.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {lastPayment && (
                        <div className="flex items-center justify-between text-[9px] text-slate-500 dark:text-slate-400 px-0.5">
                          <span>Last Logged Return:</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            ₦{Number(lastPayment.amount).toLocaleString()} <span className="text-slate-400 font-normal">({lastPayment.date})</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRaiderForCalendar(r);
                        setCurrentCalendarMonth(new Date());
                        setShowCalendarModal(true);
                      }}
                      className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 font-bold text-xs py-2 px-2.5 rounded-xl transition-all border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 active:scale-95 shadow-2xs"
                    >
                      <Calendar className="w-3.5 h-3.5 text-violet-500" />
                      <span>View Calendar</span>
                    </button>
                    {hasStarted ? (
                      <button
                        type="button"
                        onClick={() => handleOpenLogReturn(r)}
                        className="flex-1 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs py-2 px-2.5 rounded-xl transition-all shadow-md hover:shadow-violet-500/25 active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Log Return</span>
                      </button>
                    ) : (
                      <div className="flex-1 bg-slate-100 dark:bg-slate-800/60 text-amber-600 dark:text-amber-400 font-semibold text-[11px] py-2 px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-center flex items-center justify-center gap-1">
                        <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
                        <span>Not Started Yet</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Log Daily Return Modal */}
      {showLogReturnModal && selectedRaiderForReturn && (() => {
        const rawStart = (selectedRaiderForReturn as any)?.date_of_purchase || (selectedRaiderForReturn as any)?.date_of_appointment;
        let selectedRiderStartDateStr = '';
        if (rawStart) {
          const d = new Date(rawStart);
          if (!isNaN(d.getTime())) {
            selectedRiderStartDateStr = d.toISOString().split('T')[0];
          }
        }

        return (
          <div
            className="fixed inset-0 bg-slate-900/60 dark:bg-slate-955/80 backdrop-blur-sm z-[999999] flex items-center justify-center p-4"
            onClick={() => !isSubmittingReturn && setShowLogReturnModal(false)}
          >
            <div
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Log Return for {selectedRaiderForReturn.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Tempo Reg: {selectedRaiderForReturn.tempo_reg_no || 'N/A'} {selectedRiderStartDateStr ? `• Started: ${selectedRiderStartDateStr}` : ''}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLogReturnModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveReturn} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                    Collection Date *
                  </label>
                  <input
                    type="date"
                    required
                    min={selectedRiderStartDateStr || undefined}
                    max={todayStr}
                    value={returnForm.date}
                    onChange={(e) => setReturnForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium"
                  />
                  {selectedRiderStartDateStr && (
                    <p className="text-[10px] text-slate-400 mt-1">
                      Start Date: <strong>{selectedRiderStartDateStr}</strong>. Dates prior to start date cannot be recorded.
                    </p>
                  )}
                </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  Amount Collected (₦) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  placeholder="e.g. 15000"
                  value={returnForm.amount}
                  onChange={(e) => setReturnForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  Receipt No / Reference
                </label>
                <input
                  type="text"
                  placeholder="Receipt number"
                  value={returnForm.receipt_no}
                  onChange={(e) => setReturnForm(prev => ({ ...prev, receipt_no: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  Comments / Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional payment notes..."
                  value={returnForm.comments}
                  onChange={(e) => setReturnForm(prev => ({ ...prev, comments: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLogReturnModal(false)}
                  disabled={isSubmittingReturn}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReturn}
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-md flex items-center gap-1.5"
                >
                  {isSubmittingReturn ? 'Logging...' : 'Save Return'}
                </button>
              </div>
            </form>
          </div>
        </div>
        );
      })()}

      {/* Calendar Tracking Modal */}
      {showCalendarModal && selectedRaiderForCalendar && (() => {
        const r = selectedRaiderForCalendar;
        const { totalPaidDays, totalMissedDays, rPayments, paymentDates, startDate, startDateStr } = getRiderMetrics(r.id, (r as any).date_of_purchase || (r as any).date_of_appointment);
        const todayStr = new Date().toISOString().split('T')[0];

        const startYearMonth = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
        const currentYearMonth = `${currentCalendarMonth.getFullYear()}-${String(currentCalendarMonth.getMonth() + 1).padStart(2, '0')}`;
        const canNavigateBack = currentYearMonth > startYearMonth;

        return (
          <div
            className="fixed inset-0 bg-slate-900/60 dark:bg-slate-955/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setShowCalendarModal(false)}
          >
            <div
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-5 my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  {r.passport_url ? (
                    <img src={r.passport_url} alt={r.name} className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center font-bold">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{r.name}</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Started: <strong>{startDateStr}</strong> &bull; Tempo: <strong>#{r.tempo_reg_no || 'N/A'}</strong>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCalendarModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Metrics Cards */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 p-3 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider block">Paid Days</span>
                    <span className="text-lg font-black">{totalPaidDays} Days</span>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>

                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 p-3 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider block">Missed Days</span>
                    <span className="text-lg font-black">{totalMissedDays} Days</span>
                  </div>
                  <AlertCircle className="w-6 h-6 text-rose-500" />
                </div>
              </div>

              {/* Calendar Container */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-955/30">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{calendarMonthName}</span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      disabled={!canNavigateBack}
                      onClick={() => canNavigateBack && navigateMonth(-1)}
                      className={`p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-all ${canNavigateBack ? 'hover:bg-slate-100 opacity-100 cursor-pointer' : 'opacity-30 cursor-not-allowed'}`}
                      title={canNavigateBack ? 'Previous month' : `Cannot go before rider start date (${startDateStr})`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateMonth(1)}
                      className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-2">
                  <span>Sun</span>
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                </div>

                <div className="grid grid-cols-7 gap-1.5">
                  {calendarDays.map((day, idx) => {
                    if (!day) return <div key={`empty-${idx}`} className="aspect-square" />;

                    const dayStr = day.toISOString().split('T')[0];
                    const isPaid = paymentDates.has(dayStr);
                    const isBeforeStart = dayStr < startDateStr;

                    let bgClass = "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-violet-100 dark:hover:bg-violet-900/40";
                    let title = "Future Day - Click to log return";

                    if (isBeforeStart) {
                      bgClass = "bg-slate-100/40 dark:bg-slate-900/40 text-slate-300 dark:text-slate-700";
                      title = `Before Rider Start Date (${startDateStr})`;
                    } else if (isPaid) {
                      bgClass = "bg-emerald-500 text-white font-bold shadow-sm hover:bg-emerald-600";
                      title = "Return Logged (Paid) - Click to view details";
                    } else if (dayStr <= todayStr) {
                      bgClass = "bg-rose-500 text-white font-bold shadow-sm hover:bg-rose-600";
                      title = "Missed Return - Click to log return for this day";
                    }

                    return (
                      <button
                        type="button"
                        key={dayStr}
                        title={title}
                        disabled={isBeforeStart}
                        onClick={() => {
                          if (isBeforeStart) return;
                          if (isPaid) {
                            const pm = rPayments.find(p => p.date === dayStr);
                            if (pm) {
                              setSelectedPaymentDetails({ payment: pm, rider: r });
                              setShowPaymentDetailsModal(true);
                            }
                          } else {
                            handleOpenLogReturn(r, dayStr);
                          }
                        }}
                        className={`aspect-square flex items-center justify-center rounded-lg text-xs select-none transition-all ${isBeforeStart ? 'cursor-not-allowed opacity-40' : 'cursor-pointer hover:scale-105 active:scale-95'} ${bgClass}`}
                      >
                        {day.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center justify-around text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Paid Inflow</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>Missed Return</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <span>Future</span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* View Return Details Modal */}
      {showPaymentDetailsModal && selectedPaymentDetails && (
        <div
          className="fixed inset-0 bg-slate-900/60 dark:bg-slate-955/80 backdrop-blur-sm z-[999999] flex items-center justify-center p-4"
          onClick={() => setShowPaymentDetailsModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Logged Daily Return
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Payment receipt details for {selectedPaymentDetails.rider.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentDetailsModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-500/20 p-4 rounded-xl text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 tracking-wider block">
                  Amount Collected
                </span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  ₦{Number(selectedPaymentDetails.payment.amount).toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                  Date: <strong>{selectedPaymentDetails.payment.date}</strong>
                </span>
              </div>

              <div className="space-y-2 bg-slate-50 dark:bg-slate-955/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                <div className="flex justify-between items-center border-b border-slate-200/60 dark:border-slate-800/60 pb-1.5">
                  <span className="text-slate-400 font-semibold">Rider Name:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedPaymentDetails.rider.name}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200/60 dark:border-slate-800/60 py-1.5">
                  <span className="text-slate-400 font-semibold">Receipt No:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedPaymentDetails.payment.receipt_no || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200/60 dark:border-slate-800/60 py-1.5">
                  <span className="text-slate-400 font-semibold">Tempo Reg:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">#{selectedPaymentDetails.rider.tempo_reg_no || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-start pt-1.5">
                  <span className="text-slate-400 font-semibold">Notes / Comments:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300 text-right max-w-[180px]">{selectedPaymentDetails.payment.comments || 'No comments'}</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentDetailsModal(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs shadow-md"
                >
                  Close Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom In-App Notice / Alert Modal */}
      {noticeModal.isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 dark:bg-slate-955/80 backdrop-blur-sm z-[9999999] flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setNoticeModal(prev => ({ ...prev, isOpen: false }))}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl space-y-4 my-auto relative text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center">
              {noticeModal.type === 'success' ? (
                <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500 ring-8 ring-emerald-500/5">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
              ) : noticeModal.type === 'error' ? (
                <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500 ring-8 ring-rose-500/5">
                  <AlertCircle className="w-8 h-8" />
                </div>
              ) : (
                <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500 ring-8 ring-amber-500/5">
                  <AlertCircle className="w-8 h-8" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {noticeModal.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium whitespace-pre-line leading-relaxed">
                {noticeModal.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setNoticeModal(prev => ({ ...prev, isOpen: false }))}
              className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 ${
                noticeModal.type === 'success'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : noticeModal.type === 'error'
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold'
              }`}
            >
              OK, Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
