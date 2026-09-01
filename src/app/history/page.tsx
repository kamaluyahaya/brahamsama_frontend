'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Building2, MapPin, Users, Award, Shield, CheckCircle2, TrendingUp, Compass } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HistoryPage() {
  return (
    <div style={{ background: '#020617', color: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* HEADER / NAVIGATION */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50, padding: '16px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/welcome" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#fbbf24', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
            <ArrowLeft size={18} /> Back to Welcome Page
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/logo.jpeg" alt="BS Logo" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }} />
            <span style={{ fontWeight: 900, color: '#ffffff', fontSize: 16 }}>Braham Sama Nig Ltd</span>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section style={{ padding: '80px 24px 60px', background: 'radial-gradient(ellipse at top, rgba(245,158,11,0.15), transparent 70%)', textAlign: 'center' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24', padding: '6px 16px', borderRadius: 99, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 20 }}>
            <Compass size={14} /> Our History & Journey
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, color: '#ffffff', lineHeight: 1.15, marginBottom: 20 }}>
            From One Office to a Growing <span style={{ background: 'linear-gradient(to right, #fbbf24, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Nationwide Company</span>
          </h1>
          <p style={{ fontSize: 18, color: '#94a3b8', lineHeight: 1.8, maxWidth: 780, margin: '0 auto' }}>
            The story of BRAHAM SAMA NIG. LTD — built on trust, accountability, professionalism, and sustainable transportation business management.
          </p>
        </div>
      </section>

      {/* JOURNEY HIGHLIGHTS */}
      <section style={{ padding: '40px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h3 style={{ textAlign: 'center', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, color: '#fbbf24', marginBottom: 24 }}>OUR JOURNEY IN BRIEF</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            {[
              'One Office', 'Professional Management', 'Trust & Accountability', 'Asset Expansion',
              'Shared Ownership', 'Structured Investment', 'Kano & Nationwide Expansion', 'Professional Workforce', 'Growing Transportation Network'
            ].map((step, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 16px', fontSize: 13, color: '#e2e8f0', fontWeight: 600 }}>
                <CheckCircle2 size={14} style={{ color: '#f59e0b' }} /> {step}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MAIN HISTORY CONTENT */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 840, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 36, fontSize: 16, lineHeight: 1.8, color: '#cbd5e1' }}>
          
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', marginBottom: 16 }}>The Humble Beginnings</h2>
            <p style={{ marginBottom: 16 }}>
              <strong>BRAHAM SAMA NIG. LTD</strong> is a Nigerian transportation management and investment company built on the principles of <strong>trust, accountability, professionalism, and sustainable business management</strong>.
            </p>
            <p>
              The company began its journey approximately five years ago with a simple but ambitious vision: <em>to create a reliable and professionally managed platform through which individuals could participate in the transportation business while their assets and investments were properly managed.</em>
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', marginBottom: 16 }}>Early Growth in Kaduna</h2>
            <p style={{ marginBottom: 16 }}>
              In its early years, the company operated from a single office in <strong>Kaduna</strong>, focusing primarily on transportation asset management and the structured deployment of commercial tricycles and other transportation assets. With a strong emphasis on accountability, proper supervision, driver management, maintenance, daily remittance, and protection of owners' assets, the company gradually built a reputation among its clients and business partners.
            </p>
            <p>
              As confidence in the company's management system grew, so did its operations.
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', marginBottom: 16 }}>Innovation: Shared Ownership & Balance Bases</h2>
            <p style={{ marginBottom: 16 }}>
              Recognising the increasing cost of vehicles and commercial tricycles in Nigeria, the company expanded beyond conventional transportation management to develop more accessible opportunities for individuals who desired to participate in the transportation business but could not afford to purchase a complete asset. This led to the development of structured <strong>shared-ownership and transportation investment arrangements</strong>, enabling individuals to participate according to their financial capacity.
            </p>
            <p>
              A major part of this growth has been the development of the company's <strong>Balance Bases transportation management system</strong>. The model provides a structured relationship between asset owners, the company, and operators, allowing transportation assets to be professionally deployed and supervised while maintaining clear responsibilities and accountability.
            </p>
          </div>

          <div style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 20, padding: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', marginBottom: 16 }}>Workforce & Operator Network</h2>
            <p style={{ marginBottom: 16 }}>
              Today, the company's workforce and operational structure include the <strong>Chief Executive Officer (CEO), Director-General of Operations, Managers, Accountants, Administrative and Secretarial personnel, Maintenance Officers, Compliance Officers, Utility Officers, Legal Practitioners, operational officers, and other supporting personnel</strong>.
            </p>
            <p>
              The company has also developed a substantial network of commercial operators, with <strong>more than 200 active riders</strong> currently operating within its transportation system and <strong>over 300 additional riders awaiting deployment</strong>, reflecting the growing demand for the company's transportation management services.
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', marginBottom: 16 }}>Expansion to Kano & Corporate Head Office</h2>
            <p style={{ marginBottom: 16 }}>
              From its original base in Kaduna, BRAHAM SAMA NIG. LTD has expanded its operations beyond its initial location, extending its reach to <strong>Kano and other parts of Nigeria</strong>.
            </p>
            <p style={{ marginBottom: 20 }}>
              As part of its continued growth, the company has established a new and more structured corporate office at:
            </p>
            <div style={{ background: '#090d16', border: '1px solid #1e293b', padding: 20, borderRadius: 16, color: '#fbbf24', fontWeight: 700, lineHeight: 1.6 }}>
              <MapPin size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
              Suite 3, Zavati Mall, Katuru Road, Unguwan Sarki, Opposite Silversand Hotel, Kaduna, Nigeria.
            </div>
          </div>

          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <h3 style={{ fontSize: 22, fontWeight: 900, color: '#ffffff', marginBottom: 12 }}>Our journey began with one office. Our vision is much bigger.</h3>
            <p style={{ color: '#94a3b8', fontSize: 16, marginBottom: 28 }}>
              BRAHAM SAMA NIG. LTD — Connecting Transportation, Ownership and Opportunity.
            </p>
            <Link href="/welcome#contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#f59e0b', color: '#1a0a00', fontWeight: 800, padding: '14px 28px', borderRadius: 12, textDecoration: 'none', fontSize: 15 }}>
              Get In Touch With Us
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: 32, textAlign: 'center', color: '#64748b', fontSize: 13 }}>
        <p>© {new Date().getFullYear()} Braham Sama Nig Ltd. All rights reserved.</p>
      </footer>
    </div>
  );
}
