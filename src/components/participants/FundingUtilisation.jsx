import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Pencil, PiggyBank } from 'lucide-react';
import { format } from 'date-fns';

const money = (v) => (Number(v) || 0).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// NDIS plan budget utilisation bar for a participant profile (FlowLogic parity).
export default function FundingUtilisation({ participant, onUpdated }) {
  const { toast } = useToast();
  const [spent, setSpent] = useState(null);
  const [calculating, setCalculating] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});

  const budget = Number(participant.plan_budget_total) || 0;

  useEffect(() => {
    let alive = true;
    setCalculating(true);
    base44.entities.Invoice.aggregate({
      query: { participant_id: participant.id, status: { $ne: 'Draft' } },
      sum: 'amount',
    })
      .then((res) => { if (alive) setSpent(res.rows?.[0]?.sum_amount || 0); })
      .catch(() => { if (alive) setSpent(null); })
      .finally(() => { if (alive) setCalculating(false); });
    return () => { alive = false; };
  }, [participant.id]);

  const openEdit = () => {
    setForm({
      plan_budget_total: participant.plan_budget_total ?? '',
      plan_start_date: participant.plan_start_date || '',
      plan_end_date: participant.plan_end_date || '',
    });
    setOpen(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      await base44.entities.ParticipantProfile.update(participant.id, {
        plan_budget_total: form.plan_budget_total === '' ? undefined : Number(form.plan_budget_total),
        plan_start_date: form.plan_start_date || undefined,
        plan_end_date: form.plan_end_date || undefined,
      });
      setOpen(false);
      toast({ title: 'Plan budget saved' });
      onUpdated?.();
    } finally {
      setSaving(false);
    }
  };

  const pct = budget > 0 && spent != null ? Math.min(100, Math.round((spent / budget) * 100)) : null;
  const barTone = pct == null || pct < 75 ? 'bg-safe' : pct >= 90 ? 'bg-danger' : 'bg-warning';

  let projected = null;
  if (budget > 0 && spent != null && participant.plan_start_date && participant.plan_end_date) {
    const start = new Date(`${participant.plan_start_date}T00:00:00`).getTime();
    const end = new Date(`${participant.plan_end_date}T00:00:00`).getTime();
    const total = end - start;
    const elapsed = Math.min(1, Math.max(0, (Date.now() - start) / total));
    if (total > 0 && elapsed > 0) {
      projected = Math.min(999, Math.round(((spent / budget) / elapsed) * 100));
    }
  }

  return (
    <Card className="shadow-panel">
      <CardContent className="p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand"><PiggyBank className="h-4 w-4" /></div>
            <div>
              <div className="font-bold font-display">NDIS plan budget</div>
              <div className="text-[11px] text-muted-foreground">Funding utilisation across this participant's plan</div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={openEdit}><Pencil className="mr-2 h-3.5 w-3.5" />{budget ? 'Edit budget' : 'Add budget'}</Button>
        </div>

        {budget === 0 ? (
          <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-center">
            <p className="text-sm font-semibold">No plan budget recorded yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Add the NDIS plan budget to track how much of this participant's funding has been used as invoices are raised.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <div className="font-display text-4xl font-bold leading-none tabular-nums">{calculating ? '…' : pct}%</div>
                <div className="mt-1 text-xs text-muted-foreground">of plan budget used</div>
              </div>
              <div className="text-right text-sm tabular-nums">
                <div className="font-semibold">${money(spent ?? 0)} used</div>
                <div className="text-muted-foreground">${money(budget - (spent ?? 0))} remaining</div>
              </div>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <div className={`h-full rounded-full ${barTone}`} style={{ width: `${pct || 0}%` }} />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>
                Plan period: {participant.plan_start_date ? format(new Date(`${participant.plan_start_date}T00:00:00`), 'd MMM yyyy') : '—'}
                {' – '}
                {participant.plan_end_date ? format(new Date(`${participant.plan_end_date}T00:00:00`), 'd MMM yyyy') : '—'}
              </span>
              {projected != null && <span>Run rate: ~{projected}% of budget by plan end</span>}
              {spent == null && <span>Billed usage needs finance access to calculate.</span>}
            </div>
          </div>
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Plan budget</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div className="grid gap-1.5"><Label>Plan budget total ($)</Label>
                <Input type="number" value={form.plan_budget_total} onChange={(e) => setForm({ ...form, plan_budget_total: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Plan start</Label>
                  <Input type="date" value={form.plan_start_date} onChange={(e) => setForm({ ...form, plan_start_date: e.target.value })} />
                </div>
                <div className="grid gap-1.5"><Label>Plan end</Label>
                  <Input type="date" value={form.plan_end_date} onChange={(e) => setForm({ ...form, plan_end_date: e.target.value })} />
                </div>
              </div>
              <Button onClick={save} disabled={saving}>Save budget</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}