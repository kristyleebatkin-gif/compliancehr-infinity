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
import { Plus, Trash2, AlertTriangle, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];
const FLOW = ['Open', 'Investigating', 'Resolved', 'Closed'];
const NEXT = { Open: 'Investigating', Investigating: 'Resolved', Resolved: 'Closed', Closed: 'Open' };

const severityTone = (s) => (s === 'Critical' || s === 'High' ? 'destructive' : s === 'Medium' ? 'secondary' : 'outline');
const statusTone = (s) => (['Open', 'Investigating'].includes(s) ? 'destructive' : s === 'Resolved' ? 'secondary' : 'default');

export default function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', severity: 'Low', status: 'Open', reported_by: '', incident_date: '', location: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await base44.entities.Incident.filter({ status: { $ne: 'Closed' } }, { sort: '-created_date', limit: 50 });
      setIncidents(page.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await base44.entities.Incident.create(form);
      setForm({ title: '', description: '', severity: 'Low', status: 'Open', reported_by: '', incident_date: '', location: '' });
      setOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const advance = async (incident) => {
    await base44.entities.Incident.update(incident.id, { status: NEXT[incident.status] });
    await load();
  };

  const remove = async (id) => {
    await base44.entities.Incident.delete(id);
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold"><AlertTriangle className="h-6 w-6" /> Incident Clinic</h1>
          <p className="text-sm text-muted-foreground">Report, investigate and resolve incidents.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Report incident</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New incident</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div className="grid gap-1.5"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Severity</Label>
                  <Select value={form.severity} onValueChange={(v) => setForm({ ...form, severity: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{SEVERITIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5"><Label>Incident date</Label><Input type="date" value={form.incident_date} onChange={(e) => setForm({ ...form, incident_date: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Reported by</Label><Input value={form.reported_by} onChange={(e) => setForm({ ...form, reported_by: e.target.value })} /></div>
              </div>
              <Button onClick={save} disabled={saving || !form.title.trim()}>Report incident</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary" /></div>
      ) : incidents.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">No open incidents. All clear.</CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {incidents.map((i) => (
            <Card key={i.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold">{i.title}</p>
                  <Badge variant={severityTone(i.severity)}>{i.severity}</Badge>
                </div>
                {i.description && <p className="mt-2 text-sm text-muted-foreground">{i.description}</p>}
                <div className="mt-3 flex flex-wrap gap-1 text-xs text-muted-foreground">
                  {i.location && <Badge variant="outline">{i.location}</Badge>}
                  {i.incident_date && <span className="py-1">{format(new Date(i.incident_date), 'd MMM yyyy')}</span>}
                  {i.reported_by && <span className="py-1">· {i.reported_by}</span>}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Badge variant={statusTone(i.status)}>{i.status}</Badge>
                  <span className="flex items-center">
                    <Button variant="ghost" size="icon" onClick={() => advance(i)} title="Advance status"><ArrowRight className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(i.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}