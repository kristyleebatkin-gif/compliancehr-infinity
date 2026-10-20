import React from 'react';
import { BookOpen } from 'lucide-react';
import trainingTones from '@/components/training/trainingTones';

export default function TrainingSubjectHeading({ title, count, group, icon: Icon = BookOpen }) {
  const tone = trainingTones(group);
  return <div className={`mb-3 flex min-w-0 items-center gap-3 rounded-xl border px-3 py-2.5 ${tone.border} ${tone.surface}`}>
    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-card ${tone.border} ${tone.text}`}><Icon className="h-4 w-4" /></span>
    <h2 className="min-w-0 flex-1 font-heading text-sm font-bold leading-snug tracking-tight text-foreground">{title}</h2>
    {count !== undefined && <span className={`shrink-0 rounded-full border bg-card px-2 py-1 text-[10px] font-bold ${tone.border} ${tone.text}`}>{count} modules</span>}
  </div>;
}