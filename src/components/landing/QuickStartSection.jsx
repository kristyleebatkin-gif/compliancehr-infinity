import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, Compass, LayoutDashboard, Pin, RefreshCw, ShieldCheck, Workflow } from 'lucide-react';
import Reveal from '@/components/landing/Reveal';
import {
  getHeaderView,
  getSymbolView,
  getAppBorderView,
} from '@/lib/fullColourTiles';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';

const STICKY_NOTE_BG = 'linear-gradient(180deg, #FFF3FA 0%, #FFE4F5 100%)';
const STICKY_NOTE_BORDER = '#FF2E9A';
const STICKY_NOTE_TAPE = 'linear-gradient(90deg, #0072FF 0%, #5A00D6 50%, #FF2E9A 100%)';

const STEPS = [
  {
    icon: ShieldCheck,
    notes: [
      {
        title: 'Register an Account & Request Access',
        text: 'Register your account and request access. New accounts are placed in pending approval for your Provider Administrator.',
        functions: ['Email & OTP Verification', 'Admin Approval Security Gate', 'Role-Scoped Workspace Setup'],
      },
      {
        title: 'Invite Staff, Managers & Auditors',
        text: 'Send 1-click portal invitations to employees, participants or external NDIS auditors with pre-assigned permissions.',
        functions: ['1-Click Portal Invites', '15 Granular Role Levels', 'Consent-Gated Auditor Access'],
      },
      {
        title: 'Configure Company Branding & Safe',
        text: 'Add your organisation logo, ABN, NDIS registration number and key personnel so every PDF and form is pre-stamped.',
        functions: ['Auto-Branded PDF Headers', 'Company Safe Vault Setup', 'Key Business Contacts'],
      },
      {
        title: 'Import Existing Staff & Participants',
        text: 'Upload CSV/Excel sheets or resumes in one click to populate your live workforce and participant directories.',
        functions: ['1-Click CSV/Excel Import', 'AI Resume & Plan Extractor', 'Automated Duplicate Check'],
      },
    ],
  },
  {
    icon: LayoutDashboard,
    notes: [
      {
        title: 'Open Your Role Dashboard',
        text: 'Your personalised dashboard displays the exact modules, live registers, and tools configured for your role.',
        functions: ['Executive & Staff Views', 'Live Compliance Score Ring', 'Morning AI Shift Briefing'],
      },
      {
        title: 'Switch Between Office & Profile Views',
        text: 'Toggle seamlessly between the interactive Executive Office Wall and the structured Profile & Register Workspace.',
        functions: ['Executive Wall Scene', 'Quick App Bar iPad Strip', 'Global Instant Search'],
      },
      {
        title: 'Launch 1-Click Operations Sweeps',
        text: 'Run any of the 12 armed operational sweeps across compliance, rostering, incidents and staff files in one tap.',
        functions: ['12 Armed Operations Sweeps', 'Live Execution Audit Trail', 'Automated Task Dispatch'],
      },
      {
        title: 'Pin Your Favourite Live Modulars',
        text: 'Customise your wall screens and quick-access tiles to monitor your highest-priority registers in real time.',
        functions: ['6-Screen Modular Selector', 'Live Weather & NDIS News', 'Role-Specific Shortcuts'],
      },
    ],
  },
  {
    icon: Workflow,
    notes: [
      {
        title: 'Follow the Connected Workflow',
        text: 'Move seamlessly from intake, profiles, and rostering right through to safety, HR, finance, and governance.',
        functions: ['Intake → Profile Auto-Sync', 'Roster → NDIS Invoice Flow', 'Shift Note → Goal Update'],
      },
      {
        title: 'Eliminate Double Data Entry',
        text: 'Use AI Smart-Fill and connected registers so participant and staff details populate across forms automatically.',
        functions: ['AI Smart-Fill Form Engine', '125+ Printable A4 Templates', 'Digital Signature Capture'],
      },
      {
        title: 'Connect Rosters, Payroll & Claims',
        text: 'Validate worker screening and fatigue on the roster, then generate NDIS invoices and staff payslips in seconds.',
        functions: ['SCHADS & Screening Gate', 'NDIS Price Guide Lookup', 'AI Receipt & Bank Match'],
      },
      {
        title: 'Auto-Route Shift Notes & Alerts',
        text: 'Every logged shift note, incident, hazard or complaint automatically updates linked goals and notifies leadership.',
        functions: ['Auto-Routed Management Alerts', 'Shared To-Do Command Sync', '5-Day Complaint SLA Timer'],
      },
    ],
  },
  {
    icon: Bell,
    notes: [
      {
        title: 'Stay Audit-Ready Every Day',
        text: 'Live compliance trackers monitor due dates across every module, with instant alerts and step-by-step user guides.',
        functions: ['90/60/30-Day Expiry Scans', '2-Minute Express Audits', '1-Click NDIS Board Pack'],
      },
      {
        title: 'Track 24h & 5d NDIS Timers',
        text: 'Built-in statutory countdown timers keep reportable incidents, complaints and risk reviews on schedule.',
        functions: ['24h & 5d NDIS Clocks', 'ISO 31000 Risk Matrix', 'Continuous Improvement Log'],
      },
      {
        title: 'Auto-Generate 30-Action Reports',
        text: 'Every 30 actions or completed tasks automatically compiles a permanent PDF and CSV governance batch report.',
        functions: ['30-Action PDF/CSV Batches', '30-Task Completion Packs', 'Tamper-Evident Audit Trail'],
      },
      {
        title: 'Grant Consent-Verified Auditor Access',
        text: 'Open the read-only External Auditor Portal where auditors inspect only consent-approved participant and staff files.',
        functions: ['Consent-Gated Auditor Portal', '8 Practice Standards Map', 'Zero Manual Folder Prep'],
      },
    ],
  },
];

export default function QuickStartSection() {
  const [noteIndices, setNoteIndices] = useState([0, 0, 0, 0]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNoteIndices((prev) => prev.map((v) => (v + 1) % 4));
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const cycleSingleNote = (stepIdx) => {
    setNoteIndices((prev) =>
      prev.map((val, i) => (i === stepIdx ? (val + 1) % STEPS[stepIdx].notes.length : val))
    );
  };

  const cycleAllNotes = () => {
    setNoteIndices((prev) => prev.map((v) => (v + 1) % 4));
  };

  return (
    <section
      id="quick-start"
      className="w-full scroll-mt-16 rounded-3xl p-[12px] shadow-lg"
      style={{ background: TOP_BORDER_GRADIENT }}
    >
      <div className="flex w-full flex-col items-center justify-center rounded-[16px] bg-white px-4 py-5 sm:px-6 sm:py-6 text-center space-y-4">
        {/* Heading with App Design Colours on "Start using ComplianceHR in four simple and effortless steps" */}
        <div
          className="w-full rounded-2xl border-2 border-[#0A2B6D] p-3.5 sm:p-4 shadow-sm"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div className="w-full rounded-xl border-2 border-[#0A2B6D] bg-white px-6 py-5 sm:px-10 sm:py-7 text-center">
            <h2 className="mx-auto text-center font-editorial text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-snug">
              <span className="text-[#0A2B6D]">Start using Compliance</span>
              <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                HR
              </span>{' '}
              <span className="bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
                in four simple and effortless steps
              </span>
            </h2>
          </div>
        </div>

        {/* Stretched Banner — Line 1: Guide Title, Line 2: Sticky Notes with Functions, Line 3: Flip All Button Below */}
        <div
          className="flex min-h-[76px] w-full flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-[#0A2B6D] px-6 py-3 text-white shadow-sm"
          style={{ background: getHeaderView(4), color: '#FFFFFF' }}
        >
          <div className="flex items-center justify-center gap-2.5 text-xs sm:text-sm md:text-base font-extrabold tracking-wide text-white">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
              <Compass className="h-3.5 w-3.5 text-white" style={{ color: '#FFFFFF' }} />
            </span>
            <span className="text-center" style={{ color: '#FFFFFF' }}>
              Our Quick 4 Step Start Guide
            </span>
          </div>
          <div
            className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-white"
            style={{ color: '#FFFFFF' }}
          >
            Sticky Notes with Functions
          </div>
          <button
            type="button"
            onClick={cycleAllNotes}
            className="mt-0.5 inline-flex items-center gap-1.5 rounded-full border-2 border-white bg-white/20 px-4 py-1 text-xs font-extrabold text-white shadow-2xs hover:bg-white/30"
            style={{ color: '#FFFFFF' }}
          >
            <RefreshCw className="h-3.5 w-3.5 text-white" style={{ color: '#FFFFFF' }} />
            <span style={{ color: '#FFFFFF' }}>Flip All 4 Sticky Notes ▸</span>
          </button>
        </div>

        {/* 4 Steps on Changeable Sticky Notes in the Exact Same Sticky Note Design with Bigger Step Numbers */}
        <ol className="grid w-full gap-4 pt-2 sm:grid-cols-2 lg:grid-cols-4 text-center items-stretch">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const sym = getSymbolView(index);
            const borderCol = getAppBorderView(index + 1);
            const activeNoteIdx = noteIndices[index] % step.notes.length;
            const currentNote = step.notes[activeNoteIdx];

            return (
              <Reveal
                key={`step-${index}`}
                as="li"
                delay={index * 0.06}
                className="group relative flex h-full flex-col justify-between rounded-2xl border-[3px] p-4 pt-5 text-center shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
                style={{
                  background: STICKY_NOTE_BG,
                  borderColor: STICKY_NOTE_BORDER,
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
                    Step 0{index + 1} of 04 · Note {activeNoteIdx + 1}/4
                  </span>
                </div>

                <div className="flex w-full flex-col items-center space-y-2.5">
                  {/* Top Row: Symbol + Bigger Step Badge + "Next Note ▸" Button */}
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
                        Step 0{index + 1}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => cycleSingleNote(index)}
                      className="inline-flex items-center gap-1 rounded-full border-2 border-[#0A2B6D] bg-[#5A00D6] px-3 py-1 text-[10px] font-extrabold text-white shadow-2xs hover:opacity-95"
                      style={{ color: '#FFFFFF' }}
                    >
                      <RefreshCw className="h-3 w-3 text-white" style={{ color: '#FFFFFF' }} />
                      <span style={{ color: '#FFFFFF' }}>Next Note ▸</span>
                    </button>
                  </div>

                  {/* Heading in App Design Coloured Border */}
                  <div
                    className="w-full rounded-xl p-[3px] shadow-2xs"
                    style={{ background: TOP_BORDER_GRADIENT }}
                  >
                    <div className="flex min-h-[48px] w-full items-center justify-center rounded-[9px] bg-white px-3 py-2 text-center">
                      <h3 className="font-editorial text-sm sm:text-base font-extrabold leading-snug text-center text-[#0A2B6D]">
                        {currentNote.title}
                      </h3>
                    </div>
                  </div>

                  {/* White Description Box Framed in App-Design Coloured Border */}
                  <div
                    className="w-full rounded-xl p-[2.5px] shadow-2xs"
                    style={{ background: TOP_BORDER_GRADIENT }}
                  >
                    <div className="flex min-h-[64px] w-full items-center justify-center rounded-[9px] bg-white px-3 py-2 text-center">
                      <p className="text-xs font-extrabold leading-snug text-center text-[#5A00D6]">
                        {currentNote.text}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Live Functions Listed on Each Sticky Note With App-Design Coloured Symbol Borders */}
                <div
                  className="mt-3 w-full rounded-xl p-[2.5px] shadow-2xs"
                  style={{ background: TOP_BORDER_GRADIENT }}
                >
                  <div className="rounded-[9px] bg-white p-2.5 text-left space-y-1.5">
                    <div className="flex items-center justify-between text-[9.5px] font-extrabold uppercase tracking-wider text-[#5A00D6]">
                      <span>Live Functions Included:</span>
                      <span>Note {activeNoteIdx + 1}/4</span>
                    </div>
                    <ul className="space-y-1.5">
                      {currentNote.functions.map((fn, fIdx) => (
                        <li
                          key={fn}
                          className="flex items-center gap-2 text-[11px] font-extrabold leading-tight text-[#0A2B6D]"
                        >
                          <span
                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-2xs"
                            style={{ borderColor: getAppBorderView(index + fIdx) }}
                          >
                            <CheckCircle2
                              className="h-3 w-3"
                              style={{ color: getSymbolView(index + fIdx).iconColor }}
                            />
                          </span>
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