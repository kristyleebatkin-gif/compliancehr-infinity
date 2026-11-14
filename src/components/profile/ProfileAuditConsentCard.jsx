import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useRole } from '@/lib/useRole';
import { Loader2, ShieldCheck } from 'lucide-react';
import ProfileConsentLog from '@/components/profile/ProfileConsentLog';
import ProfileConsentExport from '@/components/profile/ProfileConsentExport';

const GRADIENT_BORDER_STYLE = {
  border: '2px solid transparent',
  background:
    'linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #5A00D6 62%, #FF2E9A 100%) border-box',
};

export default function ProfileAuditConsentCard({
  profile,
  kind,
  onUpdated,
  compact = false,
}) {
  const { user } = useRole();
  const { toast } = useToast();
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const editable =
    [
      'admin',
      'Provider Administrator',
      'Management',
      'Human Resources Manager',
      'Quality & Improvement Manager',
    ].includes(user?.role) ||
    (kind === 'participant' &&
      user?.role === 'Participant' &&
      profile.email === user?.email);
  const consent = profile.audit_consent;
  const record = async (value) => {
    setBusy(true);
    try {
      const response = await base44.functions.invoke(
        kind === 'staff' ? 'staffAuditConsent' : 'participantAuditConsent',
        {
          [kind === 'staff' ? 'staff_id' : 'participant_id']: profile.id,
          consent: value,
          reason,
        }
      );
      if (response.data?.error) throw new Error(response.data.error);
      const updated = await base44.entities[
        kind === 'staff' ? 'StaffProfile' : 'ParticipantProfile'
      ].get(profile.id);
      await onUpdated?.(updated);
      setReason('');
      toast({ title: 'Audit consent recorded' });
    } catch (error) {
      toast({
        title: 'Could not record consent',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setBusy(false);
    }
  };
  return (
    <details
      className={`min-w-0 rounded-xl shadow-2xs ${
        compact
          ? 'p-2.5 [&_button]:h-auto [&_button]:min-h-7 [&_button]:whitespace-normal [&_button]:px-2.5 [&_button]:py-1 [&_button]:text-[10px] [&_input]:h-7 [&_input]:text-xs'
          : 'p-3'
      }`}
      style={GRADIENT_BORDER_STYLE}
    >
      <summary
        className="mb-2 flex cursor-pointer flex-wrap items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-sm font-extrabold text-[#0A2B6D]"
        style={GRADIENT_BORDER_STYLE}
      >
        <span className="inline-flex items-center gap-1.5 text-[#0A2B6D]">
          <ShieldCheck className="h-4 w-4 shrink-0 text-[#0072FF]" />
          <span className="font-extrabold text-[#0A2B6D]">Consent to audit</span>
        </span>
        <span
          className="rounded-full px-2.5 py-0.5 text-[10.5px] font-extrabold text-[#0A2B6D]"
          style={GRADIENT_BORDER_STYLE}
        >
          <span style={{ color: '#5A00D6' }}>◉</span>{' '}
          {profile.audit_consent_recorded_date
            ? consent
            : consent === 'Audit consent received'
            ? consent
            : 'Not recorded'}
        </span>
      </summary>
      <p
        className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#0A2B6D]"
        style={GRADIENT_BORDER_STYLE}
      >
        <span style={{ color: '#0072FF' }}>◉</span>{' '}
        {profile.audit_consent_recorded_date
          ? `Logged by ${
              profile.audit_consent_recorded_by || 'Not recorded'
            } on ${profile.audit_consent_recorded_date} at ${
              profile.audit_consent_recorded_time || 'Not recorded'
            } (Brisbane time)`
          : 'No dated consent decision has been logged. Consent must not be assumed.'}
      </p>
      {editable && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Input
            aria-label="Audit consent reason or evidence"
            className={
              compact
                ? 'min-w-0 w-full flex-auto text-[#0A2B6D]'
                : 'min-w-40 flex-1 text-[#0A2B6D]'
            }
            style={GRADIENT_BORDER_STYLE}
            placeholder="Reason / consent evidence"
            maxLength={2000}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <Button
            size="sm"
            variant="outline"
            className="rounded-full font-extrabold text-[#0A2B6D]"
            style={GRADIENT_BORDER_STYLE}
            disabled={busy}
            onClick={() => record('Audit consent received')}
          >
            {busy && <Loader2 className="h-3 w-3 animate-spin text-[#0072FF]" />}
            <span style={{ color: '#0072FF' }}>◉</span> Record received
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="rounded-full font-extrabold text-[#0A2B6D]"
            style={GRADIENT_BORDER_STYLE}
            disabled={busy}
            onClick={() => record('Audit declined')}
          >
            <span style={{ color: '#FF2E9A' }}>◉</span> Record declined / withdrawn
          </Button>
        </div>
      )}
      {(compact || kind === 'staff') && <ProfileConsentLog profile={profile} />}
      {kind === 'staff' && <ProfileConsentExport profile={profile} />}
    </details>
  );
}