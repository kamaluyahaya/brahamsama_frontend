'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard,
  Users,
  Bike,
  TrendingUp,
  TrendingDown,
  Coins,
  ShieldAlert,
  UserPlus,
  ArrowRight
} from 'lucide-react';

interface DashboardStats {
  clientsCount: number;
  raidersCount: number;
  mdCount: number;
  totalReturns: number;
  totalExpenses: number;
  totalDisbursedToClients: number;
  complianceCount: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    clientsCount: 0,
    raidersCount: 0,
    mdCount: 0,
    totalReturns: 0,
    totalExpenses: 0,
    totalDisbursedToClients: 0,
    complianceCount: 0,
  });
  
  const [recentReturns, setRecentReturns] = useState<any[]>([]);
  const [recentCompliance, setRecentCompliance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    }

    async function fetchDashboardData() {
      try {
        setLoading(true);
        // Fetch clients
        const clientsRes = await fetch('/api/clients');
        const clients = clientsRes.ok ? await clientsRes.json() : [];

        // Fetch raiders
        const raidersRes = await fetch('/api/raiders');
        const raiders = raidersRes.ok ? await raidersRes.json() : [];

        // Fetch MD leaders
        const mdRes = await fetch('/api/md-leaders');
        const mdLeaders = mdRes.ok ? await mdRes.json() : [];

        // Fetch compliance
        const compRes = await fetch('/api/compliance');
        const compliance = compRes.ok ? await compRes.json() : [];

        // Fetch returns & expenses & disbursements
        const reportRes = await fetch('/api/accounts/generate-report');
        const reportData = reportRes.ok ? await reportRes.json() : { summary: { totalReturns: 0, totalExpenses: 0, totalDisbursedToClients: 0 }, detailedReturns: [], detailedExpenses: [] };

        setStats({
          clientsCount: clients.length,
          raidersCount: raiders.length,
          mdCount: mdLeaders.length,
          totalReturns: reportData.summary.totalReturns,
          totalExpenses: reportData.summary.totalExpenses,
          totalDisbursedToClients: reportData.summary.totalDisbursedToClients || 0,
          complianceCount: compliance.filter((c: any) => c.status === 'Pending').length,
        });

        setRecentReturns(reportData.detailedReturns.slice(0, 5));
        setRecentCompliance(compliance.slice(0, 5));
      } catch (err) {
        console.error('Error fetching dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8 pb-16">
      {/* Welcome Banner Card */}
      {currentUser && (
        <div className="bg-gradient-to-r from-violet-600 via-violet-500 to-cyan-500 text-white rounded-2xl p-6 shadow-xl shadow-violet-500/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden border border-white/10">
          <div className="space-y-1.5 z-10">
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight mb-0">
              Welcome back, {currentUser.name}!
            </h2>
            <p className="text-xs text-white/80 font-medium tracking-wide">
              Clearance Level: <span className="font-bold underline">{currentUser.role}</span> &bull; Braham Sama Command Operations is fully operational.
            </p>
          </div>
          <div className="flex gap-2.5 z-10 shrink-0">
            <Link
              href="/profile"
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all active:scale-95"
            >
              Profile Settings
            </Link>
            {currentUser.role === 'Admin' && (
              <Link
                href="/staff"
                className="bg-white text-violet-600 hover:bg-slate-100 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
              >
                Manage Staff
              </Link>
            )}
          </div>
        </div>
      )}

      <h2 className="text-lg md:text-xl font-bold tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
        <LayoutDashboard className="w-5 h-5 text-violet-500" />
        <span>Dashboard Overview</span>
      </h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm border-l-4 border-l-violet-500 hover:border-l-violet-400 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Registered Clients</div>
            <Users className="w-4 h-4 text-violet-500" />
          </div>
          <div className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white mt-2">{loading ? '...' : stats.clientsCount}</div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Clerk & Sec auxiliary entries</p>
        </div>
        
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm border-l-4 border-l-cyan-500 hover:border-l-cyan-400 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Deployed Raiders</div>
            <Bike className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white mt-2">{loading ? '...' : stats.raidersCount}</div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Active motorcyclists & assets</p>
        </div>

        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm border-l-4 border-l-indigo-500 hover:border-l-indigo-400 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Managers</div>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white mt-2">{loading ? '...' : stats.mdCount}</div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Delivery supervisors & squad leaders</p>
        </div>

        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm border-l-4 border-l-emerald-500 hover:border-l-emerald-400 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Returns</div>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 mt-2">
            ₦{loading ? '...' : stats.totalReturns.toLocaleString()}
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Revenue collected from field</p>
        </div>

        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm border-l-4 border-l-rose-500 hover:border-l-rose-400 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Expenses</div>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-extrabold tracking-tight text-rose-600 dark:text-rose-400 mt-2">
            ₦{loading ? '...' : stats.totalExpenses.toLocaleString()}
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Operational & auxiliary spending</p>
        </div>

        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm border-l-4 border-l-amber-500 hover:border-l-amber-400 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Disburse to Client</div>
            <Coins className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold tracking-tight text-amber-600 dark:text-amber-400 mt-2">
            ₦{loading ? '...' : stats.totalDisbursedToClients.toLocaleString()}
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Asset finance disbursements</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Net Flow SVG visual chart */}
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Revenue Flow Ratio</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Comparison of Returns vs Expenses</p>
          
          <div className="h-48 flex items-end justify-around gap-6 mt-8">
            <div className="flex flex-col items-center w-1/3">
              <div 
                className="w-16 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-xl shadow-lg shadow-emerald-500/10 transition-all duration-700"
                style={{ 
                  height: `${stats.totalReturns || stats.totalExpenses ? Math.max(10, Math.min(100, (stats.totalReturns / (stats.totalReturns + stats.totalExpenses)) * 100)) : 50}%` 
                }}
              ></div>
              <div className="text-sm font-semibold text-slate-700 dark:text-white mt-3">Returns</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">₦{stats.totalReturns.toLocaleString()}</div>
            </div>
            
            <div className="flex flex-col items-center w-1/3">
              <div 
                className="w-16 bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-xl shadow-lg shadow-rose-500/10 transition-all duration-700"
                style={{ 
                  height: `${stats.totalReturns || stats.totalExpenses ? Math.max(10, Math.min(100, (stats.totalExpenses / (stats.totalReturns + stats.totalExpenses)) * 100)) : 30}%` 
                }}
              ></div>
              <div className="text-sm font-semibold text-slate-700 dark:text-white mt-3">Expenses</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">₦{stats.totalExpenses.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Quick Operations Menu</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">Common operational workflows</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/clients" className="bg-slate-100 hover:bg-slate-200/85 dark:bg-slate-800/30 dark:hover:bg-slate-800/70 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 flex flex-col items-center gap-2 text-center transition-all hover:-translate-y-1">
              <UserPlus className="w-6 h-6 text-violet-500" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Add New Client</span>
            </Link>

            <Link href="/raiders" className="bg-slate-100 hover:bg-slate-200/85 dark:bg-slate-800/30 dark:hover:bg-slate-800/70 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 flex flex-col items-center gap-2 text-center transition-all hover:-translate-y-1">
              <Bike className="w-6 h-6 text-cyan-500" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Deploy Raider</span>
            </Link>

            <Link href="/accounts" className="bg-slate-100 hover:bg-slate-200/85 dark:bg-slate-800/30 dark:hover:bg-slate-800/70 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 flex flex-col items-center gap-2 text-center transition-all hover:-translate-y-1">
              <Coins className="w-6 h-6 text-emerald-500" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Log Payment/Return</span>
            </Link>

            <Link href="/compliance" className="bg-slate-100 hover:bg-slate-200/85 dark:bg-slate-800/30 dark:hover:bg-slate-800/70 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 flex flex-col items-center gap-2 text-center transition-all hover:-translate-y-1">
              <ShieldAlert className="w-6 h-6 text-rose-500" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Log Query/Action</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent returns */}
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-emerald-500" />
              <span>Recent Returns Log</span>
            </h3>
            <Link href="/accounts" className="text-xs font-semibold text-violet-600 dark:text-cyan-400 hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading returns...</p>
          ) : recentReturns.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500">No returns logged yet.</p>
          ) : (
            <div className="space-y-3">
              {recentReturns.map((item) => (
                <div key={item.id} className="bg-slate-50 dark:bg-slate-850/50 border border-slate-150 dark:border-slate-800/80 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-sm text-slate-800 dark:text-white">{item.raider_name || item.md_leader_name || 'General Return'}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Date: {item.date} &bull; {item.raider_name ? 'Raider' : 'M/D Leader'}
                    </div>
                  </div>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    +₦{item.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent compliance */}
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              <span>Compliance & Queries</span>
            </h3>
            <Link href="/compliance" className="text-xs font-semibold text-violet-600 dark:text-cyan-400 hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading compliance...</p>
          ) : recentCompliance.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500">No compliance logs.</p>
          ) : (
            <div className="space-y-3">
              {recentCompliance.map((item) => (
                <div key={item.id} className="bg-slate-50 dark:bg-slate-850/50 border border-slate-150 dark:border-slate-800/80 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-sm text-slate-800 dark:text-white">{item.subject}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Target: {item.raider_name || item.client_name || 'General'} &bull; {item.date}
                    </div>
                  </div>
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      item.status === 'Resolved' 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                        : item.status === 'Pending' 
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' 
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
