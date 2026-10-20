import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { COMMON_PROBLEMS } from '@/lib/helpCentreExtras';
import { CheckCircle2, ChevronDown, Lightbulb } from 'lucide-react';

const TONES = [
  'from-sky-500 to-cyan-400',
  'from-violet-500 to-purple-400',
  'from-emerald-500 to-teal-400',
  'from-amber-500 to-orange-400',
  'from-fuchsia-500 to-pink-400',
  'from-rose-500 to-red-400',
];

export default function CommonProblems() {
  const [open, setOpen] = useState(null);

  return (
    <Card className="border-brand/30 shadow-panel">
      <CardContent className="p-2.5">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-brand/10 p-1"><Lightbulb className="h-3.5 w-3.5 text-brand" /></div>
          <p className="text-xs font-bold">The 10 most common problems — and how to fix them</p>
        </div>
        <p className="mt-1 text-[10px] leading-snug text-muted-foreground">Worked answers for the issues we see most often. Still stuck? The AI troubleshooter or Technical support tab is the next step.</p>
        <div className="mt-2 grid items-start gap-1.5 sm:grid-cols-2">
          {COMMON_PROBLEMS.map((p, i) => (
            <div key={p.problem} className="rounded-lg border border-border/60 bg-card px-2 py-1.5">
              <button className="flex w-full items-start gap-1.5 text-left" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-gradient-to-br ${TONES[i % TONES.length]} text-xs font-extrabold text-white shadow`}>{i + 1}</span>
                <p className="min-w-0 flex-1 text-[11px] font-semibold leading-snug">{p.problem}</p>
                <ChevronDown className={`h-4 w-4 shrink-0 text-foreground/40 transition-transform ${open === i ? 'rotate-180' : ''}`} />
              </button>
              {open === i && (
                <ul className="mt-1.5 space-y-1 border-t border-border/60 pt-1.5">
                  {p.fix.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs text-foreground/80">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />{f}
                    </li>
                  ))}
                </ul>
              )}
              <Badge variant="secondary" className="mt-0.5 ml-6 text-[9px] leading-3">{p.tag}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}