import { jsPDF } from 'jspdf';
import { drawCompanyBranding, drawDocumentFooter } from '@/lib/companyBranding';

const BRAND_PURPLE = '#5B2C83';
const BRAND_TEAL = '#00A6A6';
const DARK = '#1f1438';
const MUTED = '#6b6b7b';
const LINE = '#e5e5ea';

function header(doc, title, subtitle) {
  const pageW = doc.internal.pageSize.getWidth();
  // Brand bar
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
  const generated = `Generated: ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Brisbane' })}`;
  doc.text(generated, pageW - 40, 39, { align: 'right' });

  doc.setDrawColor(LINE);
  doc.line(40, 44, pageW - 40, 44);
}

function footer(doc) {
  drawDocumentFooter(doc, {
    title: 'Compliance Audit Report',
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

  // Header row
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

  // Body rows
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
      const txt = cell == null ? '—' : String(cell);
      doc.text(txt, x + 4, y + 9, { maxWidth: scaled[i] - 8 });
      x += scaled[i];
    });
    y += rowH;
  });

  return y + 6;
}

export function downloadRiskReport(risks) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  header(doc, 'Risk Register Report', 'Compliance audit export — risk, hazard and near-miss register');

  const counts = { Low: 0, Medium: 0, High: 0, Critical: 0 };
  risks.forEach((r) => { if (counts[r.rating] != null) counts[r.rating]++; });
  const open = risks.filter((r) => r.status !== 'Closed').length;

  let y = 58;
  y = statCards(doc, [
    { label: 'TOTAL RISKS', value: risks.length, tint: '#eef0f6' },
    { label: 'OPEN', value: open, tint: '#fff4e5' },
    { label: 'HIGH / CRITICAL', value: counts.High + counts.Critical, tint: '#fdeaea' },
    { label: 'LOW', value: counts.Low, tint: '#e8f6ee' },
  ], y);

  y = sectionTitle(doc, 'Risk Register', y);
  y += 4;
  y = table(doc,
    [
      { label: 'Risk', width: 130 },
      { label: 'Type', width: 70 },
      { label: 'Category', width: 100 },
      { label: 'L × C', width: 90 },
      { label: 'Rating', width: 60 },
      { label: 'Status', width: 80 },
      { label: 'Owner', width: 90 },
      { label: 'Identified', width: 70 },
    ],
    risks.map((r) => [
      (r.title || '').slice(0, 60),
      r.report_type || 'Risk',
      r.category || '—',
      `${r.likelihood || '—'} / ${r.consequence || '—'}`,
      r.rating || '—',
      r.status || '—',
      r.owner || '—',
      r.identified_date || '—',
    ]),
    y
  );

  footer(doc);
  doc.save(`Risk-Register-Report.pdf`);
}

export function downloadIncidentReport(incidents) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pageH = doc.internal.pageSize.getHeight();
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40;
  const contentW = pageW - margin * 2;
  const display = (value) => value || 'Not recorded';
  const yesNo = (value) => value ? 'Yes' : 'No';

  incidents.forEach((incident, index) => {
    if (index > 0) doc.addPage();
    const reportTitle = display(incident.title);
    const addReportHeader = (continued = false) => {
      header(doc, continued ? 'Incident Report (continued)' : 'Incident Report', `${reportTitle} — ${display(incident.incident_id)}`);
    };
    addReportHeader();
    let y = 58;

    const ensureSpace = (needed) => {
      if (y + needed > pageH - 38) {
        doc.addPage();
        addReportHeader(true);
        y = 58;
      }
    };

    const writeMetadata = (items) => {
      const gap = 8;
      const boxW = (contentW - gap) / 2;
      for (let i = 0; i < items.length; i += 2) {
        ensureSpace(38);
        items.slice(i, i + 2).forEach(([label, value], column) => {
          const x = margin + column * (boxW + gap);
          doc.setFillColor('#f6f3fa');
          doc.roundedRect(x, y, boxW, 32, 3, 3, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7);
          doc.setTextColor(BRAND_PURPLE);
          doc.text(label.toUpperCase(), x + 8, y + 10);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(DARK);
          doc.text(String(display(value)), x + 8, y + 23, { maxWidth: boxW - 16 });
        });
        y += 38;
      }
    };

    const writeNarrative = (label, value) => {
      const lines = doc.splitTextToSize(String(display(value)), contentW);
      let offset = 0;
      while (offset < lines.length) {
        ensureSpace(30);
        y = sectionTitle(doc, offset === 0 ? label : `${label} (continued)`, y);
        const availableLines = Math.max(1, Math.floor((pageH - 38 - (y + 5)) / 11));
        const chunk = lines.slice(offset, offset + availableLines);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(DARK);
        doc.text(chunk, margin, y + 5);
        y += chunk.length * 11 + 16;
        offset += chunk.length;
        if (offset < lines.length) {
          doc.addPage();
          addReportHeader(true);
          y = 58;
        }
      }
    };

    writeMetadata([
      ['Incident ID', incident.incident_id],
      ['Status', incident.status],
      ['Severity', incident.severity],
      ['Category', incident.category],
      ['Date occurred', incident.date_occurred],
      ['Time occurred', incident.time_occurred],
      ['Location', incident.location],
      ['Date reported', incident.date_reported],
      ['Reported by', incident.reported_by],
      ['Received by', incident.received_by],
      ['Participant', incident.participant_name || incident.participant_id],
      ['Staff involved', incident.staff_name || incident.staff_id],
      ['NDIS report required', yesNo(incident.requires_ndis_report)],
      ['Police notified', yesNo(incident.requires_police)],
    ]);
    y += 4;
    writeNarrative('Incident Description', incident.description);
    writeNarrative('Immediate Actions Taken', incident.immediate_actions);
    writeNarrative('Risks / Hazards Identified', incident.hazards_identified);
    writeNarrative('Risk Assessment', incident.risk_assessment);
    writeNarrative('Control Measures', incident.control_measures);
  });

  footer(doc);
  doc.save(incidents.length === 1
    ? `Incident-Report-${incidents[0].incident_id || 'Record'}.pdf`
    : 'Incident-Report-Pack.pdf');
}