import { jsPDF } from 'jspdf';
import { downloadCsv } from '@/lib/csvExport';
import { downloadPdfDocument } from '@/lib/documentDownloads';

export default function profileRecordExport(title, person, rows, format) {
  const filename = `${person.full_name} - ${title}`.replace(/[<>:"/\\|?*]/g, '-');
  const safe = (value) => /^[=+@\-\t\r]/.test(String(value ?? '')) ? `'${value}` : String(value ?? '');
  if (format === 'csv') return downloadCsv(`${filename}.csv`, [{ key: 'field', label: 'Field' }, { key: 'value', label: 'Value' }], [{ field: 'Employee', value: person.full_name }, ...rows].map((row) => ({ field: safe(row.field), value: safe(row.value) })));
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  let y = 42;
  const line = (text, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(String(text || 'Not recorded'), 505);
    for (const part of lines) {
      if (y > 790) { doc.addPage(); y = 42; }
      doc.text(part, 42, y); y += 15;
    }
    y += 5;
  };
  doc.setFontSize(15); line(title, true);
  doc.setFontSize(10); line(person.full_name, true);
  for (const row of rows) { line(row.field, true); line(row.value); }
  return downloadPdfDocument(doc, `${filename}.pdf`);
}