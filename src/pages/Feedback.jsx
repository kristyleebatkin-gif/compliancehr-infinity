import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Megaphone, ArrowRight, Star } from 'lucide-react';

const FLOW = ['New', 'In Review', 'Resolved', 'Closed'];
const NEXT = { New: 'In Review', 'In Review': 'Resolved', Resolved: 'Closed', Closed: 'New' };

export default function Feedback() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ type: 'Feedback', subject: '', message: '', submitted_by: '', rating: '', status: 'New' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await base44.entities.Feedback.filter({ status: { $ne: 'Closed' } }, { sort: '-created_date', limit: 50 });
      setItems(page.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.subject.trim()) return;
    setSaving(true);
    try {
      await base44.entities.Feedback.create({ ...form, rating: Number(form.rating) || undefined });
      setForm({ type: 'Feedback', subject: '', message: '', submitted_by: '', rating: '', status: 'New' });
      setOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const advance = async (item) => {
    await base44.entities.Feedback.update(item.id, { status: NEXT[item.status] });
    await load();
  };

  const List = ({ type }) => {
    const filtered = items.filter((i) => i.type === type);
    if (filtered.length === 0) {
      return <Card><CardContent className="p-10 text-center text-muted-foreground">Nothing recorded yet.</CardContent></Card>;
    }
    return (
      <div className="space-y-3">
        {filtered.map((i) => (
          <Card key={i.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{i.subject}</p>
                  <p className="text-sm text-muted-foreground">{i.submitted_by ? `From ${i.submitted_by}` : 'Anonymous'}</p>
                </div>
                <div className="flex items-center gap-2">
                  {i.rating ? <Badge variant="outline"><Star className="mr-1 h-3 w-3" />{i.rating}/5</Badge> : null}
                  <Badge className={statusTone(i.status)}>{i.status}</Badge>
                </div>
              </div>
              {i.message && <p className="mt-2 text-sm text-muted-foreground">{i.message}</p>}
              <div className="mt-3 flex justify-end">
                <Button variant="ghost" size="icon" onClick={() => advance(i)} title="Advance status"><ArrowRight className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={async () => { await base44.entities.Feedback.delete(i.id); await load(); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
          <h1 className="flex items-center gap-2 text-2xl font-bold"><Megaphone className="h-6 w-6" /> Feedback & Complaints</h1>
          <p className="text-sm text-muted-foreground">What people are telling you, and how it's handled.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Record entry</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New entry</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{['Feedback', 'Complaint'].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5"><Label>Rating (1-5)</Label><Input type="number" min="1" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} /></div>
              </div>
              <div className="grid gap-1.5"><Label>Subject *</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Message</Label><Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Submitted by</Label><Input value={form.submitted_by} onChange={(e) => setForm({ ...form, submitted_by: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{FLOW.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={save} disabled={saving || !form.subject.trim()}>Record entry</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="Feedback">
        <TabsList>
          <TabsTrigger value="Feedback">Feedback</TabsTrigger>
          <TabsTrigger value="Complaint">Complaints</TabsTrigger>
        </TabsList>
        <TabsContent value="Feedback" className="mt-4">
          {loading ? (
            <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
          ) : <List type="Feedback" />}
        </TabsContent>
        <TabsContent value="Complaint" className="mt-4">
          {!loading && <List type="Complaint" />}
        </TabsContent>
      </Tabs>
    </div>
  );
}