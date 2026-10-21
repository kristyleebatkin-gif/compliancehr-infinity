import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import GoalNotes from '@/components/goals/GoalNotes';

export default function EmployeeGoalNotes({ goal, participantId }) {
  const api = useMemo(() => ({
    filter: async (_query, options = {}) => (await base44.functions.invoke('employeeGoals', { action: 'notesList', participant_id: participantId, goal_id: goal.id, cursor: options.cursor })).data,
    count: async () => (await base44.functions.invoke('employeeGoals', { action: 'notesCount', participant_id: participantId, goal_id: goal.id })).data.count,
    create: async (values) => (await base44.functions.invoke('employeeGoals', { action: 'notesCreate', participant_id: participantId, goal_id: goal.id, values })).data.note,
  }), [goal.id, participantId]);
  return <GoalNotes goal={goal} participantName={goal.participant_name} api={api} />;
}