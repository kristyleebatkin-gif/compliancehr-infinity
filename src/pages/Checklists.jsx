import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, ClipboardList, Check } from 'lucide-react';
import { format } from 'date-fns';

export default function Checklists() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', category: '', due_date: '', notes: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await base44.entities.Checklist.filter({}, { sort: '-created_date', limit: 50 });
      setLists(page.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await base44.entities.Checklist.create({ ...form, items: [] });
      setForm({ title: '', category: '', due_date: '', notes: '' });
      setOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const toggleItem = async (list, index) => {
    const items = list.items.map((it, i) => (i === index ? { ...it, done: !it.done } : it));
    await base44.entities.Checklist.update(list.id, { items });
    await load();
  };

  const addItem = async (list, text) => {
    if (!text.trim()) return;
    const items = [...(list.items || []), { text: text.trim(), done: false }];
    await base44.entities.Checklist.update(list.id, { items });
    await load();
  };

  const removeItem = async (list, index) => {
    const items = list.items.filter((_, i) => i !== index);
    await base44.entities.Checklist.update(list.id, { items });
    await load();
  };

  const progress = (items) => {
    if (!items || items.length === 0) return 0;
    return Math.round((items.filter((i) => i.done).length / items.length) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold"><ClipboardList className="h-6 w-6" /> Compliance Checklists</h1>
          <p className="text-sm text-muted-foreground">Working checklists with item tracking.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> New checklist</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New checklist</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div className="grid gap-1.5"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Due date</Label><Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
              </div>
              <Button onClick={save} disabled={saving || !form.title.trim()}>Create checklist</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary" /></div>
      ) : lists.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">No checklists yet.</CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {lists.map((list) => {
            const pct = progress(list.items);
            return (
              <Card key={list.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{list.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {[list.category, list.due_date ? `Due ${format(new Date(list.due_date), 'd MMM yyyy')}` : ''].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <Badge variant={pct === 100 ? 'default' : 'secondary'}>{pct}%</Badge>
                  </div>

                  {pct > 0 && (
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                  )}

                  <div className="mt-3 space-y-2">
                    {(list.items || []).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Checkbox checked={item.done} onCheckedChange={() => toggleItem(list, idx)} />
                        <span className={item.done ? 'flex-1 text-muted-foreground line-through' : 'flex-1'}>{item.text}</span>
                        <button onClick={() => removeItem(list, idx)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <AddItemRow onAdd={(text) => addItem(list, text)} />

                  <div className="mt-3 flex justify-end">
                    <Button variant="ghost" size="icon" onClick={async () => { await base44.entities.Checklist.delete(list.id); await load(); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

const AddItemRow = ({ onAdd }) => {
  const [text, setText] = useState('');
  return (
    <div className="mt-3 flex gap-2">
      <Input
        placeholder="Add item..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { onAdd(text); setText(''); } }}
        className="h-8 text-sm"
      />
      <Button size="sm" variant="outline" onClick={() => { onAdd(text); setText(''); }}><Check className="h-4 w-4" /></Button>
    </div>
  );
};