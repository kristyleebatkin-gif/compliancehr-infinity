import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, BookOpenCheck, Database, FileCheck2, FolderTree, Search,
  ShieldCheck, Waypoints,
} from 'lucide-react';
import Reveal from '@/components/landing/Reveal';
import LandingSectionHeader from '@/components/landing/LandingSectionHeader';

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
      <div className="enterprise-surface rounded-2xl p-6 sm:p-8 lg:p-10 space-y-6">
        <LandingSectionHeader
          badge="Universal Register Engine"
          tone="blue"
          icon={BookOpenCheck}
          title="45 Master Registers That Maintain Themselves"
          description="A single operational entry updates every register, 360° profile, document vault, and executive KPI it belongs to—eliminating duplicate data entry and manual spreadsheet reconciliation."
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HEADLINE_STATS.map((stat, idx) => (
            <Reveal
              key={stat.label}
              delay={idx * 0.04}
              className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 text-left"
            >
              <span
                className="absolute inset-x-0 top-0 h-1"
                style={{ backgroundColor: stat.accent }}
              />
              <div className="font-editorial text-3xl font-extrabold leading-none text-[#0A2B6D] sm:text-4xl">
                {stat.value}
              </div>
              <h3 className="mt-2.5 text-lg font-extrabold text-[#0A2B6D]">
                {stat.label}
              </h3>
              <p className="mt-1 text-sm font-normal text-[#0A2B6D]/75">{stat.sub}</p>
            </Reveal>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-[#F8FAFC] p-5 sm:p-6 text-left">
            <h3 className="text-lg font-extrabold text-[#0A2B6D]">
              Five-Stage Automated Routing Pipeline
            </h3>
            <p className="mt-1 text-sm font-normal text-[#0A2B6D]/75">
              Every form submission, incident report, and shift note passes through a deterministic 5-stage governance pipeline.
            </p>
            <div className="mt-4 space-y-2.5">
              {ENGINE_STEPS.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.title}
                    className="flex items-center gap-3.5 rounded-lg border border-slate-200 bg-white px-4 py-3"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#0A2B6D] text-white">
                      <Icon className="h-4 w-4 text-[#00C6FF]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#0A2B6D]">
                        {idx + 1}. {step.title}
                      </p>
                      <p className="text-sm font-normal leading-snug text-[#0A2B6D]/75">{step.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between gap-5 rounded-xl border border-slate-200 bg-white p-5 sm:p-6 text-left">
            <div>
              <div className="flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-[#0072FF]" />
                <h3 className="text-lg font-extrabold text-[#0A2B6D]">
                  Core Statutory Registers
                </h3>
              </div>
              <p className="mt-1.5 text-sm font-normal leading-relaxed text-[#0A2B6D]/75">
                Every entry retains its foreign-key profile link, version state, owner, and NDIS / Aged Care standard reference:
              </p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {REGISTERS.map((name) => (
                  <div
                    key={name}
                    className="rounded-md border border-slate-200 bg-[#F8FAFC] px-3 py-2 text-xs font-semibold text-[#0A2B6D]"
                  >
                    {name}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 pt-2">
              <Link
                to="/registers"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0A2B6D] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#0072FF]"
              >
                <span>Open Registers Hub</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/record-intelligence"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#0A2B6D] bg-white px-4 py-2.5 text-sm font-bold text-[#0A2B6D] transition hover:bg-slate-50"
              >
                <span>Record Intelligence</span>
                <ArrowRight className="h-4 w-4 text-[#0072FF]" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}