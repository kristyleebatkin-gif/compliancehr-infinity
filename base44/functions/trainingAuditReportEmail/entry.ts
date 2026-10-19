import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { jsPDF } from 'npm:jspdf@4.2.1';
import { MANAGEMENT_ROLES, hasAnyRole } from '../../shared/systemAuth.ts';

const SYDNEY = 'Australia/Sydney';
const DARK = '#1f1438';
const MUTED = '#6b6b7b';
const LINE = '#e5e5ea';
const PURPLE = '#5B2C83';
const TEAL = '#00A6A6';

const prettyDate = (iso) => iso
  ? new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`))
  : 'No expiry';

const expiryLabel = (expiry) => {
  if (!expiry) return 'No expiry (current)';
  const days = Math.ceil((new Date(`${expiry}T00:00:00Z`) - Date.now()) / 86400000);
  if (days < 0) return `Expired (${Math.abs(days)}d ago)`;
  if (days <= 60) return `Expiring soon (${days}d left)`;
  return 'Current';
};

const bufToBase64 = (buf) => {
  const bytes = new Uint8Array(buf);
  let bin = '';
  const chunk = 8192;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
};

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
  doc.setTextColor(PURPLE);
  doc.text(text, 40, y);
  return y + 10;
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

  const ensureSpace = () => {
    if (y + rowH > doc.internal.pageSize.getHeight() - 30) {
      doc.addPage();
      y = 50;
    }
  };

  ensureSpace();
  doc.setFillColor(PURPLE);
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
    ensureSpace();
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
      const txt = cell == null || cell === '' ? '-' : String(cell);
      doc.text(txt, x + 4, y + 9, { maxWidth: scaled[i] - 8 });
      x += scaled[i];
    });
    y += rowH;
  });
  return y + 6;
}

function buildReportPdf(rows, totals, fullyCompliant) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();

  doc.setFillColor(PURPLE);
  doc.rect(0, 0, pageW, 4, 'F');
  doc.setFillColor(TEAL);
  doc.rect(0, 4, pageW, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(DARK);
  doc.text('Training & Certification Audit Report', 40, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(MUTED);
  doc.text('Summary of all staff training and certificate expiry dates', 40, 38);
  doc.setFontSize(8);
  const generated = `Generated: ${new Date().toLocaleString('en-AU', { timeZone: SYDNEY })}`;
  doc.text(generated, pageW - 40, 39, { align: 'right' });
  doc.setDrawColor(LINE);
  doc.line(40, 44, pageW - 40, 44);

  let y = 58;
  y = statCards(doc, [
    { label: 'ACTIVE STAFF', value: rows.length, tint: '#eef0f6' },
    { label: 'CURRENT CERTIFICATIONS', value: totals.valid, tint: '#e8f6ee' },
    { label: 'EXPIRING WITHIN 60 DAYS', value: totals.soon, tint: '#fff4e5' },
    { label: 'EXPIRED', value: totals.expired, tint: '#fdeaea' },
    { label: 'STAFF FULLY CURRENT', value: fullyCompliant, tint: '#f1ecf7' },
  ], y);

  y = sectionTitle(doc, 'Certification Status by Staff Member', y);
  y = table(doc,
    [
      { label: 'Staff Member', width: 150 },
      { label: 'Role', width: 110 },
      { label: 'Modules Recorded', width: 100 },
      { label: 'Current', width: 70 },
      { label: 'Expiring Soon', width: 95 },
      { label: 'Expired', width: 70 },
    ],
    rows.map((r) => [r.full_name || '-', r.role || '-', r.certs.length, r.counts.valid, r.counts.soon, r.counts.expired]),
    y
  );

  const allCerts = rows
    .flatMap((r) => (r.certs || []).map((c) => ({ ...c, staff_name: r.full_name, role: r.role })))
    .sort((a, b) => {
      if (!a.expiry_date && !b.expiry_date) return 0;
      if (!a.expiry_date) return 1;
      if (!b.expiry_date) return -1;
      return String(a.expiry_date).localeCompare(String(b.expiry_date));
    });

  doc.addPage();
  y = sectionTitle(doc, `Certificate Expiry Schedule (${allCerts.length} records, soonest first)`, 50);
  y = table(doc,
    [
      { label: 'Staff Member', width: 140 },
      { label: 'Role', width: 110 },
      { label: 'Training Module', width: 210 },
      { label: 'Completed', width: 90 },
      { label: 'Expiry Date', width: 90 },
      { label: 'Status', width: 150 },
    ],
    allCerts.map((c) => [c.staff_name || '-', c.role || '-', c.module_title || '-', prettyDate(c.completed_date), prettyDate(c.expiry_date), expiryLabel(c.expiry_date)]),
    y
  );

  if (!allCerts.length) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(MUTED);
    doc.text('No training completions recorded yet.', 40, y);
  }

  const pageH = doc.internal.pageSize.getHeight();
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(MUTED);
    doc.text('Training & Certification Audit Report - Confidential', 40, pageH - 18);
    doc.text(`Page ${p} of ${pages}`, pageW - 40, pageH - 18, { align: 'right' });
  }
  return doc;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const dryRun = !!body.dry_run;
    const service = base44.asServiceRole;
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Confidential org-wide staff report: management roles only. The
    // scheduled workflow authenticates as the app admin, so it still runs.
    if (!hasAnyRole(user, MANAGEMENT_ROLES)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    let recipient = String(body.recipient_email || '').trim().toLowerCase();
    if (!recipient) {
      const users = await service.entities.User.list();
      const admin = (Array.isArray(users) ? users : users.items || [])
        .find((u) => MANAGEMENT_ROLES.includes(u.role) && u.email);
      recipient = admin ? String(admin.email).toLowerCase() : '';
    }
    if (!recipient) return Response.json({ error: 'No recipient email available' }, { status: 400 });
    const staff = await service.entities.StaffProfile.list({ limit: 500 });
    const active = staff.items.filter((s) => s.status === 'Active');
    const [completions, certificates] = await Promise.all([
      service.entities.TrainingCompletion.filter({ status: { $ne: 'Archived' } }, { limit: 500 }),
      service.entities.Certificate.filter({ status: { $nin: ['Revoked', 'Expired'] } }, { limit: 500 }),
    ]);

    const rows = active.map((s) => {
      const certs = [
        ...completions.items.filter((c) => c.learner_type !== 'Participant' && (c.employee_id === s.id || String(c.employee_name || '').toLowerCase() === String(s.full_name || '').toLowerCase())),
        ...certificates.items.filter((c) => c.staff_id === s.id || String(c.staff_name || '').toLowerCase() === String(s.full_name || '').toLowerCase()),
      ];
      const counts = { valid: 0, soon: 0, expired: 0 };
      certs.forEach((c) => {
        if (!c.expiry_date) { counts.valid += 1; return; }
        const days = Math.ceil((new Date(`${c.expiry_date}T00:00:00Z`) - Date.now()) / 86400000);
        if (days < 0) counts.expired += 1;
        else if (days <= 60) counts.soon += 1;
        else counts.valid += 1;
      });
      return { full_name: s.full_name, role: s.role, certs, counts };
    }).sort((a, b) => (b.counts.expired + b.counts.soon) - (a.counts.expired + a.counts.soon) || String(a.full_name).localeCompare(String(b.full_name)));

    const totals = rows.reduce((acc, r) => ({
      valid: acc.valid + r.counts.valid,
      soon: acc.soon + r.counts.soon,
      expired: acc.expired + r.counts.expired,
    }), { valid: 0, soon: 0, expired: 0 });
    const fullyCompliant = rows.filter((r) => r.counts.expired === 0 && r.counts.soon === 0).length;

    const reportPeriod = new Intl.DateTimeFormat('en-AU', { month: 'long', year: 'numeric', timeZone: SYDNEY }).format(new Date());
    const generatedOn = new Date().toLocaleString('en-AU', { timeZone: SYDNEY });

    if (dryRun) {
      return Response.json({ dry_run: true, recipient, report_period: reportPeriod, staff_count: rows.length, totals, fully_compliant: fullyCompliant });
    }

    const doc = buildReportPdf(rows, totals, fullyCompliant);
    const pdfBase64 = bufToBase64(doc.output('arraybuffer'));

    const result = await service.integrations.Core.SendEmail({
      to: recipient,
      template_name: 'TrainingAuditReport',
      variables: {
        report_period: reportPeriod,
        staff_count: String(rows.length),
        current_count: String(totals.valid),
        expiring_count: String(totals.soon),
        expired_count: String(totals.expired),
        fully_current_count: String(fullyCompliant),
        generated_on: generatedOn,
      },
      attachments: [{ filename: 'Training-Certification-Audit-Report.pdf', content: pdfBase64 }],
    });

    return Response.json({ sent: !!result.sent || true, recipient, report_period: reportPeriod, staff_count: rows.length, totals, fully_compliant: fullyCompliant });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}