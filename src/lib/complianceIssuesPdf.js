import { jsPDF } from 'jspdf';
import { drawCompanyBranding, drawDocumentFooter } from '@/lib/companyBranding';
import { BUSINESS_TIME_ZONE } from '@/lib/businessTime';

const BRAND_PURPLE = '#5B2C83';
const BRAND_TEAL = '#00A6A6';
const DARK = '#1f1438';
const MUTED = '#6b6b7b';
const LINE = '#e5e5ea';

function header(doc, subtitle) {
  const pageW = doc.internal.pageSize.getWidth();
  doc.setFillColor(BRAND_PURPLE);
  doc.rect(0, 0, pageW, 4, 'F');
  doc.setFillColor(BRAND_TEAL);
  doc.rect(0, 4, pageW, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(DARK);
  doc.text('Compliance Issues Report', 40, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(MUTED);
  doc.text(subtitle, 40, 38);

  drawCompanyBranding(doc, pageW - 190, 28, { fontSize: 10, logoSize: 18, maxWidth: 126 });
  doc.setFontSize(8);
  doc.setTextColor(MUTED);
  doc.text(`Generated: ${new Date().toLocaleString('en-AU', { timeZone: BUSINESS_TIME_ZONE })}`, pageW - 40, 39, { align: 'right' });

  doc.setDrawColor(LINE);
  doc.line(40, 44, pageW - 40, 44);
}

function footer(doc) {
  drawDocumentFooter(doc, {
    title: 'Compliance Issues Report',
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
  return y + cardH + 12;
}

function sectionTitle(doc, text, y) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(BRAND_PURPLE);
  doc.text(text, 40, y);
  return y + 8;
}

function ensureSpace(doc, y, needed) {
  if (y + needed <= doc.internal.pageSize.getHeight() - 40) return y;
  footer(doc);
  doc.addPage();
  header(doc, 'Compliance issues, resolutions and action history (continued)');
  return 56;
}

function issueTable(doc, issues, startY) {
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40;
  const usableW = pageW - margin * 2;
  const columns = [
    { label: 'Issue', width: usableW * 0.34 },
    { label: 'Category', width: usableW * 0.14 },
    { label: 'Priority', width: usableW * 0.1 },
    { label: 'Status', width: usableW * 0.12 },
    { label: 'Resolved By', width: usableW * 0.16 },
    { label: 'Resolved On', width: usableW * 0.14 },
  ];
  let y = startY;
  const drawHead = () => {
    doc.setFillColor('#f3eef9');
    doc.rect(margin, y, usableW, 14, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(DARK);
    let x = margin + 6;
    columns.forEach((c) => {
      doc.text(c.label, x, y + 9);
      x += c.width;
    });
    y += 14;
  };
  drawHead();
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  issues.forEach((issue) => {
    const cells = [
      issue.title,
      issue.category || '',
      issue.priority || '',
      issue.status,
      issue.resolved_by || (['Resolved', 'Closed'].includes(issue.status) ? '-' : ''),
      issue.resolved_date || '',
    ];
    const heights = cells.map((c, i) => doc.splitTextToSize(String(c || ''), columns[i].width - 10).length * 9 + 6);
    const h = Math.max(14, ...heights);
    y = ensureSpace(doc, y, h + 2);
    if (issues.indexOf(issue) % 2 === 1) {
      doc.setFillColor('#faf9fc');
      doc.rect(margin, y, usableW, h, 'F');
    }
    let x = margin + 6;
    cells.forEach((c, i) => {
      const lines = doc.splitTextToSize(String(c || ''), columns[i].width - 10);
      doc.setTextColor(i === 0 ? DARK : MUTED);
      lines.forEach((ln, li) => doc.text(ln, x, y + 10 + li * 9));
      x += columns[i].width;
    });
    y += h;
  });
  return y;
}

function actionLog(doc, issues, startY) {
  let y = startY;
  const resolved = issues.filter((i) => (i.actions_log || '').trim());
  if (resolved.length === 0) return y;
  y = ensureSpace(doc, y, 40);
  y = sectionTitle(doc, 'Resolution Action Log (who and when)', y) + 4;
  resolved.forEach((issue) => {
    y = ensureSpace(doc, y, 24);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(DARK);
    doc.text(`${issue.issue_id ? `${issue.issue_id} — ` : ''}${issue.title}`, 40, y, { maxWidth: doc.internal.pageSize.getWidth() - 80 });
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(MUTED);
    (issue.actions_log || '').split('\n').filter(Boolean).forEach((entry) => {
      y = ensureSpace(doc, y, 12);
      const lines = doc.splitTextToSize(entry, doc.internal.pageSize.getWidth() - 100);
      lines.forEach((ln) => {
        doc.text(ln, 48, y);
        y += 9;
      });
    });
    if (issue.resolved_by || issue.resolved_date) {
      y = ensureSpace(doc, y, 12);
      doc.setTextColor(BRAND_TEAL);
      doc.text(`Resolution: ${issue.resolved_by || '-'}${issue.resolved_date ? ` on ${issue.resolved_date}` : ''}${issue.resolution_action ? ` — ${issue.resolution_action}` : ''}`, 48, y, { maxWidth: doc.internal.pageSize.getWidth() - 96 });
      y += 12;
    }
    y += 4;
  });
  return y;
}

// Horizontal bar chart of issue counts per category.
function categoryChart(doc, issues, startY) {
  let y = startY;
  const counts = {};
  issues.forEach((i) => { const c = i.category || 'Other'; counts[c] = (counts[c] || 0) + 1; });
  const rows = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10);
  if (rows.length === 0) return y;
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40;
  const labelW = 110;
  const barW = pageW - margin * 2 - labelW - 40;
  const max = Math.max(...rows.map((r) => r[1]), 1);
  const rowH = 16;
  rows.forEach(([label, count]) => {
    y = ensureSpace(doc, y, rowH + 2);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(MUTED);
    doc.text(label, margin, y + 8, { maxWidth: labelW - 6 });
    const w = Math.max(4, (count / max) * barW);
    doc.setFillColor('#e8f7f6');
    doc.roundedRect(margin + labelW, y + 2, w, 10, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(DARK);
    doc.text(String(count), margin + labelW + w + 6, y + 10);
    y += rowH;
  });
  return y;
}

export function downloadComplianceIssuesReport(issues, { loggedBy = '', subtitle = 'All documented compliance issues, their resolution, and who resolved them and when.' } = {}) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const counts = { total: issues.length, open: 0, progress: 0, resolved: 0 };
  issues.forEach((i) => {
    if (i.status === 'Open') counts.open += 1;
    else if (i.status === 'In Progress') counts.progress += 1;
    else if (['Resolved', 'Closed'].includes(i.status)) counts.resolved += 1;
  });

  const sorted = [...issues].sort((a, b) => {
    const order = { Open: 0, 'In Progress': 1, Resolved: 2, Closed: 3 };
    return (order[a.status] ?? 4) - (order[b.status] ?? 4);
  });

  header(doc, subtitle);
  let y = statCards(doc, [
    { value: counts.total, label: 'Total Issues', tint: '#f3eef9' },
    { value: counts.open, label: 'Open', tint: '#fff4e5' },
    { value: counts.progress, label: 'In Progress', tint: '#eef4fb' },
    { value: counts.resolved, label: 'Resolved', tint: '#e8f7f6' },
  ], 56);

  y = sectionTitle(doc, 'Issues by Category', y);
  y = categoryChart(doc, sorted, y + 2) + 6;
  y = sectionTitle(doc, 'Issues Register', y);
  y = issueTable(doc, sorted, y);
  y = actionLog(doc, sorted, y + 8);

  if (loggedBy) {
    y = ensureSpace(doc, y + 4, 20);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(MUTED);
    doc.text(`Report prepared by: ${loggedBy}`, 40, y);
  }
  footer(doc);
  doc.save('compliance-issues-report.pdf');
}