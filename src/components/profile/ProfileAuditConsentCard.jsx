import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useRole } from '@/lib/useRole';
import { Loader2, ShieldCheck } from 'lucide-react';
import ProfileConsentLog from '@/components/profile/ProfileConsentLog';

export default function ProfileAuditConsentCard({ profile, kind, onUpdated, compact = false }) {
  const { user } = useRole();
  const { toast } = useToast();
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const editable = ['admin', 'Provider Administrator', 'Management', 'Human Resources Manager', 'Quality & Improvement Manager'].includes(user?.role);
  const consent = profile.audit_consent;
  const record = async (value) => {
    setBusy(true);
    try {
      const response = await base44.functions.invoke(kind === 'staff' ? 'staffAuditConsent' : 'participantAuditConsent', { [kind === 'staff' ? 'staff_id' : 'participant_id']: profile.id, consent: value, reason });
      if (response.data?.error) throw new Error(response.data.error);
      const updated = await base44.entities[kind === 'staff' ? 'StaffProfile' : 'ParticipantProfile'].get(profile.id);
      await onUpdated?.(updated);
      setReason('');
      toast({ title: 'Audit consent recorded' });
    } catch (error) { toast({ title: 'Could not record consent', description: error.message, variant: 'destructive' }); }
    finally { setBusy(false); }
  };
  return <section className={`min-w-0 rounded-xl border border-border bg-card ${compact ? 'p-2 [&_button]:h-auto [&_button]:min-h-7 [&_button]:whitespace-normal [&_button]:px-2 [&_button]:py-1 [&_button]:text-[10px] [&_input]:h-7 [&_input]:text-xs' : 'p-3'}`}>
    <div className="mb-2 flex flex-wrap items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /><h2 className="text-sm font-semibold">Consent to audit</h2><Badge variant="outline">{profile.audit_consent_recorded_date ? consent : consent === 'Audit consent received' ? consent : 'Not recorded'}</Badge></div>
    <p className="text-xs text-muted-foreground">{profile.audit_consent_recorded_date ? `Logged by ${profile.audit_consent_recorded_by || 'Not recorded'} on ${profile.audit_consent_recorded_date} at ${profile.audit_consent_recorded_time || 'Not recorded'} (Sydney time)` : 'No dated consent decision has been logged. Consent must not be assumed.'}</p>
    {editable && <div className="mt-2 flex flex-wrap items-center gap-2">
      <Input aria-label="Audit consent reason or evidence" className={compact ? 'min-w-0 w-full flex-auto' : 'min-w-40 flex-1'} placeholder="Reason / consent evidence" maxLength={2000} value={reason} onChange={(e) => setReason(e.target.value)} />
      <Button size="sm" variant="outline" disabled={busy} onClick={() => record('Audit consent received')}>{busy && <Loader2 className="h-3 w-3 animate-spin" />}Record received</Button>
      <Button size="sm" variant="outline" disabled={busy} onClick={() => record('Audit declined')}>Record declined / withdrawn</Button>
    </div>}
    {compact && <ProfileConsentLog profile={profile} />}
  </section>;
}