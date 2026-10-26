import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  TrendingUp,
  ClipboardCheck,
  RefreshCw,
  Lock,
  CheckCircle2,
  Pin,
  Projector,
} from 'lucide-react';
import Reveal from '@/components/landing/Reveal';
import {
  getHeaderView,
  getSymbolView,
  getAppBorderView,
} from '@/lib/fullColourTiles';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';

const UNIFORM_SCREEN_SPRAY_BG =
  'radial-gradient(circle at 14% 18%, rgba(255, 133, 224, 0.62) 0%, transparent 48%), radial-gradient(circle at 86% 24%, rgba(56, 189, 248, 0.62) 0%, transparent 48%), radial-gradient(circle at 50% 86%, rgba(192, 132, 252, 0.62) 0%, transparent 52%), #FFFFFF';
const UNIFORM_PROJECTOR_HEADER = getHeaderView(1);
const UNIFORM_ICON_BORDER = '#5A00D6';
const UNIFORM_ICON_COLOR = '#0072FF';
const STICKY_NOTE_BG = 'linear-gradient(180deg, #FFF3FA 0%, #FFE4F5 100%)';
const STICKY_NOTE_BORDER = '#FF2E9A';
const STICKY_NOTE_TAPE = 'linear-gradient(90deg, #0072FF 0%, #5A00D6 50%, #FF2E9A 100%)';

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: 'Stay Compliant',
    desc: 'Live compliance trackers show every document in every area is fully compliant, every day.',
    notes: [
      [
        'Automated 90/60/30-day expiry scans',
        '100-Point Staff File Completeness',
        'Live NDIS Practice Standards matrix',
      ],
      [
        'Roster screening & qualification gate',
        'Daily module compliance snapshots',
        'Instant email & in-app renewal alerts',
      ],
      [
        'Policy version & read-receipt tracker',
        'Key personnel delegation register',
        'Tamper-evident user action audit log',
      ],
    ],
  },
  {
    icon: ShieldAlert,
    title: 'Reduce Risk',
    desc: 'Identify, assess, and manage risks before they become incidents.',
    notes: [
      [
        '24h & 5-day NDIS Commission timers',
        'Hierarchy of Controls risk register',
        'Pre-shift Take-5 & 6-monthly checks',
      ],
      [
        'Individual & Home Risk Assessments',
        'Emergency drills & safety kit logs',
        'MSDS chemical & equipment manuals',
      ],
      [
        'Dynamic Staff Risk Score threshold alerts',
        'Vehicle safety & fleet maintenance logs',
        'Root-cause incident CAPA workflows',
      ],
    ],
  },
  {
    icon: TrendingUp,
    title: 'Improve Quality',
    desc: 'Deliver safe, consistent, and high-quality supports across every shift.',
    notes: [
      [
        'Shift handover notes & goal logs',
        'Continuous improvement action board',
        'Participant satisfaction surveys',
      ],
      [
        'AI Goal Coach & funding charts',
        'Visual routines & communication pads',
        '10-weekly & 3-monthly review logs',
      ],
      [
        'Multilingual translator & sign prompts',
        'Group programs & accessible events',
        'Warm allied-health referral letters',
      ],
    ],
  },
  {
    icon: ClipboardCheck,
    title: 'Audit Ready in Minutes',
    desc: 'Express internal audits with evidence and corrective actions captured automatically.',
    notes: [
      [
        '2-Minute Express Audit generator',
        '356-Checkpoint Master Audit Suite',
        '1-Click Printable PDF Audit Pack',
      ],
      [
        '6 Structured Binders + 12 A4 Masters',
        'Auto-filed corrective action tasks',
        'Direct Vault evidence attachment',
      ],
      [
        'CHR-AUD-001 Governance Edition',
        'CHR-AUD-002 Workforce Edition',
        'Scheduled 90-day & 6-monthly audits',
      ],
    ],
  },
  {
    icon: RefreshCw,
    title: 'Continuous Improvement',
    desc: 'Use live data and feedback to drive better participant and workforce outcomes.',
    notes: [
      [
        'Auto-routed feedback & complaints',
        '30-Action & 30-Task batch reports',
        'KPI auto-calculation & board packs',
      ],
      [
        '5-Day Complaint SLA escalation tracker',
        'Weekly automated compliance digests',
        'Executive Business Health dashboard',
      ],
      [
        'AI Suggestions Hub & 46-screen scanner',
        'Departmental compliance scorecards',
        'Strategic business project milestones',
      ],
    ],
  },
  {
    icon: Lock,
    title: 'Secure & Role-Based',
    desc: 'Granular access keeps sensitive participant and staff data protected and private.',
    notes: [
      [
        'Strict RLS across 115+ database entities',
        'Service-role 3-Part Consent locks',
        'Consent-gated NDIS Auditor Portal',
      ],
      [
        'Admin approval gate for new users',
        'Tamper-evident user action logs',
        'Private encrypted file storage URIs',
      ],
      [
        'Notifiable Data Breach (NDB) register',
        '15 granular NDIS & HR role levels',
        'Company Safe locked credential vault',
      ],
    ],
  },
];

export default function BenefitsSection() {
  const [noteIndices, setNoteIndices] = useState(() => BENEFITS.map(() => 0));

  useEffect(() => {
    const timer = setInterval(() => {
      setNoteIndices((prev) => prev.map((v, i) => (v + 1) % BENEFITS[i].notes.length));
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const cycleNote = (idx) => {
    setNoteIndices((prev) =>
      prev.map((v, i) => (i === idx ? (v + 1) % BENEFITS[idx].notes.length : v))
    );
  };

  return (
    <section
      id="benefits"
      className="w-full scroll-mt-16 rounded-3xl p-[12px] shadow-lg"
      style={{ background: TOP_BORDER_GRADIENT }}
    >
      <div className="flex w-full flex-col items-center justify-center rounded-[16px] bg-white px-4 py-5 sm:px-6 sm:py-6 text-center space-y-4">
        {/* Heading & Black Subheading Centred Inside Stretched App Design Coloured Border */}
        <div
          className="w-full rounded-2xl p-[4px] shadow-sm"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div className="flex w-full flex-col items-center justify-center rounded-[12px] bg-white px-4 py-4 sm:px-6 sm:py-5 text-center space-y-2">
            <h2 className="mx-auto text-center font-editorial text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight leading-snug">
              <span className="text-[#0A2B6D]">Why providers choose </span>
              <span className="inline-block whitespace-nowrap">
                <span className="text-[#0A2B6D]">Compliance</span>
                <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                  HR
                </span>{' '}
                <span className="bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
                  Infinity
                </span>
              </span>
            </h2>
            <p
              className="mx-auto max-w-4xl text-center text-xs sm:text-sm font-extrabold leading-relaxed text-black"
              style={{ color: '#000000' }}
            >
              The smartest, simplest, easiest and most effortless way to store, copy, use, audit, share, scan, send, sort, file and report on every document, conversation and outcome, while saving you time, money and effort.
            </p>
          </div>
        </div>

        {/* Stretched Side-to-Side Banner Underneath — "Projector Screens" Placed on Line 2 Under "Built For Better Services" */}
        <div
          className="w-full rounded-3xl p-[3px] shadow-sm"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div
            className="gradient-brand flex min-h-[58px] w-full flex-col items-center justify-center gap-0.5 rounded-[21px] px-6 py-2.5 text-center text-white"
            style={{ background: getHeaderView(3), color: '#FFFFFF' }}
          >
            <div className="flex items-center justify-center gap-2 text-xs sm:text-sm md:text-base font-extrabold tracking-wide text-white">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
                <Projector className="h-3.5 w-3.5 text-white" style={{ color: '#FFFFFF' }} />
              </span>
              <span style={{ color: '#FFFFFF' }}>
                Built For Better Services · Why Providers Choose Us
              </span>
            </div>
            <div
              className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-white"
              style={{ color: '#FFFFFF' }}
            >
              Projector Screens · 6 Projectors · 3 Notes Per Screen
            </div>
          </div>
        </div>

        {/* 6 Projector Screens — All Sections Lined Up Horizontally, Symbols & Writing in App Design Colour */}
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 auto-rows-fr text-center items-stretch">
          {BENEFITS.map((b, index) => {
            const sym = getSymbolView(index);
            const borderCol = getAppBorderView(index);
            const totalNotes = b.notes.length;
            const activeNoteIdx = noteIndices[index] % totalNotes;
            const currentFunctions = b.notes[activeNoteIdx];
            const titleAmpParts = b.title.includes(' & ') ? b.title.split(' & ') : null;
            return (
              <Reveal
                key={b.title}
                delay={(index % 6) * 0.05}
                className="group flex h-full flex-col items-center justify-between"
              >
                {/* Top Projector Ceiling Mount & Identical Roller Casing Bar */}
                <div className="flex w-full flex-col items-center">
                  <div className="flex w-4/5 items-center justify-between px-2">
                    <span className="h-2 w-2 rounded-t bg-[#0A2B6D]" />
                    <span className="h-2 w-2 rounded-t bg-[#0A2B6D]" />
                  </div>
                  <div
                    className="flex w-full items-center justify-between rounded-full border-2 border-[#0A2B6D] px-3 py-1 shadow-md"
                    style={{ background: UNIFORM_PROJECTOR_HEADER }}
                  >
                    <span className="flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider text-white">
                      <Projector className="h-3 w-3 text-white" style={{ color: '#FFFFFF' }} />
                      <span style={{ color: '#FFFFFF' }}>PROJECTOR 0{index + 1}</span>
                    </span>
                    <span className="h-2 w-2 rounded-full bg-[#10B981]" />
                  </div>
                </div>

                {/* Pull-Down Projector Screen Canvas — Fixed Section Heights So All 6 Line Up */}
                <div
                  className="mx-auto flex w-[96%] flex-1 flex-col border-x-[3px] border-b-[3px] border-[#0A2B6D] bg-white p-[3px] shadow-md transition-all group-hover:shadow-lg"
                  style={{ background: TOP_BORDER_GRADIENT }}
                >
                  <div
                    className="grid h-full flex-1 grid-cols-1 grid-rows-[38px_48px_68px_1fr] gap-2 rounded-b-[10px] p-3 text-center"
                    style={{ background: UNIFORM_SCREEN_SPRAY_BG }}
                  >
                    {/* Section 1: Fixed-Height Top Row (Symbol + Number + Next Button) */}
                    <div className="flex h-[38px] w-full items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-sm transition-transform group-hover:scale-105"
                          style={{ borderColor: borderCol }}
                        >
                          <b.icon className="h-4 w-4" style={{ color: sym.iconColor }} />
                        </span>
                        <span
                          className="rounded-full border-2 bg-white px-2.5 py-0.5 font-editorial text-xs sm:text-sm font-extrabold shadow-2xs"
                          style={{ borderColor: borderCol, color: sym.iconColor }}
                        >
                          #0{index + 1}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => cycleNote(index)}
                        className="inline-flex items-center gap-1 rounded-full border border-[#0A2B6D] bg-[#5A00D6] px-2 py-0.5 text-[9px] font-extrabold text-white shadow-2xs hover:opacity-95 whitespace-nowrap"
                        style={{ color: '#FFFFFF' }}
                      >
                        <RefreshCw className="h-2.5 w-2.5 text-white" style={{ color: '#FFFFFF' }} />
                        <span style={{ color: '#FFFFFF' }}>Next ▸</span>
                      </button>
                    </div>

                    {/* Section 2: Fixed-Height Title Box in App Design Colour */}
                    <div
                      className="flex h-[48px] w-full rounded-xl p-[2.5px] shadow-2xs"
                      style={{ background: TOP_BORDER_GRADIENT }}
                    >
                      <div className="flex h-full w-full flex-col items-center justify-center rounded-[9px] bg-white px-2 py-1 text-center">
                        <h3
                          className="font-editorial text-xs sm:text-sm font-extrabold leading-tight text-center"
                          style={{ color: sym.iconColor }}
                        >
                          {titleAmpParts ? (
                            <>
                              <span className="block">{titleAmpParts[0]}</span>
                              <span className="block">&amp; {titleAmpParts.slice(1).join(' & ')}</span>
                            </>
                          ) : (
                            b.title
                          )}
                        </h3>
                      </div>
                    </div>

                    {/* Section 3: Fixed-Height Description Box in App Design Colour */}
                    <div
                      className="flex h-[68px] w-full rounded-xl p-[2.5px] shadow-2xs"
                      style={{ background: TOP_BORDER_GRADIENT }}
                    >
                      <div className="flex h-full w-full items-center justify-center rounded-[9px] bg-white px-2 py-1 text-center">
                        <p className="text-center text-[10.5px] font-extrabold leading-snug text-[#5A00D6]">
                          {b.desc}
                        </p>
                      </div>
                    </div>

                    {/* Section 4: Changeable Sticky Note With App-Design Coloured Outline, Symbols & Writing */}
                    <div
                      className="relative mt-1 flex h-full w-full flex-col justify-between rounded-2xl border-[2.5px] p-2.5 pt-4 text-left shadow-md"
                      style={{
                        background: STICKY_NOTE_BG,
                        borderColor: borderCol,
                        borderBottomRightRadius: '20px',
                      }}
                    >
                      <div
                        className="absolute -top-2.5 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-[#0A2B6D] px-2.5 py-0.5 shadow-2xs"
                        style={{ background: STICKY_NOTE_TAPE }}
                      >
                        <Pin className="h-2.5 w-2.5 text-white" style={{ color: '#FFFFFF' }} />
                        <span
                          className="text-[8.5px] font-extrabold uppercase tracking-wider text-white whitespace-nowrap"
                          style={{ color: '#FFFFFF' }}
                        >
                          Screen #0{index + 1} · Note {activeNoteIdx + 1}/{totalNotes}
                        </span>
                      </div>

                      <div
                        className="flex h-full w-full rounded-xl p-[2px]"
                        style={{ background: TOP_BORDER_GRADIENT }}
                      >
                        <div className="flex h-full w-full flex-col justify-between rounded-[9px] bg-white p-2">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#5A00D6]">
                              Live Functions:
                            </span>
                            <span className="text-[8.5px] font-extrabold" style={{ color: sym.iconColor }}>
                              {activeNoteIdx + 1} of {totalNotes}
                            </span>
                          </div>

                          <ul className="grid grid-cols-1 grid-rows-3 gap-1 pt-1">
                            {currentFunctions.map((fn, fIdx) => {
                              const fSym = getSymbolView(index + fIdx);
                              return (
                                <li
                                  key={fn}
                                  className="flex min-h-[24px] items-center gap-1.5 text-[10px] font-extrabold leading-tight"
                                >
                                  <span
                                    className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border bg-white"
                                    style={{ borderColor: getAppBorderView(index + fIdx) }}
                                  >
                                    <CheckCircle2
                                      className="h-2.5 w-2.5"
                                      style={{ color: fSym.iconColor }}
                                    />
                                  </span>
                                  <span style={{ color: fSym.iconColor }}>{fn}</span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Projector Weighted Bar & Pull Ring Handle */}
                <div className="flex w-full flex-col items-center">
                  <div className="h-2 w-full rounded-full bg-[#0A2B6D] shadow-sm" />
                  <div className="h-2 w-0.5 bg-[#0A2B6D]" />
                  <div className="h-3 w-3 rounded-full border-2 border-[#0A2B6D] bg-white shadow-2xs" />
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}