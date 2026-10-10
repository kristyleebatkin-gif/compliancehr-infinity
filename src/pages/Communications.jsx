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
import { Plus, Trash2, Megaphone } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const AUDIENCES = ['All Staff', 'Management', 'Compliance'];

export default function Communications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', audience: 'All Staff', posted_by: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await base44.entities.Announcement.filter({}, { sort: '-created_date', limit: 50 });
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
      await base44.entities.Announcement.create(form);
      setForm({ title: '', body: '', audience: 'All Staff', posted_by: '' });
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
          <h1 className="flex items-center gap-2 text-2xl font-bold"><Megaphone className="h-6 w-6" /> Communication Centre</h1>
          <p className="text-sm text-muted-foreground">Broadcasts and announcements to your teams.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> New broadcast</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New broadcast</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div className="grid gap-1.5"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Audience</Label>
                  <Select value={form.audience} onValueChange={(v) => setForm({ ...form, audience: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{AUDIENCES.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5"><Label>Posted by</Label><Input value={form.posted_by} onChange={(e) => setForm({ ...form, posted_by: e.target.value })} /></div>
              </div>
              <div className="grid gap-1.5"><Label>Message</Label><Textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></div>
              <Button onClick={save} disabled={saving || !form.title.trim()}>Send broadcast</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary" /></div>
      ) : items.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">No broadcasts yet.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <Card key={a.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{a.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {[a.posted_by, a.created_date ? formatDistanceToNow(new Date(a.created_date), { addSuffix: true }) : ''].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <Badge variant="outline">{a.audience}</Badge>
                </div>
                {a.body && <p className="mt-2 text-sm text-muted-foreground">{a.body}</p>}
                <div className="mt-3 flex justify-end">
                  <Button variant="ghost" size="icon" onClick={async () => { await base44.entities.Announcement.delete(a.id); await load(); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}