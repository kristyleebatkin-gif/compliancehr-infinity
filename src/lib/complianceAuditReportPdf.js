import { jsPDF } from 'jspdf';
import { drawCompanyBranding, drawDocumentFooter } from '@/lib/companyBranding';

/**
 * Compliance Audit Report PDF: current compliance status and readiness for
 * every section of the master compliance checklist, with company branding.
 */
export function downloadComplianceAuditReport({ sections, generatedBy = '', generatedAt = '', overallReadiness = 0, correctiveActions = [] }) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  let y = 64;

  drawCompanyBranding(doc, 40, y, { fontSize: 18 });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120);
  doc.text('COMPLIANCE AUDIT REPORT', pageW - 40, y, { align: 'right' });
  y += 34;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(30);
  doc.text('Compliance Audit Report', 40, y);
  y += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(110);
  const meta = [generatedAt && `Generated ${generatedAt}`, generatedBy && `Prepared by ${generatedBy}`].filter(Boolean).join('  |  ');
  doc.text(meta || 'Compliance & Report Centre', 40, y);
  y += 14;

  doc.setFillColor(226, 240, 252);
  doc.roundedRect(40, y, pageW - 80, 46, 5, 5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(23, 78, 138);
  doc.text(`Overall readiness: ${overallReadiness}%`, 54, y + 19);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(60);
  const compliant = sections.filter((s) => s.status === 'Compliant').length;
  const attention = sections.filter((s) => s.status === 'Needs Attention').length;
  const risk = sections.filter((s) => s.status === 'At Risk').length;
  doc.text(`Sections: ${sections.length} total  |  ${compliant} compliant  |  ${attention} need attention  |  ${risk} at risk`, 54, y + 34);
  y += 66;

  const STATUS_COLOURS = {
    Compliant: [22, 163, 74],
    'Needs Attention': [202, 138, 4],
    'At Risk': [220, 38, 38],
  };

  for (const section of sections) {
    if (y > pageH - 150) {
      doc.addPage();
      y = 64;
    }
    doc.setDrawColor(210);
    doc.line(40, y, pageW - 40, y);
    y += 18;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30);
    doc.text(section.title, 40, y, { maxWidth: pageW - 230 });

    const colour = STATUS_COLOURS[section.status] || [100, 116, 139];
    doc.setFillColor(...colour);
    const statusWidth = doc.getTextWidth(section.status) + 14;
    doc.roundedRect(pageW - 40 - statusWidth, y - 10, statusWidth, 16, 4, 4, 'F');
    doc.setFontSize(8.5);
    doc.setTextColor(255);
    doc.text(section.status, pageW - 40 - statusWidth + 7, y + 1);
    y += 14;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(70);
    doc.text(`Readiness: ${section.readiness == null ? 'n/a' : `${Math.round(section.readiness)}%`}`, 40, y);
    y += 14;

    doc.setFontSize(9);
    doc.setTextColor(90);
    for (const line of section.lines || []) {
      if (y > pageH - 90) {
        doc.addPage();
        y = 64;
      }
      const wrapped = doc.splitTextToSize(line, pageW - 90);
      doc.text(wrapped, 52, y);
      y += wrapped.length * 12;
    }
    y += 8;
  }

  // Corrective action register: every non-compliant section, plus any caller-supplied actions.
  const register = correctiveActions.slice();
  for (const s of sections) {
    if (s.status === 'Compliant') continue;
    register.push({
      action: `Bring "${s.title}" back to compliance${s.readiness != null ? ` (readiness ${Math.round(s.readiness)}%)` : ''}`,
      owner: s.owner || 'Compliance Manager',
      due: s.target_date || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      status: s.status === 'At Risk' ? 'Urgent' : 'Open',
    });
  }
  if (y > pageH - 140) { doc.addPage(); y = 64; }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30);
  doc.text(`Corrective Action Register (${register.length} open)`, 40, y);
  y += 18;
  if (register.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(70);
    doc.text('No corrective actions required: all compliance sections were compliant at audit time.', 40, y);
    y += 20;
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(60);
    doc.text('ACTION', 40, y);
    doc.text('OWNER', pageW * 0.5, y);
    doc.text('DUE', pageW * 0.72, y, { align: 'right' });
    doc.text('STATUS', pageW - 40, y, { align: 'right' });
    y += 12;
    doc.setDrawColor(210);
    doc.line(40, y, pageW - 40, y);
    y += 13;
    doc.setFont('helvetica', 'normal');
    for (const a of register) {
      if (y > pageH - 90) { doc.addPage(); y = 64; }
      doc.setFontSize(9);
      doc.setTextColor(50);
      doc.text(doc.splitTextToSize(a.action, pageW * 0.44)[0], 40, y);
      doc.text(a.owner, pageW * 0.5, y);
      doc.text(a.due, pageW * 0.72, y, { align: 'right' });
      doc.setTextColor(...(a.status === 'Urgent' ? [220, 38, 38] : [202, 138, 4]));
      doc.text(a.status, pageW - 40, y, { align: 'right' });
      doc.setTextColor(50);
      y += 16;
    }
  }

  drawDocumentFooter(doc, { title: 'Compliance Audit Report', code: 'CM-COMP-REPORT' });
  doc.save('compliance-audit-report.pdf');
}