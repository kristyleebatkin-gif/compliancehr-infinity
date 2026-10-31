import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, ArrowRight, CalendarClock, FileCheck2, Fingerprint, Gauge,
  Layers, ScrollText, ShieldCheck, Sparkles, Users,
} from 'lucide-react';
import Reveal from '@/components/landing/Reveal';
import LandingSectionHeader from '@/components/landing/LandingSectionHeader';

const EVIDENCE_POINTS = [
  {
    step: '01',
    icon: Activity,
    label: 'What occurred',
    detail: 'Shift note, goal update or vehicle check captured in one pass.',
  },
  {
    step: '02',
    icon: CalendarClock,
    label: 'When it occurred',
    detail: 'Date and time stamped automatically against every record.',
  },
  {
    step: '03',
    icon: Fingerprint,
    label: 'Who completed it',
    detail: 'Verified staff identity, role and digital signature attached.',
  },
  {
    step: '04',
    icon: FileCheck2,
    label: 'What evidence exists',
    detail: 'Signed record, transcript and vault location filed together.',
  },
  {
    step: '05',
    icon: ShieldCheck,
    label: 'Standards supported',
    detail: 'Mapped to NDIS Practice Standards, Aged Care Standards and WHS.',
  },
];

const AUTO_ANSWERS = [
  { q: 'Where is this stored?', a: 'Profile, module, vault, safe and executive hub — at once.' },
  { q: 'Which module is this in?', a: 'Reachable from profiles, dashboards, search and tasks.' },
  { q: 'How do I find this?', a: 'Every record is two clicks away in global search.' },
  { q: 'What form do I use?', a: 'The right controlled form is selected and pre-filled.' },
  { q: 'What document do I need?', a: 'Evidence guidance attaches the required standard.' },
  { q: 'What do I do next?', a: 'The next action is always shown, never searched for.' },
];

const WORKSPACES = [
  { label: 'Participant', count: '7 panels', icon: Users },
  { label: 'Employee', count: '10 panels', icon: Activity },
  { label: 'Manager', count: '8 panels', icon: Gauge },
  { label: 'Compliance', count: '8 panels', icon: ShieldCheck },
  { label: 'Executive', count: '8 panels', icon: Layers },
];

export default function LandingEvidenceStandardSection() {
  return (
    <section aria-label="Evidence-first operating standard" className="w-full">
      <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
        <LandingSectionHeader
          badge="Platform Operating Standard"
          icon={Sparkles}
          title="Every Action Captures Audit Evidence Automatically"
          description="Evidence-first design means your team never completes a separate compliance step. Each action records what happened, when, by whom, what proof exists and which standard it satisfies."
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {EVIDENCE_POINTS.map((point, idx) => {
            const Icon = point.icon;
            return (
              <Reveal
                key={point.label}
                delay={idx * 0.05}
                className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-white hover:shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-2xs">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-lg font-extrabold tabular-nums text-indigo-600">
                      {point.step}
                    </span>
                  </div>
                  <h3 className="mt-3 text-sm font-bold leading-tight text-slate-900">{point.label}</h3>
                  <p className="mt-1.5 text-xs font-medium leading-relaxed text-slate-600">{point.detail}</p>
                </div>
              </Reveal>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left">
            <div className="flex items-center gap-2">
              <ScrollText className="h-4 w-4 text-indigo-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Six Questions Answered Before They Are Asked
              </h3>
            </div>
            <div className="mt-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {AUTO_ANSWERS.map((item) => (
                <div key={item.q} className="rounded-xl border border-slate-200 bg-white p-3.5">
                  <p className="text-xs font-bold text-slate-900">{item.q}</p>
                  <p className="mt-1 text-xs font-medium leading-relaxed text-slate-600">{item.a}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Five Personalised Workspaces
              </h3>
              <p className="mt-1.5 text-xs font-medium leading-relaxed text-slate-600">
                Each role opens straight into the panels that matter to them — no module hunting.
              </p>
              <div className="mt-3 space-y-2">
                {WORKSPACES.map((space) => {
                  const Icon = space.icon;
                  return (
                    <div
                      key={space.label}
                      className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                    >
                      <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-800">
                        <Icon className="h-3.5 w-3.5 text-indigo-600" />
                        {space.label}
                      </span>
                      <span className="text-xs font-semibold text-indigo-600">{space.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <Link
              to="/user-success"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
            >
              Explore Evidence &amp; User Success Hub
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}