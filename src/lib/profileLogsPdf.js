import { jsPDF } from 'jspdf';
import { drawCompanyBranding, drawDocumentFooter, loadCompanyBranding } from '@/lib/companyBranding';

/**
 * Branded PDF report of a profile's consolidated logs (All Logs panel).
 * rows: [{ type, entry }]
 */
export async function exportProfileLogsPdf(profileName, rows) {
  await loadCompanyBranding();
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const title = `All Logs - ${profileName || 'Profile'}`;
  const drawHeader = (small = false) => {
    drawCompanyBranding(doc, 40, 40, { fontSize: small ? 14 : 18 });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(title, 40, 100);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
  };
  drawHeader();
  let y = 124;
  const bottom = 770;
  (rows || []).forEach((row, i) => {
    const lines = doc.splitTextToSize(String(row.entry || ''), 505);
    const block = lines.length * 12 + 16;
    if (y + block > bottom) {
      drawDocumentFooter(doc, { title, code: 'PROFILE-LOGS' });
      doc.addPage();
      drawHeader(true);
      y = 124;
    }
    doc.setFont('helvetica', 'bold');
    doc.text(`${i + 1}. ${row.type}`, 40, y);
    doc.setFont('helvetica', 'normal');
    doc.text(lines, 40, y + 12);
    y += 12 * lines.length + 8;
  });
  drawDocumentFooter(doc, { title, code: 'PROFILE-LOGS' });
  doc.save(`${(profileName || 'profile').replace(/\s+/g, '-')}-all-logs.pdf`);
  return rows?.length || 0;
}