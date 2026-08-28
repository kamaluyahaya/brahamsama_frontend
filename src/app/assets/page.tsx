'use client';

import React, { useEffect, useState } from 'react';
import {
  Wallet,
  Bike,
  Coins,
  TrendingUp,
  ChevronDown,
  FileText,
  CalendarDays,
  CheckCircle2
} from 'lucide-react';

interface Motorcycle {
  id: number;
  file_no: string;
  vehicle_type_chassis: string;
  chassis_no: string;
  date_of_purchase: string;
  duration_of_completion: string;
  date_of_first_disbursement: string;
  final_disbursement: string;
  total_disbursed_amount: string | number;
  utility_charges: string | number;
  daily_return: string | number;
}

export default function AssetsFinancialPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('currentUser');
      if (!storedUser) return;
      const parsed = JSON.parse(storedUser);
      setCurrentUser(parsed);

      if (parsed.role === 'Client') {
        const clientId = parsed.id;

        Promise.all([
          fetch(`/api/clients/${clientId}/motorcycles`).then(res => res.ok ? res.json() : []),
          fetch(`/api/clients/${clientId}/returns`).then(res => res.ok ? res.json() : [])
        ])
          .then(([mcs, rts]) => {
            setMotorcycles(mcs);
            setReturns(rts);
          })
          .catch(err => console.error('Error fetching assets data:', err))
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }
  }, []);

  const toAmount = (value: string | number) => parseFloat(String(value || 0)) || 0;

  const totalAssetValue = motorcycles.reduce((sum, mc) => sum + toAmount(mc.total_disbursed_amount), 0);
  const totalUtilityCharges = motorcycles.reduce((sum, mc) => sum + toAmount(mc.utility_charges), 0);
  const totalReturns = returns.reduce((sum, r) => sum + toAmount(r.amount), 0);

  const formatNaira = (value: number) => `₦${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const stats = [
    {
      label: 'Total Tricycles',
      value: loading ? '...' : String(motorcycles.length),
      sub: 'Registered under your profile',
      icon: <Bike className="w-4 h-4 text-amber-500" />,
      border: 'border-l-amber-500 hover:border-l-amber-400'
    },
    {
      label: 'Total Asset Value',
      value: loading ? '...' : formatNaira(totalAssetValue),
      sub: 'Sum of disbursed fleet purchase',
      icon: <TrendingUp className="w-4 h-4 text-violet-500" />,
      border: 'border-l-violet-500 hover:border-l-violet-400'
    },
    {
      label: 'Utility Charges',
      value: loading ? '...' : formatNaira(totalUtilityCharges),
      sub: 'Total utility charges on fleet',
      icon: <Coins className="w-4 h-4 text-emerald-500" />,
      border: 'border-l-emerald-500 hover:border-l-emerald-400'
    },
    {
      label: 'Returns Collected',
      value: loading ? '...' : formatNaira(totalReturns),
      sub: 'Cumulative fleet returns logged',
      icon: <TrendingUp className="w-4 h-4 text-cyan-500" />,
      border: 'border-l-cyan-500 hover:border-l-cyan-400'
    }
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-violet-600 via-violet-500 to-cyan-500 text-white rounded-2xl p-6 shadow-xl shadow-violet-500/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden border border-white/10">
        <div className="space-y-1.5 z-10">
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight mb-0">
            Client Assets & Financial Overview
          </h2>
          <p className="text-xs text-white/80 font-medium tracking-wide">
            {currentUser ? `Viewing fleet summary for ${currentUser.name}` : 'Viewing fleet summary'} &bull; Total tricycle holdings and per-unit details.
          </p>
        </div>
        <div className="flex items-center gap-2 z-10 shrink-0 bg-white/10 border border-white/20 px-4 py-2.5 rounded-xl">
          <Wallet className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Assets Ledger</span>
        </div>
      </div>

      <h3 className="text-lg md:text-xl font-bold tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
        <Wallet className="w-5 h-5 text-violet-500" />
        <span>Fleet Asset Summary</span>
      </h3>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(s => (
          <div key={s.label} className={`bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm border-l-4 ${s.border} transition-all duration-300`}>
            <div className="flex justify-between items-start">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{s.label}</div>
              {s.icon}
            </div>
            <div className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white mt-2">{s.value}</div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Tricycle Details */}
      <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Bike className="w-5 h-5 text-indigo-500" />
            <span>Tricycle Details ({motorcycles.length})</span>
          </h3>
          {!loading && motorcycles.length > 0 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Fleet Registered
            </span>
          )}
        </div>

        {loading ? (
          <div className="space-y-4 animate-pulse p-2">
            {[1, 2].map(i => (
              <div key={i} className="h-16 bg-slate-150 dark:bg-slate-800/50 rounded-xl w-full" />
            ))}
          </div>
        ) : motorcycles.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <Bike className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
            <p className="text-sm text-slate-400 dark:text-slate-500">
              No tricycles registered under your profile yet.
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-600 max-w-sm mx-auto">
              Tricycles assigned to you by the operations center will appear here with their complete asset and financial details.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {motorcycles.map((mc) => {
              const isOpen = expandedId === mc.id;
              return (
                <div
                  key={mc.id}
                  className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-all"
                >
                  {/* Collapsed Summary Row */}
                  <button
                    onClick={() => setExpandedId(isOpen ? null : mc.id)}
                    className="w-full text-left bg-slate-50/50 dark:bg-slate-950/30 hover:bg-slate-100/60 dark:hover:bg-slate-850/40 transition-colors px-5 py-4 flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
                      <Bike className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="font-bold text-slate-800 dark:text-white text-sm">{mc.file_no || 'N/A'}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{mc.vehicle_type_chassis || 'N/A'}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        Chassis: {mc.chassis_no || 'N/A'} &bull; Purchased: {mc.date_of_purchase || 'N/A'}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-sm text-slate-800 dark:text-white">{formatNaira(toAmount(mc.total_disbursed_amount))}</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">Asset Value</div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Expanded Details */}
                  {isOpen && (
                    <div className="border-t border-slate-200 dark:border-slate-800 px-5 py-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                        <div className="space-y-3">
                          <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/50">
                            <span className="font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">File Number</span>
                            <span className="text-slate-800 dark:text-white font-bold">{mc.file_no || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/50">
                            <span className="font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Vehicle Type / Chassis</span>
                            <span className="text-slate-800 dark:text-white">{mc.vehicle_type_chassis || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/50">
                            <span className="font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Chassis Number</span>
                            <span className="text-slate-800 dark:text-white font-mono">{mc.chassis_no || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/50">
                            <span className="font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Contract Term</span>
                            <span className="text-slate-800 dark:text-white">{mc.duration_of_completion || 'N/A'}</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/50">
                            <span className="font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Date of Purchase</span>
                            <span className="text-slate-800 dark:text-white flex items-center gap-1.5">
                              <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                              {mc.date_of_purchase || 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/50">
                            <span className="font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">First Disbursement</span>
                            <span className="text-slate-800 dark:text-white">{mc.date_of_first_disbursement || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/50">
                            <span className="font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Final Disbursement</span>
                            <span className="text-slate-800 dark:text-white">{mc.final_disbursement || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Financial Breakdown */}
                      <div className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-violet-600/5 border border-violet-500/15 rounded-xl p-4">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            Total Disbursed (Asset Value)
                          </div>
                          <div className="text-xl font-extrabold text-slate-800 dark:text-white mt-1">{formatNaira(toAmount(mc.total_disbursed_amount))}</div>
                        </div>
                        <div className="bg-emerald-600/5 border border-emerald-500/15 rounded-xl p-4">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <Coins className="w-3 h-3" />
                            Utility Charges
                          </div>
                          <div className="text-xl font-extrabold text-slate-800 dark:text-white mt-1">{formatNaira(toAmount(mc.utility_charges))}</div>
                        </div>
                        <div className="bg-cyan-600/5 border border-cyan-500/15 rounded-xl p-4">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Daily Return
                          </div>
                          <div className="text-xl font-extrabold text-slate-800 dark:text-white mt-1">{formatNaira(toAmount(mc.daily_return))}</div>
                        </div>
                        <div className="bg-slate-100/60 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" />
                            Contract Term
                          </div>
                          <div className="text-xl font-extrabold text-slate-800 dark:text-white mt-1">{mc.duration_of_completion || 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}