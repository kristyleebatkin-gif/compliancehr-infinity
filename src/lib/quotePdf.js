import { jsPDF } from 'jspdf';
import { drawDocumentFooter, getCompanyBranding } from '@/lib/companyBranding';
import { lineAmount, parseLineItems } from '@/lib/ndisPriceGuide';

const money = (value) => `$${(Number(value) || 0).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function safeText(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function wrap(doc, text, x, y, width, lineHeight, fontSize = 9) {
  doc.setFontSize(fontSize);
  const lines = doc.splitTextToSize(safeText(text), width);
  lines.forEach((line, i) => doc.text(line, x, y + i * lineHeight));
  return lines.length * lineHeight;
}

function wrapMultiline(doc, text, x, y, width, lineHeight, fontSize = 8.5) {
  const parts = String(text || '').split('\n').filter(Boolean);
  let total = 0;
  parts.forEach((part) => {
    total += wrap(doc, part, x, y + total, width, lineHeight, fontSize);
  });
  return total;
}

const DEFAULT_TERMS = 'This quotation is valid for 30 days from the date of issue. Prices are based on the current NDIS Pricing Schedule and may change if the schedule is updated. NDIS supports are GST free. A formal service agreement will be prepared once the quotation is accepted.';

export function businessAddressLine(business = {}) {
  return [business.address_line, business.suburb, business.state, business.postcode].filter(Boolean).join(', ');
}

export function buildQuotePdf(quote, business = {}) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 44;
  const contentW = pageW - margin * 2;
  const branding = getCompanyBranding();

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageW, 96, 'F');
  if (branding.logoDataUrl) {
    try {
      const props = doc.getImageProperties(branding.logoDataUrl);
      const ratio = Math.min(56 / props.width, 56 / props.height);
      doc.addImage(branding.logoDataUrl, margin, 20, props.width * ratio, props.height * ratio);
    } catch { /* text header still renders */ }
  }
  const headerX = branding.logoDataUrl ? margin + 68 : margin;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(safeText(business.business_name || 'Quotation'), headerX, 38, { maxWidth: 320 });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  const headerLines = [
    businessAddressLine(business),
    [business.phone, business.email, business.website].filter(Boolean).join('  |  '),
    [business.abn && `ABN ${business.abn}`, business.ndis_provider_number && `NDIS Provider ${business.ndis_provider_number}`, business.contact_person && `Contact: ${business.contact_person}`].filter(Boolean).join('  |  '),
  ];
  headerLines.forEach((line, i) => {
    if (line) doc.text(line, headerX, 52 + i * 12, { maxWidth: 420 });
  });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text('QUOTE', pageW - margin, 44, { align: 'right' });
  if (quote.quote_number) {
    doc.setFontSize(10);
    doc.text(quote.quote_number, pageW - margin, 58, { align: 'right' });
  }

  let y = 132;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Quote number', margin, y);
  doc.text('Quote date', margin + 170, y);
  doc.text('Valid until', margin + 340, y);
  doc.text('Biller type', margin + 480, y);
  doc.setFont('helvetica', 'normal');
  y += 14;
  doc.text(safeText(quote.quote_number) || '-', margin, y);
  doc.text(quote.issue_date || '-', margin + 170, y);
  doc.text(quote.expiry_date || '-', margin + 340, y);
  doc.text(quote.biller_type || '-', margin + 480, y);
  y += 26;

  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageW - margin, y);
  y += 20;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('QUOTED TO', margin, y);
  doc.text('PARTICIPANT', margin + 300, y);
  y += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  const clientLines = [safeText(quote.client_name), safeText(quote.client_email), safeText(quote.client_address)].filter(Boolean);
  clientLines.forEach((line, i) => doc.text(line, margin, y + i * 13, { maxWidth: 270 }));
  const participantLines = [safeText(quote.participant_name), quote.ndis_number && `NDIS: ${quote.ndis_number}`, safeText(quote.participant_address)].filter(Boolean);
  participantLines.forEach((line, i) => doc.text(line, margin + 300, y + i * 13, { maxWidth: 250 }));
  y += Math.max(clientLines.length, participantLines.length, 2) * 13 + 12;

  const lines = parseLineItems(quote.line_items);
  const cols = [
    { label: 'Support item', x: margin, w: 210 },
    { label: 'Description', x: margin + 216, w: 150 },
    { label: 'Unit', x: margin + 372, w: 40 },
    { label: 'Qty', x: margin + 416, w: 40 },
    { label: 'Rate', x: margin + 460, w: 60 },
    { label: 'Amount', x: pageW - margin, w: 0 },
  ];
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentW, 22, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  cols.forEach((c) => {
    if (c.label === 'Amount') doc.text(c.label, c.x, y + 15, { align: 'right' });
    else doc.text(c.label, c.x, y + 15, { maxWidth: c.w });
  });
  y += 22;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  if (lines.length === 0) {
    doc.setFontSize(8);
    doc.text('Support item code', margin + 4, y + 10);
    doc.text('Description of support', margin + 216, y + 10);
    doc.text('Unit', margin + 372, y + 10);
    doc.text('Qty', margin + 416, y + 10);
    doc.text('Rate', margin + 460, y + 10);
    doc.text('Amount', pageW - margin, y + 10, { align: 'right' });
    y += 30;
  }
  lines.forEach((line, index) => {
    const rowHeight = 30;
    if (y + rowHeight > 700) { doc.addPage(); y = 60; }
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentW, rowHeight, 'F');
    }
    const cellY = y + 14;
    wrap(doc, safeText(line.code) || '-', cols[0].x + 4, cellY, cols[0].w - 8, 10, 8);
    wrap(doc, safeText(line.description), cols[1].x + 4, cellY, cols[1].w - 8, 10, 8);
    doc.text(safeText(line.unit), cols[2].x, cellY);
    doc.text(String(line.qty ?? ''), cols[3].x, cellY);
    doc.text(money(line.unit_price), cols[4].x, cellY, { maxWidth: 58 });
    doc.text(money(lineAmount(line)), pageW - margin, cellY, { align: 'right' });
    y += rowHeight;
  });
  y += 10;

  const subtotal = lines.length
    ? lines.reduce((sum, line) => sum + lineAmount(line), 0)
    : (Number(quote.subtotal) || Number(quote.total) || 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Subtotal', pageW - margin - 100, y);
  doc.text(money(subtotal), pageW - margin, y, { align: 'right' });
  y += 15;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('GST', pageW - margin - 100, y);
  doc.text('Included (NDIS supports are GST-free)', pageW - margin, y, { align: 'right' });
  y += 16;
  doc.setDrawColor(15, 23, 42);
  doc.line(pageW - margin - 110, y, pageW - margin, y);
  y += 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('QUOTE TOTAL', pageW - margin - 100, y);
  doc.text(money(subtotal), pageW - margin, y, { align: 'right' });
  y += 30;

  if (y > 560) { doc.addPage(); y = 60; }

  // Terms and conditions
  doc.setFillColor(248, 250, 252);
  const termsText = safeText(quote.terms_conditions) || business.quote_terms || DEFAULT_TERMS;
  doc.setFontSize(8.5);
  const termsHeight = doc.splitTextToSize(termsText, contentW - 24).length * 11 + 30;
  doc.roundedRect(margin, y, contentW, termsHeight, 6, 6, 'F');
  y += 16;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('QUOTE TERMS AND CONDITIONS', margin + 12, y);
  y += 12;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  wrapMultiline(doc, termsText, margin + 12, y, contentW - 24, 11);
  y += termsHeight - 12;

  if (y > 640) { doc.addPage(); y = 60; }

  // Acceptance
  y += 20;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.text('ACCEPTANCE OF QUOTE', margin, y);
  y += 12;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('To accept this quotation, sign below and return a copy. A formal service agreement will then be issued.', margin, y, { maxWidth: contentW });
  y += 26;
  doc.setDrawColor(148, 163, 184);
  doc.line(margin, y, margin + 180, y);
  doc.line(margin + 210, y, margin + 350, y);
  doc.line(margin + 380, y, margin + 460, y);
  doc.setFontSize(8);
  doc.text('Client signature', margin, y + 12);
  doc.text('Name', margin + 210, y + 12);
  doc.text('Date', margin + 380, y + 12);

  if (quote.notes) {
    y += 34;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('NOTES', margin, y);
    y += 12;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    wrapMultiline(doc, quote.notes, margin, y, contentW, 11);
  }

  drawDocumentFooter(doc, { title: `Quote ${quote.quote_number || ''}` });
  return doc;
}

export function quotePdfFilename(quote) {
  return `Quote-${(quote.quote_number || 'draft').replace(/[^\w-]+/g, '-')}.pdf`;
}

export function downloadQuotePdf(quote, business) {
  buildQuotePdf(quote, business).save(quotePdfFilename(quote));
}

export function printQuotePdf(quote, business) {
  const url = buildQuotePdf(quote, business).output('bloburl');
  window.open(url, '_blank');
}

export function quotePdfBase64(quote, business) {
  return buildQuotePdf(quote, business).output('datauristring').split(',').pop();
}

export function downloadQuoteTemplatePdf(business) {
  buildQuotePdf({ quote_number: '', line_items: '[]' }, business).save('Quote-Template.pdf');
}