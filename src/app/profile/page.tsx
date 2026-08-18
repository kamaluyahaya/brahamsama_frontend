'use client';

import React, { useState, useEffect } from 'react';
import { User, Lock, KeyRound, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  
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
        setCurrentUser(JSON.parse(storedUser));
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
      <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
        <User className="w-5 h-5 text-violet-500" />
        <span>Profile & Account Security</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Card Info */}
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-violet-500" />
              <span>Officer Profile Details</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Credentials assigned by System Administrator</p>
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
              <span className="font-semibold text-slate-550 dark:text-slate-400">Full Staff Name:</span>
              <strong className="text-slate-900 dark:text-white">{currentUser.name}</strong>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
              <span className="font-semibold text-slate-550 dark:text-slate-400">Username:</span>
              <span className="text-slate-850 dark:text-slate-200 font-mono font-bold">{currentUser.username}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
              <span className="font-semibold text-slate-550 dark:text-slate-400">Access Level Role:</span>
              <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold border ${currentUser.role === 'Admin' 
                ? 'bg-violet-500/10 text-violet-605 dark:text-violet-400 border-violet-500/20' 
                : 'bg-cyan-500/10 text-cyan-605 dark:text-cyan-400 border-cyan-500/20'}`}>
                {currentUser.role.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
              <span className="font-semibold text-slate-550 dark:text-slate-400">Contact Email:</span>
              <span className="text-slate-850 dark:text-slate-200">{currentUser.email || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-semibold text-slate-550 dark:text-slate-400">Mobile Number:</span>
              <span className="text-slate-850 dark:text-slate-200">{currentUser.phone || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-sm">
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
