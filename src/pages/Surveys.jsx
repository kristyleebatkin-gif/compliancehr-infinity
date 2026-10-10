import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, BarChart3, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

const FLOW = ['Draft', 'Open', 'Closed'];
const NEXT = { Draft: 'Open', Open: 'Closed', Closed: 'Draft' };
import { statusTone } from '@/lib/statusStyles';

const tone = statusTone;

export default function Surveys() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'Satisfaction', open_date: '', close_date: '', status: 'Draft', responses: '', avg_rating: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await base44.entities.Survey.filter({}, { sort: '-created_date', limit: 50 });
      setItems(page.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await base44.entities.Survey.create({ ...form, responses: Number(form.responses) || undefined, avg_rating: Number(form.avg_rating) || undefined });
      setForm({ title: '', type: 'Satisfaction', open_date: '', close_date: '', status: 'Draft', responses: '', avg_rating: '' });
      setOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const advance = async (i) => {
    await base44.entities.Survey.update(i.id, { status: NEXT[i.status] });
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold"><BarChart3 className="h-6 w-6" /> Surveys</h1>
          <p className="text-sm text-muted-foreground">Participant and staff satisfaction surveys.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> New survey</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New survey</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{['Satisfaction', 'Feedback', 'Census', 'Other'].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Opens</Label><Input type="date" value={form.open_date} onChange={(e) => setForm({ ...form, open_date: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Closes</Label><Input type="date" value={form.close_date} onChange={(e) => setForm({ ...form, close_date: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-1.5"><Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{FLOW.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5"><Label>Responses</Label><Input type="number" value={form.responses} onChange={(e) => setForm({ ...form, responses: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Avg rating</Label><Input type="number" step="0.1" max="5" value={form.avg_rating} onChange={(e) => setForm({ ...form, avg_rating: e.target.value })} /></div>
              </div>
              <Button onClick={save} disabled={saving || !form.title.trim()}>Save survey</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
      ) : items.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">No surveys yet.</CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((s) => (
            <Card key={s.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{s.title}</p>
                    <p className="text-sm text-muted-foreground">{s.type}</p>
                  </div>
                  <Badge className={statusTone(s.status)}>{s.status}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {[s.open_date ? `Opens ${format(new Date(s.open_date), 'd MMM')}` : '', s.close_date ? `Closes ${format(new Date(s.close_date), 'd MMM yyyy')}` : ''].filter(Boolean).join(' · ') || 'No dates set'}
                </p>
                <div className="mt-2 flex items-center gap-4 text-sm">
                  {s.responses != null && <span><span className="font-semibold">{s.responses}</span> responses</span>}
                  {s.avg_rating != null && <span><span className="font-semibold">{s.avg_rating}</span> / 5 avg</span>}
                  <span className="flex-1" />
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => advance(s)} title="Cycle status"><ArrowRight className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={async () => { await base44.entities.Survey.delete(s.id); await load(); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}