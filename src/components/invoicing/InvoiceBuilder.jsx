import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Plus, Search, Trash2, Users, Clock, ListPlus, Eye, Save } from 'lucide-react';
import { format } from 'date-fns';
import InvoicePreview from '@/components/invoicing/InvoicePreview';
import AiItemSuggest from '@/components/invoicing/AiItemSuggest';
import { SUPPORT_ITEMS, PRICE_GUIDE_VERSION, PRICE_GUIDE_NOTE, classifyShift, lineAmount } from '@/lib/ndisPriceGuide';

const today = () => format(new Date(), 'yyyy-MM-dd');

export default function InvoiceBuilder({ open, onClose, onSaved, invoiceCount = 0 }) {
  const { toast } = useToast();
  const [business, setBusiness] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [showGuide, setShowGuide] = useState(false);
  const [period, setPeriod] = useState({ from: '', to: '' });
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (!open) return;
    (async () => {
      const [bizPage, partPage] = await Promise.all([
        base44.entities.BusinessDetails.list({ sort: '-created_date', limit: 1 }),
        base44.entities.ParticipantProfile.filter({}, { sort: 'full_name', limit: 500, fields: ['full_name', 'email', 'address', 'ndis_number', 'plan_manager', 'plan_manager_email'] }),
      ]);
      setBusiness(bizPage.items[0] || {});
      setParticipants(partPage.items || []);
      const terms = bizPage.items[0] || {};
      const termsDays = Number(terms.payment_terms_days) || 14;
      const issue = today();
      const due = format(new Date(new Date(issue).getTime() + termsDays * 86400000), 'yyyy-MM-dd');
      setForm({
        invoice_number: `INV-${format(new Date(), 'yyyyMMdd')}-${String(invoiceCount + 1).padStart(3, '0')}`,
        participant_id: '', participant_name: '', ndis_number: '', participant_address: '',
        client_name: '', client_email: '', client_address: '', biller_type: 'Plan Manager',
        issue_date: issue, due_date: due, payment_terms_days: termsDays,
        payment_terms: terms.payment_terms_note || 'Payment is due within 14 days of the invoice date.',
        payment_details: [
          terms.bank_name && `Bank: ${terms.bank_name}`,
          terms.bsb && `BSB: ${terms.bsb}`,
          terms.account_number && `Account number: ${terms.account_number}`,
          terms.account_name && `Account name: ${terms.account_name}`,
          'Payment reference: please quote the invoice number.',
        ].filter(Boolean).join('\n') || '',
        notes: terms.default_invoice_notes || 'NDIS supports are GST free.',
        lines: [],
      });
    })();
  }, [open, invoiceCount]);

  const setF = (patch) => setForm({ ...form, ...patch });

  /* Participant selection pulls their stored details and biller defaults. */
  const chooseParticipant = (participantId) => {
    const p = participants.find((x) => x.id === participantId);
    if (!p) return;
    setF({
      participant_id: p.id,
      participant_name: p.full_name,
      ndis_number: p.ndis_number || '',
      participant_address: p.address || '',
      biller_type: p.plan_manager ? 'Plan Manager' : 'Participant',
      client_name: p.plan_manager || p.full_name,
      client_email: p.plan_manager_email || p.email || '',
      client_address: p.plan_manager ? '' : (p.address || ''),
    });
    setShifts([]);
  };

  /* Rostered shifts for the participant in the billing period, not yet invoiced. */
  const loadShifts = async () => {
    if (!form.participant_name) return;
    const query = { participant_name: form.participant_name, status: 'Completed', invoiced: { $ne: true } };
    if (period.from || period.to) {
      query.date = {};
      if (period.from) query.date.$gte = period.from;
      if (period.to) query.date.$lte = period.to;
    }
    const page = await base44.entities.Shift.filter(query, { sort: 'date', limit: 200 });
    setShifts(page.items || []);
    if (!page.items?.length) toast({ title: 'No un-invoiced completed shifts found for that period' });
  };

  const importShifts = () => {
    const newLines = shifts.map((s) => {
      const item = classifyShift(s.date, s.start_time, s.end_time);
      return {
        code: item.code,
        description: `${item.description} - ${format(new Date(`${s.date}T00:00:00`), 'd MMM yyyy')}${s.employee_name ? ` (${s.employee_name})` : ''}`,
        unit: item.unit,
        qty: item.hours || 1,
        unit_price: item.rate,
        shift_id: s.id,
      };
    });
    setF({ lines: [...form.lines, ...newLines] });
    toast({ title: `${newLines.length} rostered shift${newLines.length === 1 ? '' : 's'} added to the invoice` });
  };

  const addGuideItem = (item) => {
    setF({
      lines: [...form.lines, { code: item.code, description: item.description, unit: item.unit, qty: 1, unit_price: item.rate }],
    });
    setShowGuide(false);
    setSearch('');
  };

  const addCustomLine = () => {
    setF({ lines: [...form.lines, { code: '', description: '', unit: 'hour', qty: 1, unit_price: 0 }] });
  };

  const setLine = (index, patch) => {
    const lines = [...form.lines];
    lines[index] = { ...lines[index], ...patch };
    setF({ lines });
  };

  const removeLine = (index) => {
    const lines = [...form.lines];
    lines.splice(index, 1);
    setF({ lines });
  };

  const setTermsDays = (days) => {
    const due = format(new Date(new Date(form.issue_date || today()).getTime() + (Number(days) || 0) * 86400000), 'yyyy-MM-dd');
    setF({ payment_terms_days: days, due_date: due });
  };

  const total = useMemo(() => (form?.lines || []).reduce((sum, line) => sum + lineAmount(line), 0), [form]);
  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term ? SUPPORT_ITEMS.filter((i) => `${i.code} ${i.description} ${i.group}`.toLowerCase().includes(term)) : SUPPORT_ITEMS;
  }, [search]);

  if (!form) return null;

  const save = async () => {
    if (!form.lines.length) {
      toast({ title: 'Add at least one support line before saving', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        line_items: JSON.stringify(form.lines),
        subtotal: total,
        amount: total,
        payment_terms_days: undefined,
      };
      delete payload.payment_terms_days;
      const created = await base44.entities.Invoice.create(payload);
      const shiftIds = form.lines.map((l) => l.shift_id).filter(Boolean);
      if (shiftIds.length) {
        await base44.entities.Shift.bulkUpdate(shiftIds.map((id) => ({ id, invoiced: true, invoice_id: created.id })));
      }
      toast({ title: 'Invoice created', description: shiftIds.length ? `${shiftIds.length} rostered shifts marked as invoiced for this participant.` : undefined });
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto">
        <DialogHeader><DialogTitle>Generate invoice</DialogTitle></DialogHeader>
        <div className="space-y-5">
          {/* Participant */}
          <section className="rounded-xl border border-border/60 p-4">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-foreground/50"><Users className="h-3.5 w-3.5" />Participant &amp; billed to</div>
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="grid gap-1.5 sm:col-span-2">
                <Label>Participant</Label>
                <Select value={form.participant_id} onValueChange={chooseParticipant}>
                  <SelectTrigger><SelectValue placeholder="Select a participant" /></SelectTrigger>
                  <SelectContent>
                    {participants.map((p) => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>NDIS number</Label>
                <Input value={form.ndis_number} onChange={(e) => setF({ ndis_number: e.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <Label>Biller type</Label>
                <Select value={form.biller_type} onValueChange={(v) => setF({ biller_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{['Participant', 'Plan Manager', 'NDIA'].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Billed to</Label>
                <Input value={form.client_name} onChange={(e) => setF({ client_name: e.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <Label>Billed to email</Label>
                <Input value={form.client_email} onChange={(e) => setF({ client_email: e.target.value })} />
              </div>
              <div className="grid gap-1.5 sm:col-span-3">
                <Label>Billed to address</Label>
                <Input value={form.client_address} onChange={(e) => setF({ client_address: e.target.value })} />
              </div>
              <div className="grid gap-1.5 sm:col-span-3">
                <Label>Participant address</Label>
                <Input value={form.participant_address} onChange={(e) => setF({ participant_address: e.target.value })} />
              </div>
            </div>
          </section>

          {/* Rostered shifts */}
          <section className="rounded-xl border border-border/60 p-4">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-foreground/50"><Clock className="h-3.5 w-3.5" />Rostered shifts (auto-updates for the selected participant)</div>
            <div className="flex flex-wrap items-end gap-2">
              <div className="grid gap-1.5"><Label>From</Label><Input type="date" value={period.from} onChange={(e) => setPeriod({ ...period, from: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>To</Label><Input type="date" value={period.to} onChange={(e) => setPeriod({ ...period, to: e.target.value })} /></div>
              <Button variant="outline" onClick={loadShifts} disabled={!form.participant_name}>Find shifts</Button>
              {shifts.length > 0 && <Button onClick={importShifts}><ListPlus className="h-4 w-4" />Add {shifts.length} shift{shifts.length === 1 ? '' : 's'} as support lines</Button>}
            </div>
            {shifts.length > 0 && (
              <div className="mt-2 max-h-32 space-y-1 overflow-y-auto text-xs text-muted-foreground">
                {shifts.map((s) => <div key={s.id}>{s.date} · {s.start_time || ''}{s.end_time ? `-${s.end_time}` : ''}{s.employee_name ? ` · ${s.employee_name}` : ''}</div>)}
              </div>
            )}
          </section>

          {/* Supports & lines */}
          <section className="rounded-xl border border-border/60 p-4">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-foreground/50">NDIS supports &amp; line items</div>
              <div className="flex gap-2">
                <AiItemSuggest mode="invoice" onAdd={(newLines) => setF({ lines: [...form.lines, ...newLines] })} />
                <Button variant="outline" size="sm" onClick={() => setShowGuide(!showGuide)}><Search className="h-4 w-4" />Price guide</Button>
                <Button variant="outline" size="sm" onClick={addCustomLine}><Plus className="h-4 w-4" />Custom line</Button>
              </div>
            </div>
            <p className="mb-2 text-[11px] text-muted-foreground">{PRICE_GUIDE_NOTE}</p>
            {showGuide && (
              <div className="mb-3 rounded-lg border border-border bg-muted/40 p-3">
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-foreground/50">{PRICE_GUIDE_VERSION}</div>
                <Input placeholder="Search supports by code, name or category" value={search} onChange={(e) => setSearch(e.target.value)} className="mb-2" />
                <div className="max-h-48 space-y-1 overflow-y-auto">
                  {filteredItems.map((item, i) => (
                    <button key={i} onClick={() => addGuideItem(item)} className="flex w-full items-center justify-between gap-3 rounded-md border border-border/60 bg-card px-2.5 py-1.5 text-left text-xs hover:bg-accent">
                      <span className="min-w-0"><span className="font-mono text-[10px] text-muted-foreground">{item.code || 'enter item number'}</span><span className="ml-2">{item.description}</span></span>
                      <span className="shrink-0 font-semibold">${item.rate.toFixed(2)}/{item.unit}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {form.lines.length === 0 && <div className="py-3 text-center text-xs text-muted-foreground">No lines yet. Import rostered shifts or pick a support from the price guide.</div>}
            <div className="space-y-2">
              {form.lines.map((line, index) => (
                <div key={index} className="grid items-end gap-2 rounded-lg border border-border/60 p-2 sm:grid-cols-12">
                  <div className="grid gap-1 sm:col-span-2"><Label className="text-[10px]">Item number</Label><Input className="font-mono text-xs" value={line.code} onChange={(e) => setLine(index, { code: e.target.value })} /></div>
                  <div className="grid gap-1 sm:col-span-4"><Label className="text-[10px]">Description</Label><Input value={line.description} onChange={(e) => setLine(index, { description: e.target.value })} /></div>
                  <div className="grid gap-1 sm:col-span-1"><Label className="text-[10px]">Unit</Label><Input value={line.unit} onChange={(e) => setLine(index, { unit: e.target.value })} /></div>
                  <div className="grid gap-1 sm:col-span-1"><Label className="text-[10px]">Qty</Label><Input type="number" step="0.25" value={line.qty} onChange={(e) => setLine(index, { qty: e.target.value })} /></div>
                  <div className="grid gap-1 sm:col-span-2"><Label className="text-[10px]">Unit price ($)</Label><Input type="number" step="0.01" value={line.unit_price} onChange={(e) => setLine(index, { unit_price: e.target.value })} /></div>
                  <div className="sm:col-span-1 text-right text-sm font-semibold">${lineAmount(line).toFixed(2)}</div>
                  <div className="sm:col-span-1 flex justify-end"><Button variant="ghost" size="icon" onClick={() => removeLine(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>
                </div>
              ))}
            </div>
          </section>

          {/* Usual invoice info */}
          <section className="rounded-xl border border-border/60 p-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/50">Invoice details, payment terms &amp; payment details</div>
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="grid gap-1.5"><Label>Invoice number *</Label><Input value={form.invoice_number} onChange={(e) => setF({ invoice_number: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Issue date</Label><Input type="date" value={form.issue_date} onChange={(e) => setF({ issue_date: e.target.value })} /></div>
              <div className="grid gap-1.5">
                <Label>Payment terms (days)</Label>
                <Select value={String(form.payment_terms_days)} onValueChange={setTermsDays}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{[7, 14, 28, 30].map((d) => <SelectItem key={d} value={String(d)}>{d} days</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5"><Label>Due date</Label><Input type="date" value={form.due_date} onChange={(e) => setF({ due_date: e.target.value })} /></div>
              <div className="grid gap-1.5 sm:col-span-2"><Label>Payment terms</Label><Input value={form.payment_terms} onChange={(e) => setF({ payment_terms: e.target.value })} /></div>
              <div className="grid gap-1.5 sm:col-span-3"><Label>Payment details (banking for invoice payment)</Label><Textarea rows={3} value={form.payment_details} onChange={(e) => setF({ payment_details: e.target.value })} /></div>
              <div className="grid gap-1.5 sm:col-span-3"><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={(e) => setF({ notes: e.target.value })} /></div>
            </div>
          </section>

        </div>

        <div className="sticky bottom-0 -mx-6 flex items-center justify-between gap-3 border-t border-border bg-card px-6 py-3">
          <div className="text-sm font-semibold">Total: ${total.toFixed(2)}</div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Close</Button>
            <PreviewToggle form={form} business={business} />
            <Button onClick={save} disabled={saving || !form.lines.length}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Save invoice</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PreviewToggle({ form, business }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}><Eye className="h-4 w-4" />Preview</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
          <DialogHeader><DialogTitle>Invoice preview</DialogTitle></DialogHeader>
          <InvoicePreview invoice={{ ...form, line_items: JSON.stringify(form.lines) }} business={business || {}} />
        </DialogContent>
      </Dialog>
    </>
  );
}