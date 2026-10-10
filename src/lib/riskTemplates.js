import { jsPDF } from 'jspdf';
import { drawCompanyBranding, drawDocumentFooter } from '@/lib/companyBranding';

const BRAND = [91, 44, 131];

export function downloadTake5AssessmentPdf() {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 40;
  let y = 44;
  const ensureSpace = (height) => {
    if (y + height <= pageH - 36) return;
    doc.addPage();
    y = 44;
  };

  // Header
  drawCompanyBranding(doc, margin, y, { fontSize: 13 });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(130);
  doc.text('COMPLIANCE MANAGEMENT PLATFORM', margin, y + 11);
  y += 24;

  // Red banner title
  doc.setFillColor(220, 38, 38);
  doc.rect(margin, y, pageW - margin * 2, 30, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255);
  doc.text('TAKE 5 — Risk Assessment', margin + 10, y + 19);
  y += 44;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(110);
  doc.text('Stop. Look. Assess. Control. — Complete before starting any new or non-routine task.', margin, y);
  y += 16;

  const fieldRow = (label, width = pageW - margin * 2) => {
    ensureSpace(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(80);
    doc.text(label.toUpperCase(), margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setDrawColor(210);
    doc.line(margin, y + 14, margin + width, y + 14);
    y += 26;
  };

  fieldRow('Name / Worker');
  fieldRow('Task / Job');
  fieldRow('Location');
  fieldRow('Date');
  fieldRow('Supervisor');

  // Section 1: STOP — Identify hazards
  const section = (title, items) => {
    ensureSpace(32 + items.length * 18);
    doc.setFillColor(254, 226, 226);
    doc.rect(margin, y, pageW - margin * 2, 18, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(185, 28, 28);
    doc.text(title, margin + 6, y + 12);
    y += 24;
    items.forEach((it) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(60);
      doc.text('☐', margin + 4, y);
      doc.text(it, margin + 16, y);
      doc.setDrawColor(220);
      doc.line(margin, y + 12, pageW - margin, y + 12);
      y += 18;
    });
    y += 4;
  };

  section('1. STOP — Are there any hazards present?', [
    'Unstable / uneven surface, slips, trips, falls',
    'Working at height, above or below ground level',
    'Manual handling, lifting, awkward posture',
    'Sharp edges, hot surfaces, moving parts',
    'Hazardous substances, chemicals, biological material',
    'Electrical, gas, water, pressurised systems',
    'Other people, vehicles, animals in area',
    'Weather, poor lighting, noise, confined space',
  ]);

  section('2. LOOK — What could go wrong?', [
    'Could I or others be injured? How?',
    'Could equipment or property be damaged?',
    'Is anything different from the last time I did this task?',
    'Have conditions changed (weather, environment, people)?',
  ]);

  section('3. ASSESS — Rate the risk', [
    'Likelihood: ☐ Rare  ☐ Unlikely  ☐ Possible  ☐ Likely  ☐ Almost Certain',
    'Consequence: ☐ Insignificant  ☐ Minor  ☐ Moderate  ☐ Major  ☐ Severe',
    'Overall risk: ☐ Low  ☐ Medium  ☐ High  ☐ Critical — STOP if High/Critical and seek guidance',
  ]);

  section('4. CONTROL — How will I make it safe?', [
    'Eliminate — remove the hazard entirely',
    'Substitute — safer alternative',
    'Isolate — barriers, separation, restricted access',
    'Engineering — guards, ventilation, mechanical aids',
    'Administrative — procedures, permits, signage',
    'PPE — required personal protective equipment',
    'Additional controls / action required:',
  ]);

  // Free text lines for additional controls
  ensureSpace(76);
  for (let i = 0; i < 4; i++) {
    doc.setDrawColor(220);
    doc.line(margin, y, pageW - margin, y);
    y += 16;
  }
  y += 4;

  section('5. PROCEED — Final sign-off', [
    'I have assessed the task and risks are controlled to an acceptable level.',
    'I am trained, competent and fit for this task.',
    'I have the correct equipment, materials and PPE.',
    'I will stop and reassess if conditions change.',
  ]);

  y += 6;
  fieldRow('Worker signature');
  fieldRow('Supervisor signature');
  fieldRow('Time completed');

  drawDocumentFooter(doc, { title: 'Take 5 Risk Assessment', margin });

  doc.save('Take-5-Risk-Assessment-Template.pdf');
}

export function downloadRiskAssessmentTemplatePdf() {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 40;
  let y = 44;
  const ensureSpace = (height) => {
    if (y + height <= pageH - 36) return;
    doc.addPage();
    y = 44;
  };

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...BRAND);
  drawCompanyBranding(doc, margin, y, { fontSize: 13 });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(130);
  doc.text('COMPLIANCE MANAGEMENT PLATFORM', margin, y + 11);
  y += 24;

  doc.setFillColor(220, 38, 38);
  doc.rect(margin, y, pageW - margin * 2, 30, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255);
  doc.text('Risk Assessment Template', margin + 10, y + 19);
  y += 44;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(110);
  doc.text('Complete one assessment per identified risk. Attach to the Risk Register.', margin, y);
  y += 16;

  const fieldRow = (label) => {
    ensureSpace(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(80);
    doc.text(label.toUpperCase(), margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setDrawColor(210);
    doc.line(margin, y + 14, pageW - margin, y + 14);
    y += 26;
  };

  // Section A — Risk identification
  const heading = (title) => {
    ensureSpace(48);
    doc.setFillColor(254, 226, 226);
    doc.rect(margin, y, pageW - margin * 2, 18, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(185, 28, 28);
    doc.text(title, margin + 6, y + 12);
    y += 24;
  };
  const blankLines = (count) => {
    ensureSpace(count * 16 + 8);
    for (let i = 0; i < count; i++) {
      doc.setDrawColor(220);
      doc.line(margin, y, pageW - margin, y);
      y += 16;
    }
    y += 4;
  };

  heading('A. Risk Identification');
  fieldRow('Risk title');
  fieldRow('Risk ID');
  fieldRow('Category (Operational / Clinical / Financial / WHS / Participant / Compliance)');
  fieldRow('Date identified');
  fieldRow('Identified by');
  fieldRow('Description of the risk — what, where, who, when, why');
  y += 14;
  blankLines(4);

  heading('B. Risk Analysis — Likelihood × Consequence');
  fieldRow('Likelihood (Rare / Unlikely / Possible / Likely / Almost Certain)');
  fieldRow('Consequence (Insignificant / Minor / Moderate / Major / Severe)');
  fieldRow('Inherent risk rating (Low / Medium / High / Critical)');
  fieldRow('Justification — basis for the rating');

  heading('C. Existing Controls');
  fieldRow('Current controls in place');
  y += 14;
  blankLines(3);
  fieldRow('Control effectiveness (Adequate / Partial / Inadequate)');

  heading('D. Hierarchy of Controls — Treatment Actions');
  fieldRow('Eliminate (remove the hazard entirely)');
  y += 14;
  blankLines(2);
  fieldRow('Substitute / Isolate');
  y += 14;
  blankLines(2);
  fieldRow('Engineering / Administrative controls');
  y += 14;
  blankLines(2);
  fieldRow('PPE required');

  heading('E. Residual Risk');
  fieldRow('Residual likelihood × consequence');
  fieldRow('Residual risk rating (Low / Medium / High / Critical)');
  fieldRow('Is residual risk acceptable? (Yes / No — escalate if No)');

  heading('F. Monitoring & Review');
  fieldRow('Owner / responsible person');
  fieldRow('Review date');
  fieldRow('Monitoring method (inspections, audits, incident data)');
  fieldRow('Status (Identified / Assessed / Treating / Monitored / Closed)');

  heading('G. Sign-off');
  fieldRow('Assessor name');
  fieldRow('Assessor signature');
  fieldRow('Date');
  fieldRow('Approved by (manager)');
  fieldRow('Manager signature / date');

  drawDocumentFooter(doc, { title: 'Risk Assessment Template', margin });

  doc.save('Risk-Assessment-Template.pdf');
}