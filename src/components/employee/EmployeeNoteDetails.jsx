import React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useRole } from '@/lib/useRole';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { NOTE_TYPES, SHIFT_TYPES, NOTE_TIPS, EMPLOYEE_LOG_TYPES } from '@/lib/commTypes';
export default function EmployeeNoteDetails({ value, onChange, participantId, employeeLog }) {
  const { user } = useRole();
  const set = (field, content) => onChange({ ...value, [field]: content });
  const goals = useInfiniteQuery({ queryKey: ['employee-note-goals', user.id, participantId], enabled: !!participantId && !employeeLog, initialPageParam: null, queryFn: async ({ pageParam }) => (await base44.functions.invoke('employeeGoals', { action: 'list', participant_id: participantId, cursor: pageParam })).data, getNextPageParam: (page) => page.has_more ? page.next_cursor : undefined });
  const selectClass = 'h-9 w-full rounded-md border border-input bg-background px-3 text-sm';
  if (employeeLog) return <label className="block text-sm">Log category<select className={selectClass} value={value.log_type || 'General Administration'} onChange={(event) => set('log_type', event.target.value)}>{EMPLOYEE_LOG_TYPES.map((type) => <option key={type}>{type}</option>)}</select></label>;
  return <div className="grid gap-3 sm:grid-cols-2">
    <label className="text-sm">Note type<select className={selectClass} value={value.note_type || 'Shift Note'} onChange={(event) => set('note_type', event.target.value)}>{NOTE_TYPES.map((type) => <option key={type}>{type}</option>)}</select></label>
    <label className="text-sm">Shift type<select className={selectClass} value={value.shift_type || ''} onChange={(event) => set('shift_type', event.target.value)}><option value="">Select shift type</option>{SHIFT_TYPES.map((type) => <option key={type}>{type}</option>)}</select></label>
    <label className="text-sm">Travel (km)<Input type="number" min="0" max="100000" value={value.travel_km || ''} onChange={(event) => set('travel_km', event.target.value)} /></label>
    <label className="text-sm">Travel location<Input maxLength={500} value={value.travel_location || ''} onChange={(event) => set('travel_location', event.target.value)} /></label>
    <label className="text-sm">Medication supervised<select className={selectClass} value={value.medication_supervised || ''} onChange={(event) => set('medication_supervised', event.target.value)}><option value="">Select</option><option>Yes</option><option>No</option></select></label>
    <label className="text-sm">Incident reference<Input maxLength={200} value={value.incident_report || ''} onChange={(event) => set('incident_report', event.target.value)} /></label>
    {participantId && <div className="sm:col-span-2"><label className="block text-sm">Relevant goal<select className={selectClass} value={value.goal_id || ''} onChange={(event) => set('goal_id', event.target.value)}><option value="">{goals.isPending ? 'Loading goals…' : 'No goal selected'}</option>{goals.data?.pages.flatMap((page) => page.items).map((goal) => <option key={goal.id} value={goal.id}>{goal.goal}</option>)}</select></label>{goals.isError && <p role="alert" className="text-xs text-destructive">{goals.error.message}<Button type="button" variant="outline" onClick={() => goals.refetch()}>Retry</Button></p>}{goals.hasNextPage && <Button type="button" variant="outline" disabled={goals.isFetchingNextPage} onClick={() => goals.fetchNextPage()}>Load more goals</Button>}</div>}
    <label className="text-sm sm:col-span-2">Issues or concerns<Textarea maxLength={3000} value={value.issues_concerns || ''} onChange={(event) => set('issues_concerns', event.target.value)} /></label>
    <p className="text-xs text-muted-foreground sm:col-span-2">{NOTE_TIPS[value.note_type || 'Shift Note']}</p>
  </div>;
}