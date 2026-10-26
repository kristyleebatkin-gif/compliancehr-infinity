import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  FileSpreadsheet,
  GraduationCap,
  Heart,
  MapPinned,
  Pin,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Users,
} from 'lucide-react';
import Reveal from '@/components/landing/Reveal';
import {
  getHeaderView,
  getSubheaderColourView,
  getSymbolView,
  getAppBorderView,
} from '@/lib/fullColourTiles';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';

const STICKY_NOTE_BG = 'linear-gradient(180deg, #FFF3FA 0%, #FFE4F5 100%)';
const STICKY_NOTE_BORDER = '#FF2E9A';
const STICKY_NOTE_TAPE = 'linear-gradient(90deg, #0072FF 0%, #5A00D6 50%, #FF2E9A 100%)';

const FEATURES = [
  {
    icon: Users,
    title: 'Workforce Records',
    notes: [
      {
        desc: 'Staff profiles, documents, certificates, teams and consent-aware audit access.',
        functions: [
          '100-Point Staff File Completeness',
          'NDIS Screening & Blue Card expiry alerts',
          'Instant Staff ID Badge & Name Tag Studio',
        ],
      },
      {
        desc: 'Automated workforce assurance, qualification checks and team leader assignments.',
        functions: [
          '2-Week & 90-Day Credential Warnings',
          'Staff Audit Consent Service-Role Lock',
          '1-Click Printable Staff File Audit PDF',
        ],
      },
    ],
  },
  {
    icon: Heart,
    title: 'Participant Records',
    notes: [
      {
        desc: 'Participant profiles, support plans, agreements and folder compliance checklists.',
        functions: [
          '1-Click Intake-to-Profile onboarding',
          '3-Part Consents (Sharing, Advocacy, Meds)',
          '10-weekly & 3-monthly review trackers',
        ],
      },
      {
        desc: 'Person-centred goals, medication charts, risk profiles and nominee approvals.',
        functions: [
          'Participant Portal & Visual Routines',
          'SAM Medication & Behaviour Support Plans',
          'Automated Details Check Email Reminders',
        ],
      },
    ],
  },
  {
    icon: CalendarClock,
    title: 'Rostering & Shift Notes',
    notes: [
      {
        desc: 'Plan by participant or worker, shifts, availability, handovers and payable hours.',
        functions: [
          'SCHADS qualification & fatigue gatekeeper',
          'Coverage heatmap & labour cost forecast',
          'Shift handover notes & goal progress sync',
        ],
      },
      {
        desc: '2-way calendar sync, open shift fill suggestions and weekly sign-off ledgers.',
        functions: [
          'Google Calendar & iCal 2-Way Feed',
          'AI Best-Match Worker Shift Suggestions',
          'Weekly Roster Sign-Off & Exception Log',
        ],
      },
    ],
  },
  {
    icon: BriefcaseBusiness,
    title: 'Performance Reviews',
    notes: [
      {
        desc: 'Online appraisals, review schedules and connected employment records.',
        functions: [
          '360° Staff Performance Appraisals',
          'Digital Employment Contracts & signing',
          'Automated probation & milestone reminders',
        ],
      },
      {
        desc: 'Position descriptions, HR letter generators and buddy shift onboarding trackers.',
        functions: [
          'Official HR Letter & Contract Templates',
          'Buddy Shift & Induction Checklist',
          'Employee Recognition & Milestone Awards',
        ],
      },
    ],
  },
  {
    icon: FileSpreadsheet,
    title: 'Invoicing & Payroll',
    notes: [
      {
        desc: 'NDIS invoices from rostered shifts, price-guide items and payroll reports.',
        functions: [
          'Shift-to-Invoice NDIS Price Guide builder',
          'Automated Staff Payslips & Pay Runs',
          'AI Receipt Scanner & Bank Reconciliation',
        ],
      },
      {
        desc: 'Aged receivables, NDIS service quotes, purchase orders and 3-way matching.',
        functions: [
          'NDIS Support Catalogue Item Suggest',
          '3-Way PO, Invoice & Receipt Match',
          '1-Click Email Payslips & Branded Quotes',
        ],
      },
    ],
  },
  {
    icon: AlertTriangle,
    title: 'Incident Clinic',
    notes: [
      {
        desc: 'Log, investigate and resolve incidents with 24h/5d alerts and full audit trails.',
        functions: [
          '24-hour & 5-day NDIS Commission timers',
          'Root-cause investigation & photo evidence',
          'Auto-routing to Compliance & Quality',
        ],
      },
      {
        desc: 'WHS regulator notifications, medication response logs and trend heatmaps.',
        functions: [
          'Reportable Incident Decision Guide',
          'Participant & Nominee Notification Log',
          'Live Incident Analytics & Severity Charts',
        ],
      },
    ],
  },
  {
    icon: ShieldAlert,
    title: 'Risk Management',
    notes: [
      {
        desc: 'Identify, assess and treat risks and hazards with a live register and controls.',
        functions: [
          'ISO 31000 Hierarchy of Controls matrix',
          '6-monthly Individual & Home Assessments',
          'Pre-shift Take-5 & vehicle safety checks',
        ],
      },
      {
        desc: 'Eliminate, minimise and isolate hazards with scheduled control reviews.',
        functions: [
          'Common NDIS Risk Library Starters',
          'Emergency Drills & Fire Kit Checklists',
          'MSDS Chemical & Equipment Manuals',
        ],
      },
    ],
  },
  {
    icon: GraduationCap,
    title: 'Training Tracking',
    notes: [
      {
        desc: 'Assign modules, track completions and stay on top of expiring certifications.',
        functions: [
          'Interactive LMS Learner Portal & streaks',
          'AI Course Author & AI Competency Quizzes',
          'Auto-issued signed PDF Certificates',
        ],
      },
      {
        desc: 'Skills gap analytics, volunteer training matrices and mandatory induction paths.',
        functions: [
          'Department Skills Gap Heatmap',
          'Automated 30-Day Cert Expiry Emails',
          'Master Skills & Instructions Studio',
        ],
      },
    ],
  },
  {
    icon: BadgeCheck,
    title: 'NDIS Governance',
    notes: [
      {
        desc: 'Registration groups, scheduled audits, renewals, reminders and Commission portals.',
        functions: [
          '8 NDIS Practice Standards control map',
          'Consent-gated External Auditor Portal',
          'Live NDIS Commission news & updates',
        ],
      },
      {
        desc: 'Board governance packs, KPI auto-calculators and statutory deadline trackers.',
        functions: [
          'NDIS Registration Group Scope Matrix',
          'Automated KPI & Quality Indicator Sync',
          '1-Click Executive Board Report PDF',
        ],
      },
    ],
  },
  {
    icon: ClipboardCheck,
    title: 'Express Audit & Certs',
    notes: [
      {
        desc: 'Complete internal audits in minutes with evidence attached and branded reports.',
        functions: [
          '2-Minute Express Audit generator',
          '356-Checkpoint Master Audit (CHR-AUD-001)',
          '1-Click Printable PDF Audit & Board Pack',
        ],
      },
      {
        desc: '6 structured compliance binders and 12 A4 printable master templates included.',
        functions: [
          '2026 Standard Printable Templates Suite',
          'Auto-Filed Corrective Action Tasks',
          'Weekly Automated Compliance Digest',
        ],
      },
    ],
  },
  {
    icon: MapPinned,
    title: 'Community Referral',
    notes: [
      {
        desc: 'Essential crisis contacts, verified providers and local services by postcode.',
        functions: [
          'Postcode-matched local referral directory',
          '24/7 Emergency & Crisis Quick-Dial hub',
          'Community Council & accessible events',
        ],
      },
      {
        desc: 'Send warm referrals, generate event flyers with AI and log community outcomes.',
        functions: [
          '1-Click Referral Form & Email Dispatch',
          'AI Event Ad & Flyer Image Builder',
          'Local Council Lookup by Postcode',
        ],
      },
    ],
  },
  {
    icon: Sparkles,
    title: 'Automation & Excel',
    notes: [
      {
        desc: 'Assisted checks, scheduled reminders and secure Excel import, preview and export.',
        functions: [
          '65+ live workflows & 100+ server functions',
          '30-Action & 30-Task PDF/CSV batch reports',
          '1-Click CSV/Excel import & export exchange',
        ],
      },
      {
        desc: 'AI Assistant chat, troubleshooter diagnostics and bi-directional GitHub sync.',
        functions: [
          '24/7 In-App Compliance AI Assistant',
          'Automated Daily Module Status Snapshots',
          'Tamper-Evident Data Control & Breach Log',
        ],
      },
    ],
  },
];

export default function FeaturesSection() {
  const [noteIndices, setNoteIndices] = useState(() => FEATURES.map(() => 0));

  useEffect(() => {
    const timer = setInterval(() => {
      setNoteIndices((prev) => prev.map((v, i) => (v + 1) % FEATURES[i].notes.length));
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const cycleNote = (idx) => {
    setNoteIndices((prev) =>
      prev.map((v, i) => (i === idx ? (v + 1) % FEATURES[idx].notes.length : v))
    );
  };

  const cycleAllNotes = () => {
    setNoteIndices((prev) => prev.map((v, i) => (v + 1) % FEATURES[i].notes.length));
  };

  return (
    <section
      id="features"
      className="w-full scroll-mt-16 rounded-3xl p-[12px] shadow-lg"
      style={{ background: TOP_BORDER_GRADIENT }}
    >
      <div className="flex w-full flex-col items-center justify-center rounded-[16px] bg-white px-4 py-5 sm:px-6 sm:py-6 text-center space-y-4">
        {/* Bigger "An impossible standard, achieved effortlessly" + Black Sentence Underneath */}
        <div
          className="w-full rounded-2xl p-[4px] shadow-sm"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div className="w-full rounded-[12px] bg-white px-5 py-5 sm:px-8 sm:py-6 text-center space-y-2.5">
            <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              <span className="text-[#0A2B6D]">An impossible </span>
              <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                standard,
              </span>{' '}
              <span className="inline-block whitespace-nowrap bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
                achieved effortlessly.
              </span>
            </h2>
            <p
              className="mx-auto max-w-4xl text-xs sm:text-sm md:text-base font-extrabold leading-relaxed text-black"
              style={{ color: '#000000' }}
            >
              One super-platform covering the full provider lifecycle, from intake, people and rostering to safety, HR, invoicing, registration, NDIS audit preparation and the live compliance tracker.
            </p>
          </div>
        </div>

        {/* Stretched Banner — Reduced Header, "12 Connected Engines" on Line 2, and Sticky Notes + Flip All Beside Each Other on One Line */}
        <div
          className="w-full rounded-3xl p-[3px] shadow-sm"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div
            className="gradient-brand flex min-h-[82px] w-full flex-col items-center justify-between gap-2 rounded-[21px] px-4 sm:px-6 py-2.5 text-center text-white"
            style={{ background: getHeaderView(5), color: '#FFFFFF' }}
          >
            <div className="flex flex-col items-center justify-center leading-tight">
              <div className="flex items-center justify-center gap-2 font-editorial text-sm sm:text-lg md:text-xl font-extrabold tracking-wide text-white">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
                  <Sparkles className="h-3.5 w-3.5 text-white" style={{ color: '#FFFFFF' }} />
                </span>
                <span className="text-center" style={{ color: '#FFFFFF' }}>
                  Latest Platform Capabilities
                </span>
              </div>
              <span className="mt-0.5 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white" style={{ color: '#FFFFFF' }}>
                · 12 Connected Engines
              </span>
            </div>

            <div className="flex w-full flex-nowrap items-center justify-between gap-2 pt-0.5">
              <div
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-white bg-white/20 px-3 py-0.5 text-[10.5px] sm:text-xs font-extrabold uppercase tracking-wider text-white shadow-2xs whitespace-nowrap"
                style={{ color: '#FFFFFF' }}
              >
                <Pin className="h-3 w-3 text-white shrink-0" style={{ color: '#FFFFFF' }} />
                <span style={{ color: '#FFFFFF' }}>Sticky Notes with Functions</span>
              </div>
              <button
                type="button"
                onClick={cycleAllNotes}
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-white bg-white/20 px-3 py-0.5 text-[10.5px] sm:text-xs font-extrabold text-white shadow-2xs hover:bg-white/30 whitespace-nowrap"
                style={{ color: '#FFFFFF' }}
              >
                <RefreshCw className="h-3 w-3 text-white shrink-0" style={{ color: '#FFFFFF' }} />
                <span style={{ color: '#FFFFFF' }}>Flip All 12 Sticky Notes ▸</span>
              </button>
            </div>
          </div>
        </div>

        {/* 12 Capability Sticky Notes — App-Coloured Numbers & Symbols, Smaller Next Note Button, All Sections Lined Up, App-Coloured Writing */}
        <div className="grid w-full grid-cols-1 gap-4 pt-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-fr text-center items-stretch">
          {FEATURES.map((f, index) => {
            const sym = getSymbolView(index);
            const borderCol = getAppBorderView(index);
            const activeNoteIdx = noteIndices[index] % f.notes.length;
            const currentNote = f.notes[activeNoteIdx];
            const titleAmpParts = f.title.includes(' & ') ? f.title.split(' & ') : null;

            return (
              <Reveal
                key={f.title}
                delay={(index % 6) * 0.04}
                className="group relative flex h-full flex-col justify-between rounded-2xl border-[3.5px] p-3.5 pt-5 text-center shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
                style={{
                  background: STICKY_NOTE_BG,
                  borderColor: borderCol,
                  borderBottomRightRadius: '26px',
                }}
              >
                {/* Top Sticky Tape Strip + Pin */}
                <div
                  className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border-2 border-[#0A2B6D] px-3.5 py-0.5 shadow-sm"
                  style={{ background: STICKY_NOTE_TAPE }}
                >
                  <Pin className="h-3 w-3 text-white" style={{ color: '#FFFFFF' }} />
                  <span
                    className="text-[10px] font-extrabold uppercase tracking-wider text-white whitespace-nowrap"
                    style={{ color: '#FFFFFF' }}
                  >
                    Capability #{index + 1} · Note {activeNoteIdx + 1}/{f.notes.length}
                  </span>
                </div>

                <div className="flex w-full flex-col items-center space-y-2">
                  {/* Top Row: App-Coloured Symbol + App-Coloured Number Badge + Reduced "Next Note ▸" Button */}
                  <div className="flex min-h-[38px] w-full items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-sm transition-transform group-hover:scale-105"
                        style={{ borderColor: borderCol }}
                      >
                        <f.icon className="h-4 w-4" style={{ color: sym.iconColor }} />
                      </span>
                      <span
                        className="rounded-full border-2 bg-white px-2.5 py-0.5 font-editorial text-xs sm:text-sm font-extrabold shadow-2xs whitespace-nowrap"
                        style={{ borderColor: borderCol, color: sym.iconColor }}
                      >
                        #{String(index + 1).padStart(2, '0')}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => cycleNote(index)}
                      className="inline-flex items-center gap-1 rounded-full border border-[#0A2B6D] bg-[#5A00D6] px-2 py-0.5 text-[9px] font-extrabold text-white shadow-2xs hover:opacity-95 whitespace-nowrap"
                      style={{ color: '#FFFFFF' }}
                    >
                      <RefreshCw className="h-2.5 w-2.5 text-white" style={{ color: '#FFFFFF' }} />
                      <span style={{ color: '#FFFFFF' }}>Next Note ▸</span>
                    </button>
                  </div>

                  {/* Section 1: Fixed-Height Heading Box in App Design Colour */}
                  <div
                    className="w-full rounded-xl p-[3px] shadow-2xs"
                    style={{ background: TOP_BORDER_GRADIENT }}
                  >
                    <div className="flex min-h-[52px] w-full flex-col items-center justify-center rounded-[9px] bg-white px-2.5 py-1.5 text-center">
                      <h3
                        className="font-editorial text-sm sm:text-[15px] font-extrabold leading-tight"
                        style={{ color: sym.iconColor }}
                      >
                        {titleAmpParts ? (
                          <>
                            <span className="block">{titleAmpParts[0]}</span>
                            <span className="block">&amp; {titleAmpParts.slice(1).join(' & ')}</span>
                          </>
                        ) : (
                          f.title
                        )}
                      </h3>
                    </div>
                  </div>

                  {/* Section 2: Fixed-Height Info Box in App Design Colour */}
                  <div
                    className="w-full rounded-xl p-[2.5px] shadow-2xs"
                    style={{ background: TOP_BORDER_GRADIENT }}
                  >
                    <div className="flex min-h-[68px] w-full items-center justify-center rounded-[9px] bg-white px-2.5 py-1.5 text-center">
                      <p className="text-[11.5px] font-extrabold leading-snug text-[#5A00D6]">
                        {currentNote.desc}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 3: Fixed-Height Live Functions Box Lined Up Across All 12 Tiles */}
                <div
                  className="mt-2.5 w-full rounded-xl p-[2.5px] shadow-2xs"
                  style={{ background: TOP_BORDER_GRADIENT }}
                >
                  <div className="flex min-h-[124px] flex-col justify-between rounded-[9px] bg-white p-2.5 text-left">
                    <div className="flex items-center justify-between text-[9px] font-extrabold uppercase tracking-wider text-[#5A00D6]">
                      <span>Live Functions Included:</span>
                      <span>Note {activeNoteIdx + 1}/{f.notes.length}</span>
                    </div>
                    <ul className="grid grid-cols-1 grid-rows-3 gap-1 pt-1">
                      {currentNote.functions.map((fn, fIdx) => {
                        const fSym = getSymbolView(index + fIdx);
                        return (
                          <li
                            key={fn}
                            className="flex min-h-[28px] items-center gap-1.5 text-[10.5px] font-extrabold leading-tight"
                          >
                            <span
                              className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-2xs"
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
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}