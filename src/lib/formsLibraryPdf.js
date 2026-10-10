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

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(91, 44, 131);
  drawCompanyBranding(doc, 40, y);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(130);
  doc.text('COMPLIANCE MANAGEMENT PLATFORM', 40, y + 14);
  y += 34;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30);
  doc.text(title, 40, y);
  if (code) {
    doc.setFontSize(9);
    doc.setTextColor(0, 166, 166);
    doc.text(code, pageW - 40 - doc.getTextWidth(code), y);
  }
  y += 14;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(110);
  doc.text(subtitle, 40, y);
  y += 12;
  doc.setDrawColor(210);
  doc.line(40, y, pageW - 40, y);
  y += 20;

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
    doc.setFillColor(91, 44, 131);
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