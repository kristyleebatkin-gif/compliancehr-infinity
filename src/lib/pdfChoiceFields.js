let sequence = 0;
export function drawPdfChoices(doc, field, value, x, y, width, interactive = false) {
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(30, 30, 45);
  const selected = Array.isArray(value) ? value : [String(value ?? '')];
  let cursor = y;
  for (const option of field.options) {
    const lines = doc.splitTextToSize(option, width - 24);
    const checked = selected.includes(option);
    doc.setDrawColor(124, 58, 237); doc.setLineWidth(0.7);
    doc.rect(x, cursor, 10, 10);
    if (checked) { doc.line(x + 2, cursor + 5, x + 4, cursor + 8); doc.line(x + 4, cursor + 8, x + 8, cursor + 2); }
    if (interactive) {
      const checkbox = new doc.AcroForm.CheckBox();
      checkbox.fieldName = `choice_${sequence++}`;
      checkbox.Rect = [x, cursor, 10, 10];
      checkbox.appearanceState = checked ? 'On' : 'Off';
      checkbox.value = checked ? 'On' : 'Off';
      doc.addField(checkbox);
    }
    doc.setTextColor(30, 30, 45);
    doc.text(lines, x + 18, cursor + 8, { lineHeightFactor: 1.4 });
    cursor += Math.max(20, lines.length * 13 + 7);
  }
  return cursor;
}