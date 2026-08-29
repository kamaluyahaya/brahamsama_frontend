'use client';

import React from 'react';
import { X, Printer, Download, FileSpreadsheet } from 'lucide-react';
import ModalPortal from '@/components/ModalPortal';

interface ReportField {
  label: string;
  value: any;
}

interface ReportTable {
  title: string;
  headers: string[];
  rows: any[][];
}

interface ReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  recordData: ReportField[];
  tables?: ReportTable[];
  passportUrl?: string;
}

// Helper: get field value by label
function getField(recordData: ReportField[], label: string): string {
  const item = recordData.find(f => f.label.toLowerCase() === label.toLowerCase());
  if (!item || item.value === null || item.value === undefined || item.value === '') return 'N/A';
  return String(item.value);
}

export default function ReportPreviewModal({
  isOpen,
  onClose,
  title,
  recordData,
  tables,
  passportUrl,
}: ReportPreviewModalProps) {
  if (!isOpen) return null;

  const today = new Date();
  const todayStr = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const clientName = getField(recordData, 'Client Name');
  const fileNo = getField(recordData, 'File Number');
  const officeBranch = getField(recordData, 'Office Branch');
  const phone = getField(recordData, 'Phone Number');
  const email = getField(recordData, 'Email Address');
  const address = getField(recordData, 'Home Address');
  const govId = getField(recordData, 'Government ID Details');
  const bankName = getField(recordData, 'Bank Name');
  const accountName = getField(recordData, 'Account Name');
  const accountNumber = getField(recordData, 'Account Number');
  const vehicleChassis = getField(recordData, 'Vehicle Type / Chassis');
  const noOfMotorcycles = getField(recordData, 'No of Motorcycles');
  const tempoNo = getField(recordData, 'Tempo Registration No');
  const totalDisbursed = getField(recordData, 'Total Disbursed Amount');
  const receiptNo = getField(recordData, 'Receipt Number');
  const contractTerm = getField(recordData, 'Contract Term');
  const dateOfPurchase = getField(recordData, 'Date of Purchase');
  const firstDisb = getField(recordData, 'First Disbursement Date');
  const finalDisb = getField(recordData, 'Final Disbursement Date');
  const reportRef = `CPR-${fileNo !== 'N/A' ? fileNo : today.getFullYear()}`;

  // ── Export CSV ────────────────────────────────────────────────────────────
  const handleExportExcel = () => {
    let csv = '\uFEFF';
    csv += `"BRAHAM SAMA OPERATIONS & MANAGEMENT SYSTEM"\n`;
    csv += `"RC No: 7121543 | Kano State Branch"\n`;
    csv += `"CEO: Braham Sama"\n`;
    csv += `"Report: ${title.toUpperCase()}"\n`;
    csv += `"Generated on: ${todayStr}"\n\n"RECORD METADATA"\n`;
    recordData.forEach(item => {
      const l = item.label.replace(/"/g, '""');
      const v = String(item.value === null || item.value === undefined ? 'N/A' : item.value).replace(/"/g, '""');
      csv += `"${l}","${v}"\n`;
    });
    if (tables && tables.length > 0) {
      tables.forEach(t => {
        csv += `\n"${t.title.toUpperCase()}"\n`;
        csv += t.headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',') + '\n';
        t.rows.forEach(r => { csv += r.map(c => `"${String(c ?? 'N/A').replace(/"/g, '""')}"`).join(',') + '\n'; });
      });
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `client_profile_${fileNo}_${today.toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const isVoucher = title.toUpperCase().includes('VOUCHER') || title.toUpperCase().includes('EXPENSE') || title.toUpperCase().includes('RETURN') || title.toUpperCase().includes('LEDGER') || title.toUpperCase().includes('FINANCIAL');

  // ── Build Print HTML ──────────────────────────────────────────────────────
  const buildPrintHTML = (autoTrigger: boolean): string => {
    if (isVoucher) {
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>${title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',sans-serif;background:#fff;padding:40px;color:#1a2332;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .voucher-card{border:2px solid #1a2332;border-radius:12px;padding:30px;max-width:600px;margin:40px auto;background:#fff;position:relative}
    .header{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #1a2332;padding-bottom:15px;margin-bottom:20px}
    .logo-badge{font-weight:900;font-size:16px;color:#fff;background:#1a2332;padding:6px 12px;border-radius:6px}
    .co-title{font-size:20px;font-weight:800;text-transform:uppercase}
    .co-sub{font-size:8px;font-weight:700;letter-spacing:1px;color:#c9a84c;margin-top:2px}
    .title{font-size:13px;font-weight:900;text-align:center;text-transform:uppercase;letter-spacing:1.5px;color:#c9a84c;margin-bottom:25px}
    .row{display:flex;justify-content:space-between;border-bottom:1px dashed #e2e8f0;padding:10px 0;font-size:11px}
    .row:last-of-type{border-bottom:2px solid #1a2332;margin-bottom:20px}
    .label{color:#64748b;font-weight:600}
    .value{color:#0f172a;font-weight:800;text-align:right}
    .amount-box{background:#f8fafc;border:1px solid #cbd5e1;padding:12px;border-radius:8px;text-align:center;margin-bottom:30px}
    .amount-lbl{font-size:8px;font-weight:700;text-transform:uppercase;color:#64748b;margin-bottom:4px}
    .amount-val{font-size:20px;font-weight:900;color:#e11d48}
    .sigs{display:flex;justify-content:space-between;margin-top:40px}
    .sig-box{text-align:center;width:180px}
    .sig-line{border-top:1px solid #94a3b8;padding-top:6px;font-size:9px;font-weight:700;text-transform:uppercase;color:#64748b}
    .table-section{margin-top:25px}
    .table-title{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#c9a84c;margin-bottom:8px;border-bottom:1px solid #e8e4d8;padding-bottom:5px}
    table{width:100%;border-collapse:collapse}
    th{background:#f5f3ee;color:#6b7b8d;font-size:9px;font-weight:700;text-transform:uppercase;padding:8px 12px;border-bottom:2px solid #e8e4d8;text-align:left}
    td{padding:8px 12px;font-size:11px;border-bottom:1px solid #f0ede3;color:#2c3e50}
  </style>
</head>
<body>
  <div class="voucher-card">
    <div class="header">
      <div>
        <div class="co-title">Braham Sama</div>
        <div class="co-sub">Operations &amp; Management System</div>
      </div>
      <div class="logo-badge">BS</div>
    </div>
    <div class="title">${title}</div>
    ${recordData.map(f => {
      if (f.label.toLowerCase().includes('amount') || f.label.toLowerCase().includes('balance')) return '';
      return `
      <div class="row">
        <span class="label">${f.label}</span>
        <span class="value">${f.value || 'N/A'}</span>
      </div>`;
    }).join('')}
    
    ${(() => {
      const amtField = recordData.find(f => f.label.toLowerCase().includes('amount') || f.label.toLowerCase().includes('balance'));
      if (amtField) {
        return `
        <div class="amount-box">
          <div class="amount-lbl">${amtField.label}</div>
          <div class="amount-val">${amtField.value}</div>
        </div>`;
      }
      return '';
    })()}

    ${tables ? tables.map(t => `
      <div class="table-section">
        <h3 class="table-title">${t.title}</h3>
        <table>
          <thead><tr>${t.headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
          <tbody>${t.rows.map(r => `<tr>${r.map(c => `<td>${c ?? 'N/A'}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
      </div>`).join('') : ''}

    <div class="sigs">
      <div class="sig-box"><div class="sig-line">Prepared / Logged By</div></div>
      <div class="sig-box"><div class="sig-line">Authorized Signatory</div></div>
    </div>
  </div>
  ${autoTrigger ? `<script>window.addEventListener('load',function(){setTimeout(function(){window.print();},500);})</script>` : ''}
</body>
</html>`;
    }

    const tablesHtml = tables
      ? tables.map(t => `
        <div class="table-section">
          <h3 class="table-title">${t.title}</h3>
          <table>
            <thead><tr>${t.headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
            <tbody>${t.rows.map(r => `<tr>${r.map(c => `<td>${c ?? 'N/A'}</td>`).join('')}</tr>`).join('')}</tbody>
          </table>
        </div>`).join('')
      : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Client Profile Report – ${clientName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',sans-serif;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .page{width:794px;min-height:1123px;margin:0 auto;background:#fff;display:flex;flex-direction:column}
    .header{background:#1a2332;color:#fff;padding:20px 30px;display:flex;align-items:center;justify-content:space-between}
    .logo-badge{width:48px;height:48px;border:2px solid #c9a84c;border-radius:7px;overflow:hidden;background:#fff;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:900;color:#1a2332}
    .logo-badge img{width:100%;height:100%;object-fit:cover}
    .hdr-left{display:flex;align-items:center;gap:14px}
    .co-name{font-size:20px;font-weight:800;color:#fff;letter-spacing:-0.5px}
    .co-sub{font-size:8px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:#c9a84c;margin-top:3px}
    .hdr-right{text-align:right;font-size:10px;color:#8fa3b8;line-height:2}
    .hdr-right strong{color:#fff;font-weight:700}
    .body{flex:1;padding:24px 30px}
    .rpt-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
    .rpt-title{font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:2.5px;color:#1a2332;border-left:4px solid #c9a84c;padding-left:10px}
    .badge{background:#e8f5e9;color:#2e7d32;border:1px solid #a5d6a7;border-radius:20px;padding:4px 14px;font-size:9px;font-weight:700;display:flex;align-items:center;gap:5px}
    .dot{width:6px;height:6px;background:#43a047;border-radius:50%;display:inline-block}
    .profile-grid{display:flex;gap:20px;background:#fafaf8;border:1px solid #e8e4d8;border-radius:8px;padding:18px}
    .prof-left{width:150px;flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:8px;border-right:1px solid #e5e0d0;padding-right:18px}
    .passport{width:138px;height:155px;object-fit:cover;border-radius:6px;border:1px solid #d1cbb8}
    .prof-name{font-size:13px;font-weight:800;color:#1a2332;text-align:center;line-height:1.3}
    .prof-meta{font-size:10px;color:#6b7b8d;text-align:center}
    .prof-branch label{font-size:8px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#9ea8b2;margin-top:6px;display:block}
    .prof-branch span{font-size:11px;font-weight:700;color:#1a2332}
    .prof-right{flex:1;display:flex;flex-direction:column;gap:16px}
    .sec-hdr{display:flex;align-items:center;gap:7px;margin-bottom:8px}
    .sec-num{background:#f0ede3;width:17px;height:17px;border-radius:3px;display:inline-flex;align-items:center;justify-content:center;font-size:8px;font-weight:900;color:#1a2332}
    .sec-lbl{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#c9a84c}
    .row{display:flex;justify-content:space-between;border-bottom:1px dashed #e0ddd4;padding:4px 0;font-size:10px}
    .row:last-child{border-bottom:none}
    .rk{color:#6b7b8d;font-weight:500}
    .rv{color:#1a2332;font-weight:700;text-align:right}
    .sum-bar{background:#1a2332;display:flex;margin-top:16px}
    .sum-item{flex:1;padding:14px 16px;border-right:1px solid #2d3f52}
    .sum-item:last-child{border-right:none}
    .sum-lbl{font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:#8fa3b8;margin-bottom:5px}
    .sum-val{font-weight:800;color:#fff;font-size:12px}
    .sum-val.gold{color:#c9a84c;font-size:16px;letter-spacing:-0.5px}
    .sec-bar{display:flex;border:1px solid #e8e4d8;border-top:none}
    .sec-item{flex:1;padding:10px 16px;border-right:1px solid #e8e4d8}
    .sec-item:last-child{border-right:none}
    .sec-slbl{font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ea8b2;margin-bottom:3px}
    .sec-sval{font-size:10px;font-weight:700;color:#1a2332}
    .sec-sval.gold{color:#c9a84c}
    .stamp-area{display:flex;justify-content:flex-end;padding:14px 0 8px}
    .stamp{width:66px;height:66px;border:2px dashed #c9a84c;border-radius:50%;display:flex;align-items:center;justify-content:center;text-align:center;font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#c9a84c;line-height:1.4}
    .sigs{display:flex;justify-content:space-between;padding-bottom:12px}
    .sig-box{text-align:center;width:190px}
    .sig-line{border-top:1px solid #aab4be;padding-top:6px;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#6b7b8d}
    .footer{background:#1a2332;color:#8fa3b8;display:flex;justify-content:space-between;padding:9px 30px;font-size:8px;font-weight:600;letter-spacing:0.5px}
    .table-section{margin-top:20px}
    .table-title{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#c9a84c;margin-bottom:8px;border-bottom:1px solid #e8e4d8;padding-bottom:5px}
    table{width:100%;border-collapse:collapse}
    th{background:#f5f3ee;color:#6b7b8d;font-size:9px;font-weight:700;text-transform:uppercase;padding:8px 12px;border-bottom:2px solid #e8e4d8;text-align:left}
    td{padding:8px 12px;font-size:11px;border-bottom:1px solid #f0ede3;color:#2c3e50}
    @page{size:A4;margin:0}
    @media print{body{margin:0}.page{width:100%;min-height:100vh}}
  </style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="hdr-left">
      <div class="logo-badge"><img src="/logo.jpeg" alt="BS" onerror="this.parentElement.innerHTML='BS'"/></div>
      <div><div class="co-name">Braham Sama</div><div class="co-sub">Operations &amp; Management System</div></div>
    </div>
    <div class="hdr-right">
      <div>RC number <strong>7121543</strong></div>
      <div>Branch <strong>Kano State branch</strong></div>
      <div>CEO <strong>Braham Sama</strong></div>
      <div>Generated <strong>${todayStr}</strong></div>
    </div>
  </div>
  <div class="body">
    <div class="rpt-hdr">
      <div class="rpt-title">Client Profile Report</div>
      <div class="badge"><span class="dot"></span> Active contract</div>
    </div>
    <div class="profile-grid">
      <div class="prof-left">
        ${passportUrl ? `<img src="${passportUrl}" class="passport" onerror="this.style.display='none'" alt="${clientName}"/>` : `<div style="width:138px;height:155px;background:#e8e4d8;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:36px">👤</div>`}
        <div class="prof-name">${clientName}</div>
        <div class="prof-meta">File No. ${fileNo}</div>
        <div class="prof-branch"><label>Office branch</label><span>${officeBranch}</span></div>
      </div>
      <div class="prof-right">
        <div>
          <div class="sec-hdr"><span class="sec-num">01</span><span class="sec-lbl">Identity &amp; Contact</span></div>
          <div class="row"><span class="rk">Phone number</span><span class="rv">${phone}</span></div>
          <div class="row"><span class="rk">Email address</span><span class="rv">${email}</span></div>
          <div class="row"><span class="rk">Home address</span><span class="rv">${address}</span></div>
          <div class="row"><span class="rk">Government ID</span><span class="rv">${govId}</span></div>
        </div>
        <div>
          <div class="sec-hdr"><span class="sec-num">02</span><span class="sec-lbl">Bank Details</span></div>
          <div class="row"><span class="rk">Bank name</span><span class="rv">${bankName}</span></div>
          <div class="row"><span class="rk">Account name</span><span class="rv">${accountName}</span></div>
          <div class="row"><span class="rk">Account number</span><span class="rv">${accountNumber}</span></div>
        </div>
        <div>
          <div class="sec-hdr"><span class="sec-num">03</span><span class="sec-lbl">Asset on Record</span></div>
          <div class="row"><span class="rk">Vehicle type / chassis</span><span class="rv">${vehicleChassis}</span></div>
          <div class="row"><span class="rk">No. of motorcycles</span><span class="rv">${noOfMotorcycles}</span></div>
          <div class="row"><span class="rk">Tempo registration no.</span><span class="rv">${tempoNo}</span></div>
        </div>
      </div>
    </div>
    <div class="sum-bar">
      <div class="sum-item"><div class="sum-lbl">Total Disbursed</div><div class="sum-val gold">${totalDisbursed}</div></div>
      <div class="sum-item"><div class="sum-lbl">Receipt Number</div><div class="sum-val">${receiptNo}</div></div>
      <div class="sum-item"><div class="sum-lbl">Contract Term</div><div class="sum-val">${contractTerm}</div></div>
      <div class="sum-item"><div class="sum-lbl">Date of Purchase</div><div class="sum-val">${dateOfPurchase}</div></div>
    </div>
    <div class="sec-bar">
      <div class="sec-item"><div class="sec-slbl">First Disbursement</div><div class="sec-sval">${firstDisb}</div></div>
      <div class="sec-item"><div class="sec-slbl">Final Disbursement</div><div class="sec-sval">${finalDisb}</div></div>
      <div class="sec-item"><div class="sec-slbl">File Status</div><div class="sec-sval gold">Active — on schedule</div></div>
      <div class="sec-item"><div class="sec-slbl">Report Reference</div><div class="sec-sval">${reportRef}</div></div>
    </div>
    ${tablesHtml}
    <div class="stamp-area"><div class="stamp">CEO<br/>STAMP</div></div>
    <div class="sigs">
      <div class="sig-box"><div class="sig-line">Officer Signature</div></div>
      <div class="sig-box"><div class="sig-line">CEO Signature &amp; Stamp</div></div>
    </div>
  </div>
  <div class="footer">
    <span>Braham Sama — Operations &amp; management system</span>
    <span>Confidential client record</span>
  </div>
</div>
${autoTrigger ? `<script>window.addEventListener('load',function(){setTimeout(function(){window.print();},600);})</script>` : ''}
</body>
</html>`;
  };

  const openPrintWindow = (auto: boolean) => {
    const w = window.open('', '_blank');
    if (!w) { alert('Please allow pop-ups to print or download reports.'); return; }
    w.document.open(); w.document.write(buildPrintHTML(auto)); w.document.close();
  };

  // ── IN-APP PREVIEW ────────────────────────────────────────────────────────
  const NA = '#1a2332';
  const GOLD = '#c9a84c';
  const NAVY = '#1a2332';

  const FieldRow = ({ label, value }: { label: string; value: string }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e0ddd4', padding: '4px 0', fontSize: '10px' }}>
      <span style={{ color: '#6b7b8d', fontWeight: 500 }}>{label}</span>
      <span style={{ color: NA, fontWeight: 700 }}>{value}</span>
    </div>
  );

  const SectionHead = ({ num, label }: { num: string; label: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '8px' }}>
      <span style={{ background: '#f0ede3', width: '17px', height: '17px', borderRadius: '3px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 900, color: NAVY }}>{num}</span>
      <span style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '2px', color: GOLD }}>{label}</span>
    </div>
  );

  return (
    <ModalPortal>
      <div 
        className="fixed inset-0 bg-slate-955/70 backdrop-blur-md z-[10000] flex items-center justify-center p-4 overflow-y-auto scrollbar-none"
        onClick={onClose}
      >
        <div 
          className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden flex flex-col my-8 max-h-[94vh]"
          onClick={(e) => e.stopPropagation()}
        >

          {/* Toolbar */}
          <div className="bg-slate-950 border-b border-slate-800 px-5 py-3.5 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <h3 className="font-extrabold text-xs uppercase tracking-widest text-slate-200">{title} Preview</h3>
            </div>
            <div className="flex items-center gap-2">
              <button id="report-export-excel-btn" onClick={handleExportExcel} className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 active:scale-95">
                <FileSpreadsheet className="w-3.5 h-3.5" /><span>Export CSV</span>
              </button>
              <button id="report-pdf-btn" onClick={() => openPrintWindow(true)} className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 active:scale-95">
                <Download className="w-3.5 h-3.5" /><span>Download PDF</span>
              </button>
              <button id="report-print-btn" onClick={() => openPrintWindow(false)} className="bg-slate-700 hover:bg-slate-620 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 active:scale-95">
                <Printer className="w-3.5 h-3.5" /><span>Print</span>
              </button>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Paper Preview */}
          <div className="flex-1 overflow-y-auto bg-slate-950 p-6 flex justify-center scrollbar-none">
            <div style={{ fontFamily: "'Inter', sans-serif", background: '#fff', width: '100%', maxWidth: '680px', display: 'flex', flexDirection: 'column', minHeight: '850px', boxShadow: '0 25px 60px rgba(0,0,0,0.5)', borderRadius: '4px', overflow: 'hidden' }}>
              
              {isVoucher ? (
                /* ── VOUCHER PREVIEW LAYOUT ── */
                <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', flex: 1, minHeight: '770px' }}>
                  <div>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #1a2332', paddingBottom: '15px', marginBottom: '20px' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '20px', color: '#1a2332', textTransform: 'uppercase' }}>Braham Sama</div>
                        <div style={{ fontWeight: 700, fontSize: '8px', letterSpacing: '1px', color: '#c9a84c', marginTop: '2px' }}>Operations &amp; Management System</div>
                      </div>
                      <div style={{ fontWeight: 950, fontSize: '15px', color: '#fff', background: '#1a2332', padding: '6px 12px', borderRadius: '6px' }}>BS</div>
                    </div>

                    <div style={{ fontSize: '13px', fontWeight: 900, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#c9a84c', marginBottom: '25px' }}>
                      {title}
                    </div>

                    {/* Fields */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {recordData.map((f, i) => {
                        if (f.label.toLowerCase().includes('amount') || f.label.toLowerCase().includes('balance')) return null;
                        return (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', padding: '10px 0', fontSize: '11px' }}>
                            <span style={{ color: '#64748b', fontWeight: 600 }}>{f.label}</span>
                            <span style={{ color: '#0f172a', fontWeight: 800 }}>{String(f.value || 'N/A')}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Amount Box */}
                    {(() => {
                      const amtField = recordData.find(f => f.label.toLowerCase().includes('amount') || f.label.toLowerCase().includes('balance'));
                      if (amtField) {
                        return (
                          <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '16px', borderRadius: '8px', textAlign: 'center', marginTop: '25px', marginBottom: '20px' }}>
                            <div style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: '4px' }}>{amtField.label}</div>
                            <div style={{ fontSize: '22px', fontWeight: 900, color: '#e11d48' }}>{String(amtField.value)}</div>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Optional tables (like ledger summary report tables) */}
                    {tables && tables.length > 0 && tables.map((t, idx) => (
                      <div key={idx} style={{ marginTop: '25px' }}>
                        <h4 style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', color: GOLD, marginBottom: '8px', borderBottom: '1px solid #e8e4d8', paddingBottom: '5px' }}>{t.title}</h4>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr>
                              {t.headers.map((h, i) => (
                                <th key={i} style={{ background: '#f5f3ee', color: '#6b7b8d', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', padding: '8px 12px', borderBottom: '2px solid #e8e4d8', textAlign: 'left' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {t.rows.map((row, rIdx) => (
                              <tr key={rIdx}>
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} style={{ padding: '8px 12px', fontSize: '11px', borderBottom: '1px solid #f0ede3', color: '#2c3e50' }}>{cell ?? 'N/A'}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>

                  {/* Signatures */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '60px', paddingBottom: '20px' }}>
                    <div style={{ textAlign: 'center', width: '180px' }}>
                      <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '6px', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Prepared / Logged By</div>
                    </div>
                    <div style={{ textAlign: 'center', width: '180px' }}>
                      <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '6px', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Authorized Signatory</div>
                    </div>
                  </div>
                </div>
              ) : (
                /* ── CLIENT PROFILE PREVIEW LAYOUT ── */
                <>
                  {/* ── HEADER ── */}
                  <div style={{ background: NAVY, color: '#fff', padding: '18px 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '46px', height: '46px', border: `2px solid ${GOLD}`, borderRadius: '7px', overflow: 'hidden', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '15px', color: NAVY, flexShrink: 0 }}>
                        <img src="/logo.jpeg" alt="BS" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.5px', color: '#fff', lineHeight: 1.1 }}>Braham Sama</div>
                        <div style={{ fontWeight: 600, fontSize: '8px', letterSpacing: '2.5px', textTransform: 'uppercase', color: GOLD, marginTop: '3px' }}>Operations &amp; Management System</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '10px', color: '#8fa3b8', lineHeight: '1.9' }}>
                      <div>RC number <strong style={{ color: '#fff' }}>7121543</strong></div>
                      <div>Branch <strong style={{ color: '#fff' }}>Kano State branch</strong></div>
                      <div>CEO <strong style={{ color: '#fff' }}>Braham Sama</strong></div>
                      <div>Generated <strong style={{ color: '#fff' }}>{todayStr}</strong></div>
                    </div>
                  </div>

                  {/* ── BODY ── */}
                  <div style={{ flex: 1, padding: '22px 26px' }}>

                    {/* Title + Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                      <div style={{ fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', color: NAVY, borderLeft: `4px solid ${GOLD}`, paddingLeft: '10px' }}>
                        Client Profile Report
                      </div>
                      <div style={{ background: '#e8f5e9', color: '#2e7d32', border: '1px solid #a5d6a7', borderRadius: '20px', padding: '3px 12px', fontSize: '9px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ width: '6px', height: '6px', background: '#43a047', borderRadius: '50%', display: 'inline-block' }} />
                        Active contract
                      </div>
                    </div>

                    {/* Profile Card */}
                    <div style={{ display: 'flex', gap: '20px', background: '#fafaf8', border: '1px solid #e8e4d8', borderRadius: '8px', padding: '16px' }}>
                      {/* Left */}
                      <div style={{ width: '140px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', borderRight: '1px solid #e5e0d0', paddingRight: '16px' }}>
                        {passportUrl ? (
                          <img src={passportUrl} alt={clientName} style={{ width: '130px', height: '148px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #d1cbb8' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        ) : (
                          <div style={{ width: '130px', height: '148px', background: '#e8e4d8', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', color: '#9e9888' }}>👤</div>
                        )}
                        <div style={{ fontWeight: 800, fontSize: '13px', color: NAVY, textAlign: 'center', lineHeight: 1.3 }}>{clientName}</div>
                        <div style={{ fontSize: '10px', color: '#6b7b8d', textAlign: 'center' }}>File No. {fileNo}</div>
                        <div style={{ width: '100%', marginTop: '4px' }}>
                          <div style={{ fontSize: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: '#9ea8b2' }}>Office branch</div>
                          <div style={{ fontWeight: 700, fontSize: '11px', color: NAVY }}>{officeBranch}</div>
                        </div>
                      </div>

                      {/* Right: sections */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                          <SectionHead num="01" label="Identity &amp; Contact" />
                          <FieldRow label="Phone number" value={phone} />
                          <FieldRow label="Email address" value={email} />
                          <FieldRow label="Home address" value={address} />
                          <FieldRow label="Government ID" value={govId} />
                        </div>
                        <div>
                          <SectionHead num="02" label="Bank Details" />
                          <FieldRow label="Bank name" value={bankName} />
                          <FieldRow label="Account name" value={accountName} />
                          <FieldRow label="Account number" value={accountNumber} />
                        </div>
                        <div>
                          <SectionHead num="03" label="Asset on Record" />
                          <FieldRow label="Vehicle type / chassis" value={vehicleChassis} />
                          <FieldRow label="No. of motorcycles" value={noOfMotorcycles} />
                          <FieldRow label="Tempo registration no." value={tempoNo} />
                        </div>
                      </div>
                    </div>

                    {/* Dark summary bar */}
                    <div style={{ background: NAVY, display: 'flex', marginTop: '16px' }}>
                      {[
                        { lbl: 'Total Disbursed', val: totalDisbursed, gold: true },
                        { lbl: 'Receipt Number', val: receiptNo, gold: false },
                        { lbl: 'Contract Term', val: contractTerm, gold: false },
                        { lbl: 'Date of Purchase', val: dateOfPurchase, gold: false },
                      ].map((item, i) => (
                        <div key={i} style={{ flex: 1, padding: '14px 16px', borderRight: i < 3 ? '1px solid #2d3f52' : 'none' }}>
                          <div style={{ fontSize: '7px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#8fa3b8', marginBottom: '5px' }}>{item.lbl}</div>
                          <div style={{ fontWeight: 800, fontSize: item.gold ? '15px' : '12px', color: item.gold ? GOLD : '#fff', letterSpacing: item.gold ? '-0.5px' : 0 }}>{item.val}</div>
                        </div>
                      ))}
                    </div>

                    {/* Light secondary bar */}
                    <div style={{ display: 'flex', border: '1px solid #e8e4d8', borderTop: 'none' }}>
                      {[
                        { lbl: 'First Disbursement', val: firstDisb, gold: false },
                        { lbl: 'Final Disbursement', val: finalDisb, gold: false },
                        { lbl: 'File Status', val: 'Active — on schedule', gold: true },
                        { lbl: 'Report Reference', val: reportRef, gold: false },
                      ].map((item, i) => (
                        <div key={i} style={{ flex: 1, padding: '10px 16px', borderRight: i < 3 ? '1px solid #e8e4d8' : 'none' }}>
                          <div style={{ fontSize: '7px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#9ea8b2', marginBottom: '3px' }}>{item.lbl}</div>
                          <div style={{ fontWeight: 700, fontSize: '10px', color: item.gold ? GOLD : NAVY }}>{item.val}</div>
                        </div>
                      ))}
                    </div>

                    {/* CEO Stamp */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '14px 0 8px' }}>
                      <div style={{ width: '62px', height: '62px', border: `2px dashed ${GOLD}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: '7px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: GOLD, lineHeight: 1.4 }}>
                        CEO<br />STAMP
                      </div>
                    </div>

                    {/* Signatures */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px' }}>
                      <div style={{ textAlign: 'center', width: '180px' }}>
                        <div style={{ borderTop: '1px solid #aab4be', paddingTop: '6px', fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#6b7b8d' }}>Officer Signature</div>
                      </div>
                      <div style={{ textAlign: 'center', width: '180px' }}>
                        <div style={{ borderTop: '1px solid #aab4be', paddingTop: '6px', fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#6b7b8d' }}>CEO Signature &amp; Stamp</div>
                      </div>
                    </div>
                  </div>

                  {/* FOOTER */}
                  <div style={{ background: NAVY, color: '#8fa3b8', display: 'flex', justifyContent: 'space-between', padding: '9px 26px', fontSize: '8px', fontWeight: 600, letterSpacing: '0.5px' }}>
                    <span>Braham Sama — Operations &amp; management system</span>
                    <span>Confidential client record</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
