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

export function buildInvoicePdf(invoice, business = {}) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 44;
  const contentW = pageW - margin * 2;
  const branding = getCompanyBranding();

  // Header band
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
  doc.text(safeText(business.business_name || branding.companyName || 'Invoice'), headerX, 38, { maxWidth: 320 });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  const headerLines = [
    [business.address_line, business.suburb, business.state, business.postcode].filter(Boolean).join(', '),
    [business.phone, business.email, business.website].filter(Boolean).join('  |  '),
    [business.abn && `ABN ${business.abn}`, business.ndis_provider_number && `NDIS Provider ${business.ndis_provider_number}`].filter(Boolean).join('  |  '),
  ];
  headerLines.forEach((line, i) => {
    if (line) doc.text(line, headerX, 52 + i * 12, { maxWidth: 420 });
  });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text('INVOICE', pageW - margin, 44, { align: 'right' });

  let y = 132;

  // Meta row
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Invoice number', margin, y);
  doc.text('Issue date', margin + 170, y);
  doc.text('Due date', margin + 340, y);
  if (invoice.status) doc.text('Status', margin + 480, y);
  doc.setFont('helvetica', 'normal');
  y += 14;
  doc.text(safeText(invoice.invoice_number) || '-', margin, y);
  doc.text(invoice.issue_date || '-', margin + 170, y);
  doc.text(invoice.due_date || '-', margin + 340, y);
  doc.text(invoice.status || '-', margin + 480, y);
  y += 26;

  // Bill to
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageW - margin, y);
  y += 20;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('BILLED TO', margin, y);
  doc.text('PARTICIPANT', margin + 300, y);
  y += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  const billerLines = [
    safeText(invoice.client_name),
    invoice.biller_type || '',
    safeText(invoice.client_email),
    safeText(invoice.client_address),
  ].filter(Boolean);
  billerLines.forEach((line, i) => doc.text(line, margin, y + i * 13, { maxWidth: 270 }));
  const participantLines = [
    safeText(invoice.participant_name),
    invoice.ndis_number && `NDIS: ${invoice.ndis_number}`,
    safeText(invoice.participant_address),
  ].filter(Boolean);
  participantLines.forEach((line, i) => doc.text(line, margin + 300, y + i * 13, { maxWidth: 250 }));
  y += Math.max(billerLines.length, participantLines.length, 2) * 13 + 12;

  // Table
  const lines = parseLineItems(invoice.line_items);
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
    doc.text(safeText(invoice.description) || 'Supports delivered', margin + 4, y + 16);
    y += 30;
  }
  lines.forEach((line, index) => {
    const rowHeight = 30;
    if (y + rowHeight > 720) { doc.addPage(); y = 60; }
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

  // Totals
  const subtotal = lines.length
    ? lines.reduce((sum, line) => sum + lineAmount(line), 0)
    : (Number(invoice.subtotal) || Number(invoice.amount) || 0);
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
  doc.text('TOTAL DUE', pageW - margin - 100, y);
  doc.text(money(subtotal), pageW - margin, y, { align: 'right' });
  y += 30;

  // Payment details + terms
  if (y > 620) { doc.addPage(); y = 60; }
  doc.setFillColor(248, 250, 252);
  const boxTop = y;
  const paymentLines = (safeText(invoice.payment_details) || '').split('\n').filter(Boolean);
  const termsLines = (safeText(invoice.payment_terms) || '').split('\n').filter(Boolean);
  const notesLines = (safeText(invoice.notes) || '').split('\n').filter(Boolean);
  const boxLines = paymentLines.length + termsLines.length + notesLines.length + 4;
  doc.roundedRect(margin, boxTop, contentW, boxLines * 12 + 18, 6, 6, 'F');
  y += 16;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('PAYMENT DETAILS', margin + 12, y);
  y += 12;
  doc.setFont('helvetica', 'normal');
  paymentLines.forEach((line) => {
    doc.text(line, margin + 12, y, { maxWidth: contentW - 24 });
    y += 12;
  });
  if (termsLines.length) {
    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT TERMS', margin + 12, y);
    y += 12;
    doc.setFont('helvetica', 'normal');
    termsLines.forEach((line) => {
      doc.text(line, margin + 12, y, { maxWidth: contentW - 24 });
      y += 12;
    });
  }
  if (notesLines.length) {
    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.text('NOTES', margin + 12, y);
    y += 12;
    doc.setFont('helvetica', 'normal');
    notesLines.forEach((line) => {
      doc.text(line, margin + 12, y, { maxWidth: contentW - 24 });
      y += 12;
    });
  }

  drawDocumentFooter(doc, { title: `Invoice ${invoice.invoice_number || ''}` });
  return doc;
}

export function invoicePdfFilename(invoice) {
  return `Invoice-${(invoice.invoice_number || 'draft').replace(/[^\w-]+/g, '-')}.pdf`;
}

export function downloadInvoicePdf(invoice, business) {
  const doc = buildInvoicePdf(invoice, business);
  doc.save(invoicePdfFilename(invoice));
}

export function printInvoicePdf(invoice, business) {
  const doc = buildInvoicePdf(invoice, business);
  const url = doc.output('bloburl');
  window.open(url, '_blank');
}

export function invoicePdfBase64(invoice, business) {
  const doc = buildInvoicePdf(invoice, business);
  const dataUri = doc.output('datauristring');
  return dataUri.split(',').pop();
}

// Blank, professional-style invoice template with the business branding pre-filled.
export function downloadInvoiceTemplatePdf(business = {}) {
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
  doc.text(safeText(business.business_name || branding.companyName || 'Invoice'), headerX, 38, { maxWidth: 320 });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  const headerLines = [
    [business.address_line, business.suburb, business.state, business.postcode].filter(Boolean).join(', '),
    [business.phone, business.email, business.website].filter(Boolean).join('  |  '),
    [business.abn && `ABN ${business.abn}`, business.ndis_provider_number && `NDIS Provider ${business.ndis_provider_number}`].filter(Boolean).join('  |  '),
  ];
  headerLines.forEach((line, i) => {
    if (line) doc.text(line, headerX, 52 + i * 12, { maxWidth: 420 });
  });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text('INVOICE', pageW - margin, 44, { align: 'right' });

  let y = 132;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Invoice number', margin, y);
  doc.text('Issue date', margin + 170, y);
  doc.text('Due date', margin + 340, y);
  doc.text('Status', margin + 480, y);
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y + 6, pageW - margin, y + 6);
  y += 26;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('BILLED TO', margin, y);
  doc.text('PARTICIPANT', margin + 300, y);
  y += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  ['Name / organisation', 'Email', 'Address'].forEach((line, i) => {
    doc.setDrawColor(203, 213, 225);
    doc.line(margin, y + 4 + i * 22, margin + 250, y + 4 + i * 22);
    doc.line(margin + 300, y + 4 + i * 22, margin + 550, y + 4 + i * 22);
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.text(line, margin, y + 16 + i * 22);
    doc.text(line === 'Name / organisation' ? 'Name' : line, margin + 300, y + 16 + i * 22);
    doc.setFontSize(10);
  });
  y += 88;

  // Blank line-item table
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
  doc.setTextColor(148, 163, 184);
  for (let r = 0; r < 6; r++) {
    if (r % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentW, 30, 'F');
    }
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + 30, pageW - margin, y + 30);
    y += 30;
  }
  doc.text('List each support delivered, with its NDIS item number, quantity and rate.', margin, y + 14);
  y += 40;

  // Totals block
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  ['Subtotal', 'GST (NDIS supports are GST free)', 'Total due'].forEach((label, i) => {
    const isTotal = i === 2;
    if (isTotal) {
      doc.setFillColor(15, 23, 42);
      doc.rect(pageW - margin - 200, y - 4, 200, 22, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(label, pageW - margin - 190, y + 10);
      doc.text('$', pageW - margin - 10, y + 10, { align: 'right' });
      doc.setFont('helvetica', 'normal');
    } else {
      doc.text(label, pageW - margin - 190, y);
      doc.text('$', pageW - margin - 10, y, { align: 'right' });
    }
    y += 22;
  });

  // Payment instructions
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('PAYMENT DETAILS', margin, y + 8);
  y += 22;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  const payLines = [
    [business.bank_name && `Bank: ${business.bank_name}`, business.bsb && `BSB: ${business.bsb}`, business.account_number && `Account: ${business.account_number}`, business.account_name && `Name: ${business.account_name}`].filter(Boolean).join('  |  '),
    business.payment_terms_note || business.default_invoice_notes || '',
  ].filter(Boolean);
  payLines.forEach((line) => {
    doc.text(line, margin, y, { maxWidth: contentW });
    y += 13;
  });

  drawDocumentFooter(doc, { title: 'Invoice Template' });
  doc.save('Invoice-Template.pdf');
}