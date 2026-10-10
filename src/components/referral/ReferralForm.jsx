import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

const SERVICE_TYPES = ['NDIS / Disability Supports', 'Mental Health', 'Housing', 'Family & Domestic Violence', 'Alcohol & Other Drugs', 'Youth Services', 'Emergency Relief', 'Health / Medical', 'Employment & Training', 'Other'];
const URGENCIES = ['Routine', 'Urgent (48 hours)', 'Immediate - Crisis'];
const CONSENTS = ['Consent given', 'Consent not given'];

const BLANK = {
  referral_id: '', client_name: '', date_of_birth: '', phone: '', email: '', address: '', postcode: '',
  service_type: 'NDIS / Disability Supports', urgency: 'Routine', reason: '', support_needs: '', consent: 'Consent not given',
  referrer_name: '', referrer_role: '', referrer_phone: '', referrer_email: '',
  provider_name: '', provider_email: '', provider_phone: '', notes: '',
};

export const newReferralId = () => `REF-${format(new Date(), 'yyMMdd')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

export default function ReferralForm({ editing, onSaved, onSend }) {
  const { toast } = useToast();
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(editing ? { ...BLANK, ...editing } : { ...BLANK, referral_id: newReferralId() });
  }, [editing]);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e?.target?.value ?? e }));

  const save = async () => {
    if (!form.client_name.trim()) { toast({ title: 'Name of the person referred is required' }); return; }
    setSaving(true);
    try {
      const payload = { ...form };
      delete payload.form_file_uri;
      delete payload.form_file_name;
      delete payload.status_log;
      delete payload.created_date;
      delete payload.updated_date;
      const saved = editing
        ? await base44.entities.Referral.update(editing.id, payload)
        : await base44.entities.Referral.create({ ...payload, status: 'Draft' });
      toast({ title: editing ? 'Referral updated' : 'Referral saved as Draft' });
      onSaved(saved);
    } finally {
      setSaving(false);
    }
  };

  const Section = ({ title, children }) => (
    <Card>
      <CardContent className="grid gap-3 p-5">
        <p className="text-sm font-bold text-brand">{title}</p>
        {children}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <Section title="Person being referred">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="grid gap-1.5"><Label>Full name *</Label><Input value={form.client_name} onChange={set('client_name')} /></div>
          <div className="grid gap-1.5"><Label>Date of birth</Label><Input type="date" value={form.date_of_birth} onChange={set('date_of_birth')} /></div>
          <div className="grid gap-1.5"><Label>Phone</Label><Input value={form.phone} onChange={set('phone')} /></div>
          <div className="grid gap-1.5"><Label>Email</Label><Input type="email" value={form.email} onChange={set('email')} /></div>
          <div className="grid gap-1.5 md:col-span-2"><Label>Address</Label><Input value={form.address} onChange={set('address')} /></div>
          <div className="grid gap-1.5"><Label>Postcode</Label>
            <Input inputMode="numeric" maxLength={4} value={form.postcode} onChange={(e) => setForm((prev) => ({ ...prev, postcode: e.target.value.replace(/\D/g, '').slice(0, 4) }))} />
          </div>
        </div>
      </Section>

      <Section title="Service requested">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="grid gap-1.5"><Label>Service type</Label>
            <Select value={form.service_type} onValueChange={(v) => setForm((prev) => ({ ...prev, service_type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{SERVICE_TYPES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5"><Label>Urgency</Label>
            <Select value={form.urgency} onValueChange={(v) => setForm((prev) => ({ ...prev, urgency: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{URGENCIES.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5"><Label>Client consent</Label>
            <Select value={form.consent} onValueChange={(v) => setForm((prev) => ({ ...prev, consent: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CONSENTS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5 md:col-span-2"><Label>Reason for referral</Label><Textarea rows={3} value={form.reason} onChange={set('reason')} /></div>
          <div className="grid gap-1.5 md:col-span-2"><Label>Support needs</Label><Textarea rows={3} value={form.support_needs} onChange={set('support_needs')} /></div>
        </div>
      </Section>

      <Section title="Referrer">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="grid gap-1.5"><Label>Name</Label><Input value={form.referrer_name} onChange={set('referrer_name')} /></div>
          <div className="grid gap-1.5"><Label>Role / Position</Label><Input value={form.referrer_role} onChange={set('referrer_role')} /></div>
          <div className="grid gap-1.5"><Label>Phone</Label><Input value={form.referrer_phone} onChange={set('referrer_phone')} /></div>
          <div className="grid gap-1.5"><Label>Email</Label><Input type="email" value={form.referrer_email} onChange={set('referrer_email')} /></div>
        </div>
      </Section>

      <Section title="Receiving provider (optional)">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="grid gap-1.5"><Label>Provider / service</Label><Input value={form.provider_name} onChange={set('provider_name')} /></div>
          <div className="grid gap-1.5"><Label>Provider phone</Label><Input value={form.provider_phone} onChange={set('provider_phone')} /></div>
          <div className="grid gap-1.5"><Label>Provider email</Label><Input type="email" value={form.provider_email} onChange={set('provider_email')} /></div>
          <div className="grid gap-1.5 md:col-span-2"><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={set('notes')} /></div>
        </div>
      </Section>

      <div className="flex flex-wrap gap-2">
        <Button onClick={save} disabled={saving || !form.client_name.trim()}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}{editing ? 'Save changes' : 'Save referral (Draft)'}</Button>
        {editing && form.provider_email && <Button variant="outline" onClick={() => onSend(editing)}>Send via email</Button>}
      </div>
    </div>
  );
}