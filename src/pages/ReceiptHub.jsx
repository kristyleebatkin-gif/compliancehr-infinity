import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Receipt as ReceiptIcon, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

export default function ReceiptHub() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ description: '', amount: '', date: '', paid_by: '', category: '', status: 'Unreconciled', receipt_url: '', notes: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await base44.entities.Receipt.filter({}, { sort: '-date', limit: 50 });
      setReceipts(page.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.description.trim()) return;
    setSaving(true);
    try {
      await base44.entities.Receipt.create({ ...form, amount: Number(form.amount) || undefined });
      setForm({ description: '', amount: '', date: '', paid_by: '', category: '', status: 'Unreconciled', receipt_url: '', notes: '' });
      setOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const reconcile = async (r) => {
    await base44.entities.Receipt.update(r.id, { status: r.status === 'Unreconciled' ? 'Reconciled' : 'Unreconciled' });
    await load();
  };

  const unrecTotal = receipts.filter((r) => r.status === 'Unreconciled').reduce((s, r) => s + (r.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold"><ReceiptIcon className="h-6 w-6" /> Receipt Hub</h1>
          <p className="text-sm text-muted-foreground">Unreconciled total: ${unrecTotal.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Log receipt</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New receipt</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Description *</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Amount ($)</Label><Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-1.5"><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Paid by</Label><Input value={form.paid_by} onChange={(e) => setForm({ ...form, paid_by: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{['Unreconciled', 'Reconciled'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5"><Label>Receipt link</Label><Input value={form.receipt_url} onChange={(e) => setForm({ ...form, receipt_url: e.target.value })} /></div>
              </div>
              <Button onClick={save} disabled={saving || !form.description.trim()}>Save receipt</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
      ) : receipts.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">No receipts logged yet.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {receipts.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">{r.description}{r.category ? ` · ${r.category}` : ''}</p>
                  <p className="text-sm text-muted-foreground">
                    {[r.date ? format(new Date(r.date), 'd MMM yyyy') : '', r.paid_by].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {r.amount != null && <p className="font-semibold">${r.amount.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</p>}
                  <Badge variant={r.status === 'Reconciled' ? 'default' : 'secondary'}>{r.status}</Badge>
                  <Button variant="ghost" size="icon" onClick={() => reconcile(r)} title="Toggle reconciled"><CheckCircle2 className="h-4 w-4" /></Button>
                  {r.receipt_url && <a href={r.receipt_url} target="_blank" rel="noreferrer" className="text-sm text-primary underline">Open</a>}
                  <Button variant="ghost" size="icon" onClick={async () => { await base44.entities.Receipt.delete(r.id); await load(); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}