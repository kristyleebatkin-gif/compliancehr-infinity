import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { changeStatus } from '@/lib/statusLog';
import { format } from 'date-fns';
import { Loader2, Plus, Trash2, TrendingUp, Star } from 'lucide-react';

const REVIEW_TYPES = ['Probation', '6-Month Review', 'Annual Review', 'Return from Leave', 'Other'];
const OUTCOMES = ['Exceeds expectations', 'Meets expectations', 'Needs improvement', 'Unsatisfactory'];
const STATUSES = ['Scheduled', 'In Progress', 'Completed', 'Cancelled'];
const EMPTY = { review_type: 'Annual Review', review_date: '', reviewer: '', overall_rating: '', outcome: 'Meets expectations', strengths: '', improvements: '', goals: '', next_review_date: '', notes: '', status: 'Scheduled' };

const Stars = ({ rating }) => (
  <span className="inline-flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star key={n} className={`h-3.5 w-3.5 ${rating && n <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
    ))}
  </span>
);

export default function StaffPerformanceTab({ staff }) {
  const { toast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const load = async () => {
    setLoading(true);
    try {
      const page = await base44.entities.PerformanceReview.filter({ staff_id: staff.id }, { sort: '-review_date', limit: 100 });
      setReviews(page.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [staff.id]);

  const save = async () => {
    setSaving(true);
    try {
      await base44.entities.PerformanceReview.create({
        ...form,
        overall_rating: form.overall_rating === '' ? undefined : Number(form.overall_rating),
        staff_name: staff.full_name,
        staff_id: staff.id,
      });
      setForm(EMPTY);
      setOpen(false);
      toast({ title: 'Performance review recorded' });
      await load();
    } finally {
      setSaving(false);
    }
  };

  const setStatus = async (review, status) => {
    if (status === review.status) return;
    await changeStatus({ entityType: 'PerformanceReview', entity: 'PerformanceReview', record: review, toStatus: status });
    await load();
  };

  const latest = reviews.find((r) => r.status === 'Completed');

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <TrendingUp className="h-4 w-4 text-brand" />Performance reviews ({reviews.length})
            {latest && <span className="text-xs font-normal text-muted-foreground">Latest rating: <Stars rating={latest.overall_rating} /> {latest.overall_rating ? `(${latest.overall_rating}/5)` : ''}</span>}
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus className="mr-2 h-4 w-4" />New review</Button></DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
              <DialogHeader><DialogTitle>New performance review</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5"><Label>Review type</Label>
                    <Select value={form.review_type} onValueChange={(v) => setForm({ ...form, review_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{REVIEW_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5"><Label>Review date</Label><Input type="date" value={form.review_date} onChange={(e) => setForm({ ...form, review_date: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="grid gap-1.5"><Label>Reviewer</Label><Input value={form.reviewer} onChange={(e) => setForm({ ...form, reviewer: e.target.value })} /></div>
                  <div className="grid gap-1.5"><Label>Rating (1-5)</Label><Input type="number" min="1" max="5" value={form.overall_rating} onChange={(e) => setForm({ ...form, overall_rating: e.target.value })} /></div>
                  <div className="grid gap-1.5"><Label>Outcome</Label>
                    <Select value={form.outcome} onValueChange={(v) => setForm({ ...form, outcome: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{OUTCOMES.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-1.5"><Label>Strengths</Label><Textarea rows={2} value={form.strengths} onChange={(e) => setForm({ ...form, strengths: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Areas for improvement</Label><Textarea rows={2} value={form.improvements} onChange={(e) => setForm({ ...form, improvements: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Goals / development plan</Label><Textarea rows={2} value={form.goals} onChange={(e) => setForm({ ...form, goals: e.target.value })} /></div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="grid gap-1.5"><Label>Status</Label>
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5"><Label>Next review</Label><Input type="date" value={form.next_review_date} onChange={(e) => setForm({ ...form, next_review_date: e.target.value })} /></div>
                  <div className="flex items-end"><Button onClick={save} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}Save review</Button></div>
                </div>
                <div className="grid gap-1.5"><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No performance reviews recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-lg border border-border/60 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{r.review_type}{r.review_date ? ` · ${format(new Date(r.review_date), 'd MMM yyyy')}` : ''}</p>
                    <p className="text-xs text-muted-foreground">
                      {[[r.reviewer ? `Reviewer: ${r.reviewer}` : ''], [r.outcome], [r.next_review_date ? `Next: ${format(new Date(r.next_review_date), 'd MMM yyyy')}` : '']]
                        .map((p) => p[0]).filter(Boolean).join(' · ') || 'No details yet'}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Stars rating={r.overall_rating} />
                    <Badge className={statusTone(r.status)}>{r.status}</Badge>
                    <Select value={r.status} onValueChange={(v) => setStatus(r, v)}>
                      <SelectTrigger className="h-8 w-[130px] text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" onClick={async () => { if (confirm('Delete this review?')) { await base44.entities.PerformanceReview.delete(r.id); await load(); } }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                {(r.strengths || r.improvements || r.goals || r.notes) && (
                  <div className="mt-2 space-y-1 border-t border-border/40 pt-2 text-xs text-muted-foreground">
                    {r.strengths && <p><span className="font-medium text-foreground">Strengths:</span> {r.strengths}</p>}
                    {r.improvements && <p><span className="font-medium text-foreground">Improvements:</span> {r.improvements}</p>}
                    {r.goals && <p><span className="font-medium text-foreground">Goals:</span> {r.goals}</p>}
                    {r.notes && <p><span className="font-medium text-foreground">Notes:</span> {r.notes}</p>}
                  </div>
                )}
                {r.status_log && <p className="mt-1 truncate text-xs text-muted-foreground" title={r.status_log}>{r.status_log.split('\n').slice(-1)[0]}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}