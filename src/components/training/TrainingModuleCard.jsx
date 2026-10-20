import React from 'react';
import { BookOpen, Clock, Award, Play } from 'lucide-react';
import trainingTones from '@/components/training/trainingTones';

const BADGES = {
  'Not Started': ['bg-muted text-muted-foreground', 'Not started'],
  Current: ['bg-safe/10 text-safe', 'Current'],
  'Expiring Soon': ['bg-warning/10 text-warning', 'Expiring soon'],
  Expired: ['bg-danger/10 text-danger', 'Expired'],
};

export default function TrainingModuleCard({ module, status, completion, onOpen, readOnly = false }) {
  const [badgeClass, badgeLabel] = BADGES[status] || BADGES['Not Started'];
  const tone = trainingTones(module.group);
  return <article className={`relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border bg-card shadow-sm ${tone.border}`}>
    <div className={`h-1 w-full ${tone.rail}`} />
    <div className={`flex items-center justify-between gap-2 border-b px-4 py-3 ${tone.border} ${tone.surface}`}>
      <span className={`flex items-center gap-2 text-xs font-bold ${tone.text}`}><span className={`flex h-8 w-8 items-center justify-center rounded-lg border bg-card ${tone.border}`}><BookOpen className="h-4 w-4" /></span>Module {String(module.number).padStart(2, '0')}</span>
      <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${badgeClass}`}>{badgeLabel}</span>
    </div>
    <div className="flex flex-1 flex-col p-4">
      <p className={`text-[10px] font-bold uppercase tracking-wider ${tone.text}`}>{module.group}</p>
      <h3 className="mt-2 break-words font-heading text-base font-extrabold leading-snug tracking-tight text-foreground">{module.title}</h3>
      <p className="mb-4 mt-2 text-xs leading-relaxed text-muted-foreground">{module.description}</p>
      <div className="mt-auto space-y-3">
        <div className="flex flex-wrap gap-x-3 gap-y-1 border-t border-border pt-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{module.duration_hours}h</span>
          <span className="flex items-center gap-1"><Award className="h-3 w-3" />Valid {module.validity_months}m</span>
          {completion?.expiry_date && <span>Expires {completion.expiry_date}</span>}
        </div>
        <button onClick={onOpen} disabled={readOnly} className={`flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold hover:brightness-95 disabled:opacity-50 ${tone.border} ${tone.surface} ${tone.text}`}><Play className="h-3.5 w-3.5" />{readOnly ? 'Learner access only' : 'Open Module'}</button>
      </div>
    </div>
  </article>;
}