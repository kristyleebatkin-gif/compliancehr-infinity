import React from 'react';
import { BookOpen, Layers } from 'lucide-react';
import { LMS_GROUPS, LMS_MODULES } from '@/lib/lmsCurriculum';
import trainingTones from '@/components/training/trainingTones';
import TrainingSubjectHeading from '@/components/training/TrainingSubjectHeading';

export default function TrainingCategoryFilter({ activeGroup, onChange }) {
  const categories = [{ name: 'All', label: 'All courses', color: 'brand', count: LMS_MODULES.length }, ...LMS_GROUPS.map((group) => ({ ...group, label: group.name, count: LMS_MODULES.filter((module) => module.group === group.name).length }))];
  return <section aria-label="Course categories">
    <TrainingSubjectHeading title="Course categories" group="brand" count={LMS_MODULES.length} />
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => {
        const tone = trainingTones(category.color);
        const active = activeGroup === category.name;
        const Icon = category.name === 'All' ? Layers : BookOpen;
        return <button key={category.name} type="button" aria-pressed={active} onClick={() => onChange(category.name)} className={`relative flex min-h-16 items-center gap-3 overflow-hidden rounded-xl border p-3 text-left transition-shadow hover:shadow-md ${tone.border} ${tone.surface} ${active ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}>
          <span className={`absolute inset-y-0 left-0 w-1 ${tone.rail}`} />
          <Icon className={`h-5 w-5 shrink-0 ${tone.text}`} />
          <span className="min-w-0 flex-1 font-heading text-xs font-bold leading-snug text-foreground">{category.label}</span>
          <span className={`shrink-0 rounded-lg border bg-card/80 px-2 py-1 text-center ${tone.border} ${tone.text}`}><span className="block text-sm font-extrabold">{category.count}</span><span className="block text-[9px] font-semibold uppercase tracking-wide">courses</span></span>
        </button>;
      })}
    </div>
  </section>;
}