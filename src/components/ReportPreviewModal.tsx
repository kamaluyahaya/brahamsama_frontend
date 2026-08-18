'use client';

import React from 'react';
import { X, Printer, FileSpreadsheet } from 'lucide-react';

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

export default function ReportPreviewModal({
  isOpen,
  onClose,
  title,
  recordData,
  tables,
  passportUrl,
}: ReportPreviewModalProps) {
  if (!isOpen) return null;

  // Format CSV content and trigger download
  const handleExportExcel = () => {
    let csvContent = '\uFEFF'; // Add BOM for Excel UTF-8 support

    // Company Header Info
    csvContent += `"BRAHAM SAMA OPERATIONS & MANAGEMENT SYSTEM"\n`;
    csvContent += `"RC No: 7121543 | Kano State Branch"\n`;
    csvContent += `"CEO: Braham Sama"\n`;
    csvContent += `"Report: ${title.toUpperCase()}"\n`;
    csvContent += `"Generated on: ${new Date().toLocaleDateString()}"\n\n`;

    // Flat Record Fields
    csvContent += `"RECORD METADATA"\n`;
    recordData.forEach(item => {
      const escapedLabel = item.label.replace(/"/g, '""');
      const escapedVal = String(item.value === null || item.value === undefined ? 'N/A' : item.value).replace(/"/g, '""');
      csvContent += `"${escapedLabel}","${escapedVal}"\n`;
    });
    csvContent += `\n`;

    // Tables
    if (tables && tables.length > 0) {
      tables.forEach(table => {
        csvContent += `"${table.title.toUpperCase()}"\n`;
        // Table Headers
        csvContent += table.headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',') + '\n';
        // Table Rows
        table.rows.forEach(row => {
          csvContent += row.map(cell => {
            const valStr = cell === null || cell === undefined ? 'N/A' : String(cell);
            return `"${valStr.replace(/"/g, '""')}"`;
          }).join(',') + '\n';
        });
        csvContent += `\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open a new window and render the high-quality print layout
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to print or download reports.');
      return;
    }

    const todayStr = new Date().toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const fieldsHtml = recordData
      .map(
        item => `
      <div class="detail-item">
        <div class="detail-label">${item.label}</div>
        <div class="detail-value">${item.value === null || item.value === undefined ? 'N/A' : item.value}</div>
      </div>`
      )
      .join('');

    const tablesHtml = tables
      ? tables
        .map(
          table => `
      <div class="table-section">
        <h3 class="table-title">${table.title}</h3>
        <table>
          <thead>
            <tr>
              ${table.headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${table.rows
              .map(
                row => `
              <tr>
                ${row.map(cell => `<td>${cell === null || cell === undefined ? 'N/A' : cell}</td>`).join('')}
              </tr>`
              )
              .join('')}
          </tbody>
        </table>
      </div>`
        )
        .join('')
      : '';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;850&display=swap');
            body {
              font-family: 'Outfit', sans-serif;
              color: #0f172a;
              background-color: #ffffff;
              margin: 0;
              padding: 40px;
              line-height: 1.5;
            }
            .letterhead {
              display: flex;
              align-items: center;
              justify-content: space-between;
              border-bottom: 4px double #8b5cf6;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo-container {
              display: flex;
              align-items: center;
              gap: 16px;
            }
            .logo {
              width: 80px;
              height: 80px;
              border-radius: 12px;
              object-fit: cover;
              border: 1px solid #cbd5e1;
            }
            .company-name {
              font-size: 26px;
              font-weight: 800;
              margin: 0;
              color: #0f172a;
              letter-spacing: -0.025em;
            }
            .company-sub {
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              color: #64748b;
              margin-top: 4px;
            }
            .meta-right {
              text-align: right;
              font-size: 12px;
              color: #475569;
              line-height: 1.6;
            }
            .meta-right strong {
              color: #0f172a;
            }
            .report-title {
              font-size: 20px;
              font-weight: 800;
              text-transform: uppercase;
              color: #0f172a;
              margin-top: 0;
              margin-bottom: 30px;
              border-left: 4px solid #8b5cf6;
              padding-left: 12px;
              letter-spacing: -0.02em;
            }
            .profile-section {
              display: flex;
              gap: 32px;
              margin-bottom: 30px;
              align-items: flex-start;
            }
            .passport-photo {
              width: 140px;
              height: 140px;
              border-radius: 14px;
              object-fit: cover;
              border: 2px solid #8b5cf6;
              box-shadow: 0 4px 10px rgba(139, 92, 246, 0.1);
            }
            .grid-details {
              flex-grow: 1;
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 14px 28px;
            }
            .detail-item {
              border-bottom: 1px solid #f1f5f9;
              padding-bottom: 6px;
              font-size: 13px;
            }
            .detail-label {
              font-weight: 600;
              color: #64748b;
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .detail-value {
              font-weight: 700;
              color: #1e293b;
              margin-top: 3px;
            }
            .table-section {
              margin-top: 35px;
            }
            .table-title {
              font-size: 13px;
              font-weight: 750;
              text-transform: uppercase;
              color: #8b5cf6;
              margin-bottom: 12px;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 6px;
              letter-spacing: 0.03em;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              text-align: left;
              margin-bottom: 25px;
            }
            th {
              background-color: #f8fafc;
              color: #475569;
              font-size: 10px;
              font-weight: 700;
              text-transform: uppercase;
              padding: 10px 14px;
              border-bottom: 2px solid #e2e8f0;
              letter-spacing: 0.025em;
            }
            td {
              padding: 10px 14px;
              font-size: 12px;
              border-bottom: 1px solid #f1f5f9;
              color: #334155;
            }
            tr:nth-child(even) td {
              background-color: rgb(248 250 252 / 0.5);
            }
            .signatures {
              margin-top: 60px;
              display: flex;
              justify-content: space-between;
              page-break-inside: avoid;
            }
            .sig-box {
              border-top: 1.5px dashed #cbd5e1;
              width: 240px;
              text-align: center;
              padding-top: 8px;
              font-size: 12px;
              color: #475569;
              font-weight: 550;
            }
            .footer {
              margin-top: 60px;
              border-top: 1px solid #e2e8f0;
              padding-top: 16px;
              display: flex;
              justify-content: space-between;
              font-size: 10px;
              color: #94a3b8;
              font-weight: 500;
              page-break-inside: avoid;
            }
            @page {
              size: A4;
              margin: 20mm;
            }
            @media print {
              body {
                padding: 20mm !important;
                margin: 0 !important;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="letterhead">
            <div class="logo-container">
              <img src="/logo.jpeg" class="logo" onerror="this.style.display='none'" />
              <div>
                <h1 class="company-name">Braham Sama</h1>
                <div class="company-sub">Operations & Management System</div>
              </div>
            </div>
            <div class="meta-right">
              <div><strong>RC Number:</strong> 7121543</div>
              <div><strong>Branch:</strong> Kano State Branch</div>
              <div><strong>CEO:</strong> Braham Sama</div>
              <div><strong>Date:</strong> ${todayStr}</div>
            </div>
          </div>
          
          <h2 class="report-title">${title}</h2>
          
          <div class="profile-section">
            ${passportUrl ? `<img src="${passportUrl}" class="passport-photo" onerror="this.style.display='none'" />` : ''}
            <div class="grid-details">
              ${fieldsHtml}
            </div>
          </div>
          
          ${tablesHtml}
          
          <div class="signatures">
            <div class="sig-box" style="margin-top: 30px;">Officer Signature / Date</div>
            <div class="sig-box" style="margin-top: 30px;">CEO Braham Sama (Sign & Stamp)</div>
          </div>
          
          <div class="footer">
            <div>Generated by Braham Sama Operations Command Center</div>
            <div>Official Operations Record</div>
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 400);
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 bg-slate-955/70 backdrop-blur-md z-[10000] flex items-center justify-center p-4 overflow-y-auto scrollbar-none">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-[0.5rem] shadow-2xl overflow-hidden flex flex-col my-8 max-h-[90vh]">
        {/* Header toolbar */}
        <div className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-violet-500 animate-pulse" />
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-200">
              Official Document Report Preview
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="bg-emerald-600 hover:bg-emerald-500 border border-emerald-500/30 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/5 active:scale-95"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>
            <button
              onClick={handlePrint}
              className="bg-violet-600 hover:bg-violet-500 border border-violet-500/30 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-violet-500/5 active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PDF / Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/50 border border-transparent hover:border-slate-800/80 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Paper sheet preview */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-950 flex justify-center items-start scrollbar-none">
          <div className="bg-white text-slate-900 w-full max-w-3xl rounded-xl shadow-xl p-10 border border-slate-200 min-h-[842px] flex flex-col font-sans text-left">
            {/* Letterhead */}
            <div className="flex items-center justify-between border-b-2 border-slate-300 pb-5 mb-6">
              <div className="flex items-center gap-4">
                <img
                  src="/logo.jpeg"
                  alt="Logo"
                  className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div>
                  <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">
                    Braham Sama
                  </h1>
                  <span className="text-[9px] font-bold text-slate-505 uppercase tracking-widest block mt-1">
                    Operations & Management System
                  </span>
                </div>
              </div>
              <div className="text-right text-[10px] text-slate-500 leading-relaxed font-semibold">
                <div>RC Number: 7121543</div>
                <div>Branch: Kano State Branch</div>
                <div>CEO: Braham Sama</div>
                <div>Generated: {new Date().toLocaleDateString()}</div>
              </div>
            </div>

            {/* Document Title */}
            <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wide border-l-4 border-violet-500 pl-3 mb-6 leading-none">
              {title}
            </h2>

            {/* Record Fields Layout */}
            <div className="flex gap-6 items-start mb-6">
              {passportUrl && (
                <img
                  src={passportUrl}
                  alt="Passport preview"
                  className="w-28 h-28 rounded-xl object-cover border border-slate-300 shadow-sm"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              )}
              <div className="flex-grow grid grid-cols-2 gap-x-6 gap-y-3.5 text-xs">
                {recordData.map((item, idx) => (
                  <div key={idx} className="border-b border-slate-100 pb-1.5">
                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                      {item.label}
                    </div>
                    <div className="text-slate-800 font-bold mt-0.5">
                      {item.value === null || item.value === undefined ? 'N/A' : String(item.value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sub Tables */}
            {tables && tables.length > 0 && (
              <div className="space-y-6 flex-1">
                {tables.map((table, tIdx) => (
                  <div key={tIdx} className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-violet-650 border-b border-slate-205 pb-1.5">
                      {table.title}
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            {table.headers.map((h, hIdx) => (
                              <th
                                key={hIdx}
                                className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase text-left"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {table.rows.map((row, rIdx) => (
                            <tr key={rIdx}>
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="px-3 py-2 text-slate-705">
                                  {cell === null || cell === undefined ? 'N/A' : String(cell)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Signatures */}
            <div className="mt-auto pt-10 flex justify-between text-xs">
              <div className="border-t border-slate-300 w-48 text-center pt-2 text-slate-500 font-medium mt-10">
                Officer Signature
              </div>
              <div className="border-t border-slate-300 w-48 text-center pt-2 text-slate-500 font-medium mt-10">
                CEO Signature & Stamp
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
