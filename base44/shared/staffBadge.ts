import { jsPDF } from 'npm:jspdf@4.2.1';

// Server-side name-tag rendering. Generates the badge PDF from the staff
// member's own profile and the organisation's stored branding, so an email
// function never has to trust a caller-supplied file reference.
const W = 340;
const H = 214;

async function logoToDataUrl(logoUrl) {
  if (!logoUrl) return '';
  const response = await fetch(logoUrl, { signal: AbortSignal.timeout(10000) });
  if (!response.ok) return '';
  const contentType = String(response.headers.get('content-type') || 'image/png').split(';')[0];
  if (!/image\/(png|jpe?g)/.test(contentType)) return '';
  const bytes = new Uint8Array(await response.arrayBuffer());
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return `data:${contentType};base64,${btoa(binary)}`;
}

function drawBrandStripe(doc, y, width) {
  const seg = width / 3;
  doc.setFillColor(37, 99, 235);
  doc.rect(0, y, seg, 4, 'F');
  doc.setFillColor(124, 58, 237);
  doc.rect(seg, y, seg, 4, 'F');
  doc.setFillColor(236, 72, 153);
  doc.rect(seg * 2, y, seg, 4, 'F');
}

export async function buildStaffBadgePdfBytes({ companyName = '', slogan = '', logoUrl = '', staffName = '', position = '', employeeNumber = '', colour = null } = {}) {
  const doc = new jsPDF({ unit: 'pt', format: [W, H] });
  const [r, g, b] = Array.isArray(colour) && colour.length === 3 ? colour : [124, 58, 237];

  // White header: logo, business name, slogan (nothing cut off)
  doc.setFillColor(255);
  doc.rect(0, 0, W, 66, 'F');
  let textX = 22;
  if (logoUrl) {
    try {
      const logoDataUrl = await logoToDataUrl(logoUrl);
      if (logoDataUrl) {
        const props = doc.getImageProperties(logoDataUrl);
        const ratio = Math.min(40 / props.width, 40 / props.height);
        const lw = props.width * ratio;
        const lh = props.height * ratio;
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(18, 13, 40, 40, 6, 6, 'S');
        doc.addImage(logoDataUrl, 18 + (40 - lw) / 2, 13 + (40 - lh) / 2, lw, lh);
        textX = 68;
      }
    } catch {
      // Unsupported logo format: keep the name only.
    }
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 27, 45);
  doc.text(companyName || 'ComplianceHR', textX, 30, { maxWidth: W - textX - 18 });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  const sloganLines = doc.splitTextToSize(slogan || 'Complete Control. Greater Confidence. Brighter Success.', W - textX - 18);
  doc.text(sloganLines.slice(0, 2), textX, 42, { lineHeight: 9 });

  drawBrandStripe(doc, 66, W);

  // Tinted body
  doc.setFillColor(250, 249, 253);
  doc.rect(0, 70, W, H - 70, 'F');

  // Staff details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text(staffName || 'Staff Member', 22, 108, { maxWidth: W - 44 - 74 });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  doc.text(position || 'Support Worker', 22, 128, { maxWidth: W - 44 - 74 });
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(employeeNumber ? `Employee No. ${employeeNumber}` : 'Employee No. -', 22, 148);

  // Photo placeholder (right)
  doc.setFillColor(255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(W - 88, 84, 66, 78, 6, 6, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('PHOTO', W - 55, 125, { align: 'center' });

  // Accent underline
  doc.setFillColor(r, g, b);
  doc.rect(22, 162, 42, 2.5, 'F');

  // Footer strip
  doc.setDrawColor(226, 232, 240);
  doc.line(22, 180, W - 22, 180);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(companyName || 'ComplianceHR', 22, 196, { maxWidth: W - 44 });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('This badge remains the property of the business.', W - 22, 196, { align: 'right' });
  return doc.output('arraybuffer');
}

export function bytesToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}