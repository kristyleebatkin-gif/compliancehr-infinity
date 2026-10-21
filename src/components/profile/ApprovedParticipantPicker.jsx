import React, { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ParticipantApprovalToggle from '@/components/participants/ParticipantApprovalToggle';

export default function ApprovedParticipantPicker({ onUpdated }) {
  const [search, setSearch] = useState('');
  const { data, isPending, error, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useInfiniteQuery({
    queryKey: ['participants-awaiting-approval', search], initialPageParam: undefined,
    queryFn: ({ pageParam }) => base44.entities.ParticipantProfile.filter({
      admin_approved: { $ne: true },
      ...(search.trim() ? { full_name: { $regex: search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } } : {}),
    }, { sort: 'full_name', limit: 20, cursor: pageParam, fields: ['full_name', 'admin_approved'] }),
    getNextPageParam: (page) => page.has_more ? page.next_cursor : undefined,
  });
  const updated = async () => { await Promise.all([refetch(), onUpdated()]); };
  return <details className="rounded-xl border border-border bg-card p-4">
    <summary className="cursor-pointer font-semibold">Add approved participants</summary>
    <div className="mt-3 space-y-3">
      <p className="text-sm text-muted-foreground">Approve an existing participant to share their profile with all employees. Only admins and managers can change approvals.</p>
      <Input aria-label="Find participants to approve" placeholder="Find a participant to approve" value={search} onChange={(event) => setSearch(event.target.value)} />
      {isPending ? <p role="status">Loading participants...</p> : error ? <p role="alert" className="text-danger">{error.message}</p> : <>
        {!data?.pages.some((page) => page.items.length) && <p className="text-sm text-muted-foreground">No unapproved participants match.</p>}
        {data?.pages.flatMap((page) => page.items).map((person) => <div key={person.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2"><span>{person.full_name}</span><ParticipantApprovalToggle participant={person} onUpdate={updated} /></div>)}
      </>}
      {hasNextPage && <Button variant="outline" disabled={isFetchingNextPage} onClick={() => fetchNextPage()}>{isFetchingNextPage ? 'Loading...' : 'Load more'}</Button>}
    </div>
  </details>;
}