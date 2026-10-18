import { jsPDF } from 'jspdf';
import { drawCompanyBranding, drawDocumentFooter } from '@/lib/companyBranding';

/**
 * Audit Pack PDF: branded one-click bundle combining document expiries,
 * corrective actions, training, incidents, checklists and review dates
 * for an NDIS certification / verification / internal audit.
 */
const SECTION_COLOURS = {
  'At Risk': [220, 38, 38],
  'Needs Attention': [202, 138, 4],
  Compliant: [22, 163, 74],
  Info: [37, 99, 235],
};

export function downloadAuditPackPdf(pack) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  let y = 64;

  drawCompanyBranding(doc, 40, y, { fontSize: 18 });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120);
  doc.text('AUDIT PACK', pageW - 40, y, { align: 'right' });
  y += 34;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(30);
  doc.text(`Compliance Audit Pack — ${pack.auditType}`, 40, y, { maxWidth: pageW - 80 });
  y += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(110);
  const meta = [`Generated ${pack.generatedAt}`, pack.generatedBy && `Prepared by ${pack.generatedBy}`].filter(Boolean).join('  |  ');
  doc.text(meta, 40, y);
  y += 18;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30);
  doc.text('Snapshot at generation', 40, y);
  y += 14;

  const overview = pack.overview || [];
  const colW = (pageW - 90) / 2;
  for (let i = 0; i < overview.length; i += 2) {
    if (y > pageH - 100) { doc.addPage(); y = 64; }
    const drawCol = (item, x) => {
      if (!item) return;
      doc.setFillColor(245, 247, 250);
      doc.roundedRect(x, y, colW, 26, 4, 4, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      const value = String(item.value ?? '—');
      doc.text(value, x + 10, y + 16);
      const valueWidth = doc.getTextWidth(value) + 22;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(item.label, x + valueWidth, y + 16, { maxWidth: colW - valueWidth - 8 });
    };
    drawCol(overview[i], 40);
    drawCol(overview[i + 1], 40 + colW + 10);
    y += 32;
  }
  y += 6;

  for (const section of pack.sections) {
    if (y > pageH - 150) { doc.addPage(); y = 64; }
    doc.setDrawColor(210);
    doc.line(40, y, pageW - 40, y);
    y += 18;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30);
    doc.text(section.title, 40, y, { maxWidth: pageW - 230 });
    const colour = SECTION_COLOURS[section.status] || [100, 116, 139];
    const countLabel = `${section.items.length} ${section.unit || 'items'}`;
    doc.setFillColor(...colour);
    const badgeWidth = doc.getTextWidth(countLabel) + 14;
    doc.roundedRect(pageW - 40 - badgeWidth, y - 10, badgeWidth, 16, 4, 4, 'F');
    doc.setFontSize(8.5);
    doc.setTextColor(255);
    doc.text(countLabel, pageW - 40 - badgeWidth + 7, y + 1);
    y += 16;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    if (!section.items.length) {
      doc.setTextColor(22, 163, 74);
      doc.text(section.emptyText || 'None — nothing to report.', 52, y);
      y += 18;
    } else {
      doc.setTextColor(90);
      for (const item of section.items) {
        if (y > pageH - 90) { doc.addPage(); y = 64; }
        const wrapped = doc.splitTextToSize(`• ${item}`, pageW - 100);
        doc.text(wrapped, 52, y);
        y += wrapped.length * 12;
      }
    }
    y += 8;
  }

  drawDocumentFooter(doc, { title: `Audit Pack — ${pack.auditType}`, confidential: 'CONFIDENTIAL' });
  const dateStamp = new Date().toISOString().slice(0, 10);
  doc.save(`AuditPack-${dateStamp}.pdf`);
}