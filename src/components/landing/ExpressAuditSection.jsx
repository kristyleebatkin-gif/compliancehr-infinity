import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  ClipboardList,
  FileCheck2,
  FileText,
  FolderCheck,
  ScanLine,
  Timer,
  Upload,
} from 'lucide-react';
import Reveal from '@/components/landing/Reveal';

const SQUISHED_GRADIENT =
  'linear-gradient(120deg, #0072FF 0%, #0A2B6D 13%, #5A00D6 26%, #A100FF 39%, #FF2E9A 50%, #A100FF 61%, #5A00D6 74%, #0A2B6D 87%, #0072FF 100%)';

const FLOW = [
  {
    icon: ClipboardList,
    step: '01',
    title: 'Open a checklist',
    text: 'Pick any area — participants, staff, governance or safety — from the built-in audit checklist library.',
    color: '#0072FF',
  },
  {
    icon: Upload,
    step: '02',
    title: 'Answer & attach evidence',
    text: 'Tick each item and attach the exact document, scan, photo or register entry as your evidence.',
    color: '#5A00D6',
  },
  {
    icon: FileCheck2,
    step: '03',
    title: 'Raise corrective actions',
    text: 'Anything not compliant becomes a corrective action, filed straight into the continuous improvement register.',
    color: '#A100FF',
  },
  {
    icon: FileText,
    step: '04',
    title: 'Generate the report',
    text: 'One tap produces your branded audit report, logged in the Internal Audit Register and ready for NDIS verification.',
    color: '#FF2E9A',
  },
];

const PROOF = [
  { icon: Timer, text: 'Internal audits completed in minutes, not days', color: '#0072FF' },
  { icon: FolderCheck, text: 'Every document in every section, audited in one pass', color: '#5A00D6' },
  { icon: ScanLine, text: 'Evidence, scans and receipts captured as you go', color: '#A100FF' },
  { icon: BadgeCheck, text: 'Reports, registers and CSV exports ready for your NDIS auditor', color: '#FF2E9A' },
];

const VERBS = [
  { label: 'Store', color: '#0072FF' },
  { label: 'Copy', color: '#0A2B6D' },
  { label: 'Use', color: '#5A00D6' },
  { label: 'Audit', color: '#A100FF' },
  { label: 'Share', color: '#FF2E9A' },
  { label: 'Scan', color: '#00C6FF' },
  { label: 'Send', color: '#0072FF' },
  { label: 'Sort', color: '#5A00D6' },
  { label: 'File', color: '#A100FF' },
  { label: 'Report', color: '#FF2E9A' },
];

export default function ExpressAuditSection() {
  return (
    <section
      id="express-audit"
      className="relative w-full scroll-mt-16 overflow-hidden rounded-3xl border-2 border-[#0A2B6D] bg-white px-4 py-6 shadow-xl md:px-6"
      style={{ borderTopWidth: '4px', borderTopColor: '#5A00D6' }}
    >
      <div
        className="gradient-brand mx-auto rounded-2xl border-2 border-[#0A2B6D] p-5 text-center text-white shadow-md"
        style={{ background: SQUISHED_GRADIENT }}
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-[#FF2E9A] px-4 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white">
          <Timer className="h-3.5 w-3.5" />
          The two-minute audit
        </div>
        <h2 className="mt-2.5 font-editorial text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          From first question to audit-ready report in two minutes.
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-xs sm:text-sm font-semibold leading-relaxed text-white/95">
          The fastest, safest way to complete an internal audit: one checklist, every document in every section, evidence attached, corrective actions filed, and a professional branded report generated the moment you finish.
        </p>
      </div>

      {/* 4 Colourful Step Tiles Under Audit-Ready Report */}
      <ol className="relative mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FLOW.map((item, index) => {
          const Icon = item.icon;
          return (
            <Reveal
              key={item.step}
              as="li"
              delay={(index % 4) * 0.06}
              className="group relative overflow-hidden rounded-2xl border-2 border-[#0A2B6D] bg-white p-4 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
              style={{
                borderTopWidth: '4px',
                borderTopColor: item.color,
                background: `linear-gradient(145deg, ${item.color}18 0%, #ffffff 80%)`,
              }}
            >
              <div className="flex items-center justify-between">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#0A2B6D] text-white shadow-sm transition-transform group-hover:scale-105"
                  style={{ background: item.color }}
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <span
                  className="rounded-full border border-[#0A2B6D] px-2.5 py-0.5 font-editorial text-xs font-extrabold text-white"
                  style={{ background: item.color }}
                >
                  Step {item.step}
                </span>
              </div>
              <h3 className="mt-3 font-editorial text-base font-extrabold text-[#0A2B6D]">
                {item.title}
              </h3>
              <p className="mt-1.5 text-xs font-semibold leading-relaxed text-[#0A2B6D]/85">
                {item.text}
              </p>
            </Reveal>
          );
        })}
      </ol>

      {/* 4 Colourful Proof Banners */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {PROOF.map(({ icon: Icon, text, color }) => (
          <div
            key={text}
            className="flex items-center gap-3 rounded-xl border-2 border-[#0A2B6D] bg-white px-3.5 py-2.5 shadow-sm"
            style={{
              borderLeftWidth: '5px',
              borderLeftColor: color,
              background: `linear-gradient(90deg, ${color}14 0%, #ffffff 85%)`,
            }}
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#0A2B6D] text-white"
              style={{ backgroundColor: color }}
            >
              <Icon className="h-4 w-4 text-white" />
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-[#0A2B6D]">{text}</span>
          </div>
        ))}
      </div>

      {/* Vibrant Action Verbs Strip & CTA */}
      <div className="mt-6 flex flex-col items-center gap-3">
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {VERBS.map((v) => (
            <span
              key={v.label}
              className="rounded-full border-2 border-[#0A2B6D] px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-2xs"
              style={{ backgroundColor: v.color }}
            >
              {v.label}
            </span>
          ))}
        </div>
        <Link
          to="/compliance"
          className="group inline-flex items-center gap-2 rounded-full border-2 border-[#0A2B6D] gradient-brand px-6 py-2.5 text-sm font-extrabold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
        >
          See the audit engine
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
}