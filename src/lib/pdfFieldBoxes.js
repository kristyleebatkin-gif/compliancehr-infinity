import { ensurePdfSpace, pdfContentBottom, pdfContentTop, PDF_MARGIN as M } from '@/lib/pdfPageLayout';
import { normaliseFormFields, formQuestionRows, fieldAnswer, answerText, legacyFormFields } from '@/lib/formQuestionModel';
import { questionMetrics, paintQuestionBox } from '@/lib/pdfQuestionBox';
import { drawFormBreather, drawFormSectionBreak } from '@/lib/pdfFormBreathers';

let fieldSequence = 0;
export function addPdfTextField(doc, x, y, width, height, multiline, value) {
  const field = new doc.AcroForm.TextField();
  field.fieldName = `answer_${fieldSequence++}`;
  Object.assign(field, { x, y, width, height, multiline, fontSize: 9, value, defaultValue: value, textColor: '#0F172A' });
  doc.addField(field);
}

export function drawPdfFieldBoxes(doc, y, fields, values = {}, { interactive = false } = {}) {
  const prepared = normaliseFormFields(fields);
  const questions = [...prepared, ...legacyFormFields(prepared, values)];
  const contentW = doc.internal.pageSize.getWidth() - M * 2, gap = 16;
  const capacity = pdfContentBottom(doc) - pdfContentTop(doc) - 18;
  const rows = formQuestionRows(questions);
  let rowIndex = 0, sectionIndex = 0;
  for (const row of rows) {
    const entries = row.map(({ field, span }) => {
      const width = row.length === 2 ? (contentW - gap) * span / 12 : contentW * span / 12;
      const value = fieldAnswer(field, values);
      return { field, value, width, metrics: questionMetrics(doc, field, value, width) };
    });
    if (entries.some((entry) => entry.metrics.height > capacity)) {
      for (const entry of entries) {
        const base = questionMetrics(doc, entry.field, entry.value, contentW);
        const count = Math.max(1, Math.floor((capacity - base.labelH - base.helpH - 30) / 19));
        for (let offset = 0; offset < Math.max(1, base.lines.length); offset += count) {
          const field = { ...entry.field, lines: 1, question: `${entry.field.question}${offset ? ' (continued)' : ''}` };
          const text = base.lines.slice(offset, offset + count).join('\n');
          const metrics = questionMetrics(doc, field, text, contentW);
          y = ensurePdfSpace(doc, y, metrics.height + 24);
          paintQuestionBox(doc, field, text, M, y, contentW, metrics, addPdfTextField, false);
          y += metrics.height + 24;
        }
      }
    } else {
      const height = Math.max(...entries.map((entry) => entry.metrics.height));
      y = ensurePdfSpace(doc, y, height + 24);
      let x = M;
      for (const entry of entries) {
        paintQuestionBox(doc, entry.field, entry.value, x, y, entry.width, { ...entry.metrics, height }, addPdfTextField, interactive);
        x += entry.width + gap;
      }
      y += height + 24;
    }
    rowIndex += 1;
    // Every third question group gets a calm breather panel; when a page fills
    // up, continue on a fresh page opened with a branded section banner.
    if (rowIndex % 3 === 0) y = drawFormBreather(doc, y, Math.floor(rowIndex / 3) - 1);
    if (rowIndex < rows.length && y - pdfContentTop(doc) > 470) {
      y = drawFormSectionBreak(doc, sectionIndex++);
    }
  }
  return y;
}