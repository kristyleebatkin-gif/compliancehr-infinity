import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, BookOpenCheck, Database, FileCheck2, FolderTree, Search,
  ShieldCheck, Waypoints,
} from 'lucide-react';
import Reveal from '@/components/landing/Reveal';

const HEADLINE_STATS = [
  { value: '45', label: 'Master Registers', sub: 'Self-maintaining across all modules', accent: '#0072FF' },
  { value: '28', label: 'Record Sources', sub: 'Intake, shift notes, forms & audits', accent: '#5A00D6' },
  { value: '13', label: 'Metadata Fields', sub: 'Normalised per governance record', accent: '#FF2E9A' },
  { value: '5', label: 'Integrity Checks', sub: 'Enforced automatically on save', accent: '#0A2B6D' },
];

const ENGINE_STEPS = [
  { icon: Database, title: 'Capture', detail: 'Frontline or administrative staff enter a record once.' },
  { icon: Search, title: 'Extract', detail: 'Thirteen governance and identity attributes are normalised.' },
  { icon: FolderTree, title: 'Classify', detail: 'Subject, regulatory standard, and record owner are assigned.' },
  { icon: Waypoints, title: 'Route', detail: 'Linked automatically to every applicable master register.' },
  { icon: ShieldCheck, title: 'Validate', detail: 'Five validation rules verify foreign-key and audit integrity.' },
];

const REGISTERS = [
  'Participant Register',
  'Employee Screening Register',
  'ISO 31000 Risk Register',
  'CAPA & Action Register',
  'Participant Goal Register',
  'Clinical Outcome Register',
  'Shift Handover Register',
  'Communication Log Register',
  'Controlled Document Register',
  'NDIS Evidence Register',
  'SIRS & Reportable Incident Register',
  'Executive Governance Register',
];

export default function LandingRegisterEngineSection() {
  return (
    <section aria-label="Universal register engine" className="w-full">
      <div className="enterprise-surface rounded-2xl p-3.5 sm:p-4 space-y-3">
        {/* Header First -> Sentence -> Blue/Purple Badge & Action Buttons After */}
        <div
          className="rounded-xl p-3.5 text-white shadow-md space-y-1.5"
          style={{
            background: 'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)',
          }}
        >
          <h2
            className="font-editorial text-lg sm:text-xl lg:text-2xl font-black tracking-tight text-white lg:whitespace-nowrap"
            style={{ color: '#FFFFFF' }}
          >
            45 Master Registers That Maintain Themselves
          </h2>

          <p className="text-xs sm:text-[13px] font-semibold leading-snug text-white/90">
            A single operational entry updates every register, 360° profile, document vault, and executive KPI it belongs to — eliminating duplicate data entry and manual spreadsheet reconciliation.
          </p>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-[#00C6FF]/40 bg-[#0072FF]/25 px-2.5 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wider text-[#00C6FF]">
              <span
                className="flex h-4 w-4 items-center justify-center rounded-full bg-white/15"
                style={{ boxShadow: '0 0 8px 1px rgba(255,255,255,0.9)' }}
              >
                <BookOpenCheck className="h-2.5 w-2.5 text-white" />
              </span>
              <span>Universal Register Engine</span>
            </span>

            <div className="flex flex-wrap items-center gap-1.5">
              <Link
                to="/registers"
                className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-[#00C6FF] px-3 text-[11px] font-extrabold text-black transition hover:opacity-95"
              >
                <span>Open 45 Master Registers</span>
                <ArrowRight className="h-3.5 w-3.5 text-black" />
              </Link>
              <Link
                to="/record-intelligence"
                className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-white/25 bg-white/10 px-3 text-[11px] font-extrabold text-white transition hover:bg-white/20"
              >
                <span>Record Intelligence</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#00C6FF]" />
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          {HEADLINE_STATS.map((stat, idx) => (
            <Reveal
              key={stat.label}
              delay={idx * 0.03}
              className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-3 text-left"
            >
              <span
                className="absolute inset-x-0 top-0 h-1"
                style={{ backgroundColor: stat.accent }}
              />
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-xs sm:text-sm font-black text-[#0A2B6D]">
                  {stat.label}
                </h3>
                <span className="font-editorial text-xl sm:text-2xl font-black leading-none" style={{ color: stat.accent }}>
                  {stat.value}
                </span>
              </div>
              <p className="mt-1 text-[11px] font-medium text-[#0A2B6D]/80">{stat.sub}</p>
            </Reveal>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-[#F8FAFC] p-3 text-left space-y-2">
            <div>
              <h3 className="text-sm sm:text-base font-black text-[#0A2B6D]">
                Five-Stage Automated Routing Pipeline
              </h3>
              <p className="text-xs font-semibold text-[#0A2B6D]/80">
                Every form submission, incident report, and shift note passes through a deterministic 5-stage governance pipeline.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {ENGINE_STEPS.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.title}
                    className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5"
                  >
                    <div
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#0A2B6D] text-white"
                      style={{ boxShadow: '0 0 6px rgba(255,255,255,0.85)' }}
                    >
                      <Icon className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-extrabold text-[#0A2B6D]">
                        {idx + 1}. {step.title}:
                      </span>{' '}
                      <span className="text-xs font-medium text-[#0A2B6D]/80">{step.detail}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col justify-between gap-2.5 rounded-xl border border-slate-200 bg-white p-3 text-left">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-md bg-[#0072FF]"
                  style={{ boxShadow: '0 0 6px rgba(255,255,255,0.85)' }}
                >
                  <FileCheck2 className="h-3.5 w-3.5 text-white" />
                </span>
                <h3 className="text-sm sm:text-base font-black text-[#0A2B6D]">
                  Core Statutory Registers
                </h3>
              </div>
              <p className="mt-0.5 text-xs font-semibold text-[#0A2B6D]/80">
                Every entry retains its foreign-key profile link, version state, owner, and NDIS / Aged Care standard reference:
              </p>
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {REGISTERS.map((name) => (
                  <div
                    key={name}
                    className="rounded-md border border-slate-200 bg-[#F8FAFC] px-2.5 py-1.5 text-[11px] font-bold text-[#0A2B6D] truncate"
                  >
                    {name}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                to="/registers"
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-[#0A2B6D] px-3 text-xs font-extrabold text-white transition hover:bg-[#0072FF]"
              >
                <span>Open Registers Hub</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                to="/record-intelligence"
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-[#0A2B6D] bg-white px-3 text-xs font-extrabold text-[#0A2B6D] transition hover:bg-slate-50"
              >
                <span>Record Intelligence</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#0072FF]" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}