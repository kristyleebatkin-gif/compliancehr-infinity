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
import {
  getTilePalette,
  getHeaderView,
  getSymbolView,
  getAppBorderView,
} from '@/lib/fullColourTiles';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';

const VERBS = [
  { label: 'Store', icon: Vault },
  { label: 'Copy', icon: Copy },
  { label: 'Use', icon: Sparkles },
  { label: 'Audit', icon: ClipboardList },
  { label: 'Share', icon: Share2 },
  { label: 'Scan', icon: ScanLine },
  { label: 'Send', icon: Send },
  { label: 'Sort', icon: Filter },
  { label: 'File', icon: FolderCheck },
  { label: 'Report', icon: FileSpreadsheet },
];

const PROOF = [
  { icon: Timer, text: 'Internal audits completed in minutes, not days' },
  { icon: FolderCheck, text: 'Every document in every section, audited in one pass' },
  { icon: ScanLine, text: 'Evidence, scans and receipts captured as you go' },
  { icon: BadgeCheck, text: 'Reports, registers and CSV exports ready for your NDIS auditor' },
];

const FLOW = [
  {
    icon: ClipboardList,
    step: '01',
    title: 'Open a checklist',
    text: 'Pick any area — participants, staff, governance or safety — from the built-in audit checklist library.',
  },
  {
    icon: Upload,
    step: '02',
    title: 'Answer & attach evidence',
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
    text: 'One tap produces your branded audit report, logged in the Internal Audit Register and ready for NDIS verification.',
  },
];

export default function ExpressAuditSection() {
  return (
    <section
      id="express-audit"
      className="w-full scroll-mt-16 rounded-3xl p-[12px] shadow-lg"
      style={{ background: TOP_BORDER_GRADIENT }}
    >
      <div className="flex w-full flex-col items-center justify-center rounded-[16px] bg-white px-4 py-5 sm:px-6 sm:py-6 text-center space-y-5">
        <span
          className="mx-auto inline-flex min-h-[42px] items-center justify-center gap-2.5 rounded-full border-2 border-[#0A2B6D] px-6 py-1.5 text-xs sm:text-sm md:text-base font-extrabold tracking-wide text-white shadow-sm"
          style={{ background: getHeaderView(6) }}
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
            <Timer className="h-3.5 w-3.5 text-white" />
          </span>
          <span className="text-center">The Two-Minute Express Audit</span>
        </span>

        <div className="mx-auto max-w-3xl space-y-1.5">
          <h2 className="font-editorial text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
            <span className="text-[#0A2B6D]">From first question to </span>
            <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
              audit-ready report
            </span>{' '}
            <span className="bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
              in two minutes.
            </span>
          </h2>
          <p className="text-xs sm:text-sm md:text-base font-extrabold text-[#0A2B6D]">
            The fastest, safest way to complete an internal audit: one checklist, every document in every section, evidence attached, corrective actions filed, and a professional branded report generated the moment you finish.
          </p>
        </div>

        {/* 1. Store & Action Pills in Mixed Full Colours */}
        <div className="grid w-full grid-cols-2 gap-2.5 sm:grid-cols-5 lg:grid-cols-10">
          {VERBS.map((v, idx) => {
            const Icon = v.icon;
            const tile = getTilePalette(idx);
            const sym = getSymbolView(idx);
            return (
              <div
                key={v.label}
                className="flex items-center justify-center gap-2 rounded-full border-2 px-3 py-1.5 text-center shadow-sm"
                style={{
                  backgroundColor: tile.bg,
                  color: tile.text,
                  borderColor: getAppBorderView(idx),
                }}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-[#0A2B6D] bg-white shadow-2xs">
                  <Icon className="h-3.5 w-3.5" style={{ color: sym.iconColor }} />
                </span>
                <span className="text-[11px] font-extrabold uppercase tracking-wider" style={{ color: tile.text }}>
                  {v.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* 2. 4 Compact Proof Pills in Mixed Full Colours */}
        <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-4 text-left">
          {PROOF.map(({ icon: Icon, text }, idx) => {
            const tile = getTilePalette(idx + 3);
            const sym = getSymbolView(idx + 3);
            return (
              <div
                key={text}
                className="flex items-center gap-2.5 rounded-2xl border-2 px-4 py-2.5 shadow-sm"
                style={{
                  backgroundColor: tile.bg,
                  color: tile.text,
                  borderColor: getAppBorderView(idx + 3),
                }}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-[#0A2B6D] bg-white">
                  <Icon className="h-3.5 w-3.5" style={{ color: sym.iconColor }} />
                </span>
                <span className="text-xs font-extrabold leading-snug" style={{ color: tile.text }}>
                  {text}
                </span>
              </div>
            );
          })}
        </div>

        {/* 3. 4 Detailed Step Cards in Mixed Full Colours */}
        <ol className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4 text-left">
          {FLOW.map((item, index) => {
            const Icon = item.icon;
            const tile = getTilePalette(index + 5);
            const sym = getSymbolView(index + 5);
            return (
              <Reveal
                key={item.step}
                as="li"
                delay={(index % 4) * 0.06}
                className="group flex flex-col justify-between rounded-2xl border-2 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{
                  backgroundColor: tile.bg,
                  color: tile.text,
                  borderColor: getAppBorderView(index + 5),
                }}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#0A2B6D] bg-white shadow-sm">
                      <Icon className="h-5 w-5" style={{ color: sym.iconColor }} />
                    </span>
                    <span className="rounded-full border-2 border-[#0A2B6D] bg-white px-3 py-0.5 font-editorial text-xs font-extrabold text-[#0A2B6D]">
                      Step {item.step}
                    </span>
                  </div>
                  <h3 className="mt-3 font-editorial text-base font-extrabold" style={{ color: tile.text }}>
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-xs font-bold leading-relaxed" style={{ color: tile.subtext }}>
                    {item.text}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </ol>

        <div className="flex justify-center">
          <Link
            to="/compliance"
            className="inline-flex min-h-[38px] items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] px-6 py-1.5 text-xs sm:text-[13px] font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5"
            style={{ background: getHeaderView(7) }}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
              <ArrowRight className="h-3.5 w-3.5 text-white" />
            </span>
            <span>See the Audit Engine</span>
          </Link>
        </div>
      </div>
    </section>
  );
}