import { jsPDF } from 'jspdf';
import { drawDocumentFooter } from '@/lib/companyBranding';
import { drawFormHeader, drawFieldRows, drawRegisterTable, drawSignatures } from '@/lib/formDocumentStyles';

/**
 * Generic branded fillable form PDF used as fallback when a library document
 * has no official attached file in the previous app's media library.
 */
export function downloadBlankFormPdf({ title, code, subtitle = 'ComplianceHR Form', fields = [], columns, rows = 12 }) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: columns ? 'landscape' : 'portrait' });

  let y = drawFormHeader(doc, { title, code, subtitle });
  y = drawFieldRows(doc, y, fields);
  if (columns) y = drawRegisterTable(doc, y, columns, { rows });
  y = drawSignatures(doc, y);

  drawDocumentFooter(doc, { title, code });

  doc.save(`${title}.pdf`);
}