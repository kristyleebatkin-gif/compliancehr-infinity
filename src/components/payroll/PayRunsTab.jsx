import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Landmark, Download, Send, CheckCircle2, Plus } from 'lucide-react';
import { downloadAbaFile } from '@/lib/payrollExports';
import { downloadCsv } from '@/lib/csvExport';
import { money, startOfWeek, round2 } from '@/components/payroll/payrollShared';

const STATUS_TONE = { Draft: 'bg-warning/15 text-warning border-transparent', 'Sent to bank': 'bg-teal/15 text-teal border-transparent', Paid: 'bg-safe/15 text-safe border-transparent', Cancelled: 'bg-muted text-muted-foreground border-transparent' };

export default function PayRunsTab() {
  const { toast } = useToast();
  const [runs, setRuns] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [details, setDetails] = useState([]);
  const [weekStart, setWeekStart] = useState(() => startOfWeek());
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(null);
  const [refs, setRefs] = useState({});

  const load = useCallback(async () => {
    const [r, p, d] = await Promise.all([
      base44.entities.PayRun.filter({}, { sort: '-run_date', limit: 100 }),
      base44.entities.Payslip.filter({}, { sort: '-pay_period_end', limit: 300 }),
      base44.entities.StaffPayrollDetail.filter({}, { limit: 300 }),
    ]);
    setRuns(r.items || []);
    setPayslips(p.items || []);
    setDetails(d.items || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const weekEnd = (() => { const d = new Date(weekStart); d.setDate(d.getDate() + 6); return d.toISOString().slice(0, 10); })();

  const createRun = async () => {
    setCreating(true);
    try {
      const inPeriod = payslips.filter((p) => p.pay_period_start === weekStart && p.status !== 'Cancelled');
      if (!inPeriod.length) {
        toast({ title: 'No payslips for that week', description: 'Generate payslips first in the Payslips tab.' });
        return;
      }
      const sum = (k) => round2(inPeriod.reduce((t, p) => t + Number(p[k] || 0), 0));
      const run = await base44.entities.PayRun.create({
        run_date: new Date().toISOString().slice(0, 10),
        period_start: weekStart,
        period_end: weekEnd,
        pay_date: weekEnd,
        employee_count: inPeriod.length,
        total_gross: sum('gross'),
        total_payg: sum('payg_tax'),
        total_super: sum('superannuation'),
        total_net: sum('net'),
        status: 'Draft',
      });
      await base44.entities.Payslip.bulkUpdate(inPeriod.map((p) => ({ id: p.id, pay_run_id: run.id })));
      toast({ title: 'Pay run created', description: `${inPeriod.length} payslips totalling ${money(sum('net'))} net.` });
      await load();
    } finally {
      setCreating(false);
    }
  };

  const detailsByEmployee = Object.fromEntries(details.map((d) => [d.employee_name, d]));

  const downloadAba = (run) => {
    const slips = payslips.filter((p) => p.pay_run_id === run.id && p.status !== 'Cancelled');
    const count = downloadAbaFile(slips, detailsByEmployee, run.pay_date);
    if (!count) {
      toast({ title: 'No bankable payslips', description: 'Employees need BSB and account numbers recorded to build the bank file.' });
      return;
    }
    toast({ title: 'Bank file downloaded', description: `${count} payment${count === 1 ? '' : 's'} in ABA format, ready to upload to your bank portal.` });
    base44.entities.PayRun.update(run.id, { aba_generated: true }).catch(() => {});
  };

  const markSent = async (run) => {
    setBusy(run.id);
    await base44.entities.PayRun.update(run.id, { status: 'Sent to bank', bank_reference: refs[run.id] || run.bank_reference || '' });
    setBusy(null);
    load();
  };

  const markPaid = async (run) => {
    setBusy(run.id);
    const slips = payslips.filter((p) => p.pay_run_id === run.id && p.status !== 'Cancelled');
    if (slips.length) {
      await base44.entities.Payslip.bulkUpdate(slips.map((p) => ({ id: p.id, status: 'Paid', payment_ref: run.bank_reference || 'Pay run' })));
    }
    await base44.entities.PayRun.update(run.id, { status: 'Paid' });
    setBusy(null);
    load();
  };

  return (
    <div className="space-y-3">
      <Card><CardContent className="p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/50">Create a pay run</p>
        <div className="flex flex-wrap items-end gap-2">
          <div className="grid gap-1.5"><Label>Pay week starting</Label><Input type="date" value={weekStart} onChange={(e) => setWeekStart(e.target.value)} /></div>
          <Button onClick={createRun} disabled={creating}>
            {creating ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <Plus className="h-4 w-4" />}Create pay run
          </Button>
        </div>
      </CardContent></Card>

      {runs.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No pay runs yet. Create one from a week with generated payslips.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {runs.map((run) => {
            const slips = payslips.filter((p) => p.pay_run_id === run.id);
            return (
              <Card key={run.id}><CardContent className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-teal/10 p-2"><Landmark className="h-4 w-4 text-teal" /></div>
                    <div>
                      <p className="font-semibold">Pay run {run.period_start} to {run.period_end}</p>
                      <p className="text-xs text-muted-foreground">{run.employee_count} employees · run {run.run_date}{run.bank_reference ? ` · ref ${run.bank_reference}` : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={STATUS_TONE[run.status] || 'bg-muted text-muted-foreground border-transparent'}>{run.status}</Badge>
                    <span className="text-sm font-bold">{money(run.total_net)} net</span>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 text-xs text-muted-foreground">
                  <span>Gross {money(run.total_gross)}</span><span>PAYG {money(run.total_payg)}</span><span>Super {money(run.total_super)}</span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => downloadAba(run)}><Download className="h-3.5 w-3.5" />Bank payment file (ABA)</Button>
                  <Input className="h-8 w-44 text-xs" placeholder="Bank reference" value={refs[run.id] ?? run.bank_reference ?? ''} onChange={(e) => setRefs({ ...refs, [run.id]: e.target.value })} />
                  {run.status !== 'Paid' && (
                    <Button size="sm" variant="outline" onClick={() => markSent(run)} disabled={busy === run.id}><Send className="h-3.5 w-3.5" />Mark sent to bank</Button>
                  )}
                  {run.status !== 'Paid' && (
                    <Button size="sm" variant="outline" className="bg-safe/10 text-safe hover:bg-safe/20" onClick={() => markPaid(run)} disabled={busy === run.id}>
                      <CheckCircle2 className="h-3.5 w-3.5" />Mark paid
                    </Button>
                  )}
                </div>
                {slips.length > 0 && (
                  <details className="mt-2 text-xs text-muted-foreground">
                    <summary className="cursor-pointer font-medium">Show payslips in this run</summary>
                    <div className="mt-1 space-y-0.5">
                      {slips.map((p) => <div key={p.id}>{p.employee_name} · net {money(p.net)} · {p.status}</div>)}
                    </div>
                  </details>
                )}
              </CardContent></Card>
            );
          })}
          <Button variant="outline" onClick={() => downloadCsv('payment-tracking.csv', [
            { label: 'Period start', key: 'period_start' }, { label: 'Period end', key: 'period_end' }, { label: 'Pay date', key: 'pay_date' },
            { label: 'Employees', key: 'employee_count' }, { label: 'Gross', key: 'total_gross' }, { label: 'PAYG', key: 'total_payg' },
            { label: 'Super', key: 'total_super' }, { label: 'Net', key: 'total_net' }, { label: 'Bank reference', key: 'bank_reference' }, { label: 'Status', key: 'status' },
          ], runs)}>Export payment tracking CSV</Button>
        </div>
      )}
    </div>
  );
}