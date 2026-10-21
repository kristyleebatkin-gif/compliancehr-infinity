import React, { useId } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

export default function JourneyMilestone({ milestone, index, change, remove, children, readOnly = false }) {
  const id = useId();
  const field = (key, label, type = 'text') => <label className="min-w-0 space-y-1 text-[11px]" htmlFor={`${id}-${key}`}>{label}<Input disabled={readOnly} id={`${id}-${key}`} type={type} className="h-8 text-xs md:text-xs" maxLength={500} value={milestone[key] || ''} onChange={(event) => change(key, event.target.value)} /></label>;
  return <fieldset className="min-w-0 space-y-2 rounded-lg border border-border p-2">
    <legend className="px-1 text-xs font-semibold">Milestone {index + 1} · {milestone.type || 'Step'}</legend>
    <div className="grid min-w-0 gap-2 sm:grid-cols-2">
      <label className="space-y-1 text-[11px]" htmlFor={`${id}-type`}>Milestone type<select disabled={readOnly} id={`${id}-type`} className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs" value={milestone.type} onChange={(event) => change('type', event.target.value)}>{['Intake', 'Induction', 'Buddy shift', 'Training', 'More buddy shift', 'Performance appraisal', 'Other'].map((type) => <option key={type}>{type}</option>)}</select></label>
      {field('title', 'Activity / topic')}
      {field('planned_date', 'Scheduled / due date', 'date')}
      {field('completed_date', 'Completed date', 'date')}
      {field('next_due_date', 'Next due / renewal date', 'date')}
      {field('responsible', 'Buddy / trainer / reviewer')}
      <label className="space-y-1 text-[11px] sm:col-span-2" htmlFor={`${id}-notes`}>Comments<Textarea disabled={readOnly} id={`${id}-notes`} rows={2} maxLength={4000} className="min-h-12 text-xs md:text-xs" value={milestone.notes || ''} onChange={(event) => change('notes', event.target.value)} /></label>
      <label className="space-y-1 text-[11px] sm:col-span-2" htmlFor={`${id}-report`}>Report<Textarea disabled={readOnly} id={`${id}-report`} rows={2} maxLength={4000} className="min-h-12 text-xs md:text-xs" value={milestone.report || ''} onChange={(event) => change('report', event.target.value)} /></label>
    </div>
    {children}
    {!readOnly && <Button type="button" size="sm" variant="ghost" onClick={remove} aria-label={`Remove milestone ${index + 1}`}><Trash2 className="h-3 w-3" />Remove milestone</Button>}
  </fieldset>;
}