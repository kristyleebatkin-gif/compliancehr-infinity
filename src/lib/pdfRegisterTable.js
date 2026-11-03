import { ensurePdfSpace, pdfContentBottom, pdfContentTop, PDF_MARGIN as M } from '@/lib/pdfPageLayout';
import { addPdfTextField } from '@/lib/pdfFieldBoxes';

export function drawPdfRegisterTable(doc, y, columns, { rows = 12, values = [], rowH = 34, interactive = false } = {}) {
  if (columns.length > 8) {
    const count = Math.max(rows, values.length);
    for (let start = 0; start < columns.length; start += 7) {
      const subset = columns.slice(start, start + 7);
      const entries = Array.from({ length: count }, (_, r) => [String(r + 1), ...subset.map((column, c) => {
        const entry = values[r];
        return Array.isArray(entry) ? (entry[start + c] ?? '') : (entry && typeof entry === 'object' ? (entry[column] ?? '') : (start + c === 0 ? (entry ?? '') : ''));
      })]);
      y = drawPdfRegisterTable(doc, y, ['Entry', ...subset], { rows: count, values: entries, rowH, interactive });
    }
    return y;
  }
  const width = doc.internal.pageSize.getWidth() - M * 2, colW = width / columns.length;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
  const labels = columns.map((c) => doc.splitTextToSize(String(c), colW - 14));
  const headH = Math.max(34, ...labels.map((l) => l.length * 11 + 18));
  const header = () => {
    doc.setFillColor(10, 43, 109); doc.setDrawColor(10, 43, 109);
    doc.rect(M, y, width, headH, 'FD');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(255);
    labels.forEach((l, i) => doc.text(l, M + i * colW + 7, y + 15, { lineHeightFactor: 1.375 }));
    y += headH;
  };
  y = ensurePdfSpace(doc, y, headH + rowH + 16); header();
  for (let r = 0; r < Math.max(rows, values.length); r++) {
    const entry = values[r] || [];
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5);
    const cells = columns.map((c, i) => doc.splitTextToSize(String(Array.isArray(entry) ? (entry[i] ?? '') : (typeof entry === 'object' ? (entry[c] ?? '') : (i ? '' : entry))), colW - 14));
    const capacity = Math.max(1, Math.floor((pdfContentBottom(doc) - pdfContentTop(doc) - headH - 30) / 12));
    const totalLines = Math.max(1, ...cells.map((cell) => cell.length));
    for (let offset = 0; offset < totalLines; offset += capacity) {
      const chunks = cells.map((cell) => cell.slice(offset, offset + capacity));
      const height = Math.max(rowH, ...chunks.map((c) => c.length * 12 + 18));
      if (y + height + 14 > pdfContentBottom(doc)) { doc.addPage(); y = pdfContentTop(doc); header(); }
      doc.setDrawColor(186, 230, 253); doc.setLineWidth(0.8);
      doc.setFillColor(...(r % 2 ? [240, 247, 255] : [255, 255, 255]));
      doc.rect(M, y, width, height, 'FD');
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(10, 43, 109);
      chunks.forEach((chunk, i) => {
        if (i) doc.line(M + i * colW, y, M + i * colW, y + height);
        if (interactive) addPdfTextField(doc, M + i * colW + 4, y + 4, colW - 8, height - 8, true, chunk.join('\n'));
        else doc.text(chunk, M + i * colW + 7, y + 15, { lineHeightFactor: 1.41176 });
      });
      y += height;
    }
  }
  doc.setLineWidth(0.5);
  return y + 20;
}