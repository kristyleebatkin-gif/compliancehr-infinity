// Multi-format Board Pack Exporter for CareSphere SME-GARM
// Supports: PDF, Word (.doc), PowerPoint (.ppt HTML presentation deck), and Power BI (.pbids / Fabric Semantic JSON)

import { jsPDF } from 'jspdf';
import {
  CONSTITUTIONAL_PRINCIPLE,
  MANDATORY_CLOSING_STATEMENT,
  MANDATORY_EXECUTIVE_KPIS,
  BOARD_PACK_25_SLIDES,
  MICROSOFT_FABRIC_MODEL,
} from '@/lib/careSphereSmeGarmData';

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function exportBoardPackPdf({
  orgHealthIndex = 90.0,
  omegaReadinessIndex = 90.4,
  lqiScore = 93.4,
  resolutions = [],
} = {}) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  BOARD_PACK_25_SLIDES.forEach((slide, idx) => {
    if (idx > 0) doc.addPage();

    // Midnight Command Background
    doc.setFillColor(8, 16, 24);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Top Cyan Header Strip
    doc.setFillColor(57, 230, 255);
    doc.rect(0, 0, pageWidth, 6, 'F');

    // Slide Header Card
    doc.setFillColor(22, 34, 53);
    doc.roundedRect(28, 22, pageWidth - 56, 66, 8, 8, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(57, 230, 255);
    doc.text(
      `CARESPHERE SME-GARM BOARD PACK · SLIDE ${slide.slide} OF ${BOARD_PACK_25_SLIDES.length} · ${slide.committee.toUpperCase()}`,
      42,
      42
    );

    doc.setFontSize(17);
    doc.setTextColor(255, 255, 255);
    doc.text(slide.title, 42, 64);

    doc.setFontSize(10);
    doc.setTextColor(34, 197, 94);
    doc.text(slide.metricSummary, 42, 80);

    // Constitutional Telemetry Strip
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(28, 102, pageWidth - 56, 48, 6, 6, 'F');
    doc.setFontSize(9);
    doc.setTextColor(57, 230, 255);
    doc.text(
      `LIVE TELEMETRY: GEI 91.4  |  OHI ${orgHealthIndex}  |  Ω∞ READINESS ${omegaReadinessIndex} (Ω∞ READY)  |  BRI 88.6% ($4.82M)  |  ASSURANCE 94.1%  |  LQI ${lqiScore}%`,
      42,
      130
    );

    // Speaker Note Standard Cards (What the Board Needs to Know / Why It Matters / Decision Required)
    const boxes = [
      {
        label: 'WHAT THE BOARD NEEDS TO KNOW (EXECUTIVE SUMMARY)',
        body: slide.whatBoardNeedsToKnow,
        y: 166,
        accent: [57, 230, 255],
      },
      {
        label: 'WHY IT MATTERS (STRATEGIC & CONSTITUTIONAL IMPLICATIONS)',
        body: slide.whyItMatters,
        y: 256,
        accent: [34, 197, 94],
      },
      {
        label: `DECISION REQUIRED: ${slide.decisionRequired.toUpperCase()}`,
        body: `Formal Board Determination: [${slide.decisionRequired}] — Governed under CareSphere SME-GARM Constitutional Chain (Purpose → Ownership → Evidence → Controls → Measurement → Assurance → Benefits → Readiness → Enterprise Value).`,
        y: 346,
        accent: [251, 191, 36],
      },
    ];

    boxes.forEach((b) => {
      doc.setFillColor(22, 34, 53);
      doc.roundedRect(28, b.y, pageWidth - 56, 76, 6, 6, 'F');
      doc.setFillColor(b.accent[0], b.accent[1], b.accent[2]);
      doc.rect(28, b.y, 5, 76, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(b.accent[0], b.accent[1], b.accent[2]);
      doc.text(b.label, 44, b.y + 22);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      const wrapped = doc.splitTextToSize(b.body, pageWidth - 96);
      doc.text(wrapped, 44, b.y + 44);
    });

    // Mandatory Constitutional Closing Footer on every slide
    doc.setFillColor(22, 34, 53);
    doc.rect(0, pageHeight - 54, pageWidth, 54, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(57, 230, 255);
    doc.text(CONSTITUTIONAL_PRINCIPLE, 28, pageHeight - 32);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(203, 213, 225);
    const closingLines = doc.splitTextToSize(MANDATORY_CLOSING_STATEMENT, pageWidth - 56);
    doc.text(closingLines.slice(0, 2), 28, pageHeight - 18);
  });

  doc.save('CareSphere_SME_GARM_25_Slide_Board_Pack.pdf');
}

export function exportBoardPackWord({
  orgHealthIndex = 90.0,
  omegaReadinessIndex = 90.4,
  lqiScore = 93.4,
} = {}) {
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>CareSphere SME-GARM Board Pack</title>
<style>
  body { font-family: Calibri, Arial, sans-serif; background: #081018; color: #FFFFFF; padding: 24px; }
  .banner { background: #162235; border-left: 6px solid #39E6FF; padding: 16px; margin-bottom: 20px; }
  h1 { color: #39E6FF; margin: 0 0 8px 0; }
  h2 { color: #39E6FF; border-bottom: 1px solid #1E293B; padding-bottom: 6px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; background: #162235; }
  th, td { border: 1px solid #1E293B; padding: 8px 10px; text-align: left; font-size: 11pt; color: #FFFFFF; }
  th { background: #1E293B; color: #39E6FF; }
  .slide { background: #162235; border: 1px solid #1E293B; padding: 16px; margin-bottom: 16px; page-break-inside: avoid; }
  .note-label { color: #39E6FF; font-weight: bold; font-size: 10pt; text-transform: uppercase; margin-top: 8px; }
  .closing { background: #1E293B; border-top: 3px solid #39E6FF; padding: 16px; margin-top: 28px; font-weight: bold; }
</style>
</head>
<body>
  <div class="banner">
    <h1>CareSphere Senior Master Enterprise Governance, Assurance & Readiness Management System (SME-GARM)</h1>
    <p><strong>Constitutional Principle:</strong> ${CONSTITUTIONAL_PRINCIPLE}</p>
    <p><strong>Live Composite Indices:</strong> GEI: 91.4 | Organisation Health: ${orgHealthIndex} | Ω∞ Readiness: ${omegaReadinessIndex} (Ω∞ Ready) | LQI: ${lqiScore}%</p>
  </div>

  <h2>Executive KPI Scorecard</h2>
  <table>
    <thead>
      <tr><th>KPI</th><th>Target</th><th>Current</th><th>Trend</th><th>Accountable Owner</th><th>Evidence Source</th></tr>
    </thead>
    <tbody>
      ${MANDATORY_EXECUTIVE_KPIS.map(
        (k) =>
          `<tr><td><strong>${k.label}</strong></td><td>${k.targetDisplay}</td><td>${k.value} ${k.unit}</td><td>${k.trend}</td><td>${k.owner}</td><td>${k.evidence}</td></tr>`
      ).join('')}
    </tbody>
  </table>

  <h2>25-Section Board Pack & Speaker Notes</h2>
  ${BOARD_PACK_25_SLIDES.map(
    (s) => `
    <div class="slide">
      <h3>Slide ${s.slide}: ${s.title} (${s.committee})</h3>
      <p><strong>Key Metric:</strong> ${s.metricSummary}</p>
      <div class="note-label">What the Board Needs to Know</div>
      <p>${s.whatBoardNeedsToKnow}</p>
      <div class="note-label">Why It Matters</div>
      <p>${s.whyItMatters}</p>
      <div class="note-label">Decision Required</div>
      <p><strong>[${s.decisionRequired.toUpperCase()}]</strong></p>
    </div>`
  ).join('')}

  <div class="closing">
    ${MANDATORY_CLOSING_STATEMENT}
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'application/msword;charset=utf-8' });
  triggerDownload(blob, 'CareSphere_SME_GARM_Board_Pack.doc');
}

export function exportBoardPackPowerPoint({
  orgHealthIndex = 90.0,
  omegaReadinessIndex = 90.4,
  lqiScore = 93.4,
} = {}) {
  const deckHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>CareSphere SME-GARM 25-Slide Board Presentation Deck</title>
<style>
  body { margin: 0; font-family: 'Segoe UI', Arial, sans-serif; background: #081018; color: #FFFFFF; }
  .slide { width: 1120px; min-height: 630px; margin: 24px auto; background: #162235; border: 2px solid #39E6FF; border-radius: 14px; padding: 32px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; page-break-after: always; }
  .top { border-bottom: 1px solid #1E293B; padding-bottom: 14px; }
  .eyebrow { color: #39E6FF; font-size: 12px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
  h1 { margin: 8px 0 6px; font-size: 28px; color: #FFFFFF; }
  .metric { color: #22C55E; font-weight: 700; font-size: 15px; }
  .grid { display: grid; grid-template-columns: 1fr; gap: 14px; margin: 18px 0; }
  .card { background: #1E293B; border-left: 5px solid #39E6FF; border-radius: 8px; padding: 14px 18px; }
  .card h4 { margin: 0 0 6px; color: #39E6FF; font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; }
  .card p { margin: 0; font-size: 15px; line-height: 1.45; color: #FFFFFF; }
  .footer { border-top: 1px solid #1E293B; padding-top: 12px; font-size: 11px; color: #94A3B8; }
  .footer strong { color: #39E6FF; display: block; margin-bottom: 4px; }
</style>
</head>
<body>
  ${BOARD_PACK_25_SLIDES.map(
    (s) => `
    <section class="slide">
      <div class="top">
        <div class="eyebrow">CareSphere SME-GARM · Slide ${s.slide} of 25 · ${s.committee}</div>
        <h1>${s.title}</h1>
        <div class="metric">${s.metricSummary} | OHI ${orgHealthIndex} | Ω∞ ${omegaReadinessIndex} | LQI ${lqiScore}%</div>
      </div>
      <div class="grid">
        <div class="card">
          <h4>Speaker Note 1 — What the Board Needs to Know</h4>
          <p>${s.whatBoardNeedsToKnow}</p>
        </div>
        <div class="card" style="border-left-color:#22C55E">
          <h4 style="color:#22C55E">Speaker Note 2 — Why It Matters</h4>
          <p>${s.whyItMatters}</p>
        </div>
        <div class="card" style="border-left-color:#FBBF24">
          <h4 style="color:#FBBF24">Speaker Note 3 — Decision Required: ${s.decisionRequired.toUpperCase()}</h4>
          <p>Board Action: <strong>${s.decisionRequired}</strong> under the CareSphere Constitutional Operating Chain.</p>
        </div>
      </div>
      <div class="footer">
        <strong>${CONSTITUTIONAL_PRINCIPLE}</strong>
        ${MANDATORY_CLOSING_STATEMENT}
      </div>
    </section>`
  ).join('')}
</body>
</html>`;

  const blob = new Blob([deckHtml], { type: 'application/vnd.ms-powerpoint;charset=utf-8' });
  triggerDownload(blob, 'CareSphere_SME_GARM_25_Slide_Deck.ppt');
}

export function exportPowerBiSemanticModel({
  orgHealthIndex = 90.0,
  omegaReadinessIndex = 90.4,
  lqiScore = 93.4,
} = {}) {
  const payload = {
    version: '1.0',
    platform: 'CareSphere SME-GARM Microsoft Fabric & Power BI DirectLake Semantic Model',
    constitutionalPrinciple: CONSTITUTIONAL_PRINCIPLE,
    closingStatement: MANDATORY_CLOSING_STATEMENT,
    generatedAt: new Date().toISOString(),
    architecturePipeline: MICROSOFT_FABRIC_MODEL.pipeline,
    factTables: MICROSOFT_FABRIC_MODEL.factTables,
    dimensions: MICROSOFT_FABRIC_MODEL.dimensions,
    daxMeasures: {
      GovernanceEffectivenessIndex: 91.4,
      OrganisationHealthIndex: orgHealthIndex,
      OmegaInfinityReadinessIndex: omegaReadinessIndex,
      BenefitsRealisationIndex: 88.6,
      AssuranceConfidenceScore: 94.1,
      LineageQualityIndex: lqiScore,
      ComplianceRate: 97.2,
      ControlEffectiveness: 92.8,
      CorrectiveActionClosureRate: 96.5,
    },
    executiveKpis: MANDATORY_EXECUTIVE_KPIS,
    boardPackSlides: BOARD_PACK_25_SLIDES,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
  triggerDownload(blob, 'CareSphere_Fabric_PowerBI_SemanticModel.pbids.json');
}