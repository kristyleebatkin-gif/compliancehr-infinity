import React from 'react';
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

const SPRAY_BGS = [
  'radial-gradient(circle at 14% 18%, rgba(255, 133, 224, 0.62) 0%, transparent 48%), radial-gradient(circle at 86% 24%, rgba(56, 189, 248, 0.62) 0%, transparent 48%), radial-gradient(circle at 50% 86%, rgba(192, 132, 252, 0.62) 0%, transparent 52%), #FFFFFF',
  'radial-gradient(circle at 18% 82%, rgba(56, 189, 248, 0.62) 0%, transparent 48%), radial-gradient(circle at 84% 20%, rgba(192, 132, 252, 0.62) 0%, transparent 48%), radial-gradient(circle at 48% 36%, rgba(255, 133, 224, 0.56) 0%, transparent 50%), #FFFFFF',
  'radial-gradient(circle at 16% 28%, rgba(192, 132, 252, 0.62) 0%, transparent 48%), radial-gradient(circle at 84% 78%, rgba(255, 133, 224, 0.62) 0%, transparent 48%), radial-gradient(circle at 54% 18%, rgba(56, 189, 248, 0.58) 0%, transparent 50%), #FFFFFF',
  'radial-gradient(circle at 84% 22%, rgba(255, 133, 224, 0.62) 0%, transparent 48%), radial-gradient(circle at 16% 78%, rgba(56, 189, 248, 0.62) 0%, transparent 48%), radial-gradient(circle at 48% 52%, rgba(192, 132, 252, 0.58) 0%, transparent 52%), #FFFFFF',
];

// All 6 sticky notes use the exact same warm sticky-note colour & border
const STICKY_NOTE_BG = 'linear-gradient(180deg, #FFF3FA 0%, #FFE4F5 100%)';
const STICKY_NOTE_BORDER = '#FF2E9A';
const STICKY_NOTE_TAPE = 'linear-gradient(90deg, #0072FF 0%, #5A00D6 50%, #FF2E9A 100%)';

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: 'Stay Compliant',
    desc: 'Live compliance trackers show every document in every area is fully compliant, every day.',
    functions: [
      'Automated 90/60/30-day expiry scans',
      '100-Point Staff File Completeness',
      'Live NDIS Practice Standards matrix',
    ],
  },
  {
    icon: ShieldAlert,
    title: 'Reduce Risk',
    desc: 'Identify, assess, and manage risks before they become incidents.',
    functions: [
      '24h & 5-day NDIS Commission timers',
      'Hierarchy of Controls risk register',
      'Pre-shift Take-5 & 6-monthly checks',
    ],
  },
  {
    icon: TrendingUp,
    title: 'Improve Quality',
    desc: 'Deliver safe, consistent, and high-quality supports across every shift.',
    functions: [
      'Shift handover notes & goal logs',
      'Continuous improvement action board',
      'Participant satisfaction surveys',
    ],
  },
  {
    icon: ClipboardCheck,
    title: 'Audit Ready in Minutes',
    desc: 'Express internal audits with evidence and corrective actions captured automatically.',
    functions: [
      '2-Minute Express Audit generator',
      '356-Checkpoint Master Audit Suite',
      '1-Click Printable PDF Audit Pack',
    ],
  },
  {
    icon: RefreshCw,
    title: 'Continuous Improvement',
    desc: 'Use live data and feedback to drive better participant and workforce outcomes.',
    functions: [
      'Auto-routed feedback & complaints',
      '30-Action & 30-Task batch reports',
      'KPI auto-calculation & board packs',
    ],
  },
  {
    icon: Lock,
    title: 'Secure & Role-Based',
    desc: 'Granular access keeps sensitive participant and staff data protected and private.',
    functions: [
      'Strict RLS across 115+ database entities',
      'Service-role 3-Part Consent locks',
      'Consent-gated NDIS Auditor Portal',
    ],
  },
];

export default function BenefitsSection() {
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
              <span className="text-[#0A2B6D]">Compliance</span>
              <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                HR
              </span>{' '}
              <span className="bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
                Infinity
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

        {/* Stretched Side-to-Side Banner Underneath in App Design Coloured Border */}
        <div
          className="w-full rounded-full p-[3px] shadow-sm"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div
            className="gradient-brand flex min-h-[44px] w-full items-center justify-center gap-2.5 rounded-full px-6 py-2 text-xs sm:text-sm md:text-base font-extrabold tracking-wide text-white"
            style={{ background: getHeaderView(3), color: '#FFFFFF' }}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
              <Projector className="h-3.5 w-3.5 text-white" style={{ color: '#FFFFFF' }} />
            </span>
            <span className="text-center" style={{ color: '#FFFFFF' }}>
              Built For Better Services · Why Providers Choose Us (Projector Screens)
            </span>
          </div>
        </div>

        {/* 6 Tiles Under Built For Better Services Styled as Pull-Down Projector Screens + 6 Matching Sticky Notes */}
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 auto-rows-fr text-center">
          {BENEFITS.map((b, index) => {
            const sym = getSymbolView(index + 2);
            const borderCol = getAppBorderView(index + 2);
            const sprayBg = SPRAY_BGS[index % SPRAY_BGS.length];
            return (
              <Reveal
                key={b.title}
                delay={(index % 6) * 0.05}
                className="group flex h-full flex-col items-center justify-between"
              >
                {/* Top Projector Ceiling Mount & Roller Casing Bar */}
                <div className="flex w-full flex-col items-center">
                  <div className="flex w-4/5 items-center justify-between px-2">
                    <span className="h-2 w-2 rounded-t bg-[#0A2B6D]" />
                    <span className="h-2 w-2 rounded-t bg-[#0A2B6D]" />
                  </div>
                  <div
                    className="flex w-full items-center justify-between rounded-full border-2 border-[#0A2B6D] px-3 py-1 shadow-md"
                    style={{ background: getHeaderView(index) }}
                  >
                    <span className="flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider text-white">
                      <Projector className="h-3 w-3 text-white" style={{ color: '#FFFFFF' }} />
                      <span style={{ color: '#FFFFFF' }}>SCREEN 0{index + 1}</span>
                    </span>
                    <span className="h-2 w-2 rounded-full bg-[#00C6FF]" />
                  </div>
                </div>

                {/* Pull-Down Projector Screen Canvas */}
                <div
                  className="mx-auto flex w-[96%] flex-1 flex-col border-x-[3px] border-b-[3px] border-[#0A2B6D] bg-white p-[3px] shadow-md transition-all group-hover:shadow-lg"
                  style={{ background: TOP_BORDER_GRADIENT }}
                >
                  <div
                    className="flex h-full flex-1 flex-col items-center justify-between rounded-b-[10px] p-3 text-center space-y-2.5"
                    style={{ background: sprayBg }}
                  >
                    <div className="flex w-full flex-col items-center space-y-2">
                      <span
                        className="flex h-10 w-10 items-center justify-center rounded-full border-2 bg-white shadow-sm transition-transform group-hover:scale-105"
                        style={{ borderColor: borderCol }}
                      >
                        <b.icon className="h-5 w-5" style={{ color: sym.iconColor }} />
                      </span>

                      <div
                        className="w-full rounded-xl p-[2.5px] shadow-2xs"
                        style={{ background: TOP_BORDER_GRADIENT }}
                      >
                        <div className="flex min-h-[38px] w-full items-center justify-center rounded-[9px] bg-white px-2.5 py-1.5 text-center">
                          <h3 className="font-editorial text-xs sm:text-sm font-extrabold text-center text-[#0A2B6D]">
                            {b.title}
                          </h3>
                        </div>
                      </div>

                      <p
                        className="text-center text-xs font-bold leading-snug text-black"
                        style={{ color: '#000000' }}
                      >
                        {b.desc}
                      </p>
                    </div>

                    {/* Sticky Note in the Same Colour Across All 6 Projector Screens with Live Functions */}
                    <div
                      className="relative mt-2 flex w-full flex-col justify-between rounded-xl border-2 p-2.5 pt-3.5 text-left shadow-md"
                      style={{
                        background: STICKY_NOTE_BG,
                        borderColor: STICKY_NOTE_BORDER,
                        borderBottomRightRadius: '18px',
                      }}
                    >
                      {/* Top Sticky Tape Strip + Pin */}
                      <div
                        className="absolute -top-2 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-[#0A2B6D] px-2.5 py-0.5 shadow-2xs"
                        style={{ background: STICKY_NOTE_TAPE }}
                      >
                        <Pin className="h-2.5 w-2.5 text-white" style={{ color: '#FFFFFF' }} />
                        <span
                          className="text-[9px] font-extrabold uppercase tracking-wider text-white whitespace-nowrap"
                          style={{ color: '#FFFFFF' }}
                        >
                          Functions Note
                        </span>
                      </div>

                      <ul className="space-y-1 pt-0.5">
                        {b.functions.map((fn) => (
                          <li
                            key={fn}
                            className="flex items-start gap-1.5 text-[10.5px] font-extrabold leading-tight text-[#0A2B6D]"
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