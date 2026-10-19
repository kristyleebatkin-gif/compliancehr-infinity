// Board-ready monthly compliance report (PDF) with KPIs, charts and attention items.
import { jsPDF } from 'jspdf';
import { base44 } from '@/api/base44Client';
import { loadCompanyBranding, drawCompanyBranding, drawDocumentFooter } from '@/lib/companyBranding';

const PURPLE = '#5B2C83';
const TEAL = '#00A6A6';
const DARK = '#1f1438';
const MUTED = '#6b6b7b';
const LINE = '#e5e5ea';

const todayStr = () => new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });

function header(doc, title, subtitle) {
  const pageW = doc.internal.pageSize.getWidth();
  doc.setFillColor(PURPLE);
  doc.rect(0, 0, pageW, 4, 'F');
  doc.setFillColor(TEAL);
  doc.rect(0, 4, pageW, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(DARK);
  doc.text(title, 40, 28);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(MUTED);
  doc.text(subtitle, 40, 38);
  drawCompanyBranding(doc, pageW - 190, 28, { fontSize: 10, logoSize: 18, maxWidth: 126 });
  doc.setDrawColor(LINE);
  doc.line(40, 44, pageW - 40, 44);
}

function statCards(doc, stats, y) {
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40; const gap = 8;
  const cardW = (pageW - margin * 2 - gap * (stats.length - 1)) / stats.length;
  stats.forEach((s, i) => {
    const x = margin + i * (cardW + gap);
    doc.setFillColor('#f6f2fb');
    doc.roundedRect(x, y, cardW, 26, 3, 3, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(15); doc.setTextColor(DARK);
    doc.text(String(s.value), x + 8, y + 12);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(MUTED);
    doc.text(s.label.slice(0, 22), x + 8, y + 21);
  });
}

// Simple horizontal bar chart.
function barChart(doc, title, rows, y) {
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40; const chartW = pageW - margin * 2;
  const colors = { Low: '#34d399', Medium: '#fbbf24', High: '#fb923c', Critical: '#f87171', Open: '#f87171', 'In Progress': '#fbbf24', Resolved: '#34d399', Closed: '#94a3b8', Current: '#34d399', 'Expiring Soon': '#fbbf24', Expired: '#f87171', Revoked: '#94a3b8' };
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(DARK);
  doc.text(title, margin, y);
  const max = Math.max(1, ...rows.map((r) => r.value));
  let cy = y + 9;
  const barX = margin + 110;
  const barMax = chartW - 130;
  rows.forEach((r) => {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(DARK);
    doc.text(String(r.label), margin, cy + 5);
    const w = Math.max(2, (r.value / max) * barMax);
    doc.setFillColor(colors[r.label] || PURPLE);
    doc.roundedRect(barX, cy, w, 7, 2, 2, 'F');
    doc.text(String(r.value), barX + w + 5, cy + 5.5);
    cy += 13;
  });
  return cy + 4;
}

function sectionTitle(doc, text, y) {
  doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(PURPLE);
  doc.text(text, 40, y);
  return y + 7;
}

function simpleTable(doc, cols, rows, y) {
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40;
  const colW = (pageW - margin * 2) / cols.length;
  doc.setFillColor('#f6f2fb');
  doc.rect(margin, y, pageW - margin * 2, 10, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(DARK);
  cols.forEach((c, i) => doc.text(c, margin + i * colW + 4, y + 7));
  doc.setFont('helvetica', 'normal');
  let cy = y + 10;
  rows.forEach((r) => {
    if (cy > 800) { doc.addPage(); cy = 50; }
    doc.setFontSize(8.5); doc.setTextColor('#333');
    r.forEach((cell, i) => doc.text(String(cell ?? '').slice(0, 42), margin + i * colW + 4, cy + 6));
    doc.setDrawColor(LINE);
    doc.line(margin, cy + 9, pageW - margin, cy + 9);
    cy += 10;
  });
  return cy + 6;
}

export async function generateBoardReportPdf() {
  const branding = await loadCompanyBranding();
  const today = todayStr();
  const year = new Date().getFullYear();

  const [kpis, issues, incidents, risks, certificates, policies, tasks] = await Promise.all([
    base44.entities.KPI.list({ limit: 50 }).then((p) => p.items || []).catch(() => []),
    base44.entities.ComplianceIssue.list({ limit: 500 }).then((p) => p.items || []).catch(() => []),
    base44.entities.Incident.list({ limit: 500 }).then((p) => p.items || []).catch(() => []),
    base44.entities.Risk.list({ limit: 500 }).then((p) => p.items || []).catch(() => []),
    base44.entities.Certificate.list({ limit: 500 }).then((p) => p.items || []).catch(() => []),
    base44.entities.Policy.list({ limit: 500 }).then((p) => p.items || []).catch(() => []),
    base44.entities.TodoTask.list({ limit: 500 }).then((p) => p.items || []).catch(() => []),
  ]);

  const countBy = (arr, key, labels) =>
    labels.map((label) => ({ label, value: arr.filter((x) => (x[key] || '').toLowerCase() === label.toLowerCase()).length }));

  const openIssues = issues.filter((i) => ['Open', 'In Progress'].includes(i.status));
  const criticalIncidents = incidents.filter((i) => ['High', 'Critical'].includes(i.severity));
  const highRisks = risks.filter((r) => ['High', 'Critical'].includes(r.rating));
  const expiredCerts = certificates.filter((c) => c.status === 'Expired');
  const overduePolicies = policies.filter((p) => p.review_date && p.review_date < new Date().toISOString().slice(0, 10) && p.status !== 'Archived');
  const overdueTasks = tasks.filter((t) => t.due_date && t.due_date < new Date().toISOString().slice(0, 10) && !['Completed', 'Finalised', 'Cancelled'].includes(t.status));

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();

  // Cover
  doc.setFillColor(PURPLE); doc.rect(0, 0, pageW, 180, 'F');
  doc.setFillColor(TEAL); doc.rect(0, 180, pageW, 6, 'F');
  doc.setTextColor('#ffffff'); doc.setFont('helvetica', 'bold'); doc.setFontSize(26);
  doc.text('Monthly Compliance Report', 40, 90);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(12);
  doc.text(`Board briefing - ${today}`, 40, 115);
  if (branding?.name) doc.text(branding.name, 40, 138);
  doc.setTextColor(DARK);

  let y = sectionTitle(doc, 'Executive summary', 220);
  statCards(doc, [
    { label: 'KPIs on / above target', value: kpis.filter((k) => ['On Track', 'Exceeded'].includes(k.status)).length },
    { label: 'Open compliance issues', value: openIssues.length },
    { label: 'High / critical incidents', value: criticalIncidents.length },
    { label: 'High / critical risks', value: highRisks.length },
  ], y);
  statCards(doc, [
    { label: 'Expired certificates', value: expiredCerts.length },
    { label: 'Policies overdue review', value: overduePolicies.length },
    { label: 'Overdue tasks', value: overdueTasks.length },
    { label: 'Active policies', value: policies.filter((p) => p.status === 'Active').length },
  ], y + 34);

  y = sectionTitle(doc, 'Key performance indicators', y + 80);
  const kpiRows = kpis.slice(0, 12).map((k) => [
    k.title || 'KPI',
    `${k.current ?? '-'}${k.unit ? ` ${k.unit}` : ''}`,
    `${k.target ?? '-'}`,
    k.status || '-',
  ]);
  y = simpleTable(doc, ['KPI', 'Current', 'Target', 'Status'], kpiRows, y);

  y = sectionTitle(doc, 'Risks by rating', y + 4);
  y = barChart(doc, '', countBy(risks, 'rating', ['Low', 'Medium', 'High', 'Critical']), y);

  y = sectionTitle(doc, 'Incidents by severity (all records)', y + 4);
  y = barChart(doc, '', countBy(incidents, 'severity', ['Low', 'Medium', 'High', 'Critical']), y);

  y = sectionTitle(doc, 'Compliance issues by status', y + 4);
  y = barChart(doc, '', countBy(issues, 'status', ['Open', 'In Progress', 'Resolved', 'Closed']), y);

  // Attention items
  doc.addPage();
  header(doc, 'Attention items', `Board action list - generated ${today}`);
  const attention = [
    ...openIssues.slice(0, 6).map((i) => ['Issue', i.title || 'Untitled', i.priority || '-', i.status]),
    ...criticalIncidents.slice(0, 6).map((i) => ['Incident', i.title || 'Untitled', i.severity || '-', i.status]),
    ...highRisks.slice(0, 6).map((r) => ['Risk', r.title || 'Untitled', r.rating || '-', r.status || '-']),
    ...overduePolicies.slice(0, 4).map((p) => ['Policy review', p.document_name || 'Untitled', '-', p.review_date]),
    ...overdueTasks.slice(0, 4).map((t) => ['Task', t.title || 'Untitled', '-', t.due_date]),
  ];
  simpleTable(doc, ['Type', 'Item', 'Level', 'Status / due'], attention, 56);

  drawDocumentFooter(doc);
  doc.save(`board-compliance-report-${year}-${String(new Date().getMonth() + 1).padStart(2, '0')}.pdf`);
}