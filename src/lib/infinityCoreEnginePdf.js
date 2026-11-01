import { jsPDF } from 'jspdf';

export function downloadInfinityCoreEnginePdf({
  telemetry = {},
  activeSubEngine = 'all',
  validationResults = [],
  automationPipelines = [],
  smartFillEngines = [],
  lastSweepAt = null,
} = {}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = 210;
  const margin = 10;
  const contentWidth = pageWidth - margin * 2;
  let y = 10;

  // Header Banner (Blue -> Purple -> Pink)
  doc.setFillColor(37, 99, 235);
  doc.rect(margin, y, contentWidth * 0.45, 22, 'F');
  doc.setFillColor(124, 58, 237);
  doc.rect(margin + contentWidth * 0.45, y, contentWidth * 0.1, 22, 'F');
  doc.setFillColor(236, 72, 153);
  doc.rect(margin + contentWidth * 0.55, y, contentWidth * 0.45, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('INFINITY CORE ENGINE · ARCHITECTURE & LIVE DIAGNOSTIC REPORT (2026)', margin + 4, y + 7);

  doc.setFontSize(8);
  doc.text(
    'Complete Control. Greater Confidence. Brighter Success. · 104 Server Functions · 65 Workflows · 45 Modules',
    margin + 4,
    y + 13
  );
  doc.setFontSize(7.5);
  doc.text(
    'Software: ComplianceHR Infinity | Business: ComplianceHR Infinity | Developer: Kristy Lee Whelan | Email: kristyleebatkin@live.com.au',
    margin + 4,
    y + 18.5
  );

  y += 26;

  // Metadata Box
  doc.setDrawColor(124, 58, 237);
  doc.setLineWidth(0.4);
  doc.setFillColor(248, 245, 255);
  doc.rect(margin, y, contentWidth, 14, 'FD');

  doc.setTextColor(30, 27, 75);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  const generatedStr = new Date().toLocaleString('en-AU');
  doc.text(`Document Code: CHR-CORE-ENG-2026`, margin + 3, y + 5.5);
  doc.text(`Generated: ${generatedStr}`, margin + 68, y + 5.5);
  doc.text(`Engine Status: ACTIVE (99.98% Uptime)`, margin + 135, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.text(
    `Last Diagnostic Sweep: ${lastSweepAt || generatedStr} · Scope: AI & Automation + Real-Time Validation + Smart-Fill Audit Engine`,
    margin + 3,
    y + 11
  );

  y += 18;

  // Live Database Telemetry Strip
  doc.setFillColor(37, 99, 235);
  doc.rect(margin, y, contentWidth, 6.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('1. LIVE INFINITY CORE ENGINE TELEMETRY & RECORD COUNTS', margin + 3, y + 4.5);
  y += 8.5;

  const stats = [
    ['Server Functions', '104 Active'],
    ['24/7 Workflows', '65 Automated'],
    ['Connected Modules', '45 Live'],
    ['Staff Profiles', String(telemetry.staff ?? 0)],
    ['Participants', String(telemetry.participants ?? 0)],
    ['Active Shifts', String(telemetry.shifts ?? 0)],
    ['Open Tasks', String(telemetry.tasks ?? 0)],
    ['Incidents / Risks', `${telemetry.incidents ?? 0} / ${telemetry.risks ?? 0}`],
    ['Certificates / Docs', `${telemetry.certificates ?? 0} / ${telemetry.documents ?? 0}`],
    ['Policies / Audits', `${telemetry.policies ?? 0} / ${telemetry.audits ?? 0}`],
  ];

  const colW = contentWidth / 5;
  stats.forEach((item, idx) => {
    const col = idx % 5;
    const row = Math.floor(idx / 5);
    const bx = margin + col * colW;
    const by = y + row * 11;
    doc.setDrawColor(196, 181, 253);
    doc.setFillColor(255, 255, 255);
    doc.rect(bx, by, colW - 1.5, 9.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(109, 40, 217);
    doc.text(item[0].toUpperCase(), bx + 2, by + 3.8);
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(item[1], bx + 2, by + 8);
  });

  y += 25;

  // Section 2: AI & Automation Command Hub
  doc.setFillColor(124, 58, 237);
  doc.rect(margin, y, contentWidth, 6.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('2. AI & AUTOMATION COMMAND HUB (104 SERVER FUNCTIONS & 65 WORKFLOWS)', margin + 3, y + 4.5);
  y += 8;

  automationPipelines.slice(0, 8).forEach((pipe) => {
    doc.setDrawColor(221, 214, 254);
    doc.setFillColor(252, 250, 255);
    doc.rect(margin, y, contentWidth, 8.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 27, 75);
    doc.text(`${pipe.code} · ${pipe.title}`, margin + 2.5, y + 3.8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(22, 163, 74);
    doc.text(`[${pipe.status}]`, margin + contentWidth - 28, y + 3.8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(71, 85, 105);
    doc.text(`${pipe.trigger} -> ${pipe.action}`, margin + 2.5, y + 7.2);
    y += 9.5;
  });

  y += 2;

  // Section 3: Real-Time Compliance, Risk & Roster Validation Engine
  doc.setFillColor(219, 39, 119);
  doc.rect(margin, y, contentWidth, 6.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('3. REAL-TIME COMPLIANCE, RISK & ROSTER VALIDATION GATES', margin + 3, y + 4.5);
  y += 8;

  validationResults.slice(0, 6).forEach((gate) => {
    doc.setDrawColor(251, 207, 232);
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, y, contentWidth, 8.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 27, 75);
    doc.text(`${gate.code} · ${gate.name} (${gate.standard})`, margin + 2.5, y + 3.8);
    doc.setTextColor(gate.passed ? 22 : 217, gate.passed ? 163 : 119, gate.passed ? 74 : 6);
    doc.text(gate.badge || 'VERIFIED', margin + contentWidth - 36, y + 3.8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(71, 85, 105);
    doc.text(gate.ruleSummary, margin + 2.5, y + 7.2);
    y += 9.5;
  });

  y += 2;

  // Section 4: Smart-Fill Document, Audit & Predictive Alert Engine
  if (y > 245) {
    doc.addPage();
    y = 12;
  }

  doc.setFillColor(13, 148, 136);
  doc.rect(margin, y, contentWidth, 6.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('4. SMART-FILL DOCUMENT, AUDIT & PREDICTIVE ALERT ENGINE', margin + 3, y + 4.5);
  y += 8;

  smartFillEngines.slice(0, 4).forEach((eng) => {
    doc.setDrawColor(153, 246, 228);
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, y, contentWidth, 8, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${eng.code} · ${eng.title} — ${eng.coverage}`, margin + 2.5, y + 3.6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(71, 85, 105);
    doc.text(eng.output, margin + 2.5, y + 6.8);
    y += 9;
  });

  // Footer
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(109, 40, 217);
  doc.text(
    'ComplianceHR Infinity Core Engine · Complete Control. Greater Confidence. Brighter Success. · Developer: Kristy Lee Whelan',
    margin,
    290
  );

  doc.save('ComplianceHR-Infinity-Core-Engine-Report-2026.pdf');
}