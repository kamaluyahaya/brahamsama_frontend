'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bike,
  Wallet,
  Coins,
  TrendingUp,
  CheckCircle2,
  CalendarDays,
  FileText,
  Users,
  ChevronDown,
  Search,
  Receipt,
  Layers,
  ShieldCheck
} from 'lucide-react';

interface Motorcycle {
  id: number | string;
  client_id: number;
  file_no: string;
  vehicle_type_chassis: string;
  chassis_no: string;
  date_of_purchase: string;
  duration_of_completion: string;
  date_of_first_disbursement: string;
  final_disbursement: string;
  total_disbursed_amount: number | string;
  utility_charges: number | string;
  daily_return: number | string;
  created_at?: string;
}

interface ReturnItem {
  id: number;
  amount: number | string;
  date: string;
  raider_id?: number;
  raider_name?: string;
  raider_plate_no?: string;
  raider_chassis?: string;
  receipt_no?: string;
  md_leader_name?: string;
}

interface RaiderItem {
  id: number;
  name: string;
  phone: string;
  plate_no: string;
  chassis: string;
  client_motorcycle_id?: number;
}

export default function MyVehiclesPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [clientsList, setClientsList] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | number>('');
  const [clientProfile, setClientProfile] = useState<any>(null);
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [raiders, setRaiders] = useState<RaiderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedMcId, setExpandedMcId] = useState<number | string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('currentUser');
      if (!storedUser) return;
      const parsed = JSON.parse(storedUser);
      setCurrentUser(parsed);

      if (parsed.role === 'Manager') {
        router.push('/my-riders');
        return;
      }

      if (parsed.role === 'Client') {
        setSelectedClientId(parsed.id);
        loadClientVehicles(parsed.id);
      } else {
        fetch('/api/clients')
          .then(res => res.ok ? res.json() : [])
          .then(data => {
            setClientsList(data);
            if (data.length > 0) {
              setSelectedClientId(data[0].id);
              loadClientVehicles(data[0].id);
            } else {
              setLoading(false);
            }
          })
          .catch(err => {
            console.error('Error fetching clients:', err);
            setLoading(false);
          });
      }
    }
  }, []);

  const loadClientVehicles = (cId: string | number) => {
    setLoading(true);
    Promise.all([
      fetch(`/api/clients/${cId}`).then(res => res.ok ? res.json() : null),
      fetch(`/api/clients/${cId}/motorcycles`).then(res => res.ok ? res.json() : []),
      fetch(`/api/clients/${cId}/returns`).then(res => res.ok ? res.json() : []),
      fetch(`/api/clients/${cId}/raiders`).then(res => res.ok ? res.json() : [])
    ])
      .then(([clientData, mcs, rts, rds]) => {
        setClientProfile(clientData);
        setMotorcycles(mcs);
        setReturns(rts);
        setRaiders(rds);
      })
      .catch(err => console.error('Error loading vehicle breakdown:', err))
      .finally(() => setLoading(false));
  };

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedClientId(val);
    if (val) loadClientVehicles(val);
  };

  const toNum = (val: any) => parseFloat(String(val || 0)) || 0;

  // Compute breakdown metrics
  const totalAmountPurchase = motorcycles.reduce((sum, mc) => sum + toNum(mc.total_disbursed_amount), 0) || toNum(clientProfile?.total_disbursed_amount);
  const totalUtilityCharges = motorcycles.reduce((sum, mc) => sum + toNum(mc.utility_charges), 0) || toNum(clientProfile?.utility_charges);
  const totalDailyReturnRate = motorcycles.reduce((sum, mc) => sum + toNum(mc.daily_return), 0);
  const totalAmountCollected = returns.reduce((sum, r) => sum + toNum(r.amount), 0);
  const totalVehiclesCount = motorcycles.length > 0
    ? motorcycles.length
    : (parseInt(clientProfile?.no_of_motorcycles || '0') || (clientProfile?.chassis_no || clientProfile?.vehicle_type_chassis ? 1 : 0));

  const formatNaira = (val: number) => `₦${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Filter motorcycles based on search query
  const filteredMotorcycles = motorcycles.filter(mc => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (mc.file_no && mc.file_no.toLowerCase().includes(q)) ||
      (mc.vehicle_type_chassis && mc.vehicle_type_chassis.toLowerCase().includes(q)) ||
      (mc.chassis_no && mc.chassis_no.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 text-white rounded-2xl p-6 shadow-xl shadow-violet-500/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden border border-white/10">
        <div className="space-y-1.5 z-10">
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight mb-0 flex items-center gap-2.5">
            <Bike className="w-7 h-7 text-cyan-300" />
            <span>My Vehicles &amp; Fleet Breakdown</span>
          </h2>
          <p className="text-xs text-white/80 font-medium tracking-wide max-w-2xl">
            {clientProfile ? `Viewing assigned vehicles for ${clientProfile.name}` : (currentUser ? `Viewing vehicles for ${currentUser.name}` : 'Viewing vehicles breakdown')} &bull; Per-vehicle purchase value, utility fees, daily rates &amp; total returns collected.
          </p>
        </div>

        {currentUser?.role !== 'Client' && clientsList.length > 0 && (
          <div className="z-10 shrink-0 bg-white/10 border border-white/20 px-3 py-2 rounded-xl flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-white/90">Select Client:</span>
            <select
              value={selectedClientId}
              onChange={handleClientChange}
              className="bg-slate-900/80 text-white text-xs font-bold rounded-lg px-3 py-1.5 border border-white/30 focus:outline-none"
            >
              {clientsList.map(c => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                  {c.name} ({c.file_no || `ID: ${c.id}`})
                </option>
              ))}
            </select>
          </div>
        )}

        {currentUser?.role === 'Client' && (
          <div className="flex items-center gap-2 z-10 shrink-0 bg-white/10 border border-white/20 px-4 py-2.5 rounded-xl">
            <Layers className="w-4 h-4 text-cyan-300" />
            <span className="text-xs font-bold uppercase tracking-wider">Fleet Inventory</span>
          </div>
        )}
      </div>

      {/* Fleet Financial & Vehicle Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm border-l-4 border-l-amber-500">
          <div className="flex justify-between items-start">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Vehicles</div>
            <Bike className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-800 dark:text-white mt-2">
            {loading ? '...' : totalVehiclesCount}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Assigned tricycles</p>
        </div>

        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm border-l-4 border-l-violet-500">
          <div className="flex justify-between items-start">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Amount Purchase</div>
            <TrendingUp className="w-4 h-4 text-violet-500" />
          </div>
          <div className="text-xl font-extrabold text-slate-800 dark:text-white mt-2">
            {loading ? '...' : formatNaira(totalAmountPurchase)}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Disbursed asset value</p>
        </div>

        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm border-l-4 border-l-cyan-500">
          <div className="flex justify-between items-start">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Utility Charges</div>
            <Coins className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-xl font-extrabold text-cyan-600 dark:text-cyan-400 mt-2">
            {loading ? '...' : formatNaira(totalUtilityCharges)}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Total utility fees</p>
        </div>

        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm border-l-4 border-l-rose-500">
          <div className="flex justify-between items-start">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Daily Return Rate</div>
            <Coins className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-2">
            {loading ? '...' : formatNaira(totalDailyReturnRate)}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Expected daily rate</p>
        </div>

        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-start">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Amount Collected</div>
            <Receipt className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
            {loading ? '...' : formatNaira(totalAmountCollected)}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Total returns logged</p>
        </div>
      </div>

      {/* Main Vehicle List Section */}
      <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Bike className="w-5 h-5 text-indigo-500" />
              <span>Assigned Vehicles Breakdown ({motorcycles.length})</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Click on any vehicle card to expand and view full financial metrics, rider specs, and return logs.
            </p>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by file no, model or chassis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-slate-150 dark:bg-slate-800/50 rounded-2xl w-full" />
            ))}
          </div>
        ) : filteredMotorcycles.length === 0 ? (
          <div className="text-center py-12 space-y-3 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <Bike className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
            <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">No Vehicles Found</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {searchQuery ? 'No tricycles match your search criteria.' : 'No tricycles are registered under this profile yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMotorcycles.map((mc) => {
              const mcId = mc.id;
              const isExpanded = expandedMcId === mcId;

              // Find associated rider by chassis or motorcycle ID
              const assignedRider = raiders.find(r =>
                (mc.chassis_no && r.chassis && r.chassis.toLowerCase() === mc.chassis_no.toLowerCase()) ||
                (typeof mc.id === 'number' && r.client_motorcycle_id === mc.id)
              );

              // Filter returns for this vehicle:
              // Match by raider chassis == mc chassis_no, OR raider_id == assignedRider.id
              // For synthetic/primary motorcycles with no chassis, fall back to all client returns if only 1 motorcycle
              const vehicleReturns = returns.filter(r => {
                if (mc.chassis_no && r.raider_chassis && r.raider_chassis.toLowerCase() === mc.chassis_no.toLowerCase()) return true;
                if (assignedRider && r.raider_id === assignedRider.id) return true;
                return false;
              });

              // If no returns matched AND this is a synthetic/primary motorcycle AND only 1 motorcycle, use all returns
              const effectiveReturns = (vehicleReturns.length === 0 && motorcycles.length === 1 && String(mc.id).startsWith('primary-'))
                ? returns
                : vehicleReturns;

              const mcCollected = effectiveReturns.reduce((sum, r) => sum + toNum(r.amount), 0);
              const mcPurchase = toNum(mc.total_disbursed_amount);
              const mcUtility = toNum(mc.utility_charges);
              const mcDailyReturn = toNum(mc.daily_return);
              const progressPct = mcPurchase > 0 ? Math.min(100, Math.round((mcCollected / mcPurchase) * 100)) : 0;

              return (
                <div
                  key={mcId}
                  className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-slate-900/40 transition-all hover:border-violet-500/40"
                >
                  {/* Card Header (Collapsed Row) */}
                  <div
                    onClick={() => setExpandedMcId(isExpanded ? null : mcId)}
                    className="p-5 cursor-pointer bg-slate-50/50 dark:bg-slate-955/40 hover:bg-slate-100/60 dark:hover:bg-slate-850/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
                        <Bike className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-extrabold text-slate-900 dark:text-white text-base">
                            {mc.file_no ? `File: ${mc.file_no}` : 'Assigned Tricycle'}
                          </span>
                          <span className="bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-violet-200 dark:border-violet-800/80">
                            {mc.vehicle_type_chassis || 'Tricycle'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                          <span>Chassis: <strong className="font-mono text-slate-700 dark:text-slate-300">{mc.chassis_no || 'N/A'}</strong></span>
                          <span>&bull;</span>
                          <span>Purchase Date: <strong>{mc.date_of_purchase || 'N/A'}</strong></span>
                          {assignedRider && (
                            <>
                              <span>&bull;</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Rider: {assignedRider.name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Metrics Bar */}
                    <div className="flex items-center gap-6 shrink-0 justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-200 dark:border-slate-800">
                      <div className="text-right">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Amount Purchase</div>
                        <div className="font-extrabold text-sm text-slate-900 dark:text-white">{formatNaira(mcPurchase)}</div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Amount Collected</div>
                        <div className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">{formatNaira(mcCollected)}</div>
                      </div>

                      <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-violet-500' : ''}`} />
                    </div>
                  </div>

                  {/* Expanded Breakdown Panel */}
                  {isExpanded && (
                    <div className="border-t border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-900/60 space-y-6">
                      {/* Financial Breakdown Cards Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-violet-600/5 border border-violet-500/15 rounded-xl p-4">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" />
                            <span>Amount Purchase (Disbursed)</span>
                          </div>
                          <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1.5">{formatNaira(mcPurchase)}</div>
                          <p className="text-[10px] text-slate-400 mt-1">Vehicle purchase value</p>
                        </div>

                        <div className="bg-cyan-600/5 border border-cyan-500/15 rounded-xl p-4">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                            <Coins className="w-3.5 h-3.5" />
                            <span>Utility Charges</span>
                          </div>
                          <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1.5">{formatNaira(mcUtility)}</div>
                          <p className="text-[10px] text-slate-400 mt-1">Maintenance &amp; administrative fees</p>
                        </div>

                        <div className="bg-rose-600/5 border border-rose-500/15 rounded-xl p-4">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>Daily Return Rate</span>
                          </div>
                          <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1.5">{formatNaira(mcDailyReturn)}</div>
                          <p className="text-[10px] text-slate-400 mt-1">Expected daily return rate</p>
                        </div>

                        <div className="bg-emerald-600/5 border border-emerald-500/15 rounded-xl p-4">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <Receipt className="w-3.5 h-3.5" />
                            <span>Total Amount Collected</span>
                          </div>
                          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1.5">{formatNaira(mcCollected)}</div>
                          <p className="text-[10px] text-slate-400 mt-1">Returns received from rider</p>
                        </div>
                      </div>

                      {/* Return Collection Progress Bar */}
                      <div className="bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            <span>Asset Inflow Recovery Progress</span>
                          </span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{progressPct}% Recovered</span>
                        </div>
                        <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Technical Specs & Dates Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                        <div className="space-y-3 bg-slate-50/50 dark:bg-slate-955/40 p-4 rounded-xl border border-slate-150 dark:border-slate-800/80">
                          <h4 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[10px] mb-2 text-violet-600 dark:text-violet-400">
                            Vehicle Specifications
                          </h4>
                          <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                            <span className="text-slate-500">File Number:</span>
                            <span className="font-bold text-slate-800 dark:text-white">{mc.file_no || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                            <span className="text-slate-500">Vehicle / Model:</span>
                            <span className="font-bold text-slate-800 dark:text-white">{mc.vehicle_type_chassis || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                            <span className="text-slate-500">Chassis Number:</span>
                            <span className="font-mono font-bold text-slate-800 dark:text-white">{mc.chassis_no || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-slate-500">Contract Duration:</span>
                            <span className="font-bold text-slate-800 dark:text-white">{mc.duration_of_completion || 'N/A'}</span>
                          </div>
                        </div>

                        <div className="space-y-3 bg-slate-50/50 dark:bg-slate-955/40 p-4 rounded-xl border border-slate-150 dark:border-slate-800/80">
                          <h4 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[10px] mb-2 text-cyan-600 dark:text-cyan-400">
                            Schedule &amp; Operator Details
                          </h4>
                          <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                            <span className="text-slate-500">Purchase Date:</span>
                            <span className="font-bold text-slate-800 dark:text-white">{mc.date_of_purchase || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                            <span className="text-slate-500">First Disbursement:</span>
                            <span className="font-bold text-slate-800 dark:text-white">{mc.date_of_first_disbursement || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                            <span className="text-slate-500">Final Disbursement:</span>
                            <span className="font-bold text-slate-800 dark:text-white">{mc.final_disbursement || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-slate-500">Assigned Rider:</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">{assignedRider ? `${assignedRider.name} (${assignedRider.plate_no || 'No Plate'})` : 'No Rider Assigned'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Inflow Log Table for this Vehicle */}
                      <div className="space-y-3">
                        <h4 className="font-bold text-slate-800 dark:text-white text-xs flex items-center gap-1.5">
                          <Receipt className="w-4 h-4 text-emerald-500" />
                          <span>Return Collections History for this Vehicle ({effectiveReturns.length})</span>
                        </h4>

                        {effectiveReturns.length === 0 ? (
                          <p className="text-xs text-slate-400 py-3 text-center bg-slate-50/50 dark:bg-slate-955/30 rounded-xl border border-slate-200 dark:border-slate-800">
                            No return inflow records logged for this vehicle yet.
                          </p>
                        ) : (
                          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-xs">
                              <thead className="bg-slate-100 dark:bg-slate-955">
                                <tr>
                                  <th className="px-4 py-2.5 font-bold text-slate-500 uppercase">Date</th>
                                  <th className="px-4 py-2.5 font-bold text-slate-500 uppercase">Rider</th>
                                  <th className="px-4 py-2.5 font-bold text-slate-500 uppercase">Receipt No</th>
                                  <th className="px-4 py-2.5 font-bold text-slate-500 uppercase">Manager</th>
                                  <th className="px-4 py-2.5 font-bold text-slate-500 uppercase text-right">Amount</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900/30">
                                {effectiveReturns.map((ret) => (
                                  <tr key={ret.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/30">
                                    <td className="px-4 py-2.5 whitespace-nowrap font-medium text-slate-800 dark:text-white">{ret.date}</td>
                                    <td className="px-4 py-2.5 whitespace-nowrap">{ret.raider_name || 'N/A'}</td>
                                    <td className="px-4 py-2.5 whitespace-nowrap font-mono">{ret.receipt_no || 'N/A'}</td>
                                    <td className="px-4 py-2.5 whitespace-nowrap text-slate-500">{ret.md_leader_name || 'N/A'}</td>
                                    <td className="px-4 py-2.5 whitespace-nowrap font-bold text-emerald-600 dark:text-emerald-400 text-right">
                                      +{formatNaira(toNum(ret.amount))}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
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
