import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { useRole } from '@/lib/useRole';
import { businessDateTime } from '@/lib/intakeCases';
import { Loader2, ShieldCheck, ShieldOff } from 'lucide-react';

const SECTIONS = [
  {
    title: 'Contacts & Emergency',
    fields: [
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'emergency_contact', label: 'Emergency contact name' },
      { key: 'emergency_contact_phone', label: 'Emergency contact phone' },
      { key: 'advocate_representative', label: 'Advocate / representative' },
    ],
  },
  {
    title: 'NDIS & Coordination',
    fields: [
      { key: 'ndis_number', label: 'NDIS number' },
      { key: 'ndis_reference_number', label: 'NDIS reference number' },
      { key: 'support_coordinator', label: 'Support coordination' },
      { key: 'plan_manager', label: 'Plan manager' },
      { key: 'plan_manager_email', label: 'Plan manager email' },
      { key: 'support_type', label: 'Type of support being provided', multiline: true },
    ],
  },
  {
    title: 'Health & Support Team',
    fields: [
      { key: 'medical_diagnosis', label: 'Medical diagnosis', multiline: true },
      { key: 'occupational_therapist', label: 'Occupational therapist' },
      { key: 'medications_dosage', label: 'Medications and dosage', multiline: true },
      { key: 'support_shifts', label: 'Support shifts', multiline: true },
      { key: 'support_staff', label: 'Support staff', multiline: true },
    ],
  },
  {
    title: 'About Me',
    fields: [
      { key: 'likes', label: 'Likes', multiline: true },
      { key: 'dislikes', label: 'Dislikes', multiline: true },
      { key: 'routine', label: 'Routine', multiline: true },
      { key: 'triggers', label: 'Triggers', multiline: true },
      { key: 'risks', label: 'Risks', multiline: true },
      { key: 'control_measures', label: 'Control measures', multiline: true },
      { key: 'fire_drill', label: 'Fire drill', multiline: true },
    ],
  },
];

export default function ParticipantDetailsTab({ participant, onUpdated }) {
  const { toast } = useToast();
  const { user } = useRole();
  const [form, setForm] = useState(participant);
  const [saving, setSaving] = useState(false);
  const [consentReason, setConsentReason] = useState('');
  const [consentBusy, setConsentBusy] = useState(false);

  useEffect(() => { setForm(participant); }, [participant.id, JSON.stringify(participant)]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      const payload = Object.fromEntries(SECTIONS.flatMap((s) => s.fields.map((f) => [f.key, form[f.key] || ''])));
      payload.notes = form.notes || '';
      await base44.entities.ParticipantProfile.update(participant.id, payload);
      toast({ title: 'Profile saved' });
      onUpdated();
    } catch (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const recordConsent = async (consent) => {
    setConsentBusy(true);
    try {
      const { date, time } = businessDateTime();
      await base44.functions.invoke('participantAuditConsent', {
        participant_id: participant.id,
        consent,
        reason: consentReason,
        recorded_by: user?.full_name || user?.email || '',
        recorded_date: date,
        recorded_time: time,
      });
      toast({ title: `Audit consent logged: ${consent}` });
      setConsentReason('');
      onUpdated();
    } catch (error) {
      toast({ title: 'Could not log consent', description: error.message, variant: 'destructive' });
    } finally {
      setConsentBusy(false);
    }
  };

  const consent = form.audit_consent || 'Audit declined';

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {consent === 'Audit consent received'
              ? <ShieldCheck className="h-4 w-4 text-safe" />
              : <ShieldOff className="h-4 w-4 text-muted-foreground" />}
            <span className="text-sm font-semibold">Audit consent</span>
            <Badge className={statusTone(consent === 'Audit consent received' ? 'Current' : 'Expired')}>{consent}</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Input className="w-56" placeholder="Reason (logged with consent)" value={consentReason} onChange={(e) => setConsentReason(e.target.value)} />
            <Button size="sm" disabled={consentBusy || consent === 'Audit consent received'} onClick={() => recordConsent('Audit consent received')}>
              {consentBusy && <Loader2 className="h-3 w-3 animate-spin" />}Record consent received
            </Button>
            <Button size="sm" variant="outline" disabled={consentBusy || consent === 'Audit declined'} onClick={() => recordConsent('Audit declined')}>
              Record declined
            </Button>
          </div>
        </div>
        {(form.audit_consent_recorded_by || form.audit_consent_recorded_date) && (
          <p className="mt-1 text-xs text-muted-foreground">
            Recorded by {form.audit_consent_recorded_by || 'unknown'} on {form.audit_consent_recorded_date || '-'}{form.audit_consent_recorded_time ? ` at ${form.audit_consent_recorded_time}` : ''}
          </p>
        )}
        <p className="mt-2 text-xs text-muted-foreground">Consent changes are logged to the audit trail with who changed them, when and why.</p>
      </div>

      {SECTIONS.map((section) => (
        <div key={section.title} className="rounded-2xl border border-border/60 bg-card p-5">
          <div className="mb-3 text-sm font-semibold">{section.title}</div>
          <div className="grid gap-3 md:grid-cols-2">
            {section.fields.map((field) => (
              <div key={field.key} className={field.multiline ? 'md:col-span-2 grid gap-1.5' : 'grid gap-1.5'}>
                <Label>{field.label}</Label>
                {field.multiline
                  ? <Textarea rows={3} value={form[field.key] || ''} onChange={(e) => set(field.key, e.target.value)} />
                  : <Input value={form[field.key] || ''} onChange={(e) => set(field.key, e.target.value)} />}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}Save profile
        </Button>
      </div>
    </div>
  );
}