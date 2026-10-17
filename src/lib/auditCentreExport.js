import { jsPDF } from 'jspdf';
import { base44 } from '@/api/base44Client';
import { drawCompanyBranding, drawDocumentFooter, loadCompanyBranding } from '@/lib/companyBranding';
import { downloadCsv } from '@/lib/csvExport';
import { DATA_MODULES } from '@/lib/dataModules';
import { MODULE_TRACKERS, trackerQuery } from '@/lib/moduleTrackers';

const INTERNAL_FIELDS = new Set(['id', 'created_by_id']);

/**
 * Export one module's register records as an audit CSV (up to 300 most recent).
 */
export async function exportModuleRecordsCsv(entity, label) {
  const page = await base44.entities[entity].filter({}, { sort: '-created_date', limit: 300 });
  const records = page.items || [];
  if (records.length === 0) {
    downloadCsv(`${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-register.csv`, [{ key: 'module', label: 'Module' }], [{ module: `${label} - no records on file yet` }]);
    return 0;
  }
  const keys = Object.keys(records[0]).filter((k) => !INTERNAL_FIELDS.has(k));
  downloadCsv(
    `${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-register.csv`,
    keys.map((k) => ({ key: k, label: k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) })),
    records,
  );
  return records.length;
}

/**
 * Branded PDF of the internal audit report list (module record counts).
 */
export function downloadAuditListPdf(rows, { generatedBy = '', correctiveActions = [] } = {}) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const generatedAt = new Date().toLocaleString('en-AU');
  let y = 64;

  drawCompanyBranding(doc, 40, y, { fontSize: 18 });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120);
  doc.text('INTERNAL AUDIT', pageW - 40, y, { align: 'right' });
  y += 40;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(30);
  doc.text('Internal Audit Report List', 40, y);
  y += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(110);
  doc.text([generatedAt, generatedBy && `Prepared by ${generatedBy}`].filter(Boolean).join('  |  '), 40, y);
  y += 24;

  const total = rows.reduce((sum, r) => sum + (r.count || 0), 0);
  doc.setFillColor(226, 240, 252);
  doc.roundedRect(40, y, pageW - 80, 40, 5, 5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(23, 78, 138);
  doc.text(`${rows.length} modules  |  ${total.toLocaleString()} records on file`, 54, y + 25);
  y += 58;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(60);
  doc.text('MODULE', 40, y);
  doc.text('ENTITY', pageW * 0.55, y);
  doc.text('RECORDS', pageW - 90, y, { align: 'right' });
  y += 12;
  doc.setDrawColor(210);
  doc.line(40, y, pageW - 40, y);
  y += 14;

  doc.setFont('helvetica', 'normal');
  for (const r of rows) {
    if (y > pageH - 90) { doc.addPage(); y = 64; }
    doc.setFontSize(9);
    doc.setTextColor(30);
    doc.text(r.label, 40, y, { maxWidth: pageW * 0.5 });
    doc.setTextColor(120);
    doc.text(r.entity, pageW * 0.55, y, { maxWidth: pageW * 0.3 });
    doc.setTextColor(30);
    doc.text(String(r.count), pageW - 90, y, { align: 'right' });
    y += 16;
  }

  // Corrective action register (open actions passed in by the caller).
  if (correctiveActions.length) {
    y += 24;
    if (y > pageH - 130) { doc.addPage(); y = 64; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30);
    doc.text(`Corrective Action Register (${correctiveActions.length} open)`, 40, y);
    y += 18;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(60);
    doc.text('ACTION', 40, y);
    doc.text('OWNER', pageW * 0.5, y);
    doc.text('DUE', pageW * 0.72, y, { align: 'right' });
    doc.text('STATUS', pageW - 40, y, { align: 'right' });
    y += 12;
    doc.setDrawColor(210);
    doc.line(40, y, pageW - 40, y);
    y += 14;
    doc.setFont('helvetica', 'normal');
    for (const a of correctiveActions) {
      if (y > pageH - 90) { doc.addPage(); y = 64; }
      doc.setFontSize(9);
      doc.setTextColor(30);
      doc.text(doc.splitTextToSize(a.action, pageW * 0.44)[0], 40, y);
      doc.setTextColor(120);
      doc.text(a.owner, pageW * 0.5, y);
      doc.text(a.due, pageW * 0.72, y, { align: 'right' });
      doc.setTextColor(185, 60, 40);
      doc.text(a.status, pageW - 40, y, { align: 'right' });
      y += 16;
    }
  }

  drawDocumentFooter(doc, { title: 'Internal Audit Report List', code: 'IA-REPORT' });
  doc.save(`internal-audit-report-list-${new Date().toISOString().slice(0, 10)}.pdf`);
}

/**
 * Live overdue / due-soon counts from every compliance tracker, deduplicated.
 */
export async function collectAuditTrackers() {
  const seen = new Map();
  Object.values(MODULE_TRACKERS).forEach((entries) => {
    entries.forEach((item) => {
      const key = `${item.label}|${item.entity}`;
      if (!seen.has(key)) seen.set(key, item);
    });
  });
  const items = [...seen.values()];
  const out = [];
  for (let i = 0; i < items.length; i += 6) {
    const batch = items.slice(i, i + 6);
    const results = await Promise.allSettled(
      batch.map(async (item) => ({
        label: item.label,
        entity: item.entity,
        overdue: await base44.entities[item.entity].count(trackerQuery(item, 'overdue')),
        soon: item.soon === undefined ? null : await base44.entities[item.entity].count(trackerQuery(item, 'soon')),
      })),
    );
    results.forEach((r) => { if (r.status === 'fulfilled') out.push(r.value); });
  }
  return out;
}

/**
 * Full Business Audit Report: module evidence base + live compliance attention
 * list, exported as a branded multi-page PDF and logged to the Internal Audit Register.
 */
export async function downloadFullBusinessAuditPdf({ counts, trackers, generatedBy = '' } = {}) {
  await loadCompanyBranding();
  const rows = counts || [];
  const attention = trackers || (await collectAuditTrackers());
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const generatedAt = new Date().toLocaleString('en-AU');
  let y = 64;

  drawCompanyBranding(doc, 40, y, { fontSize: 18 });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120);
  doc.text('FULL BUSINESS AUDIT', pageW - 40, y, { align: 'right' });
  y += 40;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(30);
  doc.text('Full Business Audit Report', 40, y);
  y += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(110);
  doc.text([generatedAt, generatedBy && `Prepared by ${generatedBy}`].filter(Boolean).join('  |  '), 40, y);
  y += 24;

  const totalRecords = rows.reduce((sum, r) => sum + (r.count || 0), 0);
  const overdueTotal = attention.reduce((sum, r) => sum + (r.overdue || 0), 0);
  const modulesWithOverdue = attention.filter((r) => r.overdue > 0);

  doc.setFillColor(240, 245, 255);
  doc.roundedRect(40, y, pageW - 80, 56, 5, 5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(23, 78, 138);
  doc.text('Audit summary', 54, y + 20);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(60);
  doc.text(`Modules: ${rows.length}  |  Records on file: ${totalRecords.toLocaleString()}  |  Attention items: ${attention.length}`, 54, y + 36);
  doc.text(`Overdue compliance items across the business: ${overdueTotal}  |  Modules needing attention: ${modulesWithOverdue.length}`, 54, y + 49);
  y += 76;

  const tableHeader = (cols, xs) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(60);
    cols.forEach((c, i) => doc.text(c, xs[i], y, i === cols.length - 1 ? { align: 'right' } : undefined));
    y += 8;
    doc.setDrawColor(210);
    doc.line(40, y, pageW - 40, y);
    y += 14;
  };

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30);
  doc.text('1. Module evidence base (records on file)', 40, y);
  y += 18;
  tableHeader(['Module', 'Entity', 'Records'], [40, pageW * 0.55, pageW - 90]);
  doc.setFont('helvetica', 'normal');
  for (const r of rows) {
    if (y > pageH - 90) { doc.addPage(); y = 64; }
    doc.setFontSize(9);
    doc.setTextColor(30);
    doc.text(r.label, 40, y, { maxWidth: pageW * 0.5 });
    doc.setTextColor(120);
    doc.text(r.entity, pageW * 0.55, y, { maxWidth: pageW * 0.3 });
    doc.setTextColor(30);
    doc.text(String(r.count), pageW - 90, y, { align: 'right' });
    y += 16;
  }
  y += 16;

  if (y > pageH - 130) { doc.addPage(); y = 64; }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30);
  doc.text('2. Compliance attention list (overdue and due soon)', 40, y);
  y += 18;
  tableHeader(['Item', 'Module entity', 'Overdue', 'Due soon'], [40, pageW * 0.5, pageW - 130, pageW - 90]);
  doc.setFont('helvetica', 'normal');
  for (const r of attention) {
    if (y > pageH - 90) { doc.addPage(); y = 64; }
    doc.setFontSize(9);
    doc.setTextColor(r.overdue > 0 ? 185 : 30);
    doc.text(r.label, 40, y, { maxWidth: pageW * 0.45 });
    doc.setTextColor(120);
    doc.text(r.entity, pageW * 0.5, y, { maxWidth: pageW * 0.28 });
    doc.setTextColor(r.overdue > 0 ? 220 : 60);
    doc.text(String(r.overdue), pageW - 130, y, { align: 'right' });
    doc.setTextColor(60);
    doc.text(r.soon === null ? '-' : String(r.soon), pageW - 90, y, { align: 'right' });
    y += 16;
  }

  // 3. Complete corrective action register derived from the attention list.
  const due14 = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
  const due30 = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  const corrective = [];
  for (const r of attention) {
    if (r.overdue > 0) corrective.push({ action: `Resolve ${r.overdue} overdue ${r.label.toLowerCase()}`, owner: 'Module owner', due: due14, status: 'Open' });
    if (r.soon > 0) corrective.push({ action: `Review ${r.soon} ${r.label.toLowerCase()} due soon`, owner: 'Module owner', due: due30, status: 'Open' });
  }
  y += 24;
  if (y > pageH - 130) { doc.addPage(); y = 64; }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30);
  doc.text(`3. Corrective action register (${corrective.length} open)`, 40, y);
  y += 18;
  if (corrective.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(70);
    doc.text('No corrective actions required: every tracked compliance item was in date at audit time.', 40, y);
    y += 20;
  } else {
    tableHeader(['Action', 'Owner', 'Due', 'Status'], [40, pageW * 0.5, pageW * 0.72, pageW - 40]);
    doc.setFont('helvetica', 'normal');
    for (const a of corrective) {
      if (y > pageH - 90) { doc.addPage(); y = 64; }
      doc.setFontSize(9);
      doc.setTextColor(30);
      doc.text(doc.splitTextToSize(a.action, pageW * 0.44)[0], 40, y);
      doc.setTextColor(120);
      doc.text(a.owner, pageW * 0.5, y);
      doc.text(a.due, pageW * 0.72, y, { align: 'right' });
      doc.setTextColor(185, 60, 40);
      doc.text(a.status, pageW - 40, y, { align: 'right' });
      y += 16;
    }
  }

  y += 24;
  if (y > pageH - 110) { doc.addPage(); y = 64; }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30);
  doc.text('Auditor sign-off', 40, y);
  y += 26;
  doc.setDrawColor(150);
  doc.line(40, y, pageW * 0.45, y);
  doc.line(pageW * 0.55, y, pageW - 40, y);
  y += 12;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(110);
  doc.text('Name and signature', 40, y);
  doc.text('Date', pageW * 0.55, y);

  drawDocumentFooter(doc, { title: 'Full Business Audit Report', code: 'FBA-REPORT' });
  doc.save(`full-business-audit-report-${new Date().toISOString().slice(0, 10)}.pdf`);

  try {
    await base44.entities.Register.create({
      register_type: 'Internal Audit Register',
      entry_title: `Full Business Audit Report generated (${generatedAt})`,
      description: `Full business audit PDF exported: ${rows.length} modules, ${totalRecords} records, ${overdueTotal} overdue attention items, corrective action register included.`,
      recorded_date: new Date().toISOString().slice(0, 10),
      status: 'Exported',
      owner: generatedBy || 'System',
    });
  } catch { /* register logging is best-effort */ }
}