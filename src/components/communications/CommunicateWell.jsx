import React from 'react';
import { HeartHandshake, Check } from 'lucide-react';

const PRINCIPLES = [
  'Be clear and kind — say the important thing first, then the details.',
  'Listen fully before replying; one clarifying question can save a whole shift.',
  'Keep every note professional, factual and respectful of privacy.',
  'Recognise effort out loud — thank someone for their work today.',
];

// "Communicate Well": compact standing good-practice card.
export default function CommunicateWell() {
  return (
    <section className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-panel">
      <div className="comm-panel-bar relative flex items-center gap-2 px-2.5 py-1" style={{ background: 'var(--header-gradient)', color: '#fff' }}>
        <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/30">
          <HeartHandshake className="h-3 w-3 text-white" />
        </span>
        <div className="flex flex-wrap items-baseline gap-2">
          <h3 className="text-xs font-bold">Communicate Well</h3>
          <p className="text-[9px] font-semibold text-white/85">Four habits that keep the team connected</p>
        </div>
      </div>
      <ul className="grid grid-cols-1 gap-x-3 gap-y-0.5 p-1.5 sm:grid-cols-2">
        {PRINCIPLES.map((t) => (
          <li key={t} className="flex items-start gap-1.5 text-[10px] font-semibold leading-tight text-foreground/85">
            <Check className="mt-0.5 h-2.5 w-2.5 shrink-0 text-emerald-600" /> {t}
          </li>
        ))}
      </ul>
    </section>
  );
}