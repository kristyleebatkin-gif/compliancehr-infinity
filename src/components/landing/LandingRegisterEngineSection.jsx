import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, BookOpenCheck, Database, FileCheck2, FolderTree, Search,
  ShieldCheck, Sparkles, Waypoints,
} from 'lucide-react';
import Reveal from '@/components/landing/Reveal';
import LandingSectionHeader from '@/components/landing/LandingSectionHeader';

const HEADLINE_STATS = [
  { value: '45', label: 'Master registers', sub: 'Auto-maintained', accent: '#0072FF' },
  { value: '28', label: 'Record sources', sub: 'Forms, notes & audits', accent: '#5A00D6' },
  { value: '13', label: 'Extracted fields', sub: 'Per record', accent: '#FF2E9A' },
  { value: '5', label: 'Accuracy checks', sub: 'Enforced on entry', accent: '#0A2B6D' },
];

const ENGINE_STEPS = [
  { icon: Database, title: 'Capture', detail: 'Any record type is entered once by the team.' },
  { icon: Search, title: 'Extract', detail: 'Thirteen attributes read and normalised.' },
  { icon: FolderTree, title: 'Classify', detail: 'Subject, category and owner assigned.' },
  { icon: Waypoints, title: 'Route', detail: 'Pushed to every applicable register.' },
  { icon: ShieldCheck, title: 'Validate', detail: 'Five checks confirm accuracy on entry.' },
];

const REGISTERS = [
  'Participant Register',
  'Employee Register',
  'Risk Register',
  'Action Register',
  'Goal Register',
  'Outcome Register',
  'Shift Note Register',
  'Communication Register',
  'Document Register',
  'NDIS Evidence Register',
  'Executive Reporting',
];

export default function LandingRegisterEngineSection() {
  return (
    <section aria-label="Universal register engine" className="w-full">
      <div className="space-y-6 rounded-3xl border border-[#C084FC]/40 bg-white p-6 shadow-lg sm:p-8 lg:p-10">
        <LandingSectionHeader
          badge="Governance Engine"
          tone="pink"
          icon={BookOpenCheck}
          title="45 Master Registers That Maintain Themselves"
          description="One entry updates every register, profile, document hub and executive dashboard it belongs to — so evidence, indexing and reporting stay current without manual administration."
        />

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {HEADLINE_STATS.map((stat, idx) => (
            <Reveal
              key={stat.label}
              delay={idx * 0.05}
              className="relative overflow-hidden rounded-2xl border border-[#C084FC]/40 bg-white p-4 text-left shadow-sm"
            >
              <span
                className="absolute inset-x-0 top-0 h-1.5"
                style={{ background: `linear-gradient(90deg, ${stat.accent} 0%, #5A00D6 100%)` }}
              />
              <div className="font-editorial text-3xl font-extrabold leading-none text-[#0A2B6D] sm:text-4xl">
                {stat.value}
              </div>
              <div className="mt-2 text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                {stat.label}
              </div>
              <div className="mt-0.5 text-[11px] font-semibold text-[#0A2B6D]/60">{stat.sub}</div>
            </Reveal>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-7 rounded-2xl border border-[#C084FC]/40 bg-[#F5F0FF]/70 p-5 text-left">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#5A00D6]" />
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                Single Entry, Five Automatic Steps
              </h3>
            </div>
            <div className="mt-3.5 space-y-2">
              {ENGINE_STEPS.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.title}
                    className="flex items-center gap-3 rounded-xl border border-[#C084FC]/35 bg-white px-3 py-2.5"
                  >
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white shadow-sm"
                      style={{ background: 'linear-gradient(135deg, #0072FF 0%, #5A00D6 60%, #FF2E9A 100%)' }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-[#0A2B6D]">
                        {idx + 1}. {step.title}
                      </p>
                      <p className="text-[11.5px] font-medium leading-snug text-[#0A2B6D]/70">{step.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between gap-4 rounded-2xl border border-[#C084FC]/40 bg-white p-5 text-left">
            <div>
              <div className="flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-[#0072FF]" />
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                  Registers Updated Automatically
                </h3>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {REGISTERS.map((name) => (
                  <span
                    key={name}
                    className="rounded-lg border border-[#C084FC]/40 bg-[#F5F0FF] px-2.5 py-1 text-[11px] font-extrabold text-[#0A2B6D]"
                  >
                    {name}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-[11.5px] font-medium leading-relaxed text-[#0A2B6D]/70">
                Every record keeps its subject, category, owner, profile links and compliance mapping — so audit packs
                assemble themselves.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Link
                to="/registers"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0A2B6D] px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-[#0072FF]"
              >
                Open Registers Hub
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                to="/record-intelligence"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#0A2B6D] bg-white px-4 py-2.5 text-xs font-extrabold text-[#0A2B6D] transition hover:bg-[#F5F0FF]"
              >
                Record Intelligence
                <ArrowRight className="h-3.5 w-3.5 text-[#5A00D6]" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}