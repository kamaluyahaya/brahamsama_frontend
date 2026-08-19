'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Bike,
  ClipboardList,
  Briefcase,
  ShieldAlert,
  Sun,
  Moon,
  Zap,
  Calendar,
  LogOut,
  Menu,
  X,
  User,
  UserCog
} from 'lucide-react';
import './globals.css';

function PremiumLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl transition-all duration-300">
      <div className="relative flex items-center justify-center">
        {/* Outer Rotating Gradient Ring */}
        <div className="absolute w-24 h-24 rounded-full border-4 border-transparent border-t-violet-600 border-r-cyan-500 animate-spin" />

        {/* Inner Pulsing Pulse Ring */}
        <div className="absolute w-28 h-28 rounded-full bg-violet-500/10 dark:bg-violet-500/5 animate-ping duration-1000" />

        {/* Logo container */}
        <div className="relative w-16 h-16 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900 flex items-center justify-center animate-pulse">
          <img src="/logo.jpeg" alt="Braham Sama" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Status indicator */}
      <div className="mt-8 flex flex-col items-center gap-1">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-slate-200">Braham Sama</span>
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [pageLoading, setPageLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Load theme and auth from localStorage
  useEffect(() => {
    // Theme Setup
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const defaultTheme = savedTheme || 'light';
    setTheme(defaultTheme);
    if (defaultTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Auth Guard Setup
    const authStatus = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(authStatus);

    if (authStatus) {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    }

    if (!authStatus && pathname !== '/login') {
      router.push('/login');
    }
  }, [pathname]);

  // Auto-close sidebar on page navigation (mobile view)
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Page Transition Loader
  useEffect(() => {
    setPageLoading(true);
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 450); // Keep it brief and snappy
    return () => clearTimeout(timer);
  }, [pathname]);

  // Keep track of search params to highlight active subItem
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentQuery(window.location.search);
    }
  }, [pathname]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);

    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    setIsLoggedIn(false);
    setCurrentUser(null);
    setShowLogoutConfirm(false);
    router.push('/login');
  };

  interface SubItem {
    name: string;
    path: string;
  }

  interface NavItem {
    name: string;
    path: string;
    icon: React.ReactNode;
    subItems?: SubItem[];
  }

  const navItems: NavItem[] = [
    {
      name: 'Dashboard',
      path: '/',
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      name: 'Clients Admin',
      path: '/clients',
      icon: <Users className="w-5 h-5" />,
      subItems: [
        { name: 'Register New Client', path: '/clients?action=add' }
      ]
    },
    {
      name: 'Raiders Manager',
      path: '/raiders',
      icon: <Bike className="w-5 h-5" />,
      subItems: [
        { name: 'Deploy New Raider', path: '/raiders?action=add' }
      ]
    },
    {
      name: 'M/D Leaders',
      path: '/md-leaders',
      icon: <ClipboardList className="w-5 h-5" />,
      subItems: [
        { name: 'Add M/D Leader', path: '/md-leaders?action=add' }
      ]
    },
    {
      name: 'Accounts Office',
      path: '/accounts',
      icon: <Briefcase className="w-5 h-5" />,
      subItems: [
        { name: 'Log Payment / Return', path: '/accounts?tab=returns' },
        { name: 'Log Expense', path: '/accounts?tab=expenses' },
        { name: 'Generate Financial Report', path: '/accounts?tab=reports' }
      ]
    },
    {
      name: 'Compliance Logs',
      path: '/compliance',
      icon: <ShieldAlert className="w-5 h-5" />,
      subItems: [
        { name: 'Log Query / Action', path: '/compliance?action=add' }
      ]
    },
    ...(currentUser?.role === 'Admin' ? [
      {
        name: 'Staff Manager',
        path: '/staff',
        icon: <UserCog className="w-5 h-5" />
      }
    ] : []),
    {
      name: 'Profile & Settings',
      path: '/profile',
      icon: <User className="w-5 h-5" />
    }
  ];

  // Bypass Sidebar and Headers for Login view
  if (pathname === '/login') {
    return (
      <html lang="en">
        <head>
          <title>Braham Sama - Operations & Management System</title>
          <meta name="description" content="Company Operations and Fleet Management Dashboard" />
          <link rel="icon" href="/logo.jpeg" />
        </head>
        <body className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex font-sans transition-colors duration-300">
          <main className="flex-1 w-full">
            {children}
          </main>
        </body>
      </html>
    );
  }

  // Prevent flash layout before redirect triggers
  if (isLoggedIn === null) {
    return (
      <html lang="en">
        <head>
          <title>Braham Sama - Loading...</title>
          <link rel="icon" href="/logo.jpeg" />
        </head>
        <body className="min-h-screen bg-slate-50 dark:bg-slate-955 flex items-center justify-center">
          <PremiumLoader />
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <head>
        <title>Braham Sama - Operations & Management System</title>
        <meta name="description" content="Company Operations and Fleet Management Dashboard" />
        <link rel="icon" href="/logo.jpeg" />
      </head>
      <body className="h-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex font-sans transition-colors duration-300">
        {pageLoading && <PremiumLoader />}
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center space-y-4 transition-all">
              <div className="mx-auto w-12 h-12 bg-rose-500/10 dark:bg-rose-500/5 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center">
                <LogOut className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Sign Out Command Center?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">You will need to verify your credentials to log back into the operations system.</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 font-semibold py-2.5 rounded-xl text-xs transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmLogout}
                  className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-semibold py-2.5 rounded-xl text-xs transition-all shadow-md shadow-rose-500/10"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="flex w-full h-full relative">

          {/* Mobile Backdrop Overlay */}
          {isMobileOpen && (
            <div
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
            />
          )}

          {/* Sidebar */}
          <aside className={`bg-white/80 border-slate-200 dark:bg-slate-900/60 dark:border-slate-800/80 backdrop-blur-xl border-r p-6 flex flex-col h-screen transition-colors duration-300 fixed inset-y-0 left-0 transform md:translate-x-0 md:sticky transition-transform duration-300 ease-in-out w-72 md:w-72 ${isMobileOpen ? 'translate-x-0 z-50 shadow-2xl' : '-translate-x-full'
            }`}>
            <div className="mb-8 flex justify-between items-center">
              <div>
                <div className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-violet-400 bg-clip-text text-transparent flex items-center gap-2.5">
                  <img src="/logo.jpeg" alt="Braham Sama Logo" className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-800/80 shadow-sm" />
                  <span>Braham Sama</span>
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-1">Company Operations</div>
              </div>

              {/* Sidebar Mobile Close Toggle */}
              <button
                onClick={() => setIsMobileOpen(false)}
                className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-2 flex-grow overflow-y-auto pr-1">
              {navItems.map((item) => {
                const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path + '/'));
                const showSubItems = isActive || (item.subItems && item.subItems.some(sub => pathname === sub.path.split('?')[0]));
                return (
                  <div key={item.path} className="flex flex-col gap-1">
                    <Link
                      href={item.path}
                      className={`flex items-center gap-4 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 border ${isActive
                        ? 'bg-violet-600/10 dark:bg-violet-600/20 border-violet-500/40 text-violet-600 dark:text-white shadow-lg'
                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 hover:border-slate-200 dark:hover:bg-slate-800/50 dark:hover:border-slate-800 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.name}</span>
                    </Link>

                    {item.subItems && showSubItems && (
                      <div className="pl-6 pr-2 py-1 flex flex-col gap-1.5 border-l-2 border-violet-500/30 dark:border-slate-800 ml-6 mt-0.5 mb-2">
                        {item.subItems.map((sub) => {
                          const isSubActive = (pathname === sub.path.split('?')[0] &&
                            (sub.path.includes('?')
                              ? currentQuery.includes(sub.path.split('?')[1])
                              : true)) || (sub.path === '/clients?action=add' && pathname === '/clients/new');
                          return (
                            <Link
                              key={sub.path}
                              href={sub.path}
                              onClick={() => {
                                setTimeout(() => {
                                  if (typeof window !== 'undefined') {
                                    setCurrentQuery(window.location.search);
                                  }
                                }, 50);
                              }}
                              className={`text-xs py-1 px-2 rounded-lg transition-all ${isSubActive
                                ? 'text-violet-600 dark:text-white font-semibold bg-violet-600/5 dark:bg-violet-600/10'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/30 font-medium'
                                }`}
                            >
                              {sub.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800/80 text-xs text-slate-400 dark:text-slate-500 space-y-4">
              {currentUser && (
                <div className="flex items-center gap-2.5 p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 rounded-xl mb-3 text-left">
                  <div className="w-8 h-8 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center font-bold text-xs text-violet-500 shrink-0">
                    {currentUser.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <div className="font-bold text-slate-700 dark:text-slate-200 truncate leading-none text-xs">{currentUser.name}</div>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1 inline-block">{currentUser.role} Account</span>
                  </div>
                </div>
              )}

              {/* Theme Switcher Button */}
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-xs border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850 transition-all active:scale-[0.98]"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-500 animate-pulse" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-violet-500" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-xs border border-transparent text-rose-500 hover:bg-rose-500/10 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out System</span>
              </button>

              <div>
                <div className="font-semibold text-slate-600 dark:text-slate-400">RC No: 7121543</div>
                <div className="mt-1">CEO: Braham Sama</div>
              </div>
            </div>
          </aside>

          {/* Main Workspace Wrapper */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Header stays completely static at the top and will never shake or lag */}
            <header className="pt-6 pb-4 px-4 md:px-8 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800/80 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shrink-0">
              <div className="flex items-start gap-2">
                {/* Mobile Menu Hamburger Toggle */}
                <button
                  onClick={() => setIsMobileOpen(true)}
                  className="md:hidden p-1 bg-transparent text-slate-700 dark:text-slate-200 transition-all active:scale-95 hover:text-slate-900 dark:hover:text-white"
                >
                  <Menu className="w-6 h-6" />
                </button>

                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Braham Sama Operations System</h1>
                  <div className="md:hidden text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
                <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 shadow-sm transition-colors flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            </header>

            {/* Scrollable main panel container */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-full">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
