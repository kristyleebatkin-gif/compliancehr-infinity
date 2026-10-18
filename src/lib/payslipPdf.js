import { jsPDF } from 'jspdf';
import { drawCompanyBranding, drawDocumentFooter, getCompanyBranding } from '@/lib/companyBranding';

const money = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0).toFixed(2);
const hrs = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0).toFixed(2);

/**
 * Branded payslip PDF for one employee and one pay week, built from the
 * approved-hour buckets and loading settings used by the payroll report.
 */
export function downloadPayslipPdf(row, settings = {}) {
  const loadings = settings.loadings || { after8: 110, saturday: 150, sunday: 160, ph: 225 };
  const kmRate = Number(settings.kmRate ?? 0.99) || 0;
  const R = Number(row.hourly_rate ?? 0) || 0;

  const buckets = [
    { label: 'Weekday (before 8pm)', hours: row.ap_weekday || 0, loading: 100 },
    { label: 'After 8pm', hours: row.ap_after_8pm || 0, loading: loadings.after8 },
    { label: 'Saturday', hours: row.ap_saturday || 0, loading: loadings.saturday },
    { label: 'Sunday', hours: row.ap_sunday || 0, loading: loadings.sunday },
    { label: 'Public holiday', hours: row.ap_ph || 0, loading: loadings.ph },
  ].map((b) => ({ ...b, pay: (b.hours || 0) * R * (b.loading / 100) })).filter((b) => b.hours > 0);

  const travelKm = row.approved_km || 0;
  const travelAllowance = travelKm * kmRate;
  const otherAllowance = Number(settings.otherAllowance ?? 0) || 0;
  const earnings = buckets.reduce((sum, b) => sum + b.pay, 0);
  const totalAllowances = travelAllowance + otherAllowance;
  const totalPay = earnings + totalAllowances;
  const companyName = getCompanyBranding().companyName;

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  let y = 64;

  drawCompanyBranding(doc, 40, y, { fontSize: 18 });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120);
  doc.text('PAYSLIP', pageW - 40, y, { align: 'right' });
  y += 34;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(30);
  doc.text('Pay Slip', 40, y);
  y += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(110);
  doc.text(`Employee: ${row.employee_name}   |   Pay week: ${settings.weekStart || ''} to ${settings.weekEnd || ''}`, 40, y);
  y += 13;
  doc.text(`Generated ${new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}`, 40, y);
  y += 20;

  doc.setFillColor(226, 240, 252);
  doc.roundedRect(40, y, pageW - 80, 44, 5, 5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(23, 78, 138);
  doc.text(`Total pay: $${money(totalPay)}`, 54, y + 19);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(60);
  doc.text(`Approved hours: ${hrs(row.approved_hours)}   |   Approved shifts: ${row.approved ?? 0}${row.pending_approval ? `   |   Pending approval (excluded): ${row.pending_approval}` : ''}`, 54, y + 34);
  y += 64;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30);
  doc.text('Earnings by classification', 40, y);
  y += 16;

  const colX = [40, 320, 400, 490];
  doc.setFontSize(8.5);
  doc.setTextColor(120);
  doc.text('CLASSIFICATION', colX[0], y);
  doc.text('HOURS', colX[1], y);
  doc.text('RATE LOADING', colX[2], y);
  doc.text('AMOUNT', colX[3], y);
  y += 12;
  doc.setDrawColor(210);
  doc.line(40, y, pageW - 40, y);
  y += 14;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(60);
  if (!buckets.length) {
    doc.text('No approved payable hours this week.', 40, y);
    y += 16;
  }
  for (const b of buckets) {
    if (y > 720) { doc.addPage(); y = 64; }
    doc.setTextColor(30);
    doc.text(b.label, colX[0], y);
    doc.setTextColor(60);
    doc.text(hrs(b.hours), colX[1], y);
    doc.text(`${b.loading}%`, colX[2], y);
    doc.setTextColor(30);
    doc.text(`$${money(b.pay)}`, colX[3], y);
    y += 16;
  }
  y += 6;

  doc.setDrawColor(210);
  doc.line(40, y, pageW - 40, y);
  y += 16;
  doc.setFontSize(9.5);
  doc.setTextColor(60);
  doc.text('Approved earnings', colX[0], y);
  doc.text(`$${money(earnings)}`, colX[3], y);
  y += 16;
  doc.text(`Travel allowance (${Number(travelKm).toFixed(1)} km × $${kmRate.toFixed(2)}/km)`, colX[0], y);
  doc.text(`$${money(travelAllowance)}`, colX[3], y);
  y += 16;
  doc.text('Other allowances', colX[0], y);
  doc.text(`$${money(otherAllowance)}`, colX[3], y);
  y += 16;
  doc.setDrawColor(210);
  doc.line(40, y, pageW - 40, y);
  y += 16;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30);
  doc.text('Total pay incl. allowances', colX[0], y);
  doc.text(`$${money(totalPay)}`, colX[3], y);
  y += 24;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(110);
  doc.text(`Hourly rate: $${R.toFixed(2)} · Loadings applied: after 8pm ${loadings.after8}%, Saturday ${loadings.saturday}%, Sunday ${loadings.sunday}%, public holiday ${loadings.ph}% · Pay is calculated from timesheet-approved shifts only.`, 40, y, { maxWidth: pageW - 80 });

  drawDocumentFooter(doc, { title: `Payslip — ${row.employee_name}`, companyName, confidential: 'CONFIDENTIAL' });
  doc.save(`Payslip-${row.employee_name.replace(/\s+/g, '-')}-${settings.weekStart || ''}.pdf`);
}