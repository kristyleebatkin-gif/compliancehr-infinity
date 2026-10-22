import React from 'react';
import { HeartHandshake, Check } from 'lucide-react';

const PRINCIPLES = [
  'Be clear and kind — say the important thing first, then the details.',
  'Listen fully before replying; one clarifying question can save a whole shift.',
  'Keep every note professional, factual and respectful of privacy.',
  'Recognise effort out loud — thank someone for their work today.',
];

// "Communicate Well": the Communication Centre's standing good-practice card.
export default function CommunicateWell() {
  return (
    <section className="overflow-hidden rounded-2xl border-2 border-black bg-white shadow-lg">
      <div className="flex items-center gap-2 px-2.5 py-1.5" style={{ background: 'var(--header-gradient)', color: '#fff' }}>
        <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/30">
          <HeartHandshake className="h-4 w-4 text-white" />
        </span>
        <div>
          <h3 className="text-sm font-bold">Communicate Well</h3>
          <p className="text-[10px] font-semibold text-white/85">Four habits that keep the team connected</p>
        </div>
      </div>
      <ul className="space-y-1 p-2">
        {PRINCIPLES.map((t) => (
          <li key={t} className="flex items-start gap-2 text-[11px] font-semibold text-foreground/85">
            <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" /> {t}
          </li>
        ))}
      </ul>
    </section>
  );
}