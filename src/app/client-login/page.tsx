'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, User, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import '../globals.css';

export default function ClientLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load theme and configure page
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const defaultTheme = savedTheme || 'light';
    if (defaultTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.role !== 'Client') {
          setError('Staff members must sign in through the Operations Center.');
          return;
        }
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify(data));
        router.push('/');
      } else {
        setError(data.message || 'Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection center unreachable. Verify connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-955 dark:text-slate-105 flex flex-col justify-center items-center p-4 relative overflow-hidden transition-colors duration-300 font-sans">

      {/* Decorative Blur Spheres for Premium Glassmorphic Contrast */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-blue-600/10 dark:bg-blue-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-cyan-600/10 dark:bg-cyan-600/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/85 p-8 rounded-2xl shadow-2xl relative space-y-8 backdrop-blur-xl transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-800">

        {/* Header Branding */}
        <div className="text-center space-y-3">
          <img
            src="/logo.jpeg"
            alt="Braham Sama Logo"
            className="w-16 h-16 rounded-xl object-cover dark:border-slate-800 mb-1 mx-auto"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-blue-400 bg-clip-text text-transparent">
            Client Portal
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-1">
            Fleet Returns & Assets Access
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 p-4 rounded-xl text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-widest">Portal Username</label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-slate-450 dark:text-slate-500 absolute left-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Enter client username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-slate-100/50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-800/50 focus:border-blue-800 text-sm transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-widest">Password</label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-450 dark:text-slate-500 absolute left-4 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter portal password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-100/50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-800 rounded-xl pl-11 pr-11 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-800/50 focus:border-blue-800 text-sm transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-800 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-800/10 text-sm active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : 'Sign In To Portal'}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 text-center">
          <Link
            href="/login"
            className="text-xs text-blue-700 dark:text-blue-400 hover:underline inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Are you a staff member? Sign in here</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
