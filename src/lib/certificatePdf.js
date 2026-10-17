import { jsPDF } from 'jspdf';
import { drawCompanyBranding, drawDocumentFooter, loadCompanyBranding, getCompanyBranding } from '@/lib/companyBranding';

export const NAVY = '#1B2A4A';
export const GOLD = '#C9A227';
export const TEAL_HEX = '#00A6A6';
export const SIGNATURE_IMAGE_URL = 'https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3cedb4a2f_IMG_1221.jpeg';

function drawCertificatePage(doc, data) {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 40;

  doc.setDrawColor(27, 42, 74);
  doc.setLineWidth(3);
  doc.rect(margin, margin, pageW - margin * 2, pageH - margin * 2, 'S');
  doc.setDrawColor(201, 162, 39);
  doc.setLineWidth(1);
  doc.rect(margin + 8, margin + 8, pageW - (margin + 8) * 2, pageH - (margin + 8) * 2, 'S');

  let y = 110;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(27, 42, 74);
  drawCompanyBranding(doc, pageW / 2 - 100, y, { fontSize: 14 });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(27, 42, 74);
  doc.text((data.academyName || `${getCompanyBranding().companyName || 'ComplianceHR'} Training Hub`).toUpperCase(), pageW / 2, y + 16, { align: 'center' });

  y += 60;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.text('Certificate of Completion', pageW / 2, y, { align: 'center' });
  doc.setDrawColor(201, 162, 39);
  doc.line(pageW / 2 - 60, y + 8, pageW / 2 + 60, y + 8);

  y += 44;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(110);
  doc.text('This certificate is proudly presented to', pageW / 2, y, { align: 'center' });
  y += 32;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(27, 42, 74);
  doc.text(data.learnerName || 'Learner', pageW / 2, y, { align: 'center' });
  doc.setDrawColor(201, 162, 39);
  doc.line(pageW / 2 - 130, y + 8, pageW / 2 + 130, y + 8);

  y += 36;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(110);
  doc.text('for successfully completing the training module', pageW / 2, y, { align: 'center' });
  y += 26;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(40);
  const titleLines = doc.splitTextToSize(data.moduleTitle || 'Training Module', pageW - 160);
  doc.text(titleLines, pageW / 2, y, { align: 'center' });
  y += titleLines.length * 18 + 6;
  doc.setFontSize(9);
  doc.setTextColor(0, 166, 166);
  doc.text(`Module ${data.moduleNumber} · ${data.group || ''}`, pageW / 2, y, { align: 'center' });

  y += 24;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(90);
  const scoreText = data.score != null ? `Achieved a competency score of ${data.score}%` : 'Competency requirements met';
  doc.text(`${scoreText} · Valid for ${data.validityMonths || 12} months`, pageW / 2, y, { align: 'center' });

  y += 50;
  doc.setFontSize(8);
  doc.setTextColor(140);
  doc.text('DATE ISSUED', pageW / 2 - 120, y, { align: 'center' });
  doc.text('VALID UNTIL', pageW / 2 + 120, y, { align: 'center' });
  const fmt = (d) => {
    if (!d) return '';
    const dt = new Date(d);
    return dt.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
  };
  const expiry = data.date ? new Date(new Date(data.date).setMonth(new Date(data.date).getMonth() + (data.validityMonths || 12))) : null;
  y += 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(27, 42, 74);
  doc.text(fmt(data.date), pageW / 2 - 120, y, { align: 'center' });
  doc.text(fmt(expiry && expiry.toISOString().slice(0, 10)), pageW / 2 + 120, y, { align: 'center' });
  doc.setDrawColor(120);
  doc.setLineWidth(0.7);
  doc.line(pageW / 2 - 180, y + 8, pageW / 2 - 60, y + 8);
  doc.line(pageW / 2 + 60, y + 8, pageW / 2 + 180, y + 8);

  y += 46;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(140);
  doc.text('FOUNDER & DIRECTOR', pageW / 2, y + 10, { align: 'center' });
  doc.setFontSize(9);
  doc.setTextColor(27, 42, 74);
  doc.setFont('helvetica', 'bold');
  doc.text('KRISTY WHELAN', pageW / 2, y - 6, { align: 'center' });
  doc.setDrawColor(201, 162, 39);
  doc.setLineWidth(0.7);
  doc.line(pageW / 2 - 90, y - 12, pageW / 2 + 90, y - 12);

  y += 36;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(140);
  doc.text(`Certificate No: ${data.certificateNumber || ''}`, pageW / 2, y, { align: 'center' });

  doc.setTextColor(130);
  doc.setFontSize(7);
  doc.text(
    `${data.companyName || 'ComplianceHR'} · ${data.academyName || 'ComplianceHR Training Hub'} · ${data.programName || 'Safeguarding Essentials™'}`,
    pageW / 2,
    pageH - 24,
    { align: 'center' },
  );
}

export async function buildCertificatePdfBlob(data) {
  await loadCompanyBranding().catch(() => {});
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  drawCertificatePage(doc, data);
  return doc.output('blob');
}

export async function downloadCertificatePdf(data, filename) {
  await loadCompanyBranding().catch(() => {});
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  drawCertificatePage(doc, data);
  doc.save(filename);
}

export default { buildCertificatePdfBlob, downloadCertificatePdf, NAVY, GOLD, TEAL_HEX, SIGNATURE_IMAGE_URL };