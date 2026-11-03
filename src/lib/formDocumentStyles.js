import { registerDocumentHeader, ensurePdfSpace } from '@/lib/pdfPageLayout';
import { drawPdfFieldBoxes } from '@/lib/pdfFieldBoxes';
import { drawPdfRegisterTable } from '@/lib/pdfRegisterTable';

export const HEADER_CLEARANCE = 56;

export const FORM_NOTICES = {
  welcome:
    'Please take your time to fill in this form and read each part carefully. This information helps us support you better and keeps you safer. There is no rush, and you can ask us for help with any question at any time.',
  guidance:
    'How to complete: answer each relevant question, tick the stated options and write clearly on the ruled lines. Complete online if preferred. Use Not applicable where appropriate. Cultural identity and other optional personal questions may be left unanswered. Provide supporting documents only when relevant to the supports or purpose of this form.',
  privacy:
    'Privacy: personal information collected on this form is handled in line with the Australian Privacy Principles (Privacy Act 1988) and the NDIS Rules, and is used only to deliver safe, quality supports and maintain required records.',
  declaration:
    'Declaration: the information I have provided is accurate and current to the best of my knowledge. My consent choices and any limits are recorded separately. Signing this form does not give blanket authority to share information or replace any required clinical approval.',
};

const PAGE_MARGIN = 40;

function pageGuard(doc, y, needed) {
  return ensurePdfSpace(doc, y, needed);
}

export function drawFormHeader(doc, options) {
  return registerDocumentHeader(doc, options);
}

export function drawFormNotice(doc, y, { purpose = '', guidance = FORM_NOTICES.guidance, privacy = FORM_NOTICES.privacy } = {}) {
  const pageW = doc.internal.pageSize.getWidth();
  const textW = pageW - PAGE_MARGIN * 2 - 36;
  const blocks = [
    { text: purpose, size: 9, bold: true },
    { text: FORM_NOTICES.welcome, size: 8.5, italic: true, accent: true },
    { text: guidance, size: 8.5 },
    { text: privacy, size: 8 },
  ].filter((block) => block.text).map((block) => {
    doc.setFont('helvetica', block.bold ? 'bold' : block.italic ? 'italic' : 'normal'); doc.setFontSize(block.size);
    return { ...block, lines: doc.splitTextToSize(block.text, textW) };
  });
  const panelH = 28 + blocks.reduce((height, block) => height + block.lines.length * 12 + 10, 0);
  y = pageGuard(doc, y, panelH + 20);
  doc.setFillColor(240, 247, 255); doc.setDrawColor(0, 114, 255); doc.setLineWidth(0.8);
  doc.roundedRect(PAGE_MARGIN, y, pageW - PAGE_MARGIN * 2, panelH, 6, 6, 'FD');
  let ty = y + 21;
  for (const block of blocks) {
    doc.setFont('helvetica', block.bold ? 'bold' : block.italic ? 'italic' : 'normal'); doc.setFontSize(block.size);
    doc.setTextColor(...(block.accent ? [0, 114, 255] : block.bold ? [10, 43, 109] : [71, 85, 105]));
    doc.text(block.lines, PAGE_MARGIN + 18, ty, { lineHeightFactor: 12 / block.size });
    ty += block.lines.length * 12 + 10;
  }
  doc.setLineWidth(0.5);
  return y + panelH + 22;
}

export function drawDeclaration(doc, y, text = FORM_NOTICES.declaration) {
  const pageW = doc.internal.pageSize.getWidth();
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5);
  const lines = doc.splitTextToSize(text, pageW - PAGE_MARGIN * 2 - 36);
  const panelH = 44 + lines.length * 12;
  y = pageGuard(doc, y, panelH + 20);
  y += 12;
  doc.setFillColor(240, 247, 255);
  doc.setDrawColor(186, 230, 253);
  doc.roundedRect(PAGE_MARGIN, y, pageW - PAGE_MARGIN * 2, panelH, 6, 6, 'FD');
  doc.setFillColor(10, 43, 109);
  doc.rect(PAGE_MARGIN, y, 4, panelH, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(10, 43, 109);
  doc.text('DECLARATION', PAGE_MARGIN + 18, y + 17);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(10, 43, 109);
  let ty = y + 32;
  for (const line of lines) { doc.text(line, PAGE_MARGIN + 18, ty); ty += 11; }
  return y + panelH + 12;
}

export function drawSectionHeading(doc, y, heading) {
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5);
  const width = doc.internal.pageSize.getWidth() - PAGE_MARGIN * 2;
  const lines = doc.splitTextToSize(String(heading).toUpperCase(), width);
  const height = lines.length * 14 + 18;
  y = pageGuard(doc, y, height + 72);
  doc.setTextColor(10, 43, 109);
  doc.text(lines, PAGE_MARGIN, y + 10, { lineHeightFactor: 1.3333 });
  doc.setDrawColor(0, 114, 255); doc.setLineWidth(0.8);
  doc.line(PAGE_MARGIN, y + lines.length * 14 + 4, PAGE_MARGIN + width, y + lines.length * 14 + 4);
  doc.setLineWidth(0.5);
  return y + height;
}

export function drawFieldRows(doc, y, fields, values = {}, options = {}) {
  return drawPdfFieldBoxes(doc, y, fields, values, options);
}

export function drawRegisterTable(doc, y, columns, options = {}) {
  return drawPdfRegisterTable(doc, y, columns, options);
}

export function drawSignatures(doc, y, {
  left = 'Authorised By (Signature)', right = 'Date', heading = 'Authorisation', completedBy = '', completedAt = '',
} = {}) {
  y = drawSectionHeading(doc, y, heading);
  y = drawFieldRows(doc, y, [{ label: left }, { label: right }]);
  const log = [completedBy && `Completed in app by: ${completedBy}`, completedAt && `Completed on: ${completedAt}`].filter(Boolean);
  if (log.length) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5);
    const lines = doc.splitTextToSize(log.join('  |  '), doc.internal.pageSize.getWidth() - PAGE_MARGIN * 2);
    y = pageGuard(doc, y, lines.length * 12 + 16);
    doc.setTextColor(71, 85, 105);
    doc.text(lines, PAGE_MARGIN, y + 9, { lineHeightFactor: 1.41176 });
    y += lines.length * 12 + 16;
  }
  return y;
}