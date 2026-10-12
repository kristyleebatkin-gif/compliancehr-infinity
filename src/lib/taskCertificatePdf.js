import { jsPDF } from 'jspdf';
import { getCompanyBranding, COMPLIANCE_HR_FOOTER } from '@/lib/companyBranding';

const ordinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
};

export function generateTaskCertificate({
  staffName, rank, points, totalTasks, fastestTask, slowestTask, seasonLabel, voucherText, generatedBy,
}) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  const branding = getCompanyBranding();

  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(6);
  doc.rect(18, 18, w - 36, h - 36);
  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(1.5);
  doc.rect(30, 30, w - 60, h - 60);

  if (branding.logoDataUrl) {
    try {
      const p = doc.getImageProperties(branding.logoDataUrl);
      const ratio = Math.min(120 / p.width, 64 / p.height);
      doc.addImage(branding.logoDataUrl, w / 2 - (p.width * ratio) / 2, 56, p.width * ratio, p.height * ratio);
    } catch { /* unsupported cached logo format */ }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  doc.text(branding.companyName || 'ComplianceHR', w / 2, 150, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  doc.text('Employee Task Completion Competition - Certificate of Achievement', w / 2, 172, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(79, 70, 229);
  doc.text(staffName, w / 2, 226, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(51, 65, 85);
  const lines = [
    `${ordinal(rank || 1)} place - Season ${seasonLabel}`,
    `${points} point${points === 1 ? '' : 's'} - ${totalTasks} task${totalTasks === 1 ? '' : 's'} completed`,
    voucherText ? `Prize: ${voucherText}` : '',
    fastestTask ? `Fastest task: ${fastestTask}` : '',
    slowestTask ? `Slowest task: ${slowestTask}` : '',
  ].filter(Boolean);
  let y = 258;
  lines.forEach((line) => {
    doc.text(line, w / 2, y, { align: 'center', maxWidth: w - 140 });
    y += 18;
  });

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Awarded on ${new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}${generatedBy ? ` by ${generatedBy}` : ''}`,
    w / 2, h - 70, { align: 'center' },
  );
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(49, 46, 129);
  doc.text(branding.slogan || COMPLIANCE_HR_FOOTER, w / 2, h - 50, { align: 'center' });

  doc.save(`Task Certificate - ${staffName}.pdf`);
}