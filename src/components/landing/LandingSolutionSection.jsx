import React from 'react';
import { ArrowRight, BriefcaseBusiness, HeartHandshake, ShieldCheck, UsersRound } from 'lucide-react';

const AREAS = [
  { title: 'People and relationships', description: 'Organise staff, participant, contact, intake and consent information with clear ownership and access.', icon: UsersRound, topic: 'People and intake walkthrough' },
  { title: 'Service delivery and workforce', description: 'Connect schedules, frontline records, goals, tasks, programs and follow-up in the workday.', icon: HeartHandshake, topic: 'Service delivery walkthrough' },
  { title: 'Quality, risk and evidence', description: 'Keep reviews, incidents, controls, documents and improvement actions connected to their evidence.', icon: ShieldCheck, topic: 'Quality and evidence walkthrough' },
  { title: 'Business and governance', description: 'Bring finance, procurement, assets, projects and governance records into a structured workspace.', icon: BriefcaseBusiness, topic: 'Business and governance walkthrough' },
];

export default function LandingSolutionSection({ onBookDemo }) {
  return (
    <section id="solution" className="scroll-mt-24">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5A00D6]">Explore the platform</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-[#0A2B6D] sm:text-3xl">One connected workspace, organised around real work.</h2>
        <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-slate-600">Choose an area to see how its records, responsibilities and next steps fit together. Walkthroughs can be tailored to your organisation and service type.</p>
      </div>
      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        {AREAS.map(({title,description,icon:Icon,topic}) => (
          <article key={title} className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-[0_12px_36px_rgba(10,43,109,0.06)] backdrop-blur transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_18px_42px_rgba(10,43,109,0.10)]">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 text-[#0A2B6D]"><Icon aria-hidden="true" className="h-5 w-5" /></span>
            <h3 className="mt-4 text-lg font-bold text-[#0A2B6D]">{title}</h3>
            <p className="mt-2 min-h-[3rem] text-sm leading-6 text-slate-600">{description}</p>
            <button type="button" onClick={() => onBookDemo?.(topic)} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg px-3 font-bold text-[#0A54B8] hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">
              Request this walkthrough <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
