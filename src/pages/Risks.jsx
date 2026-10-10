import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, ShieldAlert, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

const FLOW = ['Open', 'Mitigated', 'Monitored', 'Closed'];
const NEXT = { Open: 'Mitigated', Mitigated: 'Monitored', Monitored: 'Closed', Closed: 'Open' };

const levelTone = (s) => (s === 'High' ? 'destructive' : s === 'Medium' ? 'secondary' : 'outline');
const statusTone = (s) => (s === 'Open' ? 'destructive' : s === 'Closed' ? 'default' : 'secondary');

export default function Risks() {
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: '', likelihood: 'Medium', impact: 'Medium', status: 'Open', owner: '', review_date: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await base44.entities.Risk.filter({ status: { $ne: 'Closed' } }, { sort: '-created_date', limit: 50 });
      setRisks(page.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await base44.entities.Risk.create(form);
      setForm({ title: '', description: '', category: '', likelihood: 'Medium', impact: 'Medium', status: 'Open', owner: '', review_date: '' });
      setOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const advance = async (risk) => {
    await base44.entities.Risk.update(risk.id, { status: NEXT[risk.status] });
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold"><ShieldAlert className="h-6 w-6" /> Risk Reporting</h1>
          <p className="text-sm text-muted-foreground">Track organisational risks and their mitigation.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Log risk</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New risk</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div className="grid gap-1.5"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-1.5"><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Likelihood</Label>
                  <Select value={form.likelihood} onValueChange={(v) => setForm({ ...form, likelihood: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{['Low', 'Medium', 'High'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5"><Label>Impact</Label>
                  <Select value={form.impact} onValueChange={(v) => setForm({ ...form, impact: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{['Low', 'Medium', 'High'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Owner</Label><Input value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Next review</Label><Input type="date" value={form.review_date} onChange={(e) => setForm({ ...form, review_date: e.target.value })} /></div>
              </div>
              <Button onClick={save} disabled={saving || !form.title.trim()}>Log risk</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary" /></div>
      ) : risks.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">No open risks.</CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {risks.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold">{r.title}</p>
                  <Badge variant={statusTone(r.status)}>{r.status}</Badge>
                </div>
                {r.description && <p className="mt-2 text-sm text-muted-foreground">{r.description}</p>}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant={levelTone(r.likelihood)}>Likelihood {r.likelihood}</Badge>
                  <Badge variant={levelTone(r.impact)}>Impact {r.impact}</Badge>
                  {r.owner && <span>Owner: {r.owner}</span>}
                  {r.review_date && <span>· Review {format(new Date(r.review_date), 'd MMM yyyy')}</span>}
                </div>
                <div className="mt-3 flex justify-end">
                  <Button variant="ghost" size="icon" onClick={() => advance(r)} title="Advance status"><ArrowRight className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={async () => { await base44.entities.Risk.delete(r.id); await load(); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}