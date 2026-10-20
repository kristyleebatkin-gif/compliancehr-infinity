import React from 'react';
import { CheckCircle2, BookOpen, ClipboardCheck, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TrainingSubjectHeading from '@/components/training/TrainingSubjectHeading';
import trainingTones from '@/components/training/trainingTones';

export default function LearnerOverview({ module, onStart }) {
  const tone = trainingTones(module.group);
  return <div className="space-y-5">
    <div className={`rounded-xl border p-4 ${tone.border} ${tone.surface}`}>
      <TrainingSubjectHeading title="About this module" group={module.group} />
      <p className="text-sm leading-relaxed text-foreground">{module.description}</p>
    </div>
    <div className="grid grid-cols-3 divide-x divide-border rounded-xl border border-border bg-card text-center">
      {[[BookOpen, `${module.duration_hours}h`, 'Duration'], [Award, `${module.validity_months} months`, 'Certificate validity'], [ClipboardCheck, `${module.pass_mark || 80}%`, 'Pass mark']].map(([Icon, value, label]) => <div key={label} className="min-w-0 px-2 py-3"><Icon className="mx-auto mb-1 h-4 w-4 text-primary" /><p className="text-sm font-bold">{value}</p><p className="mt-1 text-[10px] text-muted-foreground">{label}</p></div>)}
    </div>
    <div className="grid gap-4 sm:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <section className="rounded-xl border border-border p-4">
        <TrainingSubjectHeading title="Learning objectives" group="safe" icon={CheckCircle2} />
        <ul className="space-y-3">{module.objectives.map((objective, index) => <li key={index} className="flex items-start gap-2 text-sm leading-relaxed text-foreground"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-safe" /><span>{objective}</span></li>)}</ul>
      </section>
      <section className="rounded-xl border border-border bg-muted/20 p-4">
        <TrainingSubjectHeading title="Module components" group="teal" icon={ClipboardCheck} />
        <ul className="space-y-2">{module.components.map((component) => <li key={component} className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />{component}</li>)}</ul>
      </section>
    </div>
    <Button variant="outline" className="w-full" onClick={onStart}><BookOpen className="h-4 w-4" />Start Learner Guide</Button>
  </div>;
}