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
import { CONSENT_OPTIONS, DISCIPLINES, REFERRAL_STATUSES, URGENCIES, daysLabel, daysUntil } from '@/lib/clinicalGovernance';

const EMPTY = {
  participant_name: '', discipline: 'Occupational Therapy', provider_name: '', provider_contact: '',
  reason: '', urgency: 'Routine', referral_date: '', appointment_date: '', status: 'Draft',
  consent_status: 'Consent pending', outcome_summary: '', review_due: '', notes: '',
};

const STATUS_CLASS = {
  Draft: 'bg-slate-100 text-slate-700',
  Sent: 'bg-sky-100 text-sky-900',
  Accepted: 'bg-emerald-100 text-emerald-900',
  Scheduled: 'bg-violet-100 text-violet-900',
  Completed: 'bg-emerald-100 text-emerald-900',
  Declined: 'bg-rose-100 text-rose-900',
  Closed: 'bg-slate-100 text-slate-700',
};

const URGENCY_CLASS = {
  Routine: 'bg-slate-100 text-slate-700',
  Priority: 'bg-amber-100 text-amber-900',
  Urgent: 'bg-rose-100 text-rose-900',
};

export default function AlliedHealthPanel({ referrals = [], tenantId, onChanged }) {
  const { toast } = useToast();
  const [filter, setFilter] = useState('All');
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const rows = useMemo(() => {
    const list = filter === 'All' ? referrals : referrals.filter((row) => row.status === filter);
    return [...list].sort((a, b) => String(b.referral_date || '').localeCompare(String(a.referral_date || '')));
  }, [referrals, filter]);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, tenant_id: tenantId };
      if (form.id) await base44.entities.AlliedHealthReferral.update(form.id, payload);
      else await base44.entities.AlliedHealthReferral.create(payload);
      toast({ title: form.id ? 'Referral updated' : 'Referral created', description: `${form.discipline} · ${form.participant_name}` });
      setForm(null);
      await onChanged();
    } catch (error) {
      toast({ title: 'Not saved', description: error?.message || 'The referral could not be saved.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const set = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  return (
    <section aria-label="Allied health referrals" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="referral-filter" className="text-xs">Status</Label>
          <select id="referral-filter" value={filter} onChange={(event) => setFilter(event.target.value)} className="h-9 rounded-md border border-input bg-background px-2 text-sm">
            <option value="All">All</option>
            {REFERRAL_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>
        <Button size="sm" onClick={() => setForm({ ...EMPTY })}><Plus className="h-4 w-4" />New referral</Button>
      </div>

      <TableTab label="Allied health register">
        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-border">
                  <th>Participant</th>
                  <th>Discipline</th>
                  <th>Provider</th>
                  <th>Urgency</th>
                  <th>Status</th>
                  <th>Next appointment</th>
                  <th>Follow-up</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-border/60 last:border-0">
                    <td className="font-semibold text-foreground">{row.participant_name || '—'}</td>
                    <td>{row.discipline}</td>
                    <td>{row.provider_name || 'Not recorded'}</td>
                    <td><Badge className={URGENCY_CLASS[row.urgency] || ''}>{row.urgency}</Badge></td>
                    <td><Badge className={STATUS_CLASS[row.status] || ''}>{row.status}</Badge></td>
                    <td>{row.appointment_date || '—'}</td>
                    <td>
                      {row.review_due || '—'}
                      {row.review_due && <span className="block text-[11px] text-muted-foreground">{daysLabel(daysUntil(row.review_due))}</span>}
                    </td>
                    <td className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => setForm({ ...EMPTY, ...row })}><Pencil className="h-4 w-4" />Edit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-3 text-sm text-muted-foreground">No allied health referral is recorded for this view yet.</p>
        )}
      </TableTab>

      <Dialog open={Boolean(form)} onOpenChange={(open) => !open && setForm(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{form?.id ? 'Edit referral' : 'New allied health referral'}</DialogTitle>
            <DialogDescription>Record the referral, the provider and what came back. Attach the report in the Document Vault.</DialogDescription>
          </DialogHeader>
          {form && (
            <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="ref-participant">Participant name</Label>
                <Input id="ref-participant" required value={form.participant_name} onChange={(e) => set('participant_name', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ref-discipline">Discipline</Label>
                <select id="ref-discipline" value={form.discipline} onChange={(e) => set('discipline', e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
                  {DISCIPLINES.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="ref-provider">Provider</Label>
                <Input id="ref-provider" value={form.provider_name || ''} onChange={(e) => set('provider_name', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ref-contact">Provider contact</Label>
                <Input id="ref-contact" value={form.provider_contact || ''} onChange={(e) => set('provider_contact', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ref-urgency">Urgency</Label>
                <select id="ref-urgency" value={form.urgency} onChange={(e) => set('urgency', e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
                  {URGENCIES.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="ref-status">Status</Label>
                <select id="ref-status" value={form.status} onChange={(e) => set('status', e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
                  {REFERRAL_STATUSES.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="ref-sent">Referral date</Label>
                <Input id="ref-sent" type="date" value={form.referral_date || ''} onChange={(e) => set('referral_date', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ref-appointment">Next appointment</Label>
                <Input id="ref-appointment" type="date" value={form.appointment_date || ''} onChange={(e) => set('appointment_date', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ref-consent">Consent</Label>
                <select id="ref-consent" value={form.consent_status} onChange={(e) => set('consent_status', e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
                  {CONSENT_OPTIONS.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="ref-followup">Follow-up due</Label>
                <Input id="ref-followup" type="date" value={form.review_due || ''} onChange={(e) => set('review_due', e.target.value)} />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="ref-reason">Reason for referral</Label>
                <Textarea id="ref-reason" rows={2} value={form.reason || ''} onChange={(e) => set('reason', e.target.value)} />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="ref-outcome">Outcome and recommendations received</Label>
                <Textarea id="ref-outcome" rows={3} value={form.outcome_summary || ''} onChange={(e) => set('outcome_summary', e.target.value)} />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="ref-notes">Notes</Label>
                <Textarea id="ref-notes" rows={2} value={form.notes || ''} onChange={(e) => set('notes', e.target.value)} />
              </div>
              <div className="flex justify-end gap-2 sm:col-span-2">
                <Button type="button" variant="outline" onClick={() => setForm(null)} disabled={saving}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}Save referral</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}