import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useRole } from '@/lib/useRole';

const TITLES = { sharing: 'Consent to share information', advocacy: 'Consent to act as an advocate', medication: 'Medication consent' };

function latestEntry(staff, type) {
  try {
    const received = JSON.parse(staff.consents_received || '[]');
    return Array.isArray(received) ? received.filter((e) => e.type === type).slice(-1)[0] || null : null;
  } catch { return null; }
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
  const editable = ['admin', 'Provider Administrator', 'Management', 'Human Resources Manager', 'Quality & Improvement Manager'].includes(user?.role);
  const title = TITLES[type];
  useEffect(() => { setForm(saved || {}); }, [staff.id, JSON.stringify(saved)]);
  const set = (key, value) => setForm((old) => ({ ...old, [key]: value }));
  const record = async (status) => {
    setBusy(true); setError('');
    try {
      const response = await base44.functions.invoke('staffAuditConsent', { staff_id: staff.id, consent_type: type, status, granted_by: form.granted_by, authorised_person: form.authorised_person, scope: form.scope, reason: form.reason });
      if (response.data?.error) throw new Error(response.data.error);
      await onUpdated?.();
      toast({ title: `${title} logged` });
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };
  return <details open className="min-w-0 space-y-2 rounded-xl border border-border bg-card p-3">
    <summary className="cursor-pointer text-sm font-semibold">{title} <Badge variant="outline">{saved?.status || 'Not recorded'}</Badge></summary>
    <p className="text-xs text-muted-foreground">{saved?.recorded_date ? `Logged by ${saved.recorded_by} on ${saved.recorded_date} at ${saved.recorded_time} (Sydney time)` : 'No consent decision logged. Consent must not be assumed.'}</p>
    {editable ? <><div className="grid gap-2 sm:grid-cols-2">
      <Input aria-label={`${title}: person giving consent`} placeholder="Employee / representative giving consent" maxLength={200} value={form.granted_by || ''} onChange={(e) => set('granted_by', e.target.value)} />
      <Input aria-label={`${title}: authorised person`} placeholder={type === 'sharing' ? 'Person / organisation receiving information' : type === 'medication' ? 'Person / service authorised to assist with medication' : 'Person authorised to act as advocate'} maxLength={200} value={form.authorised_person || ''} onChange={(e) => set('authorised_person', e.target.value)} />
      <Input aria-label={`${title}: scope`} placeholder={type === 'sharing' ? 'Information and purpose authorised' : type === 'medication' ? 'Medication support authorised and any conditions' : 'Scope of advocacy authorised'} maxLength={2000} value={form.scope || ''} onChange={(e) => set('scope', e.target.value)} />
      <Input aria-label={`${title}: reason`} placeholder="Reason / evidence reference" maxLength={2000} value={form.reason || ''} onChange={(e) => set('reason', e.target.value)} />
    </div><div className="flex flex-wrap gap-2">{['Consent received', 'Declined', 'Withdrawn'].map((status) => <Button key={status} variant="outline" size="sm" disabled={busy || (status === 'Consent received' && ![form.granted_by, form.authorised_person, form.scope].every((v) => v?.trim()))} onClick={() => record(status)}>{busy ? 'Saving…' : `Record ${status.toLowerCase()}`}</Button>)}</div></> : <div className="text-xs text-muted-foreground">{saved?.granted_by && <p>Consent given by: {saved.granted_by}</p>}{saved?.authorised_person && <p>Authorised person: {saved.authorised_person}</p>}{saved?.scope && <p>Scope: {saved.scope}</p>}</div>}
    {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
  </details>;
}