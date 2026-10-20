import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Landmark, Download, Send, CheckCircle2, Plus, Users, RefreshCw, ExternalLink } from 'lucide-react';
import { downloadAbaFile, estimatePayg } from '@/lib/payrollExports';
import { downloadCsv } from '@/lib/csvExport';
import { money, startOfWeek, round2, loadHolidaySet, buildPayRow, buildPayslipPayload } from '@/components/payroll/payrollShared';

const STATUS_TONE = { Draft: 'bg-warning/15 text-warning border-transparent', 'Sent to bank': 'bg-teal/15 text-teal border-transparent', Paid: 'bg-safe/15 text-safe border-transparent', Cancelled: 'bg-muted text-muted-foreground border-transparent' };

// Banks that accept ABA payroll files, with their online-banking login pages.
const BANKS = [
  { name: 'CommBank', login: 'https://www.commbank.com.au/digital-banking/' },
  { name: 'Westpac', login: 'https://online.westpac.com.au/esis/login' },
  { name: 'NAB', login: 'https://ib.nab.com.au/' },
  { name: 'ANZ', login: 'https://www.anz.com.au/login' },
  { name: 'Suncorp', login: 'https://internetbanking.suncorp.com.au/' },
  { name: 'Bank of Queensland', login: 'https://ib.boq.com.au/' },
  { name: 'Macquarie', login: 'https://online.macquarie.com.au/' },
  { name: 'ING', login: 'https://secure.ing.com.au/' },
  { name: 'Other bank', login: '' },
];

export default function PayRunsTab() {
  const { toast } = useToast();
  const [runs, setRuns] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [details, setDetails] = useState([]);
  const [weekStart, setWeekStart] = useState(() => startOfWeek());
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(null);
  const [refs, setRefs] = useState({});
  const [bulk, setBulk] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [bank, setBank] = useState('');
  const bankLogin = BANKS.find((b) => b.name === bank)?.login || '';

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

  // Creates a payroll detail record for every staff member who doesn't have one,
  // pulling pay basics from their staff profile.
  const syncDetails = async () => {
    setSyncing(true);
    const [detailPage, staffPage] = await Promise.all([
      base44.entities.StaffPayrollDetail.filter({}, { limit: 300 }),
      base44.entities.StaffProfile.filter({}, { limit: 300 }),
    ]);
    const have = new Set((detailPage.items || []).map((d) => d.employee_name));
    const missing = (staffPage.items || []).filter((p) => p.full_name && !have.has(p.full_name)).map((p) => ({
      staff_profile_id: p.id || '',
      employee_name: p.full_name,
      employee_email: p.email || '',
      employee_id: p.employee_number || '',
      employment_type: p.position || 'Casual',
      hourly_rate: Number(p.hourly_rate) || 0,
      pay_cycle: 'Fortnightly',
      super_rate: 11.5,
    }));
    if (missing.length) await base44.entities.StaffPayrollDetail.bulkCreate(missing);
    setSyncing(false);
    await load();
    toast({ title: missing.length ? `${missing.length} payroll record${missing.length === 1 ? '' : 's'} synced from staff profiles` : 'All staff already have payroll records' });
  };

  // One-click bulk payroll: payslips for everyone this week (backfilling any
  // missing payroll records from staff profiles), then the pay run linking them.
  const runFullPayroll = async () => {
    setBulk(true);
    try {
      const [holidaySet, shiftPage, detailPage, staffPage] = await Promise.all([
        loadHolidaySet(),
        base44.entities.Shift.filter({ date: { $gte: weekStart, $lte: weekEnd } }, { sort: 'date', limit: 500 }),
        base44.entities.StaffPayrollDetail.filter({}, { limit: 300 }),
        base44.entities.StaffProfile.filter({}, { limit: 300 }),
      ]);
      const byEmployee = new Map();
      for (const s of shiftPage.items || []) {
        const name = s.employee_name || '';
        if (!name) continue;
        if (!byEmployee.has(name)) byEmployee.set(name, []);
        byEmployee.get(name).push(s);
      }
      const detailByName = new Map((detailPage.items || []).map((d) => [d.employee_name, d]));
      const profileByName = new Map((staffPage.items || []).map((p) => [p.full_name, p]));
      const missing = [...byEmployee.keys()].filter((n) => !detailByName.has(n)).map((name) => {
        const p = profileByName.get(name) || {};
        return {
          staff_profile_id: p.id || '',
          employee_name: name,
          employee_email: p.email || '',
          employee_id: p.employee_number || '',
          employment_type: p.position || 'Casual',
          hourly_rate: Number(p.hourly_rate) || 0,
          pay_cycle: 'Weekly',
          super_rate: 11.5,
        };
      });
      if (missing.length) await base44.entities.StaffPayrollDetail.bulkCreate(missing);

      const slipPage = await base44.entities.Payslip.filter({ pay_period_start: weekStart }, { limit: 200 });
      const existing = new Set((slipPage.items || []).filter((p) => p.status !== 'Cancelled').map((p) => p.employee_name));
      const toCreate = [];
      for (const [name, shifts] of byEmployee) {
        if (existing.has(name)) continue;
        const d = detailByName.get(name) || missing.find((m) => m.employee_name === name);
        if (!d) continue;
        const { row, pay } = buildPayRow(d, shifts, holidaySet);
        if (pay.totalPay <= 0) continue;
        toCreate.push({
          employee_name: name,
          employee_user_id: d.employee_user_id || '',
          staff_profile_id: d.staff_profile_id || '',
          employee_email: d.employee_email || '',
          pay_period_start: weekStart,
          pay_period_end: weekEnd,
          pay_date: weekEnd,
          status: 'Draft',
          ...buildPayslipPayload(d, row, pay, weekStart, weekEnd),
        });
      }
      if (toCreate.length) await base44.entities.Payslip.bulkCreate(toCreate);

      const freshPage = await base44.entities.Payslip.filter({ pay_period_start: weekStart }, { limit: 200 });
      const inPeriod = (freshPage.items || []).filter((p) => p.status !== 'Cancelled');
      if (!inPeriod.length) {
        toast({ title: 'Nothing to pay', description: 'No employee has payable hours in that week.' });
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
      toast({
        title: 'Payroll run complete',
        description: `${inPeriod.length} payslip${inPeriod.length === 1 ? '' : 's'} in the run${missing.length ? `, ${missing.length} payroll record${missing.length === 1 ? '' : 's'} synced from staff profiles` : ''}, ${money(sum('net'))} net.`,
      });
      await load();
    } finally {
      setBulk(false);
    }
  };

  const detailsByEmployee = Object.fromEntries(details.map((d) => [d.employee_name, d]));

  const downloadAba = (run) => {
    if (!bank) {
      toast({ title: 'Choose your bank first', description: 'State which bank you are paying through before downloading the bank file.' });
      return;
    }
    const slips = payslips.filter((p) => p.pay_run_id === run.id && p.status !== 'Cancelled');
    const count = downloadAbaFile(slips, detailsByEmployee, run.pay_date);
    if (!count) {
      toast({ title: 'No bankable payslips', description: 'Employees need BSB and account numbers recorded to build the bank file.' });
      return;
    }
    toast({ title: 'Bank file downloaded', description: `${count} payment${count === 1 ? '' : 's'} in ABA format, ready to upload in your ${bank} portal.` });
    base44.entities.PayRun.update(run.id, { aba_generated: true, bank_name: bank }).catch(() => {});
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
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/50">Bank &amp; government logins</p>
        <div className="flex flex-wrap items-end gap-2">
          <div className="grid gap-1.5">
            <Label>Bank for the bank file</Label>
            <Select value={bank} onValueChange={setBank}>
              <SelectTrigger className="w-56"><SelectValue placeholder="Select your bank" /></SelectTrigger>
              <SelectContent>
                {BANKS.map((b) => <SelectItem key={b.name} value={b.name}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {bankLogin && (
            <a href={bankLogin} target="_blank" rel="noreferrer">
              <Button variant="outline"><ExternalLink className="h-4 w-4" />{bank} online login</Button>
            </a>
          )}
          <a href="https://onlineservices.ato.gov.au/" target="_blank" rel="noreferrer">
            <Button variant="outline"><ExternalLink className="h-4 w-4" />ATO online services</Button>
          </a>
          <a href="https://online.qleave.qld.gov.au/" target="_blank" rel="noreferrer">
            <Button variant="outline"><ExternalLink className="h-4 w-4" />QLeave login</Button>
          </a>
        </div>
      </CardContent></Card>

      <Card><CardContent className="p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/50">Create a pay run</p>
        <div className="flex flex-wrap items-end gap-2">
          <div className="grid gap-1.5"><Label>Pay week starting</Label><Input type="date" value={weekStart} onChange={(e) => setWeekStart(e.target.value)} /></div>
          <Button onClick={createRun} disabled={creating}>
            {creating ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <Plus className="h-4 w-4" />}Create pay run
          </Button>
          <Button onClick={runFullPayroll} disabled={bulk}>
            {bulk ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <Users className="h-4 w-4" />}Run payroll for everyone
          </Button>
          <Button variant="outline" onClick={syncDetails} disabled={syncing}>
            {syncing ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <RefreshCw className="h-4 w-4" />}Sync payroll details
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
                      <p className="text-xs text-muted-foreground">{run.employee_count} employees · run {run.run_date}{run.bank_name ? ` · ${run.bank_name}` : ''}{run.bank_reference ? ` · ref ${run.bank_reference}` : ''}</p>
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