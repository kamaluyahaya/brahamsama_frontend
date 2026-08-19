'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  ClipboardList, 
  Plus, 
  Eye, 
  Save, 
  Trash2, 
  X, 
  Search,
  Phone,
  User,
  Printer
} from 'lucide-react';
import ReportPreviewModal from '@/components/ReportPreviewModal';

interface Payment {
  id: number;
  date: string;
  amount: number;
  receipt_no: string;
}

interface AssignedRaider {
  id: number;
  name: string;
  plate_no?: string;
  tempo_reg_no?: string;
}

interface MDLeader {
  id: number;
  name: string;
  phone: string;
  tempo_account: string;
  reports: string;
  created_at?: string;
  payments?: Payment[];
  raiders?: AssignedRaider[];
}

export default function MDLeadersPage() {
  const [leaders, setLeaders] = useState<MDLeader[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLeader, setSelectedLeader] = useState<MDLeader | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    tempo_account: '',
    reports: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchLeaders();
  }, [search]);

  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setShowAddModal(true);
    }
  }, [searchParams]);

  async function fetchLeaders() {
    try {
      setLoading(true);
      const res = await fetch(`/api/md-leaders?search=${encodeURIComponent(search)}`);
      if (res.ok) {
        const data = await res.json();
        setLeaders(data);
      }
    } catch (err) {
      console.error('Error fetching leaders:', err);
    } finally {
      setLoading(false);
    }
  }

  async function viewLeaderDetails(id: number) {
    try {
      const res = await fetch(`/api/md-leaders/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedLeader(data);
        setShowDetailModal(true);
      }
    } catch (err) {
      console.error('Error fetching leader details:', err);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return alert('Name is required');

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/md-leaders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowAddModal(false);
        setFormData({
          name: '',
          phone: '',
          tempo_account: '',
          reports: '',
        });
        fetchLeaders();
      } else {
        const errData = await res.json();
        alert('Error: ' + errData.message);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save M/D leader record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteLeader = async (id: number) => {
    if (!confirm('Are you sure you want to delete this leader record?')) return;
    try {
      const res = await fetch(`/api/md-leaders/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchLeaders();
        setShowDetailModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg md:text-xl font-bold tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-violet-500" />
          <span>Motor & Delivery (M/D) Leaders</span>
        </h2>
        <button 
          className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-violet-500/10 flex items-center gap-2 text-sm"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="w-4 h-4" />
          <span>Add M/D Leader</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm relative flex items-center">
        <Search className="w-4 h-4 text-slate-400 absolute left-8 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by M/D leader name, phone, or Tempo Account..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800/80 rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 text-sm"
        />
      </div>

      {/* Leaders Table */}
      <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm">
        {loading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading leader files...</p>
        ) : leaders.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">No leaders found. Click 'Add M/D Leader' to register one.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800/80">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm">
              <thead className="bg-slate-105 dark:bg-slate-950">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider">Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider">Phone No</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider">Tempo Account Code</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider">Reports Summary</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900/20">
                {leaders.map((leader) => (
                  <tr 
                    key={leader.id} 
                    className="hover:bg-slate-100/40 dark:hover:bg-slate-800/20 cursor-pointer transition-colors"
                    onClick={() => viewLeaderDetails(leader.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-800 dark:text-white">{leader.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-650 dark:text-slate-300">{leader.phone || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-650 dark:text-cyan-400 border border-cyan-500/20">
                        {leader.tempo_account || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {leader.reports || 'No reports filed'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button 
                        className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 transition-all flex items-center gap-1.5"
                        onClick={() => viewLeaderDetails(leader.id)}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Leader Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-955/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-[0.5rem] p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Register M/D Leader</h3>
              <button className="text-slate-400 hover:text-slate-650 dark:hover:text-white" onClick={() => setShowAddModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Leader Full Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm" placeholder="Full Name" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase">Phone Number</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm" placeholder="e.g. +234..." />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase">Tempo Account Identifier</label>
                <input type="text" name="tempo_account" value={formData.tempo_account} onChange={handleInputChange} className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm" placeholder="e.g. TM/AC-1002" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Operational Reports / Notes</label>
                <textarea name="reports" value={formData.reports} onChange={handleInputChange} className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm" placeholder="Notes, reports or remarks regarding this delivery leader's squad" rows={4} />
              </div>

              <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-800 pt-6">
                <button type="button" className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2" disabled={isSubmitting}>
                  <Save className="w-4 h-4" />
                  <span>{isSubmitting ? 'Saving...' : 'Register Leader'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail View Modal */}
      {showDetailModal && selectedLeader && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-955/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-[0.5rem] p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">M/D Leader details: {selectedLeader.name}</h3>
              <button className="text-slate-400 hover:text-slate-655 dark:hover:text-white" onClick={() => setShowDetailModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 p-4 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    <span>Phone Number:</span>
                  </span>
                  <span className="text-slate-800 dark:text-white">{selectedLeader.phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    <span>Tempo Account:</span>
                  </span>
                  <span className="text-slate-800 dark:text-white font-bold">{selectedLeader.tempo_account || 'N/A'}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-2">Operational Reports</h4>
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-855 p-4 rounded-xl text-slate-800 dark:text-slate-300 min-h-[100px] whitespace-pre-wrap">
                  {selectedLeader.reports || 'No reports filed.'}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-2">Assigned Raiders Squad</h4>
                {selectedLeader.raiders && selectedLeader.raiders.length === 0 ? (
                  <p className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl">No raiders assigned to this manager squad yet.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                    {selectedLeader.raiders?.map(r => (
                      <div key={r.id} className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs flex justify-between items-center">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">🏍️ {r.name}</span>
                        <span className="text-[10px] bg-cyan-500/10 text-cyan-605 px-2 py-0.5 rounded border border-cyan-500/20">{r.tempo_reg_no || 'No Tempo'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">Collections History</h4>
                {selectedLeader.payments && selectedLeader.payments.length === 0 ? (
                  <p className="text-xs text-slate-500">No payment logs recorded yet.</p>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                    {selectedLeader.payments?.map(pay => (
                      <div key={pay.id} className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs">
                        <span className="text-slate-600 dark:text-slate-300">📅 {pay.date} (Rec: {pay.receipt_no})</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">₦{pay.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-800 pt-6">
              <button 
                className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5"
                onClick={() => deleteLeader(selectedLeader.id)}
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Leader</span>
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

      {selectedLeader && (
        <ReportPreviewModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          title="M/D Leader Squad Report"
          recordData={[
            { label: 'Leader Name', value: selectedLeader.name },
            { label: 'Phone Number', value: selectedLeader.phone },
            { label: 'Tempo Account', value: selectedLeader.tempo_account },
            { label: 'Operational Reports', value: selectedLeader.reports || 'No reports filed.' },
          ]}
          tables={[
            {
              title: 'Assigned Raiders Squad',
              headers: ['Raider Name', 'Tempo Reg No'],
              rows: (selectedLeader.raiders || []).map(r => [
                r.name,
                r.tempo_reg_no || 'No Tempo'
              ])
            },
            {
              title: 'Collections / Payments History',
              headers: ['Date', 'Receipt No', 'Amount Collected'],
              rows: (selectedLeader.payments || []).map(p => [
                p.date,
                p.receipt_no,
                `₦${p.amount.toLocaleString()}`
              ])
            }
          ]}
        />
      )}
    </div>
  );
}
