import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, FileSpreadsheet, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

const FLOW = ['Draft', 'Sent', 'Paid', 'Overdue'];
const NEXT = { Draft: 'Sent', Sent: 'Paid', Paid: 'Overdue', Overdue: 'Draft' };

export default function InvoicingCentre() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ invoice_number: '', client_name: '', amount: '', issue_date: '', due_date: '', status: 'Draft', description: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await base44.entities.Invoice.filter({}, { sort: '-created_date', limit: 50 });
      setInvoices(page.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.invoice_number.trim()) return;
    setSaving(true);
    try {
      await base44.entities.Invoice.create({ ...form, amount: Number(form.amount) || undefined });
      setForm({ invoice_number: '', client_name: '', amount: '', issue_date: '', due_date: '', status: 'Draft', description: '' });
      setOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const advance = async (inv) => {
    await base44.entities.Invoice.update(inv.id, { status: NEXT[inv.status] });
    await load();
  };

  const outstanding = invoices.filter((i) => i.status !== 'Paid').reduce((sum, i) => sum + (i.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold"><FileSpreadsheet className="h-6 w-6" /> Invoicing Centre</h1>
          <p className="text-sm text-muted-foreground">Outstanding total: ${outstanding.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> New invoice</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New invoice</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Invoice number *</Label><Input value={form.invoice_number} onChange={(e) => setForm({ ...form, invoice_number: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Client</Label><Input value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-1.5"><Label>Amount ($)</Label><Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Issue date</Label><Input type="date" value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Due date</Label><Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{FLOW.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5"><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              </div>
              <Button onClick={save} disabled={saving || !form.invoice_number.trim()}>Save invoice</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
      ) : invoices.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">No invoices yet.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => (
            <Card key={inv.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">{inv.invoice_number}{inv.client_name ? ` · ${inv.client_name}` : ''}</p>
                  <p className="text-sm text-muted-foreground">
                    {inv.description || 'No description'}
                    {inv.due_date ? ` · Due ${format(new Date(inv.due_date), 'd MMM yyyy')}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-semibold">{inv.amount != null ? `$${inv.amount.toLocaleString('en-AU', { minimumFractionDigits: 2 })}` : ''}</p>
                  <Badge className={statusTone(inv.status)}>{inv.status}</Badge>
                  <Button variant="ghost" size="icon" onClick={() => advance(inv)} title="Cycle status"><ArrowRight className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={async () => { await base44.entities.Invoice.delete(inv.id); await load(); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}