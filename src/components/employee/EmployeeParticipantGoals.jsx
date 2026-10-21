import React, { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useRole } from '@/lib/useRole';
import { Button } from '@/components/ui/button';
import EmployeeParticipantSelect from '@/components/employee/EmployeeParticipantSelect';
import EmployeeGoalForm from '@/components/employee/EmployeeGoalForm';
import EmployeeGoalNotes from '@/components/employee/EmployeeGoalNotes';
import GoalProgressCard from '@/components/goals/GoalProgressCard';

export default function EmployeeParticipantGoals() {
  const { user } = useRole();
  const [participantId, setParticipantId] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const query = useInfiniteQuery({ queryKey: ['employee-participant-goals', user?.id, participantId], enabled: !!participantId, initialPageParam: null,
    queryFn: async ({ pageParam }) => (await base44.functions.invoke('employeeGoals', { action: 'list', participant_id: participantId, cursor: pageParam })).data,
    getNextPageParam: (page) => page.has_more ? page.next_cursor : undefined,
  });
  const progress = async (goal, value) => {
    setError('');
    try { await base44.functions.invoke('employeeGoals', { action: 'progress', participant_id: participantId, goal_id: goal.id, values: { progress: value } }); await query.refetch(); }
    catch (failure) { setError(failure.message); }
  };
  const goals = query.data?.pages.flatMap((page) => page.items || []) || [];
  return <section className="space-y-4">
    <EmployeeParticipantSelect value={participantId} onChange={(value) => { setParticipantId(value); setAdding(false); setError(''); }} />
    {!participantId ? <p className="text-sm text-muted-foreground">Select any approved participant to view and add goals and progress entries.</p> : <>
      <Button variant="outline" onClick={() => setAdding(!adding)}>{adding ? 'Close goal form' : 'Add participant goal'}</Button>
      {adding && <EmployeeGoalForm key={participantId} participantId={participantId} onSaved={async () => { setAdding(false); await query.refetch(); }} />}
      {error && <p role="alert" className="text-destructive">{error}</p>}
      {query.isPending ? <p role="status">Loading goals…</p> : query.isError ? <p role="alert" className="text-destructive">{query.error.message}<Button variant="outline" onClick={() => query.refetch()}>Retry</Button></p> : !goals.length ? <p className="text-muted-foreground">No goals recorded for this participant.</p> : goals.map((goal) => <GoalProgressCard key={goal.id} g={goal} onProgress={progress} notesContent={<EmployeeGoalNotes goal={goal} participantId={participantId} />} />)}
      {query.hasNextPage && <Button variant="outline" disabled={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>Load more goals</Button>}
    </>}
  </section>;
}