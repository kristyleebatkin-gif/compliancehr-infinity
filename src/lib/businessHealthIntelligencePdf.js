import { jsPDF } from 'jspdf';

/**
 * Generates an A4 Executive Business Health & Compliance Intelligence Report PDF.
 */
export function downloadBusinessHealthIntelligencePdf({
  overallScore = 98.7,
  domains = [],
  kpis = [],
  predictiveAlerts = [],
  organisation = 'ComplianceHR Infinity',
} = {}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  const H = 297;
  const M = 10;
  const contentW = W - M * 2;

  // Outer Frame
  doc.setDrawColor(109, 40, 217);
  doc.setLineWidth(0.5);
  doc.rect(M - 2, M - 2, W - (M - 2) * 2, H - (M - 2) * 2, 'S');

  // Header Banner (Blue -> Purple -> Pink)
  doc.setFillColor(37, 99, 235);
  doc.rect(M, M, contentW * 0.45, 22, 'F');
  doc.setFillColor(124, 58, 237);
  doc.rect(M + contentW * 0.45, M, contentW * 0.15, 22, 'F');
  doc.setFillColor(236, 72, 153);
  doc.rect(M + contentW * 0.6, M, contentW * 0.4, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(`${organisation.toUpperCase()} · EXECUTIVE BOARD & AUDITOR INTELLIGENCE PACK`, M + 3, M + 5.5);
  doc.setFontSize(13);
  doc.text('BUSINESS HEALTH & COMPLIANCE INTELLIGENCE REPORT (2026)', M + 3, M + 12.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(
    `Generated: ${new Date().toISOString().slice(0, 10)} · Scope: All 45 Connected Modules, 17 Audit Categories & 8 Intelligence Domains`,
    M + 3,
    M + 18.5
  );

  // Overall Score Badge on right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`${overallScore}%`, W - M - 4, M + 11, { align: 'right' });
  doc.setFontSize(7);
  doc.text('OVERALL HEALTH SCORE', W - M - 4, M + 16.5, { align: 'right' });

  let y = M + 25;

  // Section 1: Executive KPI Strip
  doc.setFillColor(79, 70, 229);
  doc.rect(M, y, contentW, 5.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('1. EXECUTIVE BUSINESS HEALTH & NDIS SAFEGUARD KPI SNAPSHOT', M + 2.5, y + 3.9);
  y += 6.5;

  const kpiCols = 3;
  const kpiW = contentW / kpiCols;
  const kpiH = 14;
  kpis.slice(0, 6).forEach((k, idx) => {
    const col = idx % kpiCols;
    const row = Math.floor(idx / kpiCols);
    const kx = M + col * kpiW;
    const ky = y + row * kpiH;

    doc.setFillColor(250, 249, 255);
    doc.setDrawColor(195, 190, 230);
    doc.rect(kx, ky, kpiW, kpiH, 'FD');

    doc.setTextColor(88, 28, 135);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.text(String(k.label || '').toUpperCase(), kx + 2.5, ky + 4.2);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10.5);
    doc.text(String(k.value || ''), kx + 2.5, ky + 9.5);

    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.text(String(k.sub || '').slice(0, 42), kx + 2.5, ky + 12.8);
  });

  y += Math.ceil(Math.min(kpis.length, 6) / kpiCols) * kpiH + 4;

  // Section 2: 8-Domain Business Health & Compliance Intelligence Matrix
  doc.setFillColor(124, 58, 237);
  doc.rect(M, y, contentW, 5.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('2. 8-PILLAR DEPARTMENTAL HEALTH & 2026 NDIS AUDIT READINESS MATRIX', M + 2.5, y + 3.9);
  y += 5.5;

  // Table header
  doc.setFillColor(240, 244, 255);
  doc.setDrawColor(190, 190, 220);
  doc.rect(M, y, contentW, 5.5, 'FD');
  doc.setTextColor(30, 27, 75);
  doc.setFontSize(6.5);
  doc.text('INTELLIGENCE DOMAIN', M + 2.5, y + 3.8);
  doc.text('SCORE', M + 68, y + 3.8);
  doc.text('STATUS', M + 84, y + 3.8);
  doc.text('LIVE METRIC / VERIFIED EVIDENCE', M + 112, y + 3.8);
  y += 5.5;

  domains.forEach((d, idx) => {
    const rowH = 9.5;
    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 247, 255);
    doc.setDrawColor(210, 210, 230);
    doc.rect(M, y, contentW, rowH, 'FD');

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(String(d.name || '').slice(0, 38), M + 2.5, y + 4.2);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(88, 28, 135);
    doc.text(String(d.standard || '').slice(0, 42), M + 2.5, y + 7.8);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(`${d.score}%`, M + 68, y + 5.8);

    doc.setFontSize(6.5);
    doc.setTextColor(22, 101, 52);
    doc.text(String(d.status || 'Audit Ready'), M + 84, y + 5.8);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text(`${d.metricLabel}: ${d.metricValue} · ${d.detail}`.slice(0, 52), M + 112, y + 5.8);

    y += rowH;
  });

  y += 4;

  // Section 3: Predictive Risk, Credential & Review Radar (30/60/90-Day Horizon)
  doc.setFillColor(219, 39, 119);
  doc.rect(M, y, contentW, 5.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('3. PREDICTIVE RISK, CREDENTIAL EXPIRY & STATUTORY SLA RADAR', M + 2.5, y + 3.9);
  y += 5.5;

  predictiveAlerts.slice(0, 6).forEach((al, idx) => {
    const rowH = 8.2;
    doc.setFillColor(idx % 2 === 0 ? 255 : 253, 248, 252);
    doc.setDrawColor(220, 200, 225);
    doc.rect(M, y, contentW, rowH, 'FD');

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.text(`[${al.horizon}] ${al.title}`, M + 2.5, y + 3.8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.3);
    doc.setTextColor(71, 85, 105);
    doc.text(`Action: ${al.action}  |  Owner: ${al.owner}`, M + 2.5, y + 7);
    y += rowH;
  });

  y += 4;

  // Section 4: Executive Board & Auditor Sign-Off
  doc.setFillColor(22, 163, 74);
  doc.rect(M, y, contentW, 5.2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.text('4. EXECUTIVE GOVERNANCE ATTESTATION & BOARD SIGN-OFF', M + 2.5, y + 3.7);
  y += 5.2;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(190, 190, 220);
  doc.rect(M, y, contentW, 20, 'FD');
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.text(
    'We attest that the Business Health & Compliance Intelligence indicators above reflect verified operational records across',
    M + 3,
    y + 5
  );
  doc.text(
    'Governance, HR Screening, Participant Consents, WHS/Incidents, Emergency Drills, Finance, and Quality Management.',
    M + 3,
    y + 9
  );
  doc.setFont('helvetica', 'bold');
  doc.text(
    'Director / Provider Admin Signature: _____________________________    Date: ____/____/2026',
    M + 3,
    y + 16.5
  );
  doc.text(
    'Compliance Manager Signature: _____________________________          Date: ____/____/2026',
    M + 105,
    y + 16.5
  );

  // Footer
  doc.setTextColor(88, 28, 135);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.3);
  doc.text(
    'CHR-INT-2026 · ComplianceHR Infinity Business Health & Compliance Intelligence Suite · Complete Control. Greater Confidence. Brighter Success.',
    M,
    H - 5
  );

  doc.save('ComplianceHR-2026-Business-Health-Compliance-Intelligence-Report.pdf');
}