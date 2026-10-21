import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { downloadCsv } from '@/lib/csvExport';
import { exportProfileLogsPdf } from '@/lib/profileLogsPdf';
import EmployeeProfileSection from '@/components/profile/EmployeeProfileSection';

const CONSENT = /(?:audit consent|consent to share information|consent to act as an advocate|medication consent):/i;
const COLUMNS = [{ key: 'type', label: 'Log' }, { key: 'entry', label: 'Entry' }];

export default function ProfileAllLogs({ profile }) {
  const { data } = useQuery({
    queryKey: ['profile-acknowledgements', profile.id],
    queryFn: async () => (await base44.functions.invoke('profileAcknowledgements', { email: profile.email })).data,
  });
  const journey = useQuery({
    queryKey: ['profile-journey-actions', profile.id],
    queryFn: async () => (await base44.entities.StaffFormEntry.filter({ staff_id: profile.id, form_type: 'Employee Journey' }, { sort: '-updated_date', limit: 1 })).items[0] || null,
  });
  const changes = String(profile.change_log || '').split('\n').filter(Boolean).reverse()
    .map((entry) => ({ type: CONSENT.test(entry) ? 'Audit Consent' : 'Detail Change', entry }));
  const acks = (data?.items || []).map((r) => ({ type: 'Acknowledgement', entry: `${new Date(r.acknowledged_at).toLocaleString()} · ${r.acknowledged_by_name} (${r.acknowledged_by_role || 'user'}) acknowledged "${r.document_title}"` }));
  let journeySteps = [];
  try {
    const saved = journey.data?.answers ? JSON.parse(journey.data.answers) : null;
    journeySteps = (saved?.milestones || [])
      .filter((m) => m.completed_date || m.planned_date || m.notes || m.report || m.title)
      .map((m) => ({ type: 'Journey Step', entry: `${m.completed_date || m.planned_date || 'No date'} · ${m.responsible || 'Unassigned'} — ${m.type || 'Step'}${m.title ? `: ${m.title}` : ''}${m.notes ? ` — ${m.notes}` : ''}${m.report ? ` — Report: ${m.report}` : ''}` }));
  } catch { journeySteps = []; }
  const rows = [...changes, ...journeySteps, ...acks];
  const exportCsv = () => downloadCsv(`${(profile.full_name || 'profile').replace(/\s+/g, '-')}-all-logs.csv`, COLUMNS, rows);
  const [exportingPdf, setExportingPdf] = React.useState(false);
  const exportPdf = async () => { setExportingPdf(true); try { await exportProfileLogsPdf(profile.full_name, rows); } finally { setExportingPdf(false); } };
  return <EmployeeProfileSection title="All Logs (Exportable)" tone="journey" uniform>
    <div className="mb-1 flex items-center justify-between gap-2">
      <span className="text-[11px] text-black">{rows.length} logged {rows.length === 1 ? 'entry' : 'entries'}</span>
      <span className="flex items-center gap-1">
        <Button size="sm" variant="outline" className="h-6 bg-white px-2 text-[11px] text-black" onClick={exportPdf} disabled={!rows.length || exportingPdf}><Download className="h-3 w-3" />{exportingPdf ? 'Preparing…' : 'Export PDF'}</Button>
        <Button size="sm" variant="outline" className="h-6 bg-white px-2 text-[11px] text-black" onClick={exportCsv} disabled={!rows.length}><Download className="h-3 w-3" />Export CSV</Button>
      </span>
    </div>
    {rows.length ? <ul className="space-y-1">{rows.map((r, i) => <li key={i} className="break-words rounded-md bg-white px-2 py-1 text-[11px] leading-relaxed text-black"><b>{r.type}:</b> {r.entry}</li>)}</ul> : <p className="text-[11px] text-black">No logged entries yet.</p>}
  </EmployeeProfileSection>;
}