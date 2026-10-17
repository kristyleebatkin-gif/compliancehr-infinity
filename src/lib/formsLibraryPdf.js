import { jsPDF } from 'jspdf';
import { drawCompanyBranding, drawDocumentFooter } from '@/lib/companyBranding';

/**
 * Generic branded fillable form PDF used as fallback when a library document
 * has no official attached file in the previous app's media library.
 */
export function downloadBlankFormPdf({ title, code, subtitle = 'ComplianceHR Form', fields = [], columns, rows = 12 }) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: columns ? 'landscape' : 'portrait' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  let y = 54;

  drawCompanyBranding(doc, 40, y);
  y += 44;

  // Title band: soft tinted strip with the form title, subject line and a
  // violet form-code pill on the right.
  doc.setFillColor(244, 242, 253);
  doc.roundedRect(40, y - 16, pageW - 80, 34, 5, 5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(49, 27, 105);
  doc.text(title, 54, y + 2);
  if (code) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    const codeW = doc.getTextWidth(code) + 16;
    doc.setFillColor(124, 58, 237);
    doc.roundedRect(pageW - 54 - codeW, y - 9, codeW, 16, 8, 8, 'F');
    doc.setTextColor(255);
    doc.text(code, pageW - 54 - codeW + 8, y + 2.5);
  }
  y += 12;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(subtitle, 54, y + 3);
  y += 30;

  const writeFieldRow = (label) => {
    if (y > pageH - 60) { doc.addPage(); y = 54; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(40);
    doc.text(`${label}:`, 40, y);
    doc.setDrawColor(180);
    doc.line(40 + Math.min(doc.getTextWidth(`${label}:`) + 8, 220), y, pageW - 40, y);
    y += 26;
  };

  for (const field of fields) {
    writeFieldRow(field.label);
  }

  if (columns) {
    if (y > pageH - 120) { doc.addPage(); y = 54; }
    const margin = 40;
    const tableW = pageW - margin * 2;
    const colW = tableW / columns.length;
    const rowH = 30;
    doc.setFillColor(124, 58, 237);
    doc.rect(margin, y, tableW, rowH, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255);
    columns.forEach((c, i) => {
      const lines = doc.splitTextToSize(c, colW - 6);
      doc.text(lines, margin + i * colW + 3, y + 12);
    });
    y += rowH;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(60);
    for (let r = 0; r < rows; r++) {
      if (y > pageH - rowH - 30) { doc.addPage(); y = 54; }
      doc.setDrawColor(220);
      doc.rect(margin, y, tableW, rowH, 'S');
      for (let i = 0; i < columns.length; i++) {
        doc.line(margin + i * colW, y, margin + i * colW, y + rowH);
      }
      y += rowH;
    }
  }

  // Signature block
  if (y > pageH - 90) { doc.addPage(); y = 54; }
  y += 14;
  doc.setDrawColor(170);
  doc.line(40, y, 250, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(110);
  doc.text('Authorised By (Signature)', 40, y + 13);
  doc.line(pageW - 250, y, pageW - 40, y);
  doc.text('Date', pageW - 250, y + 13);

  drawDocumentFooter(doc, { title, code });

  doc.save(`${title}.pdf`);
}