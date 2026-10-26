import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  ClipboardList,
  Copy,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  FolderCheck,
  ScanLine,
  Send,
  Share2,
  Sparkles,
  Timer,
  Upload,
  Vault,
  Filter,
} from 'lucide-react';
import Reveal from '@/components/landing/Reveal';

const SQUISHED_GRADIENT =
  'linear-gradient(120deg, #0072FF 0%, #0A2B6D 13%, #5A00D6 26%, #A100FF 39%, #FF2E9A 50%, #A100FF 61%, #5A00D6 74%, #0A2B6D 87%, #0072FF 100%)';

// 1. STORE & ACTION ICONS (Shown FIRST)
const VERBS = [
  { label: 'Store', icon: Vault, color: '#0072FF' },
  { label: 'Copy', icon: Copy, color: '#5A00D6' },
  { label: 'Use', icon: Sparkles, color: '#A100FF' },
  { label: 'Audit', icon: ClipboardList, color: '#FF2E9A' },
  { label: 'Share', icon: Share2, color: '#00C6FF' },
  { label: 'Scan', icon: ScanLine, color: '#0072FF' },
  { label: 'Send', icon: Send, color: '#5A00D6' },
  { label: 'Sort', icon: Filter, color: '#A100FF' },
  { label: 'File', icon: FolderCheck, color: '#FF2E9A' },
  { label: 'Report', icon: FileSpreadsheet, color: '#00C6FF' },
];

// 2. SMALL BOXES (Shown SECOND)
const PROOF = [
  { icon: Timer, text: 'Internal audits completed in minutes, not days', color: '#0072FF' },
  { icon: FolderCheck, text: 'Every document in every section, audited in one pass', color: '#5A00D6' },
  { icon: ScanLine, text: 'Evidence, scans and receipts captured as you go', color: '#A100FF' },
  { icon: BadgeCheck, text: 'Reports, registers and CSV exports ready for your NDIS auditor', color: '#FF2E9A' },
];

// 3. BIG BOXES (Shown THIRD)
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

      {/* 1. STORE & ACTION ICONS FIRST (Circular Icons + Crisp White Pills) */}
      <div className="mt-5 rounded-2xl border-2 border-[#0A2B6D] bg-[#F5F0FF] p-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 lg:grid-cols-10">
          {VERBS.map((v) => {
            const Icon = v.icon;
            return (
              <div
                key={v.label}
                className="flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-[#0A2B6D] bg-white px-2 py-2 text-center shadow-sm"
              >
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[#0A2B6D] text-white shadow-2xs"
                  style={{ backgroundColor: v.color }}
                >
                  <Icon className="h-4 w-4 text-white" />
                </span>
                <span className="rounded bg-white text-[11px] font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                  {v.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. SMALL BOXES SECOND (4 Compact Proof Banners on Crisp White) */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {PROOF.map(({ icon: Icon, text, color }) => (
          <div
            key={text}
            className="flex items-center gap-2.5 rounded-xl border-2 border-[#0A2B6D] bg-white px-3 py-2.5 shadow-sm"
            style={{
              borderLeftWidth: '5px',
              borderLeftColor: color,
            }}
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#0A2B6D] text-white"
              style={{ backgroundColor: color }}
            >
              <Icon className="h-4 w-4 text-white" />
            </span>
            <span className="rounded bg-white text-xs font-extrabold leading-snug text-[#0A2B6D]">
              {text}
            </span>
          </div>
        ))}
      </div>

      {/* 3. BIG BOXES THIRD (4 Detailed Step Cards on Crisp White) */}
      <ol className="relative mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FLOW.map((item, index) => {
          const Icon = item.icon;
          return (
            <Reveal
              key={item.step}
              as="li"
              delay={(index % 4) * 0.06}
              className="group relative overflow-hidden rounded-2xl border-2 border-[#0A2B6D] bg-white p-4 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
              style={{
                borderTopWidth: '5px',
                borderTopColor: item.color,
              }}
            >
              <div className="flex items-center justify-between">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#0A2B6D] text-white shadow-sm transition-transform group-hover:scale-105"
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
              <h3 className="mt-3 rounded bg-white font-editorial text-base font-extrabold text-[#0A2B6D]">
                {item.title}
              </h3>
              <p className="mt-1.5 rounded bg-white text-xs font-bold leading-relaxed text-[#0A2B6D]">
                {item.text}
              </p>
            </Reveal>
          );
        })}
      </ol>

      {/* Bottom CTA */}
      <div className="mt-5 flex justify-center">
        <Link
          to="/compliance"
          className="group inline-flex items-center gap-2 rounded-full border-2 border-[#0A2B6D] bg-[#FF2E9A] px-6 py-2.5 text-sm font-extrabold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-[#5A00D6]"
        >
          See the audit engine
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
}