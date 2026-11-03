import { ensurePdfSpace, pdfContentTop, PDF_MARGIN } from '@/lib/pdfPageLayout';

export const CALM_SAYINGS = [
  'Take your time. There is no rush, and there are no wrong words.',
  'Only answer what you can today. You can always come back and add more.',
  'This information helps us support you better and keeps you safer.',
  'If any question feels difficult, just ask us. We can fill it in together.',
  'You are in control of your information. Share only what you are comfortable with.',
  'Every answer here helps us plan supports that fit your life, your way.',
];

const FEATURE_NOTES = [
  'ComplianceHR Infinity brings your forms, records, plans and reminders together in one secure place, so nothing is missed.',
  'Everything you save here is kept safely in the app and ready for your next review, appointment or audit.',
  'Save this document as a draft at any time and come back when you are ready. Your progress is kept for you.',
  'Prefer a hand? Your support team can complete this with you, step by step, in the way that suits you best.',
];

const ROYAL_BLUE = [0, 114, 255];
const SOFT = [240, 247, 255];
const BORDER = [186, 230, 253];
const ICONS = ['heart', 'sun', 'shield', 'clock'];

export function drawPdfFormIcon(doc, kind, x, y, s = 18) {
  if (kind === 'heart') {
    doc.setFillColor(0, 114, 255);
    doc.circle(x + s * 0.32, y + s * 0.34, s * 0.26, 'F');
    doc.circle(x + s * 0.68, y + s * 0.34, s * 0.26, 'F');
    doc.triangle(x + s * 0.06, y + s * 0.44, x + s * 0.94, y + s * 0.44, x + s * 0.5, y + s * 0.96, 'F');
  } else if (kind === 'sun') {
    doc.setFillColor(0, 114, 255);
    doc.circle(x + s / 2, y + s / 2, s * 0.26, 'F');
    doc.setDrawColor(0, 114, 255); doc.setLineWidth(1.3);
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI / 4) * i;
      doc.line(
        x + s / 2 + Math.cos(angle) * s * 0.38, y + s / 2 + Math.sin(angle) * s * 0.38,
        x + s / 2 + Math.cos(angle) * s * 0.5, y + s / 2 + Math.sin(angle) * s * 0.5,
      );
    }
  } else if (kind === 'shield') {
    const pts = [[0, 0], [1, 0], [1, 0.55], [0.5, 0.96], [0, 0.55]].map(([px, py]) => [x + px * s, y + py * s]);
    doc.setFillColor(...SOFT);
    doc.triangle(x, y, x + s, y, x + s * 0.5, y + s * 0.96, 'F');
    doc.setDrawColor(...ROYAL_BLUE); doc.setLineWidth(1.2);
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      doc.line(a[0], a[1], b[0], b[1]);
    }
  } else if (kind === 'check') {
    doc.setFillColor(...SOFT);
    doc.roundedRect(x, y, s, s, 4, 4, 'F');
    doc.setDrawColor(...ROYAL_BLUE); doc.setLineWidth(1.6);
    doc.line(x + s * 0.22, y + s * 0.52, x + s * 0.42, y + s * 0.72);
    doc.line(x + s * 0.42, y + s * 0.72, x + s * 0.8, y + s * 0.26);
  } else {
    doc.setDrawColor(...ROYAL_BLUE); doc.setLineWidth(1.3);
    doc.circle(x + s / 2, y + s / 2, s * 0.42);
    doc.line(x + s / 2, y + s / 2, x + s / 2, y + s * 0.2);
    doc.line(x + s / 2, y + s / 2, x + s * 0.72, y + s / 2);
  }
}

export function drawFormBreather(doc, y, index = 0) {
  const width = doc.internal.pageSize.getWidth() - PDF_MARGIN * 2;
  const h = 30;
  y = ensurePdfSpace(doc, y, h + 8);
  doc.setFillColor(...SOFT); doc.setDrawColor(...BORDER); doc.setLineWidth(1);
  doc.roundedRect(PDF_MARGIN, y, width, h, 9, 9, 'FD');
  drawPdfFormIcon(doc, ICONS[index % ICONS.length], PDF_MARGIN + 14, y + 6, 18);
  doc.setFont('helvetica', 'italic'); doc.setFontSize(9); doc.setTextColor(10, 43, 109);
  doc.text(CALM_SAYINGS[index % CALM_SAYINGS.length], PDF_MARGIN + 42, y + h / 2 + 3);
  doc.setFont('helvetica', 'normal'); doc.setLineWidth(0.5);
  return y + h + 10;
}

export function drawFormSectionBreak(doc, index = 0) {
  doc.addPage();
  let y = pdfContentTop(doc);
  const width = doc.internal.pageSize.getWidth() - PDF_MARGIN * 2;
  doc.setFillColor(10, 43, 109);
  doc.roundedRect(PDF_MARGIN, y, width, 10, 5, 5, 'F');
  y += 10 + 16;
  const calm = CALM_SAYINGS[(index + 2) % CALM_SAYINGS.length];
  const note = FEATURE_NOTES[index % FEATURE_NOTES.length];
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5);
  const calmLines = doc.splitTextToSize(calm, width - 66);
  const noteLines = doc.splitTextToSize(note, width - 66);
  const h = 22 + calmLines.length * 12 + noteLines.length * 11 + 14;
  doc.setFillColor(...SOFT); doc.setDrawColor(...BORDER); doc.setLineWidth(1);
  doc.roundedRect(PDF_MARGIN, y, width, h, 10, 10, 'FD');
  drawPdfFormIcon(doc, ICONS[index % ICONS.length], PDF_MARGIN + 16, y + 14, 22);
  doc.setFont('helvetica', 'italic'); doc.setFontSize(8.5); doc.setTextColor(10, 43, 109);
  doc.text(calmLines, PDF_MARGIN + 52, y + 20, { lineHeightFactor: 1.4 });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(0, 114, 255);
  doc.text(noteLines, PDF_MARGIN + 52, y + 20 + calmLines.length * 12 + 4, { lineHeightFactor: 1.4 });
  doc.setFont('helvetica', 'normal'); doc.setLineWidth(0.5);
  return y + h + 18;
}