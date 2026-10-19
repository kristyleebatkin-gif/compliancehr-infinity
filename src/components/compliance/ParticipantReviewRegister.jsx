import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Users, Download, Pencil, AlertTriangle } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { downloadCsv, fetchAllRecords } from '@/lib/csvExport';

const REVIEW_TYPES = ['Initial', '3 Monthly', '6 Monthly', '9 Monthly', '12 Monthly', 'Scheduled', 'Annual', 'Interim', 'Exit'];
const STATUSES = ['Scheduled', 'In Progress', 'Completed', 'Overdue'];

const blank = { participant_id: '', participant_name: '', review_date: '', review_type: 'Scheduled', status: 'Scheduled', reviewer: '', next_review_due: '', notes: '' };

const CSV_COLUMNS = [
  { key: 'participant_name', label: 'Participant' }, { key: 'review_date', label: 'Review Date' },
  { key: 'review_type', label: 'Review Type' }, { key: 'reviewer', label: 'Reviewer' },
  { key: 'next_review_due', label: 'Next Review Due' }, { key: 'status', label: 'Status' }, { key: 'notes', label: 'Notes' },
];

export default function ParticipantReviewRegister() {
  const [reviews, setReviews] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(blank);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [rp, rt] = await Promise.all([
        base44.entities.ParticipantReview.filter({}, { sort: '-review_date', limit: 200 }),
        base44.entities.ParticipantProfile.filter({}, { sort: 'full_name', limit: 200, fields: ['full_name'] }),
      ]);
      setReviews(rp.items || []);
      setParticipants(rt.items || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const pickParticipant = (id) => {
    const p = participants.find((x) => x.id === id);
    setForm((f) => ({ ...f, participant_id: id, participant_name: p?.full_name || f.participant_name }));
  };

  const openNew = () => { setEditingId(null); setForm(blank); setOpen(true); };
  const openEdit = (r) => { setEditingId(r.id); setForm({ ...blank, ...r }); setOpen(true); };

  const save = async () => {
    if (!form.participant_id || !form.review_date) return;
    setSaving(true);
    try {
      if (editingId) await base44.entities.ParticipantReview.update(editingId, form);
      else await base44.entities.ParticipantReview.create(form);
      setOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (r) => {
    if (!window.confirm(`Delete review for ${r.participant_name}?`)) return;
    await base44.entities.ParticipantReview.delete(r.id);
    await load();
  };

  const exportCsv = async () => {
    const rows = await fetchAllRecords(base44.entities.ParticipantReview, {}, '-review_date');
    downloadCsv('participant-review-register.csv', CSV_COLUMNS, rows);
  };

  const today = new Date().toISOString().slice(0, 10);
  const isOverdue = (r) => r.status !== 'Completed' && r.review_date && r.review_date < today;
  const dueSoon = (r) => r.status !== 'Completed' && r.review_date >= today && r.review_date <= new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
  const overdueCount = reviews.filter(isOverdue).length;
  const dueSoonCount = reviews.filter(dueSoon).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card><CardContent className="p-4"><div className="text-2xl font-bold tabular-nums">{reviews.length}</div><div className="text-xs text-muted-foreground">Reviews recorded</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold tabular-nums text-danger">{overdueCount}</div><div className="text-xs text-muted-foreground">Overdue</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold tabular-nums text-warning">{dueSoonCount}</div><div className="text-xs text-muted-foreground">Due in 14 days</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold tabular-nums text-safe">{reviews.filter((r) => r.status === 'Completed').length}</div><div className="text-xs text-muted-foreground">Completed</div></CardContent></Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Add review</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingId ? 'Edit participant review' : 'New participant review'}</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div className="grid gap-1.5"><Label>Participant *</Label>
                <Select value={form.participant_id} onValueChange={pickParticipant}>
                  <SelectTrigger><SelectValue placeholder="Select participant" /></SelectTrigger>
                  <SelectContent>
                    {participants.map((p) => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Review date *</Label><Input type="date" value={form.review_date} onChange={(e) => set('review_date', e.target.value)} /></div>
                <div className="grid gap-1.5"><Label>Review type</Label>
                  <Select value={form.review_type} onValueChange={(v) => set('review_type', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{REVIEW_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => set('status', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5"><Label>Reviewer</Label><Input value={form.reviewer} onChange={(e) => set('reviewer', e.target.value)} /></div>
              </div>
              <div className="grid gap-1.5"><Label>Next review due</Label><Input type="date" value={form.next_review_due} onChange={(e) => set('next_review_due', e.target.value)} /></div>
              <div className="grid gap-1.5"><Label>Notes</Label><Textarea rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Goals reviewed, progress, outcomes, satisfaction..." /></div>
              <Button onClick={save} disabled={saving || !form.participant_id || !form.review_date}>{editingId ? 'Save changes' : 'Save review'}</Button>
            </div>
          </DialogContent>
        </Dialog>
        <Button variant="outline" onClick={exportCsv}><Download className="mr-2 h-4 w-4" /> Export (CSV)</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
      ) : reviews.length === 0 ? (
        <EmptyState icon={Users} modulePath="/compliance" title="No participant reviews yet" message="Record goal and service agreement reviews — NDIS Practice Standards expect regular participant reviews." />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-left text-xs text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Participant</th>
                    <th className="px-3 py-2 font-medium">Review Date</th>
                    <th className="px-3 py-2 font-medium">Type</th>
                    <th className="px-3 py-2 font-medium">Reviewer</th>
                    <th className="px-3 py-2 font-medium">Next Due</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((r) => (
                    <tr key={r.id} className="border-b border-border/40 hover:bg-muted/30">
                      <td className="px-3 py-2.5 font-medium">{r.participant_name || '—'}</td>
                      <td className="px-3 py-2.5 text-muted-foreground text-xs tabular-nums">
                        {r.review_date || '—'}
                        {isOverdue(r) && <Badge className="ml-2 bg-danger/15 text-danger"><AlertTriangle className="mr-1 h-3 w-3" />Overdue</Badge>}
                        {!isOverdue(r) && dueSoon(r) && <Badge className="ml-2 bg-warning/15 text-warning">Due soon</Badge>}
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">{r.review_type}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{r.reviewer || '—'}</td>
                      <td className="px-3 py-2.5 text-muted-foreground text-xs tabular-nums">{r.next_review_due || '—'}</td>
                      <td className="px-3 py-2.5"><Badge className={statusTone(isOverdue(r) ? 'Overdue' : r.status)}>{isOverdue(r) ? 'Overdue' : r.status}</Badge></td>
                      <td className="px-3 py-2.5 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => remove(r)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}