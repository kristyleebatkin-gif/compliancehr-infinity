import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, TrendingUp, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

const FLOW = ['New', 'In Progress', 'Implemented', 'Closed'];
const NEXT = { New: 'In Progress', 'In Progress': 'Implemented', Implemented: 'Closed', Closed: 'New' };
const tone = (s) => (s === 'Implemented' || s === 'Closed' ? 'default' : s === 'New' || s === 'In Progress' ? 'secondary' : 'outline');

export default function QualityImprovement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'Improvement Idea', source: '', owner: '', status: 'New', target_date: '', notes: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await base44.entities.QualityItem.filter({}, { sort: '-created_date', limit: 50 });
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
      await base44.entities.QualityItem.create(form);
      setForm({ title: '', type: 'Improvement Idea', source: '', owner: '', status: 'New', target_date: '', notes: '' });
      setOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const advance = async (i) => {
    await base44.entities.QualityItem.update(i.id, { status: NEXT[i.status] });
    await load();
  };

  const List = ({ type }) => {
    const filtered = items.filter((i) => i.type === type);
    if (filtered.length === 0) {
      return <Card><CardContent className="p-10 text-center text-muted-foreground">Nothing here yet.</CardContent></Card>;
    }
    return (
      <div className="space-y-3">
        {filtered.map((i) => (
          <Card key={i.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium">{i.title}</p>
                <p className="text-sm text-muted-foreground">
                  {[i.source, i.owner, i.target_date ? format(new Date(i.target_date), 'd MMM yyyy') : ''].filter(Boolean).join(' · ')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={tone(i.status)}>{i.status}</Badge>
                <Button variant="ghost" size="icon" onClick={() => advance(i)} title="Cycle status"><ArrowRight className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={async () => { await base44.entities.QualityItem.delete(i.id); await load(); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold"><TrendingUp className="h-6 w-6" /> Quality & Improvement</h1>
          <p className="text-sm text-muted-foreground">Continuous improvement register and corrective actions.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> New item</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New quality item</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div className="grid gap-1.5"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{['Improvement Idea', 'Corrective Action'].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5"><Label>Owner</Label><Input value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-1.5"><Label>Source</Label><Input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Target date</Label><Input type="date" value={form.target_date} onChange={(e) => setForm({ ...form, target_date: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{FLOW.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-1.5"><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              <Button onClick={save} disabled={saving || !form.title.trim()}>Save item</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="Improvement Idea">
        <TabsList>
          <TabsTrigger value="Improvement Idea">Improvement Ideas</TabsTrigger>
          <TabsTrigger value="Corrective Action">Corrective Actions</TabsTrigger>
        </TabsList>
        <TabsContent value="Improvement Idea" className="mt-4">
          {loading ? (
            <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
          ) : <List type="Improvement Idea" />}
        </TabsContent>
        <TabsContent value="Corrective Action" className="mt-4">
          {!loading && <List type="Corrective Action" />}
        </TabsContent>
      </Tabs>
    </div>
  );
}