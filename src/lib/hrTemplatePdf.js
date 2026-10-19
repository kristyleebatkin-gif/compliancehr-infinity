import { jsPDF } from 'jspdf';
import { drawFormHeader, drawSectionHeading } from '@/lib/formDocumentStyles';
import { drawPdfParagraph } from '@/lib/pdfFlowText';
import { drawDocumentFooter } from '@/lib/companyBranding';

/**
 * Branded PDF for an HR document template: the merged template text flows as
 * paragraphs with the standard document header and footer.
 */
export function buildTemplatePdf({ title, code = 'HR-TPL', body, completedBy = '' }) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  let y = drawFormHeader(doc, { title, code, subtitle: 'Human Resources', completedBy, docType: 'HR Document' });

  for (const block of String(body || '').split(/\n{2,}/).map((b) => b.trim()).filter(Boolean)) {
    const isHeading = block.length < 70 && block === block.toUpperCase() && /^[A-Z0-9 ,'&()/:-]+$/.test(block);
    if (isHeading) {
      y = drawSectionHeading(doc, y, block);
    } else {
      y = drawPdfParagraph(doc, y, block);
      y += 6;
    }
  }

  drawDocumentFooter(doc, { title, code, docType: 'HR Document' });
  return doc;
}

export function downloadTemplatePdf({ title, code = 'HR-TPL', body, completedBy = '' }) {
  const doc = buildTemplatePdf({ title, code, body, completedBy });
  doc.save(`${String(title || 'HR document').replace(/[^a-z0-9 ]/gi, '').trim()}.pdf`);
}

// In-browser preview: the exact PDF that would download, as a blob URL.
export function previewTemplatePdf({ title, code = 'HR-TPL', body, completedBy = '' }) {
  const doc = buildTemplatePdf({ title, code, body, completedBy });
  return doc.output('bloburl');
}