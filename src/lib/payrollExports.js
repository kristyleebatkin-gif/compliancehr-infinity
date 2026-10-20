// Payroll exports: ABA bank file for pay runs, group certificates (payment
// summaries), and CSV exports for ATO, WorkCover QLD and QLeave.
import { jsPDF } from 'jspdf';
import { drawCompanyBranding, drawDocumentFooter, getCompanyBranding } from '@/lib/companyBranding';
import { downloadCsv } from '@/lib/csvExport';

const money = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const pad = (str, len, padChar = ' ') => String(str ?? '').slice(0, len).padEnd(len, padChar);
const padNum = (num, len) => String(Math.max(0, Math.round(num))).padStart(len, '0').slice(-len);

// Simplified PAYG withholding estimate (2024-25 rates, tax-free threshold
// claimed, Medicare levy 2%). An estimate only - editable before final pay.
function annualTax(income) {
  if (income <= 18200) return 0;
  if (income <= 45000) return (income - 18200) * 0.16;
  if (income <= 135000) return 4288 + (income - 45000) * 0.30;
  if (income <= 190000) return 31288 + (income - 135000) * 0.37;
  return 51638 + (income - 190000) * 0.45;
}

export function estimatePayg(gross, periodsPerYear = 52) {
  const annual = money(gross) * (Number(periodsPerYear) || 52);
  const tax = annualTax(annual) + annual * 0.02;
  return Math.round((tax / (Number(periodsPerYear) || 52)) * 100) / 100;
}

/* ---- ABA bank file: the standard format most Australian banks accept for bulk pay uploads ---- */
export function buildAbaContent(entries, payDate, description = 'PAYROLL', userNumber = '000000') {
  const header = `0${pad('01', 2, '0')}${pad('CHRPAY', 7, '0')}${pad('', 26)}${pad('000000', 6, '0')}${pad(description.slice(0, 12), 12)}${pad('19000101', 8)}\n`;
  const dateStr = `${String(payDate || '').slice(8, 10)}${String(payDate || '').slice(5, 7)}${String(payDate || '').slice(2, 4)}`;
  const details = entries.map((e) => {
    const bsb = String(e.bsb || '').replace(/\D/g, '').padStart(6, '0');
    return `1${bsb.slice(0, 6)}0${pad(String(e.account_number || '').replace(/\D/g, ''), 9, '0')} 50${padNum(e.amountCents, 10)}${pad(e.account_name || e.name, 32)}${pad('', 6)}${pad(e.reference || 'PAY', 18)}${pad('', 40)}\n`;
  }).join('');
  const totalCents = entries.reduce((t, e) => t + Number(e.amountCents || 0), 0);
  const trailer = `7999-999${padNum(totalCents, 10)}${padNum(entries.length, 6)}${padNum(entries.length, 6)}${pad('', 46)}${pad('', 28)}\n`;
  void dateStr; void userNumber;
  return header + details + trailer;
}

export function downloadAbaFile(payslips, detailsByEmployee, payDate) {
  const entries = payslips
    .filter((p) => p.net > 0)
    .map((p) => {
      const d = detailsByEmployee[p.employee_name] || {};
      return {
        bsb: d.bsb,
        account_number: d.account_number,
        account_name: d.account_name || p.employee_name,
        reference: String(p.pay_period_start || '').replace(/-/g, '').slice(2, 8),
        amountCents: Math.round(money(p.net) * 100),
      };
    })
    .filter((e) => e.bsb && e.account_number);
  const blob = new Blob([buildAbaContent(entries, payDate)], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `pay-run-${payDate || 'batch'}.aba`;
  a.click();
  URL.revokeObjectURL(a.href);
  return entries.length;
}

/* ---- Group certificate (income statement) PDF for one employee over a financial year ---- */
export function downloadGroupCertificatePdf(payslips, detail, fyStart, fyEnd, business) {
  const gross = payslips.reduce((t, p) => t + money(p.gross), 0);
  const tax = payslips.reduce((t, p) => t + money(p.payg_tax), 0);
  const superTotal = payslips.reduce((t, p) => t + money(p.superannuation), 0);
  const net = payslips.reduce((t, p) => t + money(p.net), 0);
  const hours = payslips.reduce((t, p) => t + money(p.hours_worked), 0);
  const companyName = getCompanyBranding().companyName;

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  let y = 64;
  drawCompanyBranding(doc, 40, y, { fontSize: 18 });
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text('PAYMENT SUMMARY', pageW - 40, y, { align: 'right' });
  y += 36;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(30);
  doc.text('Group Certificate / Income Statement', 40, y);
  y += 18;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(90);
  doc.text(`Employee: ${detail?.employee_name || ''}`, 40, y); y += 14;
  doc.text(`Financial year: ${fyStart} to ${fyEnd}`, 40, y); y += 14;
  if (business?.abn) { doc.text(`Employer ABN: ${business.abn}`, 40, y); y += 14; }
  y += 8;

  const rows = [
    ['Gross payments', `$${gross.toFixed(2)}`],
    ['PAYG withholding tax', `$${tax.toFixed(2)}`],
    ['Employer superannuation contributions', `$${superTotal.toFixed(2)}`],
    ['Total hours recorded', hours.toFixed(2)],
    ['Net pay deposited', `$${net.toFixed(2)}`],
    ['Payslips in this year', String(payslips.length)],
  ];
  doc.setDrawColor(210);
  for (const [label, value] of rows) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60);
    doc.text(label, 40, y);
    doc.setTextColor(30);
    doc.text(value, pageW - 40, y, { align: 'right' });
    y += 18;
    doc.line(40, y - 10, pageW - 40, y - 10);
  }
  y += 14;
  doc.setFontSize(8.5);
  doc.setTextColor(110);
  doc.text('This payment summary is prepared from the payslips recorded in ComplianceHR for the stated financial year. It supports lodgement with the ATO and your personal tax return. Pay figures are GST-free employment income.', 40, y, { maxWidth: pageW - 80 });

  drawDocumentFooter(doc, { title: `Group certificate - ${detail?.employee_name || ''}`, companyName, confidential: 'CONFIDENTIAL' });
  doc.save(`Group-Certificate-${(detail?.employee_name || 'employee').replace(/\s+/g, '-')}-${fyStart}.pdf`);
}

/* ---- CSV exports for ATO, WorkCover Queensland and QLeave ---- */
export function exportAtoCsv(payslips, detailsByEmployee, fileName = 'ato-payment-summary-export.csv') {
  downloadCsv(fileName, [
    { label: 'Employee', key: 'employee' },
    { label: 'TFN', key: 'tfn' },
    { label: 'Tax declaration', key: 'tax_declaration' },
    { label: 'Gross payments ($)', key: 'gross' },
    { label: 'PAYG withheld ($)', key: 'tax' },
    { label: 'Super contributions ($)', key: 'super' },
    { label: 'Net ($)', key: 'net' },
    { label: 'Pay cycle', key: 'pay_cycle' },
  ], payslips.map((p) => {
    const d = detailsByEmployee[p.employee_name] || {};
    return { employee: p.employee_name, tfn: d.tfn_number || '', tax_declaration: d.tax_declaration || '', gross: money(p.gross).toFixed(2), tax: money(p.payg_tax).toFixed(2), super: money(p.superannuation).toFixed(2), net: money(p.net).toFixed(2), pay_cycle: d.pay_cycle || '' };
  }));
}

export function exportWorkcoverQldCsv(payslips, business, periodLabel, fileName = 'workcover-qld-wages-declaration.csv') {
  downloadCsv(fileName, [
    { label: 'Employer', key: 'employer' },
    { label: 'ABN', key: 'abn' },
    { label: 'Period', key: 'period' },
    { label: 'Employee', key: 'employee' },
    { label: 'Gross wages ($)', key: 'gross' },
    { label: 'PAYG withheld ($)', key: 'tax' },
    { label: 'Super ($)', key: 'super' },
    { label: 'Hours', key: 'hours' },
  ], payslips.map((p) => ({
    employer: business?.company_name || business?.name || '',
    abn: business?.abn || '',
    period: periodLabel,
    employee: p.employee_name,
    gross: money(p.gross).toFixed(2),
    tax: money(p.payg_tax).toFixed(2),
    super: money(p.superannuation).toFixed(2),
    hours: money(p.hours_worked).toFixed(2),
  })));
}

export function exportQleaveCsv(payslips, detailsByEmployee, periodLabel, fileName = 'qleave-long-service-export.csv') {
  downloadCsv(fileName, [
    { label: 'Employer', key: 'employer' },
    { label: 'Worker', key: 'employee' },
    { label: 'Employment type', key: 'employment_type' },
    { label: 'Period', key: 'period' },
    { label: 'Ordinary hours', key: 'hours' },
    { label: 'Gross wages ($)', key: 'gross' },
    { label: 'Superannuation ($)', key: 'super' },
  ], payslips.map((p) => {
    const d = detailsByEmployee[p.employee_name] || {};
    return {
      employer: detailsByEmployee.__employer || '',
      employee: p.employee_name,
      employment_type: d.employment_type || '',
      period: periodLabel,
      hours: money(p.hours_worked).toFixed(2),
      gross: money(p.gross).toFixed(2),
      super: money(p.superannuation).toFixed(2),
    };
  }));
}