import React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useRole } from '@/lib/useRole';
import { Button } from '@/components/ui/button';
import EmployeeCommunicationRecord from '@/components/employee/EmployeeCommunicationRecord';
export default function EmployeeCommunicationList({ view, participantId = '', onReply, onJoin }) {
  const { user } = useRole();
  const query = useInfiniteQuery({ queryKey: ['employee-communications', user.id, view, participantId], initialPageParam: null,
    queryFn: async ({ pageParam }) => (await base44.functions.invoke('employeeCommunications', { action: 'list', view, participant_id: participantId, cursor: pageParam })).data,
    getNextPageParam: (page) => page.has_more ? page.next_cursor : undefined,
  });
  const records = query.data?.pages.flatMap((page) => page.items || []) || [];
  return <section className="space-y-3">
    <Button variant="outline" size="sm" disabled={query.isFetching} onClick={() => query.refetch()}>Refresh</Button>
    {query.isPending ? <p role="status">Loading communications…</p> : query.isError ? <p role="alert" className="text-sm text-destructive">{query.error.message}</p> : !records.length ? <p className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">No communications match this view.</p> : records.map((record) => <EmployeeCommunicationRecord key={record.id} record={record} onReply={record.sender_email && record.sender_email !== user.email ? onReply : undefined} onJoin={onJoin} />)}
    {query.hasNextPage && <Button variant="outline" disabled={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>Load more communications</Button>}
  </section>;
}