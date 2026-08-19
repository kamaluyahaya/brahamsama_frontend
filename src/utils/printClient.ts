export function buildNativePrintHTML(client: any, autoTrigger: boolean): string {
  const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const clientName = client.name || 'N/A';
  const fileNo = client.file_no || 'N/A';
  const officeBranch = client.office || 'N/A';
  const phone = client.phone || 'N/A';
  const email = client.email_address || 'N/A';
  const address = client.residential_address || 'N/A';
  const govId = client.id_details || 'N/A';
  const bankName = client.bank_name || 'N/A';
  const accountName = client.account_name || 'N/A';
  const accountNumber = client.account_number || 'N/A';
  const vehicleChassis = client.vehicle_type_chassis || 'N/A';
  const noOfMotorcycles = client.no_of_motorcycles || '0';
  const tempoNo = client.tempo_no || 'N/A';
  const totalDisbursed = client.total_disbursed_amount ? `₦${client.total_disbursed_amount.toLocaleString()}` : '₦0';
  const receiptNo = client.receipt_no || 'N/A';
  const contractTerm = client.duration_of_completion || 'N/A';
  const dateOfPurchase = client.date_of_purchase || 'N/A';
  const firstDisb = client.date_of_first_disbursement || 'N/A';
  const finalDisb = client.final_disbursement || 'N/A';
  const passportUrl = client.passport_url || '';
  const reportRef = `CPR-${fileNo !== 'N/A' ? fileNo : new Date().getFullYear()}`;

  const triggerScript = autoTrigger
    ? '<' + 'script>window.addEventListener("load",function(){setTimeout(function(){window.print();},600);});</' + 'script>'
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
${triggerScript}
</body>
</html>`;
}
