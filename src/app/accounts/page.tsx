'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Briefcase, 
  TrendingUp, 
  TrendingDown, 
  FileSpreadsheet, 
  Trash2, 
  Calendar,
  BarChart3,
  Eye,
  Printer
} from 'lucide-react';
import ReportPreviewModal from '@/components/ReportPreviewModal';

interface Raider {
  id: number;
  name: string;
  tempo_reg_no?: string;
  md_leader_id?: number | null;
}

interface MDLeader {
  id: number;
  name: string;
  tempo_account?: string;
}

interface Expense {
  id: number;
  date: string;
  amount: number;
  category: string;
  description: string;
  recorded_by: string;
}

interface ReturnRecord {
  id: number;
  date: string;
  amount: number;
  raider_id?: number | null;
  md_leader_id?: number | null;
  raider_name?: string | null;
  md_leader_name?: string | null;
  receipt_no: string;
  comments: string;
}

export default function AccountsPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'returns' | 'expenses' | 'reports'>('returns');
  
  // Data lists
  const [raiders, setRaiders] = useState<Raider[]>([]);
  const [mdLeaders, setMDLeaders] = useState<MDLeader[]>([]);
  const [returns, setReturns] = useState<ReturnRecord[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState(true);

  // Return Form State
  const [returnForm, setReturnForm] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    payeeType: 'raider', // raider or md
    raider_id: '',
    md_leader_id: '',
    receipt_no: '',
    comments: '',
  });

  // Expense Form State
  const [expenseForm, setExpenseForm] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: 'Administration',
    description: '',
    recorded_by: '',
  });

  // Report Generator State
  const [reportDates, setReportDates] = useState({
    startDate: '',
    endDate: '',
  });
  const [reportData, setReportData] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState(false);

  // Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportPreviewTitle, setReportPreviewTitle] = useState('');
  const [reportPreviewFields, setReportPreviewFields] = useState<{label: string, value: any}[]>([]);
  const [reportPreviewTables, setReportPreviewTables] = useState<any[]>([]);

  const openReturnVoucher = (item: ReturnRecord) => {
    setReportPreviewTitle('CASH RETURN RECEIPT VOUCHER');
    setReportPreviewFields([
      { label: 'Payee Name', value: item.raider_name || item.md_leader_name || 'General Inflow' },
      { label: 'Payee Type', value: item.raider_id ? 'Raider (Motorcyclist)' : item.md_leader_id ? 'M/D Squad Leader' : 'General Inflow' },
      { label: 'Inflow Date', value: item.date },
      { label: 'Receipt Number', value: item.receipt_no || 'N/A' },
      { label: 'Return Amount', value: `₦${item.amount.toLocaleString()}` },
      { label: 'Remarks / Comments', value: item.comments || 'None' },
    ]);
    setReportPreviewTables([]);
    setShowReportModal(true);
  };

  const openExpenseVoucher = (item: Expense) => {
    setReportPreviewTitle('CASH OUTFLOW EXPENSE PAYMENT VOUCHER');
    setReportPreviewFields([
      { label: 'Voucher Description', value: item.description || 'General Outflow' },
      { label: 'Expense Category', value: item.category },
      { label: 'Outflow Date', value: item.date },
      { label: 'Disbursed Amount', value: `₦${item.amount.toLocaleString()}` },
      { label: 'Logged Officer', value: item.recorded_by || 'N/A' },
    ]);
    setReportPreviewTables([]);
    setShowReportModal(true);
  };

  const openFinancialReportPreview = () => {
    if (!reportData) return;
    setReportPreviewTitle('FINANCIAL SUMMARY REPORT');
    setReportPreviewFields([
      { label: 'Reporting Period', value: `${reportDates.startDate || 'Beginning'} to ${reportDates.endDate || 'Today'}` },
      { label: 'Total Inflows (Returns)', value: `₦${reportData.summary.totalReturns.toLocaleString()}` },
      { label: 'Total Outflows (Expenses)', value: `₦${reportData.summary.totalExpenses.toLocaleString()}` },
      { label: 'Net Income / Balance', value: `${reportData.summary.netIncome >= 0 ? '' : '-'}₦${Math.abs(reportData.summary.netIncome).toLocaleString()}` },
    ]);
    
    const categoryRows = reportData.expensesByCategory.map((c: any) => {
      const percent = reportData.summary.totalExpenses ? (c.total / reportData.summary.totalExpenses) * 100 : 0;
      return [c.category, `₦${c.total.toLocaleString()}`, `${percent.toFixed(1)}%`];
    });

    const returnsLogRows = reportData.detailedReturns.map((r: any) => [
      r.date,
      r.raider_name || r.md_leader_name || 'General Inflow',
      r.receipt_no || 'N/A',
      `₦${r.amount.toLocaleString()}`
    ]);

    const expensesLogRows = reportData.detailedExpenses.map((e: any) => [
      e.date,
      e.description || 'N/A',
      e.category,
      `₦${e.amount.toLocaleString()}`
    ]);

    setReportPreviewTables([
      {
        title: 'Expense Categories Analysis',
        headers: ['Category', 'Total Amount', 'Percentage (%)'],
        rows: categoryRows
      },
      {
        title: 'Period Returns Activity Ledger',
        headers: ['Date', 'Payee Name', 'Receipt No', 'Amount'],
        rows: returnsLogRows
      },
      {
        title: 'Period Expenses Activity Ledger',
        headers: ['Date', 'Description', 'Category', 'Amount'],
        rows: expensesLogRows
      }
    ]);
    setShowReportModal(true);
  };

  const selectedRaiderObj = returnForm.payeeType === 'raider' && returnForm.raider_id 
    ? raiders.find(r => r.id === parseInt(returnForm.raider_id)) 
    : null;

  const selectedManagerObj = returnForm.payeeType === 'md' && returnForm.md_leader_id 
    ? mdLeaders.find(m => m.id === parseInt(returnForm.md_leader_id)) 
    : null;

  useEffect(() => {
    fetchMeta();
    fetchReturns();
    fetchExpenses();
  }, []);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'returns' || tab === 'expenses' || tab === 'reports') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  async function fetchMeta() {
    try {
      const raiderRes = await fetch('/api/raiders');
      if (raiderRes.ok) setRaiders(await raiderRes.json());

      const mdRes = await fetch('/api/md-leaders');
      if (mdRes.ok) setMDLeaders(await mdRes.json());
    } catch (err) {
      console.error('Error fetching metadata:', err);
    }
  }

  async function fetchReturns() {
    try {
      setLoading(true);
      const res = await fetch('/api/accounts/returns');
      if (res.ok) setReturns(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchExpenses() {
    try {
      setLoading(true);
      const res = await fetch('/api/accounts/expenses');
      if (res.ok) setExpenses(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnForm.amount) return alert('Amount is required');
    if (returnForm.payeeType === 'raider' && !returnForm.raider_id) return alert('Select a Raider');
    if (returnForm.payeeType === 'md' && !returnForm.md_leader_id) return alert('Select an M/D Leader');

    try {
      const payload = {
        date: returnForm.date,
        amount: parseFloat(returnForm.amount),
        raider_id: returnForm.payeeType === 'raider' ? parseInt(returnForm.raider_id) : null,
        md_leader_id: returnForm.payeeType === 'md' ? parseInt(returnForm.md_leader_id) : null,
        receipt_no: returnForm.receipt_no,
        comments: returnForm.comments,
      };

      const res = await fetch('/api/accounts/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setReturnForm({
          date: new Date().toISOString().split('T')[0],
          amount: '',
          payeeType: 'raider',
          raider_id: '',
          md_leader_id: '',
          receipt_no: '',
          comments: '',
        });
        fetchReturns();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.amount) return alert('Amount is required');

    try {
      const payload = {
        date: expenseForm.date,
        amount: parseFloat(expenseForm.amount),
        category: expenseForm.category,
        description: expenseForm.description,
        recorded_by: expenseForm.recorded_by,
      };

      const res = await fetch('/api/accounts/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setExpenseForm({
          date: new Date().toISOString().split('T')[0],
          amount: '',
          category: 'Administration',
          description: '',
          recorded_by: '',
        });
        fetchExpenses();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteReturn = async (id: number) => {
    if (!confirm('Delete this return log?')) return;
    try {
      const res = await fetch(`/api/accounts/returns/${id}`, { method: 'DELETE' });
      if (res.ok) fetchReturns();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteExpense = async (id: number) => {
    if (!confirm('Delete this expense log?')) return;
    try {
      const res = await fetch(`/api/accounts/expenses/${id}`, { method: 'DELETE' });
      if (res.ok) fetchExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  const generateFinancialReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setReportLoading(true);
      const { startDate, endDate } = reportDates;
      let url = '/api/accounts/generate-report?';
      if (startDate) url += `startDate=${startDate}&`;
      if (endDate) url += `endDate=${endDate}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setReportData(data);
      }
    } catch (err) {
      console.error('Error generating report:', err);
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg md:text-xl font-bold tracking-tight text-slate-805 dark:text-white flex items-center gap-2">
        <Briefcase className="w-5 h-5 text-violet-500" />
        <span>Accounts Office & Bookkeeping</span>
      </h2>

      {/* Tabs Menu */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-px">
        <button
          onClick={() => setActiveTab('returns')}
          className={`px-4 py-2.5 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'returns' 
              ? 'border-violet-500 text-slate-800 dark:text-white bg-violet-500/10' 
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          <span>Raider Returns (Inflows)</span>
        </button>
        
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-2.5 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'expenses' 
              ? 'border-violet-500 text-slate-800 dark:text-white bg-violet-500/10' 
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <TrendingDown className="w-4 h-4 text-rose-500" />
          <span>Expenses Logs (Outflows)</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2.5 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'reports' 
              ? 'border-violet-500 text-slate-800 dark:text-white bg-violet-500/10' 
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-cyan-500" />
          <span>Generate Reports Summary</span>
        </button>
      </div>

      {/* TAB 1: RETURNS */}
      {activeTab === 'returns' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 self-start space-y-4 shadow-sm">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Log Raider Return Payment</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Log payment collected from the field</p>
            </div>
            
            <form onSubmit={handleReturnSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Payment Date</label>
                  <input type="date" value={returnForm.date} onChange={(e) => setReturnForm(prev => ({ ...prev, date: e.target.value }))} required className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Amount (₦)</label>
                  <input type="number" placeholder="Amount paid" value={returnForm.amount} onChange={(e) => setReturnForm(prev => ({ ...prev, amount: e.target.value }))} required className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Payee Type</label>
                  <select value={returnForm.payeeType} onChange={(e) => setReturnForm(prev => ({ ...prev, payeeType: e.target.value, raider_id: '', md_leader_id: '' }))} className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm">
                    <option value="raider">Raider (Motorcyclist)</option>
                    <option value="md">M/D Leader (Delivery)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Receipt Number</label>
                  <input type="text" placeholder="e.g. REC-5930" value={returnForm.receipt_no} onChange={(e) => setReturnForm(prev => ({ ...prev, receipt_no: e.target.value }))} className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm" />
                </div>
              </div>              {returnForm.payeeType === 'raider' ? (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-505 dark:text-slate-400 uppercase">Select Raider *</label>
                    <select value={returnForm.raider_id} onChange={(e) => setReturnForm(prev => ({ ...prev, raider_id: e.target.value }))} className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm">
                      <option value="">-- Choose Raider --</option>
                      {raiders.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </div>
                  {selectedRaiderObj && (
                    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-3.5 rounded-xl text-xs flex justify-between items-center">
                      <span className="text-slate-500 font-semibold uppercase">Raider Tempo No:</span>
                      <span className="font-extrabold text-cyan-600 dark:text-cyan-400">{selectedRaiderObj.tempo_reg_no || 'N/A'}</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-505 dark:text-slate-400 uppercase">Select Manager *</label>
                    <select value={returnForm.md_leader_id} onChange={(e) => setReturnForm(prev => ({ ...prev, md_leader_id: e.target.value }))} className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm">
                      <option value="">-- Choose Manager --</option>
                      {mdLeaders.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                  {selectedManagerObj && (
                    <div className="space-y-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-3.5 rounded-xl text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-semibold uppercase">Manager Tempo a/c:</span>
                        <span className="font-extrabold text-violet-605 dark:text-violet-400">{selectedManagerObj.tempo_account || 'N/A'}</span>
                      </div>
                      <div className="border-t border-slate-200 dark:border-slate-800 pt-2">
                        <span className="text-slate-500 font-semibold uppercase block mb-1">Assigned Raiders squad:</span>
                        {raiders.filter(r => r.md_leader_id === selectedManagerObj.id).length === 0 ? (
                          <span className="text-slate-400">No raiders assigned to this manager yet.</span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {raiders.filter(r => r.md_leader_id === selectedManagerObj.id).map(r => (
                              <span key={r.id} className="inline-flex px-2 py-0.5 bg-violet-500/10 border border-violet-500/20 text-violet-650 dark:text-violet-400 rounded text-[10px] font-semibold">{r.name}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Remarks / Comments</label>
                <textarea placeholder="Any additional notes" value={returnForm.comments} onChange={(e) => setReturnForm(prev => ({ ...prev, comments: e.target.value }))} rows={3} className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm" />
              </div>

              <button type="submit" className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-2.5 rounded-xl transition-all shadow-lg shadow-violet-500/10 text-sm mt-2 flex items-center justify-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                <span>Log Return Inflow</span>
              </button>
            </form>
          </div>

          {/* List */}
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Log Inflows Records</h3>
            {loading ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Loading records...</p>
            ) : returns.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500">No returns logged.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800/80 max-h-[450px]">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm">
                  <thead className="bg-slate-105 dark:bg-slate-950">
                    <tr>
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Payee Name</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Date</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Receipt</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Amount</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-850">
                    {returns.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/10">
                        <td className="px-4 py-3 font-bold text-slate-800 dark:text-white">{item.raider_name || item.md_leader_name || 'General Inflow'}</td>
                        <td className="px-4 py-3 text-slate-650 dark:text-slate-305">{item.date}</td>
                        <td className="px-4 py-3 text-slate-655 dark:text-slate-305">{item.receipt_no || 'N/A'}</td>
                        <td className="px-4 py-3 text-emerald-605 dark:text-emerald-400 font-bold">₦{item.amount.toLocaleString()}</td>
                        <td className="px-4 py-3 flex items-center gap-1.5">
                          <button 
                            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white text-xs font-semibold p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 transition-all"
                            onClick={() => openReturnVoucher(item)}
                            title="Print Voucher / Receipt"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            className="bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white text-xs font-semibold p-1.5 rounded-lg border border-rose-500/20 transition-all"
                            onClick={() => deleteReturn(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* TAB 2: EXPENSES */}
      {activeTab === 'expenses' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 self-start space-y-4 shadow-sm">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Log Office Expense</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Log cash paid out for operations</p>
            </div>
            
            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Expense Date</label>
                  <input type="date" value={expenseForm.date} onChange={(e) => setExpenseForm(prev => ({ ...prev, date: e.target.value }))} required className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Amount (₦)</label>
                  <input type="number" placeholder="Expense Amount" value={expenseForm.amount} onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))} required className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Category</label>
                  <select value={expenseForm.category} onChange={(e) => setExpenseForm(prev => ({ ...prev, category: e.target.value }))} className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm">
                    <option value="Administration">Administration</option>
                    <option value="Maintenance">Vehicle Maintenance</option>
                    <option value="Auxiliary">Sec & Auxiliary Staff</option>
                    <option value="Compliance">Compliance & Legal</option>
                    <option value="Fuel">Fuel / Logistics</option>
                    <option value="Other">Other Expenses</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Recorded By</label>
                  <input type="text" placeholder="Logged Officer Name" value={expenseForm.recorded_by} onChange={(e) => setExpenseForm(prev => ({ ...prev, recorded_by: e.target.value }))} className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Description / Details</label>
                <textarea placeholder="Detail explanation of the payment made" value={expenseForm.description} onChange={(e) => setExpenseForm(prev => ({ ...prev, description: e.target.value }))} rows={4} className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm" />
              </div>

              <button type="submit" className="w-full bg-rose-600 hover:bg-rose-500 text-white font-semibold py-2.5 rounded-xl transition-all shadow-lg shadow-rose-500/10 text-sm mt-2 flex items-center justify-center gap-1.5">
                <TrendingDown className="w-4 h-4" />
                <span>Log Expense Outflow</span>
              </button>
            </form>
          </div>

          {/* List */}
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Log Outflows Records</h3>
            {loading ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Loading records...</p>
            ) : expenses.length === 0 ? (
              <p className="text-sm text-slate-450 dark:text-slate-550">No expenses logged.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800/80 max-h-[450px]">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm">
                  <thead className="bg-slate-105 dark:bg-slate-955">
                    <tr>
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Description</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-505 dark:text-slate-400 uppercase">Category</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-505 dark:text-slate-400 uppercase">Date</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-505 dark:text-slate-400 uppercase">Amount</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-505 dark:text-slate-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-850">
                    {expenses.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/10">
                        <td className="px-4 py-3 font-bold text-slate-800 dark:text-white">{item.description || 'General Expense'}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-305">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-655 dark:text-slate-300">{item.date}</td>
                        <td className="px-4 py-3 text-rose-600 dark:text-rose-400 font-bold">₦{item.amount.toLocaleString()}</td>
                        <td className="px-4 py-3 flex items-center gap-1.5">
                          <button 
                            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white text-xs font-semibold p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 transition-all"
                            onClick={() => openExpenseVoucher(item)}
                            title="Print Voucher / Voucher Receipt"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            className="bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white text-xs font-semibold p-1.5 rounded-lg border border-rose-500/20 transition-all"
                            onClick={() => deleteExpense(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* TAB 3: REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-8">
          {/* Query Form */}
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-violet-500" />
              <span>Generate Financial Report Summary</span>
            </h3>
            
            <form onSubmit={generateFinancialReport} className="flex gap-4 items-end flex-wrap">
              <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Start Date</label>
                <input type="date" value={reportDates.startDate} onChange={(e) => setReportDates(prev => ({ ...prev, startDate: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm" />
              </div>
              <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">End Date</label>
                <input type="date" value={reportDates.endDate} onChange={(e) => setReportDates(prev => ({ ...prev, endDate: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm" />
              </div>
              <button type="submit" className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-violet-500/10 text-sm flex items-center gap-1.5" disabled={reportLoading}>
                <BarChart3 className="w-4 h-4" />
                <span>{reportLoading ? 'Processing...' : 'Run Report Generator'}</span>
              </button>
            </form>
          </div>

          {/* Report Results */}
          {reportData && (
            <div className="space-y-8">
              <div className="flex justify-between items-center bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm">
                <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-violet-500" />
                  <span>Financial Summary breakdown ({reportDates.startDate || 'All Time'} &mdash; {reportDates.endDate || 'Today'})</span>
                </h4>
                <button
                  type="button"
                  className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 text-xs active:scale-95"
                  onClick={openFinancialReportPreview}
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Export Summary</span>
                </button>
              </div>

              {/* Totals */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 border-t-4 border-t-emerald-500 rounded-2xl p-6 text-center shadow-sm">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-505 dark:text-slate-400">Period Inflows (Returns)</div>
                  <div className="text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 mt-2">₦{reportData.summary.totalReturns.toLocaleString()}</div>
                </div>
                
                <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 border-t-4 border-t-rose-500 rounded-2xl p-6 text-center shadow-sm">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-505 dark:text-slate-400">Period Outflows (Expenses)</div>
                  <div className="text-3xl font-extrabold tracking-tight text-rose-600 dark:text-rose-400 mt-2">₦{reportData.summary.totalExpenses.toLocaleString()}</div>
                </div>

                <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 border-t-4 border-t-cyan-500 rounded-2xl p-6 text-center shadow-sm">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-550 dark:text-slate-400">Net Balance Sheet</div>
                  <div className={`text-3xl font-extrabold tracking-tight mt-2 ${reportData.summary.netIncome >= 0 ? 'text-cyan-600 dark:text-cyan-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {reportData.summary.netIncome < 0 ? '-' : ''}₦{Math.abs(reportData.summary.netIncome).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Expense Categories */}
                <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Expense Categories Analysis</h3>
                  {reportData.expensesByCategory.length === 0 ? (
                    <p className="text-sm text-slate-550 py-4">No expenses recorded in this period.</p>
                  ) : (
                    <div className="space-y-4">
                      {reportData.expensesByCategory.map((c: any) => {
                        const percent = reportData.summary.totalExpenses ? (c.total / reportData.summary.totalExpenses) * 100 : 0;
                        return (
                          <div key={c.category} className="space-y-1.5">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-705 dark:text-slate-300 font-medium">{c.category}</span>
                              <strong className="text-slate-805 dark:text-white">₦{c.total.toLocaleString()} ({percent.toFixed(1)}%)</strong>
                            </div>
                            <div className="w-full h-2 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-rose-500 to-violet-500 rounded-full" style={{ width: `${percent}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Ledger report breakdown */}
                <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Period Activity Log</h3>
                  <div className="space-y-6 max-h-80 overflow-y-auto pr-2">
                    <div>
                      <h5 className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">Returns Ledger</h5>
                      {reportData.detailedReturns.length === 0 ? (
                        <p className="text-xs text-slate-500 py-1">No returns recorded.</p>
                      ) : (
                        <div className="divide-y divide-slate-150 dark:divide-slate-850">
                          {reportData.detailedReturns.map((r: any) => (
                            <div key={`ret-${r.id}`} className="py-2.5 flex justify-between text-xs">
                              <span className="text-slate-600 dark:text-slate-300">{r.date} &bull; {r.raider_name || r.md_leader_name}</span>
                              <strong className="text-emerald-600 dark:text-emerald-400">+₦{r.amount.toLocaleString()}</strong>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <h5 className="text-xs font-extrabold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-2">Expenses Ledger</h5>
                      {reportData.detailedExpenses.length === 0 ? (
                        <p className="text-xs text-slate-500 py-1">No expenses recorded.</p>
                      ) : (
                        <div className="divide-y divide-slate-150 dark:divide-slate-855">
                          {reportData.detailedExpenses.map((e: any) => (
                            <div key={`exp-${e.id}`} className="py-2.5 flex justify-between text-xs">
                              <span className="text-slate-600 dark:text-slate-300">{e.date} &bull; {e.description} ({e.category})</span>
                              <strong className="text-rose-600 dark:text-rose-400">-₦{e.amount.toLocaleString()}</strong>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <ReportPreviewModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title={reportPreviewTitle}
        recordData={reportPreviewFields}
        tables={reportPreviewTables}
      />
    </div>
  );
}
