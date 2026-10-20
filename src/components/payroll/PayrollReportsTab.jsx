import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Download } from 'lucide-react';
import { downloadCsv } from '@/lib/csvExport';
import { money } from '@/components/payroll/payrollShared';
import { exportAtoCsv, exportWorkcoverQldCsv, exportQleaveCsv, downloadGroupCertificatePdf } from '@/lib/payrollExports';

const fyRange = () => {
  const now = new Date();
  const year = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
  return [`${year}-07-01`, `${year + 1}-06-30`];
};

// Payroll reports plus compliance exports for ATO, WorkCover QLD and QLeave.
export default function PayrollReportsTab() {
  const { toast } = useToast();
  const [fy] = useState(fyRange);
  const [from, setFrom] = useState(fy[0]);
  const [to, setTo] = useState(fy[1]);
  const [payslips, setPayslips] = useState([]);
  const [details, setDetails] = useState([]);
  const [business, setBusiness] = useState({});
  const [loading, setLoading] = useState(true);
  const [certEmployee, setCertEmployee] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [p, d, b] = await Promise.all([
        base44.entities.Payslip.filter({ pay_period_end: { $gte: from, $lte: to } }, { sort: 'pay_period_start', limit: 500 }),
        base44.entities.StaffPayrollDetail.filter({}, { limit: 300 }),
        base44.entities.BusinessDetails.list({ sort: '-created_date', limit: 1 }),
      ]);
      setPayslips(p.items || []);
      setDetails(d.items || []);
      setBusiness(b.items?.[0] || {});
      setLoading(false);
    })();
  }, [from, to]);

  const detailsByEmployee = useMemo(() => {
    const map = Object.fromEntries(details.map((d) => [d.employee_name, d]));
    map.__employer = business.company_name || business.name || 'Our organisation';
    return map;
  }, [details, business]);

  const totals = useMemo(() => ['gross', 'payg_tax', 'superannuation', 'net'].map((k) => ({
    key: k, value: payslips.reduce((t, p) => t + Number(p[k] || 0), 0),
  })), [payslips]);
  const label = { gross: 'Gross', payg_tax: 'PAYG tax', superannuation: 'Superannuation', net: 'Net paid' };

  const employeesWithSlips = [...new Set(payslips.map((p) => p.employee_name))].sort();

  const groupCert = () => {
    const name = certEmployee;
    const slips = payslips.filter((p) => p.employee_name === name);
    if (!slips.length) { toast({ title: 'No payslips for that employee in the period' }); return; }
    downloadGroupCertificatePdf(slips, detailsByEmployee[name], from, to, business);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-2">
        <div className="grid gap-1.5"><Label>From</Label><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        <div className="grid gap-1.5"><Label>To</Label><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {totals.map((t) => (
          <Card key={t.key}><CardContent className="p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label[t.key]}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight">{money(t.value)}</p>
          </CardContent></Card>
        ))}
      </div>

      {loading ? (
        <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">Loading payroll reports...</CardContent></Card>
      ) : payslips.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No payslips in the selected period yet.</CardContent></Card>
      ) : (
        <>
          <Card><CardContent className="p-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-foreground/50"><FileText className="h-3.5 w-3.5" />Standard payroll reports</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => downloadCsv(`payroll-summary-${from}-to-${to}.csv`, [
                { label: 'Employee', key: 'employee_name' }, { label: 'Period', key: 'period' }, { label: 'Hours', key: 'hours_worked' },
                { label: 'Gross', key: 'gross' }, { label: 'PAYG', key: 'payg_tax' }, { label: 'Super', key: 'superannuation' },
                { label: 'Net', key: 'net' }, { label: 'Status', key: 'status' },
              ], payslips.map((p) => ({ ...p, period: `${p.pay_period_start} to ${p.pay_period_end}` })))}>
                <Download className="h-3.5 w-3.5" />Payroll summary CSV
              </Button>
            </div>
          </CardContent></Card>

          <Card><CardContent className="p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/50">Group certificates (payment summaries)</p>
            <div className="flex flex-wrap items-center gap-2">
              <select value={certEmployee} onChange={(e) => setCertEmployee(e.target.value)} className="h-9 rounded-md border border-input bg-transparent px-3 text-sm">
                <option value="">Select employee...</option>
                {employeesWithSlips.map((n) => <option key={n}>{n}</option>)}
              </select>
              <Button size="sm" onClick={groupCert} disabled={!certEmployee}><Download className="h-3.5 w-3.5" />Download group certificate PDF</Button>
            </div>
          </CardContent></Card>

          <Card><CardContent className="p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-foreground/50">Regulator portals - export files</p>
            <p className="mb-2 text-xs text-muted-foreground">These generate the standard lodgement-ready files you upload to the ATO portal, WorkCover Queensland and QLeave using your organisation's login.</p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => exportAtoCsv(payslips, detailsByEmployee, `ato-payment-summary-${from}-to-${to}.csv`)}>ATO payment summary export</Button>
              <Button size="sm" variant="outline" onClick={() => exportWorkcoverQldCsv(payslips, business, `${from} to ${to}`, `workcover-qld-${from}-to-${to}.csv`)}>WorkCover QLD wages declaration</Button>
              <Button size="sm" variant="outline" onClick={() => exportQleaveCsv(payslips, detailsByEmployee, `${from} to ${to}`, `qleave-${from}-to-${to}.csv`)}>QLeave long service export</Button>
            </div>
          </CardContent></Card>
        </>
      )}
    </div>
  );
}