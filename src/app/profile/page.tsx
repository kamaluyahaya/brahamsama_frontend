'use client';

import React, { useState, useEffect } from 'react';
import { User, Lock, KeyRound, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [clientMotorcycles, setClientMotorcycles] = useState<any[]>([]);
  
  // Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Feedback States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed.role === 'Client') {
          // Fetch latest data from database
          fetch(`/api/clients/${parsed.id}`)
            .then(res => {
              if (res.ok) return res.json();
              throw new Error('Failed to fetch latest client profile info');
            })
            .then(data => {
              const fullUser = { ...parsed, ...data };
              setCurrentUser(fullUser);
              localStorage.setItem('currentUser', JSON.stringify(fullUser));
            })
            .catch(err => {
              console.error('Error fetching client details:', err);
              setCurrentUser(parsed);
            });

          // Fetch assigned tricycles
          fetch(`/api/clients/${parsed.id}/motorcycles`)
            .then(res => {
              if (res.ok) return res.json();
              throw new Error('Failed to fetch assigned tricycles');
            })
            .then(data => {
              setClientMotorcycles(data);
            })
            .catch(err => console.error(err));
        } else {
          setCurrentUser(parsed);
        }
      }
    }
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('All password fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 5) {
      setError('Password must be at least 5 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          oldPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Password updated successfully!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(data.message || 'Failed to update password.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection to auth servers failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="text-slate-500 dark:text-slate-400 text-sm animate-pulse">
        Loading profile credentials...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <h2 className="text-lg md:text-xl font-bold tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
        <User className="w-5 h-5 text-violet-500" />
        <span>Profile & Account Security</span>
      </h2>

      <div className="space-y-8">
        {/* Profile Card Info */}
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-violet-500" />
              <span>{currentUser.role === 'Client' ? 'Client Profile Details' : currentUser.role === 'Manager' ? 'Manager Profile Details' : 'Officer Profile Details'}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {currentUser.role === 'Client' ? 'Your client profile registered on the system' : currentUser.role === 'Manager' ? 'Your manager portal settings' : 'Credentials assigned by System Administrator'}
            </p>
          </div>

          {currentUser.role === 'Client' && (
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-955/40 rounded-xl border border-slate-200/60 dark:border-slate-850">
              {currentUser.passport_url ? (
                <img
                  src={currentUser.passport_url}
                  alt="Client Passport"
                  className="w-20 h-20 rounded-xl object-cover border border-violet-500/20 shadow-sm"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-slate-250 dark:bg-slate-800 flex items-center justify-center text-slate-500 border border-slate-300 dark:border-slate-800/80 shadow-inner">
                  <User className="w-8 h-8" />
                </div>
              )}
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white">{currentUser.name}</h4>
                <p className="text-xs text-slate-400">File No: {currentUser.file_no || 'N/A'}</p>
                <span className="inline-flex items-center px-2 py-0.5 mt-1.5 rounded-full text-[10px] font-bold border bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 border-indigo-500/20">
                  CLIENT PORTAL
                </span>
              </div>
            </div>
          )}

          <div className="space-y-4 text-sm">
            {currentUser.role !== 'Client' && (
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                <span className="font-semibold text-slate-550 dark:text-slate-400">
                  {currentUser.role === 'Manager' ? 'Manager Name:' : 'Full Staff Name:'}
                </span>
                <strong className="text-slate-900 dark:text-white">{currentUser.name}</strong>
              </div>
            )}
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
              <span className="font-semibold text-slate-550 dark:text-slate-400">Username:</span>
              <span className="text-slate-850 dark:text-slate-200 font-mono font-bold">{currentUser.username}</span>
            </div>
            {currentUser.role !== 'Client' && (
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                <span className="font-semibold text-slate-550 dark:text-slate-400">Access Level Role:</span>
                <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold border ${
                  currentUser.role === 'Admin' 
                    ? 'bg-violet-500/10 text-violet-605 dark:text-violet-400 border-violet-500/20' 
                    : 'bg-cyan-500/10 text-cyan-605 dark:text-cyan-400 border-cyan-500/20'
                }`}>
                  {currentUser.role.toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
              <span className="font-semibold text-slate-550 dark:text-slate-400">Contact Email:</span>
              <span className="text-slate-850 dark:text-slate-200">{currentUser.email || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
              <span className="font-semibold text-slate-550 dark:text-slate-400">Mobile Number:</span>
              <span className="text-slate-850 dark:text-slate-200">{currentUser.phone || 'N/A'}</span>
            </div>

            {currentUser.role === 'Client' && (
              <>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                  <span className="font-semibold text-slate-550 dark:text-slate-400">Office Branch:</span>
                  <span className="text-slate-850 dark:text-slate-200">{currentUser.office || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                  <span className="font-semibold text-slate-550 dark:text-slate-400">Govt ID Details:</span>
                  <span className="text-slate-850 dark:text-slate-200">{currentUser.id_details || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                  <span className="font-semibold text-slate-550 dark:text-slate-400">Residential Address:</span>
                  <span className="text-slate-850 dark:text-slate-200 text-right max-w-xs">{currentUser.residential_address || 'N/A'}</span>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-205 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-3">Bank Information</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100/50 dark:border-slate-800/30">
                      <span className="font-medium text-slate-450 dark:text-slate-400">Bank Name:</span>
                      <span className="text-slate-850 dark:text-slate-200">{currentUser.bank_name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100/50 dark:border-slate-800/30">
                      <span className="font-medium text-slate-450 dark:text-slate-400">Account Name:</span>
                      <span className="text-slate-850 dark:text-slate-200">{currentUser.account_name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="font-medium text-slate-450 dark:text-slate-400">Account Number:</span>
                      <span className="text-slate-850 dark:text-slate-200">{currentUser.account_number || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-205 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-3">Assigned Tricycles ({clientMotorcycles.length})</h4>
                  {clientMotorcycles.length === 0 ? (
                    <p className="text-xs text-slate-500 py-2">No tricycles assigned to your profile yet.</p>
                  ) : (
                    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
                      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left">
                        <thead className="bg-slate-100 dark:bg-slate-900">
                          <tr>
                            <th className="px-3 py-2 font-semibold">File No</th>
                            <th className="px-3 py-2 font-semibold">Vehicle Details</th>
                            <th className="px-3 py-2 font-semibold">Chassis No</th>
                            <th className="px-3 py-2 font-semibold">Purchase Date</th>
                            <th className="px-3 py-2 font-semibold">Asset Value</th>
                            <th className="px-3 py-2 font-semibold">Utility Charges</th>
                            <th className="px-3 py-2 font-semibold">Term</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                          {clientMotorcycles.map((mc) => (
                            <tr key={mc.id} className="hover:bg-slate-55 dark:hover:bg-slate-850/50">
                              <td className="px-3 py-2 whitespace-nowrap">{mc.file_no || 'N/A'}</td>
                              <td className="px-3 py-2 whitespace-nowrap">{mc.vehicle_type_chassis || 'N/A'}</td>
                              <td className="px-3 py-2 whitespace-nowrap font-mono">{mc.chassis_no || 'N/A'}</td>
                              <td className="px-3 py-2 whitespace-nowrap">{mc.date_of_purchase || 'N/A'}</td>
                              <td className="px-3 py-2 whitespace-nowrap font-bold">₦{parseFloat(mc.total_disbursed_amount || 0).toLocaleString()}</td>
                              <td className="px-3 py-2 whitespace-nowrap font-bold text-cyan-600 dark:text-cyan-450">₦{parseFloat(mc.utility_charges || 0).toLocaleString()}</td>
                              <td className="px-3 py-2 whitespace-nowrap">{mc.duration_of_completion || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Change Password Form */}
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-sm max-w-xl">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-rose-500" />
              <span>Change Account Password</span>
            </h3>
            <p className="text-xs text-slate-505 dark:text-slate-400 mt-1">Ensure your password is strong and kept confidential</p>
          </div>

          {error && (
            <div className="bg-rose-505/10 border border-rose-505/20 text-rose-600 dark:text-rose-450 p-4 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-505/20 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Current Password</label>
              <div className="relative flex items-center">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
                <input
                  type="password"
                  placeholder="Enter current password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-850 rounded-xl pl-11 pr-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">New Password</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-350 dark:border-slate-850 rounded-xl pl-11 pr-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Confirm New Password</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
                <input
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-350 dark:border-slate-850 rounded-xl pl-11 pr-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-2.5 rounded-xl transition-all shadow-lg shadow-violet-500/10 text-sm active:scale-[0.99]"
            >
              {loading ? 'Updating Password...' : 'Update Password Credentials'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
