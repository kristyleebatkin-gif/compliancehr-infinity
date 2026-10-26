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
  getHeaderView,
  getSymbolView,
  getAppBorderView,
} from '@/lib/fullColourTiles';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';

const EXPRESS_SPRAY_BGS = [
  'radial-gradient(circle at 14% 18%, rgba(255, 133, 224, 0.65) 0%, transparent 48%), radial-gradient(circle at 86% 24%, rgba(56, 189, 248, 0.65) 0%, transparent 48%), radial-gradient(circle at 50% 86%, rgba(192, 132, 252, 0.65) 0%, transparent 52%), #FFFFFF',
  'radial-gradient(circle at 18% 82%, rgba(56, 189, 248, 0.65) 0%, transparent 48%), radial-gradient(circle at 84% 20%, rgba(192, 132, 252, 0.65) 0%, transparent 48%), radial-gradient(circle at 48% 36%, rgba(255, 133, 224, 0.58) 0%, transparent 50%), #FFFFFF',
  'radial-gradient(circle at 16% 28%, rgba(192, 132, 252, 0.65) 0%, transparent 48%), radial-gradient(circle at 84% 78%, rgba(255, 133, 224, 0.65) 0%, transparent 48%), radial-gradient(circle at 54% 18%, rgba(56, 189, 248, 0.60) 0%, transparent 50%), #FFFFFF',
  'radial-gradient(circle at 84% 22%, rgba(255, 133, 224, 0.65) 0%, transparent 48%), radial-gradient(circle at 16% 78%, rgba(56, 189, 248, 0.65) 0%, transparent 48%), radial-gradient(circle at 48% 52%, rgba(192, 132, 252, 0.60) 0%, transparent 52%), #FFFFFF',
];

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
      <div className="flex w-full flex-col items-center justify-center rounded-[16px] bg-white px-4 py-5 sm:px-6 sm:py-6 text-center space-y-3.5">
        {/* Heading & Subheading First in Clean Bordered Frame so Writing Fits Better */}
        <div
          className="w-full rounded-2xl border-2 border-[#0A2B6D] p-3 sm:p-4 shadow-sm"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div className="w-full rounded-xl border-2 border-[#0A2B6D] bg-white px-5 py-4 sm:px-8 sm:py-5 text-center space-y-2">
            <h2 className="font-editorial text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
              <span className="text-[#0A2B6D]">From first question to </span>
              <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                audit-ready report
              </span>{' '}
              <span className="bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
                in two minutes.
              </span>
            </h2>
            <p className="mx-auto max-w-4xl text-xs sm:text-sm md:text-base font-extrabold leading-relaxed text-[#0A2B6D]">
              The fastest, safest way to complete an internal audit: one checklist, every document in every section, evidence attached, corrective actions filed, and a professional branded report generated the moment you finish.
            </p>
          </div>
        </div>

        {/* "See the Audit Engine" Above "The Two-Minute Express Audit" — Just Smaller in Height/Size, Same Full Length */}
        <Link
          to="/compliance"
          className="flex min-h-[34px] w-full items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] px-6 py-1 text-xs sm:text-[13px] font-extrabold tracking-wide text-white shadow-sm transition-all hover:-translate-y-0.5"
          style={{ background: getHeaderView(7) }}
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
            <ArrowRight className="h-3 w-3 text-white" />
          </span>
          <span className="text-center">See the Audit Engine</span>
        </Link>

        {/* Stretched Side-to-Side "The Two-Minute Express Audit" Underneath */}
        <div
          className="flex min-h-[44px] w-full items-center justify-center gap-2.5 rounded-full border-2 border-[#0A2B6D] px-6 py-2 text-xs sm:text-sm md:text-base font-extrabold tracking-wide text-white shadow-sm"
          style={{ background: getHeaderView(6) }}
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
            <Timer className="h-3.5 w-3.5 text-white" />
          </span>
          <span className="text-center">The Two-Minute Express Audit</span>
        </div>

        {/* 1. Store, Copy & Other Action Tiles — White Background, App Design Coloured Borders, Dark Blue Writing & Symbols */}
        <div
          className="w-full rounded-2xl p-[4px] shadow-sm"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div className="grid w-full grid-cols-2 gap-2.5 rounded-[12px] bg-white p-3 sm:grid-cols-5 lg:grid-cols-10">
            {VERBS.map((v, idx) => {
              const Icon = v.icon;
              const borderCol = getAppBorderView(idx);
              return (
                <div
                  key={v.label}
                  className="rounded-full p-[2.5px] shadow-sm"
                  style={{ background: TOP_BORDER_GRADIENT }}
                >
                  <div className="flex h-full w-full items-center justify-center gap-1.5 rounded-full bg-white px-2.5 py-1.5 text-center text-[#0A2B6D]">
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-2xs"
                      style={{ borderColor: borderCol }}
                    >
                      <Icon className="h-3.5 w-3.5 text-[#0A2B6D]" />
                    </span>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                      {v.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Top 4 Tiles Above Steps — Pink, Purple & Blue Spray Background with App Design Coloured Border */}
        <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-4 text-left">
          {PROOF.map(({ icon: Icon, text }, idx) => {
            const sym = getSymbolView(idx + 3);
            const borderCol = getAppBorderView(idx + 3);
            const sprayBg = EXPRESS_SPRAY_BGS[idx % EXPRESS_SPRAY_BGS.length];
            return (
              <div
                key={text}
                className="flex h-full rounded-2xl p-[3px] shadow-sm"
                style={{ background: TOP_BORDER_GRADIENT }}
              >
                <div
                  className="flex h-full w-full items-center gap-2.5 rounded-[13px] px-4 py-3 text-[#0A2B6D]"
                  style={{ background: sprayBg }}
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-2xs"
                    style={{ borderColor: borderCol }}
                  >
                    <Icon className="h-4 w-4" style={{ color: sym.iconColor }} />
                  </span>
                  <span className="text-xs font-extrabold leading-snug text-[#0A2B6D]">
                    {text}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. 4 Detailed Step Cards — Slightly Increased Size of Step */}
        <ol className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4 text-center items-stretch">
          {FLOW.map((item, index) => {
            const Icon = item.icon;
            const sym = getSymbolView(index + 5);
            const borderCol = getAppBorderView(index + 5);
            return (
              <Reveal
                key={item.step}
                as="li"
                delay={(index % 4) * 0.06}
                className="group flex h-full flex-col rounded-2xl p-[3.5px] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{ background: TOP_BORDER_GRADIENT }}
              >
                <div
                  className="flex h-full flex-1 flex-col items-center justify-between rounded-[13px] p-5 text-white space-y-3"
                  style={{ background: getHeaderView(index + 4) }}
                >
                  <div className="flex items-center justify-center gap-3">
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-sm"
                      style={{ borderColor: borderCol }}
                    >
                      <Icon className="h-5 w-5" style={{ color: sym.iconColor }} />
                    </span>
                    <span
                      className="rounded-full border-2 bg-white px-4 py-1.5 font-editorial text-sm sm:text-base font-extrabold text-[#0A2B6D] shadow-2xs"
                      style={{ borderColor: borderCol }}
                    >
                      Step {item.step}
                    </span>
                  </div>

                  <div
                    className="w-full rounded-xl p-[3px] shadow-2xs"
                    style={{ background: TOP_BORDER_GRADIENT }}
                  >
                    <div className="flex min-h-[46px] w-full items-center justify-center rounded-[9px] bg-white px-3.5 py-2 text-center">
                      <h3 className="font-editorial text-base sm:text-lg font-extrabold text-[#0A2B6D]">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  <p className="flex-1 flex items-center justify-center text-xs sm:text-[13px] font-bold leading-relaxed text-white">
                    {item.text}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}