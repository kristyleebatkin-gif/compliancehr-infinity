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
import { Plus, Trash2, UserPlus, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

const FLOW = ['New', 'In Assessment', 'Approved', 'Active', 'Declined'];
const NEXT = { New: 'In Assessment', 'In Assessment': 'Approved', Approved: 'Active', Active: 'Declined', Declined: 'New' };
const tone = (s) => (s === 'Active' || s === 'Approved' ? 'default' : s === 'New' || s === 'In Assessment' ? 'secondary' : 'destructive');

export default function Intake() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ participant_name: '', referrer: '', source: '', date_received: '', ndis_number: '', status: 'New', notes: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await base44.entities.Intake.filter({}, { sort: '-created_date', limit: 50 });
      setItems(page.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.participant_name.trim()) return;
    setSaving(true);
    try {
      await base44.entities.Intake.create(form);
      setForm({ participant_name: '', referrer: '', source: '', date_received: '', ndis_number: '', status: 'New', notes: '' });
      setOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const advance = async (i) => {
    await base44.entities.Intake.update(i.id, { status: NEXT[i.status] });
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold"><UserPlus className="h-6 w-6" /> Intake & Referrals</h1>
          <p className="text-sm text-muted-foreground">Track new referrals from receipt through onboarding.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> New referral</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New referral</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div className="grid gap-1.5"><Label>Participant name *</Label><Input value={form.participant_name} onChange={(e) => setForm({ ...form, participant_name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Referrer</Label><Input value={form.referrer} onChange={(e) => setForm({ ...form, referrer: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Source</Label><Input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-1.5"><Label>Date received</Label><Input type="date" value={form.date_received} onChange={(e) => setForm({ ...form, date_received: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>NDIS number</Label><Input value={form.ndis_number} onChange={(e) => setForm({ ...form, ndis_number: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{FLOW.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-1.5"><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              <Button onClick={save} disabled={saving || !form.participant_name.trim()}>Save referral</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
      ) : items.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">No referrals yet.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {items.map((i) => (
            <Card key={i.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">{i.participant_name}{i.ndis_number ? ` · ${i.ndis_number}` : ''}</p>
                  <p className="text-sm text-muted-foreground">
                    {[i.referrer, i.source, i.date_received ? format(new Date(i.date_received), 'd MMM yyyy') : ''].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={tone(i.status)}>{i.status}</Badge>
                  <Button variant="ghost" size="icon" onClick={() => advance(i)} title="Cycle status"><ArrowRight className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={async () => { await base44.entities.Intake.delete(i.id); await load(); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}