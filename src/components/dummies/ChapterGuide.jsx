import React, { useState } from 'react';
import { NDIS_CHAPTERS } from '@/lib/ndisDummiesData';
import { Lightbulb, CheckCircle2 } from 'lucide-react';

export default function ChapterGuide() {
  const [selectedId, setSelectedId] = useState(NDIS_CHAPTERS[0].id);
  const current = NDIS_CHAPTERS.find((c) => c.id === selectedId) || NDIS_CHAPTERS[0];

  return (
    <div className="grid gap-6 md:grid-cols-12">
      <aside className="space-y-2 md:col-span-4">
        <p className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
          Pick a Chapter
        </p>
        {NDIS_CHAPTERS.map((ch) => {
          const active = ch.id === current.id;
          return (
            <button
              key={ch.id}
              onClick={() => setSelectedId(ch.id)}
              className={`w-full rounded-xl border-2 p-3 text-left transition ${
                active
                  ? 'border-foreground bg-primary text-primary-foreground shadow-sm'
                  : 'border-border bg-card text-foreground hover:border-foreground'
              }`}
            >
              <span className="text-xs font-extrabold uppercase opacity-80">
                Chapter {ch.number} · {ch.tag}
              </span>
              <p className="mt-0.5 text-sm font-extrabold">{ch.title}</p>
            </button>
          );
        })}
      </aside>

      <section className="rounded-2xl border-2 border-foreground bg-card p-6 shadow-sm md:col-span-8">
        <span className="inline-block rounded-md bg-secondary px-2.5 py-1 text-xs font-extrabold uppercase text-foreground">
          Chapter {current.number} · {current.tag}
        </span>
        <h2 className="mt-2 text-2xl font-black text-foreground">{current.title}</h2>
        <p className="mt-3 text-sm font-medium leading-relaxed text-foreground">
          {current.summary}
        </p>

        <div className="mt-5 space-y-2.5">
          <p className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
            Key Takeaways
          </p>
          {current.keyPoints.map((pt, idx) => (
            <div key={idx} className="flex items-start gap-2.5 rounded-xl bg-secondary p-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span className="text-sm font-semibold text-foreground">{pt}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-xl border-2 border-foreground bg-accent p-4">
          <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-xs font-extrabold uppercase text-foreground">Dummies Tip</p>
            <p className="mt-0.5 text-sm font-semibold text-foreground">{current.tip}</p>
          </div>
        </div>
      </section>
    </div>
  );
}