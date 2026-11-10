import { jsPDF } from 'jspdf';
import { drawDocumentFooter, loadCompanyBranding } from '@/lib/companyBranding';
import { isIncidentReportForm, drawIncidentFirstPageSignoff } from '@/components/documents/incidentPdfSignoff';
import { drawFormHeader, drawFieldRows, drawRegisterTable, drawSignatures, drawFormNotice, drawDeclaration, drawReviewSection } from '@/lib/formDocumentStyles';

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

  const incidentForm = isIncidentReportForm(title);
  let y = drawFormHeader(doc, { title, code, subtitle, docType: 'Form', reserveFirstPageSignoff: incidentForm });
  y = drawFormNotice(doc, y, { purpose: purpose || `Use this form to record information for ${title}.` });
  y = drawFieldRows(doc, y, fields);
  if (columns) y = drawRegisterTable(doc, y, columns, { rows });
  y = drawReviewSection(doc, y);
  if (declaration) y = drawDeclaration(doc, y);
  y = drawSignatures(doc, y);

  if (incidentForm) drawIncidentFirstPageSignoff(doc);
  drawDocumentFooter(doc, { title, code });

  doc.save(`${title}.pdf`);
}