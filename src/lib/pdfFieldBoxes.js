import { ensurePdfSpace, pdfContentBottom, pdfContentTop, PDF_MARGIN as M } from '@/lib/pdfPageLayout';

let fieldSequence = 0;
export function addPdfTextField(doc, x, y, width, height, multiline, value) {
  const field = new doc.AcroForm.TextField();
  field.fieldName = `answer_${fieldSequence++}`;
  Object.assign(field, { x, y, width, height, multiline, fontSize: 9, value, defaultValue: value, fillColor: '#FFFFFF', borderColor: '#FFFFFF', textColor: '#0F172A' });
  doc.addField(field);
}

function box(doc, x, y, width, label, lines, height, color, interactive, value, multiline) {
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
  const labels = doc.splitTextToSize(label, width - 24);
  const labelH = labels.length * 12 + 14;
  doc.setFillColor(225, 219, 244);
  doc.roundedRect(x + 3, y + 4, width, height, 6, 6, 'F');
  doc.setFillColor(255); doc.setDrawColor(...color); doc.setLineWidth(1);
  doc.roundedRect(x, y, width, height, 6, 6, 'FD');
  doc.setFillColor(...color);
  doc.roundedRect(x, y, width, labelH, 6, 6, 'F');
  doc.rect(x, y + labelH - 6, width, 6, 'F');
  doc.setTextColor(255);
  doc.text(labels, x + 12, y + 15, { lineHeightFactor: 1.3333 });
  if (interactive) addPdfTextField(doc, x + 8, y + labelH + 6, width - 16, height - labelH - 12, multiline, value);
  else if (lines.length) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(30, 30, 45);
    doc.text(lines, x + 12, y + labelH + 18, { lineHeightFactor: 1.4736 });
  }
  doc.setLineWidth(0.5);
}

/** Pair short questions; give long questions and narrative answers their own roomy boxes. */
export function drawPdfFieldBoxes(doc, y, fields, values = {}, { interactive = false } = {}) {
  const contentW = doc.internal.pageSize.getWidth() - M * 2;
  const gap = 16;
  for (let index = 0, row = 0; index < fields.length; row++) {
    const field = fields[index], next = fields[index + 1];
    const valueOf = (f) => String(values[f.label] ?? f.value ?? '');
    const compact = (f) => f && !f.multiline && !f.fullWidth && f.label.length < 85 && valueOf(f).length < 150;
    const paired = compact(field) && compact(next);
    const group = paired ? [field, next] : [field];
    const firstW = paired ? (contentW - gap) * (row % 2 ? 0.55 : 0.45) : contentW;
    const widths = paired ? [firstW, contentW - gap - firstW] : [contentW];
    const entries = group.map((f, i) => {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
      const labelH = doc.splitTextToSize(f.label, widths[i] - 24).length * 12 + 14;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5);
      const text = valueOf(f);
      const lines = text ? doc.splitTextToSize(text, widths[i] - 24) : [];
      return { f, labelH, lines, text };
    });
    const maxH = Math.max(...entries.map((e) => e.labelH + Math.max(e.f.multiline ? 76 : 40, e.lines.length * 14 + 22)));
    if (maxH <= pdfContentBottom(doc) - pdfContentTop(doc)) {
      y = ensurePdfSpace(doc, y, maxH + 16);
      entries.forEach((e, i) => box(doc, M + (i ? firstW + gap : 0), y, widths[i], e.f.label, e.lines, maxH, i ? [37, 99, 235] : [124, 58, 237], interactive, e.text, Boolean(e.f.multiline)));
      y += maxH + 18;
    } else {
      const e = entries[0]; let offset = 0;
      while (offset < e.lines.length) {
        y = ensurePdfSpace(doc, y, e.labelH + 60);
        const count = Math.max(1, Math.floor((pdfContentBottom(doc) - y - e.labelH - 34) / 14));
        const chunk = e.lines.slice(offset, offset + count);
        box(doc, M, y, contentW, `${e.f.label}${offset ? ' (continued)' : ''}`, chunk, e.labelH + chunk.length * 14 + 24, [124, 58, 237], false, '', true);
        y += e.labelH + chunk.length * 14 + 42;
        offset += chunk.length;
      }
    }
    index += group.length;
  }
  return y;
}