import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Download, Wallet, Clock, History, Save } from 'lucide-react';
import { downloadPayslipPdf } from '@/lib/payslipPdf';
import { money, round2, payslipPdfRow, payslipPdfSettings, shiftHoursPayable } from '@/components/payroll/payrollShared';

const STATUS_TONE = { Draft: 'bg-warning/15 text-warning border-transparent', Sent: 'bg-teal/15 text-teal border-transparent', Paid: 'bg-safe/15 text-safe border-transparent', Cancelled: 'bg-muted text-muted-foreground border-transparent' };
const EMPLOYEE_FIELDS = ['bsb', 'account_number', 'account_name', 'super_fund_name', 'super_member_number'];
const FIELD_LABELS = { bsb: 'BSB', account_number: 'Account number', account_name: 'Account name', super_fund_name: 'Super fund', super_member_number: 'Super member number' };

// Employee self-service payroll: own details (editable, every change logged and
// admins alerted), own timesheets and own payslips only.
export default function MyPayroll() {
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    let res;
    try {
      res = await base44.functions.invoke('myPayrollOverview', {});
    } catch (err) {
      const message = err?.response?.data?.error || err?.message || 'Please try again.';
      toast({ title: 'Could not load payroll', description: message, variant: 'destructive' });
      setData({ profile: null, payroll_detail: null, payslips: [], timesheets: [], change_log: [] });
      setForm(Object.fromEntries(EMPLOYEE_FIELDS.map((f) => [f, ''])));
      return;
    }
    if (res?.data?.error) { toast({ title: 'Could not load payroll', description: res.data.error, variant: 'destructive' }); return; }
    const payload = res?.data || {};
    setData({
      ...payload,
      payslips: Array.isArray(payload.payslips) ? payload.payslips : [],
      timesheets: Array.isArray(payload.timesheets) ? payload.timesheets : [],
      change_log: Array.isArray(payload.change_log) ? payload.change_log : [],
    });
    const d = payload.payroll_detail || {};
    setForm(Object.fromEntries(EMPLOYEE_FIELDS.map((f) => [f, d[f] ?? ''])));
  };

  useEffect(() => { load(); }, []);

  const saveDetails = async () => {
    setSaving(true);
    try {
      const changes = {};
      const current = data.payroll_detail || {};
      for (const f of EMPLOYEE_FIELDS) {
        if (String(form[f] ?? '') !== String(current[f] ?? '')) changes[f] = form[f];
      }
      if (!Object.keys(changes).length) {
        toast({ title: 'No changes to save' });
        return;
      }
      const res = await base44.functions.invoke('updatePayrollDetail', { id: current.id, changes, note: 'Updated by employee in My payroll' });
      if (res.data?.error) throw new Error(res.data.error);
      toast({ title: 'Details saved', description: 'Your change was logged and administrators were alerted.' });
      await load();
    } catch (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (!data) {
    return <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">Loading your payroll...</CardContent></Card>;
  }

  const detail = data.payroll_detail;

  return (
    <div className="space-y-4">
      <Card><CardContent className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <div className="rounded-lg bg-teal/10 p-2"><Wallet className="h-4 w-4 text-teal" /></div>
          <p className="text-sm font-bold">My payroll details</p>
        </div>
        {detail ? (
          <>
            <div className="grid gap-2 text-xs sm:grid-cols-2">
              <p>Employee ID: {detail.employee_id || 'not recorded'}</p>
              <p>Hourly rate: {money(detail.hourly_rate)}</p>
              <p>Pay cycle: {detail.pay_cycle || 'Fortnightly'}</p>
              <p>Super rate: {detail.super_rate ?? 12}%</p>
              <p>TFN: {detail.tfn_number ? 'recorded (private)' : 'not recorded - contact payroll'}</p>
              <p>Tax declaration: {detail.tax_declaration || 'not recorded'}</p>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {EMPLOYEE_FIELDS.map((f) => (
                <div className="grid gap-1" key={f}>
                  <Label className="text-xs">{FIELD_LABELS[f]}</Label>
                  <Input className="h-8 text-xs" value={form[f] ?? ''} onChange={(e) => setForm({ ...form, [f]: e.target.value })} />
                </div>
              ))}
            </div>
            <Button size="sm" className="mt-3" onClick={saveDetails} disabled={saving}>
              <Save className="h-3.5 w-3.5" />{saving ? 'Saving...' : 'Update my payroll details'}
            </Button>
            <p className="mt-1.5 text-[11px] text-muted-foreground">You can update your bank and super details at any time. Every change is logged with the date, time and your name, and payroll administrators are alerted.</p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No payroll record yet - your details appear here once payroll sets you up.</p>
        )}
      </CardContent></Card>

      <Card><CardContent className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <div className="rounded-lg bg-teal/10 p-2"><Clock className="h-4 w-4 text-teal" /></div>
          <p className="text-sm font-bold">My timesheets</p>
        </div>
        {data.timesheets.length === 0 ? (
          <p className="text-sm text-muted-foreground">No shifts recorded yet.</p>
        ) : (
          <div className="space-y-1 text-xs">
            {data.timesheets.map((s) => (
              <div key={s.id} className="flex flex-wrap justify-between gap-2 rounded-md bg-muted/40 px-2.5 py-1.5">
                <span className="font-semibold">{s.date} · {s.start_time || ''}{s.end_time ? `-${s.end_time}` : ''} · {s.participant_name || ''}</span>
                <span>{round2(shiftHoursPayable(s))} hrs · {s.status}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent></Card>

      <Card><CardContent className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <div className="rounded-lg bg-teal/10 p-2"><History className="h-4 w-4 text-teal" /></div>
          <p className="text-sm font-bold">My payslips</p>
        </div>
        {data.payslips.length === 0 ? (
          <p className="text-sm text-muted-foreground">No payslips yet.</p>
        ) : (
          <div className="space-y-2">
            {data.payslips.map((p) => (
              <div key={p.id} className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{p.pay_period_start} to {p.pay_period_end}</p>
                    <p className="text-xs text-muted-foreground">Gross {money(p.gross)} · PAYG {money(p.payg_tax)} · Super {money(p.superannuation)} · Net {money(p.net)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={STATUS_TONE[p.status] || 'bg-muted text-muted-foreground border-transparent'}>{p.status}</Badge>
                    <Button size="sm" variant="outline" onClick={() => downloadPayslipPdf(payslipPdfRow(p), payslipPdfSettings(p))}><Download className="h-3.5 w-3.5" />PDF</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent></Card>

      {data.change_log.length > 0 && (
        <Card><CardContent className="p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/50">My change history</p>
          <div className="space-y-1 text-xs text-muted-foreground">
            {data.change_log.map((l) => (
              <div key={l.id}>{String(l.changed_at || '').replace('T', ' ').slice(0, 16)} · {l.field}: {l.old_value || '(empty)'} → {l.new_value}</div>
            ))}
          </div>
        </CardContent></Card>
      )}
    </div>
  );
}