import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { downloadCsv } from '@/lib/csvExport';
import EmployeeProfileSection from '@/components/profile/EmployeeProfileSection';

const CONSENT = /(?:audit consent|consent to share information|consent to act as an advocate|medication consent):/i;
const COLUMNS = [{ key: 'type', label: 'Log' }, { key: 'entry', label: 'Entry' }];

export default function ProfileAllLogs({ profile }) {
  const { data } = useQuery({
    queryKey: ['profile-acknowledgements', profile.id],
    queryFn: async () => (await base44.functions.invoke('profileAcknowledgements', { email: profile.email })).data,
  });
  const changes = String(profile.change_log || '').split('\n').filter(Boolean).reverse()
    .map((entry) => ({ type: CONSENT.test(entry) ? 'Audit Consent' : 'Detail Change', entry }));
  const acks = (data?.items || []).map((r) => ({ type: 'Acknowledgement', entry: `${new Date(r.acknowledged_at).toLocaleString()} · ${r.acknowledged_by_name} (${r.acknowledged_by_role || 'user'}) acknowledged "${r.document_title}"` }));
  const rows = [...changes, ...acks];
  const exportCsv = () => downloadCsv(`${(profile.full_name || 'profile').replace(/\s+/g, '-')}-all-logs.csv`, COLUMNS, rows);
  return <EmployeeProfileSection title="All Logs (Exportable)" tone="journey" uniform>
    <div className="mb-1 flex items-center justify-between gap-2">
      <span className="text-[11px] text-black">{rows.length} logged {rows.length === 1 ? 'entry' : 'entries'}</span>
      <Button size="sm" variant="outline" className="h-6 bg-white px-2 text-[11px] text-black" onClick={exportCsv} disabled={!rows.length}><Download className="h-3 w-3" />Export CSV</Button>
    </div>
    {rows.length ? <ul className="space-y-1">{rows.map((r, i) => <li key={i} className="break-words rounded-md bg-white px-2 py-1 text-[11px] leading-relaxed text-black"><b>{r.type}:</b> {r.entry}</li>)}</ul> : <p className="text-[11px] text-black">No logged entries yet.</p>}
  </EmployeeProfileSection>;
}