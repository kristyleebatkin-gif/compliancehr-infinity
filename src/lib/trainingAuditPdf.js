import { jsPDF } from 'jspdf';
import { drawCompanyBranding, drawDocumentFooter } from '@/lib/companyBranding';
import { BUSINESS_TIME_ZONE } from '@/lib/businessTime';

const BRAND_PURPLE = '#5B2C83';
const BRAND_TEAL = '#00A6A6';
const DARK = '#1f1438';
const MUTED = '#6b6b7b';
const LINE = '#e5e5ea';

function header(doc, title, subtitle) {
  const pageW = doc.internal.pageSize.getWidth();
  doc.setFillColor(BRAND_PURPLE);
  doc.rect(0, 0, pageW, 4, 'F');
  doc.setFillColor(BRAND_TEAL);
  doc.rect(0, 4, pageW, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(DARK);
  doc.text(title, 40, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(MUTED);
  doc.text(subtitle, 40, 38);

  drawCompanyBranding(doc, pageW - 190, 28, { fontSize: 10, logoSize: 18, maxWidth: 126 });
  doc.setFontSize(8);
  doc.setTextColor(MUTED);
  const generated = `Generated: ${new Date().toLocaleString('en-AU', { timeZone: BUSINESS_TIME_ZONE })}`;
  doc.text(generated, pageW - 40, 39, { align: 'right' });

  doc.setDrawColor(LINE);
  doc.line(40, 44, pageW - 40, 44);
}

function footer(doc) {
  drawDocumentFooter(doc, {
    title: 'Training & Certification Audit Report',
    confidential: 'Confidential',
  });
}

function statCards(doc, stats, y) {
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40;
  const gap = 8;
  const cardW = (pageW - margin * 2 - gap * (stats.length - 1)) / stats.length;
  const cardH = 26;
  stats.forEach((s, i) => {
    const x = margin + i * (cardW + gap);
    doc.setFillColor(s.tint);
    doc.roundedRect(x, y, cardW, cardH, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(DARK);
    doc.text(String(s.value), x + 8, y + 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(MUTED);
    doc.text(s.label, x + 8, y + 20);
  });
  return y + cardH + 10;
}

function sectionTitle(doc, text, y) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(BRAND_PURPLE);
  doc.text(text, 40, y);
  return y + 6;
}

function table(doc, columns, rows, startY) {
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40;
  const usableW = pageW - margin * 2;
  const colW = columns.map((c) => c.width);
  const totalW = colW.reduce((a, b) => a + b, 0);
  const scaled = colW.map((w) => (w / totalW) * usableW);

  let y = startY;
  const rowH = 14;

  const ensureSpace = (needed) => {
    const pageH = doc.internal.pageSize.getHeight();
    if (y + needed > pageH - 30) {
      doc.addPage();
      y = 50;
    }
  };

  ensureSpace(rowH);
  doc.setFillColor(BRAND_PURPLE);
  doc.rect(margin, y, usableW, rowH, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor('#ffffff');
  let x = margin;
  columns.forEach((c, i) => {
    doc.text(String(c.label).toUpperCase(), x + 4, y + 9, { maxWidth: scaled[i] - 8 });
    x += scaled[i];
  });
  y += rowH;

  rows.forEach((row, ri) => {
    ensureSpace(rowH);
    if (ri % 2 === 1) {
      doc.setFillColor('#f6f3fa');
      doc.rect(margin, y, usableW, rowH, 'F');
    }
    doc.setDrawColor(LINE);
    doc.rect(margin, y, usableW, rowH, 'S');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(DARK);
    x = margin;
    row.forEach((cell, i) => {
      const txt = cell == null || cell === '' ? '—' : String(cell);
      doc.text(txt, x + 4, y + 9, { maxWidth: scaled[i] - 8 });
      x += scaled[i];
    });
    y += rowH;
  });

  return y + 6;
}

const expiryLabel = (expiry) => {
  if (!expiry) return 'No expiry (current)';
  const days = Math.ceil((new Date(expiry) - new Date()) / 86400000);
  if (days < 0) return `Expired (${Math.abs(days)}d ago)`;
  if (days <= 60) return `Expiring soon (${days}d left)`;
  return 'Current';
};

/**
 * Builds the audit report PDF from the certification overview data.
 * @param {object} data - { rows, attention, totals, fullyCompliant, generatedOn }
 *   rows: staff with counts { valid, soon, expired } and certs []
 */
export function downloadTrainingAuditReport(data) {
  const { rows = [], totals = { valid: 0, soon: 0, expired: 0 }, fullyCompliant = 0 } = data;
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  header(doc, 'Training & Certification Audit Report', 'Summary of all staff training and certificate expiry dates');

  let y = 58;
  y = statCards(doc, [
    { label: 'ACTIVE STAFF', value: rows.length, tint: '#eef0f6' },
    { label: 'CURRENT CERTIFICATIONS', value: totals.valid, tint: '#e8f6ee' },
    { label: 'EXPIRING WITHIN 60 DAYS', value: totals.soon, tint: '#fff4e5' },
    { label: 'EXPIRED', value: totals.expired, tint: '#fdeaea' },
    { label: 'STAFF FULLY CURRENT', value: fullyCompliant, tint: '#f1ecf7' },
  ], y);

  // Certification status by staff member
  y = sectionTitle(doc, 'Certification Status by Staff Member', y);
  y += 4;
  y = table(doc,
    [
      { label: 'Staff Member', width: 150 },
      { label: 'Role', width: 110 },
      { label: 'Modules Recorded', width: 100 },
      { label: 'Current', width: 70 },
      { label: 'Expiring Soon', width: 95 },
      { label: 'Expired', width: 70 },
    ],
    rows.map((r) => [
      r.full_name || '—',
      r.role || '—',
      r.certs.length,
      r.counts.valid,
      r.counts.soon,
      r.counts.expired,
    ]),
    y
  );

  // Full expiry schedule, soonest first (no-expiry certs last)
  const allCerts = rows
    .flatMap((r) => (r.certs || []).map((c) => ({ ...c, staff_name: r.full_name, role: r.role })))
    .sort((a, b) => {
      if (!a.expiry_date && !b.expiry_date) return 0;
      if (!a.expiry_date) return 1;
      if (!b.expiry_date) return -1;
      return String(a.expiry_date).localeCompare(String(b.expiry_date));
    });

  doc.addPage();
  y = 50;
  y = sectionTitle(doc, `Certificate Expiry Schedule (${allCerts.length} records, soonest first)`, y);
  y += 4;
  y = table(doc,
    [
      { label: 'Staff Member', width: 140 },
      { label: 'Role', width: 110 },
      { label: 'Training Module', width: 210 },
      { label: 'Completed', width: 90 },
      { label: 'Expiry Date', width: 90 },
      { label: 'Status', width: 150 },
    ],
    allCerts.map((c) => [
      c.staff_name || '—',
      c.role || '—',
      c.module_title || '—',
      c.completed_date || '—',
      c.expiry_date || 'No expiry',
      expiryLabel(c.expiry_date),
    ]),
    y
  );

  if (!allCerts.length) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(MUTED);
    doc.text('No training completions recorded yet.', 40, y);
  }

  // Complete corrective action register: every expired and expiring certification.
  const due14 = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
  const due30 = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  const corrective = [];
  for (const r of rows) {
    if (r.counts.expired > 0) corrective.push({ action: `Renew ${r.counts.expired} expired certification(s)`, owner: r.full_name || 'Staff member', due: due14, status: 'Open' });
    if (r.counts.soon > 0) corrective.push({ action: `Schedule renewal of ${r.counts.soon} expiring certification(s)`, owner: r.full_name || 'Staff member', due: due30, status: 'Open' });
  }
  doc.addPage();
  y = 50;
  y = sectionTitle(doc, `Corrective Action Register (${corrective.length} open)`, y);
  y += 4;
  if (corrective.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(MUTED);
    doc.text('No corrective actions required: every staff certification was current at audit time.', 40, y);
  } else {
    y = table(doc,
      [
        { label: 'Action', width: 260 },
        { label: 'Owner', width: 160 },
        { label: 'Due', width: 100 },
        { label: 'Status', width: 100 },
      ],
      corrective.map((a) => [a.action, a.owner, a.due, a.status]),
      y
    );
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(MUTED);
    doc.text('Actions are due 14 days from issue for expired certifications and 30 days for those expiring soon.', 40, y);
  }

  footer(doc);
  doc.save(`Training-Certification-Audit-Report.pdf`);
}