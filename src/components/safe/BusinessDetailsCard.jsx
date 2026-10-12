import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Landmark, Building2, Wallet } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const EMPTY = {
  business_name: '', trading_name: '', abn: '', acn: '', ndis_provider_number: '',
  address_line: '', suburb: '', state: '', postcode: '',
  phone: '', email: '', website: '', contact_person: '',
  bank_name: '', bsb: '', account_number: '', account_name: '',
  payment_terms_days: 14, payment_terms_note: 'Payment is due within 14 days of the invoice date.',
  default_invoice_notes: 'NDIS supports are GST free. Please quote the invoice number as the payment reference.',
  payment_instructions: '',
  quote_terms: 'This quotation is valid for 30 days from the date of issue. Prices are based on the current NDIS Pricing Schedule and may change if the schedule is updated. NDIS supports are GST free. A formal service agreement will be prepared once the quotation is accepted.',
  quote_validity_days: 30,
};

export default function BusinessDetailsCard() {
  const { toast } = useToast();
  const [form, setForm] = useState(EMPTY);
  const [recordId, setRecordId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const page = await base44.entities.BusinessDetails.list({ sort: '-created_date', limit: 1 });
        const record = page.items?.[0];
        if (record) {
          setRecordId(record.id);
          setForm({ ...EMPTY, ...record });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const save = async () => {
    if (!form.business_name.trim()) {
      toast({ title: 'Business name is required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, payment_terms_days: Number(form.payment_terms_days) || 14 };
      if (recordId) await base44.entities.BusinessDetails.update(recordId, payload);
      else {
        const created = await base44.entities.BusinessDetails.create(payload);
        setRecordId(created.id);
      }
      toast({ title: 'Business details saved', description: 'Used on invoices, payment records and business documents.' });
    } catch (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="mb-1 flex items-center gap-2 text-sm font-semibold"><Building2 className="h-4 w-4" />Business, contact &amp; banking details</div>
      <p className="mb-4 text-xs text-muted-foreground">The address, contact details, ABN, banking details and payment terms stored here appear on every invoice and business record. These details also cover bill payments and invoice payments received.</p>
      <div className="space-y-4">
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/50">Business identity</div>
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="grid gap-1.5"><Label>Business name *</Label><Input value={form.business_name} onChange={set('business_name')} /></div>
            <div className="grid gap-1.5"><Label>Trading name</Label><Input value={form.trading_name} onChange={set('trading_name')} /></div>
            <div className="grid gap-1.5"><Label>ABN</Label><Input value={form.abn} onChange={set('abn')} /></div>
            <div className="grid gap-1.5"><Label>ACN</Label><Input value={form.acn} onChange={set('acn')} /></div>
            <div className="grid gap-1.5"><Label>NDIS provider registration number</Label><Input value={form.ndis_provider_number} onChange={set('ndis_provider_number')} /></div>
            <div className="grid gap-1.5"><Label>Primary contact</Label><Input value={form.contact_person} onChange={set('contact_person')} /></div>
          </div>
        </div>
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/50">Business address &amp; contact</div>
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="grid gap-1.5 sm:col-span-3"><Label>Street address</Label><Input value={form.address_line} onChange={set('address_line')} /></div>
            <div className="grid gap-1.5"><Label>Suburb</Label><Input value={form.suburb} onChange={set('suburb')} /></div>
            <div className="grid gap-1.5"><Label>State</Label><Input value={form.state} onChange={set('state')} /></div>
            <div className="grid gap-1.5"><Label>Postcode</Label><Input value={form.postcode} onChange={set('postcode')} /></div>
            <div className="grid gap-1.5"><Label>Phone</Label><Input value={form.phone} onChange={set('phone')} /></div>
            <div className="grid gap-1.5"><Label>Email</Label><Input value={form.email} onChange={set('email')} /></div>
            <div className="grid gap-1.5"><Label>Website</Label><Input value={form.website} onChange={set('website')} /></div>
          </div>
        </div>
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-foreground/50"><Landmark className="h-3.5 w-3.5" />Banking details (invoice &amp; bill payments)</div>
          <div className="grid gap-2 sm:grid-cols-4">
            <div className="grid gap-1.5"><Label>Bank name</Label><Input value={form.bank_name} onChange={set('bank_name')} /></div>
            <div className="grid gap-1.5"><Label>BSB</Label><Input value={form.bsb} onChange={set('bsb')} /></div>
            <div className="grid gap-1.5"><Label>Account number</Label><Input value={form.account_number} onChange={set('account_number')} /></div>
            <div className="grid gap-1.5"><Label>Account name</Label><Input value={form.account_name} onChange={set('account_name')} /></div>
          </div>
        </div>
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-foreground/50"><Wallet className="h-3.5 w-3.5" />Payment terms &amp; invoice template defaults</div>
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="grid gap-1.5"><Label>Payment terms (days)</Label><Input type="number" value={form.payment_terms_days ?? 14} onChange={set('payment_terms_days')} /></div>
            <div className="grid gap-1.5 sm:col-span-2"><Label>Payment terms note</Label><Input value={form.payment_terms_note} onChange={set('payment_terms_note')} /></div>
            <div className="grid gap-1.5 sm:col-span-3"><Label>Default invoice notes</Label><Input value={form.default_invoice_notes} onChange={set('default_invoice_notes')} /></div>
            <div className="grid gap-1.5 sm:col-span-3"><Label>Bill payment instructions</Label><Input value={form.payment_instructions} onChange={set('payment_instructions')} /></div>
          </div>
        </div>
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-foreground/50"><Landmark className="h-3.5 w-3.5" />Quote terms &amp; conditions (Quote Centre)</div>
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="grid gap-1.5"><Label>Quote validity (days)</Label><Input type="number" value={form.quote_validity_days ?? 30} onChange={set('quote_validity_days')} /></div>
            <div className="grid gap-1.5 sm:col-span-2"><Label>Quote terms and conditions</Label><Input value={form.quote_terms} onChange={set('quote_terms')} /></div>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">Used as the default terms on every new quote; individual quotes can override them.</p>
        </div>
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/50">Business goal, mission, vision &amp; values (shown in the professional email footer)</div>
          <div className="grid gap-2">
            <div className="grid gap-1.5"><Label>Business goal</Label><Textarea rows={2} value={form.business_goal || ''} onChange={set('business_goal')} /></div>
            <div className="grid gap-1.5"><Label>Mission</Label><Textarea rows={2} value={form.mission || ''} onChange={set('mission')} /></div>
            <div className="grid gap-1.5"><Label>Vision</Label><Textarea rows={2} value={form.vision || ''} onChange={set('vision')} /></div>
            <div className="grid gap-1.5"><Label>Values</Label><Textarea rows={2} value={form.values || ''} onChange={set('values')} /></div>
          </div>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Button onClick={save} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Save business details</Button>
      </div>
    </div>
  );
}