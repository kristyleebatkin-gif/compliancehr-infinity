import { jsPDF } from 'jspdf';
import {
  drawBlankBusinessBranding,
  drawCompanyBranding,
  drawDocumentFooter,
  getCompanyBranding,
  hasConfiguredCompanyBranding,
  loadCompanyBranding,
} from '@/lib/companyBranding';
import { downloadPdfDocument } from '@/lib/documentDownloads';
import { drawFormHeader, drawFieldRows, drawRegisterTable } from '@/lib/formDocumentStyles';
import { ensurePdfSpace } from '@/lib/pdfPageLayout';
import { isIncidentReportForm, drawIncidentFirstPageSignoff } from '@/components/documents/incidentPdfSignoff';
import { drawManagementSignoff } from '@/components/documents/managementSignoffPdf';

const BRAND = [49, 46, 129];
const ACCENT = [37, 99, 235];
const INK = [15, 23, 42];
const MUTED = [100, 116, 139];
const BORDER = [203, 213, 225];
const SURFACE = [248, 250, 252];

/**
 * Generic branded checklist / record-form PDF generator.
 * config:
 *  - title, code (optional), subtitle (optional)
 *  - fields: { label, multiline? }[] -> renders labeled fillable fields
 *  - items: string[]  -> renders checkbox rows (checklist mode)
 *  - columns: string[], rows: number  -> renders a blank table grid (record/register mode)
 */
export function buildChecklistPdf({
  title,
  code,
  docType = 'Form',
  subtitle,
  fields,
  items,
  columns,
  rows = 16,
  tableRows = [],
  signoffFields = ['Full Name', 'Date', 'Signature'],
  signoffValues = [],
  neutralBranding = false,
}) {
  const doc = new jsPDF({
    unit: 'pt',
    format: 'a4',
    orientation: columns?.length > 8 ? 'landscape' : 'portrait',
  });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentW = pageW - margin * 2;
  let y = 58;
  let fieldIndex = 0;
  const fieldPrefix = (code || title).replace(/[^a-zA-Z0-9]+/g, '_');
  const useConfiguredBranding = !neutralBranding || hasConfiguredCompanyBranding();

  const addTextField = (x, fieldY, width, height, multiline = false, value = '') => {
    const field = new doc.AcroForm.TextField();
    field.fieldName = `${fieldPrefix}_text_${fieldIndex++}`;
    field.x = x;
    field.y = fieldY;
    field.width = width;
    field.height = height;
    field.fontSize = 9;
    field.multiline = multiline;
    field.value = value;
    field.defaultValue = value;
    field.fillColor = '#F8FAFC';
    field.borderColor = '#CBD5E1';
    field.textColor = '#0F172A';
    doc.addField(field);
  };

  const addCheckBox = (x, fieldY, size) => {
    const field = new doc.AcroForm.CheckBox();
    field.fieldName = `${fieldPrefix}_check_${fieldIndex++}`;
    field.x = x;
    field.y = fieldY;
    field.width = size;
    field.height = size;
    field.appearanceState = 'Off';
    field.fillColor = '#FFFFFF';
    field.borderColor = '#64748B';
    doc.addField(field);
  };

  const ensure = (need) => {
    const previousPage = doc.internal.getCurrentPageInfo().pageNumber;
    y = ensurePdfSpace(doc, y, need);
    return previousPage !== doc.internal.getCurrentPageInfo().pageNumber;
  };

  const drawSectionHeading = (label, followingHeight = 0) => {
    ensure(34 + followingHeight);
    doc.setFillColor(238, 242, 255);
    doc.roundedRect(margin, y, contentW, 24, 3, 3, 'F');
    doc.setFillColor(...ACCENT);
    doc.rect(margin, y, 3, 24, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...BRAND);
    doc.text(label, margin + 12, y + 16);
    y += 34;
  };

  const incidentForm = isIncidentReportForm(title);
  y = drawFormHeader(doc, { title, code, docType, subtitle, neutralBranding: !useConfiguredBranding, reserveFirstPageSignoff: incidentForm });
  drawSectionHeading('Purpose', 24);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...INK);
  const purposeLines = doc.splitTextToSize(`Use this form to record information for ${title}.`, contentW - 12);
  ensure(purposeLines.length * 12 + 12);
  doc.text(purposeLines, margin + 6, y + 10);
  y += purposeLines.length * 12 + 12;
  if (fields?.length) {
    drawSectionHeading('Form information', 90);
    y = drawFieldRows(doc, y, fields, {}, { interactive: true });
  }

  if (columns?.length) {
    drawSectionHeading('Register entries', 90);
    y = drawRegisterTable(doc, y, columns, { rows, values: tableRows, interactive: true });
  } else if (!fields?.length && items && items.length) {
    drawSectionHeading('Checklist', 42);
    doc.setFontSize(9.5);
    doc.setTextColor(...INK);
    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      const lines = doc.splitTextToSize(item, contentW - 42);
      const itemH = Math.max(30, lines.length * 12 + 12);
      ensure(itemH);
      if (index % 2 === 0) {
        doc.setFillColor(...SURFACE);
        doc.roundedRect(margin, y, contentW, itemH - 4, 3, 3, 'F');
      }
      addCheckBox(margin + 10, y + 7, 12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...INK);
      doc.text(lines, margin + 34, y + 16);
      y += itemH;
    }
  }

  drawSectionHeading('Review', 90);
  y = drawFieldRows(doc, y, ['Reviewer name', 'Review date', 'Reviewer signature', 'Next review date'].map((label) => ({ label })), {}, { interactive: true });

  // Sign-off uses the same solid-outlined answer boxes.
  drawSectionHeading('Completion and authorisation', 90);
  y = drawFieldRows(doc, y, signoffFields.map((label, index) => ({ label, value: String(signoffValues[index] ?? '') })), {}, { interactive: true });
  y = drawManagementSignoff(doc, y, {}, true);

  // Footer
  if (incidentForm) drawIncidentFirstPageSignoff(doc, { addTextField });
  drawDocumentFooter(doc, {
    title,
    code,
    companyName: useConfiguredBranding ? getCompanyBranding().companyName : 'Business name: ____________________',
    margin,
  });

  return doc;
}

export async function downloadChecklistPdf(config) {
  await loadCompanyBranding().catch(() => {});
  const doc = buildChecklistPdf(config);
  downloadPdfDocument(doc, `${config.title}.pdf`);
}

export async function openChecklistPdf(config) {
  await loadCompanyBranding().catch(() => {});
  const doc = buildChecklistPdf(config);
  downloadPdfDocument(doc, `${config.title}.pdf`);
}