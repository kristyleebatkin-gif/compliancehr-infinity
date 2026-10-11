import { jsPDF } from 'jspdf';
import { getCompanyBranding, COMPLIANCE_HR_FOOTER } from '@/lib/companyBranding';

function buildBadgeDoc({ staffName = '', position = '', employeeNumber = '', colour = null }) {
  const branding = getCompanyBranding();
  const doc = new jsPDF({ unit: 'pt', format: [340, 210] });
  const w = 340;
  const [r, g, b] = Array.isArray(colour) && colour.length === 3 ? colour : [79, 70, 229];

  // Header band with logo + business name
  doc.setFillColor(r, g, b);
  doc.rect(0, 0, w, 62, 'F');
  let textX = 20;
  if (branding.logoDataUrl) {
    try {
      const props = doc.getImageProperties(branding.logoDataUrl);
      const ratio = Math.min(38 / props.width, 38 / props.height);
      const lw = props.width * ratio;
      const lh = props.height * ratio;
      doc.setFillColor(255);
      doc.roundedRect(16, 12, 38, 38, 4, 4, 'F');
      doc.addImage(branding.logoDataUrl, 16 + (38 - lw) / 2, 12 + (38 - lh) / 2, lw, lh);
      textX = 64;
    } catch {
      // Unsupported cached logo format: keep the name only.
    }
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255);
  doc.text(branding.companyName || 'ComplianceHR', textX, 30, { maxWidth: w - textX - 16 });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(branding.slogan || COMPLIANCE_HR_FOOTER, textX, 44, { maxWidth: w - textX - 16 });

  // Staff details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(15, 23, 42);
  doc.text(staffName || 'Staff Member', 20, 110, { maxWidth: w - 40 });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  doc.text(position || 'Support Worker', 20, 130);
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(employeeNumber ? `Employee No. ${employeeNumber}` : 'Employee No. -', 20, 150);
  doc.setFillColor(r, g, b);
  doc.rect(20, 162, 42, 2, 'F');

  // Footer strip
  doc.setDrawColor(226, 232, 240);
  doc.line(20, 180, w - 20, 180);
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('This badge remains the property of the business.', 20, 194);
  return doc;
}

export function downloadStaffBadgePdf(staff = {}) {
  buildBadgeDoc(staff).save(`Staff Badge - ${staff.staffName || 'Staff'}.pdf`);
}

export function staffBadgeBlob(staff = {}) {
  return buildBadgeDoc(staff).output('blob');
}