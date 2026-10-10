import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { drawCompanyBranding, drawDocumentFooter } from './companyBranding';

const COLUMNS = [
  { label: '#', width: 24 },
  { label: 'Chemical / Product', width: 150 },
  { label: 'CAS No.', width: 62 },
  { label: 'Category', width: 108 },
  { label: 'Hazard Class / GHS', width: 110 },
  { label: 'First Aid', width: 148 },
  { label: 'Storage', width: 116 },
];

export function downloadChemicalRegister(chemicals) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'landscape' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36;
  let y = 0;

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 78, 'F');
  drawCompanyBranding(doc, margin, 40, { fontSize: 14 });
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text('Chemical Register (MSDS Summary)', margin, 66);
  y = 102;

  const drawHeaderRow = () => {
    doc.setFillColor(37, 99, 235);
    doc.rect(margin, y, pageWidth - margin * 2, 18, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    let x = margin + 4;
    COLUMNS.forEach((col) => {
      doc.text(col.label, x, y + 12.5);
      x += col.width;
    });
    y += 24;
  };

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`${chemicals.length} chemicals on register     Printed ${format(new Date(), 'd MMM yyyy')}`, margin, y);
  y += 16;
  drawHeaderRow();

  chemicals.forEach((chem, i) => {
    const cells = COLUMNS.map((col, ci) => {
      if (ci === 0) return String(i + 1);
      const key = ['name', 'cas_number', 'category', 'hazard_class', 'first_aid', 'storage_notes'][ci - 1];
      return String(chem[key] || '-');
    });
    const wrapped = cells.map((text, ci) => doc.splitTextToSize(text, COLUMNS[ci].width - 8));
    const rowHeight = Math.max(14, ...wrapped.map((lines) => lines.length * 10)) + 6;
    if (y + rowHeight > pageHeight - 52) {
      drawDocumentFooter(doc, { title: 'Chemical Register', code: '' });
      doc.addPage();
      y = 40;
      drawHeaderRow();
    }
    doc.setFillColor(i % 2 === 0 ? 255 : 248, i % 2 === 0 ? 255 : 250, i % 2 === 0 ? 255 : 252);
    doc.rect(margin, y - 4, pageWidth - margin * 2, rowHeight, 'F');
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    let x = margin + 4;
    wrapped.forEach((lines, ci) => {
      doc.text(lines.slice(0, 4), x, y + 6);
      x += COLUMNS[ci].width;
    });
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + rowHeight - 4, pageWidth - margin, y + rowHeight - 4);
    y += rowHeight;
  });

  drawDocumentFooter(doc, { title: 'Chemical Register', code: '' });
  doc.save(`Chemical Register - ${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}