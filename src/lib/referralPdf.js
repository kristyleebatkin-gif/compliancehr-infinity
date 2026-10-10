import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { drawCompanyBranding, drawDocumentFooter } from './companyBranding';

function fieldLine(doc, label, value, x, y, width) {
  if (!value) return y;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`${label}:`, x, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  const lines = doc.splitTextToSize(String(value), width - 110);
  doc.text(lines, x + 110, y);
  return y + lines.length * 13 + 4;
}

function textBlock(doc, text, x, y, width) {
  if (!text) return y;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  const lines = doc.splitTextToSize(String(text), width);
  doc.text(lines, x, y);
  return y + lines.length * 13 + 6;
}

export function buildReferralDocument(referral) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 48;
  const width = pageWidth - margin * 2;
  let y = 0;

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 96, 'F');
  drawCompanyBranding(doc, margin, 44, { fontSize: 16 });
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(19);
  doc.text('Client Referral Form', margin, 74);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Confidential - authorised service coordination use only', margin, 88);
  y = 130;

  doc.setTextColor(71, 85, 105);
  doc.setFontSize(9);
  const meta = [
    `Referral ID: ${referral.referral_id || '-'}`,
    `Urgency: ${referral.urgency || 'Routine'}`,
    `Status: ${referral.status || 'Draft'}`,
    `Raised: ${referral.created_date ? format(new Date(referral.created_date), 'd MMM yyyy') : format(new Date(), 'd MMM yyyy')}`,
  ].join('     ');
  doc.text(meta, margin, y);
  y += 26;

  const sections = [
    {
      heading: 'Person being referred',
      rows: [
        ['Name', referral.client_name],
        ['Date of birth', referral.date_of_birth ? format(new Date(referral.date_of_birth), 'd MMM yyyy') : ''],
        ['Phone', referral.phone],
        ['Email', referral.email],
        ['Address', referral.address],
        ['Postcode', referral.postcode],
      ],
    },
    {
      heading: 'Service requested',
      rows: [
        ['Service type', referral.service_type],
        ['Urgency', referral.urgency],
        ['Client consent', referral.consent],
      ],
    },
    { heading: 'Reason for referral', block: referral.reason },
    { heading: 'Support needs', block: referral.support_needs },
    {
      heading: 'Referrer',
      rows: [
        ['Name', referral.referrer_name],
        ['Role', referral.referrer_role],
        ['Phone', referral.referrer_phone],
        ['Email', referral.referrer_email],
      ],
    },
    {
      heading: 'Receiving provider',
      rows: [
        ['Provider', referral.provider_name],
        ['Email', referral.provider_email],
        ['Phone', referral.provider_phone],
        ['Notes', referral.notes],
      ],
    },
  ];

  sections.forEach((section) => {
    if (y > pageHeight - 110) { doc.addPage(); y = 70; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.5);
    doc.setTextColor(15, 23, 42);
    doc.text(section.heading, margin, y);
    y += 8;
    doc.setFillColor(37, 99, 235);
    doc.rect(margin, y, 40, 2, 'F');
    y += 18;
    if (section.rows) {
      section.rows.forEach(([label, value]) => {
        if (y > pageHeight - 60) { doc.addPage(); y = 70; }
        y = fieldLine(doc, label, value, margin, y, width);
      });
      y += 10;
    }
    if (section.block) {
      if (y > pageHeight - 70) { doc.addPage(); y = 70; }
      doc.setFillColor(248, 250, 252);
      const blockLines = doc.splitTextToSize(String(section.block || ''), width - 20);
      const boxHeight = blockLines.length * 13 + 18;
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, y - 2, width, boxHeight, 4, 4, 'FD');
      doc.text(blockLines, margin + 10, y + 14);
      y += boxHeight + 14;
    }
    y += 12;
  });

  if (y > pageHeight - 80) { doc.addPage(); y = 70; }
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Consent declaration', margin, y);
  y += 16;
  y = textBlock(doc, 'The person named above (or their legal representative) has been informed of this referral and the information to be shared, and consent has been recorded in the Client Consent field. Information is shared only for the purpose of arranging appropriate supports.', margin, y, width);
  y += 8;
  doc.setDrawColor(148, 163, 184);
  doc.line(margin, y, margin + 220, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Referrer signature and date', margin, y + 14);

  drawDocumentFooter(doc, { title: 'Client Referral Form', code: referral.referral_id || '' });
  return doc;
}

export function downloadReferralDocument(referral) {
  const name = referral.referral_id || referral.client_name || 'referral';
  buildReferralDocument(referral).save(`Referral - ${String(name).replace(/[^\w -]/g, '')}.pdf`);
}

export function referralPdfBase64(referral) {
  const dataUri = buildReferralDocument(referral).output('datauristring');
  return String(dataUri).split(',')[1] || '';
}