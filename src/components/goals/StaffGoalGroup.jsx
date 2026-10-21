import React, { useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Users } from 'lucide-react';
import GoalProgressCard from '@/components/goals/GoalProgressCard';
import StaffGoalForm from '@/components/goals/StaffGoalForm';

export default function StaffGoalGroup({ summary, achieved, scope, canEdit }) {
  const client = useQueryClient();
  const [editing, setEditing] = useState(null);
  const query = useInfiniteQuery({
    queryKey: ['staff-goals', 'records', scope, summary.staff_email], initialPageParam: undefined,
    queryFn: ({ pageParam }) => base44.entities.StaffGoal.filter({ ...scope, staff_email: summary.staff_email }, { sort: '-created_date', limit: 20, cursor: pageParam }),
    getNextPageParam: (page) => page.has_more ? page.next_cursor : undefined,
  });
  const mutation = useMutation({
    mutationFn: ({ goal, progress, remove }) => remove ? base44.entities.StaffGoal.delete(goal.id) : base44.entities.StaffGoal.update(goal.id, { progress: Math.max(0, Math.min(100, progress)), status: progress >= 100 ? 'Achieved' : goal.status === 'Achieved' ? 'In Progress' : goal.status }),
    onSuccess: () => client.invalidateQueries({ queryKey: ['staff-goals'] }),
  });
  const goals = query.data?.pages.flatMap((page) => page.items) || [];
  const average = Math.round(summary.avg_progress || 0);
  return <Card className="min-w-0 rounded-xl border-border/70 shadow-sm"><CardContent className="space-y-3 p-2.5">
    <div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-2.5"><Users className="h-5 w-5 shrink-0 text-primary" /><div className="min-w-0"><h3 className="break-words text-sm font-bold">{goals[0]?.staff_name || summary.staff_email}</h3><p className="text-xs text-muted-foreground">{summary.count} goal{summary.count === 1 ? '' : 's'} · {achieved} achieved</p></div></div><Badge variant="outline">{average}% overall</Badge></div>
    <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${average}%` }} /></div>
    {query.isPending && <Loader2 className="mx-auto h-5 w-5 animate-spin text-primary" />}
    {query.isError && <p role="alert" className="text-sm text-destructive">{query.error.message}<Button variant="outline" size="sm" onClick={() => query.refetch()}>Try again</Button></p>}
    {mutation.isPending && <p role="status" className="text-xs text-muted-foreground">Saving changes...</p>}
    {mutation.isError && <p role="alert" className="text-sm text-destructive">{mutation.error.message}</p>}
    {goals.map((goal) => <div key={goal.id} className="space-y-1">
      {canEdit && <Button variant="outline" size="sm" disabled={mutation.isPending} onClick={() => setEditing(goal)}>Edit goal</Button>}
      <GoalProgressCard g={{ ...goal, admin_approved: true }} compact={!canEdit} notesContent={null} onProgress={(g, progress) => mutation.mutate({ goal: g, progress })} onDelete={(g) => { if (window.confirm('Delete this staff goal?')) mutation.mutate({ goal: g, remove: true }); }} />
    </div>)}
    {query.hasNextPage && <Button variant="outline" size="sm" disabled={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>{query.isFetchingNextPage ? 'Loading...' : 'Load more goals'}</Button>}
    {editing && <StaffGoalForm record={editing} onClose={() => setEditing(null)} />}
  </CardContent></Card>;
}