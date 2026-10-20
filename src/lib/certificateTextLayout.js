// Draw each certificate field inside its own measured region, including wrapped names.
export default function certificateTextLayout(doc, text, { x, top, width, height, size = 10, weight = 'normal', color = '#282828' }) {
  const value = String(text || '');
  const lineHeight = 1.25;
  doc.setFont('helvetica', weight);
  let fontSize = size;
  let lines;
  do {
    doc.setFontSize(fontSize);
    lines = doc.splitTextToSize(value, width);
    if (lines.length * fontSize * lineHeight <= height || fontSize <= 4) break;
    fontSize -= 0.5;
  } while (true);
  doc.setTextColor(color);
  const blockHeight = lines.length * fontSize * lineHeight;
  doc.text(lines, x, top + Math.max(0, (height - blockHeight) / 2), { align: 'center', baseline: 'top', lineHeightFactor: lineHeight });
}