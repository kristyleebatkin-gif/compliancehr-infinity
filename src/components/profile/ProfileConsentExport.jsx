import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import profileRecordExport from '@/lib/profileRecordExport';

export default function ProfileConsentExport({ profile }) {
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const download = async (format) => {
    setBusy(true); setError('');
    try {
      const rows = [{ field: 'Audit consent', value: profile.audit_consent_recorded_date ? profile.audit_consent : 'Not recorded' }, { field: 'Recorded by', value: profile.audit_consent_recorded_by }, { field: 'Recorded date (Sydney)', value: profile.audit_consent_recorded_date }, { field: 'Recorded time (Sydney)', value: profile.audit_consent_recorded_time }, { field: 'Consent decision history and reasons', value: String(profile.change_log || '').split('\n').filter((line) => /audit consent:/i.test(line)).join('\n') }];
      await profileRecordExport('Audit Consent', profile, rows, format);
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  };
  return <div className="mt-2"><div className="flex flex-wrap gap-1">{['pdf', 'csv'].map((format) => <Button type="button" key={format} size="sm" variant="outline" disabled={busy} onClick={() => download(format)}>Export consent {format.toUpperCase()}</Button>)}</div>{error && <p role="alert" className="mt-1 text-xs text-destructive">{error}</p>}</div>;
}