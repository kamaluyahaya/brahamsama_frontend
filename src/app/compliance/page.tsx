'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  ShieldAlert, 
  Plus, 
  Save, 
  Trash2, 
  X, 
  Search,
  Eye,
  Printer
} from 'lucide-react';
import ReportPreviewModal from '@/components/ReportPreviewModal';

interface Raider {
  id: number;
  name: string;
}

interface Client {
  id: number;
  name: string;
}

interface ComplianceAction {
  id: number;
  date: string;
  subject: string;
  details: string;
  status: string;
  raider_id?: number | null;
  client_id?: number | null;
  raider_name?: string | null;
  client_name?: string | null;
}

export default function CompliancePage() {
  const [actions, setActions] = useState<ComplianceAction[]>([]);
  const [raiders, setRaiders] = useState<Raider[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState<ComplianceAction | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    subject: '',
    details: '',
    status: 'Pending',
    targetType: 'raider', // raider or client
    raider_id: '',
    client_id: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMeta();
    fetchCompliance();
  }, [search, statusFilter]);

  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setShowAddModal(true);
    }
  }, [searchParams]);

  async function fetchMeta() {
    try {
      const raiderRes = await fetch('/api/raiders');
      if (raiderRes.ok) setRaiders(await raiderRes.json());

      const clientRes = await fetch('/api/clients');
      if (clientRes.ok) setClients(await clientRes.json());
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchCompliance() {
    try {
      setLoading(true);
      let url = `/api/compliance?search=${encodeURIComponent(search)}`;
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }
      const res = await fetch(url);
      if (res.ok) setActions(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject) return alert('Subject is required');

    setIsSubmitting(true);
    try {
      const payload = {
        date: formData.date,
        subject: formData.subject,
        details: formData.details,
        status: formData.status,
        raider_id: formData.targetType === 'raider' && formData.raider_id ? parseInt(formData.raider_id) : null,
        client_id: formData.targetType === 'client' && formData.client_id ? parseInt(formData.client_id) : null,
      };

      const res = await fetch('/api/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowAddModal(false);
        setFormData({
          date: new Date().toISOString().split('T')[0],
          subject: '',
          details: '',
          status: 'Pending',
          targetType: 'raider',
          raider_id: '',
          client_id: '',
        });
        fetchCompliance();
      }
    } catch (err) {
      console.error(err);
      alert('Error saving query log');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/compliance/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchCompliance();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteAction = async (id: number) => {
    if (!confirm('Are you sure you want to delete this compliance record?')) return;
    try {
      const res = await fetch(`/api/compliance/${id}`, { method: 'DELETE' });
      if (res.ok) fetchCompliance();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg md:text-xl font-bold tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-500" />
          <span>Disciplinary Compliance & Queries</span>
        </h2>
        <button 
          className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-violet-500/10 flex items-center gap-2 text-sm"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="w-4 h-4" />
          <span>Log Query / Issue</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 flex gap-4 flex-wrap shadow-sm relative flex-row items-center">
        <div className="flex-grow relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by subject, details, or target name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800/80 rounded-xl pl-11 pr-4 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-505 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
          />
        </div>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)} 
          className="w-full sm:w-56 bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800/80 rounded-xl px-4 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
        >
          <option value="">-- All Statuses --</option>
          <option value="Pending">Pending Queries</option>
          <option value="Resolved">Resolved</option>
          <option value="Action Taken">Action Taken / Suspended</option>
        </select>
      </div>

      {/* Compliance Log List */}
      <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm">
        {loading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading compliance database...</p>
        ) : actions.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">No compliance queries matching filter guidelines found.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800/80">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm">
              <thead className="bg-slate-100 dark:bg-slate-950">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Target Type</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Responsible Target</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Query Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Change Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900/20">
                {actions.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/10 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${item.raider_id
                        ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20'
                        : 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20'
                        }`}>
                        {item.raider_id ? 'RAIDER' : item.client_id ? 'CLIENT' : 'GENERAL'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-850 dark:text-white">{item.raider_name || item.client_name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-305">{item.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-800 dark:text-slate-200">{item.subject}</td>
                    <td className="px-6 py-4 text-slate-550 dark:text-slate-400 max-w-xs truncate">{item.details}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${item.status === 'Resolved'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : item.status === 'Pending'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                        }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={item.status}
                        onChange={(e) => updateStatus(item.id, e.target.value)}
                        className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-white focus:outline-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Action Taken">Action Taken</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap flex items-center gap-1.5">
                      <button 
                        className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white text-xs font-semibold p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 transition-all"
                        onClick={() => { setSelectedAction(item); setShowDetailModal(true); }}
                        title="View Full Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        className="bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white text-xs font-semibold p-1.5 rounded-lg border border-rose-500/20 transition-all"
                        onClick={() => deleteAction(item.id)}
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

      {/* Add Compliance/Query Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-955/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-[0.5rem] p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Log Disciplinary / Compliance Issue</h3>
              <button className="text-slate-400 hover:text-slate-655 dark:hover:text-white" onClick={() => setShowAddModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Incident Date</label>
                  <input type="date" name="date" value={formData.date} onChange={handleInputChange} required className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Initial Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm">
                    <option value="Pending">Pending Response</option>
                    <option value="Resolved">Resolved (No issue)</option>
                    <option value="Action Taken">Action Taken (Suspended/Fined)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Target Type</label>
                  <select name="targetType" value={formData.targetType} onChange={handleInputChange} className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm">
                    <option value="raider">Raider (Motorcyclist)</option>
                    <option value="client">Client File</option>
                  </select>
                </div>
                {formData.targetType === 'raider' ? (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-505 dark:text-slate-400 uppercase">Select Raider *</label>
                    <select name="raider_id" value={formData.raider_id} onChange={handleInputChange} className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm">
                      <option value="">-- Choose Raider --</option>
                      {raiders.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase">Select Client *</label>
                    <select name="client_id" value={formData.client_id} onChange={handleInputChange} className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm">
                      <option value="">-- Choose Client --</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Disciplinary Subject *</label>
                <input type="text" name="subject" value={formData.subject} onChange={handleInputChange} placeholder="e.g. Late returns payment / Route violation" required className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Disciplinary Query details</label>
                <textarea name="details" value={formData.details} onChange={handleInputChange} placeholder="Provide details of the incident or query description" rows={5} className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm" />
              </div>

              <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-800 pt-6">
                <button type="button" className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="bg-violet-600 hover:bg-violet-505 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2" disabled={isSubmitting}>
                  <Save className="w-4 h-4" />
                  <span>{isSubmitting ? 'Logging...' : 'Log Compliance Query'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Detail View Modal */}
      {showDetailModal && selectedAction && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-[0.5rem] p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Compliance Log Details</h3>
              <button className="text-slate-400 hover:text-slate-655 dark:hover:text-white" onClick={() => setShowDetailModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 p-4 rounded-xl space-y-2.5">
                <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-800">
                  <span className="font-semibold text-slate-500">Target Type:</span>
                  <span className="text-slate-800 dark:text-white font-bold uppercase">{selectedAction.raider_id ? 'Raider' : selectedAction.client_id ? 'Client' : 'General'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-800">
                  <span className="font-semibold text-slate-500">Responsible Party:</span>
                  <span className="text-slate-800 dark:text-white font-bold">{selectedAction.raider_name || selectedAction.client_name || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-800">
                  <span className="font-semibold text-slate-500">Incident Date:</span>
                  <span className="text-slate-800 dark:text-white">{selectedAction.date}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-800">
                  <span className="font-semibold text-slate-500">Subject:</span>
                  <span className="text-slate-800 dark:text-white font-semibold">{selectedAction.subject}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="font-semibold text-slate-500">Current Status:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${selectedAction.status === 'Resolved'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : selectedAction.status === 'Pending'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                    }`}>{selectedAction.status}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-rose-605 dark:text-rose-400 uppercase tracking-wider mb-2">Query Details & Case Description</h4>
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-855 p-4 rounded-xl text-slate-800 dark:text-slate-300 min-h-[120px] whitespace-pre-wrap">
                  {selectedAction.details || 'No additional log details provided.'}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-800 pt-6">
              <button 
                className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5"
                onClick={() => { deleteAction(selectedAction.id); setShowDetailModal(false); }}
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Log</span>
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
                  className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all"
                  onClick={() => setShowDetailModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedAction && (
        <ReportPreviewModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          title="Disciplinary Compliance Query Log"
          recordData={[
            { label: 'Responsible Target', value: selectedAction.raider_name || selectedAction.client_name || 'N/A' },
            { label: 'Target Type', value: selectedAction.raider_id ? 'Raider (Motorcyclist)' : selectedAction.client_id ? 'Client File' : 'General' },
            { label: 'Incident Date', value: selectedAction.date },
            { label: 'Disciplinary Subject', value: selectedAction.subject },
            { label: 'Current Status', value: selectedAction.status },
            { label: 'Query / Case Details', value: selectedAction.details || 'N/A' },
          ]}
        />
      )}
    </div>
  );
}
