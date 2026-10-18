import { drawCompanyBranding } from '@/lib/companyBranding';

/**
 * Shared professional styling for branded intake PDF forms: consistent
 * header band, section headings, highlighted field rows, styled register
 * tables and signature panels used by every downloadable intake document.
 */

export const HEADER_CLEARANCE = 56;

/** Standard guidance, privacy and declaration wording carried on every form. */
export const FORM_NOTICES = {
  guidance:
    'How to complete: fill in every section in full. Print clearly, or complete and sign online in the app. Attach certified supporting documents where requested and return the signed form to the Compliance Office for filing in the Document Vault.',
  privacy:
    'Privacy: personal information collected on this form is handled in line with the Australian Privacy Principles (Privacy Act 1988) and the NDIS Rules, and is used only to deliver safe, quality supports and maintain required records.',
  declaration:
    'Declaration: I declare the information provided in this form is true, complete and current to the best of my knowledge, and I consent to it being stored and used for the purposes described above.',
};

const PAGE_MARGIN = 40;

function pageGuard(doc, y, needed) {
  if (y > doc.internal.pageSize.getHeight() - needed) {
    doc.addPage();
    return 54;
  }
  return y;
}

/** Header: company branding block, tinted title band with code pill, subtitle. */
export function drawFormHeader(doc, { title, code = '', subtitle = 'ComplianceHR Form', completedBy = '' }) {
  const pageW = doc.internal.pageSize.getWidth();
  let y = 54;

  drawCompanyBranding(doc, PAGE_MARGIN, y);
  y += HEADER_CLEARANCE;

  doc.setFillColor(244, 242, 253);
  doc.roundedRect(PAGE_MARGIN, y - 16, pageW - PAGE_MARGIN * 2, 38, 6, 6, 'F');
  doc.setFillColor(124, 58, 237);
  doc.rect(PAGE_MARGIN, y - 16, 4, 38, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14.5);
  doc.setTextColor(49, 27, 105);
  doc.text(title, 58, y + 3);
  if (code) {
    doc.setFontSize(8);
    const codeW = doc.getTextWidth(code) + 16;
    doc.setFillColor(124, 58, 237);
    doc.roundedRect(pageW - PAGE_MARGIN - 14 - codeW, y - 9, codeW, 16, 8, 8, 'F');
    doc.setTextColor(255);
    doc.text(code, pageW - PAGE_MARGIN - 14 - codeW + 8, y + 2.5);
  }
  y += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(subtitle, 58, y + 3);
  if (completedBy) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(76, 29, 149);
    doc.text(`Completed in app by ${completedBy}`, pageW - 58, y + 3, { align: 'right' });
  }
  y += 36;
  return y;
}

/** Tinted guidance panel: purpose line, completion instructions and privacy note. */
export function drawFormNotice(doc, y, { purpose = '', guidance = FORM_NOTICES.guidance, privacy = FORM_NOTICES.privacy } = {}) {
  const pageW = doc.internal.pageSize.getWidth();
  const textW = pageW - PAGE_MARGIN * 2 - 28;
  const purposeLines = purpose ? doc.splitTextToSize(purpose, textW) : [];
  const guidanceLines = doc.splitTextToSize(guidance, textW);
  const privacyLines = doc.splitTextToSize(privacy, textW);
  const panelH = 26 + (purposeLines.length + guidanceLines.length + privacyLines.length) * 11 + 20;
  y = pageGuard(doc, y, panelH + 20);
  y += 12;
  doc.setFillColor(248, 247, 254);
  doc.setDrawColor(214, 205, 240);
  doc.roundedRect(PAGE_MARGIN, y, pageW - PAGE_MARGIN * 2, panelH, 6, 6, 'FD');
  doc.setFillColor(124, 58, 237);
  doc.rect(PAGE_MARGIN, y, 4, panelH, 'F');
  let ty = y + 20;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(76, 29, 149);
  for (const line of purposeLines) { doc.text(line, PAGE_MARGIN + 18, ty); ty += 11; }
  ty += 4;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  for (const line of guidanceLines) { doc.text(line, PAGE_MARGIN + 18, ty); ty += 11; }
  ty += 4;
  doc.setFontSize(7.5);
  doc.setTextColor(110, 110, 130);
  for (const line of privacyLines) { doc.text(line, PAGE_MARGIN + 18, ty); ty += 11; }
  return y + panelH + 14;
}

/** Declaration statement panel shown above the authorisation signatures. */
export function drawDeclaration(doc, y, text = FORM_NOTICES.declaration) {
  const pageW = doc.internal.pageSize.getWidth();
  const lines = doc.splitTextToSize(text, pageW - PAGE_MARGIN * 2 - 28);
  const panelH = 24 + lines.length * 11 + 10;
  y = pageGuard(doc, y, panelH + 20);
  y += 12;
  doc.setFillColor(255, 251, 235);
  doc.setDrawColor(234, 217, 170);
  doc.roundedRect(PAGE_MARGIN, y, pageW - PAGE_MARGIN * 2, panelH, 6, 6, 'FD');
  doc.setFillColor(217, 139, 17);
  doc.rect(PAGE_MARGIN, y, 4, panelH, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(120, 76, 6);
  doc.text('DECLARATION', PAGE_MARGIN + 18, y + 17);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(110, 80, 20);
  let ty = y + 32;
  for (const line of lines) { doc.text(line, PAGE_MARGIN + 18, ty); ty += 11; }
  return y + panelH + 12;
}

/** Violet section heading with accent rule. */
export function drawSectionHeading(doc, y, heading) {
  y = pageGuard(doc, y, 60);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(76, 29, 149);
  doc.text(heading.toUpperCase(), PAGE_MARGIN, y);
  const textW = doc.getTextWidth(heading.toUpperCase());
  doc.setDrawColor(214, 205, 240);
  doc.setLineWidth(0.75);
  doc.line(PAGE_MARGIN + textW + 10, y - 3.5, doc.internal.pageSize.getWidth() - PAGE_MARGIN, y - 3.5);
  doc.setLineWidth(0.5);
  return y + 18;
}

/**
 * Field rows with highlighted labels. Blank forms get ruled answer lines;
 * completed forms get the recorded answer written underneath the label.
 */
export function drawFieldRows(doc, y, fields, values = {}, { alternate = true } = {}) {
  const pageW = doc.internal.pageSize.getWidth();
  for (let i = 0; i < fields.length; i++) {
    const label = fields[i].label;
    const value = values[label] || '';
    y = pageGuard(doc, y, value ? 62 : 46);
    if (alternate && i % 2 === 1) {
      doc.setFillColor(250, 249, 253);
      doc.rect(PAGE_MARGIN, y - 10, pageW - PAGE_MARGIN * 2, 26, 'F');
    }
    const labelW = Math.min(doc.getTextWidth(`${label}:`) + 12, 250);
    doc.setFillColor(237, 233, 254);
    doc.roundedRect(PAGE_MARGIN, y - 11, labelW, 17, 4, 4, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(67, 28, 128);
    doc.text(`${label}:`, PAGE_MARGIN + 7, y + 1);
    doc.setDrawColor(206, 198, 236);
    doc.line(PAGE_MARGIN + labelW + 10, y + 1, pageW - PAGE_MARGIN, y + 1);
    y += 22;
    if (value) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(25, 25, 35);
      const lines = doc.splitTextToSize(String(value), pageW - PAGE_MARGIN * 2 - 10);
      for (const line of lines) {
        y = pageGuard(doc, y, 34);
        doc.text(line, PAGE_MARGIN + 7, y);
        y += 13;
      }
      y += 6;
    } else {
      y += 4;
    }
  }
  return y + 8;
}

/** Styled register table: violet header, zebra tinted rows, soft borders. */
export function drawRegisterTable(doc, y, columns, { rows = 12, values = [], rowH = 30 } = {}) {
  const pageW = doc.internal.pageSize.getWidth();
  const margin = PAGE_MARGIN;
  const tableW = pageW - margin * 2;
  const colW = tableW / columns.length;

  y = pageGuard(doc, y, rowH * 2 + 60);

  doc.setFillColor(124, 58, 237);
  doc.rect(margin, y, tableW, rowH, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255);
  columns.forEach((c, i) => {
    const lines = doc.splitTextToSize(c, colW - 6);
    doc.text(lines, margin + i * colW + 3, y + 12);
  });
  y += rowH;

  for (let r = 0; r < rows; r++) {
    if (y > doc.internal.pageSize.getHeight() - rowH - 34) { doc.addPage(); y = 54; }
    if (r % 2 === 1) {
      doc.setFillColor(249, 247, 253);
      doc.rect(margin, y, tableW, rowH, 'F');
    }
    const entry = values[r];
    if (entry) {
      doc.setFillColor(255, 251, 235);
      doc.rect(margin, y, tableW, rowH, 'F');
    }
    doc.setDrawColor(224, 218, 240);
    doc.rect(margin, y, tableW, rowH, 'S');
    for (let i = 0; i < columns.length; i++) {
      doc.line(margin + i * colW, y, margin + i * colW, y + rowH);
    }
    if (entry) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(30, 30, 40);
      const lines = doc.splitTextToSize(String(entry), colW - 6);
      doc.text(lines[0] || '', margin + 4, y + 13);
    }
    y += rowH;
  }
  return y + 8;
}

/** Tinted authorisation panel with signature lines and completion log. */
export function drawSignatures(doc, y, {
  left = 'Authorised By (Signature)',
  right = 'Date',
  heading = 'Authorisation',
  completedBy = '',
  completedAt = '',
} = {}) {
  const pageW = doc.internal.pageSize.getWidth();
  const panelH = completedBy || completedAt ? 108 : 82;
  y = pageGuard(doc, y, panelH + 30);
  y += 14;
  doc.setFillColor(250, 249, 253);
  doc.setDrawColor(214, 205, 240);
  doc.roundedRect(PAGE_MARGIN, y, pageW - PAGE_MARGIN * 2, panelH, 6, 6, 'FD');
  doc.setFillColor(124, 58, 237);
  doc.rect(PAGE_MARGIN, y, 4, panelH, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(76, 29, 149);
  doc.text(heading.toUpperCase(), PAGE_MARGIN + 18, y + 20);
  const half = (pageW - PAGE_MARGIN * 2 - 40) / 2;
  const lineY = y + 42;
  doc.setDrawColor(140);
  doc.line(PAGE_MARGIN + 20, lineY, PAGE_MARGIN + 20 + half, lineY);
  doc.line(PAGE_MARGIN + 20 + half + 20, lineY, pageW - PAGE_MARGIN - 20, lineY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(110);
  doc.text(left, PAGE_MARGIN + 20, lineY + 13);
  doc.text(right, PAGE_MARGIN + 20 + half + 20, lineY + 13);
  if (completedBy || completedAt) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(76, 29, 149);
    let ly = lineY + 32;
    if (completedBy) { doc.text(`Completed in app by: ${completedBy}`, PAGE_MARGIN + 20, ly); ly += 13; }
    if (completedAt) { doc.text(`Completed on: ${completedAt}`, PAGE_MARGIN + 20, ly); }
  }
  return y + panelH + 12;
}