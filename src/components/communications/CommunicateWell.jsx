import React from 'react';
import { HeartHandshake, Check } from 'lucide-react';

const PRINCIPLES = [
  'Be clear and kind — say the important thing first, then the details.',
  'Listen fully before replying; one clarifying question can save a whole shift.',
  'Keep every note professional, factual and respectful of privacy.',
  'Recognise effort out loud — thank someone for their work today.',
];

// "Communicate Well": standing good-practice card with dark blue top bar.
export default function CommunicateWell() {
  return (
    <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-panel">
      <div className="comm-panel-bar relative flex items-center gap-2.5 px-4 py-2.5" style={{ '--comm-bar-bg': 'linear-gradient(120deg, #1e3a8a 0%, #1d4ed8 55%, #1e40af 100%)', color: '#fff' }}>
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/30">
          <HeartHandshake className="h-4 w-4 text-white" />
        </span>
        <div className="flex flex-wrap items-baseline gap-2">
          <h3 className="text-base font-bold">Communicate Well</h3>
          <p className="text-xs font-semibold text-white/90">Four habits that keep the team connected</p>
        </div>
      </div>
      <ul className="grid grid-cols-1 gap-x-4 gap-y-2 p-3.5 sm:grid-cols-2">
        {PRINCIPLES.map((t) => (
          <li key={t} className="flex items-start gap-2 text-xs sm:text-sm font-semibold leading-snug text-foreground/90">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" /> {t}
          </li>
        ))}
      </ul>
    </section>
  );
}