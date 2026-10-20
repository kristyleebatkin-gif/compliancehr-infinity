import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Download, Mail, CheckCircle2, Sparkles } from 'lucide-react';
import { downloadPayslipPdf } from '@/lib/payslipPdf';
import { estimatePayg } from '@/lib/payrollExports';
import { money, startOfWeek, loadHolidaySet, buildPayRow, buildPayslipPayload, payslipPdfRow, payslipPdfSettings, round2 } from '@/components/payroll/payrollShared';

const STATUS_TONE = { Draft: 'bg-warning/15 text-warning border-transparent', Sent: 'bg-teal/15 text-teal border-transparent', Paid: 'bg-safe/15 text-safe border-transparent', Cancelled: 'bg-muted text-muted-foreground border-transparent' };

export default function PayslipsTab() {
  const { toast } = useToast();
  const [weekStart, setWeekStart] = useState(() => startOfWeek());
  const [detailPage, setDetailPage] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [busy, setBusy] = useState(null);

  const weekEnd = useMemo(() => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 6);
    return d.toISOString().slice(0, 10);
  }, [weekStart]);

  const load = useCallback(async () => {
    setLoading(true);
    const [holidaySet, shiftPage, details, slips] = await Promise.all([
      loadHolidaySet(),
      base44.entities.Shift.filter({ date: { $gte: weekStart, $lte: weekEnd } }, { sort: 'date', limit: 500 }),
      base44.entities.StaffPayrollDetail.filter({}, { limit: 300 }),
      base44.entities.Payslip.filter({ pay_period_start: weekStart }, { sort: 'employee_name', limit: 200 }),
    ]);
    const byEmployee = new Map();
    for (const s of shiftPage.items || []) {
      const name = s.employee_name || '';
      if (!name) continue;
      if (!byEmployee.has(name)) byEmployee.set(name, []);
      byEmployee.get(name).push(s);
    }
    const previewsBuilt = (details.items || []).map((d) => {
      const shifts = byEmployee.get(d.employee_name) || [];
      if (!shifts.length) return null;
      const { row, pay } = buildPayRow(d, shifts, holidaySet);
      return { detail: d, row, pay };
    }).filter(Boolean);
    setDetailPage(details.items || []);
    setPayslips(slips.items || []);
    setPreviews(previewsBuilt);
    setLoading(false);
  }, [weekStart, weekEnd]);

  useEffect(() => { load(); }, [load]);

  const generate = async () => {
    setGenerating(true);
    try {
      const existing = new Set(payslips.map((p) => p.employee_name));
      const toCreate = previews
        .filter((p) => p.pay.totalPay > 0 && !existing.has(p.detail.employee_name))
        .map((p) => ({
          employee_name: p.detail.employee_name,
          employee_user_id: p.detail.employee_user_id || '',
          staff_profile_id: p.detail.staff_profile_id || '',
          employee_email: p.detail.employee_email || '',
          pay_period_start: weekStart,
          pay_period_end: weekEnd,
          pay_date: weekEnd,
          status: 'Draft',
          ...buildPayslipPayload(p.detail, p.row, p.pay, weekStart, weekEnd),
        }));
      if (!toCreate.length) {
        toast({ title: 'Nothing to generate', description: 'Every employee with hours this week already has a payslip.' });
      } else {
        await base44.entities.Payslip.bulkCreate(toCreate);
        toast({ title: `${toCreate.length} payslip${toCreate.length === 1 ? '' : 's'} generated`, description: 'PAYG and super are estimates you can finalise in the pay run.' });
        await load();
      }
    } finally {
      setGenerating(false);
    }
  };

  const emailSlip = async (p) => {
    setBusy(p.id);
    try {
      const res = await base44.functions.invoke('emailPayslip', { payslip_id: p.id });
      if (res.data?.error) throw new Error(res.data.error);
      toast({ title: 'Payslip emailed', description: `Sent to ${res.data?.to || 'the employee'}.` });
      await load();
    } catch (error) {
      toast({ title: 'Email failed', description: error.message, variant: 'destructive' });
    } finally {
      setBusy(null);
    }
  };

  const markPaid = async (p) => {
    setBusy(p.id);
    await base44.entities.Payslip.update(p.id, { status: 'Paid', payment_ref: p.payment_ref || 'Manual payment' });
    setBusy(null);
    load();
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-2">
        <div className="grid gap-1.5"><Label>Pay week starting</Label><Input type="date" value={weekStart} onChange={(e) => setWeekStart(e.target.value)} /></div>
        <Button onClick={generate} disabled={generating}>
          {generating ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <Sparkles className="h-4 w-4" />}Generate payslips for this week
        </Button>
      </div>

      {previews.length > 0 && (
        <Card><CardContent className="p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/50">This week's pay preview (from approved shifts)</p>
          <div className="grid gap-1.5 text-xs">
            {previews.map((p) => (
              <div key={p.detail.id} className="flex flex-wrap justify-between gap-2 rounded-md bg-muted/40 px-2.5 py-1.5">
                <span className="font-semibold">{p.detail.employee_name} · {round2(p.row.approved_hours)} hrs</span>
                <span>Gross {money(p.pay.totalPay)} · PAYG (est.) {money(estimatePayg(p.pay.totalPay, p.detail.pay_cycle === 'Weekly' ? 52 : p.detail.pay_cycle === 'Monthly' ? 12 : 26))}</span>
              </div>
            ))}
          </div>
        </CardContent></Card>
      )}

      {loading ? (
        <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">Loading payslips...</CardContent></Card>
      ) : payslips.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No payslips generated for this week yet.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {payslips.map((p) => (
            <Card key={p.id}><CardContent className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">{p.employee_name}</p>
                  <p className="text-xs text-muted-foreground">{p.pay_period_start} to {p.pay_period_end} · {p.hours_worked} hrs · {p.shifts_count} shifts</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={STATUS_TONE[p.status] || 'bg-muted text-muted-foreground border-transparent'}>{p.status}</Badge>
                  <span className="text-sm font-bold">{money(p.net)} net</span>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>Gross {money(p.gross)}</span>
                <span>PAYG (est.) {money(p.payg_tax)}</span>
                <span>Super {money(p.superannuation)}</span>
                {p.deductions ? <span>Deductions {money(p.deductions)}</span> : null}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => downloadPayslipPdf(payslipPdfRow(p), payslipPdfSettings(p))}><Download className="h-3.5 w-3.5" />PDF</Button>
                <Button size="sm" variant="outline" onClick={() => emailSlip(p)} disabled={busy === p.id || !p.employee_email}>
                  <Mail className="h-3.5 w-3.5" />Email payslip
                </Button>
                {p.status !== 'Paid' && (
                  <Button size="sm" variant="outline" className="bg-safe/10 text-safe hover:bg-safe/20" onClick={() => markPaid(p)} disabled={busy === p.id}>
                    <CheckCircle2 className="h-3.5 w-3.5" />Mark paid
                  </Button>
                )}
              </div>
            </CardContent></Card>
          ))}
        </div>
      )}
    </div>
  );
}