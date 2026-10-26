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

        {/* 6 Projector Screens — Halved in Size With App-Design Coloured Header Tiles */}
        <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 auto-rows-fr text-center items-stretch">
          {BENEFITS.map((b, index) => {
            const borderCol = getAppBorderView(index);
            const totalNotes = b.notes.length;
            const activeNoteIdx = noteIndices[index] % totalNotes;
            const currentFunctions = b.notes[activeNoteIdx];
            return (
              <Reveal
                key={b.title}
                delay={(index % 6) * 0.05}
                className="group flex h-full flex-col items-center justify-between"
              >
                {/* Top Projector Roller Bar */}
                <div className="flex w-full flex-col items-center">
                  <div
                    className="flex w-full items-center justify-between rounded-full border border-[#0A2B6D] px-2 py-0.5 shadow-2xs"
                    style={{ background: getHeaderView(index) }}
                  >
                    <span className="flex items-center gap-1 text-[7.5px] font-extrabold uppercase tracking-wider text-white">
                      <Projector className="h-2.5 w-2.5 text-white" style={{ color: '#FFFFFF' }} />
                      <span style={{ color: '#FFFFFF' }}>PROJ 0{index + 1}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => cycleNote(index)}
                      className="rounded-full bg-white/25 px-1.5 py-0 text-[6.5px] font-extrabold text-white"
                      style={{ color: '#FFFFFF' }}
                    >
                      {activeNoteIdx + 1}/{totalNotes} ▸
                    </button>
                  </div>
                </div>

                {/* Pull-Down Projector Screen Canvas — 50% Smaller */}
                <div
                  className="mx-auto flex w-[96%] flex-1 flex-col border-x-2 border-b-2 border-[#0A2B6D] p-[2px] shadow-2xs"
                  style={{ background: TOP_BORDER_GRADIENT }}
                >
                  <div
                    className="flex h-full flex-1 flex-col justify-between gap-1 rounded-b-[8px] p-1.5 text-center"
                    style={{ background: UNIFORM_SCREEN_SPRAY_BG }}
                  >
                    {/* App-Design Coloured Header Bar */}
                    <div
                      className="gradient-brand flex min-h-[22px] w-full items-center justify-center gap-1 rounded-md px-1.5 py-0.5 text-center text-white"
                      style={{ background: getHeaderView(index), color: '#FFFFFF' }}
                    >
                      <b.icon className="h-2.5 w-2.5 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                      <span className="text-[8px] font-extrabold leading-tight text-white" style={{ color: '#FFFFFF' }}>
                        {b.title}
                      </span>
                    </div>

                    {/* Compact Description Box */}
                    <div className="flex items-center justify-center rounded-[6px] bg-white px-1.5 py-0.5 text-center">
                      <p className="text-center text-[7.5px] font-extrabold leading-tight text-[#0A2B6D]">
                        {b.desc}
                      </p>
                    </div>

                    {/* Compact Functions Box */}
                    <div
                      className="rounded-lg border p-1 text-left"
                      style={{ background: STICKY_NOTE_BG, borderColor: borderCol }}
                    >
                      <ul className="space-y-0.5">
                        {currentFunctions.map((fn, fIdx) => {
                          const fSym = getSymbolView(index + fIdx);
                          return (
                            <li
                              key={fn}
                              className="flex items-center gap-1 text-[7.5px] font-extrabold leading-tight"
                            >
                              <CheckCircle2 className="h-2 w-2 shrink-0" style={{ color: fSym.iconColor }} />
                              <span style={{ color: fSym.iconColor }}>{fn}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Bottom Projector Weighted Bar */}
                <div className="h-1 w-full rounded-full bg-[#0A2B6D]" />
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}