import React, { useState } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useRole } from '@/lib/useRole';
import ParticipantApprovalToggle from '@/components/participants/ParticipantApprovalToggle';
import ApprovedParticipantPicker from '@/components/profile/ApprovedParticipantPicker';
import ApprovedParticipantDialog from '@/components/profile/ApprovedParticipantDialog';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, Loader2 } from 'lucide-react';

export default function ApprovedParticipantProfiles() {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const { isAdmin } = useRole();
  const queryClient = useQueryClient();
  const updated = () => Promise.all([
    queryClient.invalidateQueries({ queryKey: ['approved-participant-profiles'] }),
    queryClient.invalidateQueries({ queryKey: ['approved-participant-detail'] }),
  ]);
  const { data, isPending, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['approved-participant-profiles', search],
    initialPageParam: undefined,
    queryFn: ({ pageParam }) => base44.entities.ParticipantProfile.filter({
      admin_approved: true,
      ...(search.trim() ? { full_name: { $regex: search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } } : {}),
    }, { sort: 'full_name', limit: 50, cursor: pageParam, fields: ['full_name', 'support_type', 'phone', 'email', 'admin_approved'] }),
    getNextPageParam: (page) => page.has_more ? page.next_cursor : undefined,
  });
  const profiles = data?.pages.flatMap((page) => page.items) || [];
  return (
    <section className="space-y-4">
      <h2 className="font-heading text-xl font-semibold">Approved Participant Profiles</h2>
      <p className="text-sm text-muted-foreground">Shared organisation-wide. Employees can view profiles; only admins and managers can add or remove approvals.</p>
      {isAdmin && <ApprovedParticipantPicker onUpdated={updated} />}
      <Input aria-label="Search approved participant profiles" placeholder="Search approved participants" value={search} onChange={(event) => setSearch(event.target.value)} />
      {isPending ? <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" /> : isError ? <p role="alert" className="text-danger">{error.message}</p> : !profiles.length ? <p className="py-8 text-center text-muted-foreground">No approved participants match.</p> : (
        <div className="grid gap-3 sm:grid-cols-2">
          {profiles.map((person) => <div key={person.id} className="space-y-3 rounded-xl border border-border bg-card p-4">
            <button type="button" onClick={() => setSelectedId(person.id)} className="flex w-full gap-3 text-left hover:text-primary">
              <Heart className="h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0"><h3 className="font-semibold">{person.full_name}</h3><p className="text-sm text-muted-foreground">{person.support_type}</p><p className="break-words text-xs text-muted-foreground">{[person.phone, person.email].filter(Boolean).join(' · ')}</p></div>
            </button>
            {isAdmin && <ParticipantApprovalToggle participant={person} onUpdate={updated} />}
          </div>)}
        </div>
      )}
      {hasNextPage && <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>{isFetchingNextPage ? 'Loading...' : 'Load more participants'}</Button>}
      {selectedId && <ApprovedParticipantDialog participantId={selectedId} onClose={() => setSelectedId(null)} />}
    </section>
  );
}