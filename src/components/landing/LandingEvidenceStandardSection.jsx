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
    label: 'What Occurred',
    detail: 'Shift note, goal update, or vehicle inspection captured in a single structured pass.',
    accent: '#0072FF',
  },
  {
    step: '02',
    icon: CalendarClock,
    label: 'When It Occurred',
    detail: 'Immutable ISO date and time stamped automatically against every record.',
    accent: '#5A00D6',
  },
  {
    step: '03',
    icon: Fingerprint,
    label: 'Who Completed It',
    detail: 'Verified staff identity, role level, and digital signature permanently attached.',
    accent: '#FF2E9A',
  },
  {
    step: '04',
    icon: FileCheck2,
    label: 'What Evidence Exists',
    detail: 'Signed record, transcript, and encrypted vault URI indexed together.',
    accent: '#0A2B6D',
  },
  {
    step: '05',
    icon: ShieldCheck,
    label: 'Standards Satisfied',
    detail: 'Cross-mapped to NDIS Practice Standards, Aged Care Quality Standards, and WHS.',
    accent: '#0072FF',
  },
];

const AUTO_ANSWERS = [
  { q: 'Where is this stored?', a: 'Indexed simultaneously in the Person Profile, Module Register, Document Vault, and Executive Hub.' },
  { q: 'Which module governs this?', a: 'Accessible from 360° Profiles, Master Registers, Global Search, and Assigned Tasks.' },
  { q: 'How do auditors verify this?', a: 'Every record is retrievable in two clicks with full chain-of-custody metadata.' },
  { q: 'Which controlled form applies?', a: 'The appropriate version-controlled form is selected and pre-populated automatically.' },
  { q: 'Which standard does it satisfy?', a: 'Built-in compliance mapping links the entry to the relevant NDIS or Aged Care outcome.' },
  { q: 'What is the next required action?', a: 'Follow-up tasks, approvals, and statutory timers trigger automatically on save.' },
];

const WORKSPACES = [
  { label: 'Participant Workspace', count: '7 Panels', icon: Users },
  { label: 'Employee Workspace', count: '10 Panels', icon: Activity },
  { label: 'Operations & Manager', count: '8 Panels', icon: Gauge },
  { label: 'Compliance & Quality', count: '8 Panels', icon: ShieldCheck },
  { label: 'Executive & Board', count: '8 Panels', icon: Layers },
];

export default function LandingEvidenceStandardSection() {
  return (
    <section aria-label="Evidence-first operating standard" className="w-full">
      <div className="enterprise-surface rounded-2xl p-6 sm:p-8 lg:p-10 space-y-6">
        <LandingSectionHeader
          badge="Evidence-First Operating Standard"
          tone="purple"
          icon={Sparkles}
          title="Every Operational Action Captures Audit Evidence Automatically"
          description="Your workforce never completes a separate compliance step. Each operational entry records what occurred, when, by whom, what proof exists, and which regulatory standard it satisfies."
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {EVIDENCE_POINTS.map((point, idx) => {
            const Icon = point.icon;
            return (
              <Reveal
                key={point.label}
                delay={idx * 0.04}
                className="flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 text-left transition hover:border-[#0072FF]"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white"
                      style={{ backgroundColor: point.accent }}
                    >
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-editorial text-sm font-extrabold tabular-nums text-[#0A2B6D]/60">
                      STEP {point.step}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-extrabold leading-snug text-[#0A2B6D]">
                    {point.label}
                  </h3>
                  <p className="mt-2 text-sm font-normal leading-relaxed text-[#0A2B6D]/80">
                    {point.detail}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="lg:col-span-8 rounded-xl border border-slate-200 bg-[#F8FAFC] p-5 sm:p-6 text-left">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <ScrollText className="h-4 w-4 text-[#5A00D6]" />
              <h3 className="text-lg font-extrabold text-[#0A2B6D]">
                Six Audit &amp; Governance Questions Answered at Point of Entry
              </h3>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {AUTO_ANSWERS.map((item) => (
                <div key={item.q} className="rounded-lg border border-slate-200 bg-white p-3.5">
                  <p className="text-sm font-bold text-[#0A2B6D]">{item.q}</p>
                  <p className="mt-1 text-sm font-normal leading-relaxed text-[#0A2B6D]/75">{item.a}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:p-6 text-left">
            <div>
              <h3 className="text-lg font-extrabold text-[#0A2B6D]">
                Role-Scoped Workspaces
              </h3>
              <p className="mt-1.5 text-sm font-normal leading-relaxed text-[#0A2B6D]/75">
                Each role logs directly into the governance panels and registers scoped to their authority level.
              </p>
              <div className="mt-4 space-y-2">
                {WORKSPACES.map((space) => {
                  const Icon = space.icon;
                  return (
                    <div
                      key={space.label}
                      className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-[#F8FAFC] px-3.5 py-2.5"
                    >
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#0A2B6D]">
                        <Icon className="h-4 w-4 text-[#0072FF]" />
                        {space.label}
                      </span>
                      <span className="text-xs font-bold text-[#5A00D6]">{space.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <Link
              to="/user-success"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0A2B6D] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#0072FF]"
            >
              <span>Explore User Success &amp; Evidence Hub</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}