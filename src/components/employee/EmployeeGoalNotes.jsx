import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import GoalNotes from '@/components/goals/GoalNotes';

export default function EmployeeGoalNotes({ goal, participantId }) {
  const api = useMemo(() => ({
    filter: async () => (await base44.functions.invoke('employeeGoals', { action: 'notesList', participant_id: participantId, goal_id: goal.id })).data,
    create: async (values) => (await base44.functions.invoke('employeeGoals', { action: 'notesCreate', participant_id: participantId, goal_id: goal.id, values })).data.note,
  }), [goal.id, participantId]);
  return <GoalNotes goal={goal} participantName={goal.participant_name} api={api} />;
}