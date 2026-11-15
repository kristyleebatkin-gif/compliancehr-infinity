import React, { useMemo, useState } from 'react';
import { Loader2, Pencil, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import TableTab from '@/components/common/TableTab';
import { CONSENT_OPTIONS, PLAN_STATUSES, PLAN_TYPES, REVIEW_FREQUENCIES, daysLabel, daysUntil } from '@/lib/clinicalGovernance';

const EMPTY = {
  participant_name: '', plan_type: 'Clinical Care Plan', status: 'Draft', author: '',
  start_date: '', end_date: '', review_due: '', review_frequency: 'Quarterly',
  consent_status: 'Consent pending', medication_support: false, restrictive_practice: false,
  restrictive_practice_detail: '', clinical_risks: '', supports_summary: '', notes: '',
};

const STATUS_CLASS = {
  Draft: 'bg-slate-100 text-slate-700',
  Active: 'bg-emerald-100 text-emerald-900',
  'Under Review': 'bg-amber-100 text-amber-900',
  Superseded: 'bg-rose-100 text-rose-900',
  Closed: 'bg-slate-100 text-slate-700',
};

const reviewTone = (date) => {
  const days = daysUntil(date);
  if (days === null) return 'text-muted-foreground';
  if (days < 0) return 'text-destructive font-bold';
  if (days <= 30) return 'text-warning font-bold';
  return 'text-muted-foreground';
};

export default function CarePlanPanel({ plans = [], tenantId, onChanged }) {
  const { toast } = useToast();
  const [filter, setFilter] = useState('All');
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const rows = useMemo(() => {
    const list = filter === 'All' ? plans : plans.filter((plan) => plan.status === filter);
    return [...list].sort((a, b) => String(a.review_due || '9999').localeCompare(String(b.review_due || '9999')));
  }, [plans, filter]);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, tenant_id: tenantId };
      if (form.id) await base44.entities.CarePlan.update(form.id, payload);
      else await base44.entities.CarePlan.create(payload);
      toast({ title: form.id ? 'Care plan updated' : 'Care plan created', description: form.participant_name });
      setForm(null);
      await onChanged();
    } catch (error) {
      toast({ title: 'Not saved', description: error?.message || 'The care plan could not be saved.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const set = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  return (
    <section aria-label="Care plans" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="plan-filter" className="text-xs">Status</Label>
          <select
            id="plan-filter"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="All">All</option>
            {PLAN_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>
        <Button size="sm" onClick={() => setForm({ ...EMPTY })}><Plus className="h-4 w-4" />New care plan</Button>
      </div>

      <TableTab label="Care plan register">
        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-border">
                  <th>Participant</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Review due</th>
                  <th>Consent</th>
                  <th>Restrictive practice</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((plan) => (
                  <tr key={plan.id} className="border-b border-border/60 last:border-0">
                    <td className="font-semibold text-foreground">{plan.participant_name || '—'}</td>
                    <td>{plan.plan_type}{plan.plan_number ? ` · ${plan.plan_number}` : ''}</td>
                    <td><Badge className={STATUS_CLASS[plan.status] || ''}>{plan.status}</Badge></td>
                    <td className={reviewTone(plan.review_due)}>{plan.review_due || 'Not set'} <span className="block text-[11px]">{daysLabel(daysUntil(plan.review_due))}</span></td>
                    <td>{plan.consent_status || 'Not recorded'}</td>
                    <td>{plan.restrictive_practice ? 'Yes' : 'No'}</td>
                    <td className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => setForm({ ...EMPTY, ...plan })}><Pencil className="h-4 w-4" />Edit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-3 text-sm text-muted-foreground">
            No care plan is filed for this view yet. Create the first plan to start the clinical register.
          </p>
        )}
      </TableTab>

      <Dialog open={Boolean(form)} onOpenChange={(open) => !open && setForm(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{form?.id ? 'Edit care plan' : 'New care plan'}</DialogTitle>
            <DialogDescription>Record the plan, its review date and the consent you hold. Files are attached in the Document Vault.</DialogDescription>
          </DialogHeader>
          {form && (
            <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="plan-participant">Participant name</Label>
                <Input id="plan-participant" required value={form.participant_name} onChange={(e) => set('participant_name', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="plan-type">Plan type</Label>
                <select id="plan-type" value={form.plan_type} onChange={(e) => set('plan_type', e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
                  {PLAN_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="plan-status">Status</Label>
                <select id="plan-status" value={form.status} onChange={(e) => set('status', e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
                  {PLAN_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="plan-author">Prepared by</Label>
                <Input id="plan-author" value={form.author} onChange={(e) => set('author', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="plan-start">Plan start</Label>
                <Input id="plan-start" type="date" value={form.start_date || ''} onChange={(e) => set('start_date', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="plan-end">Plan end</Label>
                <Input id="plan-end" type="date" value={form.end_date || ''} onChange={(e) => set('end_date', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="plan-review">Next review due</Label>
                <Input id="plan-review" type="date" value={form.review_due || ''} onChange={(e) => set('review_due', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="plan-frequency">Review frequency</Label>
                <select id="plan-frequency" value={form.review_frequency} onChange={(e) => set('review_frequency', e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
                  {REVIEW_FREQUENCIES.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="plan-consent">Consent</Label>
                <select id="plan-consent" value={form.consent_status} onChange={(e) => set('consent_status', e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
                  {CONSENT_OPTIONS.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
                </select>
              </div>
              <div className="flex flex-wrap items-center gap-4 pt-5 text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={Boolean(form.medication_support)} onChange={(e) => set('medication_support', e.target.checked)} />
                  Medication support
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={Boolean(form.restrictive_practice)} onChange={(e) => set('restrictive_practice', e.target.checked)} />
                  Restrictive practice
                </label>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="plan-rp">Restrictive practice detail and authorisation</Label>
                <Textarea id="plan-rp" rows={2} value={form.restrictive_practice_detail || ''} onChange={(e) => set('restrictive_practice_detail', e.target.value)} />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="plan-risks">Clinical risks identified</Label>
                <Textarea id="plan-risks" rows={2} value={form.clinical_risks || ''} onChange={(e) => set('clinical_risks', e.target.value)} />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="plan-supports">Supports and interventions</Label>
                <Textarea id="plan-supports" rows={2} value={form.supports_summary || ''} onChange={(e) => set('supports_summary', e.target.value)} />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="plan-notes">Notes</Label>
                <Textarea id="plan-notes" rows={2} value={form.notes || ''} onChange={(e) => set('notes', e.target.value)} />
              </div>
              <div className="flex justify-end gap-2 sm:col-span-2">
                <Button type="button" variant="outline" onClick={() => setForm(null)} disabled={saving}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}Save plan</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}