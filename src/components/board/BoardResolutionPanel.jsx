import React, { useMemo, useState } from 'react';
import { Gavel, Loader2, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import TableTab from '@/components/common/TableTab';

const TYPES = ['Governance', 'Financial', 'Clinical governance', 'Risk acceptance', 'Policy approval', 'Strategic', 'Regulatory'];
const STATUSES = ['Draft', 'Tabled', 'Approved', 'Deferred', 'Rejected', 'Withdrawn'];

const STATUS_CLASS = {
  Draft: 'bg-slate-100 text-slate-700',
  Tabled: 'bg-amber-100 text-amber-900',
  Approved: 'bg-emerald-100 text-emerald-900',
  Deferred: 'bg-sky-100 text-sky-900',
  Rejected: 'bg-rose-100 text-rose-900',
  Withdrawn: 'bg-slate-100 text-slate-700',
};

const EMPTY = {
  title: '', resolution_number: '', meeting_date: '', resolution_type: 'Governance',
  decision_text: '', status: 'Draft', moved_by: '', seconded_by: '', chair: '',
  votes_for: '', votes_against: '', abstentions: '', effective_date: '', review_date: '',
  linked_record: '', notes: '',
};

export default function BoardResolutionPanel({ resolutions = [], tenantId, signedByName, onChanged }) {
  const { toast } = useToast();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState('');
  const [filter, setFilter] = useState('All');

  const rows = useMemo(() => {
    const list = filter === 'All' ? resolutions : resolutions.filter((row) => row.status === filter);
    return [...list].sort((a, b) => String(b.meeting_date || '').localeCompare(String(a.meeting_date || '')));
  }, [resolutions, filter]);

  const submit = async (event) => {
    event.preventDefault();
    setSaving('form');
    try {
      const payload = {
        ...form,
        tenant_id: tenantId,
        votes_for: form.votes_for === '' ? null : Number(form.votes_for),
        votes_against: form.votes_against === '' ? null : Number(form.votes_against),
        abstentions: form.abstentions === '' ? null : Number(form.abstentions),
      };
      if (form.id) await base44.entities.BoardResolution.update(form.id, payload);
      else await base44.entities.BoardResolution.create(payload);
      toast({ title: form.id ? 'Resolution updated' : 'Resolution recorded', description: form.title });
      setForm(null);
      await onChanged();
    } catch (error) {
      toast({ title: 'Not saved', description: error?.message || 'The resolution could not be saved.', variant: 'destructive' });
    } finally {
      setSaving('');
    }
  };

  const signOff = async (row) => {
    setSaving(row.id);
    try {
      await base44.entities.BoardResolution.update(row.id, {
        status: 'Approved',
        signed_by: signedByName || '',
        signed_date: new Date().toISOString().slice(0, 10),
      });
      toast({ title: 'Resolution signed', description: row.title });
      await onChanged();
    } catch (error) {
      toast({ title: 'Not signed', description: error?.message || 'The sign-off could not be saved.', variant: 'destructive' });
    } finally {
      setSaving('');
    }
  };

  const set = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  return (
    <section aria-label="Board resolutions" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="resolution-filter" className="text-xs">Status</Label>
          <select id="resolution-filter" value={filter} onChange={(event) => setFilter(event.target.value)} className="h-9 rounded-md border border-input bg-background px-2 text-sm">
            <option value="All">All</option>
            {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>
        <Button size="sm" onClick={() => setForm({ ...EMPTY })}><Plus className="h-4 w-4" />New resolution</Button>
      </div>

      <TableTab label="Board resolution register">
        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left">
              <thead>
                <tr className="border-b border-border">
                  <th>Resolution</th>
                  <th>Type</th>
                  <th>Meeting</th>
                  <th>Status</th>
                  <th>Votes</th>
                  <th>Signed</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-border/60 last:border-0">
                    <td>
                      <span className="font-semibold text-foreground">{row.title}</span>
                      {row.resolution_number && <span className="block text-[11px] text-muted-foreground">{row.resolution_number}</span>}
                    </td>
                    <td>{row.resolution_type}</td>
                    <td>{row.meeting_date || '—'}</td>
                    <td><Badge className={STATUS_CLASS[row.status] || ''}>{row.status}</Badge></td>
                    <td className="text-xs">
                      {[row.votes_for, row.votes_against, row.abstentions].every((value) => value === null || value === undefined)
                        ? 'Not recorded'
                        : `${row.votes_for ?? 0} for · ${row.votes_against ?? 0} against · ${row.abstentions ?? 0} abstain`}
                    </td>
                    <td className="text-xs">{row.signed_by ? `${row.signed_by} · ${row.signed_date || ''}` : 'Not signed'}</td>
                    <td className="text-right">
                      <div className="flex flex-wrap justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setForm({ ...EMPTY, ...row })}>Edit</Button>
                        {row.status !== 'Approved' && row.status !== 'Rejected' && row.status !== 'Withdrawn' && (
                          <Button size="sm" variant="outline" onClick={() => signOff(row)} disabled={Boolean(saving)}>
                            {saving === row.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gavel className="h-4 w-4" />}Sign off
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-3 text-sm text-muted-foreground">No board resolution is recorded yet. Record the first resolution to start the governance record.</p>
        )}
      </TableTab>

      <Dialog open={Boolean(form)} onOpenChange={(open) => !open && setForm(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{form?.id ? 'Edit resolution' : 'New board resolution'}</DialogTitle>
            <DialogDescription>Record what the board resolved, how it voted and who signed it. Minutes stay in the Document Vault.</DialogDescription>
          </DialogHeader>
          {form && (
            <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="res-title">Resolution title</Label>
                <Input id="res-title" required value={form.title} onChange={(e) => set('title', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="res-number">Resolution number</Label>
                <Input id="res-number" value={form.resolution_number || ''} onChange={(e) => set('resolution_number', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="res-meeting">Meeting date</Label>
                <Input id="res-meeting" type="date" value={form.meeting_date || ''} onChange={(e) => set('meeting_date', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="res-type">Resolution type</Label>
                <select id="res-type" value={form.resolution_type} onChange={(e) => set('resolution_type', e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
                  {TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="res-status">Status</Label>
                <select id="res-status" value={form.status} onChange={(e) => set('status', e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
                  {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="res-decision">What the board resolved</Label>
                <Textarea id="res-decision" rows={3} value={form.decision_text || ''} onChange={(e) => set('decision_text', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="res-moved">Moved by</Label>
                <Input id="res-moved" value={form.moved_by || ''} onChange={(e) => set('moved_by', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="res-seconded">Seconded by</Label>
                <Input id="res-seconded" value={form.seconded_by || ''} onChange={(e) => set('seconded_by', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="res-chair">Chair</Label>
                <Input id="res-chair" value={form.chair || ''} onChange={(e) => set('chair', e.target.value)} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="res-for">For</Label>
                  <Input id="res-for" type="number" min="0" value={form.votes_for ?? ''} onChange={(e) => set('votes_for', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="res-against">Against</Label>
                  <Input id="res-against" type="number" min="0" value={form.votes_against ?? ''} onChange={(e) => set('votes_against', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="res-abstain">Abstain</Label>
                  <Input id="res-abstain" type="number" min="0" value={form.abstentions ?? ''} onChange={(e) => set('abstentions', e.target.value)} />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="res-effective">Effective date</Label>
                <Input id="res-effective" type="date" value={form.effective_date || ''} onChange={(e) => set('effective_date', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="res-review">Next review</Label>
                <Input id="res-review" type="date" value={form.review_date || ''} onChange={(e) => set('review_date', e.target.value)} />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="res-linked">Linked record reference</Label>
                <Input id="res-linked" value={form.linked_record || ''} onChange={(e) => set('linked_record', e.target.value)} placeholder="For example: Risk R-014, Policy POL-03" />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="res-notes">Notes</Label>
                <Textarea id="res-notes" rows={2} value={form.notes || ''} onChange={(e) => set('notes', e.target.value)} />
              </div>
              <div className="flex justify-end gap-2 sm:col-span-2">
                <Button type="button" variant="outline" onClick={() => setForm(null)} disabled={Boolean(saving)}>Cancel</Button>
                <Button type="submit" disabled={Boolean(saving)}>{saving === 'form' && <Loader2 className="h-4 w-4 animate-spin" />}Save resolution</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}