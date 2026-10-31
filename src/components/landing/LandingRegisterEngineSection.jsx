import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, BookOpenCheck, Database, FileCheck2, FolderTree, Search,
  ShieldCheck, Sparkles, Waypoints,
} from 'lucide-react';
import Reveal from '@/components/landing/Reveal';
import LandingSectionHeader from '@/components/landing/LandingSectionHeader';

const HEADLINE_STATS = [
  { value: '45', label: 'Master registers', sub: 'Auto-maintained' },
  { value: '28', label: 'Record sources', sub: 'Forms, notes & audits' },
  { value: '13', label: 'Extracted fields', sub: 'Per record' },
  { value: '5', label: 'Accuracy checks', sub: 'Enforced on entry' },
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
      <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
        <LandingSectionHeader
          badge="Governance Engine"
          icon={BookOpenCheck}
          title="45 Master Registers That Maintain Themselves"
          description="One entry updates every register, profile, document hub and executive dashboard it belongs to — so evidence, indexing and reporting stay current without manual administration."
        />

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {HEADLINE_STATS.map((stat, idx) => (
            <Reveal
              key={stat.label}
              delay={idx * 0.05}
              className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/70 p-5 text-left"
            >
              <span className="absolute inset-x-0 top-0 h-1 bg-indigo-600" />
              <div className="text-3xl font-extrabold leading-none text-slate-900 sm:text-4xl">
                {stat.value}
              </div>
              <div className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-900">
                {stat.label}
              </div>
              <div className="mt-0.5 text-xs font-medium text-slate-500">{stat.sub}</div>
            </Reveal>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Single Entry, Five Automatic Steps
              </h3>
            </div>
            <div className="mt-3.5 space-y-2">
              {ENGINE_STEPS.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.title}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-2xs">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900">
                        {idx + 1}. {step.title}
                      </p>
                      <p className="text-xs font-medium leading-snug text-slate-600">{step.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left">
            <div>
              <div className="flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-indigo-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Registers Updated Automatically
                </h3>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {REGISTERS.map((name) => (
                  <span
                    key={name}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700"
                  >
                    {name}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs font-medium leading-relaxed text-slate-600">
                Every record keeps its subject, category, owner, profile links and compliance mapping — so audit packs assemble themselves.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Link
                to="/registers"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
              >
                Open Universal Register Hub
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                to="/record-intelligence"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 transition hover:bg-slate-50 hover:text-indigo-600"
              >
                Record Intelligence
                <ArrowRight className="h-3.5 w-3.5 text-indigo-600" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}