import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, ArrowRight, CalendarClock, FileCheck2, Fingerprint, Gauge,
  Layers, ShieldCheck, Sparkles, Users,
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
      <div className="enterprise-surface rounded-2xl p-3.5 sm:p-4 space-y-3">
        <LandingSectionHeader
          badge="Evidence-First Operating Standard"
          tone="purple"
          icon={Sparkles}
          title="Every Operational Action Captures Audit Evidence Automatically"
          description="Your workforce never completes a separate compliance step — each operational entry records what occurred, when, by whom, what proof exists, and which regulatory standard it satisfies."
          rightTag="5-Step Automated Evidence Chain"
        />

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
          {EVIDENCE_POINTS.map((point, idx) => {
            const Icon = point.icon;
            return (
              <Reveal
                key={point.label}
                delay={idx * 0.03}
                className="flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-[#0072FF]"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs sm:text-sm font-black leading-snug text-[#0A2B6D]">
                      {point.label}
                    </h3>
                    <div
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white"
                      style={{
                        backgroundColor: point.accent,
                        boxShadow: '0 0 8px 1px rgba(255,255,255,0.85)',
                      }}
                    >
                      <Icon className="h-3.5 w-3.5 text-white" style={{ filter: 'drop-shadow(0 0 3px #FFFFFF)' }} />
                    </div>
                  </div>
                  <p className="mt-1 text-xs font-medium leading-snug text-[#0A2B6D]/80">
                    {point.detail}
                  </p>
                  <div className="mt-1.5 text-[10px] font-extrabold uppercase tracking-wider" style={{ color: point.accent }}>
                    STEP {point.step}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          <div className="lg:col-span-8 rounded-xl border border-slate-200 bg-[#F8FAFC] p-3 text-left space-y-2">
            <div className="border-b border-slate-200 pb-1.5">
              <h3 className="text-sm sm:text-base font-black text-[#0A2B6D]">
                Six Audit &amp; Governance Questions Answered at Point of Entry
              </h3>
              <p className="text-xs font-semibold text-[#0A2B6D]/80">
                Every operational submission is indexed across Person Profiles, Master Registers, and the Document Vault simultaneously.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {AUTO_ANSWERS.map((item) => (
                <div key={item.q} className="rounded-lg border border-slate-200 bg-white p-2.5">
                  <p className="text-xs font-extrabold text-[#0A2B6D]">{item.q}</p>
                  <p className="mt-0.5 text-[11px] font-medium leading-snug text-[#0A2B6D]/80">{item.a}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col justify-between gap-2.5 rounded-xl border border-slate-200 bg-white p-3 text-left">
            <div>
              <h3 className="text-sm sm:text-base font-black text-[#0A2B6D]">
                Role-Scoped Workspaces
              </h3>
              <p className="mt-0.5 text-xs font-semibold leading-snug text-[#0A2B6D]/80">
                Each role logs directly into the governance panels and registers scoped to their authority level.
              </p>
              <div className="mt-2 space-y-1.5">
                {WORKSPACES.map((space) => {
                  const Icon = space.icon;
                  return (
                    <div
                      key={space.label}
                      className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-[#F8FAFC] px-2.5 py-1.5"
                    >
                      <span className="inline-flex items-center gap-2 text-xs font-bold text-[#0A2B6D]">
                        <span
                          className="flex h-5 w-5 items-center justify-center rounded bg-[#0A2B6D]"
                          style={{ boxShadow: '0 0 6px rgba(255,255,255,0.85)' }}
                        >
                          <Icon className="h-3 w-3 text-white" />
                        </span>
                        <span>{space.label}</span>
                      </span>
                      <span className="text-[11px] font-extrabold text-[#5A00D6]">{space.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <Link
              to="/user-success"
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-[#0A2B6D] px-3 text-xs font-extrabold text-white transition hover:bg-[#0072FF]"
            >
              <span>Explore User Success &amp; Evidence Hub</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}