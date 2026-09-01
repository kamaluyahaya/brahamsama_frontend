'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Award, Shield, CheckCircle2, Star, Users, Building2, TrendingUp, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CeoAchievementsPage() {
  const achievements = [
    { num: '01', title: 'Establishment and Growth of the Company', desc: "Successful establishment and continuous development of BRAHAM SAMA NIG. LTD over the past five years. Beginning with a single office in Kaduna, the company has progressively expanded its operations, workforce, transportation assets, and geographical reach." },
    { num: '02', title: 'Development of a Structured Transportation Management System', desc: "Pioneered and strengthened a structured transportation management approach providing greater accountability between asset owners, management, and riders/operators with daily supervision, remittance monitoring, maintenance, compliance, tracking, and documentation." },
    { num: '03', title: 'Introduction and Development of the Balance Bases Model', desc: "Designed the Balance Bases transportation management model providing a structured framework for managing transportation assets while balancing the interests and responsibilities of asset owners, management company, and operators." },
    { num: '04', title: 'Creation of Accessible Transportation Ownership Opportunities', desc: "Developed shared-ownership and structured participation opportunities allowing individuals with different levels of financial capacity to participate in commercial tricycle and vehicle transportation assets." },
    { num: '05', title: 'Expansion into Vehicle Acquisition, Importation and Sales', desc: "Expanded company activities beyond management to include vehicle sourcing, acquisition, importation, sales, and commercial deployment to serve individual, corporate, and investor clients." },
    { num: '06', title: 'Expansion Beyond Kaduna', desc: "Successfully guided company expansion to Kano and other parts of Nigeria, establishing a broader national network and opening the new corporate office at Suite 3, Zavati Mall, Katuru Road, Unguwan Sarki, Kaduna." },
    { num: '07', title: 'Building a Large and Diverse Workforce', desc: "Overseen the development of a structured workforce including the CEO, Director-General of Operations, Managers, Accountants, Administrative & Secretarial personnel, Maintenance, Compliance, Utility Officers, and Legal Practitioners." },
    { num: '08', title: 'Development of a Large Rider Network', desc: "Built a substantial operational rider network comprising more than 200 active riders, with over 300 additional riders awaiting deployment across the system." },
    { num: '09', title: 'Strengthening Trust and Accountability', desc: "Established a culture of trust, accountability, and responsible management through proper documentation, monitoring, financial accountability, and clear operational responsibilities." },
    { num: '10', title: 'Emphasis on Asset Protection and Maintenance', desc: "Incorporated GPS tracking, routine maintenance, technical inspections, repairs coordination, driver supervision, and compliance monitoring to preserve asset value and productivity." },
    { num: '11', title: 'Creating a Professional Management Structure', desc: "Transformed the company into a department-driven organisation with defined roles in Operations, Accounts, Administration, Maintenance, Compliance, Utility, Legal, and Management." },
    { num: '12', title: 'Building a Foundation for Nationwide Expansion', desc: "Laid the foundation for nationwide growth encompassing management, vehicle acquisition, shared ownership, investment participation, fleet management, and operational expansion." },
    { num: '13', title: 'Promoting Entrepreneurship and Economic Participation', desc: "Created structured alternatives enabling individuals to participate in transportation entrepreneurship and asset ownership regardless of starting capital." },
  ];

  return (
    <div style={{ background: '#020617', color: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* HEADER */}
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
            <Award size={14} /> Executive Leadership & Vision
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 900, color: '#ffffff', lineHeight: 1.15, marginBottom: 20 }}>
            Achievements of the <span style={{ background: 'linear-gradient(to right, #fbbf24, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Chief Executive Officer</span>
          </h1>
          <p style={{ fontSize: 18, color: '#94a3b8', lineHeight: 1.8, maxWidth: 800, margin: '0 auto' }}>
            Building a Sustainable Transportation Management Organisation rooted in trust, accountability, professionalism, and sustainable growth.
          </p>
        </div>
      </section>

      {/* LEADERSHIP PHILOSOPHY */}
      <section style={{ padding: '40px 24px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, color: '#fbbf24', marginBottom: 20 }}>THE CEO'S LEADERSHIP PHILOSOPHY</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
            {['Trust', 'Accountability', 'Professionalism', 'Innovation', 'Sustainable Growth'].map((p, idx) => (
              <div key={idx} style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 14, padding: '12px 24px', color: '#fbbf24', fontWeight: 800, fontSize: 15 }}>
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ACHIEVEMENTS LIST */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {achievements.map((item, idx) => (
              <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 32, transition: 'transform 0.3s', position: 'relative' }}>
                <div style={{ display: 'inline-flex', padding: '6px 14px', background: 'rgba(196,168,76,0.15)', color: '#f59e0b', borderRadius: 12, fontWeight: 900, fontSize: 13, marginBottom: 18, border: '1px solid rgba(196,168,76,0.3)' }}>
                  {item.num}
                </div>
                <h3 style={{ fontSize: 19, fontWeight: 800, color: '#ffffff', marginBottom: 14, lineHeight: 1.3 }}>
                  {item.title}
                </h3>
                <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.7 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* LEADERSHIP LEGACY */}
          <div style={{ marginTop: 60, background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(245,158,11,0.02))', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 24, padding: 40 }}>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: '#ffffff', marginBottom: 16 }}>The CEO's Leadership Legacy</h2>
            <p style={{ color: '#cbd5e1', fontSize: 16, lineHeight: 1.8, marginBottom: 20 }}>
              The achievements of the CEO extend beyond the physical growth of the company. They are reflected in the <strong>systems established, people employed, assets managed, opportunities created, and trust built with clients and business partners</strong>.
            </p>
            <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.8 }}>
              From the company's beginnings with a single office in Kaduna to its expanding operations, professional workforce, growing rider network, shared-ownership initiatives, vehicle acquisition and sales activities, and presence beyond Kaduna, the CEO has demonstrated a commitment to building a transportation organisation capable of adapting to Nigeria's changing economic and transportation environment.
            </p>
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
