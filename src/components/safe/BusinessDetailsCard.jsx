import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Landmark, Building2, ScrollText, KeyRound, PenLine, ShieldAlert, Eye, Minimize2, Maximize2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import BusinessContactSignature from '@/components/safe/BusinessContactSignature';
import { cacheCompanyBranding } from '@/lib/companyBranding';
import { SQUISHED_GRADIENT } from '@/components/safe/ExecutiveWallScene';

const EMPTY = {
  business_name: 'ComplianceHR Infinity', trading_name: '', abn: '11769681650', acn: '', ndis_provider_number: '4-LPHJR5O',
  address_line: 'U5/14 Keane Street, Currajong, QLD, 4812', postal_address: '', suburb: 'Currajong', state: 'QLD', postcode: '4812',
  phone: '0402 165 668', after_hours_phone: '', email: 'support@compliancehr.com.au', website: '',
  contact_person: 'Administration', contact_person_phone: '0402 165 668', contact_person_email: 'support@compliancehr.com.au',
  business_structure: 'Registered NDIS Provider', registration_date: '', asic_registration: '', business_activity: 'NDIS Disability Support Services', key_contact: 'Administration',
  operating_hours: 'Mon–Fri 8:00am – 5:00pm (24/7 On-Call Support)', preferred_communication: 'Email & Phone', business_owner: 'ComplianceHR Infinity', authorised_contact_name: 'Administration', authorised_contact: '0402 165 668 | support@compliancehr.com.au',
  organisational_structure: '', delegation_of_authority: '', tax_file_number: '',
  purpose: 'Empowering participants with safe, compliant, person-centred support.',
  vision: 'Complete Control. Greater Confidence. Brighter Success.',
  mission: 'Delivering high-quality, NDIS-compliant support with dignity and transparency.',
  values: 'Respect · Integrity · Safety · Inclusion · Excellence',
  contact_role: 'Provider Administrator', signature_farewell: 'Kind regards,', contact_signature: '', confidentiality_disclaimer: 'This communication and any attachments are confidential and intended solely for the addressee.',
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
  bank_name: '', bsb: '', account_number: '', account_name: 'ComplianceHR Infinity',
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
  { title: 'ATO details', prefix: 'ato', withTfn: true },
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

const Field = ({ label, value, onChange, type = 'text' }) => (
  <div className="grid gap-1"><Label className="text-[11px] font-bold">{label}</Label><Input className="h-8 text-xs" type={type} value={value ?? ''} onChange={onChange} /></div>
);

const Area = ({ label, value, onChange, rows = 2, className = '' }) => (
  <div className={`grid gap-1 sm:col-span-3 ${className}`}><Label className="text-[11px] font-bold">{label}</Label><Textarea className="text-xs" rows={rows} value={value ?? ''} onChange={onChange} /></div>
);

export default function BusinessDetailsCard() {
  const { toast } = useToast();
  const [form, setForm] = useState(EMPTY);
  const [recordId, setRecordId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openMap, setOpenMap] = useState({});
  const toggleSection = (key) => setOpenMap((prev) => ({ ...prev, [key]: !prev[key] }));
  const setAllSections = (val) => {
    const next = {};
    ['vision', 'letterhead', 'signature', 'disclaimer', 'important', 'operational', 'banking', 'logins', 'invoice', 'quote'].forEach((k) => {
      next[k] = val;
    });
    setOpenMap(next);
  };

  useEffect(() => {
    (async () => {
      try {
        const page = await base44.entities.BusinessDetails.list({ sort: '-created_date', limit: 1 });
        const record = page.items?.[0];
        if (record) {
          const cleanStr = (v, fallback) =>
            !v || /choices\s*(nq|north\s*queensland)/i.test(String(v)) ? fallback : v;
          setRecordId(record.id);
          setForm({
            ...EMPTY,
            ...record,
            business_name: cleanStr(record.business_name, 'ComplianceHR Infinity'),
            trading_name: cleanStr(record.trading_name, 'ComplianceHR Infinity'),
            contact_person: cleanStr(record.contact_person, 'ComplianceHR Infinity Administration'),
            authorised_contact_name: cleanStr(record.authorised_contact_name, 'ComplianceHR Infinity Administration'),
          });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const syncName = (event) => setForm((current) => ({ ...current, business_name: event.detail.companyName }));
    window.addEventListener('company-identity-saved', syncName);
    return () => window.removeEventListener('company-identity-saved', syncName);
  }, []);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const save = async () => {
    if (!form.business_name.trim()) {
      toast({ title: 'Business name is required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      let signature = form.contact_signature || '';
      if (signature.startsWith('data:image/')) {
        const blob = await fetch(signature).then((response) => response.blob());
        const file = new File([blob], 'business-contact-signature.jpg', { type: 'image/jpeg' });
        const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
        signature = file_uri;
      }
      const { id, created_date, updated_date, created_by_id, ...fields } = form;
      const payload = { ...fields, business_name: form.business_name.trim(), contact_signature: signature, payment_terms_days: Number(form.payment_terms_days) || 14, quote_validity_days: Number(form.quote_validity_days) || 30 };
      let targetId = recordId;
      if (!targetId) {
        const latest = await base44.entities.BusinessDetails.list({ sort: '-created_date', limit: 1 });
        targetId = latest.items?.[0]?.id;
      }
      if (targetId) await base44.entities.BusinessDetails.update(targetId, payload);
      else {
        const created = await base44.entities.BusinessDetails.create(payload);
        targetId = created.id;
      }
      setRecordId(targetId);
      setForm((current) => ({ ...current, contact_signature: signature }));
      cacheCompanyBranding({ companyName: payload.business_name });
      window.dispatchEvent(new CustomEvent('company-identity-saved', { detail: { companyName: payload.business_name } }));
      toast({ title: 'Business details saved', description: 'Used on invoices, letters, forms and business documents.' });
    } catch (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-4"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>;

  const MODULAR_SUBJECTS = [
    {
      key: 'vision',
      icon: Eye,
      color: '#4f46e5',
      title: '1. Vision & Mission',
      shared: [form.business_name, form.vision || 'Complete Control. Greater Confidence.', form.values || 'Respect · Safety · Inclusion'],
    },
    {
      key: 'letterhead',
      icon: PenLine,
      color: '#db2777',
      title: '2. Business Letterhead',
      shared: [form.business_name, form.contact_person, form.email],
    },
    {
      key: 'signature',
      icon: PenLine,
      color: '#2563eb',
      title: '3. Business Signature',
      shared: [form.contact_person, `NDIS: ${form.ndis_provider_number}`, form.contact_person_phone],
    },
    {
      key: 'disclaimer',
      icon: ShieldAlert,
      color: '#0d9488',
      title: '4. Confidentiality',
      shared: [form.confidentiality_disclaimer || 'Official confidentiality notice active'],
    },
    {
      key: 'important',
      icon: Building2,
      color: '#ea580c',
      title: '5. Important Business Info',
      shared: [`ABN: ${form.abn}`, `NDIS: ${form.ndis_provider_number}`, form.address_line],
    },
    {
      key: 'operational',
      icon: Building2,
      color: '#7c3aed',
      title: '6. Operational Details',
      shared: [`Owner: ${form.business_owner}`, form.operating_hours, form.authorised_contact_name],
    },
    {
      key: 'banking',
      icon: Landmark,
      color: '#16a34a',
      title: '7. Banking & Financial',
      shared: [form.account_name || form.business_name, form.bank_name ? `Bank: ${form.bank_name}` : 'Bank & BSB ready', form.bsb ? `BSB: ${form.bsb}` : 'Account on file'],
    },
    {
      key: 'logins',
      icon: KeyRound,
      color: '#ca8a04',
      title: '8. Management Logins',
      shared: ['NDIS · ATO · Workcover', 'Qleave · RAM · Digital ID', '10 Credential Vaults'],
    },
    {
      key: 'invoice',
      icon: ScrollText,
      color: '#0ea5e9',
      title: '9. Invoice & Payment Terms',
      shared: [`${form.payment_terms_days || 14} Days Terms`, 'GST-Free NDIS Supports', form.payment_terms_note],
    },
    {
      key: 'quote',
      icon: ScrollText,
      color: '#c026d3',
      title: '10. Quote Terms',
      shared: [`Valid ${form.quote_validity_days || 30} Days`, 'NDIS Pricing Schedule', 'Quote Centre Defaults'],
    },
  ];

  return (
    <div className="space-y-2.5">
      {/* Compact Header Bar with Squished Purple */}
      <div
        className="comm-panel-bar flex flex-wrap items-center justify-between gap-2 rounded-xl px-3.5 py-2 text-white shadow-sm"
        style={{ background: SQUISHED_GRADIENT }}
      >
        <span className="text-xs font-extrabold">
          Business Safe Modular Subjects (10 Small Icon Tiles — Shared Details Under Name)
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setAllSections(false)}
            className="inline-flex items-center gap-1 rounded-lg bg-white/20 px-2 py-1 text-[10px] font-extrabold text-white hover:bg-white/30"
          >
            <Minimize2 className="h-3 w-3" /> Minimise All
          </button>
          <button
            type="button"
            onClick={() => setAllSections(true)}
            className="inline-flex items-center gap-1 rounded-lg bg-white/20 px-2 py-1 text-[10px] font-extrabold text-white hover:bg-white/30"
          >
            <Maximize2 className="h-3 w-3" /> Expand All
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-[10px] font-extrabold text-violet-900 shadow-sm hover:bg-pink-50"
          >
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3 text-pink-600" />}
            Save All
          </button>
        </div>
      </div>

      {/* Minimised Icons & Modular Names — All 10 Displayed */}
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-5">
        {MODULAR_SUBJECTS.map((item) => {
          const Icon = item.icon;
          const isOpen = !!openMap[item.key];
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => toggleSection(item.key)}
              className="group relative flex min-w-0 items-center gap-1.5 overflow-hidden rounded-lg border px-2 py-1.5 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm"
              style={{
                borderColor: isOpen ? item.color : `${item.color}55`,
                background: `linear-gradient(165deg, ${item.color}24 0%, ${item.color}0d 48%, #ffffff 90%)`,
              }}
            >
              <span className="absolute inset-x-0 top-0 h-0.5" style={{ background: item.color }} />
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-white shadow-sm"
                style={{ background: item.color }}
              >
                <Icon className="h-3 w-3" />
              </span>
              <span className="min-w-0 flex-1 truncate text-[10px] font-extrabold text-foreground">
                {item.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Opened Subject Editors Below */}
      {openMap.vision && (
        <div className="rounded-xl border-2 border-indigo-300 bg-white p-3.5 shadow-sm">
          <div className="mb-2 text-xs font-extrabold text-indigo-950">1. Business vision, purpose, values &amp; mission statement</div>
          <div className="grid gap-2 sm:grid-cols-3">
            <Field label="Business name" value={form.business_name} onChange={set('business_name')} />
            <Area label="Vision" value={form.vision} onChange={set('vision')} />
            <Area label="Purpose" value={form.purpose} onChange={set('purpose')} />
            <Area label="Mission statement" value={form.mission} onChange={set('mission')} />
            <Area label="Values" value={form.values} onChange={set('values')} />
          </div>
        </div>
      )}

      {openMap.letterhead && (
        <div className="rounded-xl border-2 border-pink-300 bg-white p-3.5 shadow-sm">
          <div className="mb-2 text-xs font-extrabold text-pink-950">2. Business letterhead</div>
          <div className="grid gap-2 sm:grid-cols-3">
            <Field label="Business name" value={form.business_name} onChange={set('business_name')} />
            <Field label="Business contact name" value={form.contact_person} onChange={set('contact_person')} />
            <Field label="Contact email" value={form.contact_person_email} onChange={set('contact_person_email')} />
            <Field label="Contact phone" type="tel" value={form.contact_person_phone} onChange={set('contact_person_phone')} />
            <Field label="Business email" value={form.email} onChange={set('email')} />
            <Field label="Contact role" value={form.contact_role} onChange={set('contact_role')} />
          </div>
        </div>
      )}

      {openMap.signature && (
        <div className="rounded-xl border-2 border-blue-300 bg-white p-3.5 shadow-sm">
          <div className="mb-2 text-xs font-extrabold text-blue-950">3. Business signature</div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Area label="Farewell" value={form.signature_farewell} onChange={set('signature_farewell')} rows={2} />
            <Field label="Business contact name" value={form.contact_person} onChange={set('contact_person')} />
            <BusinessContactSignature value={form.contact_signature || ''} onChange={(value) => setForm((current) => ({ ...current, contact_signature: value }))} disabled={saving} />
            <Field label="Business contact role" value={form.contact_role} onChange={set('contact_role')} />
            <Field label="Business contact email" value={form.contact_person_email} onChange={set('contact_person_email')} />
            <Field label="Business contact phone" value={form.contact_person_phone} onChange={set('contact_person_phone')} />
            <Field label="Business name" value={form.business_name} onChange={set('business_name')} />
            <Field label="Business NDIS registered provider number" value={form.ndis_provider_number} onChange={set('ndis_provider_number')} />
          </div>
        </div>
      )}

      {openMap.disclaimer && (
        <div className="rounded-xl border-2 border-teal-300 bg-white p-3.5 shadow-sm">
          <div className="mb-2 text-xs font-extrabold text-teal-950">4. Confidentiality disclaimer</div>
          <Textarea rows={3} value={form.confidentiality_disclaimer} onChange={set('confidentiality_disclaimer')} className="text-xs" />
        </div>
      )}

      {openMap.important && (
        <div className="rounded-xl border-2 border-orange-300 bg-white p-3.5 shadow-sm">
          <div className="mb-2 text-xs font-extrabold text-orange-950">5. Important business information</div>
          <div className="grid gap-2 sm:grid-cols-3">
            <Field label="Business name" value={form.business_name} onChange={set('business_name')} />
            <Field label="Trading name" value={form.trading_name} onChange={set('trading_name')} />
            <Field label="Business structure" value={form.business_structure} onChange={set('business_structure')} />
            <Field label="Business ABN" value={form.abn} onChange={set('abn')} />
            <Field label="Business ACN" value={form.acn} onChange={set('acn')} />
            <Field label="Business registration date" type="date" value={form.registration_date} onChange={set('registration_date')} />
            <Field label="ASIC registration" value={form.asic_registration} onChange={set('asic_registration')} />
            <Field label="Business activity" value={form.business_activity} onChange={set('business_activity')} />
            <Field label="Business address" value={form.address_line} onChange={set('address_line')} />
            <Field label="Business phone" value={form.phone} onChange={set('phone')} />
            <Field label="Business email" value={form.email} onChange={set('email')} />
            <Field label="Business website" value={form.website} onChange={set('website')} />
            <Field label="Business key contact name" value={form.contact_person} onChange={set('contact_person')} />
            <Field label="Business contact email" value={form.contact_person_email} onChange={set('contact_person_email')} />
            <Field label="Business key contact phone" value={form.contact_person_phone} onChange={set('contact_person_phone')} />
          </div>
        </div>
      )}

      {openMap.operational && (
        <div className="rounded-xl border-2 border-purple-300 bg-white p-3.5 shadow-sm">
          <div className="mb-2 text-xs font-extrabold text-purple-950">6. Business operational details</div>
          <div className="grid gap-2 sm:grid-cols-3">
            <Field label="Business name" value={form.business_name} onChange={set('business_name')} />
            <Field label="Business operating hours" value={form.operating_hours} onChange={set('operating_hours')} />
            <Field label="Preferred communication" value={form.preferred_communication} onChange={set('preferred_communication')} />
            <Field label="Business owner" value={form.business_owner} onChange={set('business_owner')} />
            <Field label="Authorised contact name" value={form.authorised_contact_name} onChange={set('authorised_contact_name')} />
            <Field label="Authorised contact" value={form.authorised_contact} onChange={set('authorised_contact')} />
            <Area label="Organisational structure" value={form.organisational_structure} onChange={set('organisational_structure')} />
            <Area label="Delegation of authority" value={form.delegation_of_authority} onChange={set('delegation_of_authority')} />
          </div>
        </div>
      )}

      {openMap.banking && (
        <div className="rounded-xl border-2 border-green-300 bg-white p-3.5 shadow-sm">
          <div className="mb-2 text-xs font-extrabold text-green-950">7. Banking &amp; financial identity</div>
          <div className="grid gap-2 sm:grid-cols-4">
            <Field label="Business bank name" value={form.bank_name} onChange={set('bank_name')} />
            <Field label="Business BSB" value={form.bsb} onChange={set('bsb')} />
            <Field label="Business account" value={form.account_number} onChange={set('account_number')} />
            <Field label="Account name" value={form.account_name} onChange={set('account_name')} />
          </div>
        </div>
      )}

      {openMap.logins && (
        <div className="rounded-xl border-2 border-amber-300 bg-white p-3.5 shadow-sm">
          <div className="mb-2 text-xs font-extrabold text-amber-950">8. Login details (management only)</div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {LOGIN_SECTIONS.map((s) => (
              <div key={s.title} className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
                <p className="mb-1.5 flex items-center gap-1 text-[11px] font-bold"><KeyRound className="h-3 w-3 text-brand" />{s.title}</p>
                <div className="grid gap-1">
                  {s.withTfn && <Field label="Tax file number" value={form.tax_file_number} onChange={set('tax_file_number')} />}
                  {s.withName && <Field label="Name" value={form[`${s.prefix}_name`]} onChange={set(`${s.prefix}_name`)} />}
                  <Field label="Username" value={form[`${s.prefix}_username`]} onChange={set(`${s.prefix}_username`)} />
                  <Field label="Password" type="password" value={form[`${s.prefix}_password`]} onChange={set(`${s.prefix}_password`)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {openMap.invoice && (
        <div className="rounded-xl border-2 border-sky-300 bg-white p-3.5 shadow-sm">
          <div className="mb-2 text-xs font-extrabold text-sky-950">9. Invoice &amp; payment terms and conditions</div>
          <div className="grid gap-2 sm:grid-cols-3">
            <Field label="Payment terms (days)" type="number" value={form.payment_terms_days} onChange={set('payment_terms_days')} />
            <div className="grid gap-1 sm:col-span-2"><Label className="text-[11px] font-bold">Payment terms</Label><Input className="h-8 text-xs" value={form.payment_terms_note} onChange={set('payment_terms_note')} /></div>
            {INVOICE_TERMS.map(([key, label]) => (
              <Area key={key} label={label} value={form[key]} onChange={set(key)} />
            ))}
            <Area label="Default invoice notes" value={form.default_invoice_notes} onChange={set('default_invoice_notes')} />
            <Area label="Bill payment instructions" value={form.payment_instructions} onChange={set('payment_instructions')} />
          </div>
        </div>
      )}

      {openMap.quote && (
        <div className="rounded-xl border-2 border-fuchsia-300 bg-white p-3.5 shadow-sm">
          <div className="mb-2 text-xs font-extrabold text-fuchsia-950">10. Quote terms &amp; conditions (Quote Centre)</div>
          <div className="grid gap-2 sm:grid-cols-3">
            <Field label="Quote validity (days)" type="number" value={form.quote_validity_days} onChange={set('quote_validity_days')} />
            <div className="grid gap-1 sm:col-span-2"><Label className="text-[11px] font-bold">Quote terms and conditions</Label><Textarea rows={3} className="text-xs" value={form.quote_terms} onChange={set('quote_terms')} /></div>
          </div>
        </div>
      )}
    </div>
  );
}