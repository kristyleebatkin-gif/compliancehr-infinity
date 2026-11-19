import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Loader2, ShieldAlert } from 'lucide-react';
import { RP_CATEGORIES, rpFlags, rpSummary } from '@/lib/restrictivePractice';

const TONE = { critical: 'bg-rose-100 text-rose-800', warning: 'bg-amber-100 text-amber-900', info: 'bg-slate-100 text-slate-700' };
const todayIso = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Australia/Brisbane' }).format(new Date());
const EMPTY = {
  participant_name: '', sector: 'NDIS', restrictive_practice_category: '', restrictive_practice_type: '', record_date: '',
  practice_duration_minutes: '', authorisation_status: 'Authorised', authorisation_reference: '', authorisation_expiry: '',
  behaviour_support_plan_reference: '', reduction_actions: '', reported_to_regulator: false, reported_date: '', notes: '',
};

// Restrictive practice register: every use, its authorisation, behaviour support plan, reporting and reduction plan.
// Records are ParticipantSafeguardRecord rows with record_type "Restrictive Practice", so they also show on the
// participant's Safety tab.
export default function RestrictivePracticeRegister() {
  const { toast } = useToast();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const today = todayIso();

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const page = await base44.entities.ParticipantSafeguardRecord.filter({ record_type: 'Restrictive Practice' }, { sort: '-record_date', limit: 500 });
      setRecords(Array.isArray(page) ? page : page?.items || []);
    } catch (e) {
      setError(e?.message || 'The register could not load.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const summary = useMemo(() => rpSummary(records, today), [records, today]);

  const save = async () => {
    if (!form.participant_name.trim() || !form.record_date || !form.restrictive_practice_category) {
      toast({ title: 'Participant, date and category are required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      await base44.entities.ParticipantSafeguardRecord.create({
        ...form,
        record_type: 'Restrictive Practice',
        status: 'Current',
        practice_duration_minutes: form.practice_duration_minutes === '' ? undefined : Number(form.practice_duration_minutes),
        authorisation_expiry: form.authorisation_expiry || undefined,
        reported_date: form.reported_to_regulator ? (form.reported_date || today) : undefined,
      });
      toast({ title: 'Restrictive practice recorded' });
      setOpen(false);
      setForm(EMPTY);
      await load();
    } catch (e) {
      toast({ title: 'Not saved', description: e?.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const markReported = async (record) => {
    try {
      await base44.entities.ParticipantSafeguardRecord.update(record.id, { reported_to_regulator: true, reported_date: today });
      await load();
    } catch (e) {
      toast({ title: 'Not updated', description: e?.message, variant: 'destructive' });
    }
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e?.target ? e.target.value : e });
  const tiles = [
    ['Uses this month', summary.this_month],
    ['Unauthorised', summary.unauthorised],
    ['Authorisation expired', summary.expired],
    ['Expiring in 30 days', summary.expiring],
    ['Not reported', summary.unreported],
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="flex items-center gap-1.5 text-base font-bold"><ShieldAlert className="h-4 w-4" />Restrictive practice register</p>
          <p className="text-xs text-muted-foreground">Every use of a regulated restrictive practice (NDIS and aged care), its authorisation, behaviour support plan, reporting and reduction plan. Flags prompt action; they are not a legal assessment.</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-3.5 w-3.5" />Record a use</Button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {tiles.map(([label, value]) => (
          <Card key={label}><CardContent className="p-3"><p className="text-[11px] text-muted-foreground">{label}</p><p className="text-xl font-extrabold">{loading ? '—' : value}</p></CardContent></Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {error ? (
            <p role="alert" className="p-4 text-sm text-rose-800">{error} <button type="button" className="underline" onClick={load}>Try again</button></p>
          ) : loading ? (
            <p className="p-4 text-sm text-muted-foreground">Loading…</p>
          ) : records.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No restrictive practices recorded. Record every use, including authorised ones, so monthly reporting and reduction planning are complete.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted-foreground"><tr><th className="p-2">Date</th><th>Participant</th><th>Category</th><th>Authorisation</th><th>Flags</th><th /></tr></thead>
                <tbody>
                  {records.map((r) => {
                    const flags = rpFlags(r, today);
                    return (
                      <tr key={r.id} className="border-t align-top">
                        <td className="p-2 whitespace-nowrap">{r.record_date || '—'}</td>
                        <td className="p-2">{r.participant_name || '—'}<div className="text-[11px] text-muted-foreground">{r.sector || 'NDIS'}</div></td>
                        <td className="p-2">{r.restrictive_practice_category || r.restrictive_practice_type || '—'}{r.practice_duration_minutes ? <div className="text-[11px] text-muted-foreground">{r.practice_duration_minutes} min</div> : null}</td>
                        <td className="p-2">{r.authorisation_status || '—'}<div className="text-[11px] text-muted-foreground">{r.authorisation_reference || 'No reference'}{r.authorisation_expiry ? ` · to ${r.authorisation_expiry}` : ''}</div></td>
                        <td className="p-2"><div className="flex flex-wrap gap-1">{flags.length ? flags.map((f) => <span key={f.key} className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${TONE[f.tone]}`}>{f.label}</span>) : <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">Complete</span>}</div></td>
                        <td className="p-2 text-right">{!r.reported_to_regulator && <Button size="sm" variant="outline" onClick={() => markReported(r)}>Mark reported</Button>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record a restrictive practice</DialogTitle>
            <DialogDescription>Record every use, authorised or not.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5"><Label>Participant</Label><Input value={form.participant_name} onChange={set('participant_name')} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5"><Label>Date</Label><Input type="date" value={form.record_date} onChange={set('record_date')} /></div>
              <div className="grid gap-1.5"><Label>Duration (min)</Label><Input type="number" min="0" value={form.practice_duration_minutes} onChange={set('practice_duration_minutes')} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5"><Label>Sector</Label>
                <Select value={form.sector} onValueChange={set('sector')}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="NDIS">NDIS</SelectItem><SelectItem value="Aged Care">Aged Care</SelectItem></SelectContent></Select>
              </div>
              <div className="grid gap-1.5"><Label>Category</Label>
                <Select value={form.restrictive_practice_category} onValueChange={set('restrictive_practice_category')}><SelectTrigger><SelectValue placeholder="Choose" /></SelectTrigger><SelectContent>{RP_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
              </div>
            </div>
            <div className="grid gap-1.5"><Label>What was used</Label><Input value={form.restrictive_practice_type} onChange={set('restrictive_practice_type')} placeholder="e.g. PRN medication for behaviour, locked kitchen" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5"><Label>Authorisation</Label>
                <Select value={form.authorisation_status} onValueChange={set('authorisation_status')}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['Authorised', 'Pending', 'Unauthorised'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
              </div>
              <div className="grid gap-1.5"><Label>Authorisation expires</Label><Input type="date" value={form.authorisation_expiry} onChange={set('authorisation_expiry')} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5"><Label>Authorisation reference</Label><Input value={form.authorisation_reference} onChange={set('authorisation_reference')} /></div>
              <div className="grid gap-1.5"><Label>Behaviour support plan ref</Label><Input value={form.behaviour_support_plan_reference} onChange={set('behaviour_support_plan_reference')} /></div>
            </div>
            <div className="grid gap-1.5"><Label>Reduction and elimination actions</Label><Textarea rows={2} value={form.reduction_actions} onChange={set('reduction_actions')} /></div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.reported_to_regulator} onChange={(e) => setForm({ ...form, reported_to_regulator: e.target.checked })} />Already reported to the NDIS Commission / aged care regulator</label>
            <div className="grid gap-1.5"><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={set('notes')} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
