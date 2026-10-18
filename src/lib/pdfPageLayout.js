import { drawCompanyBranding, drawBlankBusinessBranding } from '@/lib/companyBranding';
import { titleCase } from '@/lib/formQuestionModel';

const layouts = new WeakMap();
export const PDF_MARGIN = 40;
export const pdfContentBottom = (doc) => doc.internal.pageSize.getHeight() - 70;
export const pdfContentTop = (doc) => layouts.get(doc)?.top || 54;

function paintHeader(doc, options) {
  const { title, code = '', docType = 'Form', subtitle = '', completedBy = '', neutralBranding = false } = options;
  const width = doc.internal.pageSize.getWidth() - PDF_MARGIN * 2;
  let y;
  if (neutralBranding) { drawBlankBusinessBranding(doc, PDF_MARGIN, 57); y = 86; }
  else {
    const brand = drawCompanyBranding(doc, PDF_MARGIN, 50, { fontSize: 15, logoSize: 34, maxWidth: width - 48 });
    y = brand.bottomY + 14;
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  const badge = [String(docType).toUpperCase(), code].filter(Boolean).join('  |  ');
  const badgeLines = doc.splitTextToSize(badge, width - 28);
  const badgeH = badgeLines.length * 10 + 12;
  doc.setFillColor(124, 58, 237);
  doc.roundedRect(PDF_MARGIN, y, width, badgeH, 5, 5, 'F');
  doc.setTextColor(255);
  doc.text(badgeLines, PDF_MARGIN + 12, y + 13, { lineHeightFactor: 1.25 });
  y += badgeH + 22;
  doc.setFontSize(17);
  doc.setTextColor(49, 27, 105);
  const titles = doc.splitTextToSize(titleCase(title), width);
  doc.text(titles, PDF_MARGIN, y, { lineHeightFactor: 1.2 });
  y += titles.length * 20.4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  // A subtitle that repeats the document name is dropped so the header reads cleanly.
  const simplify = (text) => String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+form\b.*$/, '').trim();
  const subtitleText = String(subtitle || '').trim();
  const repeatsTitle = subtitleText && simplify(subtitleText) === simplify(title);
  for (const text of [!repeatsTitle && subtitleText, completedBy && `Completed in app by ${completedBy}`].filter(Boolean)) {
    const lines = doc.splitTextToSize(String(text), width);
    doc.text(lines, PDF_MARGIN, y, { lineHeightFactor: 1.35 });
    y += lines.length * 11.5 + 4;
  }
  doc.setDrawColor(196, 181, 253);
  doc.setLineWidth(0.8);
  doc.line(PDF_MARGIN, y + 2, PDF_MARGIN + width, y + 2);
  return y + 22;
}

export function registerDocumentHeader(doc, options) {
  const layout = { top: 54 };
  layouts.set(doc, layout);
  layout.top = paintHeader(doc, options);
  doc.internal.events.subscribe('addPage', () => {
    layout.top = paintHeader(doc, options);
  });
  return layout.top;
}

export function ensurePdfSpace(doc, y, needed = 24) {
  if (y + needed > pdfContentBottom(doc)) { doc.addPage(); return pdfContentTop(doc); }
  return Math.max(y, pdfContentTop(doc));
}