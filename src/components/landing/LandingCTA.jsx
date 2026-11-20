import React from 'react';
import { ArrowRight, CalendarDays } from 'lucide-react';

export default function LandingCTA({ onBookDemo }) {
  return (
    <section id="final-cta" className="scroll-mt-24 overflow-hidden rounded-3xl bg-gradient-to-br from-[#071D4B] via-[#0A2B6D] to-[#34216F] p-6 text-white shadow-[0_24px_70px_rgba(10,43,109,0.18)] sm:p-9">
      <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-200">See your workflows in context</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Bring your priorities. Leave with a clearer picture.</h2>
          <p className="mt-3 text-sm leading-6 text-blue-50/90 sm:text-base">Tell us your service type, team size and the work you want to improve. We’ll tailor the walkthrough around those needs.</p>
        </div>
        <button type="button" onClick={() => onBookDemo?.('Tailored organisation walkthrough')} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-[#0A2B6D] hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
          <CalendarDays aria-hidden="true" className="h-4 w-4" /> Book a tailored walkthrough <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
