import React from 'react';
import SectionCard from '@/components/SectionCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';

const DAY = 86400000;
const addMonths = (dateStr, months) => {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
};

// Individual (3-monthly) and home (monthly) risk assessment due tracking.
export default function AssessmentDuePanel({ risks, canEdit, onUpdate, onEdit }) {
  const today = new Date().toISOString().slice(0, 10);
  const scheduled = risks.filter((r) => r.assessment_type === 'Individual' || r.assessment_type === 'Home');

  const dueState = (r) => {
    if (!r.next_due_date) return { label: 'No due date', cls: 'bg-muted text-foreground/60' };
    const days = Math.floor((new Date(r.next_due_date) - new Date(today)) / DAY);
    if (days < 0) return { label: 'Overdue', cls: 'bg-danger/15 text-danger' };
    if (days <= 7) return { label: 'Due soon', cls: 'bg-warning/15 text-warning' };
    return { label: 'On track', cls: 'bg-safe/15 text-safe' };
  };

  const markAssessed = (r) => {
    const nextDue = addMonths(today, r.assessment_type === 'Home' ? 1 : 3);
    onUpdate(r, {
      last_assessed_date: today,
      next_due_date: nextDue,
      action_log: [`${today} | ${r.assessment_type} risk assessment completed; next due ${nextDue} (every ${r.assessment_type === 'Home' ? 'month' : '3 months'})`, r.action_log].filter(Boolean).join('\n'),
    });
  };

  return (
    <SectionCard collapsible title="Assessment due tracker" description="Individual risk assessments are due every 3 months and home risk assessments every month. Overdue assessments raise a reminder task automatically (daily automation).">
      {scheduled.length === 0 ? (
        <p className="text-sm text-muted-foreground">No scheduled assessments yet. Set an assessment schedule on a risk (edit a risk in the register) and it will appear here.</p>
      ) : (
        <div className="space-y-1.5">
          {scheduled.map((r) => {
            const state = dueState(r);
            return (
              <div key={r.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-border/60 px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="break-words text-sm font-semibold">{r.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {r.assessment_type} assessment · every {r.assessment_type === 'Home' ? 'month' : '3 months'} · last assessed {r.last_assessed_date || 'never'}
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px]">{r.assessment_type}</Badge>
                <span className="text-xs font-medium text-muted-foreground">Due {r.next_due_date || 'set date'}</span>
                <Badge variant="outline" className={`text-[10px] ${state.cls}`}>{state.label}</Badge>
                {canEdit && <div className="module-action-bar flex flex-wrap gap-1">
                  {onEdit && <Button size="sm" variant="outline" onClick={() => onEdit(r)}>Edit assessment</Button>}
                  <Button size="sm" variant="outline" onClick={() => markAssessed(r)}><CheckCircle2 className="h-3.5 w-3.5" />Mark assessed today</Button>
                </div>}
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}