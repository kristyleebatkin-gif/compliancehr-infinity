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
    title: 'Answer and attach evidence',
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
    text: 'One tap produces your branded audit report, logged in the Internal Audit Register and ready for NDIS verification or certification.',
    color: '#FF2E9A',
  },
];

const PROOF = [
  { icon: Timer, text: 'Internal audits completed in minutes, not days', color: '#0072FF' },
  { icon: FolderCheck, text: 'Every document in every section, audited in one pass', color: '#5A00D6' },
  { icon: ScanLine, text: 'Evidence, scans and receipts captured as you go', color: '#A100FF' },
  { icon: BadgeCheck, text: 'Reports, registers and CSV exports ready for your NDIS auditor', color: '#FF2E9A' },
];

const VERBS = ['Store', 'Copy', 'Use', 'Audit', 'Share', 'Scan', 'Send', 'Sort', 'File', 'Report'];

export default function ExpressAuditSection() {
  return (
    <section
      id="express-audit"
      className="relative mx-auto max-w-6xl scroll-mt-16 overflow-hidden rounded-[2rem] border-2 border-[#0A2B6D] bg-white px-4 py-12 sm:py-16 shadow-xl md:px-8"
    >
      <div
        className="mx-auto rounded-2xl border-2 border-[#0A2B6D] p-6 text-center text-white shadow-md"
        style={{ background: SQUISHED_GRADIENT }}
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-200">
          <Timer className="h-3.5 w-3.5" />
          The two-minute audit
        </div>
        <h2 className="mt-4 font-editorial text-3xl font-bold tracking-tight text-white md:text-[2.5rem] md:leading-tight">
          From first question to <span className="font-editorial-italic text-amber-200">audit-ready report</span> in two minutes.
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-white/95">
          The fastest, safest way to complete an internal audit: one checklist, every document in every section, evidence attached, corrective actions filed, and a professional branded report generated the moment you finish.
        </p>
      </div>

      <ol className="relative mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FLOW.map((item, index) => {
          const Icon = item.icon;
          return (
            <Reveal
              key={item.step}
              as="li"
              delay={(index % 4) * 0.07}
              className="group relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              style={{
                borderColor: `${item.color}55`,
                borderTopWidth: '4px',
                borderTopColor: item.color,
                background: `linear-gradient(135deg, ${item.color}12 0%, #ffffff 85%)`,
              }}
            >
              <span
                className="pointer-events-none absolute -right-1 -top-2 select-none font-editorial text-5xl font-bold opacity-15"
                style={{ color: item.color }}
              >
                {item.step}
              </span>
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm transition-transform group-hover:scale-105"
                style={{ background: item.color }}
              >
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-editorial text-lg font-bold text-foreground">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground/75">{item.text}</p>
            </Reveal>
          );
        })}
      </ol>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {PROOF.map(({ icon: Icon, text, color }) => (
          <div
            key={text}
            className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-sm"
            style={{ borderColor: `${color}45`, borderLeftWidth: '4px', borderLeftColor: color }}
          >
            <Icon className="h-4 w-4 shrink-0" style={{ color }} />
            <span className="text-sm font-bold text-foreground">{text}</span>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-center gap-4">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[11px] font-extrabold uppercase tracking-[0.22em] text-violet-800">
          {VERBS.map((v, i) => (
            <React.Fragment key={v}>
              <span>{v}</span>
              {i < VERBS.length - 1 && <span className="text-pink-500">·</span>}
            </React.Fragment>
          ))}
        </div>
        <Link
          to="/compliance"
          className="group inline-flex items-center gap-2.5 rounded-full gradient-brand px-7 py-3.5 text-base font-bold text-white shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl"
        >
          See the audit engine
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
}