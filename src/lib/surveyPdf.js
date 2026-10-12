import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { drawCompanyBranding, drawDocumentFooter, loadCompanyBranding } from '@/lib/companyBranding';

/**
 * Generates a printable, company-branded survey document (A4) for a survey record.
 */
export async function downloadSurveyDocument(survey) {
  await loadCompanyBranding().catch(() => {});
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 48;
  let y = 0;

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 90, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  drawCompanyBranding(doc, margin, 26, { fontSize: 16, logoSize: 28, maxWidth: pageWidth - margin * 2 - 170 });
  doc.text('Participant & Staff Survey', margin + 190, 40, { maxWidth: pageWidth - margin - 190 - 40 });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(203, 213, 225);
  doc.text('Quality and Improvement Program', margin + 190, 58);
  y = 130;

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(survey.title || 'Untitled survey', margin, y);
  y += 24;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(80, 90, 100);
  const meta = [
    `Type: ${survey.type || '-'}`,
    `Status: ${survey.status || '-'}`,
    survey.open_date ? `Opens: ${format(new Date(survey.open_date), 'd MMM yyyy')}` : null,
    survey.close_date ? `Closes: ${format(new Date(survey.close_date), 'd MMM yyyy')}` : null,
  ].filter(Boolean).join('    ');
  doc.text(meta, margin, y);
  y += 30;

  doc.setDrawColor(225, 230, 235);
  doc.line(margin, y, pageWidth - margin, y);
  y += 26;

  if (survey.description) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('About this survey', margin, y);
    y += 18;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(doc.splitTextToSize(survey.description, pageWidth - margin * 2), margin, y);
    y += 12 * Math.max(1, Math.ceil(survey.description.length / 95)) + 14;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Questions', margin, y);
  y += 20;

  const questions = (survey.questions || '').split('\n').map((q) => q.trim()).filter(Boolean);
  if (questions.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('1. How satisfied are you with the supports you have received?', margin, y);
    y += 18;
    doc.text('2. Do you feel listened to and respected?', margin, y);
    y += 18;
    doc.text('3. What could we do better?', margin, y);
    y += 18;
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    questions.forEach((q, i) => {
      if (y > 720) { doc.addPage(); y = 70; }
      const lines = doc.splitTextToSize(`${i + 1}. ${q}`, pageWidth - margin * 2);
      doc.text(lines, margin, y);
      y += lines.length * 13 + 26;
      doc.setDrawColor(200, 206, 212);
      doc.line(margin + 14, y - 12, pageWidth - margin, y - 12);
      y += 8;
    });
  }

  if (y > 690) { doc.addPage(); y = 70; }
  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(120, 128, 136);
  doc.text(`Generated ${format(new Date(), 'd MMM yyyy')}`, margin, doc.internal.pageSize.getHeight() - 40);

  drawDocumentFooter(doc, { title: survey.title || 'Survey', code: 'QI-SURVEY' });
  doc.save(`Survey - ${(survey.title || 'survey').replace(/[^\w -]/g, '')}.pdf`);
}