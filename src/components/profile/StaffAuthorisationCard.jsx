import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useRole } from '@/lib/useRole';
import { ShieldCheck } from 'lucide-react';

const TITLES = {
  sharing: 'Consent to share information',
  advocacy: 'Consent to act as an advocate',
  medication: 'Medication consent',
};

const BORDER_COLOURS = {
  medication: '#0072FF',
  sharing: '#5A00D6',
  advocacy: '#FF2E9A',
};

const HEADING_TEXT_GRADIENT =
  'linear-gradient(90deg, #0A2B6D 0%, #0A2B6D 38%, #0072FF 62%, #5A00D6 82%, #FF2E9A 100%)';

function latestEntry(staff, type) {
  try {
    const received = JSON.parse(staff.consents_received || '[]');
    return Array.isArray(received)
      ? received.filter((e) => e.type === type).slice(-1)[0] || null
      : null;
  } catch {
    return null;
  }
}

/* Employee consent form (medication / share information / advocate), mirroring the
   participant authorisation cards: records status with date, time and who logged it. */
export default function StaffAuthorisationCard({ staff, type, onUpdated }) {
  const { user } = useRole();
  const { toast } = useToast();
  const saved = latestEntry(staff, type);
  const [form, setForm] = useState(saved || {});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const editable = [
    'admin',
    'Provider Administrator',
    'Management',
    'Human Resources Manager',
    'Quality & Improvement Manager',
  ].includes(user?.role);
  const title = TITLES[type];
  const borderCol = BORDER_COLOURS[type] || '#5A00D6';

  useEffect(() => {
    setForm(saved || {});
  }, [staff.id, JSON.stringify(saved)]);
  const set = (key, value) => setForm((old) => ({ ...old, [key]: value }));

  const record = async (status) => {
    setBusy(true);
    setError('');
    try {
      const response = await base44.functions.invoke('staffAuditConsent', {
        staff_id: staff.id,
        consent_type: type,
        status,
        granted_by: form.granted_by,
        authorised_person: form.authorised_person,
        scope: form.scope,
        reason: form.reason,
      });
      if (response.data?.error) throw new Error(response.data.error);
      await onUpdated?.();
      toast({ title: `${title} logged` });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <details
      open
      className="min-w-0 space-y-2 rounded-xl bg-white p-3 shadow-2xs"
      style={{ border: `2px solid ${borderCol}` }}
    >
      <summary
        className="flex cursor-pointer flex-wrap items-center justify-between gap-2 rounded-lg bg-white px-3 py-1.5 text-sm font-extrabold"
        style={{ border: `2px solid ${borderCol}` }}
      >
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 shrink-0" style={{ color: borderCol }} />
          <span
            className="bg-clip-text text-transparent font-extrabold"
            style={{ backgroundImage: HEADING_TEXT_GRADIENT }}
          >
            {title}
          </span>
        </span>
        <span
          className="rounded-full bg-white px-2.5 py-0.5 text-[10.5px] font-extrabold text-[#0A2B6D]"
          style={{ border: `1.5px solid ${borderCol}`, color: '#0A2B6D' }}
        >
          <span style={{ color: borderCol }}>◉</span> {saved?.status || 'Not recorded'}
        </span>
      </summary>
      <p
        className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold text-[#0A2B6D]"
        style={{ border: `1.5px solid ${borderCol}`, color: '#0A2B6D' }}
      >
        <span style={{ color: borderCol }}>◉</span>{' '}
        {saved?.recorded_date
          ? `Logged by ${saved.recorded_by} on ${saved.recorded_date} at ${saved.recorded_time} (Sydney time)`
          : 'No consent decision logged. Consent must not be assumed.'}
      </p>
      {editable ? (
        <>
          <div className="grid gap-2 sm:grid-cols-2">
            <Input
              aria-label={`${title}: person giving consent`}
              placeholder="Employee / representative giving consent"
              maxLength={200}
              className="border-2 border-[#0072FF]/50 bg-white text-[#0A2B6D]"
              value={form.granted_by || ''}
              onChange={(e) => set('granted_by', e.target.value)}
            />
            <Input
              aria-label={`${title}: authorised person`}
              placeholder={
                type === 'sharing'
                  ? 'Person / organisation receiving information'
                  : type === 'medication'
                  ? 'Person / service authorised to assist with medication'
                  : 'Person authorised to act as advocate'
              }
              maxLength={200}
              className="border-2 border-[#5A00D6]/50 bg-white text-[#0A2B6D]"
              value={form.authorised_person || ''}
              onChange={(e) => set('authorised_person', e.target.value)}
            />
            <Input
              aria-label={`${title}: scope`}
              placeholder={
                type === 'sharing'
                  ? 'Information and purpose authorised'
                  : type === 'medication'
                  ? 'Medication support authorised and any conditions'
                  : 'Scope of advocacy authorised'
              }
              maxLength={2000}
              className="border-2 border-[#A100FF]/50 bg-white text-[#0A2B6D]"
              value={form.scope || ''}
              onChange={(e) => set('scope', e.target.value)}
            />
            <Input
              aria-label={`${title}: reason`}
              placeholder="Reason / evidence reference"
              maxLength={2000}
              className="border-2 border-[#FF2E9A]/50 bg-white text-[#0A2B6D]"
              value={form.reason || ''}
              onChange={(e) => set('reason', e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {['Consent received', 'Declined', 'Withdrawn'].map((status, idx) => {
              const btnCol = ['#0072FF', '#5A00D6', '#FF2E9A'][idx % 3];
              return (
                <Button
                  key={status}
                  variant="outline"
                  size="sm"
                  className="rounded-full bg-white font-extrabold text-[#0A2B6D]"
                  style={{ border: `2px solid ${btnCol}`, color: '#0A2B6D' }}
                  disabled={
                    busy ||
                    (status === 'Consent received' &&
                      ![form.granted_by, form.authorised_person, form.scope].every((v) =>
                        v?.trim()
                      ))
                  }
                  onClick={() => record(status)}
                >
                  <span style={{ color: btnCol }}>◉</span>{' '}
                  {busy ? 'Saving…' : `Record ${status.toLowerCase()}`}
                </Button>
              );
            })}
          </div>
        </>
      ) : (
        <div className="space-y-1 text-xs font-bold text-[#0A2B6D]">
          {saved?.granted_by && <p>Consent given by: {saved.granted_by}</p>}
          {saved?.authorised_person && <p>Authorised person: {saved.authorised_person}</p>}
          {saved?.scope && <p>Scope: {saved.scope}</p>}
        </div>
      )}
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </details>
  );
}