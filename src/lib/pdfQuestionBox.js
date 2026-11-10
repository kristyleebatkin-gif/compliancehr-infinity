import { drawPdfChoices } from '@/lib/pdfChoiceFields';
import { answerText } from '@/lib/formQuestionModel';

export function questionMetrics(doc, field, value, width) {
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
  const labels = doc.splitTextToSize(field.question || field.label, width - 24);
  const labelH = labels.length * 12 + 16;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5);
  const allLines = answerText(value) ? doc.splitTextToSize(answerText(value), width - 24) : [];
  const helpH = field.optional || field.help ? 16 : 0;
  const choiceH = field.options?.reduce((sum, option) => sum + Math.max(20, doc.splitTextToSize(option, width - 48).length * 13 + 7), 0);
  const singleLine = field.singleLine && !field.options && !field.multiline;
  const lines = singleLine ? allLines.slice(0, 1) : allLines;
  const ruled = singleLine ? 1 : Math.max(field.lines || 1, lines.length, 1);
  const bodyH = choiceH ? choiceH + 22 : ruled * 19 + 24;
  return { labels, labelH, helpH, lines, ruled, height: labelH + helpH + bodyH };
}
export function paintQuestionBox(doc, field, value, x, y, width, metrics, addTextField, interactive) {
  const { labelH, height, helpH, labels, lines } = metrics;
  doc.setFillColor(240, 247, 255); doc.roundedRect(x + 2, y + 3, width, height, 5, 5, 'F');
  doc.setFillColor(255); doc.setDrawColor(10, 43, 109); doc.setLineWidth(0.8);
  doc.roundedRect(x, y, width, height, 5, 5, 'FD');
  doc.setFillColor(10, 43, 109); doc.roundedRect(x, y, width, labelH, 5, 5, 'F');
  doc.rect(x, y + labelH - 5, width, 5, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(255);
  doc.text(labels, x + 12, y + 16, { lineHeightFactor: 1.3333 });
  let bodyY = y + labelH + 12;
  if (helpH) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(10, 43, 109);
    const hint = field.options ? `${field.type === 'multiple' ? 'Select all that apply.' : 'Select one option.'}${field.optional ? ' Optional.' : ''}` : field.optional ? 'Optional / if applicable' : '';
    doc.text(hint, x + 12, bodyY); bodyY += helpH;
  }
  if (field.options) drawPdfChoices(doc, field, value, x + 12, bodyY, width - 24, interactive);
  else {
    doc.setDrawColor(10, 43, 109); doc.setLineWidth(0.9);
    for (let lineY = bodyY + 15; lineY < y + height - 9; lineY += 19) doc.line(x + 12, lineY, x + width - 12, lineY);
    if (interactive) addTextField(doc, x + 12, bodyY - 2, width - 24, height - labelH - helpH - 18, field.multiline || lines.length > 1, answerText(value));
    else if (lines.length) { doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(10, 43, 109); doc.text(lines, x + 12, bodyY + 10, { lineHeightFactor: 2 }); }
  }
  doc.setLineWidth(0.5);
}