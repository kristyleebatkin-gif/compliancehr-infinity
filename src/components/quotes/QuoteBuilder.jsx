import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SUPPORT_ITEMS, lineAmount, PRICE_GUIDE_VERSION } from '@/lib/ndisPriceGuide';
import { Plus, Trash2 } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { archiveQuoteCopy } from '@/lib/quoteArchive';
import { useToast } from '@/components/ui/use-toast';
import QuotePreview from '@/components/quotes/QuotePreview';
import AiItemSuggest from '@/components/invoicing/AiItemSuggest';
import financeDocumentDefaults from '@/components/invoicing/financeDocumentDefaults';

const today = () => format(new Date(), 'yyyy-MM-dd');

export default function QuoteBuilder({ open, onOpenChange, editing, business, onSaved }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null);
  const [lines, setLines] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!open) return;
    setShowPreview(false);
    if (editing) {
      setForm({ ...editing, terms_conditions: editing.terms_conditions ?? financeDocumentDefaults(business).terms_conditions });
      setLines(JSON.parse(editing.line_items || '[]'));
    } else {
      const validity = Number(business?.quote_validity_days) || 30;
      setForm({
        client_name: '', client_email: '', client_address: '', biller_type: 'Plan Manager',
        participant_name: '', ndis_number: '', participant_address: '',
        issue_date: today(), expiry_date: format(addDays(new Date(), validity), 'yyyy-MM-dd'),
        terms_conditions: financeDocumentDefaults(business).terms_conditions, notes: financeDocumentDefaults(business).notes, status: 'Draft',
      });
      setLines([{ code: '', description: '', unit: 'hour', qty: 1, unit_price: 0 }]);
    }
  }, [open, editing, business]);

  const subtotal = useMemo(() => lines.reduce((sum, line) => sum + lineAmount(line), 0), [lines]);

  const setLine = (index, patch) => setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  const pickItem = (index, itemIndex) => {
    const item = SUPPORT_ITEMS[itemIndex];
    setLine(index, { code: item.code, description: item.description, unit: item.unit, unit_price: item.rate });
  };

  const save = async () => {
    if (!form.client_name?.trim() || !lines.length) return;
    setSaving(true);
    try {
      const data = {
        ...form,
        line_items: JSON.stringify(lines.filter((l) => l.description || l.code)),
        subtotal: Math.round(subtotal * 100) / 100,
        total: Math.round(subtotal * 100) / 100,
      };
      let saved;
      if (editing) {
        await base44.entities.Quote.update(editing.id, data);
        saved = { ...editing, ...data };
      } else {
        const count = await base44.entities.Quote.count({});
        data.quote_number = data.quote_number || `Q-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
        saved = await base44.entities.Quote.create(data);
      }
      // Automated filing: generate the branded PDF and store copies on the quote and client file.
      try {
        await archiveQuoteCopy(saved, business);
        toast({ title: 'Quote filed', description: 'A branded PDF copy was generated and saved to the client file.' });
      } catch (pdfError) {
        toast({ title: 'Quote saved, PDF copy pending', description: pdfError.message });
      }
      onSaved();
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  if (!form) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-h-[92vh] overflow-y-auto ${showPreview ? 'sm:max-w-4xl' : 'sm:max-w-2xl'}`}>
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit quote' : 'New quote'}</DialogTitle>
        </DialogHeader>
        <div className="flex gap-1.5">
          <Button variant={showPreview ? 'outline' : 'default'} size="sm" className="h-7 text-xs" onClick={() => setShowPreview(false)}>Edit details</Button>
          <Button variant={showPreview ? 'default' : 'outline'} size="sm" className="h-7 text-xs" onClick={() => setShowPreview(true)}>Live preview</Button>
        </div>
        {showPreview ? (
          <QuotePreview quote={{ ...form, line_items: JSON.stringify(lines), quote_number: editing?.quote_number || 'Preview' }} business={business} />
        ) : (
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5"><Label>Quote for (client) *</Label><Input value={form.client_name || ''} onChange={(e) => setForm({ ...form, client_name: e.target.value })} placeholder="Participant, plan manager or NDIA" /></div>
            <div className="grid gap-1.5"><Label>Biller type</Label>
              <Select value={form.biller_type} onValueChange={(v) => setForm({ ...form, biller_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{['Participant', 'Plan Manager', 'NDIA', 'Other'].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5"><Label>Client email (for sending)</Label><Input type="email" value={form.client_email || ''} onChange={(e) => setForm({ ...form, client_email: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label>Client address</Label><Input value={form.client_address || ''} onChange={(e) => setForm({ ...form, client_address: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="grid gap-1.5"><Label>Participant</Label><Input value={form.participant_name || ''} onChange={(e) => setForm({ ...form, participant_name: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label>NDIS number</Label><Input value={form.ndis_number || ''} onChange={(e) => setForm({ ...form, ndis_number: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label>Participant address</Label><Input value={form.participant_address || ''} onChange={(e) => setForm({ ...form, participant_address: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="grid gap-1.5"><Label>Quote date</Label><Input type="date" value={form.issue_date || ''} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label>Valid until</Label><Input type="date" value={form.expiry_date || ''} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{['Draft', 'Sent', 'Accepted', 'Declined', 'Expired'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 p-3">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-foreground/50">Support line items</p>
                <p className="text-[10px] text-muted-foreground">{PRICE_GUIDE_VERSION} — rates editable on every line</p>
              </div>
              <div className="flex items-center gap-2">
                <AiItemSuggest mode="quote" onAdd={(newLines) => setLines([...lines, ...newLines])} />
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setLines([...lines, { code: '', description: '', unit: 'hour', qty: 1, unit_price: 0 }])}>
                  <Plus className="h-3 w-3" />Add line
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              {lines.map((line, index) => (
                <div key={index} className="space-y-1.5 rounded-lg bg-muted/40 p-2.5">
                  <div className="flex gap-2">
                    <Select value="" onValueChange={(v) => pickItem(index, Number(v))}>
                      <SelectTrigger className="h-8 flex-1 text-xs"><SelectValue placeholder="Select NDIS support item..." /></SelectTrigger>
                      <SelectContent className="max-h-72">
                        {SUPPORT_ITEMS.map((item, i) => (
                          <SelectItem key={i} value={String(i)}>{item.description} — ${item.rate}/{item.unit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setLines(lines.filter((_, i) => i !== index))}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  </div>
                  <Input className="h-8 text-xs" placeholder="Description" value={line.description} onChange={(e) => setLine(index, { description: e.target.value })} />
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <Input className="h-8 text-xs" placeholder="Code" value={line.code} onChange={(e) => setLine(index, { code: e.target.value })} />
                    <Input className="h-8 text-xs" placeholder="Unit" value={line.unit} onChange={(e) => setLine(index, { unit: e.target.value })} />
                    <Input className="h-8 text-xs" type="number" step="0.01" placeholder="Qty" value={line.qty} onChange={(e) => setLine(index, { qty: e.target.value })} />
                    <Input className="h-8 text-xs" type="number" step="0.01" placeholder="Rate" value={line.unit_price} onChange={(e) => setLine(index, { unit_price: e.target.value })} />
                  </div>
                  <p className="text-right text-xs font-medium">Amount: ${lineAmount(line).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-end border-t border-border/60 pt-2 text-sm font-bold">Quote total: ${subtotal.toFixed(2)} <span className="ml-2 text-xs font-normal text-muted-foreground">(GST-free)</span></div>
          </div>

          <div className="grid gap-1.5"><Label>Quote terms and conditions</Label><Textarea rows={3} value={form.terms_conditions || ''} onChange={(e) => setForm({ ...form, terms_conditions: e.target.value })} /></div>
          <div className="grid gap-1.5"><Label>Notes</Label><Textarea rows={2} value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          <Button onClick={save} disabled={saving || !form.client_name?.trim()}>{editing ? 'Save changes' : 'Create quote'}</Button>
        </div>
        )}
      </DialogContent>
    </Dialog>
  );
}