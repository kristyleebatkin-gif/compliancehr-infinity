import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Landmark, Building2, ScrollText, KeyRound, PenLine, ShieldAlert, Eye } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const EMPTY = {
  business_name: '', trading_name: '', abn: '', acn: '', ndis_provider_number: '',
  address_line: '', postal_address: '', suburb: '', state: '', postcode: '',
  phone: '', after_hours_phone: '', email: '', website: '',
  contact_person: '', contact_person_phone: '', contact_person_email: '',
  business_structure: '', registration_date: '', asic_registration: '', business_activity: '', key_contact: '',
  operating_hours: '', preferred_communication: '', business_owner: '', authorised_contact_name: '', authorised_contact: '',
  organisational_structure: '', delegation_of_authority: '', tax_file_number: '',
  purpose: '', contact_role: '', signature_farewell: '', contact_signature: '', confidentiality_disclaimer: '',
  ndis_commissioner_username: '', ndis_commissioner_password: '',
  business_email_username: '', business_email_password: '',
  computer_username: '', computer_password: '',
  ato_username: '', ato_password: '',
  workcover_username: '', workcover_password: '',
  qleave_username: '', qleave_password: '',
  ram_username: '', ram_password: '',
  digital_id_username: '', digital_id_password: '',
  other_password_1_name: '', other_password_1_username: '', other_password_1_password: '',
  other_password_2_name: '', other_password_2_username: '', other_password_2_password: '',
  bank_name: '', bsb: '', account_number: '', account_name: '',
  payment_terms_days: 14, payment_terms_note: 'Payment is due within 14 days of the invoice date.',
  default_invoice_notes: 'NDIS supports are GST free. Please quote the invoice number as the payment reference.',
  payment_instructions: '',
  payment_methods: '', payment_details: '', payment_reference: '', invoice_disputes: '', gst_terms: '',
  cancellation_refunds: '', invoice_changes: '', payment_confirmation: '', outstanding_accounts: '', contact_information: '',
  quote_terms: 'This quotation is valid for 30 days from the date of issue. Prices are based on the current NDIS Pricing Schedule and may change if the schedule is updated. NDIS supports are GST free. A formal service agreement will be prepared once the quotation is accepted.',
  quote_validity_days: 30,
};

const LOGIN_SECTIONS = [
  { title: 'NDIS Commissioner', prefix: 'ndis_commissioner' },
  { title: 'Business email', prefix: 'business_email' },
  { title: 'Business computer details', prefix: 'computer' },
  { title: 'ATO details', prefix: 'ato' },
  { title: 'Workcover details', prefix: 'workcover' },
  { title: 'Qleave', prefix: 'qleave' },
  { title: 'RAM details', prefix: 'ram' },
  { title: 'Digital ID details', prefix: 'digital_id' },
  { title: 'Other passwords (1)', prefix: 'other_password_1', withName: true },
  { title: 'Other passwords (2)', prefix: 'other_password_2', withName: true },
];

const INVOICE_TERMS = [
  ['payment_methods', 'Payment methods'],
  ['payment_details', 'Payment details'],
  ['payment_reference', 'Payment reference'],
  ['invoice_disputes', 'Invoice disputes'],
  ['gst_terms', 'Goods and services tax (GST)'],
  ['cancellation_refunds', 'Cancellation and refunds'],
  ['invoice_changes', 'Changes to invoices'],
  ['payment_confirmation', 'Payment confirmation'],
  ['outstanding_accounts', 'Outstanding accounts'],
  ['contact_information', 'Contact information'],
];

const Group = ({ icon: Icon, title, children }) => (
  <div>
    <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-foreground/50">
      {Icon && <Icon className="h-3.5 w-3.5" />}{title}
    </div>
    <div className="grid gap-2 sm:grid-cols-3">{children}</div>
  </div>
);

const Field = ({ label, value, onChange, type = 'text' }) => (
  <div className="grid gap-1.5"><Label>{label}</Label><Input type={type} value={value ?? ''} onChange={onChange} /></div>
);

const Area = ({ label, value, onChange, rows = 3 }) => (
  <div className="grid gap-1.5 sm:col-span-3"><Label>{label}</Label><Textarea rows={rows} value={value ?? ''} onChange={onChange} /></div>
);

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
      const payload = { ...form, payment_terms_days: Number(form.payment_terms_days) || 14, quote_validity_days: Number(form.quote_validity_days) || 30 };
      if (recordId) await base44.entities.BusinessDetails.update(recordId, payload);
      else {
        const created = await base44.entities.BusinessDetails.create(payload);
        setRecordId(created.id);
      }
      toast({ title: 'Business details saved', description: 'Used on invoices, letters, forms and business documents.' });
    } catch (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="mb-1 flex items-center gap-2 text-sm font-semibold"><Building2 className="h-4 w-4" />Important Business Information</div>
      <p className="mb-4 text-xs text-muted-foreground">Everything stored here appears on invoices, letters, business documents and forms. Login details are only visible to management roles.</p>
      <div className="space-y-5">
        <Group icon={Eye} title="Business vision, purpose, values &amp; mission statement">
          <Area label="Vision" value={form.vision} onChange={set('vision')} />
          <Area label="Purpose" value={form.purpose} onChange={set('purpose')} />
          <Area label="Mission statement" value={form.mission} onChange={set('mission')} />
          <Area label="Values" value={form.values} onChange={set('values')} />
        </Group>

        <Group icon={PenLine} title="Business letterhead">
          <Field label="Business name" value={form.business_name} onChange={set('business_name')} />
          <Field label="Business contact name" value={form.contact_person} onChange={set('contact_person')} />
          <Field label="Contact role" value={form.contact_role} onChange={set('contact_role')} />
          <Field label="Contact email" value={form.contact_person_email} onChange={set('contact_person_email')} />
        </Group>

        <Group icon={PenLine} title="Business signature">
          <Field label="Farewell" value={form.signature_farewell} onChange={set('signature_farewell')} />
          <Field label="Business contact name" value={form.contact_person} onChange={set('contact_person')} />
          <Field label="Business contact signature" value={form.contact_signature} onChange={set('contact_signature')} />
          <Field label="Business contact role" value={form.contact_role} onChange={set('contact_role')} />
          <Field label="Business name" value={form.business_name} onChange={set('business_name')} />
          <Field label="Business NDIS registered provider number" value={form.ndis_provider_number} onChange={set('ndis_provider_number')} />
        </Group>

        <div>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-foreground/50"><ShieldAlert className="h-3.5 w-3.5" />Confidentiality disclaimer</div>
          <div className="grid gap-1.5">
            <Label>Disclaimer</Label>
            <Textarea rows={10} placeholder="Space to write or paste your full confidentiality disclaimer..." value={form.confidentiality_disclaimer} onChange={set('confidentiality_disclaimer')} />
          </div>
        </div>

        <Group title="Important business information">
          <Field label="Business name" value={form.business_name} onChange={set('business_name')} />
          <Field label="Trading name" value={form.trading_name} onChange={set('trading_name')} />
          <Field label="Business structure" value={form.business_structure} onChange={set('business_structure')} />
          <Field label="Business ABN" value={form.abn} onChange={set('abn')} />
          <Field label="Business ACN" value={form.acn} onChange={set('acn')} />
          <Field label="Business registration date" type="date" value={form.registration_date} onChange={set('registration_date')} />
          <Field label="NDIS registered provider" value={form.ndis_provider_number} onChange={set('ndis_provider_number')} />
          <Field label="ASIC registration" value={form.asic_registration} onChange={set('asic_registration')} />
          <Field label="Business activity" value={form.business_activity} onChange={set('business_activity')} />
          <Field label="Business address" value={form.address_line} onChange={set('address_line')} />
          <Field label="Business phone" value={form.phone} onChange={set('phone')} />
          <Field label="Business email" value={form.email} onChange={set('email')} />
          <Field label="Business contact email" value={form.contact_person_email} onChange={set('contact_person_email')} />
          <Field label="Business website" value={form.website} onChange={set('website')} />
          <Field label="Business key contact name" value={form.contact_person} onChange={set('contact_person')} />
          <Field label="Business key contact" value={form.key_contact} onChange={set('key_contact')} />
        </Group>

        <Group icon={Building2} title="Business operational details">
          <Field label="Business operating hours" value={form.operating_hours} onChange={set('operating_hours')} />
          <Field label="Business preferred communication method" value={form.preferred_communication} onChange={set('preferred_communication')} />
          <Field label="Business owner" value={form.business_owner} onChange={set('business_owner')} />
          <Field label="Business authorised contact name" value={form.authorised_contact_name} onChange={set('authorised_contact_name')} />
          <Field label="Business authorised contact" value={form.authorised_contact} onChange={set('authorised_contact')} />
          <Area label="Organisational structure" value={form.organisational_structure} onChange={set('organisational_structure')} />
          <Area label="Delegation of authority" value={form.delegation_of_authority} onChange={set('delegation_of_authority')} />
          <Field label="Tax file number" value={form.tax_file_number} onChange={set('tax_file_number')} />
        </Group>

        <Group icon={Landmark} title="Banking &amp; financial identity">
          <Field label="Business name" value={form.business_name} onChange={set('business_name')} />
          <Field label="Business bank name" value={form.bank_name} onChange={set('bank_name')} />
          <Field label="Business BSB" value={form.bsb} onChange={set('bsb')} />
          <Field label="Business account" value={form.account_number} onChange={set('account_number')} />
          <Field label="Account name" value={form.account_name} onChange={set('account_name')} />
        </Group>

        <div>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-foreground/50"><KeyRound className="h-3.5 w-3.5" />Login details (management only)</div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {LOGIN_SECTIONS.map((s) => (
              <div key={s.title} className="rounded-xl border border-border/60 bg-muted/20 p-3">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-bold"><KeyRound className="h-3.5 w-3.5 text-brand" />{s.title}</p>
                <div className="grid gap-1.5">
                  {s.withName && <Field label="Name" value={form[`${s.prefix}_name`]} onChange={set(`${s.prefix}_name`)} />}
                  <Field label="Username" value={form[`${s.prefix}_username`]} onChange={set(`${s.prefix}_username`)} />
                  <Field label="Password" type="password" value={form[`${s.prefix}_password`]} onChange={set(`${s.prefix}_password`)} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <Group icon={ScrollText} title="Invoice &amp; payment terms and conditions">
          <Field label="Payment terms (days)" type="number" value={form.payment_terms_days} onChange={set('payment_terms_days')} />
          <div className="grid gap-1.5 sm:col-span-2"><Label>Payment terms</Label><Input value={form.payment_terms_note} onChange={set('payment_terms_note')} /></div>
          {INVOICE_TERMS.map(([key, label]) => (
            <Area key={key} label={label} value={form[key]} onChange={set(key)} />
          ))}
          <Area label="Default invoice notes" value={form.default_invoice_notes} onChange={set('default_invoice_notes')} />
          <Area label="Bill payment instructions" value={form.payment_instructions} onChange={set('payment_instructions')} />
        </Group>

        <Group icon={ScrollText} title="Quote terms &amp; conditions (Quote Centre)">
          <Field label="Quote validity (days)" type="number" value={form.quote_validity_days} onChange={set('quote_validity_days')} />
          <div className="grid gap-1.5 sm:col-span-2"><Label>Quote terms and conditions</Label><Input value={form.quote_terms} onChange={set('quote_terms')} /></div>
          <p className="text-xs text-muted-foreground sm:col-span-3">Used as the default terms on every new quote; individual quotes can override them.</p>
        </Group>
      </div>
      <div className="mt-4 flex gap-2">
        <Button onClick={save} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Save business details</Button>
      </div>
    </div>
  );
}