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

const FLOW = [
  {
    icon: ClipboardList,
    step: '01',
    title: 'Open a checklist',
    text: 'Pick any area, participants, staff, governance or safety, from the built-in audit checklist library.',
  },
  {
    icon: Upload,
    step: '02',
    title: 'Answer and attach evidence',
    text: 'Tick each item and attach the exact document, scan, photo or register entry as your evidence.',
  },
  {
    icon: FileCheck2,
    step: '03',
    title: 'Raise corrective actions',
    text: 'Anything not compliant becomes a corrective action, filed straight into the continuous improvement register.',
  },
  {
    icon: FileText,
    step: '04',
    title: 'Generate the report',
    text: 'One tap produces your branded audit report, logged in the Internal Audit Register and ready for NDIS verification or certification.',
  },
];

const PROOF = [
  { icon: Timer, text: 'Internal audits completed in minutes, not days' },
  { icon: FolderCheck, text: 'Every document in every section, audited in one pass' },
  { icon: ScanLine, text: 'Evidence, scans and receipts captured as you go' },
  { icon: BadgeCheck, text: 'Reports, registers and CSV exports ready for your NDIS auditor' },
];

const VERBS = ['Store', 'Copy', 'Use', 'Audit', 'Share', 'Scan', 'Send', 'Sort', 'File', 'Report'];

export default function ExpressAuditSection() {
  return (
    <section id="express-audit" className="relative overflow-hidden border-y border-border/70 bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl" />
      </div>
      <div className="pointer-events-none absolute -bottom-10 right-8 select-none font-editorial text-[15rem] font-bold leading-none text-white/[0.03]">2:00</div>

      <div className="relative mx-auto max-w-6xl px-4 py-20 md:px-8">
        <div className="relative mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-200">
            <Timer className="h-3.5 w-3.5" />
            The two-minute audit
          </div>
          <h2 className="mt-6 font-editorial text-3xl font-medium tracking-tight text-white md:text-[2.6rem] md:leading-tight">
            From first question to <span className="font-editorial-italic bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">audit-ready report</span> in two minutes.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-white/65">
            The fastest, safest way to complete an internal audit: one checklist, every document in every section, evidence attached, corrective actions filed, and a professional branded report generated the moment you finish.
          </p>
        </div>

        <ol className="relative mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FLOW.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.step} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur transition-all hover:-translate-y-1 hover:border-violet-400/40 hover:bg-white/[0.07]">
                <span className="pointer-events-none absolute -right-2 -top-3 select-none font-editorial text-6xl font-bold text-white/[0.06]">{item.step}</span>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/25 to-cyan-500/25 text-violet-200 shadow-sm transition-transform group-hover:scale-105">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-editorial text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{item.text}</p>
              </li>
            );
          })}
        </ol>

        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {PROOF.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <Icon className="h-4 w-4 shrink-0 text-cyan-300" />
              <span className="text-sm font-medium text-white/80">{text}</span>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center gap-5">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
            {VERBS.map((v, i) => (
              <React.Fragment key={v}>
                <span>{v}</span>
                {i < VERBS.length - 1 && <span className="text-violet-400/60">·</span>}
              </React.Fragment>
            ))}
          </div>
          <Link to="/compliance" className="group inline-flex items-center gap-2.5 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-slate-950 shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl">
            See the audit engine
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}