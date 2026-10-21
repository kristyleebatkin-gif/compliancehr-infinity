import { jsPDF } from 'jspdf';
import { drawCompanyBranding, drawDocumentFooter } from '@/lib/companyBranding';

export default function downloadComplianceAuditChecklist(checks) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const width = doc.internal.pageSize.getWidth();
  doc.setFillColor('#5B2C83'); doc.rect(0, 0, width, 100, 'F');
  doc.setFillColor('#00A6A6'); doc.rect(0, 100, width, 6, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(24); doc.setTextColor('#ffffff');
  doc.text('Compliance Audit Checklist', 40, 49);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
  doc.text(`Management review - ${new Date().toLocaleDateString('en-AU')}`, 40, 73);
  drawCompanyBranding(doc, 40, 135, { fontSize: 12, logoSize: 18 });
  doc.setTextColor('#6b6b7b'); doc.setFontSize(9);
  doc.text('Companion to the Compliance Audit Report. Tick each box after reviewing the evidence.', 40, 171);
  let y = 205;
  checks.forEach(({ label, evidence }) => {
    doc.setDrawColor('#5B2C83'); doc.rect(40, y - 9, 10, 10);
    doc.setTextColor('#5B2C83'); doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
    doc.text(label, 60, y);
    doc.setTextColor('#6b6b7b'); doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
    const lines = doc.splitTextToSize(evidence, width - 105);
    doc.text(lines, 60, y + 16);
    y += 34 + lines.length * 11;
  });
  doc.setTextColor('#1f1438'); doc.setFontSize(10);
  doc.text('Findings / follow-up actions:', 40, y + 7);
  doc.setDrawColor('#e5e5ea');
  [25, 45, 65].forEach((offset) => doc.line(40, y + offset, width - 40, y + offset));
  doc.text('Reviewed by: ______________________    Date: __________________', 40, y + 92);
  doc.setFontSize(8);
  doc.text('Counts reflect accessible records at generation time; review supporting evidence before signing.', 40, y + 112);
  drawDocumentFooter(doc, { title: 'Compliance Audit Checklist', code: 'CM-AUD-CHK' });
  doc.save(`compliance-audit-checklist-${new Date().toISOString().slice(0, 10)}.pdf`);
}