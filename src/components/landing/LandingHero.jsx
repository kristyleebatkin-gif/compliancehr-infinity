import React from 'react';
import { ArrowRight, Building2, CheckCircle2 } from 'lucide-react';
import HeroDashboardMockup from '@/components/landing/HeroDashboardMockup';

const AUDIENCES = [
  { label: 'NDIS providers', topic: 'NDIS provider walkthrough' },
  { label: 'Aged care teams', topic: 'Aged care walkthrough' },
  { label: 'Allied health', topic: 'Allied health walkthrough' },
];

export default function LandingHero({ onBookDemo }) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-gradient-to-br from-[#071D4B] via-[#0A2B6D] to-[#34216F] p-5 text-white shadow-[0_24px_70px_rgba(10,43,109,0.22)] sm:p-8 lg:p-10">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#0072FF]/20 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-[#FF2E9A]/15 blur-3xl" />
      <div className="relative grid items-center gap-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-10">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100 backdrop-blur">
            <Building2 aria-hidden="true" className="h-4 w-4" />
            For Australian human services organisations
          </div>
          <h1 className="mt-5 max-w-2xl text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">Bring compliance, workforce and service delivery into clearer view.</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-blue-50/90 sm:text-lg">ComplianceHR Infinity helps teams organise responsibilities, records and follow-up across everyday operations, quality and governance.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => onBookDemo?.('Tailored platform walkthrough')} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-[#0A2B6D] shadow-lg transition hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              Book a tailored walkthrough <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </button>
            <a href="#solution" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/30 bg-white/5 px-5 py-3 font-semibold text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Explore platform areas</a>
          </div>
          <div className="mt-7 flex flex-wrap gap-2" aria-label="Choose an industry-specific walkthrough">
            {AUDIENCES.map((audience) => (
              <button key={audience.label} type="button" onClick={() => onBookDemo?.(audience.topic)} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-blue-50 backdrop-blur transition hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                <CheckCircle2 aria-hidden="true" className="h-4 w-4 text-[#70D7FF]" />{audience.label}
              </button>
            ))}
          </div>
        </div>
        <HeroDashboardMockup />
      </div>
    </section>
  );
}
