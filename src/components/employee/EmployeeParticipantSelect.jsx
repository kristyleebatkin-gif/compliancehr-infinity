import React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useRole } from '@/lib/useRole';
import { Button } from '@/components/ui/button';

export default function EmployeeParticipantSelect({ value, onChange, optional = false }) {
  const { user } = useRole();
  const query = useInfiniteQuery({ queryKey: ['employee-approved-participants', user?.id], initialPageParam: null,
    queryFn: async ({ pageParam }) => (await base44.functions.invoke('employeeGoals', { action: 'participants', cursor: pageParam })).data,
    getNextPageParam: (page) => page.has_more ? page.next_cursor : undefined,
  });
  return <div className="space-y-2">
    <label className="text-sm font-medium" htmlFor="employee-approved-participant">Approved participant</label>
    <select id="employee-approved-participant" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={value} onChange={(event) => onChange(event.target.value)} disabled={query.isPending}>
      <option value="">{optional ? 'All approved participants' : 'Select an approved participant'}</option>
      {query.data?.pages.flatMap((page) => page.items || []).map((person) => <option key={person.id} value={person.id}>{person.full_name}</option>)}
    </select>
    {query.isPending && <p role="status" className="text-sm text-muted-foreground">Loading approved participants…</p>}
    {query.isError && <p role="alert" className="text-sm text-destructive">{query.error.message}<Button variant="outline" onClick={() => query.refetch()}>Retry</Button></p>}
    {query.hasNextPage && <Button variant="outline" size="sm" disabled={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>Load more participants</Button>}
  </div>;
}