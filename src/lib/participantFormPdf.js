import { jsPDF } from 'jspdf';
import { drawDocumentFooter } from '@/lib/companyBranding';
import { drawFormHeader, drawFieldRows, drawRegisterTable, drawSignatures } from '@/lib/formDocumentStyles';

/**
 * Branded participant form PDF with in-app answers written into each field.
 */
export function buildFilledFormDoc({ title, code, subtitle = 'ComplianceHR Form', fields = [], values = {}, columns, rows = 12, completedBy = '', completedAt = '' }) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: columns ? 'landscape' : 'portrait' });

  let y = drawFormHeader(doc, { title, code, subtitle, completedBy });
  y = drawFieldRows(doc, y, fields, values);
  if (columns) y = drawRegisterTable(doc, y, columns, { rows });
  y = drawSignatures(doc, y, { completedBy, completedAt });

  drawDocumentFooter(doc, { title, code });

  return doc;
}

export function downloadFilledFormPdf(options) {
  buildFilledFormDoc(options).save(`${options.title}.pdf`);
}