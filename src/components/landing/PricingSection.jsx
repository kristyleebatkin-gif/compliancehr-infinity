import React from 'react';
import { ArrowRight, BadgeCheck, Building2, UsersRound } from 'lucide-react';

const QUOTE_PATHS = [
  { title: 'Small team', detail: 'A focused walkthrough of core people, tasks, service and compliance workflows.', icon: UsersRound, topic: 'Quote for a small team' },
  { title: 'Growing provider', detail: 'Review multiple service lines, workforce needs, integrations and onboarding.', icon: Building2, topic: 'Quote for a growing provider' },
  { title: 'Multi-site organisation', detail: 'Scope governance, locations, access, implementation and ongoing support.', icon: BadgeCheck, topic: 'Quote for a multi-site organisation' },
];

export default function PricingSection({ onContactSales }) {
  return (
    <section id="pricing" className="scroll-mt-24 rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-purple-50 p-5 sm:p-8">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5A00D6]">Pricing and scope</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-[#0A2B6D] sm:text-3xl">A clear quote, based on what your organisation needs.</h2>
        <p className="mt-3 text-base leading-7 text-slate-600">Pricing depends on organisation size, locations, selected modules, onboarding, integrations and support. Request a written, itemised quote that states AUD, GST, billing term, included services, usage limits and any optional costs before you decide.</p>
      </div>
      <div className="mt-7 grid gap-4 md:grid-cols-3">
        {QUOTE_PATHS.map(({title,detail,icon:Icon,topic}) => (
          <article key={title} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Icon aria-hidden="true" className="h-6 w-6 text-[#5A00D6]" />
            <h3 className="mt-3 text-lg font-bold text-[#0A2B6D]">{title}</h3>
            <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{detail}</p>
            <button type="button" onClick={() => onContactSales?.(topic)} className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0A2B6D] px-4 py-3 font-semibold text-white hover:bg-[#17418E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">
              Request an itemised quote <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
