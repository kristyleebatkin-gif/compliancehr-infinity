import React, { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { format, addDays } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { useRole } from '@/lib/useRole';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import EmployeeParticipantSelect from '@/components/employee/EmployeeParticipantSelect';
import EmployeeShiftCard from '@/components/employee/EmployeeShiftCard';

export default function EmployeeRoster({ embedded = false }) {
  const { user } = useRole();
  const [from, setFrom] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [to, setTo] = useState(format(addDays(new Date(), 30), 'yyyy-MM-dd'));
  const [participantId, setParticipantId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const query = useInfiniteQuery({ queryKey: ['employee-roster', user?.id, from, to, participantId], initialPageParam: null,
    queryFn: async ({ pageParam }) => (await base44.functions.invoke('employeeRoster', { action: 'list', from, to, participant_id: participantId, cursor: pageParam })).data,
    getNextPageParam: (page) => page.has_more ? page.next_cursor : undefined,
  });
  const act = async (action, shiftId) => {
    setBusy(true); setError('');
    try { await base44.functions.invoke('employeeRoster', { action, shift_id: shiftId }); await query.refetch(); }
    catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  };
  const shifts = query.data?.pages.flatMap((page) => page.items || []) || [];
  return <section className="space-y-4">
    {!embedded && <PageHeader title="My Rostering" subtitle="Only shifts assigned to you, with approved participants." showCompliance={false} showAudit={false} showAlerts={false} />}
    <div className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2"><label className="text-sm">From<Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></label><label className="text-sm">To<Input type="date" value={to} onChange={(event) => setTo(event.target.value)} /></label><div className="sm:col-span-2"><EmployeeParticipantSelect value={participantId} onChange={setParticipantId} optional /></div></div>
    {error && <p role="alert" className="text-destructive">{error}</p>}
    {query.isPending ? <p role="status">Loading your roster…</p> : query.isError ? <p role="alert" className="text-destructive">{query.error.message}<Button variant="outline" onClick={() => query.refetch()}>Retry</Button></p> : !shifts.length ? <p className="text-muted-foreground">No shifts assigned to you match these dates and approved participants.</p> : shifts.map((shift) => <EmployeeShiftCard key={shift.id} shift={shift} busy={busy} onAction={act} />)}
    {query.hasNextPage && <Button variant="outline" disabled={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>Load more shifts</Button>}
  </section>;
}