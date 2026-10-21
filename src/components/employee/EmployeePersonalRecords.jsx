import React, { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useRole } from '@/lib/useRole';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EmployeePersonalRecord from '@/components/employee/EmployeePersonalRecord';
export default function EmployeePersonalRecords({ view }) {
  const { user } = useRole();
  const [task, setTask] = useState(null);
  const [minutes, setMinutes] = useState('0');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const query = useInfiniteQuery({ queryKey: ['employee-personal-records', user.id, view], initialPageParam: null, queryFn: async ({ pageParam }) => (await base44.functions.invoke('employeePersonalRecords', { action: 'list', view, cursor: pageParam })).data, getNextPageParam: (page) => page.has_more ? page.next_cursor : undefined });
  const finish = async (event) => {
    event.preventDefault(); setSaving(true); setError('');
    try { await base44.functions.invoke('employeePersonalRecords', { action: 'finaliseTask', id: task.id, values: { minutes } }); setTask(null); await query.refetch(); }
    catch (failure) { setError(failure.response?.data?.error || failure.message); }
    finally { setSaving(false); }
  };
  const items = query.data?.pages.flatMap((page) => page.items || []) || [];
  return <section className="space-y-3"><Button variant="outline" size="sm" onClick={() => query.refetch()} disabled={query.isFetching}>Refresh</Button>
    {query.isPending ? <p role="status">Loading your records…</p> : query.isError ? <p role="alert" className="text-sm text-destructive">{query.error.response?.data?.error || query.error.message}</p> : !items.length ? <p className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">No records found for you.</p> : items.map((record) => <EmployeePersonalRecord key={record.id} record={record} view={view} onFinalise={(value) => { setTask(value); setMinutes('0'); setError(''); }} />)}
    {query.hasNextPage && <Button variant="outline" disabled={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>Load more records</Button>}
    <Dialog open={!!task} onOpenChange={(open) => { if (!open && !saving) setTask(null); }}><DialogContent><DialogHeader><DialogTitle>Complete my task for manager sign-off</DialogTitle></DialogHeader><form onSubmit={finish} className="space-y-3"><p className="text-sm">{task?.title}</p><label className="block text-sm">Time taken (minutes)<Input required type="number" min="0" max="100000" value={minutes} onChange={(event) => setMinutes(event.target.value)} /></label>{error && <p role="alert" className="text-destructive">{error}</p>}<Button variant="outline" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Submit for sign-off'}</Button></form></DialogContent></Dialog>
  </section>;
}