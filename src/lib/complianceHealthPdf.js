import { jsPDF } from 'jspdf';
import { base44 } from '@/api/base44Client';
import { loadCompanyBranding, drawCompanyBranding, drawDocumentFooter } from '@/lib/companyBranding';

const PURPLE = '#5B2C83';
const DARK = '#1f1438';
const MUTED = '#6b6b7b';
const LINE = '#e5e5ea';

const pct = (done, total) => (total > 0 ? Math.round((done / total) * 100) : 0);
const barColor = (p) => (p >= 80 ? [16, 185, 129] : p >= 50 ? [245, 158, 11] : [244, 63, 94]);

function header(doc, title, subtitle) {
  const pageW = doc.internal.pageSize.getWidth();
  doc.setFillColor(PURPLE);
  doc.rect(0, 0, pageW, 4, 'F');
  doc.setFillColor('#00A6A6');
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
  doc.text(`Generated: ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Brisbane' })}`, pageW - 40, 39, { align: 'right' });
  doc.setDrawColor(LINE);
  doc.line(40, 44, pageW - 40, 44);
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

function progressBar(doc, x, y, width, height, percent, color) {
  doc.setFillColor('#edeef4');
  doc.roundedRect(x, y, width, height, height / 2, height / 2, 'F');
  const fill = Math.max((width * percent) / 100, height);
  doc.setFillColor(color[0], color[1], color[2]);
  doc.roundedRect(x, y, fill, height, height / 2, height / 2, 'F');
}

export async function downloadComplianceHealthReport() {
  const branding = await loadCompanyBranding();
  const [all, done] = await Promise.all([
    base44.entities.Task.aggregate({ query: { status: { $ne: 'Cancelled' } }, groupBy: 'task_type' }),
    base44.entities.Task.aggregate({ query: { status: 'Completed' }, groupBy: 'task_type' }),
  ]);
  const doneBy = Object.fromEntries((done.rows || []).map((r) => [r.task_type || 'General', r.count]));
  const groups = (all.rows || [])
    .map((r) => ({
      label: r.task_type || 'General',
      total: r.count,
      done: doneBy[r.task_type || 'General'] || 0,
    }))
    .map((g) => ({ ...g, outstanding: g.total - g.done, percent: pct(g.done, g.total) }))
    .sort((a, b) => a.percent - b.percent || b.total - a.total);

  const totals = groups.reduce((acc, g) => ({ done: acc.done + g.done, total: acc.total + g.total }), { done: 0, total: 0 });
  const overall = pct(totals.done, totals.total);

  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40;
  header(doc, 'Compliance Health Summary', 'Overall compliance health and department progress — compliance tasks');

  let y = 58;
  y = statCards(doc, [
    { label: 'OVERALL HEALTH', value: `${overall}%`, tint: '#f3f0fa' },
    { label: 'COMPLETED', value: totals.done, tint: '#e8f6ee' },
    { label: 'OUTSTANDING', value: totals.total - totals.done, tint: '#fdeaea' },
    { label: 'DEPARTMENTS', value: groups.length, tint: '#eef0f6' },
  ], y);

  // Overall progress bar
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(PURPLE);
  doc.text('Overall compliance completion', margin, y + 4);
  y += 12;
  progressBar(doc, margin, y, pageW - margin * 2, 12, overall, barColor(overall));
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(MUTED);
  doc.text(`${totals.done} of ${totals.total} audit tasks completed (${overall}%)`, margin, y + 24);
  y += 36;

  // Per-department progress bars
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(PURPLE);
  doc.text('Department progress', margin, y + 4);
  y += 14;

  const barX = margin;
  const barW = pageW - margin * 2;
  groups.forEach((g) => {
    if (y + 46 > doc.internal.pageSize.getHeight() - 60) {
      doc.addPage();
      y = 58;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(DARK);
    doc.text(g.label, barX, y + 4);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(MUTED);
    doc.text(`${g.done} completed · ${g.outstanding} outstanding · ${g.percent}%`, barX, y + 14);
    progressBar(doc, barX, y + 20, barW, 10, g.percent, barColor(g.percent));
    y += 44;
  });

  // Weakest department call-out
  const weakest = groups[0];
  if (weakest && weakest.outstanding > 0) {
    if (y + 40 > doc.internal.pageSize.getHeight() - 60) {
      doc.addPage();
      y = 58;
    }
    doc.setFillColor('#fdeaea');
    doc.roundedRect(margin, y, barW, 30, 4, 4, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor('#b91c1c');
    doc.text(`Needs attention: ${weakest.label}`, margin + 10, y + 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`${weakest.outstanding} of ${weakest.total} audit tasks still outstanding (${weakest.percent}% complete).`, margin + 10, y + 23);
    y += 40;
  }

  drawDocumentFooter(doc, {
    title: 'Compliance Health Summary',
    confidential: 'Confidential',
    companyName: branding.companyName,
  });
  doc.save('Compliance-Health-Summary.pdf');
}