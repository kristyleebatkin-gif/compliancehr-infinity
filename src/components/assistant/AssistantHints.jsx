import React from 'react';
import { Lightbulb, Sparkles } from 'lucide-react';

const HINTS = [
  'Name the module or register in your question, e.g. "in the Incident Clinic...".',
  'Be specific: give dates, names, statuses or amounts to narrow the answer.',
  'Ask follow-up questions to drill down - the assistant remembers the chat.',
  'Ask for the format you want: a summary, a list, a checklist or a draft message.',
  'Numbers are read live from your registers, so newly saved records appear straight away.',
  'The assistants can read and explain - they do not change records or send anything without you.',
];

export default function AssistantHints() {
  return (
    <div className="rounded-xl border border-chart-5/25 bg-chart-5/10 px-3 py-2">
      <p className="flex items-center gap-1.5 text-xs font-bold text-foreground"><Lightbulb className="h-3.5 w-3.5 text-chart-5" />Hints &amp; tips for using the AI assistants</p>
      <ul className="mt-1 grid gap-x-3 gap-y-1 text-[11px] leading-4 text-foreground/75 sm:grid-cols-2">
        {HINTS.map((hint) => <li key={hint} className="flex items-start gap-1.5"><Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-chart-5" />{hint}</li>)}
      </ul>
    </div>
  );
}