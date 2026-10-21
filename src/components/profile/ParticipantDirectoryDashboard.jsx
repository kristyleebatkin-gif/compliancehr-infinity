import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useRole } from '@/lib/useRole';
import { preparePersonalProfileAccess, profileRecordScope } from '@/lib/personalProfileAccess';

const STATUSES = [
  { label: 'Active', tone: 'var(--safe)' },
  { label: 'On Hold', tone: 'var(--chart-5)' },
  { label: 'Inactive', tone: 'var(--warning)' },
];
export default function ParticipantDirectoryDashboard({ scoped, selected, onSelect }) {
  const { user, role } = useRole();
  const summary = useQuery({
    queryKey: ['participant-status-summary', scoped, role, user?.id], enabled: !!user?.id,
    queryFn: async () => {
      if (scoped) await preparePersonalProfileAccess();
      const scope = scoped ? profileRecordScope(role, user, 'ParticipantProfile') : {};
      return Promise.all(STATUSES.map(({ label }) => base44.entities.ParticipantProfile.count({ $and: [scope, { status: label }] })));
    },
  });
  return <section aria-label="Participant status dashboard" className="space-y-2">
    <div className="grid items-stretch gap-2 sm:grid-cols-3">
      {STATUSES.map(({ label, tone }, index) => <button type="button" key={label} aria-pressed={selected === label} onClick={() => onSelect(selected === label ? 'all' : label)} className="employee-directory-tile rounded-xl p-3 text-left" style={{ '--directory-tone': tone }}>
        <span className="block text-2xl font-extrabold tabular-nums">{summary.isPending ? '…' : summary.error ? '—' : summary.data?.[index] ?? 0}</span><span className="text-xs font-bold">{label}</span>
      </button>)}
    </div>
    {summary.error && <p role="alert" className="text-sm text-destructive">Unable to load participant statuses. <button className="underline" onClick={() => summary.refetch()}>Retry</button></p>}
  </section>;
}