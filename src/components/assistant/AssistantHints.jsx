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
    <div className="rounded-lg border border-ai-hint-foreground/20 bg-ai-hint px-2.5 py-1.5">
      <p className="flex items-center gap-1.5 text-[11px] font-bold text-ai-hint-foreground"><Lightbulb className="h-3.5 w-3.5 text-ai-hint-foreground" />Hints &amp; tips for using the AI assistants</p>
      <ul className="mt-1 grid gap-x-2 gap-y-0.5 text-[10px] leading-snug text-ai-hint-foreground sm:grid-cols-2">
        {HINTS.map((hint) => <li key={hint} className="flex items-start gap-1.5"><Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-ai-hint-foreground" />{hint}</li>)}
      </ul>
    </div>
  );
}