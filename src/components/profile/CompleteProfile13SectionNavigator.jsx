import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ArrowUpRight, ShieldCheck, Layers, Wrench } from 'lucide-react';

const PARTICIPANT_9_SECTIONS = [
  { id: 'overview', label: 'Section 1: Overview', to: '#overview' },
  { id: 'goals-outcomes', label: 'Section 2: Goals & Outcomes', to: '/goals' },
  { id: 'services', label: 'Section 3: Services & Supports', to: '/programs' },
  { id: 'risks-incidents', label: 'Section 4: Risks & Incidents', to: '/risks' },
  { id: 'communications', label: 'Section 5: Communications', to: '/communications' },
  { id: 'reviews', label: 'Section 6: Reviews (3-Monthly)', to: '/review-due' },
  { id: 'consents', label: 'Section 7: Consents (18 Types)', to: '/compliance' },
  { id: 'documents', label: 'Section 8: Documents & Agreements', to: '/documents?focus=participant' },
  { id: 'compliance', label: 'Section 9: Compliance & Audit History', to: '/compliance' },
];

const PARTICIPANT_16_DOMAINS = [
  { label: 'Profile Overview', to: '#overview' },
  { label: 'Goals', to: '/goals' },
  { label: 'Outcomes', to: '/goals' },
  { label: 'Risks', to: '/risks' },
  { label: 'Incidents', to: '/incidents' },
  { label: 'Communications', to: '/communications' },
  { label: 'Reviews', to: '/review-due' },
  { label: 'Consents', to: '/compliance' },
  { label: 'Service Agreements', to: '/documents?focus=participant' },
  { label: 'Documents', to: '/documents?focus=participant' },
  { label: 'Supports', to: '/programs' },
  { label: 'Shift Information', to: '/roster' },
  { label: 'Funding', to: '/invoicing' },
  { label: 'Family Contacts', to: '/contacts' },
  { label: 'Audit History', to: '/auditor-portal' },
  { label: 'Compliance Status', to: '/compliance' },
];

const PARTICIPANT_TOOLS = [
  { label: 'Create Review', to: '/review-due' },
  { label: 'Add Goal', to: '/goals' },
  { label: 'Complete Risk Review', to: '/risks/submit' },
  { label: 'Upload Document', to: '/documents?focus=participant' },
  { label: 'Generate Report', to: '/analytics' },
  { label: 'View Evidence', to: '/auditor-portal' },
];

const EMPLOYEE_9_SECTIONS = [
  { id: 'overview', label: 'Section 1: Overview', to: '#overview' },
  { id: 'roster-attendance', label: 'Section 2: Roster & Attendance', to: '/roster' },
  { id: 'timesheets', label: 'Section 3: Time Sheets & Payroll', to: '/my-payroll' },
  { id: 'skills-assessments', label: 'Section 4: Skills Assessments & Competencies', to: '/training' },
  { id: 'certifications', label: 'Section 5: Certifications & Qualifications', to: '/certificates' },
  { id: 'compliance', label: 'Section 6: Compliance & Consents', to: '/compliance' },
  { id: 'performance', label: 'Section 7: Performance (12-Monthly)', to: '/hr' },
  { id: 'communications', label: 'Section 8: Communications', to: '/communications' },
  { id: 'documents', label: 'Section 9: Documents & Audit History', to: '/documents?focus=employee' },
];

const EMPLOYEE_TOOLS = [
  { label: 'Add Certification', to: '/certificates' },
  { label: 'Complete Skills Assessment', to: '/training' },
  { label: 'Update Competency', to: '/training' },
  { label: 'View Roster', to: '/roster' },
  { label: 'View Time Sheet', to: '/my-payroll' },
  { label: 'View Compliance', to: '/compliance' },
];

export default function CompleteProfile13SectionNavigator({ kind = 'staff', profile }) {
  const isParticipant = kind === 'participant';
  const sections = isParticipant ? PARTICIPANT_9_SECTIONS : EMPLOYEE_9_SECTIONS;
  const tools = isParticipant ? PARTICIPANT_TOOLS : EMPLOYEE_TOOLS;
  const [selectedSection, setSelectedSection] = useState('overview');

  const APP_BORDER_GRADIENT =
    'linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #5A00D6 62%, #FF2E9A 100%)';

  return (
    <section
      aria-label="Profile Information Layout, Command Centre Domains & Direct Tools"
      className="preserve-island-theme rounded-2xl p-[3px] shadow-md"
      style={{ background: APP_BORDER_GRADIENT }}
    >
      <div
        className="rounded-[13px] p-3 space-y-3"
        style={{
          background: 'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)',
        }}
      >
        <div
          className="rounded-2xl p-[2px] shadow-2xs"
          style={{ background: APP_BORDER_GRADIENT }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-[14px] bg-white p-2.5">
            {/* Main Header Inside White Section: App Design Coloured Border + White Background + Dark Blue Writing */}
            <div
              className="rounded-2xl p-[2px] shadow-2xs"
              style={{ background: APP_BORDER_GRADIENT }}
            >
              <div className="rounded-[14px] bg-white px-3.5 py-2">
                <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#5A00D6]">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#0072FF]" />
                  <span>
                    9-Section {isParticipant ? 'Participant' : 'Employee'} Profile Information Layout · 3-Second &amp; ≤3-Click Standard
                  </span>
                </div>
                <h3
                  className="mt-0.5 text-xs sm:text-sm font-extrabold text-[#0A2B6D]"
                  style={{ color: '#0A2B6D' }}
                >
                  <span style={{ color: '#0072FF' }}>◉</span> {profile?.full_name || (isParticipant ? 'Participant Profile' : 'Employee Profile')} — Complete Subject Command Centre
                </h3>
              </div>
            </div>

            {/* Small Header Tiles with App Design Coloured Gradient Borders on White */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold text-[#0A2B6D]"
                style={{
                  border: '2px solid transparent',
                  background: `linear-gradient(#ffffff, #ffffff) padding-box, ${APP_BORDER_GRADIENT} border-box`,
                }}
              >
                <span style={{ color: '#0072FF' }}>◉</span>
                <span style={{ color: '#0A2B6D' }}>Green · Compliant &amp; Active</span>
              </span>
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold text-[#0A2B6D]"
                style={{
                  border: '2px solid transparent',
                  background: `linear-gradient(#ffffff, #ffffff) padding-box, ${APP_BORDER_GRADIENT} border-box`,
                }}
              >
                <span style={{ color: '#5A00D6' }}>◉</span>
                <span style={{ color: '#0A2B6D' }}>
                  {isParticipant ? '9 Sections · 16 Domains' : '9 Sections · 13 Domains'}
                </span>
              </span>
            </div>
          </div>
        </div>

      {/* 9 Mandatory Ordered Profile Layout Illuminated Modular Tiles (Top 1/4 White + Bottom 3/4 Dark Blue) */}
      <div
        className="preserve-island-theme grid grid-cols-1 gap-2 rounded-2xl border-2 border-[#0A2B6D] p-2.5 sm:grid-cols-2 md:grid-cols-3 items-stretch"
        style={{
          background:
            'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)',
        }}
      >
        {sections.map((sec, idx) => {
          const isInternal = sec.to.startsWith('#');
          const active = selectedSection === sec.id;
          const iconColors = ['#0072FF', '#5A00D6', '#FF2E9A', '#A100FF', '#00C6FF'];
          const iconColor = iconColors[idx % iconColors.length];
          const innerContent = (
            <span
              className="flex w-full flex-1 flex-col justify-between overflow-hidden rounded-[14px]"
              style={{
                background:
                  'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)',
              }}
            >
              {/* Top 1/4 White Bar with App Design Colour Symbol */}
              <span className="flex min-h-[28px] w-full items-center justify-between gap-1.5 bg-white px-2.5 py-0.5">
                <span className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-[#F5F0FF]"
                    style={{ border: `1.5px solid ${iconColor}` }}
                  >
                    <CheckCircle2 className="h-3 w-3 shrink-0" style={{ color: iconColor }} />
                  </span>
                  <span
                    className="bg-clip-text text-[10px] font-extrabold leading-tight text-transparent"
                    style={{
                      backgroundImage:
                        'linear-gradient(90deg, #0A2B6D 0%, #0A2B6D 38%, #0072FF 62%, #5A00D6 82%, #FF2E9A 100%)',
                    }}
                  >
                    <span style={{ color: iconColor }}>◉</span> {sec.label}
                  </span>
                </span>
                <span
                  className={`inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0 text-[7px] font-black uppercase ${
                    active ? 'bg-[#0A2B6D] text-[#00C6FF]' : 'bg-[#F5F0FF] text-[#5A00D6]'
                  }`}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{
                      backgroundColor: active ? '#00C6FF' : iconColor,
                      boxShadow: active ? '0 0 8px 2px #00C6FF' : `0 0 5px 1px ${iconColor}`,
                    }}
                  />
                  {active ? 'ACTIVE' : 'LIVE'}
                </span>
              </span>

              {/* Bottom 3/4 Dark Blue Body */}
              <span className="flex flex-1 items-center justify-between gap-1 px-2.5 py-1">
                <span className="text-[8.5px] font-bold leading-snug text-white" style={{ color: '#FFFFFF' }}>
                  Open {sec.label.replace(/^Section \d+:\s*/, '')} workspace
                </span>
                <ArrowUpRight className="h-2.5 w-2.5 shrink-0" style={{ color: iconColor }} />
              </span>
            </span>
          );

          if (isInternal) {
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setSelectedSection(sec.id)}
                className={`group flex min-h-[58px] flex-col rounded-2xl p-[2px] text-left transition-all duration-200 ${
                  active
                    ? 'shadow-[0_0_20px_rgba(0,198,255,0.85)] scale-[1.01]'
                    : 'shadow-[0_0_12px_rgba(90,0,214,0.35)] hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(0,198,255,0.75)]'
                }`}
                style={{
                  background:
                    'linear-gradient(120deg, #0072FF 0%, #5A00D6 50%, #FF2E9A 100%)',
                }}
              >
                {innerContent}
              </button>
            );
          }
          return (
            <Link
              key={sec.id}
              to={sec.to}
              className="group flex min-h-[58px] flex-col rounded-2xl p-[2px] text-left shadow-[0_0_12px_rgba(90,0,214,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(0,198,255,0.75)]"
              style={{
                background:
                  'linear-gradient(120deg, #0072FF 0%, #5A00D6 50%, #FF2E9A 100%)',
              }}
            >
              {innerContent}
            </Link>
          );
        })}
      </div>

      {/* 16-Domain Participant Command Centre Strip (Every Word Pill Has an App Design Coloured Gradient Border) */}
      {isParticipant && (
        <div
          className="rounded-xl p-2.5 space-y-1.5"
          style={{
            border: '2px solid transparent',
            background: `linear-gradient(#ffffff, #ffffff) padding-box, ${APP_BORDER_GRADIENT} border-box`,
          }}
        >
          <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#0A2B6D]"
            style={{
              border: '2px solid transparent',
              background: `linear-gradient(#ffffff, #ffffff) padding-box, ${APP_BORDER_GRADIENT} border-box`,
            }}
          >
            <span style={{ color: '#0072FF' }}>◉</span> All 16 Participant Command Centre Domains (One Location)
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PARTICIPANT_16_DOMAINS.map((dom, dIdx) => {
              const bCols = ['#0072FF', '#5A00D6', '#FF2E9A', '#A100FF'];
              const bCol = bCols[dIdx % bCols.length];
              return (
                <Link
                  key={dom.label}
                  to={dom.to}
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold text-[#0A2B6D] transition hover:opacity-90"
                  style={{
                    border: '2px solid transparent',
                    background: `linear-gradient(#ffffff, #ffffff) padding-box, ${APP_BORDER_GRADIENT} border-box`,
                    color: '#0A2B6D',
                  }}
                >
                  <span style={{ color: bCol }}>◉</span>
                  <span>{dom.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom of Section: All Small Tiles on 2 Clean Lines Inside White Section with App Design Coloured Gradient Border */}
      <div
        className="rounded-2xl p-[2px] shadow-2xs"
        style={{ background: APP_BORDER_GRADIENT }}
      >
      <div className="space-y-1.5 rounded-[14px] bg-white p-2.5">
        {/* Line 1: Available Profile Actions & Tools Small Tiles */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10.5px] font-extrabold text-[#0A2B6D]"
            style={{
              border: '2px solid transparent',
              background: `linear-gradient(#ffffff, #ffffff) padding-box, ${APP_BORDER_GRADIENT} border-box`,
            }}
          >
            <Wrench className="h-3 w-3 text-[#5A00D6]" />
            <span style={{ color: '#0A2B6D' }}>Profile Actions &amp; Tools:</span>
          </span>
          {tools.map((tool, tIdx) => {
            const bCols = ['#0072FF', '#5A00D6', '#FF2E9A', '#A100FF'];
            const bCol = bCols[tIdx % bCols.length];
            return (
              <Link
                key={tool.label}
                to={tool.to}
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold text-[#0A2B6D] transition hover:opacity-90"
                style={{
                  border: '2px solid transparent',
                  background: `linear-gradient(#ffffff, #ffffff) padding-box, ${APP_BORDER_GRADIENT} border-box`,
                  color: '#0A2B6D',
                }}
              >
                <span style={{ color: bCol }}>◉</span>
                <span>{tool.label}</span>
                <ArrowUpRight className="h-2.5 w-2.5" style={{ color: bCol }} />
              </Link>
            );
          })}
        </div>

        {/* Line 2: Related Resources, Evidence & Registers Small Tiles */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10.5px] font-extrabold text-[#0A2B6D]"
            style={{
              border: '2px solid transparent',
              background: `linear-gradient(#ffffff, #ffffff) padding-box, ${APP_BORDER_GRADIENT} border-box`,
            }}
          >
            <Layers className="h-3 w-3 text-[#0072FF]" />
            <span style={{ color: '#0A2B6D' }}>Related Resources &amp; Registers:</span>
          </span>
          {[
            { label: 'Consent Register', to: '/compliance', color: '#0072FF' },
            { label: '45 Master Registers', to: '/registers', color: '#5A00D6' },
            { label: 'Document Vault', to: '/documents', color: '#FF2E9A' },
            { label: 'Related Reviews', to: '/review-due', color: '#A100FF' },
            { label: 'Related Audits', to: '/auditor-portal', color: '#0072FF' },
          ].map((res) => (
            <Link
              key={res.label}
              to={res.to}
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold text-[#0A2B6D] transition hover:opacity-90"
              style={{
                border: '2px solid transparent',
                background: `linear-gradient(#ffffff, #ffffff) padding-box, ${APP_BORDER_GRADIENT} border-box`,
                color: '#0A2B6D',
              }}
            >
              <span style={{ color: res.color }}>◉</span>
              <span>{res.label}</span>
            </Link>
          ))}
        </div>
      </div>
      </div>
      </div>
    </section>
  );
}