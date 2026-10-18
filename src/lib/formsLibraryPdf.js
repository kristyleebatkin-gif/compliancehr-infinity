import { jsPDF } from 'jspdf';
import { drawDocumentFooter, loadCompanyBranding } from '@/lib/companyBranding';
import { drawFormHeader, drawFieldRows, drawRegisterTable, drawSignatures, drawFormNotice, drawDeclaration } from '@/lib/formDocumentStyles';

/**
 * Generic branded fillable form PDF used as fallback when a library document
 * has no official attached file. Pulls live Company Safe branding, completion
 * guidance, privacy note and declaration into every generated form.
 */
export async function downloadBlankFormPdf({
  title,
  code,
  subtitle = 'ComplianceHR Form',
  fields = [],
  columns,
  rows = 12,
  purpose = '',
  declaration = true,
}) {
  await loadCompanyBranding().catch(() => {});
  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: columns ? 'landscape' : 'portrait' });

  let y = drawFormHeader(doc, { title, code, subtitle, docType: 'Form' });
  y = drawFormNotice(doc, y, { purpose });
  y = drawFieldRows(doc, y, fields);
  if (columns) y = drawRegisterTable(doc, y, columns, { rows });
  if (declaration) y = drawDeclaration(doc, y);
  y = drawSignatures(doc, y);

  drawDocumentFooter(doc, { title, code });

  doc.save(`${title}.pdf`);
}