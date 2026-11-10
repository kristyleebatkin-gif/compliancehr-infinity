import { jsPDF } from 'jspdf';
import { drawDocumentFooter, loadCompanyBranding } from '@/lib/companyBranding';
import { isIncidentReportForm, drawIncidentFirstPageSignoff } from '@/components/documents/incidentPdfSignoff';
import { drawManagementSignoff } from '@/components/documents/managementSignoffPdf';
import { drawFormHeader, drawFieldRows, drawRegisterTable, drawSignatures, drawFormNotice, drawDeclaration, drawReviewSection, FORM_NOTICES } from '@/lib/formDocumentStyles';

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
  tableValues = [],
  managementSignoff = {},
  declaration = true,
}) {
  await loadCompanyBranding().catch(() => {});
  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: columns ? 'landscape' : 'portrait' });

  const incidentForm = isIncidentReportForm(title);
  let y = drawFormHeader(doc, { title, code, subtitle, completedBy, docType: 'Form', reserveFirstPageSignoff: incidentForm });
  y = drawFormNotice(doc, y, { purpose: purpose || `Use this form to record information for ${title}.` });
  y = drawFieldRows(doc, y, fields, values);
  if (columns?.length) y = drawRegisterTable(doc, y, columns, { rows, values: tableValues });
  y = drawReviewSection(doc, y);
  if (declaration) y = drawDeclaration(doc, y);
  y = drawSignatures(doc, y, { completedBy, completedAt });
  y = drawManagementSignoff(doc, y, managementSignoff);

  if (incidentForm) drawIncidentFirstPageSignoff(doc, { name: completedBy, date: completedAt });
  drawDocumentFooter(doc, { title, code });

  return doc;
}

export async function downloadFilledFormPdf(options) {
  const doc = await buildFilledFormDoc(options);
  doc.save(`${options.title}.pdf`);
}

export { FORM_NOTICES };