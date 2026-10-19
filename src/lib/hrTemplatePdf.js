import { jsPDF } from 'jspdf';
import { drawFormHeader } from '@/lib/formDocumentStyles';
import { drawPdfParagraph } from '@/lib/pdfFlowText';
import { drawDocumentFooter } from '@/lib/companyBranding';

/**
 * Branded PDF for an HR document template: the merged template text flows as
 * paragraphs with the standard document header and footer.
 */
export function downloadTemplatePdf({ title, code = 'HR-TPL', body, completedBy = '' }) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  let y = drawFormHeader(doc, { title, code, subtitle: 'Human Resources', completedBy, docType: 'HR Document' });

  for (const block of String(body || '').split(/\n{2,}/).map((b) => b.trim()).filter(Boolean)) {
    const isHeading = block.length < 70 && block === block.toUpperCase() && /^[A-Z0-9 ,'&()/:-]+$/.test(block);
    if (isHeading) {
      y += 8;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(60, 60, 80);
      const lines = doc.splitTextToSize(block, doc.internal.pageSize.getWidth() - 80);
      for (const line of lines) { y += 16; doc.text(line, 40, y); }
      y += 6;
    } else {
      y = drawPdfParagraph(doc, y, block);
      y += 6;
    }
  }

  drawDocumentFooter(doc, { title, code, docType: 'HR Document' });
  doc.save(`${String(title || 'HR document').replace(/[^a-z0-9 ]/gi, '').trim()}.pdf`);
}