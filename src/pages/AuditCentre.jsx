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
import { Plus, Trash2, ClipboardCheck, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

const FLOW = ['Scheduled', 'In Progress', 'Complete', 'Follow-up Required'];
const NEXT = { Scheduled: 'In Progress', 'In Progress': 'Complete', Complete: 'Follow-up Required', 'Follow-up Required': 'Scheduled' };
const tone = (s) => (s === 'Complete' ? 'default' : s === 'Scheduled' || s === 'In Progress' ? 'secondary' : 'destructive');

export default function AuditCentre() {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', audit_area: '', date: '', auditor: '', status: 'Scheduled', score: '', findings: '', actions: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await base44.entities.Audit.filter({}, { sort: '-date', limit: 50 });
      setAudits(page.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await base44.entities.Audit.create({ ...form, score: Number(form.score) || undefined });
      setForm({ title: '', audit_area: '', date: '', auditor: '', status: 'Scheduled', score: '', findings: '', actions: '' });
      setOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const advance = async (a) => {
    await base44.entities.Audit.update(a.id, { status: NEXT[a.status] });
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold"><ClipboardCheck className="h-6 w-6" /> Audit Centre</h1>
          <p className="text-sm text-muted-foreground">Internal and external audit schedule, findings and actions.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> New audit</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New audit</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div className="grid gap-1.5"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Audit area</Label><Input value={form.audit_area} onChange={(e) => setForm({ ...form, audit_area: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Auditor</Label><Input value={form.auditor} onChange={(e) => setForm({ ...form, auditor: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-1.5"><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{FLOW.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5"><Label>Score (%)</Label><Input type="number" value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} /></div>
              </div>
              <div className="grid gap-1.5"><Label>Findings</Label><Textarea value={form.findings} onChange={(e) => setForm({ ...form, findings: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Corrective actions</Label><Textarea value={form.actions} onChange={(e) => setForm({ ...form, actions: e.target.value })} /></div>
              <Button onClick={save} disabled={saving || !form.title.trim()}>Save audit</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary" /></div>
      ) : audits.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">No audits recorded yet.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {audits.map((a) => (
            <Card key={a.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{a.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {[a.audit_area, a.date ? format(new Date(a.date), 'd MMM yyyy') : '', a.auditor].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <Badge variant={tone(a.status)}>{a.status}</Badge>
                </div>
                {a.score != null && <p className="mt-2 text-sm"><span className="font-medium">Score:</span> {a.score}%</p>}
                {a.findings && <p className="mt-1 text-sm text-muted-foreground"><span className="font-medium text-foreground">Findings:</span> {a.findings}</p>}
                {a.actions && <p className="mt-1 text-sm text-muted-foreground"><span className="font-medium text-foreground">Actions:</span> {a.actions}</p>}
                <div className="mt-3 flex justify-end">
                  <Button variant="ghost" size="icon" onClick={() => advance(a)} title="Cycle status"><ArrowRight className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={async () => { await base44.entities.Audit.delete(a.id); await load(); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}