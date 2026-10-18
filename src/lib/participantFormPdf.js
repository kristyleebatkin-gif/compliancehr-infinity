import { jsPDF } from 'jspdf';
import { drawDocumentFooter, loadCompanyBranding } from '@/lib/companyBranding';
import { drawFormHeader, drawFieldRows, drawRegisterTable, drawSignatures, drawFormNotice, drawDeclaration, FORM_NOTICES } from '@/lib/formDocumentStyles';

/**
 * Branded participant form PDF with in-app answers written into each field.
 * Every generated form carries the company header (name, logo, slogan),
 * completion guidance, a privacy note, a declaration and a branded footer
 * (name, logo, address) sourced automatically from Company Safe.
 */
export async function buildFilledFormDoc({
  title,
  code,
  subtitle = 'ComplianceHR Form',
  fields = [],
  values = {},
  columns,
  rows = 12,
  completedBy = '',
  completedAt = '',
  purpose = '',
  declaration = true,
}) {
  await loadCompanyBranding().catch(() => {});
  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: columns ? 'landscape' : 'portrait' });

  let y = drawFormHeader(doc, { title, code, subtitle, completedBy, docType: 'Form' });
  y = drawFormNotice(doc, y, { purpose });
  y = drawFieldRows(doc, y, fields, values);
  if (columns) y = drawRegisterTable(doc, y, columns, { rows });
  if (declaration) y = drawDeclaration(doc, y);
  y = drawSignatures(doc, y, { completedBy, completedAt });

  drawDocumentFooter(doc, { title, code });

  return doc;
}

export async function downloadFilledFormPdf(options) {
  const doc = await buildFilledFormDoc(options);
  doc.save(`${options.title}.pdf`);
}

export { FORM_NOTICES };