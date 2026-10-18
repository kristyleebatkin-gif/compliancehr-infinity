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

  const drawContinuationHeader = () => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...INK);
    doc.text(title, margin, 40, { maxWidth: contentW - 100 });
    if (code) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...ACCENT);
      doc.text(code, pageW - margin, 40, { align: 'right' });
    }
    doc.setDrawColor(...BORDER);
    doc.line(margin, 48, pageW - margin, 48);
    y = 64;
  };

  const ensure = (need) => {
    if (y > pageH - 72 - need) {
      doc.addPage();
      drawContinuationHeader();
      return true;
    }
    return false;
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

  // Brand header
  doc.setFillColor(...BRAND);
  doc.rect(margin, 28, contentW, 3, 'F');
  if (useConfiguredBranding) drawCompanyBranding(doc, margin, y);
  else drawBlankBusinessBranding(doc, margin, y);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...MUTED);
  doc.text(String(docType || 'Form').toUpperCase(), margin, y + 15);
  if (code) {
    const badge = `${String(docType || 'Form').toUpperCase()} · ${code}`;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    const badgeW = doc.getTextWidth(badge) + 18;
    const badgeX = pageW - margin - badgeW;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...ACCENT);
    doc.setLineWidth(1);
    doc.roundedRect(badgeX, y - 17, badgeW, 24, 5, 5, 'FD');
    doc.setTextColor(...ACCENT);
    doc.text(badge, badgeX + 9, y - 2);
    doc.setLineWidth(0.5);
  }
  y += 44;

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...INK);
  const titleLines = doc.splitTextToSize(title, contentW);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 22;
  if (subtitle) {
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...MUTED);
    doc.text(subtitle, margin, y);
    y += 15;
  }
  doc.setDrawColor(...BORDER);
  doc.line(margin, y, pageW - margin, y);
  y += 24;

  if (fields && fields.length) {
    drawSectionHeading('Form information', 58);
    const gap = 16;
    const columnW = (contentW - gap) / 2;
    for (let index = 0; index < fields.length;) {
      const field = fields[index];
      const nextField = fields[index + 1];
      const pair = !field.multiline && nextField && !nextField.multiline;
      const rowFields = pair ? [field, nextField] : [field];
      const widths = pair ? [columnW, columnW] : [contentW];
      const labelLines = rowFields.map((item, rowIndex) => doc.splitTextToSize(item.label, widths[rowIndex]));
      const labelH = Math.max(...labelLines.map((lines) => lines.length)) * 10;
      const fieldH = field.multiline ? 64 : 28;
      ensure(labelH + fieldH + 20);

      rowFields.forEach((item, rowIndex) => {
        const x = margin + rowIndex * (columnW + gap);
        const width = widths[rowIndex];
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(...INK);
        doc.text(labelLines[rowIndex], x, y);
        const fieldY = y + labelH + 3;
        addTextField(x, fieldY, width, item.multiline ? 64 : 28, Boolean(item.multiline), item.value || '');
      });
      y += labelH + fieldH + 20;
      index += rowFields.length;
    }
  }

  const drawTableHeader = (cols, colW, rowH) => {
    doc.setFillColor(...BRAND);
    doc.rect(margin, y, contentW, rowH, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255);
    cols.forEach((column, index) => {
      const lines = doc.splitTextToSize(column, colW - 8);
      doc.text(lines, margin + index * colW + 4, y + 10);
    });
    y += rowH;
  };

  if (columns && columns.length) {
    if (fields?.length) y += 2;
    drawSectionHeading('Register entries', 60);
    const cols = columns;
    const colCount = cols.length;
    const colW = contentW / colCount;
    const rowH = columns.length > 8 ? 32 : 28;
    drawTableHeader(cols, colW, rowH);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...INK);
    const rowCount = Math.max(rows, tableRows.length);
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
      if (ensure(rowH)) drawTableHeader(cols, colW, rowH);
      if (rowIndex % 2 === 1) {
        doc.setFillColor(...SURFACE);
        doc.rect(margin, y, contentW, rowH, 'F');
      }
      doc.setDrawColor(...BORDER);
      doc.rect(margin, y, contentW, rowH, 'S');
      for (let columnIndex = 0; columnIndex < colCount; columnIndex += 1) {
        doc.line(margin + columnIndex * colW, y, margin + columnIndex * colW, y + rowH);
        addTextField(
          margin + columnIndex * colW + 2,
          y + 2,
          colW - 4,
          rowH - 4,
          false,
          tableRows[rowIndex]?.[columnIndex] || '',
        );
      }
      y += rowH;
    }
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

  // Sign-off
  const signoffGap = 12;
  const signoffWidth = (contentW - signoffGap * (signoffFields.length - 1)) / signoffFields.length;
  const signoffLabelLines = signoffFields.map((label) => doc.splitTextToSize(label, signoffWidth));
  const signoffLabelH = Math.max(...signoffLabelLines.map((lines) => lines.length)) * 9;
  y += 8;
  drawSectionHeading('Completion and authorisation', signoffLabelH + 36);
  signoffFields.forEach((label, index) => {
    const x = margin + index * (signoffWidth + signoffGap);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(signoffLabelLines[index], x, y);
    addTextField(x, y + signoffLabelH + 4, signoffWidth, 28, false, signoffValues[index] || '');
  });

  // Footer
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