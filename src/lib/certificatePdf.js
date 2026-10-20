import { jsPDF } from 'jspdf';
import { loadCompanyBranding, getCompanyBranding } from '@/lib/companyBranding';
import certificateTextLayout from '@/lib/certificateTextLayout';

export const NAVY = '#7C3AED';
export const GOLD = '#EC4899';
export const TEAL_HEX = '#00A6A6';
export const SIGNATURE_IMAGE_URL = 'https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3cedb4a2f_IMG_1221.jpeg';

function drawCertificatePage(doc, data) {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const center = pageW / 2;
  const width = pageW - 152;
  const branding = getCompanyBranding();
  const text = (value, top, height, size = 10, weight = 'normal', color = '#282828', x = center, fieldWidth = width) => certificateTextLayout(doc, value, { x, top, height, size, weight, color, width: fieldWidth });
  doc.setDrawColor(NAVY); doc.setLineWidth(3);
  doc.rect(40, 40, pageW - 80, pageH - 80, 'S');
  doc.setDrawColor(GOLD); doc.setLineWidth(1);
  doc.rect(48, 48, pageW - 96, pageH - 96, 'S');
  if (branding.logoDataUrl) {
    const properties = doc.getImageProperties(branding.logoDataUrl);
    const ratio = Math.min(32 / properties.width, 32 / properties.height);
    const logoW = properties.width * ratio, logoH = properties.height * ratio;
    doc.addImage(branding.logoDataUrl, center - logoW / 2, 68 + (32 - logoH) / 2, logoW, logoH);
  }
  text(data.companyName || branding.companyName || 'ComplianceHR', 105, 25, 14, 'bold', NAVY);
  text(data.academyName || 'ComplianceHR Training Hub', 133, 18, 9, 'normal', NAVY);
  text(data.programName || 'Professional Development Program', 154, 24, 9, 'normal', TEAL_HEX);
  text('Certificate of Completion', 198, 37, 26, 'bold', NAVY);
  doc.setDrawColor(GOLD); doc.line(center - 60, 241, center + 60, 241);
  text('This certificate is proudly presented to', 250, 18, 10, 'normal', '#6E6E6E');
  text(data.learnerName || 'Learner', 278, 55, 28, 'bold', NAVY);
  doc.line(center - 130, 341, center + 130, 341);
  text('for successfully completing the training module', 355, 18, 10, 'normal', '#6E6E6E');
  text(data.moduleTitle || 'Training Module', 383, 54, 18, 'bold');
  text(`Module ${data.moduleNumber} · ${data.group || ''}`, 446, 30, 10, 'normal', TEAL_HEX);
  const scoreText = data.score != null ? `Achieved a competency score of ${data.score}%` : 'Competency requirements met';
  text(`${scoreText}\nValid for ${data.validityMonths || 12} months`, 487, 32, 10, 'normal', '#5A5A5A');
  const fmt = (value) => value ? new Date(value).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const expiry = data.date ? new Date(data.date) : null;
  if (expiry) expiry.setMonth(expiry.getMonth() + (data.validityMonths || 12));
  text('DATE ISSUED', 540, 16, 8, 'normal', '#777777', center - 110, 160);
  text('VALID UNTIL', 540, 16, 8, 'normal', '#777777', center + 110, 160);
  text(fmt(data.date), 561, 30, 11, 'bold', NAVY, center - 110, 160);
  text(fmt(expiry), 561, 30, 11, 'bold', NAVY, center + 110, 160);
  doc.setDrawColor('#AAAAAA'); doc.setLineWidth(0.7);
  doc.line(center - 190, 600, center - 30, 600); doc.line(center + 30, 600, center + 190, 600);
  doc.setDrawColor(GOLD); doc.line(center - 90, 642, center + 90, 642);
  text('KRISTY WHELAN', 650, 20, 11, 'bold', NAVY);
  text('FOUNDER & DIRECTOR', 675, 15, 8, 'normal', '#777777');
  text(`Certificate No: ${data.certificateNumber || ''}`, 714, 22, 8, 'normal', '#777777');
  text(`${data.companyName || 'ComplianceHR'} · ${data.academyName || 'ComplianceHR Training Hub'}\n${data.programName || 'Safeguarding Essentials'}`, 758, 28, 7, 'normal', '#777777');
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