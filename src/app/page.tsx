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
  ArrowRight,
  Printer,
  Calendar,
  AlertTriangle,
  BellRing,
  Search
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

  // Client Specific States
  const [clientRaiders, setClientRaiders] = useState<any[]>([]);
  const [clientReturns, setClientReturns] = useState<any[]>([]);
  const [clientCompliance, setClientCompliance] = useState<any[]>([]);
  const [clientMotorcycles, setClientMotorcycles] = useState<any[]>([]);
  const [clientStats, setClientStats] = useState({
    totalRiders: 0,
    totalReturns: 0,
    overdueRiders: 0,
    activeQueries: 0,
    totalAmountPurchase: 0,
    totalUtilityCharges: 0,
    totalTricycles: 0
  });

  // Manager Specific States
  const [managerRaiders, setManagerRaiders] = useState<any[]>([]);
  const [managerReturns, setManagerReturns] = useState<any[]>([]);
  const [managerCompliance, setManagerCompliance] = useState<any[]>([]);
  const [managerStats, setManagerStats] = useState({
    totalRaiders: 0,
    totalReturns: 0,
    todayReturns: 0,
    activeQueries: 0
  });

  const [selectedCalendarRaider, setSelectedCalendarRaider] = useState<any>(null);
  const [calendarSearchQuery, setCalendarSearchQuery] = useState('');
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState<Date>(new Date());

  const [managerForm, setManagerForm] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    raider_id: '',
    receipt_no: '',
    comments: ''
  });
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  // Report Generator States
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  const [generatedReport, setGeneratedReport] = useState<any>(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    let user: any = null;
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        user = JSON.parse(storedUser);
        setCurrentUser(user);
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

    async function fetchClientDashboardData(clientId: number) {
      try {
        setLoading(true);

        // Fetch riders under client
        const raidersRes = await fetch(`/api/clients/${clientId}/raiders`);
        const raiders = raidersRes.ok ? await raidersRes.json() : [];
        setClientRaiders(raiders);

        // Fetch returns under client
        const returnsRes = await fetch(`/api/clients/${clientId}/returns`);
        const returns = returnsRes.ok ? await returnsRes.json() : [];
        setClientReturns(returns);

        // Fetch compliance under client
        const compRes = await fetch(`/api/clients/${clientId}/compliance`);
        const compliance = compRes.ok ? await compRes.json() : [];
        setClientCompliance(compliance);

        // Fetch motorcycles under client
        const mcRes = await fetch(`/api/clients/${clientId}/motorcycles`);
        const motorcycles = mcRes.ok ? await mcRes.json() : [];
        setClientMotorcycles(motorcycles);
        const totalAmountPurchase = motorcycles.reduce((sum: number, mc: any) => sum + parseFloat(mc.total_disbursed_amount || 0), 0);
        const totalUtilityCharges = motorcycles.reduce((sum: number, mc: any) => sum + parseFloat(mc.utility_charges || 0), 0);
        const totalTricycles = motorcycles.length;

        // Calculate statistics
        const totalRiders = raiders.length;
        const totalReturns = returns.reduce((sum: number, item: any) => sum + parseFloat(item.amount || 0), 0);

        // Calculate overdue riders (needs reminder)
        let overdueCount = 0;
        const now = new Date();
        raiders.forEach((r: any) => {
          const riderReturns = returns.filter((ret: any) => ret.raider_id === r.id);
          let lastDate: Date | null = null;
          if (riderReturns.length > 0) {
            const sorted = [...riderReturns].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
            lastDate = new Date(sorted[0].date);
          } else if (r.date_of_appointment) {
            lastDate = new Date(r.date_of_appointment);
          }

          if (lastDate) {
            const diffTime = Math.abs(now.getTime() - lastDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > 7) {
              overdueCount++;
            }
          } else {
            overdueCount++;
          }
        });

        const activeQueries = compliance.filter((c: any) => c.status === 'Pending').length;

        setClientStats({
          totalRiders,
          totalReturns,
          overdueRiders: overdueCount,
          activeQueries,
          totalAmountPurchase,
          totalUtilityCharges,
          totalTricycles
        });
      } catch (err) {
        console.error('Error fetching client dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    async function fetchManagerDashboardData(managerId: number) {
      try {
        setLoading(true);
        const res = await fetch(`/api/md-leaders/${managerId}`);
        if (res.ok) {
          const data = await res.json();
          setManagerRaiders(data.raiders || []);
          setManagerReturns(data.payments || []);
          setManagerCompliance(data.compliance || []);

          const totalRaiders = (data.raiders || []).length;
          const totalReturns = (data.payments || []).reduce((sum: number, item: any) => sum + parseFloat(item.amount || 0), 0);

          const todayStr = new Date().toISOString().split('T')[0];
          const todayReturns = (data.payments || [])
            .filter((item: any) => item.date === todayStr)
            .reduce((sum: number, item: any) => sum + parseFloat(item.amount || 0), 0);

          const activeQueries = (data.compliance || []).filter((c: any) => c.status === 'Pending').length;

          setManagerStats({
            totalRaiders,
            totalReturns,
            todayReturns,
            activeQueries
          });
        }
      } catch (err) {
        console.error('Error fetching manager dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      if (user.role === 'Client') {
        fetchClientDashboardData(user.id);
      } else if (user.role === 'Manager') {
        fetchManagerDashboardData(user.id);
      } else {
        fetchDashboardData();
      }
    }
  }, []);

  const handleManagerReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managerForm.amount) return alert('Amount is required');
    if (!managerForm.raider_id) return alert('Please select a Raider');

    setIsSubmittingReturn(true);
    try {
      const payload = {
        date: managerForm.date,
        amount: parseFloat(managerForm.amount),
        raider_id: parseInt(managerForm.raider_id),
        md_leader_id: currentUser.id,
        receipt_no: managerForm.receipt_no,
        comments: managerForm.comments,
      };

      const res = await fetch('/api/accounts/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert('Return transaction successfully submitted to Accounts!');
        setManagerForm({
          date: new Date().toISOString().split('T')[0],
          amount: '',
          raider_id: '',
          receipt_no: '',
          comments: '',
        });

        // Refresh manager dashboard data
        const refreshRes = await fetch(`/api/md-leaders/${currentUser.id}`);
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          setManagerRaiders(data.raiders || []);
          setManagerReturns(data.payments || []);
          setManagerCompliance(data.compliance || []);

          const totalRaiders = (data.raiders || []).length;
          const totalReturns = (data.payments || []).reduce((sum: number, item: any) => sum + parseFloat(item.amount || 0), 0);

          const todayStr = new Date().toISOString().split('T')[0];
          const todayReturns = (data.payments || [])
            .filter((item: any) => item.date === todayStr)
            .reduce((sum: number, item: any) => sum + parseFloat(item.amount || 0), 0);

          const activeQueries = (data.compliance || []).filter((c: any) => c.status === 'Pending').length;

          setManagerStats({
            totalRaiders,
            totalReturns,
            todayReturns,
            activeQueries
          });
        }
      } else {
        const errData = await res.json();
        alert('Error: ' + errData.message);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to submit transaction return');
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  const handleGenerateClientReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportStartDate || !reportEndDate) {
      alert('Please select both start and end dates.');
      return;
    }
    setGeneratingReport(true);
    try {
      const res = await fetch(`/api/clients/${currentUser.id}/report?startDate=${reportStartDate}&endDate=${reportEndDate}`);
      if (res.ok) {
        const data = await res.json();
        setGeneratedReport(data);
      } else {
        alert('Failed to generate report.');
      }
    } catch (err) {
      console.error(err);
      alert('Error fetching report data.');
    } finally {
      setGeneratingReport(false);
    }
  };

  const handlePrintClientReport = () => {
    if (!generatedReport) return;
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

      let tableRows = '';
      generatedReport.detailedReturns.forEach((item: any) => {
        tableRows += `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.date}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.raider_name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">₦${parseFloat(item.amount).toLocaleString()}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.raider_chassis || 'N/A'}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.md_leader_name || 'N/A'}</td>
          </tr>
        `;
      });

      const html = `
        <html>
          <head>
            <title>Rider Returns Report</title>
            <style>
              body { font-family: sans-serif; padding: 40px; color: #333; }
              .header { text-align: center; margin-bottom: 30px; }
              .header h1 { margin: 0; font-size: 24px; color: #111; }
              .header p { margin: 5px 0; color: #666; font-size: 14px; }
              .summary { background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #eee; }
              .summary h3 { margin: 0 0 10px 0; }
              .summary p { margin: 5px 0; font-size: 16px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; text-align: left; }
              th { background: #f4f4f4; padding: 12px 10px; border-bottom: 2px solid #ddd; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>BRAHAM SAMA SYSTEMS</h1>
              <p>Fleet Returns Statement & Account Report</p>
              <p>Generated for Client: ${currentUser?.name}</p>
              <p>Report Period: ${reportStartDate} to ${reportEndDate}</p>
              <p>Generated on: ${new Date().toLocaleDateString()}</p>
            </div>
            <div class="summary">
              <h3>Report Summary</h3>
              <p><strong>Total Returns Collected:</strong> ₦${generatedReport.summary.totalReturns.toLocaleString()}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Rider Name</th>
                  <th>Amount</th>
                  <th>Chassis No</th>
                  <th>Manager</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows || '<tr><td colspan="5" style="text-align: center; padding: 20px;">No return logs found in this period.</td></tr>'}
              </tbody>
            </table>
            <script>
              window.onload = function() { window.print(); }
            </script>
          </body>
        </html>
      `;
      doc.write(html);
      doc.close();
    }
  };

  const handleSendReminder = (riderName: string) => {
    alert(`Reminder notification triggered for rider: ${riderName}. A notification alert has been logged.`);
  };

  // Helper to calculate due dates for display
  const getRiderStatusDetails = (rider: any) => {
    const riderReturns = clientReturns.filter((ret: any) => ret.raider_id === rider.id);
    let lastDate: Date | null = null;
    let lastDateStr = 'Never Paid';

    if (riderReturns.length > 0) {
      const sorted = [...riderReturns].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      lastDate = new Date(sorted[0].date);
      lastDateStr = sorted[0].date;
    } else if (rider.date_of_appointment) {
      lastDate = new Date(rider.date_of_appointment);
      lastDateStr = `Appointed (${rider.date_of_appointment})`;
    }

    let dueDateStr = 'N/A';
    let needsReminder = false;

    if (lastDate) {
      const dueDate = new Date(lastDate);
      dueDate.setDate(dueDate.getDate() + 7);
      dueDateStr = dueDate.toISOString().split('T')[0];

      const now = new Date();
      const diffTime = now.getTime() - dueDate.getTime();
      if (diffTime > 0) {
        needsReminder = true;
      }
    } else {
      needsReminder = true;
    }

    return {
      lastDateStr,
      dueDateStr,
      needsReminder
    };
  };

  // Build notifications feed combining compliance and auto-reminders
  const buildClientNotifications = () => {
    const list: any[] = [];

    // Add standard compliance actions
    clientCompliance.forEach(c => {
      list.push({
        id: `comp-${c.id}`,
        type: 'compliance',
        title: c.subject,
        details: c.details,
        date: c.date,
        status: c.status,
        badgeColor: c.status === 'Pending' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
      });
    });

    // Add auto overdue reminders
    clientRaiders.forEach(r => {
      const { dueDateStr, needsReminder, lastDateStr } = getRiderStatusDetails(r);
      if (needsReminder) {
        list.push({
          id: `remind-${r.id}`,
          type: 'reminder',
          title: `Overdue Payment Alert: ${r.name}`,
          details: `Rider ${r.name} (Plate No: ${r.plate_no || 'N/A'}) has passed the weekly returns due date (${dueDateStr}). Last return was on: ${lastDateStr}.`,
          date: dueDateStr,
          status: 'Overdue',
          badgeColor: 'bg-rose-500/10 text-rose-600 border-rose-500/20'
        });
      }
    });

    // Sort by date desc
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // -------------------------------------------------------------
  // CLIENT DASHBOARD RENDER
  // -------------------------------------------------------------
  if (currentUser?.role === 'Client') {
    const notifications = buildClientNotifications();

    const dailyReturns = clientMotorcycles.reduce((sum: number, mc: any) => sum + parseFloat(mc.daily_return || 0), 0);

    return (
      <div className="space-y-8 pb-16">
        {/* Welcome Banner Card */}
        <div className="bg-gradient-to-r from-violet-600 via-violet-500 to-cyan-500 text-white rounded-2xl p-6 shadow-xl shadow-violet-500/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden border border-white/10">
          <div className="space-y-1.5 z-10">
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight mb-0">
              Welcome back, {currentUser.name}!
            </h2>
            <p className="text-xs text-white/80 font-medium tracking-wide">
              Client Portal &bull; Viewing real-time assets and motorcycle fleet returns.
            </p>
          </div>
          <div className="flex gap-2.5 z-10 shrink-0">
            <Link
              href="/profile"
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all active:scale-95"
            >
              Account Security
            </Link>
          </div>
        </div>

        <h2 className="text-lg md:text-xl font-bold tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-violet-500" />
          <span>Client Fleet Dashboard</span>
        </h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm border-l-4 border-l-violet-500 hover:border-l-violet-400 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Amount Purchase</div>
              <TrendingUp className="w-4 h-4 text-violet-500" />
            </div>
            <div className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white mt-2">
              ₦{loading ? '...' : clientStats.totalAmountPurchase.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Total purchase price of assigned fleet</p>
          </div>

          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm border-l-4 border-l-emerald-500 hover:border-l-emerald-400 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Utility Charges</div>
              <Coins className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 mt-2">
              ₦{loading ? '...' : clientStats.totalUtilityCharges.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Total utility charges of assigned fleet</p>
          </div>

          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm border-l-4 border-l-rose-500 hover:border-l-rose-400 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Daily Returns</div>
              <Coins className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-3xl font-extrabold tracking-tight text-rose-605 dark:text-rose-400 mt-2">
              ₦{loading ? '...' : dailyReturns.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Total daily returns rate of assigned fleet</p>
          </div>

          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm border-l-4 border-l-amber-500 hover:border-l-amber-400 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Tricycles</div>
              <Bike className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white mt-2">{loading ? '...' : clientStats.totalTricycles}</div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Total tricycles registered under your profile</p>
          </div>
        </div>

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Riders List (Span 2) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                <Bike className="w-5 h-5 text-violet-500" />
                <span>My Fleet & Return Statuses</span>
              </h3>

              {loading ? (
                <p className="text-sm text-slate-550">Loading riders...</p>
              ) : clientRaiders.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center">No riders assigned to your profile yet.</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800/80">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-955">
                      <tr>
                        <th className="px-4 py-3 font-bold text-slate-500 dark:text-slate-400 uppercase">Rider</th>
                        <th className="px-4 py-3 font-bold text-slate-500 dark:text-slate-400 uppercase">Vehicle details</th>
                        <th className="px-4 py-3 font-bold text-slate-500 dark:text-slate-400 uppercase">Last return</th>
                        <th className="px-4 py-3 font-bold text-slate-500 dark:text-slate-400 uppercase">Next due date</th>
                        <th className="px-4 py-3 font-bold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                        <th className="px-4 py-3 font-bold text-slate-500 dark:text-slate-400 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900/20">
                      {clientRaiders.map((rider) => {
                        const { lastDateStr, dueDateStr, needsReminder } = getRiderStatusDetails(rider);
                        return (
                          <tr key={rider.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/30">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="font-bold text-slate-800 dark:text-white">{rider.name}</div>
                              <div className="text-slate-400 text-[10px]">{rider.phone || 'No phone'}</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div><strong>Plate:</strong> {rider.plate_no || 'N/A'}</div>
                              <div className="text-slate-400 text-[10px]">Chassis: {rider.chassis || 'N/A'}</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-350">{lastDateStr}</td>
                            <td className="px-4 py-3 whitespace-nowrap font-semibold text-slate-600 dark:text-slate-350">{dueDateStr}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${needsReminder
                                  ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                                  : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                }`}>
                                {needsReminder ? 'Overdue' : 'Up to date'}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {needsReminder && (
                                <button
                                  onClick={() => handleSendReminder(rider.name)}
                                  className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-[10px] px-2.5 py-1 rounded-lg transition-all"
                                >
                                  Remind
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Client Returns History */}
            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                <Coins className="w-5 h-5 text-emerald-500" />
                <span>Recent Fleet Returns History</span>
              </h3>
              {loading ? (
                <p className="text-sm text-slate-550">Loading returns...</p>
              ) : clientReturns.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No returns logged under your fleet yet.</p>
              ) : (
                <div className="space-y-3">
                  {clientReturns.slice(0, 6).map((item) => (
                    <div key={item.id} className="bg-slate-50 dark:bg-slate-850/50 border border-slate-150 dark:border-slate-800/80 rounded-xl p-4 flex justify-between items-center text-xs">
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-white">{item.raider_name}</div>
                        <div className="text-[10px] text-slate-550 mt-1">
                          Date: {item.date} &bull; Chassis: {item.raider_chassis || 'N/A'} &bull; Leader: {item.md_leader_name || 'N/A'}
                        </div>
                      </div>
                      <div className="font-bold text-emerald-600 dark:text-emerald-400">
                        +₦{item.amount.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* My Assigned Tricycles Section */}
            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                <Bike className="w-5 h-5 text-indigo-500" />
                <span>My Assigned Tricycles ({clientMotorcycles.length})</span>
              </h3>
              {loading ? (
                <p className="text-sm text-slate-550">Loading tricycles...</p>
              ) : clientMotorcycles.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No tricycles assigned to your profile yet.</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800/80">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-955">
                      <tr>
                        <th className="px-4 py-3 font-bold text-slate-500 dark:text-slate-400 uppercase">File No</th>
                        <th className="px-4 py-3 font-bold text-slate-500 dark:text-slate-400 uppercase">Vehicle Details</th>
                        <th className="px-4 py-3 font-bold text-slate-500 dark:text-slate-400 uppercase">Chassis No</th>
                        <th className="px-4 py-3 font-bold text-slate-500 dark:text-slate-400 uppercase">Purchase Date</th>
                        <th className="px-4 py-3 font-bold text-slate-500 dark:text-slate-400 uppercase">Asset Value</th>
                        <th className="px-4 py-3 font-bold text-slate-500 dark:text-slate-400 uppercase">Utility Charges</th>
                        <th className="px-4 py-3 font-bold text-slate-500 dark:text-slate-400 uppercase">Daily Return</th>
                        <th className="px-4 py-3 font-bold text-slate-500 dark:text-slate-400 uppercase">Contract Term</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900/20">
                      {clientMotorcycles.map((mc) => (
                        <tr key={mc.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/30">
                          <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-800 dark:text-white">{mc.file_no || 'N/A'}</td>
                          <td className="px-4 py-3 whitespace-nowrap">{mc.vehicle_type_chassis || 'N/A'}</td>
                          <td className="px-4 py-3 whitespace-nowrap font-mono">{mc.chassis_no || 'N/A'}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-350">{mc.date_of_purchase || 'N/A'}</td>
                          <td className="px-4 py-3 whitespace-nowrap font-semibold text-slate-800 dark:text-white">₦{parseFloat(mc.total_disbursed_amount || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 whitespace-nowrap font-semibold text-cyan-600 dark:text-cyan-400">₦{parseFloat(mc.utility_charges || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 whitespace-nowrap font-semibold text-rose-600 dark:text-rose-455">₦{parseFloat(mc.daily_return || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-350">{mc.duration_of_completion || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Notifications Feed & Report Generator (Span 1) */}
          <div className="space-y-6">

            {/* Notification center */}
            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm flex flex-col max-h-[450px]">
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4 shrink-0">
                <BellRing className="w-5 h-5 text-violet-500" />
                <span>Notification Center</span>
              </h3>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                {loading ? (
                  <p className="text-sm text-slate-500">Loading notifications...</p>
                ) : notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No new notifications or alerts.</p>
                ) : (
                  notifications.map((item) => (
                    <div key={item.id} className="border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/30 rounded-xl p-3 space-y-1.5 text-xs">
                      <div className="flex justify-between items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${item.badgeColor}`}>
                          {item.status}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">{item.date}</span>
                      </div>
                      <h4 className="font-bold text-slate-800 dark:text-white">{item.title}</h4>
                      <p className="text-slate-500 dark:text-slate-455 text-[11px] leading-relaxed">{item.details}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Financial Report Builder */}
            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-3">
                <Printer className="w-5 h-5 text-violet-500" />
                <span>Returns Report Builder</span>
              </h3>
              <p className="text-slate-500 text-[11px] mb-4">Generate and print statement of returns from your fleet.</p>

              <form onSubmit={handleGenerateClientReport} className="space-y-4 text-xs">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Start Date</label>
                  <input
                    type="date"
                    value={reportStartDate}
                    onChange={(e) => setReportStartDate(e.target.value)}
                    required
                    className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">End Date</label>
                  <input
                    type="date"
                    value={reportEndDate}
                    onChange={(e) => setReportEndDate(e.target.value)}
                    required
                    className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={generatingReport}
                  className="w-full bg-violet-605 hover:bg-violet-500 text-white font-semibold py-2 rounded-xl text-center shadow-lg transition-all"
                >
                  {generatingReport ? 'Generating...' : 'Build Report'}
                </button>
              </form>

              {generatedReport && (
                <div className="mt-4 pt-4 border-t border-slate-150 dark:border-slate-800 space-y-3 text-xs">
                  <div className="flex justify-between font-bold text-slate-800 dark:text-white">
                    <span>Returns Total:</span>
                    <span className="text-emerald-600">₦{generatedReport.summary.totalReturns.toLocaleString()}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Found {generatedReport.detailedReturns.length} returns logs.
                  </div>
                  <button
                    onClick={handlePrintClientReport}
                    className="w-full border border-violet-500/40 hover:bg-violet-600/10 text-violet-600 dark:text-violet-405 font-bold py-2 rounded-xl text-center transition-all flex items-center justify-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Statement</span>
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // MANAGER DASHBOARD RENDER
  // -------------------------------------------------------------
  if (currentUser?.role === 'Manager') {
    return (
      <div className="space-y-8 pb-16">
        {/* Welcome Banner Card */}
        <div className="bg-gradient-to-r from-cyan-600 via-violet-600 to-violet-500 text-white rounded-2xl p-6 shadow-xl shadow-violet-500/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden border border-white/10">
          <div className="space-y-1.5 z-10">
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight mb-0">
              Welcome back, {currentUser.name}!
            </h2>
            <p className="text-xs text-white/80 font-medium tracking-wide">
              Manager Portal &bull; Log daily returns and view assigned squad raider specifications.
            </p>
          </div>
          <div className="flex gap-2.5 z-10 shrink-0">
            <Link
              href="/profile"
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all active:scale-95"
            >
              Profile Settings
            </Link>
          </div>
        </div>

        <h2 className="text-lg md:text-xl font-bold tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-cyan-500" />
          <span>Squad Management Overview</span>
        </h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm border-l-4 border-l-violet-500 hover:border-l-violet-400 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Assigned Squad Size</div>
              <Users className="w-4 h-4 text-violet-500" />
            </div>
            <div className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white mt-2">{loading ? '...' : managerStats.totalRaiders}</div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Active motorcyclists in your squad</p>
          </div>

          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm border-l-4 border-l-emerald-500 hover:border-l-emerald-400 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Payments Submitted</div>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 mt-2">
              ₦{loading ? '...' : managerStats.totalReturns.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Accumulated returns sent to accounts</p>
          </div>

          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm border-l-4 border-l-cyan-500 hover:border-l-cyan-400 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Today's Collections</div>
              <Coins className="w-4 h-4 text-cyan-500" />
            </div>
            <div className="text-3xl font-extrabold tracking-tight text-cyan-600 dark:text-cyan-400 mt-2">
              ₦{loading ? '...' : managerStats.todayReturns.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Payments recorded today</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Submit Return Form Card */}
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between lg:col-span-1">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Coins className="w-5 h-5 text-cyan-500" />
                <span>Submit Daily Raider Inflow</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">Log client and rider weekly asset returns payments</p>
            </div>

            <form onSubmit={handleManagerReturnSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date of Inflow *</label>
                  <input
                    type="date"
                    value={managerForm.date}
                    onChange={(e) => setManagerForm(prev => ({ ...prev, date: e.target.value }))}
                    required
                    className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Return Amount (₦) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 10000"
                    value={managerForm.amount}
                    onChange={(e) => setManagerForm(prev => ({ ...prev, amount: e.target.value }))}
                    required
                    className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Raider *</label>
                  <select
                    value={managerForm.raider_id}
                    onChange={(e) => setManagerForm(prev => ({ ...prev, raider_id: e.target.value }))}
                    required
                    className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                  >
                    <option value="">-- Select Raider --</option>
                    {managerRaiders.map((r: any) => (
                      <option key={r.id} value={r.id}>{r.name} ({r.tempo_reg_no || 'No Tempo'})</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Receipt Number</label>
                  <input
                    type="text"
                    placeholder="Receipt Reference"
                    value={managerForm.receipt_no}
                    onChange={(e) => setManagerForm(prev => ({ ...prev, receipt_no: e.target.value }))}
                    className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Remarks / Description</label>
                <textarea
                  placeholder="Additional transaction description"
                  value={managerForm.comments}
                  onChange={(e) => setManagerForm(prev => ({ ...prev, comments: e.target.value }))}
                  className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                  rows={2}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingReturn}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg text-sm disabled:opacity-50"
              >
                {isSubmittingReturn ? 'Submitting to Accounts...' : 'Submit Transaction Return'}
              </button>
            </form>
          </div>

          {/* Squad Collections Ledger Table Card */}
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm lg:col-span-2">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-6">
              <Coins className="w-5 h-5 text-emerald-500" />
              <span>Squad Collections Ledger</span>
            </h3>
            {loading ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Loading ledger logs...</p>
            ) : managerReturns.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500 py-8 text-center">No payment transactions logged yet for your squad.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800/80 max-h-[380px]">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-xs">
                  <thead className="bg-slate-105 dark:bg-slate-950 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 font-bold text-slate-550 dark:text-slate-400 tracking-wider">Tempo No</th>
                      <th className="px-4 py-3 font-bold text-slate-550 dark:text-slate-400 tracking-wider">Raider Name</th>
                      <th className="px-4 py-3 font-bold text-slate-550 dark:text-slate-400 tracking-wider">Plate No</th>
                      <th className="px-4 py-3 font-bold text-slate-550 dark:text-slate-400 tracking-wider">Date of Appointment</th>
                      <th className="px-4 py-3 font-bold text-slate-550 dark:text-slate-400 tracking-wider text-right">Payment Amount</th>
                      <th className="px-4 py-3 font-bold text-slate-550 dark:text-slate-400 tracking-wider">Date of Payment</th>
                      <th className="px-4 py-3 font-bold text-slate-550 dark:text-slate-400 tracking-wider text-right">Total Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900/20">
                    {managerReturns.map((item: any) => {
                      const raiderObj = managerRaiders.find(r => r.id === item.raider_id) || {};
                      const totalPaid = managerReturns
                        .filter((p: any) => p.raider_id === item.raider_id)
                        .reduce((sum: number, p: any) => sum + parseFloat(p.amount || 0), 0);

                      return (
                        <tr key={item.id} className="hover:bg-slate-100/40 dark:hover:bg-slate-800/20 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap font-bold text-cyan-600 dark:text-cyan-400">{raiderObj.tempo_reg_no || 'N/A'}</td>
                          <td className="px-4 py-3 whitespace-nowrap font-semibold text-slate-800 dark:text-slate-200">{raiderObj.name || 'Unknown'}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-650 dark:text-slate-300">{raiderObj.plate_no || 'N/A'}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-500 dark:text-slate-400">{raiderObj.date_of_appointment || 'N/A'}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-right font-extrabold text-emerald-600 dark:text-emerald-450">
                            ₦{parseFloat(item.amount).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-500 dark:text-slate-400">{item.date}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-right font-extrabold text-indigo-600 dark:text-indigo-400">
                            ₦{totalPaid.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Raider Calendar Tracker Block */}
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-500" />
                <span>Rider Daily Inflow Calendar Tracker</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Search squad rider by Tempo Number to view contract duration calendar, paid days, and missed daily returns</p>
            </div>

            {/* Search inputs */}
            <div className="flex gap-2 max-w-sm w-full relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search Tempo Number..."
                value={calendarSearchQuery}
                onChange={(e) => {
                  setCalendarSearchQuery(e.target.value);
                  // Auto-select match if exact
                  const match = managerRaiders.find(r => r.tempo_reg_no?.toLowerCase() === e.target.value.toLowerCase().trim());
                  if (match) setSelectedCalendarRaider(match);
                }}
                className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-xs"
              />
              {calendarSearchQuery && (
                <div className="absolute top-12 left-0 right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-h-48 overflow-y-auto z-20 shadow-xl text-xs">
                  {managerRaiders
                    .filter(r => r.tempo_reg_no?.toLowerCase().includes(calendarSearchQuery.toLowerCase()))
                    .map(r => (
                      <button
                        key={r.id}
                        onClick={() => {
                          setSelectedCalendarRaider(r);
                          setCalendarSearchQuery(r.tempo_reg_no || '');
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl text-slate-700 dark:text-slate-200"
                      >
                        {r.tempo_reg_no} - {r.name}
                      </button>
                    ))
                  }
                </div>
              )}
            </div>
          </div>

          {selectedCalendarRaider ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Raider Details & Legend */}
              <div className="space-y-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center font-bold text-indigo-500 text-sm">
                    {selectedCalendarRaider.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{selectedCalendarRaider.name}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Tempo: {selectedCalendarRaider.tempo_reg_no || 'N/A'}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs border-t border-slate-200 dark:border-slate-800 pt-3 text-slate-650 dark:text-slate-350">
                  <p><strong>Plate No:</strong> {selectedCalendarRaider.plate_no || 'N/A'}</p>
                  <p><strong>Appointment Date:</strong> {selectedCalendarRaider.date_of_appointment || 'N/A'}</p>
                  <p><strong>Delivery Date:</strong> {selectedCalendarRaider.date_of_purchase || 'N/A'}</p>
                  <p><strong>Contract Term:</strong> {selectedCalendarRaider.duration_of_completion || 'N/A'}</p>
                  <p><strong>Resell/Due Date:</strong> {selectedCalendarRaider.date_of_resell || 'N/A'}</p>
                </div>

                {/* Calculations for Legend */}
                {(() => {
                  const startDate = selectedCalendarRaider.date_of_purchase
                    ? new Date(selectedCalendarRaider.date_of_purchase)
                    : selectedCalendarRaider.date_of_appointment
                      ? new Date(selectedCalendarRaider.date_of_appointment)
                      : new Date();

                  const endDate = selectedCalendarRaider.date_of_resell
                    ? new Date(selectedCalendarRaider.date_of_resell)
                    : new Date(startDate.getTime() + (18 * 30 * 24 * 60 * 60 * 1000)); // Default 18 Months

                  const today = new Date();
                  const rPayments = managerReturns.filter((ret: any) => ret.raider_id === selectedCalendarRaider.id);

                  // Calculate total counts
                  let totalPaidDays = 0;
                  let totalMissedDays = 0;
                  let cursor = new Date(startDate);
                  const paymentDates = new Set(rPayments.map((ret: any) => ret.date));

                  while (cursor <= today && cursor <= endDate) {
                    const cursorStr = cursor.toISOString().split('T')[0];
                    if (cursor.getDay() !== 0) { // Exclude Sundays
                      if (paymentDates.has(cursorStr)) {
                        totalPaidDays++;
                      } else {
                        totalMissedDays++;
                      }
                    }
                    cursor.setDate(cursor.getDate() + 1);
                  }

                  return (
                    <div className="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-3">
                      <h5 className="font-bold text-xs uppercase text-slate-500 tracking-wider">Metrics Overview</h5>
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl p-2">
                          <div className="text-lg font-bold">{totalPaidDays}</div>
                          <div className="text-[10px] uppercase font-semibold">Paid Days</div>
                        </div>
                        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-xl p-2">
                          <div className="text-lg font-bold">{totalMissedDays}</div>
                          <div className="text-[10px] uppercase font-semibold">Missed Days</div>
                        </div>
                      </div>

                      <div className="text-xs space-y-1.5 text-slate-500">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
                          <span>Return Logged (Paid Inflow)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded bg-rose-500 inline-block" />
                          <span>Missed Daily Return (No Payment Logged)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded bg-slate-305 dark:bg-slate-700 inline-block" />
                          <span>Expected Future Days</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 inline-block" />
                          <span>Sundays (Rest/Non-inflow day)</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Interactive Calendar Panel */}
              <div className="lg:col-span-2 space-y-4">
                {(() => {
                  const startDate = selectedCalendarRaider.date_of_purchase
                    ? new Date(selectedCalendarRaider.date_of_purchase)
                    : selectedCalendarRaider.date_of_appointment
                      ? new Date(selectedCalendarRaider.date_of_appointment)
                      : new Date();

                  const endDate = selectedCalendarRaider.date_of_resell
                    ? new Date(selectedCalendarRaider.date_of_resell)
                    : new Date(startDate.getTime() + (18 * 30 * 24 * 60 * 60 * 1000));

                  const rPayments = managerReturns.filter((ret: any) => ret.raider_id === selectedCalendarRaider.id);
                  const paymentDates = new Set(rPayments.map((ret: any) => ret.date));
                  const todayStr = new Date().toISOString().split('T')[0];

                  // Helper to get days in month
                  const getDaysInMonth = (date: Date) => {
                    const year = date.getFullYear();
                    const month = date.getMonth();
                    const startOfMonth = new Date(year, month, 1);
                    const days = [];

                    // Fill padding days
                    const startDayOfWeek = startOfMonth.getDay();
                    for (let i = 0; i < startDayOfWeek; i++) {
                      days.push(null);
                    }

                    const lastDay = new Date(year, month + 1, 0).getDate();
                    for (let d = 1; d <= lastDay; d++) {
                      days.push(new Date(year, month, d));
                    }
                    return days;
                  };

                  const days = getDaysInMonth(currentCalendarMonth);
                  const monthName = currentCalendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

                  const navigateMonth = (direction: number) => {
                    const next = new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth() + direction, 1);
                    setCurrentCalendarMonth(next);
                  };

                  return (
                    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-900/60 shadow-inner">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-bold text-sm text-slate-800 dark:text-white">{monthName}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigateMonth(-1)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"
                          >
                            &larr; Prev
                          </button>
                          <button
                            onClick={() => navigateMonth(1)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"
                          >
                            Next &rarr;
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                        <span>Sun</span>
                        <span>Mon</span>
                        <span>Tue</span>
                        <span>Wed</span>
                        <span>Thu</span>
                        <span>Fri</span>
                        <span>Sat</span>
                      </div>

                      <div className="grid grid-cols-7 gap-1.5">
                        {days.map((day, idx) => {
                          if (!day) return <div key={`empty-${idx}`} className="aspect-square" />;

                          const dayStr = day.toISOString().split('T')[0];
                          const isSunday = day.getDay() === 0;

                          // Determine status
                          let bgClass = "bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-slate-800 dark:text-slate-200";
                          let title = "Rest Day (Sunday)";

                          if (day >= startDate && day <= endDate) {
                            if (isSunday) {
                              bgClass = "bg-slate-100 dark:bg-slate-955 text-slate-400 border border-slate-200 dark:border-slate-850";
                            } else {
                              if (paymentDates.has(dayStr)) {
                                bgClass = "bg-emerald-500 text-white font-bold";
                                title = "Return Logged (Paid)";
                              } else if (dayStr < todayStr) {
                                bgClass = "bg-rose-550 text-white font-bold animate-pulse";
                                title = "Missed Return (Overdue)";
                              } else {
                                bgClass = "bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold border border-slate-400/30";
                                title = "Expected Future Inflow";
                              }
                            }
                          } else {
                            bgClass = "bg-slate-50 dark:bg-slate-900/20 text-slate-350 dark:text-slate-750 pointer-events-none line-through";
                            title = "Outside contract span";
                          }

                          return (
                            <div
                              key={dayStr}
                              title={title}
                              className={`aspect-square flex items-center justify-center rounded-lg text-xs font-semibold select-none transition-all hover:scale-105 hover:shadow-md ${bgClass}`}
                            >
                              {day.getDate()}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-700" />
              <p className="text-xs">No rider selected. Enter a Tempo number above to initialize their calendar tracking.</p>
            </div>
          )}
        </div>

        {/* Assigned Raiders Squad Table */}
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Assigned Squad Raiders Fleet</h3>
          {loading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading squad files...</p>
          ) : managerRaiders.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">No raiders assigned to your squad. Contact system administrator.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800/80">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm">
                <thead className="bg-slate-105 dark:bg-slate-950">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider">Tempo Reg No</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider">Raider Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider">Plate Number</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider">Appointment Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider">Delivery Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider">Resell/Due Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider text-right">Total Amount Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900/20">
                  {managerRaiders.map((raider: any) => {
                    const totalPaid = managerReturns
                      .filter((p: any) => p.raider_id === raider.id)
                      .reduce((sum: number, p: any) => sum + parseFloat(p.amount || 0), 0);
                    return (
                      <tr key={raider.id} className="hover:bg-slate-100/40 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-bold text-cyan-600 dark:text-cyan-400">{raider.tempo_reg_no || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-800 dark:text-slate-200">{raider.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-650 dark:text-slate-300">{raider.plate_no || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400">{raider.date_of_appointment || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400">{raider.date_of_purchase || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400">{raider.date_of_resell || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right font-extrabold text-emerald-600 dark:text-emerald-455">
                          ₦{totalPaid.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Squad Compliance & Queries Logs */}
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <span>Squad Compliance Queries & Alerts ({managerCompliance.length})</span>
          </h3>
          {loading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading queries...</p>
          ) : managerCompliance.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-550 py-6 text-center">No compliance actions or queries registered for your squad riders.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800/80">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm">
                <thead className="bg-slate-105 dark:bg-slate-950">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider">Raider Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider">Subject / Violation</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider">Details</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900/20">
                  {managerCompliance.map((action: any) => {
                    const raiderObj = managerRaiders.find(r => r.id === action.raider_id) || {};
                    return (
                      <tr key={action.id} className="hover:bg-slate-100/40 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400">{action.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-800 dark:text-slate-200">{raiderObj.name || 'Unknown'}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900 dark:text-white">{action.subject}</td>
                        <td className="px-6 py-4 text-slate-650 dark:text-slate-350 text-xs">{action.details || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${action.status === 'Resolved'
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                              : action.status === 'Action Taken'
                                ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                            }`}>
                            {action.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // ADMIN/STAFF DASHBOARD RENDER
  // -------------------------------------------------------------
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
          <p className="text-xs text-slate-550 dark:text-slate-400 mt-1">Comparison of Returns vs Expenses</p>

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
            <p className="text-xs text-slate-505 dark:text-slate-400 mt-1 mb-4">Common operational workflows</p>
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
            <Link href="/accounts" className="text-xs font-semibold text-violet-605 dark:text-cyan-400 hover:underline flex items-center gap-1">
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
                      Date: {item.date} &bull; {item.raider_name ? 'Raider' : 'Manager'}
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
            <Link href="/compliance" className="text-xs font-semibold text-violet-605 dark:text-cyan-400 hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <p className="text-sm text-slate-550 dark:text-slate-400">Loading compliance...</p>
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
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${item.status === 'Resolved'
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
