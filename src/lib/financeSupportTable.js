import { lineAmount } from '@/lib/ndisPriceGuide';

const money = (value) => `$${Number(value || 0).toFixed(2)}`;
export default function financeSupportTable(doc, lines, y, margin) {
  const width = doc.internal.pageSize.getWidth() - margin * 2;
  const offsets = [0, 98, 318, 352, 390, width];
  const header = () => {
    doc.setFillColor(124, 58, 237); doc.rect(margin, y, width, 24, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(255);
    ['Support item', 'Support work / worker / date & time', 'Unit', 'Qty', 'Rate', 'Amount'].forEach((label, i) => doc.text(label, margin + offsets[i] + (i === 5 ? -4 : 4), y + 15, { align: i === 5 ? 'right' : 'left' }));
    y += 24;
  };
  header();
  (lines.length ? lines : [{}]).forEach((line, index) => {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    const details = [line.description || 'Support work: ____________________', `Support worker: ${line.support_worker || '________________'}`, `Date: ${line.service_date || '____________'}`, `Time: ${[line.start_time, line.end_time].filter(Boolean).join(' - ') || '________ - ________'}`];
    const wrapped = details.flatMap((text) => doc.splitTextToSize(String(text), 208));
    const codes = doc.splitTextToSize(String(line.code || 'Item code: ______'), 88);
    const rowHeight = Math.max(wrapped.length, codes.length) * 11 + 16;
    if (y + rowHeight > 705) { doc.addPage(); y = 60; header(); }
    if (index % 2) { doc.setFillColor(248, 250, 252); doc.rect(margin, y, width, rowHeight, 'F'); }
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(30, 41, 59);
    doc.text(codes, margin + 4, y + 14, { lineHeightFactor: 1.375 });
    doc.text(wrapped, margin + 102, y + 14, { lineHeightFactor: 1.375 });
    [String(line.unit || ''), String(line.qty ?? ''), line.unit_price == null ? '' : money(line.unit_price)].forEach((value, i) => doc.text(value, margin + offsets[i + 2] + 4, y + 14, { maxWidth: i === 2 ? 52 : 30 }));
    if (line.qty != null) doc.text(money(lineAmount(line)), margin + width - 4, y + 14, { align: 'right' });
    y += rowHeight;
  });
  if (y > 600) { doc.addPage(); y = 60; }
  return y + 10;
}