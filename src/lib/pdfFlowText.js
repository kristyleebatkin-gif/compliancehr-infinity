import { ensurePdfSpace, PDF_MARGIN as M } from '@/lib/pdfPageLayout';

export function drawPdfParagraph(doc, y, text, indent = M) {
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(30, 30, 45);
  const lines = doc.splitTextToSize(String(text || ''), doc.internal.pageSize.getWidth() - indent - M);
  y = ensurePdfSpace(doc, y, Math.min(2, lines.length) * 15);
  for (const line of lines) {
    y = ensurePdfSpace(doc, y, 16);
    doc.text(line, indent, y + 9);
    y += 15;
  }
  return y + 10;
}

export function drawPdfBullets(doc, y, items, indent = M) {
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(30, 30, 45);
  for (const item of items) {
    const lines = doc.splitTextToSize(String(item), doc.internal.pageSize.getWidth() - indent - M - 16);
    y = ensurePdfSpace(doc, y, Math.min(3, lines.length) * 15 + 8);
    for (let i = 0; i < lines.length; i++) {
      y = ensurePdfSpace(doc, y, 16);
      if (!i) { doc.setFillColor(124, 58, 237); doc.circle(indent + 4, y + 6, 1.8, 'F'); }
      doc.text(lines[i], indent + 16, y + 9); y += 15;
    }
    y += 7;
  }
  return y + 6;
}