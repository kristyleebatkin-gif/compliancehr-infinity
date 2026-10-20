export default function financePdfSections(doc, sections, y, margin = 44) {
  const width = doc.internal.pageSize.getWidth() - margin * 2;
  const bottom = doc.internal.pageSize.getHeight() - 65;
  const ensureSpace = (height) => {
    if (y + height > bottom) { doc.addPage(); y = 60; }
  };
  sections.forEach(([heading, text]) => {
    if (!text) return;
    ensureSpace(42);
    doc.setFillColor(244, 239, 255);
    doc.rect(margin, y, width, 22, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(heading, margin + 12, y + 15);
    y += 34;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    String(text).split('\n').forEach((paragraph) => {
      const lines = doc.splitTextToSize(paragraph || ' ', width - 24);
      lines.forEach((line) => {
        ensureSpace(12);
        doc.text(line, margin + 12, y);
        y += 12;
      });
    });
    y += 12;
  });
  return y;
}