import React, { useState } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useRole } from '@/lib/useRole';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import EmployeeCommunicationList from '@/components/employee/EmployeeCommunicationList';
export default function EmployeeTeamMessages({ shoutout = false }) {
  const { user } = useRole();
  const client = useQueryClient();
  const [staffId, setStaffId] = useState('');
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const query = useInfiniteQuery({ queryKey: ['employee-team-directory', user.id], enabled: shoutout, initialPageParam: null, queryFn: async ({ pageParam }) => (await base44.functions.invoke('employeeCommunications', { action: 'team', cursor: pageParam })).data, getNextPageParam: (page) => page.has_more ? page.next_cursor : undefined });
  const post = async (event) => {
    event.preventDefault(); setBusy(true); setError('');
    try { await base44.functions.invoke('employeeCommunications', { action: 'banter', values: { body: text, staff_id: shoutout ? staffId : undefined } }); setText(''); await client.invalidateQueries({ queryKey: ['employee-communications'] }); }
    catch (failure) { setError(failure.response?.data?.error || failure.message); }
    finally { setBusy(false); }
  };
  return <section className="space-y-4"><form onSubmit={post} className="space-y-3 rounded-xl border border-border bg-card p-4">
    <h3 className="text-sm font-semibold">{shoutout ? 'Recognise a teammate' : 'Team banter'}</h3>
    {shoutout && <><label className="block text-sm">Teammate<select required value={staffId} onChange={(event) => setStaffId(event.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3"><option value="">{query.isPending ? 'Loading teammates…' : 'Select teammate'}</option>{query.data?.pages.flatMap((page) => page.items).map((person) => <option key={person.id} value={person.id}>{person.full_name}</option>)}</select></label>{query.isError && <p role="alert" className="text-sm text-destructive">{query.error.message}<Button type="button" variant="outline" onClick={() => query.refetch()}>Retry</Button></p>}{query.hasNextPage && <Button type="button" variant="outline" disabled={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>Load more teammates</Button>}</>}
    <Textarea aria-label={shoutout ? 'Shoutout message' : 'Team message'} required maxLength={10000} value={text} onChange={(event) => setText(event.target.value)} />
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}<Button type="submit" variant="outline" disabled={busy || !text.trim() || (shoutout && !staffId)}>{busy ? 'Posting…' : 'Post'}</Button>
  </form><EmployeeCommunicationList view={shoutout ? 'shoutouts' : 'banter'} /></section>;
}