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
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Users,
} from 'lucide-react';
import Reveal from '@/components/landing/Reveal';
import {
  getHeaderView,
  getSymbolView,
  getAppBorderView,
} from '@/lib/fullColourTiles';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';

const STICKY_NOTE_BG =
  '#FFFFFF';
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
      <div
        className="flex w-full flex-col items-center justify-center rounded-[16px] px-4 py-5 sm:px-6 sm:py-6 text-center space-y-4"
        style={{ background: STICKY_NOTE_BG }}
      >
        {/* "An impossible standard, achieved effortlessly." — Clean White Background */}
        <div
          className="w-full rounded-2xl p-[3px] shadow-sm"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div className="w-full rounded-[12px] bg-white px-4 py-3 sm:px-6 sm:py-3.5 text-center space-y-1.5">
            <h2 className="font-editorial text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
              <span className="text-[#0A2B6D]">An impossible </span>
              <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                standard,
              </span>{' '}
              <span className="inline-block whitespace-nowrap bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
                achieved effortlessly.
              </span>
            </h2>
            <p className="mx-auto max-w-4xl text-[10.5px] sm:text-xs md:text-sm font-extrabold leading-relaxed text-[#0A2B6D]">
              One super-platform covering the full provider lifecycle, from intake, people and rostering to safety, HR, invoicing, registration, NDIS audit preparation and the live compliance tracker.
            </p>
          </div>
        </div>

        {/* One-Line Stretched Banner: "Latest Platform Capabilities · 12 Connected Engines" & "Flip All 12 Sticky Notes ▸" on One Line ("Sticky Notes with Functions" Removed) */}
        <div
          className="w-full rounded-full p-[2px] shadow-2xs"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div
            className="gradient-brand flex min-h-[26px] w-full flex-nowrap items-center justify-between gap-2 rounded-full px-3 sm:px-4 py-0.5 text-white whitespace-nowrap"
            style={{ background: getHeaderView(5), color: '#FFFFFF' }}
          >
            <div className="flex items-center gap-1.5 font-editorial text-[10px] sm:text-xs md:text-sm font-extrabold tracking-wide text-white whitespace-nowrap">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-white bg-white/20 text-white">
                <Sparkles className="h-2.5 w-2.5 text-white" style={{ color: '#FFFFFF' }} />
              </span>
              <span style={{ color: '#FFFFFF' }}>
                Latest Platform Capabilities · 12 Connected Engines
              </span>
            </div>

            <button
              type="button"
              onClick={cycleAllNotes}
              className="inline-flex items-center gap-1 rounded-full border border-white bg-white/20 px-2.5 py-0.5 text-[8px] sm:text-[9px] font-extrabold text-white shadow-2xs hover:bg-white/30 whitespace-nowrap"
              style={{ color: '#FFFFFF' }}
            >
              <RefreshCw className="h-2.5 w-2.5 text-white shrink-0" style={{ color: '#FFFFFF' }} />
              <span style={{ color: '#FFFFFF' }}>Flip All 12 Sticky Notes ▸</span>
            </button>
          </div>
        </div>

        {/* 12 Capability Sticky Notes — 50% Smaller & Fixed Note Count (Note 1–12 of 12 · Page 1–2) */}
        <div className="grid w-full grid-cols-2 gap-1.5 pt-1 sm:grid-cols-3 lg:grid-cols-6 auto-rows-fr text-center items-stretch">
          {FEATURES.map((f, index) => {
            const borderCol = getAppBorderView(index);
            const sym = getSymbolView(index);
            const activeNoteIdx = noteIndices[index] % f.notes.length;
            const currentNote = f.notes[activeNoteIdx];

            return (
              <Reveal
                key={f.title}
                delay={(index % 6) * 0.04}
                className="group relative flex h-full flex-col justify-between rounded-lg border-2 p-1 pt-2.5 text-center shadow-2xs transition-all hover:-translate-y-0.5"
                style={{
                  borderColor: borderCol,
                  borderBottomRightRadius: '12px',
                  background: STICKY_NOTE_BG,
                }}
              >
                {/* 50% Smaller Top Sticky Tape Strip + Fixed Note Count */}
                <div
                  className="absolute -top-2 left-1/2 flex -translate-x-1/2 items-center gap-0.5 rounded-full border border-white px-1.5 py-0 shadow-2xs"
                  style={{ background: getHeaderView(index) }}
                >
                  <span className="flex h-3 w-3 items-center justify-center rounded-full bg-white text-[6px] font-extrabold" style={{ color: sym.iconColor }}>
                    {index + 1}
                  </span>
                  <span
                    className="text-[6.5px] font-extrabold uppercase tracking-wider text-white whitespace-nowrap"
                    style={{ color: '#FFFFFF' }}
                  >
                    Note {index + 1}/12 · {activeNoteIdx + 1}/{f.notes.length}
                  </span>
                </div>

                <div className="flex w-full flex-col items-center space-y-0.5">
                  <div
                    className="gradient-brand flex min-h-[18px] w-full items-center justify-between gap-1 rounded px-1 py-0 text-white"
                    style={{ background: getHeaderView(index), color: '#FFFFFF' }}
                  >
                    <span className="inline-flex items-center gap-1 text-[7px] font-extrabold leading-tight text-white truncate">
                      <span className="flex h-3 w-3 shrink-0 items-center justify-center rounded-full bg-white">
                        <f.icon className="h-2 w-2" style={{ color: sym.iconColor }} />
                      </span>
                      <span className="truncate" style={{ color: '#FFFFFF' }}>{f.title}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => cycleNote(index)}
                      className="shrink-0 rounded-full border border-white bg-white/20 px-1 py-0 text-[6px] font-extrabold text-white"
                      style={{ color: '#FFFFFF' }}
                    >
                      ▸
                    </button>
                  </div>

                  <div
                    className="w-full rounded p-[1px]"
                    style={{ background: TOP_BORDER_GRADIENT }}
                  >
                    <div className="flex items-center justify-center rounded-[3px] bg-white px-1 py-0.5 text-center">
                      <p className="text-[6.5px] font-extrabold leading-tight text-[#0A2B6D] line-clamp-2">
                        {currentNote.desc}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className="mt-0.5 w-full rounded p-[1px]"
                  style={{ background: TOP_BORDER_GRADIENT }}
                >
                  <div className="rounded-[3px] bg-white p-1 text-left">
                    <ul className="space-y-0.5">
                      {currentNote.functions.map((fn, fIdx) => (
                        <li
                          key={fn}
                          className="flex items-center gap-1 text-[6.5px] font-extrabold leading-tight text-[#0A2B6D]"
                        >
                          <CheckCircle2 className="h-2 w-2 shrink-0" style={{ color: getSymbolView(index + fIdx).iconColor }} />
                          <span className="truncate text-[#0A2B6D]">{fn}</span>
                        </li>
                      ))}
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