import React from 'react';
import { BookOpen, Clock, Award, Play } from 'lucide-react';

const BADGES = {
  'Not Started': ['bg-muted text-muted-foreground', 'Not started'],
  Current: ['bg-safe/10 text-safe', 'Current'],
  'Expiring Soon': ['bg-warning/10 text-warning', 'Expiring soon'],
  Expired: ['bg-danger/10 text-danger', 'Expired'],
};

export default function TrainingModuleCard({ module, status, completion, onOpen, readOnly = false }) {
  const [badgeClass, badgeLabel] = BADGES[status] || BADGES['Not Started'];
  return <article className="flex h-full min-w-0 flex-col rounded-xl border border-border bg-card shadow-sm">
    <div className="flex items-center justify-between gap-2 border-b border-border bg-primary/5 px-4 py-3">
      <span className="flex items-center gap-2 text-xs font-bold text-primary"><BookOpen className="h-4 w-4" />Module {String(module.number).padStart(2, '0')}</span>
      <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${badgeClass}`}>{badgeLabel}</span>
    </div>
    <div className="flex flex-1 flex-col p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">{module.group}</p>
      <h3 className="mt-1.5 break-words text-base font-semibold leading-snug">{module.title}</h3>
      <p className="mb-4 mt-2 text-xs leading-relaxed text-muted-foreground">{module.description}</p>
      <div className="mt-auto space-y-3">
        <div className="flex flex-wrap gap-x-3 gap-y-1 border-t border-border pt-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{module.duration_hours}h</span>
          <span className="flex items-center gap-1"><Award className="h-3 w-3" />Valid {module.validity_months}m</span>
          {completion?.expiry_date && <span>Expires {completion.expiry_date}</span>}
        </div>
        <button onClick={onOpen} disabled={readOnly} className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/15 disabled:opacity-50"><Play className="h-3.5 w-3.5" />{readOnly ? 'Learner access only' : 'Open Module'}</button>
      </div>
    </div>
  </article>;
}