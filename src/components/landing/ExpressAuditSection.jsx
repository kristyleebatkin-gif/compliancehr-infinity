import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ClipboardList,
  Copy,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  FolderCheck,
  Pin,
  RefreshCw,
  ScanLine,
  Send,
  Share2,
  Sparkles,
  Tablet,
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

const STICKY_NOTE_BG = 'linear-gradient(180deg, #FFF3FA 0%, #FFE4F5 100%)';
const STICKY_NOTE_BORDER = '#FF2E9A';
const STICKY_NOTE_TAPE = 'linear-gradient(90deg, #0072FF 0%, #5A00D6 50%, #FF2E9A 100%)';

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
  {
    icon: Timer,
    messages: [
      'Internal audits completed in minutes, not days',
      '2-Min Express Audit covers all 8 NDIS Standards',
      'Auto-stamps time, auditor & compliance score ring',
    ],
  },
  {
    icon: FolderCheck,
    messages: [
      'Every document in every section, audited in one pass',
      '100-Point Staff & Participant folder verification',
      'Instant missing or expired credential detection',
    ],
  },
  {
    icon: ScanLine,
    messages: [
      'Evidence, scans and receipts captured as you go',
      'Attach photos, PDFs, policies & signed forms live',
      'Tamper-evident links to Audit Evidence Register',
    ],
  },
  {
    icon: BadgeCheck,
    messages: [
      'Reports, registers and CSV exports ready for your NDIS auditor',
      '1-Click Printable PDF Audit Pack & Board Summary',
      'Consent-verified External Auditor Portal access',
    ],
  },
];

const FLOW = [
  {
    icon: ClipboardList,
    step: '01',
    notes: [
      {
        title: 'Open a Checklist',
        text: 'Pick any area — participants, staff, governance or safety — from the built-in audit checklist library.',
        functions: ['356 Master Checkpoints', '17 NDIS Audit Categories', 'Custom Checklist Builder'],
      },
      {
        title: 'Select Scope & Practice Standard',
        text: 'Filter by NDIS Practice Standard 1–8 or run a full organisation-wide verification pass.',
        functions: ['8 Practice Standards Mapped', 'Staff & Participant Scope', '1-Click Smart-Fill Defaults'],
      },
      {
        title: 'Load Previous Audit Baseline',
        text: 'Compare today’s readiness against prior audit runs with automatic delta highlighting.',
        functions: ['Historical Score Comparison', 'Carry-Forward Evidence', 'Scheduled Audit Calendar'],
      },
      {
        title: 'Launch Express 2-Minute Mode',
        text: 'Pre-populate verified green controls from your live registers so you only review exceptions.',
        functions: ['Auto-Tick Verified Controls', 'Exception-Only Fast Pass', 'Live Readiness Score Ring'],
      },
    ],
  },
  {
    icon: Upload,
    step: '02',
    notes: [
      {
        title: 'Answer & Attach Evidence',
        text: 'Tick each item and attach the exact document, scan, photo or register entry as your evidence.',
        functions: ['Direct Vault Evidence Link', 'Photo & PDF Attachment', 'Live Compliance Scoring'],
      },
      {
        title: 'Auto-Verify Staff & Participant Files',
        text: 'Let the engine cross-check NDIS Worker Screening, Blue Cards, First Aid and 3-Part Consents automatically.',
        functions: ['100-Point File Check', '3-Part Consent Verification', 'Expiry Date Validation'],
      },
      {
        title: 'Record Auditor Observations',
        text: 'Add structured notes, control ratings and digital sign-off stamps on every checkpoint.',
        functions: ['Control Evidence Mapping', 'Digital Sign-Off Stamp', 'Timestamped Audit Log'],
      },
      {
        title: 'Link Policies & Register Entries',
        text: 'Cite the exact version-controlled policy, drill record or risk assessment for each standard.',
        functions: ['125+ Master Docs Linked', 'Policy Version Citations', 'Read-Receipt Verification'],
      },
    ],
  },
  {
    icon: FileCheck2,
    step: '03',
    notes: [
      {
        title: 'Raise Corrective Actions',
        text: 'Anything not compliant becomes a corrective action, filed straight into the continuous improvement register.',
        functions: ['Auto-Create Quality Items', 'Assign Staff Owner & Due Date', 'Escalation & SLA Reminders'],
      },
      {
        title: 'Route Tasks to Responsible Staff',
        text: 'Automatically notify assigned team members and track remediation progress on the Shared To-Do Board.',
        functions: ['Instant Task Dispatch', 'Email & In-App Alerts', 'Sign-Off Verification'],
      },
      {
        title: 'Update Risk & Governance Controls',
        text: 'Link audit findings directly to your ISO 31000 Risk Register and Governance Control Register.',
        functions: ['Risk Matrix Sync', 'Hierarchy of Controls', 'Governance Register Link'],
      },
      {
        title: 'Track Closure & Root-Cause Fix',
        text: 'Verify evidence of completion before closing out corrective actions with a digital supervisor signature.',
        functions: ['Root-Cause CAPA Tracking', 'Supervisor Sign-Off Lock', '30-Action Batch Inclusion'],
      },
    ],
  },
  {
    icon: FileText,
    step: '04',
    notes: [
      {
        title: 'Generate the Branded Report',
        text: 'One tap produces your branded audit report, logged in the Internal Audit Register and ready for NDIS verification.',
        functions: ['1-Click Branded A4 PDF', 'CSV Register Export', 'Board Report Pack Builder'],
      },
      {
        title: 'Share with External NDIS Auditor',
        text: 'Publish verified evidence to the consent-gated External Auditor Portal for frictionless NDIS Commission reviews.',
        functions: ['Consent-Gated Auditor Portal', 'Read-Only Evidence View', 'Zero Folder Prep Time'],
      },
      {
        title: 'Archive & Schedule Next Review',
        text: 'Lock the completed audit pack in the vault and auto-schedule the next 90-day or 6-monthly review date.',
        functions: ['Permanent Vault Archive', 'Auto-Next-Review Scheduler', 'Executive Digest Email'],
      },
      {
        title: 'Export Dual Master Checklists',
        text: 'Download both CHR-AUD-001 (Governance) and CHR-AUD-002 (Workforce) signed A4 audit books.',
        functions: ['CHR-AUD-001 Governance PDF', 'CHR-AUD-002 Workforce PDF', 'Full 356-Checkpoint Ledger'],
      },
    ],
  },
];

export default function ExpressAuditSection() {
  const [litVerbIdx, setLitVerbIdx] = useState(0);
  const [litProofIdx, setLitProofIdx] = useState(0);
  const [proofPage, setProofPage] = useState(0);
  const [stepNoteIndices, setStepNoteIndices] = useState([0, 0, 0, 0]);

  // Light up iPad screens one by one
  useEffect(() => {
    const timer = setInterval(() => {
      setLitVerbIdx((prev) => (prev + 1) % VERBS.length);
      setLitProofIdx((prev) => (prev + 1) % PROOF.length);
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  // Rotate iPad screen messages & sticky notes every 30 seconds
  useEffect(() => {
    const timer30 = setInterval(() => {
      setProofPage((prev) => (prev + 1) % 3);
      setStepNoteIndices((prev) => prev.map((v) => (v + 1) % 4));
    }, 30000);
    return () => clearInterval(timer30);
  }, []);

  const cycleStepNote = (idx) => {
    setStepNoteIndices((prev) =>
      prev.map((val, i) => (i === idx ? (val + 1) % FLOW[idx].notes.length : val))
    );
  };

  const cycleAllStepNotes = () => {
    setStepNoteIndices((prev) => prev.map((v) => (v + 1) % 4));
  };

  return (
    <section
      id="express-audit"
      className="w-full scroll-mt-16 rounded-3xl p-[12px] shadow-lg"
      style={{ background: TOP_BORDER_GRADIENT }}
    >
      <div className="flex w-full flex-col items-center justify-center rounded-[16px] bg-white px-4 py-5 sm:px-6 sm:py-6 text-center space-y-3.5">
        {/* Heading & Subheading First in Clean Bordered Frame so Writing Fits Better */}
        <div
          className="w-full rounded-2xl p-[4px] shadow-sm"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div className="w-full rounded-[12px] bg-white px-5 py-4 sm:px-8 sm:py-5 text-center space-y-2">
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

        {/* "See the Audit Engine" Above "The Two-Minute Express Audit" */}
        <div
          className="w-full rounded-full p-[3px] shadow-sm"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <Link
            to="/compliance"
            className="gradient-brand flex min-h-[36px] w-full items-center justify-center gap-2 rounded-full px-6 py-1 text-xs sm:text-[13px] font-extrabold tracking-wide text-white transition-all hover:-translate-y-0.5"
            style={{ background: getHeaderView(7), color: '#FFFFFF' }}
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
              <ArrowRight className="h-3 w-3 text-white" style={{ color: '#FFFFFF' }} />
            </span>
            <span className="text-center" style={{ color: '#FFFFFF' }}>See the Audit Engine</span>
          </Link>
        </div>

        {/* Stretched Banner — Line 1: The Two-Minute Express Audit, Line 2: Sticky Notes with Functions, Line 3: Flip All Button */}
        <div
          className="w-full rounded-2xl p-[3px] shadow-sm"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div
            className="gradient-brand flex min-h-[76px] w-full flex-col items-center justify-center gap-1.5 rounded-[13px] px-6 py-3 text-white"
            style={{ background: getHeaderView(6), color: '#FFFFFF' }}
          >
            <div className="flex items-center justify-center gap-2.5 text-xs sm:text-sm md:text-base font-extrabold tracking-wide text-white">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
                <Timer className="h-3.5 w-3.5 text-white" style={{ color: '#FFFFFF' }} />
              </span>
              <span className="text-center" style={{ color: '#FFFFFF' }}>The Two-Minute Express Audit</span>
            </div>
            <div
              className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-white"
              style={{ color: '#FFFFFF' }}
            >
              Sticky Notes with Functions · Live iPad Screens Above 4 Audit Steps
            </div>
            <button
              type="button"
              onClick={cycleAllStepNotes}
              className="mt-0.5 inline-flex items-center gap-1.5 rounded-full border-2 border-white bg-white/20 px-4 py-1 text-xs font-extrabold text-white shadow-2xs hover:bg-white/30"
              style={{ color: '#FFFFFF' }}
            >
              <RefreshCw className="h-3.5 w-3.5 text-white" style={{ color: '#FFFFFF' }} />
              <span style={{ color: '#FFFFFF' }}>Flip All 4 Audit Step Sticky Notes ▸</span>
            </button>
          </div>
        </div>

        {/* 1. Store, Copy & Other Action Tiles Above Steps — Bold Stand-Out iPad Screens with Larger Symbol & Word */}
        <div
          className="w-full rounded-2xl p-[4px] shadow-sm"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div className="grid w-full grid-cols-2 gap-3 rounded-[12px] bg-white p-3.5 sm:grid-cols-5 lg:grid-cols-10">
            {VERBS.map((v, idx) => {
              const Icon = v.icon;
              const isLit = litVerbIdx === idx;
              const sym = getSymbolView(idx);
              const borderCol = isLit ? '#00C6FF' : getAppBorderView(idx);
              const sprayBg = EXPRESS_SPRAY_BGS[idx % EXPRESS_SPRAY_BGS.length];
              return (
                <div
                  key={v.label}
                  className={`flex flex-col justify-between rounded-[20px] border-[3px] p-2 transition-all duration-300 ${
                    isLit
                      ? 'bg-[#0072FF] -translate-y-1 ring-4 ring-[#00C6FF]/75 shadow-xl'
                      : 'bg-[#0A2B6D] shadow-md hover:-translate-y-0.5'
                  }`}
                  style={{ borderColor: borderCol }}
                >
                  {/* Top iPad Camera Dot & Bezel */}
                  <div className="mb-1.5 flex items-center justify-between px-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#00C6FF]" />
                    <span className="text-[8.5px] font-extrabold uppercase tracking-wider text-white">
                      {isLit ? 'LIT UP ✦' : `iPad ${idx + 1}`}
                    </span>
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isLit ? 'bg-[#FF2E9A] animate-ping' : 'bg-[#10B981]'
                      }`}
                    />
                  </div>

                  {/* Inner iPad Display — High-Contrast Word & Symbol Stand Out Boldly */}
                  <div
                    className="rounded-xl p-[2.5px] shadow-inner"
                    style={{ background: TOP_BORDER_GRADIENT }}
                  >
                    <div
                      className="flex min-h-[82px] flex-col items-center justify-center gap-1.5 rounded-[9px] px-2 py-2.5 text-center"
                      style={{ background: sprayBg }}
                    >
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-md"
                        style={{ borderColor: getAppBorderView(idx) }}
                      >
                        <Icon className="h-5 w-5" style={{ color: sym.iconColor }} />
                      </span>
                      <span className="rounded-full border border-[#0A2B6D]/25 bg-white px-2.5 py-0.5 text-xs sm:text-[13px] font-extrabold uppercase tracking-wider text-[#0A2B6D] shadow-2xs">
                        {v.label}
                      </span>
                    </div>
                  </div>

                  {/* Bottom iPad Home Indicator */}
                  <div className="mt-1.5 flex justify-center">
                    <span className="h-1 w-8 rounded-full bg-white/85" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Top 4 Proof iPad Screens Above Steps — Clean Centered Live Info, Lighting Up 1-by-1 & Changing Every 30 Secs */}
        <div className="grid w-full gap-3.5 sm:grid-cols-2 lg:grid-cols-4 text-center items-stretch">
          {PROOF.map(({ icon: Icon, messages }, idx) => {
            const sym = getSymbolView(idx + 3);
            const isLit = litProofIdx === idx;
            const borderCol = isLit ? '#00C6FF' : getAppBorderView(idx + 3);
            const sprayBg = EXPRESS_SPRAY_BGS[idx % EXPRESS_SPRAY_BGS.length];
            const activeMsg = messages[proofPage % messages.length];
            return (
              <div
                key={idx}
                className={`flex h-full flex-col justify-between rounded-[22px] border-[3.5px] p-2.5 transition-all duration-300 ${
                  isLit
                    ? 'bg-[#0072FF] -translate-y-0.5 ring-4 ring-[#00C6FF]/70 shadow-xl'
                    : 'bg-[#0A2B6D] shadow-md hover:-translate-y-0.5 hover:shadow-lg'
                }`}
                style={{ borderColor: borderCol }}
              >
                {/* Top iPad Bezel Bar & Camera */}
                <div className="mb-1.5 flex items-center justify-between px-2">
                  <span className="flex items-center gap-1 text-[9.5px] font-extrabold uppercase tracking-wider text-white">
                    <Tablet className="h-3 w-3 text-[#00C6FF]" />
                    iPad 0{idx + 1} · {isLit ? 'LIT UP ✦' : `30s (${(proofPage % 3) + 1}/3)`}
                  </span>
                  <span className="h-2 w-2 rounded-full bg-white/80 ring-2 ring-[#00C6FF]/50" />
                  <button
                    type="button"
                    onClick={() => setProofPage((prev) => (prev + 1) % 3)}
                    className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[8.5px] font-extrabold text-white"
                    style={{ color: '#FFFFFF' }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                    <span style={{ color: '#FFFFFF' }}>Next ▸</span>
                  </button>
                </div>

                {/* Inner iPad Screen — Centered Symbol + Framed Live Info */}
                <div
                  className="flex flex-1 rounded-2xl p-[2.5px]"
                  style={{ background: TOP_BORDER_GRADIENT }}
                >
                  <div
                    className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-[13px] px-3.5 py-3 text-center text-[#0A2B6D]"
                    style={{ background: sprayBg }}
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-sm"
                      style={{ borderColor: getAppBorderView(idx + 3) }}
                    >
                      <Icon className="h-5 w-5" style={{ color: sym.iconColor }} />
                    </span>
                    <div className="w-full rounded-xl border border-[#0A2B6D]/20 bg-white/95 px-3 py-2 shadow-2xs">
                      <span className="text-xs font-extrabold leading-snug text-[#0A2B6D]">
                        {activeMsg}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom iPad Home Bar */}
                <div className="mt-1.5 flex justify-center">
                  <span className="h-1 w-12 rounded-full bg-white/80" />
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. Four Audit Steps Placed on Changeable Sticky Notes with Bigger Step Badges & Accurate 4-Step / 4-Note Count */}
        <ol className="grid w-full gap-4 pt-2 sm:grid-cols-2 lg:grid-cols-4 text-center items-stretch">
          {FLOW.map((item, index) => {
            const Icon = item.icon;
            const sym = getSymbolView(index + 5);
            const borderCol = getAppBorderView(index + 5);
            const noteIdx = stepNoteIndices[index] % item.notes.length;
            const currentNote = item.notes[noteIdx];

            return (
              <Reveal
                key={item.step}
                as="li"
                delay={(index % 4) * 0.06}
                className="group relative flex h-full flex-col justify-between rounded-2xl border-[3px] p-4 pt-5 text-center shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
                style={{
                  background: STICKY_NOTE_BG,
                  borderColor: STICKY_NOTE_BORDER,
                  borderBottomRightRadius: '26px',
                }}
              >
                {/* Top Sticky Tape Strip + Pin — Accurate 4-Step & 4-Note Count */}
                <div
                  className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border-2 border-[#0A2B6D] px-3.5 py-0.5 shadow-sm"
                  style={{ background: STICKY_NOTE_TAPE }}
                >
                  <Pin className="h-3 w-3 text-white" style={{ color: '#FFFFFF' }} />
                  <span
                    className="text-[10px] font-extrabold uppercase tracking-wider text-white whitespace-nowrap"
                    style={{ color: '#FFFFFF' }}
                  >
                    Audit Step {item.step} of 04 · Note {noteIdx + 1}/4
                  </span>
                </div>

                <div className="flex w-full flex-col items-center space-y-2.5">
                  <div className="flex w-full items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-sm"
                        style={{ borderColor: borderCol }}
                      >
                        <Icon className="h-5 w-5" style={{ color: sym.iconColor }} />
                      </span>
                      <span
                        className="rounded-full border-2 bg-white px-3.5 py-1 font-editorial text-sm sm:text-base md:text-lg font-extrabold text-[#0A2B6D] shadow-2xs"
                        style={{ borderColor: borderCol }}
                      >
                        Step {item.step}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => cycleStepNote(index)}
                      className="inline-flex items-center gap-1 rounded-full border-2 border-[#0A2B6D] bg-[#5A00D6] px-3 py-1 text-[10px] font-extrabold text-white shadow-2xs hover:opacity-95"
                      style={{ color: '#FFFFFF' }}
                    >
                      <RefreshCw className="h-3 w-3 text-white" style={{ color: '#FFFFFF' }} />
                      <span style={{ color: '#FFFFFF' }}>Next Note ▸</span>
                    </button>
                  </div>

                  <div
                    className="w-full rounded-xl p-[3px] shadow-2xs"
                    style={{ background: TOP_BORDER_GRADIENT }}
                  >
                    <div className="flex min-h-[48px] w-full items-center justify-center rounded-[9px] bg-white px-3 py-2 text-center">
                      <h3 className="font-editorial text-sm sm:text-base font-extrabold text-[#0A2B6D]">
                        {currentNote.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex min-h-[64px] w-full items-center justify-center rounded-xl border border-[#0A2B6D]/15 bg-white/95 px-3 py-2 text-center shadow-2xs">
                    <p
                      className="text-xs font-extrabold leading-snug text-black"
                      style={{ color: '#000000' }}
                    >
                      {currentNote.text}
                    </p>
                  </div>
                </div>

                {/* Live Functions Listed on Each Step Sticky Note */}
                <div
                  className="mt-3 w-full rounded-xl p-[2.5px] shadow-2xs"
                  style={{ background: TOP_BORDER_GRADIENT }}
                >
                  <div className="rounded-[9px] bg-white/95 p-2.5 text-left space-y-1">
                    <div className="flex items-center justify-between text-[9.5px] font-extrabold uppercase tracking-wider text-[#5A00D6]">
                      <span>Live Functions Included:</span>
                      <span>Note {noteIdx + 1}/4</span>
                    </div>
                    <ul className="space-y-1">
                      {currentNote.functions.map((fn) => (
                        <li
                          key={fn}
                          className="flex items-start gap-1.5 text-[11px] font-extrabold leading-tight text-[#0A2B6D]"
                        >
                          <CheckCircle2
                            className="mt-0.5 h-3 w-3 shrink-0"
                            style={{ color: STICKY_NOTE_BORDER }}
                          />
                          <span className="text-[#0A2B6D]">{fn}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}