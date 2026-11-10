import { PDF_MARGIN } from '@/lib/pdfPageLayout';

export const isIncidentReportForm = (title = '') => /\bincident\s+reports?\b/i.test(title);

export function drawIncidentFirstPageSignoff(doc, { name = '', date = '', signature = '', addTextField } = {}) {
  const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
  doc.setPage(1);
  const x = PDF_MARGIN;
  const width = doc.internal.pageSize.getWidth() - PDF_MARGIN * 2;
  const y = doc.internal.pageSize.getHeight() - 142;
  const height = 68;
  const cols = [width * 0.34, width * 0.4, width * 0.26];
  doc.setDrawColor(10, 43, 109); doc.setLineWidth(0.8);
  doc.setFillColor(255, 255, 255); doc.rect(x, y, width, height, 'FD');
  doc.line(x + cols[0], y, x + cols[0], y + height);
  doc.line(x + cols[0] + cols[1], y, x + cols[0] + cols[1], y + height);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(10, 43, 109);
  doc.text('Name', x + 8, y + 14);
  doc.text('Signature', x + cols[0] + 8, y + 14);
  doc.text('Date', x + cols[0] + cols[1] + 8, y + 14);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  if (addTextField) {
    addTextField(x + 8, y + 20, cols[0] - 16, 32);
    addTextField(x + cols[0] + 8, y + 20, cols[1] - 16, 32);
    addTextField(x + cols[0] + cols[1] + 8, y + 20, cols[2] - 16, 32);
  } else {
    if (name) doc.text(String(name), x + 8, y + 42, { maxWidth: cols[0] - 16 });
    if (date) doc.text(String(date), x + cols[0] + cols[1] + 8, y + 42, { maxWidth: cols[2] - 16 });
  }
  if (signature.startsWith('data:image/')) {
    doc.addImage(signature, signature.startsWith('data:image/png') ? 'PNG' : 'JPEG', x + cols[0] + 8, y + 19, cols[1] - 16, 37);
  } else if (!addTextField) {
    doc.line(x + cols[0] + 8, y + 52, x + cols[0] + cols[1] - 8, y + 52);
  }
  doc.setLineWidth(0.5);
  doc.setPage(currentPage);
}