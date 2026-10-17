import { jsPDF } from 'jspdf';
import { drawCompanyBranding, drawDocumentFooter } from '@/lib/companyBranding';

// Compliance Audit Checklist PDF + print views.
// Renders the live per-module audit checklist (items, evidence and the
// corrective action register) with company branding, matching the module
// audit report styling.
const STATUS_RGB = { Pass: [22, 128, 61], Attention: [180, 100, 10], 'Not required': [100, 116, 139] };
const STATUS_FILL = { Pass: [226, 244, 232], Attention: [254, 243, 220], 'Not required': [241, 245, 249] };
const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const today = () => new Date().toISOString().slice(0, 10);

export function downloadAuditChecklistPdf({ moduleLabel, items = [], actions = [], generatedBy = '', generatedAt = '' }) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const stamp = generatedAt || new Date().toLocaleString('en-AU');
  let y = 64;

  drawCompanyBranding(doc, 40, y, { fontSize: 18 });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120);
  doc.text('INTERNAL AUDIT', pageW - 40, y, { align: 'right' });
  y += 42;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(30);
  doc.text(`Compliance Audit Checklist: ${moduleLabel}`, 40, y);
  y += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(110);
  doc.text([stamp, generatedBy && `Prepared by ${generatedBy}`].filter(Boolean).join('  |  '), 40, y);
  y += 22;

  const passes = items.filter((i) => i.status === 'Pass').length;
  const attentions = items.filter((i) => i.status === 'Attention').length;
  doc.setFillColor(226, 240, 252);
  doc.roundedRect(40, y, pageW - 80, 40, 5, 5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(23, 78, 138);
  doc.text(`Result: ${passes}/${items.length} items in place  |  ${attentions} need attention  |  Evaluated live from module registers`, 54, y + 24);
  y += 58;

  // Checklist items
  const heading = (text) => {
    if (y > pageH - 110) { doc.addPage(); y = 64; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30);
    doc.text(text, 40, y);
    doc.setDrawColor(215);
    doc.line(40, y + 6, pageW - 40, y + 6);
    y += 22;
  };

  heading('Checklist Items');
  for (const item of items) {
    if (y > pageH - 90) { doc.addPage(); y = 64; }
    const rgb = STATUS_RGB[item.status] || STATUS_RGB['Not required'];
    const fill = STATUS_FILL[item.status] || STATUS_FILL['Not required'];
    doc.setFillColor(...fill);
    doc.roundedRect(40, y - 9, 78, 16, 4, 4, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...rgb);
    doc.text(item.status.toUpperCase(), 46, y + 2);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(50);
    const itemLines = doc.splitTextToSize(item.item, pageW - 150);
    doc.text(itemLines, 128, y);
    y += itemLines.length * 12;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(120);
    const evidenceLines = doc.splitTextToSize(`Evidence: ${item.evidence}`, pageW - 100);
    for (const line of evidenceLines) {
      if (y > pageH - 90) { doc.addPage(); y = 64; }
      doc.text(line, 48, y);
      y += 11;
    }
    y += 6;
  }

  // Corrective action register
  y += 4;
  heading(`Corrective Action Register (${actions.length} open)`);
  if (actions.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(70);
    doc.text('No corrective actions required: all tracked compliance items were in date at audit time.', 40, y);
    y += 20;
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(60);
    doc.text('ACTION', 40, y);
    doc.text('OWNER', pageW * 0.56, y);
    doc.text('DUE', pageW * 0.76, y, { align: 'right' });
    doc.text('STATUS', pageW - 40, y, { align: 'right' });
    y += 12;
    doc.setDrawColor(210);
    doc.line(40, y, pageW - 40, y);
    y += 13;
    doc.setFont('helvetica', 'normal');
    for (const a of actions) {
      if (y > pageH - 90) { doc.addPage(); y = 64; }
      doc.setFontSize(9);
      doc.setTextColor(50);
      doc.text(doc.splitTextToSize(a.action, pageW * 0.5)[0], 40, y);
      doc.text(a.owner, pageW * 0.56, y);
      doc.text(a.due, pageW * 0.76, y, { align: 'right' });
      doc.setTextColor(180, 60, 40);
      doc.text(a.status, pageW - 40, y, { align: 'right' });
      doc.setTextColor(50);
      y += 16;
    }
  }

  drawDocumentFooter(doc, { title: `Compliance Audit Checklist: ${moduleLabel}`, code: 'CM-MOD-CHK' });
  const safe = moduleLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  doc.save(`audit-checklist-${safe}-${today()}.pdf`);
}

// Opens a clean print view of the checklist and triggers the browser print dialog.
export function printAuditChecklist({ moduleLabel, items = [], actions = [], generatedBy = '' }) {
  const stamp = new Date().toLocaleString('en-AU');
  const passes = items.filter((i) => i.status === 'Pass').length;
  const attentions = items.filter((i) => i.status === 'Attention').length;
  const tone = (s) => (s === 'Pass' ? '#16a34a' : s === 'Attention' ? '#b4640a' : '#64748b');

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Compliance Audit Checklist: ${esc(moduleLabel)}</title>
<style>
  body { font-family: Arial, Helvetica, sans-serif; color: #1e293b; margin: 40px; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .meta { color: #64748b; font-size: 11px; margin-bottom: 16px; }
  .summary { background: #e2f0fc; color: #174e8a; font-weight: 700; font-size: 12px; padding: 10px 14px; border-radius: 6px; margin-bottom: 18px; }
  .item { display: flex; gap: 10px; margin-bottom: 10px; align-items: flex-start; }
  .status { flex-shrink: 0; font-size: 9px; font-weight: 700; padding: 3px 8px; border-radius: 4px; color: #fff; margin-top: 1px; }
  .item-body { font-size: 12px; }
  .evidence { color: #64748b; font-size: 11px; margin-top: 2px; }
  h2 { font-size: 13px; margin: 22px 0 8px; border-bottom: 1px solid #d7dbe0; padding-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th, td { text-align: left; padding: 5px 6px; border-bottom: 1px solid #e5e7eb; }
  th { font-size: 10px; color: #475569; text-transform: uppercase; }
  .footer { margin-top: 26px; color: #94a3b8; font-size: 10px; }
  @media print { body { margin: 24px; } }
</style></head><body>
<h1>Compliance Audit Checklist: ${esc(moduleLabel)}</h1>
<div class="meta">${esc(stamp)}${generatedBy ? ' &nbsp;|&nbsp; Prepared by ' + esc(generatedBy) : ''}</div>
<div class="summary">Result: ${passes}/${items.length} items in place &nbsp;|&nbsp; ${attentions} need attention &nbsp;|&nbsp; Evaluated live from module registers</div>
<div class="item" style="margin-bottom:2px"><div class="item-body" style="font-weight:700;border-bottom:1px solid #d7dbe0;width:100%;padding-bottom:4px">Checklist Items</div></div>
${items.map((i) => `
<div class="item">
  <span class="status" style="background:${tone(i.status)}">${esc(i.status.toUpperCase())}</span>
  <div class="item-body">
    <div style="font-weight:600">${esc(i.item)}</div>
    <div class="evidence">Evidence: ${esc(i.evidence)}</div>
  </div>
</div>`).join('')}
<h2>Corrective Action Register (${actions.length} open)</h2>
${actions.length === 0
    ? '<div style="font-size:11px;color:#475569">No corrective actions required: all tracked compliance items were in date at audit time.</div>'
    : `<table><thead><tr><th>Action</th><th>Owner</th><th>Due</th><th>Status</th></tr></thead><tbody>
${actions.map((a) => `<tr><td>${esc(a.action)}</td><td>${esc(a.owner)}</td><td>${esc(a.due)}</td><td style="color:#b43c28;font-weight:600">${esc(a.status)}</td></tr>`).join('')}
</tbody></table>`}
<div class="footer">Generated by ComplianceHR Infinitely. Evaluated live from module registers at audit time.</div>
<script>window.onload = function () { window.focus(); window.print(); };</script>
</body></html>`;

  const win = window.open('', '_blank', 'width=900,height=1000');
  if (!win) return false;
  win.document.write(html);
  win.document.close();
  return true;
}