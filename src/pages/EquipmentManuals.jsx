import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, BookOpen } from 'lucide-react';
import { format } from 'date-fns';

export default function EquipmentManuals() {
  const [manuals, setManuals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', equipment_name: '', manufacturer: '', version: '', manual_url: '', review_date: '', notes: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await base44.entities.EquipmentManual.filter({}, { sort: '-created_date', limit: 50 });
      setManuals(page.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await base44.entities.EquipmentManual.create(form);
      setForm({ title: '', equipment_name: '', manufacturer: '', version: '', manual_url: '', review_date: '', notes: '' });
      setOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold"><BookOpen className="h-6 w-6" /> Equipment Manuals</h1>
          <p className="text-sm text-muted-foreground">Operating and safety manuals for workplace equipment.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Add manual</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New equipment manual</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div className="grid gap-1.5"><Label>Manual title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Equipment</Label><Input value={form.equipment_name} onChange={(e) => setForm({ ...form, equipment_name: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Manufacturer</Label><Input value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-1.5"><Label>Version</Label><Input value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Next review</Label><Input type="date" value={form.review_date} onChange={(e) => setForm({ ...form, review_date: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Manual link</Label><Input value={form.manual_url} onChange={(e) => setForm({ ...form, manual_url: e.target.value })} /></div>
              </div>
              <div className="grid gap-1.5"><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              <Button onClick={save} disabled={saving || !form.title.trim()}>Save manual</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary" /></div>
      ) : manuals.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">No manuals added yet.</CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {manuals.map((m) => (
            <Card key={m.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-muted p-2"><BookOpen className="h-5 w-5 text-muted-foreground" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{m.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {[m.equipment_name, m.manufacturer, m.version ? `v${m.version}` : ''].filter(Boolean).join(' · ')}
                    </p>
                    {m.review_date && <p className="mt-1 text-xs text-muted-foreground">Next review {format(new Date(m.review_date), 'd MMM yyyy')}</p>}
                    <div className="mt-3 flex items-center justify-between">
                      {m.manual_url ? <a href={m.manual_url} target="_blank" rel="noreferrer" className="text-sm text-primary underline">Open manual</a> : <span />}
                      <Button variant="ghost" size="icon" onClick={async () => { await base44.entities.EquipmentManual.delete(m.id); await load(); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}