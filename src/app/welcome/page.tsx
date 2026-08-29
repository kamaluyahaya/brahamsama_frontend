'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft, ChevronRight, Menu, X, ArrowRight, Phone, Mail,
  MapPin, Bike, Users, TrendingUp, Shield, Star, CheckCircle,
  Award, Clock, Handshake, Building2, Facebook, Twitter,
  Instagram, Linkedin, ChevronDown
} from 'lucide-react';

/* ─────────────────────────── DATA ─────────────────────────── */

const SLIDES = [
  {
    bg: 'from-slate-900 via-blue-950 to-slate-900',
    badge: 'Empowering Riders Across Kaduna State',
    title: 'Your Trusted\nMotorcycle Finance\nPartner',
    sub: 'We provide accessible motorcycle financing solutions to riders, enabling livelihoods and building lasting financial success across Northern Nigeria.',
    cta: 'Get Started Today',
    img: '🏍️',
  },
  {
    bg: 'from-amber-900 via-orange-950 to-slate-900',
    badge: 'Transparent & Reliable Operations',
    title: 'Empowering\nCommunities Through\nFleet Management',
    sub: 'From disbursements to returns, our system ensures every rider and partner is tracked with full accountability and precision.',
    cta: 'Learn About Us',
    img: '🤝',
  },
  {
    bg: 'from-emerald-900 via-teal-950 to-slate-900',
    badge: 'Proven Track Record Since 2019',
    title: 'Thousands of\nRiders. One System.\nUnlimited Growth.',
    sub: 'Our operations and management platform connects clients, riders, MD leaders and branches in one seamless ecosystem.',
    cta: 'View Our Services',
    img: '📈',
  },
];

const SERVICES = [
  { icon: <Bike className="w-8 h-8" />, title: 'Motorcycle Financing', desc: 'Flexible hire-purchase agreements enabling riders to own motorcycles while paying in affordable installments over agreed contract terms.' },
  { icon: <Users className="w-8 h-8" />, title: 'Client Management', desc: 'Complete lifecycle management for all clients — from onboarding and KYC verification to disbursement tracking and contract completion.' },
  { icon: <TrendingUp className="w-8 h-8" />, title: 'Financial Reporting', desc: 'Real-time financial dashboards, ledgers and voucher generation covering all inflows, outflows and branch-level performance summaries.' },
  { icon: <Shield className="w-8 h-8" />, title: 'Compliance & Risk', desc: 'Robust compliance monitoring with query logs, action tracking, and automated alerts to safeguard company assets and reduce default risk.' },
  { icon: <Building2 className="w-8 h-8" />, title: 'Branch Operations', desc: 'Multi-branch management allowing each office to manage its own fleet, clients and financial records under one centralized system.' },
  { icon: <Handshake className="w-8 h-8" />, title: 'MD Leader Network', desc: 'A structured MD Leader program connecting grassroots motorcycle managers to clients, enabling wider reach and efficient collection.' },
];

const TEAM = [
  { name: 'Braham Sama', role: 'Chief Executive Officer', emoji: '👔', desc: "Visionary leader driving Braham Sama's mission to empower Kaduna State motorcycle riders through accessible finance." },
  { name: 'Operations Director', role: 'Head of Operations', emoji: '⚙️', desc: 'Overseeing day-to-day branch operations, ensuring excellence in client service and fleet management across all offices.' },
  { name: 'Finance Officer', role: 'Chief Finance Officer', emoji: '💼', desc: 'Managing the financial health of the organization through disciplined bookkeeping, reporting and strategic planning.' },
  { name: 'Compliance Lead', role: 'Compliance & Risk Manager', emoji: '🛡️', desc: 'Ensuring all operations adhere to internal policies and regulatory frameworks to protect company interests.' },
];

const STATS = [
  { value: '5+', label: 'Years in Operation', icon: <Clock className="w-7 h-7" /> },
  { value: '500+', label: 'Active Clients Served', icon: <Users className="w-7 h-7" /> },
  { value: '₦50M+', label: 'Total Disbursed', icon: <TrendingUp className="w-7 h-7" /> },
  { value: '3', label: 'Branch Offices', icon: <Building2 className="w-7 h-7" /> },
  { value: '1000+', label: 'Motorcycles Financed', icon: <Bike className="w-7 h-7" /> },
  { value: '98%', label: 'Client Satisfaction', icon: <Star className="w-7 h-7" /> },
];

const STORIES = [
  { name: 'Musa Garba', location: 'Kaduna North', quote: 'Braham Sama changed my life. I now own my motorcycle and my income has tripled since joining their program.', stars: 5, role: 'Motorcycle Rider' },
  { name: 'Aisha Mohammed', location: 'Kaduna Central', quote: 'The process was simple and the team was very supportive. I completed my contract on time and my business is growing.', stars: 5, role: 'Fleet Operator' },
  { name: 'Ibrahim Yusuf', location: 'Kaduna South', quote: 'Professional service and transparent processes. Braham Sama truly cares about empowering riders like me.', stars: 5, role: 'MD Leader' },
];

const NAV_LINKS = ['Services', 'About', 'Team', 'Success Stories', 'Contact'];

/* ─────────────────────────── COMPONENT ─────────────────────────── */

export default function WelcomePage() {
  const [current, setCurrent] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });

    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach(el => observer.observe(el));

    return () => {
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, []);

  const slideTo = (idx: number) => {
    if (animating || idx === current) return;
    setAnimating(true);
    setCurrent(idx);
    setTimeout(() => setAnimating(false), 700);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const slideNext = () => slideTo((current + 1) % SLIDES.length);
  const slidePrev = () => slideTo((current - 1 + SLIDES.length) % SLIDES.length);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % SLIDES.length);
    }, 5500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) {
      const offsetTop = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  };

  const slide = SLIDES[current];

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif", background: 'var(--w-bg-base)', color: 'var(--w-text-primary)' }}>
      {mounted && <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        /* ── LIGHT MODE TOKENS ── */
        :root {
          --w-bg-base:       #f8fafc;
          --w-bg-section1:   #f1f5f9;
          --w-bg-section2:   #e8eef5;
          --w-bg-card:       rgba(255,255,255,0.9);
          --w-bg-card-hover: #fff;
          --w-bg-input:      #f1f5f9;
          --w-border:        rgba(203,213,225,0.7);
          --w-border-hover:  rgba(196,168,76,0.4);
          --w-text-primary:  #0f172a;
          --w-text-secondary:#475569;
          --w-text-muted:    #64748b;
          --w-nav-bg:        rgba(248,250,252,0.97);
          --w-nav-border:    rgba(203,213,225,0.7);
          --w-hero-bg:       linear-gradient(135deg,#e2e8f0 0%,#dbeafe 50%,#e2e8f0 100%);
          --w-hero-overlay:  radial-gradient(ellipse at 70% 50%,rgba(196,168,76,0.08) 0%,transparent 60%);
          --w-card-bg:       linear-gradient(160deg,#fff,#f8fafc);
          --w-stats-bg:      #f1f5f9;
          --w-scrollbar-track: #e2e8f0;
          --w-badge-bg:      rgba(196,168,76,0.12);
          --w-badge-border:  rgba(196,168,76,0.3);
          --w-icon-bg:       rgba(196,168,76,0.12);
          --w-mobile-bg:     rgba(248,250,252,0.99);
          --w-footer-bg:     #1e293b;
          --w-footer-text:   #94a3b8;
        }

        /* ── DARK MODE TOKENS ── */
        html.dark {
          --w-bg-base:       #020617;
          --w-bg-section1:   #0a0f1e;
          --w-bg-section2:   #0f172a;
          --w-bg-card:       rgba(30,41,59,0.55);
          --w-bg-card-hover: rgba(30,41,59,0.85);
          --w-bg-input:      #0f172a;
          --w-border:        rgba(51,65,85,0.5);
          --w-border-hover:  rgba(196,168,76,0.35);
          --w-text-primary:  #f1f5f9;
          --w-text-secondary:#94a3b8;
          --w-text-muted:    #64748b;
          --w-nav-bg:        rgba(2,6,23,0.97);
          --w-nav-border:    rgba(51,65,85,0.5);
          --w-hero-bg:       linear-gradient(135deg,#0f172a 0%,#0c1a2e 50%,#0f172a 100%);
          --w-hero-overlay:  radial-gradient(ellipse at 70% 50%,rgba(196,168,76,0.06) 0%,transparent 60%);
          --w-card-bg:       linear-gradient(160deg,#1e293b,#0f172a);
          --w-stats-bg:      #0f172a;
          --w-scrollbar-track: #0f172a;
          --w-badge-bg:      rgba(196,168,76,0.1);
          --w-badge-border:  rgba(196,168,76,0.2);
          --w-icon-bg:       rgba(196,168,76,0.1);
          --w-mobile-bg:     rgba(2,6,23,0.98);
          --w-footer-bg:     #020617;
          --w-footer-text:   #334155;
        }

        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .desktop-only { display: none !important; }
        }
        @media (min-width: 769px) {
          .mobile-only { display: none !important; }
        }
        html { scroll-behavior: smooth; }
        .hero-text { transition: opacity 0.6s ease, transform 0.6s ease; }
        .service-card:hover .s-icon { transform: scale(1.15) rotate(-5deg); }
        .s-icon { transition: transform 0.3s ease; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
        .float { animation: float 4s ease-in-out infinite; }
        @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(196,168,76,0.25)} 50%{box-shadow:0 0 40px rgba(196,168,76,0.55)} }
        .gold-glow { animation: glow 3s ease-in-out infinite; }
        .grad { background: linear-gradient(135deg,#c9a84c,#f5d07a,#c9a84c); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-track{background:var(--w-scrollbar-track)}
        ::-webkit-scrollbar-thumb{background:#c9a84c;border-radius:3px}

        /* Scroll Animation CSS */
        .reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal.active {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>}

      {/* NAVBAR */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, transition: 'all 0.4s', background: scrolled ? 'var(--w-nav-bg)' : 'transparent', backdropFilter: scrolled ? 'blur(20px)' : 'none', borderBottom: scrolled ? '1px solid var(--w-nav-border)' : 'none' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '14px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="gold-glow" style={{ width: 42, height: 42, borderRadius: 12, overflow: 'hidden', border: '2px solid rgba(196,168,76,0.6)', flexShrink: 0 }}>
              <img src="/logo.jpeg" alt="BS" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as any).parentElement.innerHTML = '<div style="width:100%;height:100%;background:#1a2332;display:flex;align-items:center;justify-content:center;font-weight:900;color:#c9a84c;font-size:14px">BS</div>'; }} />
            </div>
            <div>
              <div style={{ fontWeight: 900, color: scrolled ? 'var(--w-text-primary)' : '#ffffff', fontSize: 18, letterSpacing: -0.5 }}>Braham Sama</div>
              <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#c9a84c', marginTop: 1 }}>Operations & Management</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 28, alignItems: 'center' }} className="hidden-mobile">
            {NAV_LINKS.map(l => (
              <button key={l} onClick={() => scrollTo(l.toLowerCase().replace(/\s+/g, '-'))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: scrolled ? 'var(--w-text-secondary)' : '#ffffff', fontWeight: 600, fontSize: 14, padding: 0, transition: 'color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.color = '#f59e0b')} onMouseLeave={e => (e.currentTarget.style.color = scrolled ? 'var(--w-text-secondary)' : '#ffffff')}>
                {l}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div className="desktop-only">
              <Link href="/login" style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f59e0b', color: '#1a2332', fontWeight: 800, fontSize: 13, padding: '10px 20px', borderRadius: 12, textDecoration: 'none', transition: 'all 0.2s' }}>
                Staff Login <ArrowRight size={15} />
              </Link>
            </div>
            <button className="mobile-only" onClick={() => setMobileOpen(!mobileOpen)} style={{ background: 'var(--w-bg-card)', border: '1px solid var(--w-border)', color: 'var(--w-text-primary)', padding: 8, borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="mobile-only" style={{ background: 'var(--w-mobile-bg)', padding: '16px 24px 24px', borderTop: '1px solid var(--w-border)' }}>
            {NAV_LINKS.map(l => (
              <button key={l} onClick={() => scrollTo(l.toLowerCase().replace(/\s+/g, '-'))} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', borderBottom: '1px solid var(--w-border)', color: 'var(--w-text-primary)', fontWeight: 600, fontSize: 15, padding: '14px 0', cursor: 'pointer' }}>
                {l}
              </button>
            ))}
            <Link href="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#f59e0b', color: '#1a2332', fontWeight: 800, fontSize: 14, padding: '12px 20px', borderRadius: 12, textDecoration: 'none', marginTop: 16 }}>
              Staff Login <ArrowRight size={15} />
            </Link>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundImage: 'url("/background.png")', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', overflow: 'hidden', paddingTop: 80 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(2, 6, 23, 0.7)' }} />
        <div style={{ position: 'absolute', top: '20%', right: '15%', width: 400, height: 400, background: 'rgba(59,130,246,0.05)', borderRadius: '50%', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '20%', left: '10%', width: 300, height: 300, background: 'rgba(196,168,76,0.04)', borderRadius: '50%', filter: 'blur(50px)' }} />

        <div style={{ position: 'relative', zIndex: 10, maxWidth: 1280, margin: '0 auto', padding: '60px 40px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={() => scrollTo('services')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f59e0b', color: '#1a2332', fontWeight: 800, fontSize: 16, padding: '16px 36px', borderRadius: 14, border: 'none', cursor: 'pointer', boxShadow: '0 10px 40px rgba(245,158,11,0.3)', transition: 'all 0.2s' }}>
              Our Services <ArrowRight size={18} />
            </button>
            <button onClick={() => scrollTo('about')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.08)', color: '#ffffff', fontWeight: 700, fontSize: 16, padding: '16px 36px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', transition: 'all 0.2s', backdropFilter: 'blur(10px)' }}>
              Learn More <ChevronDown size={18} />
            </button>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: 0.6 }}>
          <span style={{ fontSize: 10, color: '#94a3b8', letterSpacing: 4, textTransform: 'uppercase' }}>Scroll</span>
          <ChevronDown size={18} style={{ color: '#f59e0b', animation: 'bounce 1.5s infinite' }} />
        </div>
      </section>

      {/* STATS STRIP */}
      <section style={{ background: 'var(--w-stats-bg)', borderTop: '1px solid var(--w-border)', borderBottom: '1px solid var(--w-border)', padding: '48px 40px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 32 }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', padding: 12, background: 'var(--w-icon-bg)', color: '#f59e0b', borderRadius: 14, marginBottom: 12 }}>{s.icon}</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--w-text-primary)', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--w-text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>


      {/* ABOUT */}
      <section id="about" className="reveal" style={{ padding: '96px 40px', background: 'var(--w-bg-base)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', gap: 64, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 380px' }}>
            <div style={{ background: 'var(--w-card-bg)', border: '1px solid var(--w-border)', borderRadius: 24, padding: 40, boxShadow: '0 25px 60px rgba(0,0,0,0.12)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 20, right: 20, width: 80, height: 80, background: 'rgba(196,168,76,0.08)', borderRadius: '50%', filter: 'blur(20px)' }} />
              <div className="float" style={{ fontSize: 90, textAlign: 'center', marginBottom: 24 }}>🏢</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[['Founded', '2019'], ['Headquarters', 'Kaduna State'], ['RC Number', '7121543'], ['Branches', '3 Offices']].map(([l, v]) => (
                  <div key={l} style={{ background: 'var(--w-bg-card)', border: '1px solid var(--w-border)', borderRadius: 14, padding: '14px 16px' }}>
                    <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--w-text-muted)', marginBottom: 4 }}>{l}</div>
                    <div style={{ fontWeight: 800, color: 'var(--w-text-primary)', fontSize: 14 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ flex: '1 1 420px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--w-badge-bg)', border: '1px solid var(--w-badge-border)', color: '#fbbf24', fontSize: 11, fontWeight: 700, padding: '6px 14px', borderRadius: 99, marginBottom: 20, textTransform: 'uppercase', letterSpacing: 2 }}>
              <Award size={14} /> About Braham Sama
            </div>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 900, color: 'var(--w-text-primary)', lineHeight: 1.1, marginBottom: 24 }}>
              Building Financial <br /><span className="grad">Futures for Riders</span>
            </h2>
            <p style={{ color: 'var(--w-text-secondary)', fontSize: 17, lineHeight: 1.8, marginBottom: 20 }}>
              Braham Sama Operations & Management System was established to bridge the financial gap for motorcycle riders in Kaduna State. We provide affordable hire-purchase financing that empowers riders to own their vehicles and grow their livelihoods.
            </p>
            <p style={{ color: 'var(--w-text-muted)', lineHeight: 1.8, marginBottom: 28 }}>
              With a robust digital management platform, we track every client, disbursement, return, and branch operation in real-time — ensuring transparency, accountability and growth for all stakeholders.
            </p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['100% transparent operations', 'Flexible contract terms tailored to riders', 'Multi-branch nationwide coverage', 'Dedicated client support teams'].map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--w-text-primary)', fontWeight: 500 }}>
                  <CheckCircle size={18} style={{ color: '#34d399', flexShrink: 0 }} /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="reveal" style={{ padding: '96px 40px', background: 'var(--w-bg-section1)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--w-badge-bg)', border: '1px solid var(--w-badge-border)', color: '#fbbf24', fontSize: 11, fontWeight: 700, padding: '6px 16px', borderRadius: 99, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 2 }}>
              What We Offer
            </div>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 900, color: 'var(--w-text-primary)', marginBottom: 14 }}>Our <span className="grad">Services</span></h2>
            <p style={{ color: 'var(--w-text-muted)', fontSize: 17, maxWidth: 520, margin: '0 auto' }}>Comprehensive motorcycle finance and fleet management services designed to empower communities.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {SERVICES.map((s, i) => (
              <div key={i} className="service-card" style={{ background: 'var(--w-bg-card)', border: '1px solid var(--w-border)', borderRadius: 20, padding: '28px', transition: 'all 0.3s', cursor: 'default' }} onMouseEnter={e => { (e.currentTarget as any).style.border = '1px solid var(--w-border-hover)'; (e.currentTarget as any).style.transform = 'translateY(-4px)'; (e.currentTarget as any).style.boxShadow = '0 20px 50px rgba(0,0,0,0.15)'; }} onMouseLeave={e => { (e.currentTarget as any).style.border = '1px solid var(--w-border)'; (e.currentTarget as any).style.transform = 'translateY(0)'; (e.currentTarget as any).style.boxShadow = 'none'; }}>
                <div className="s-icon" style={{ display: 'inline-flex', padding: 14, background: 'var(--w-icon-bg)', color: '#f59e0b', borderRadius: 16, marginBottom: 18 }}>{s.icon}</div>
                <h3 style={{ fontWeight: 800, color: 'var(--w-text-primary)', fontSize: 17, marginBottom: 10 }}>{s.title}</h3>
                <p style={{ color: 'var(--w-text-muted)', fontSize: 14, lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SUCCESS STORIES */}
      <section id="success-stories" className="reveal" style={{ padding: '96px 40px', background: 'var(--w-bg-base)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--w-badge-bg)', border: '1px solid var(--w-badge-border)', color: '#fbbf24', fontSize: 11, fontWeight: 700, padding: '6px 16px', borderRadius: 99, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 2 }}>
              <Star size={12} /> Testimonials
            </div>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 900, color: 'var(--w-text-primary)', marginBottom: 14 }}>Success <span className="grad">Stories</span></h2>
            <p style={{ color: 'var(--w-text-muted)', fontSize: 17, maxWidth: 520, margin: '0 auto' }}>Real stories from riders and partners whose lives have been transformed through our programs.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {STORIES.map((s, i) => (
              <div key={i} style={{ background: 'var(--w-card-bg)', border: '1px solid var(--w-border)', borderRadius: 20, padding: 28, transition: 'all 0.3s' }} onMouseEnter={e => { (e.currentTarget as any).style.border = '1px solid var(--w-border-hover)'; (e.currentTarget as any).style.transform = 'translateY(-4px)'; }} onMouseLeave={e => { (e.currentTarget as any).style.border = '1px solid var(--w-border)'; (e.currentTarget as any).style.transform = 'translateY(0)'; }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 18 }}>
                  {Array.from({ length: s.stars }).map((_, si) => <Star key={si} size={16} style={{ fill: '#f59e0b', color: '#f59e0b' }} />)}
                </div>
                <p style={{ color: 'var(--w-text-secondary)', fontSize: 15, lineHeight: 1.8, marginBottom: 24, fontStyle: 'italic' }}>"{s.quote}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid var(--w-border)', paddingTop: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(196,168,76,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#f59e0b', fontSize: 18 }}>{s.name.charAt(0)}</div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--w-text-primary)', fontSize: 14 }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--w-text-muted)' }}>{s.role} · {s.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section id="team" className="reveal" style={{ padding: '96px 40px', background: 'var(--w-bg-section1)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--w-badge-bg)', border: '1px solid var(--w-badge-border)', color: '#fbbf24', fontSize: 11, fontWeight: 700, padding: '6px 16px', borderRadius: 99, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 2 }}>
              <Users size={12} /> Our People
            </div>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 900, color: 'var(--w-text-primary)', marginBottom: 14 }}>Meet the <span className="grad">Team</span></h2>
            <p style={{ color: 'var(--w-text-muted)', fontSize: 17, maxWidth: 520, margin: '0 auto' }}>Dedicated professionals committed to empowering communities through accessible motorcycle finance.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {TEAM.map((m, i) => (
              <div key={i} style={{ background: 'var(--w-bg-card)', border: '1px solid var(--w-border)', borderRadius: 20, padding: '28px 20px', textAlign: 'center', transition: 'all 0.3s' }} onMouseEnter={e => { (e.currentTarget as any).style.border = '1px solid var(--w-border-hover)'; (e.currentTarget as any).style.transform = 'translateY(-6px)'; (e.currentTarget as any).style.boxShadow = '0 20px 50px rgba(0,0,0,0.15)'; }} onMouseLeave={e => { (e.currentTarget as any).style.border = '1px solid var(--w-border)'; (e.currentTarget as any).style.transform = 'translateY(0)'; (e.currentTarget as any).style.boxShadow = 'none'; }}>
                <div style={{ width: 76, height: 76, margin: '0 auto 16px', borderRadius: 20, background: 'linear-gradient(135deg,rgba(196,168,76,0.2),rgba(196,168,76,0.05))', border: '1px solid rgba(196,168,76,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>{m.emoji}</div>
                <div style={{ fontWeight: 800, color: 'var(--w-text-primary)', fontSize: 16, marginBottom: 4 }}>{m.name}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>{m.role}</div>
                <p style={{ color: 'var(--w-text-muted)', fontSize: 13, lineHeight: 1.7 }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* YEARS OF WORK MILESTONE BANNER */}
      <section className="reveal" style={{ padding: '80px 40px', background: 'linear-gradient(135deg, #d97706, #f59e0b, #d97706)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.12) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div style={{ position: 'relative', maxWidth: 1280, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 'clamp(70px, 12vw, 130px)', fontWeight: 900, color: 'rgba(0,0,0,0.1)', lineHeight: 1, marginBottom: -24, letterSpacing: -4 }}>5+ YEARS</div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: '#1a0a00', position: 'relative', marginBottom: 16 }}>Of Trust & Excellence</h2>
          <p style={{ color: 'rgba(0,0,0,0.6)', fontSize: 17, maxWidth: 560, margin: '0 auto 40px' }}>Since 2019, Braham Sama has been transforming lives across Kaduna State through responsible motorcycle financing and unwavering commitment.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
            {['2019 — Founded in Kaduna', '2021 — Expanded to 3 Branches', '2023 — 500+ Active Clients', '2025 — ₦50M+ Disbursed'].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.12)', border: '1px solid rgba(0,0,0,0.15)', color: '#1a0a00', fontWeight: 700, fontSize: 13, padding: '10px 20px', borderRadius: 12 }}>
                <CheckCircle size={16} /> {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="reveal" style={{ padding: '96px 40px', background: 'var(--w-bg-section2)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ display: 'inline-flex', gap: 8, background: 'var(--w-badge-bg)', border: '1px solid var(--w-badge-border)', color: '#fbbf24', fontSize: 11, fontWeight: 700, padding: '6px 16px', borderRadius: 99, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 2 }}>
              Get In Touch
            </div>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 900, color: 'var(--w-text-primary)', marginBottom: 14 }}>Contact <span className="grad">Us</span></h2>
            <p style={{ color: 'var(--w-text-muted)', fontSize: 17, maxWidth: 520, margin: '0 auto' }}>Ready to get started? Reach out to our team and we'll guide you through our programs.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 48, alignItems: 'start' }}>
            {/* Info */}
            <div>
              <h3 style={{ fontWeight: 800, color: 'var(--w-text-primary)', fontSize: 22, marginBottom: 28 }}>We're here to help</h3>
              {[{ icon: <Phone size={18} />, label: 'Phone', val: '+234 803 000 0000', sub: 'Mon–Fri, 8am to 5pm' }, { icon: <Mail size={18} />, label: 'Email', val: 'info@brahamsama.com', sub: 'We reply within 24 hours' }, { icon: <MapPin size={18} />, label: 'Address', val: 'Kaduna State, Nigeria', sub: 'Head Office & 2 Branch Offices' }].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, background: 'var(--w-bg-card)', border: '1px solid var(--w-border)', borderRadius: 16, padding: 18, marginBottom: 14 }}>
                  <div style={{ padding: 10, background: 'var(--w-icon-bg)', color: '#f59e0b', borderRadius: 12, flexShrink: 0 }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--w-text-muted)', marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontWeight: 700, color: 'var(--w-text-primary)', fontSize: 14 }}>{item.val}</div>
                    <div style={{ fontSize: 12, color: 'var(--w-text-muted)', marginTop: 2 }}>{item.sub}</div>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--w-text-muted)', marginBottom: 14 }}>Follow Us</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                    <button key={i} style={{ padding: 12, background: 'var(--w-bg-card)', border: '1px solid var(--w-border)', color: 'var(--w-text-muted)', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center' }} onMouseEnter={e => { (e.currentTarget as any).style.color = '#f59e0b'; (e.currentTarget as any).style.borderColor = 'rgba(196,168,76,0.4)'; }} onMouseLeave={e => { (e.currentTarget as any).style.color = 'var(--w-text-muted)'; (e.currentTarget as any).style.borderColor = 'var(--w-border)'; }}>
                      <Icon size={18} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Form */}
            <div style={{ background: 'var(--w-bg-card)', border: '1px solid var(--w-border)', borderRadius: 20, padding: 32 }}>
              <h3 style={{ fontWeight: 800, color: 'var(--w-text-primary)', fontSize: 20, marginBottom: 24 }}>Send us a message</h3>
              <form onSubmit={e => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {['Full Name', 'Phone Number'].map(ph => (
                    <div key={ph}>
                      <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--w-text-muted)', marginBottom: 8 }}>{ph}</label>
                      <input type="text" placeholder={ph} style={{ width: '100%', background: 'var(--w-bg-input)', border: '1px solid var(--w-border)', color: 'var(--w-text-primary)', fontSize: 14, padding: '12px 14px', borderRadius: 12, outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box' }} />
                    </div>
                  ))}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--w-text-muted)', marginBottom: 8 }}>Email Address</label>
                  <input type="email" placeholder="your@email.com" style={{ width: '100%', background: 'var(--w-bg-input)', border: '1px solid var(--w-border)', color: 'var(--w-text-primary)', fontSize: 14, padding: '12px 14px', borderRadius: 12, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--w-text-muted)', marginBottom: 8 }}>Message</label>
                  <textarea rows={4} placeholder="How can we help you?" style={{ width: '100%', background: 'var(--w-bg-input)', border: '1px solid var(--w-border)', color: 'var(--w-text-primary)', fontSize: 14, padding: '12px 14px', borderRadius: 12, outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                </div>
                <button type="submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#f59e0b', color: '#1a0a00', fontWeight: 800, fontSize: 15, padding: '14px', borderRadius: 12, border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
                  Send Message <ArrowRight size={17} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* MANAGEMENT LOGIN CTA */}
      <section className="reveal" style={{ padding: '80px 40px', background: 'var(--w-bg-section1)', borderTop: '1px solid var(--w-border)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ background: 'var(--w-card-bg)', border: '1px solid rgba(196,168,76,0.2)', borderRadius: 28, padding: 60, position: 'relative', overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.1)' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at top, rgba(196,168,76,0.05) 0%, transparent 60%)' }} />
            <div className="gold-glow" style={{ display: 'inline-flex', padding: 16, background: 'var(--w-icon-bg)', color: '#f59e0b', borderRadius: 20, marginBottom: 24, position: 'relative' }}>
              <Shield size={32} />
            </div>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 900, color: 'var(--w-text-primary)', marginBottom: 14, position: 'relative' }}>Management Portal Access</h2>
            <p style={{ color: 'var(--w-text-muted)', fontSize: 16, maxWidth: 480, margin: '0 auto 36px', lineHeight: 1.75, position: 'relative' }}>
              Access the Braham Sama Operations & Management System. Login is restricted to authorized staff and registered clients only.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14, position: 'relative' }}>
              <Link href="/login" style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f59e0b', color: '#1a0a00', fontWeight: 800, fontSize: 16, padding: '14px 32px', borderRadius: 14, textDecoration: 'none', boxShadow: '0 10px 40px rgba(245,158,11,0.25)', transition: 'all 0.2s' }}>
                Staff & Management Login <ArrowRight size={18} />
              </Link>
              <Link href="/client-login" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: '1px solid var(--w-border)', color: 'var(--w-text-secondary)', fontWeight: 700, fontSize: 16, padding: '14px 32px', borderRadius: 14, textDecoration: 'none', transition: 'all 0.2s' }}>
                Client Portal Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: 'var(--w-footer-bg)', borderTop: '1px solid var(--w-border)', padding: '40px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(196,168,76,0.4)' }}>
              <img src="/logo.jpeg" alt="BS" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as any).parentElement.innerHTML = '<div style="width:100%;height:100%;background:#1a2332;display:flex;align-items:center;justify-content:center;font-weight:900;color:#c9a84c;font-size:12px">BS</div>'; }} />
            </div>
            <div>
              <div style={{ fontWeight: 900, color: '#f59e0b', fontSize: 14 }}>Braham Sama</div>
              <div style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 3, color: '#94a3b8' }}>Operations & Management</div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>
            RC No. 7121543 · Kaduna State, Nigeria · © {new Date().getFullYear()} Braham Sama. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            {NAV_LINKS.map(l => (
              <button key={l} onClick={() => scrollTo(l.toLowerCase().replace(/\s+/g, '-'))} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.color = '#f59e0b')} onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
