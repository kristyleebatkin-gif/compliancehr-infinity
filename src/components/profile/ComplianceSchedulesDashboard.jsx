import React from 'react';
import { Link } from 'react-router-dom';
import EmployeeProfileSection from '@/components/profile/EmployeeProfileSection';

/* Owner-confirmed NDIS Compliance Schedule & Registers (2026-10-22), rendered as a
   dashboard at the bottom of every employee and participant profile. */

const APP_COLOURS = ['#0072FF', '#5A00D6', '#FF2E9A', '#A100FF', '#00C6FF'];

const GRADIENT_BORDER_STYLE = {
  border: '2px solid transparent',
  background:
    'linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #5A00D6 62%, #FF2E9A 100%) border-box',
};

const CADENCES = [
  {
    title: 'Real-Time & Statutory (24h / 5-Day)',
    sym: '#FF2E9A',
    items: [
      'Immediate real-time notifications for critical incidents, high/critical risks, data breaches and complaints',
      '24-hour NDIS Commission initial notification for reportable incidents & 5-day statutory follow-up report',
      'Daily executive & compliance summary dispatched at 8:30 AM (Australia/Sydney)',
    ],
  },
  {
    title: 'Expiry & Escalation Windows (90 / 60 / 30 / 14 / 7 Days)',
    sym: '#0072FF',
    items: [
      'NDIS Worker Screening, Police Check, Blue Card/WWCC, Driver Licence, First Aid & CPR expiry alerts at 90, 60, 30, 14 and 7 days',
      'Automated overdue task & audit corrective action (CAPA) escalation to Compliance & Management',
    ],
  },
  {
    title: 'Monthly & 10-Weekly Cycles',
    sym: '#5A00D6',
    items: [
      'Monthly Home Risk Assessments & Monthly Training Audit Reports',
      '10-Weekly Participant Progress Report copies & NDIS funding utilisation reviews',
    ],
  },
  {
    title: '3-Monthly (Quarterly) Cycles',
    sym: '#A100FF',
    items: [
      'Internal audits with stored evidence and closed-loop corrective actions',
      'Employee and participant profile reviews every 3 calendar months from the last completed review (provider policy)',
      'Individual Participant Risk Assessments & Participant Details Checks',
      'Same documented evidence and corrective actions apply to incidents, feedback and risks',
    ],
  },
  {
    title: '6-Monthly & 12-Monthly Cycles',
    sym: '#0072FF',
    items: [
      '6-Monthly: First aid kit checks, fire safety/extinguisher checks, evacuation drills, MSDS reviews & natural disaster kits',
      'Staff training renewal every 12 calendar months from evidenced completion (provider policy); earlier qualification expiry or competency needs still apply',
      '12-Monthly: Policy & procedure reviews, staff performance appraisals, insurance renewals & NDIS Practice Standards self-assessment',
    ],
  },
  {
    title: 'Daily & Ongoing',
    sym: '#5A00D6',
    items: [
      'Daily: 8:30 AM summary brief, pre-shift car safety checks, cleaning checklist & visitor sign-in/out register',
      'Ongoing: Infection control, waste management, PPE, manual handling, continuous improvement & strategic/emergency plans',
    ],
  },
];

const REGISTERS = [
  'Document register (every document recorded)',
  'Legal requirements register (acknowledgements)',
  'Human resource register (list of every employee)',
  'Service delivery register (all participants)',
  'Incident, risk and feedback registers (all entries recorded)',
  'Continuous improvement register',
  'Sign in and out register',
];

const WHERE_LIVE = [
  { label: 'Safety checks, drills, MSDS', to: '/emergency-response' },
  { label: 'Incidents, risks, feedback registers', to: '/incidents' },
  { label: 'Document register & acknowledgements', to: '/documents' },
  { label: 'HR register (all employees)', to: '/hr' },
  { label: 'Service delivery register (participants)', to: '/our-participants' },
  { label: 'Continuous improvement', to: '/quality' },
  { label: 'Business documents', to: '/company-safe' },
  { label: 'Compliance to-do tasks', to: '/tasks' },
];

const Chip = ({ children, color = '#0072FF' }) => (
  <li
    className="break-words rounded-lg px-2.5 py-1.5 text-xs font-semibold leading-relaxed text-[#0A2B6D]"
    style={GRADIENT_BORDER_STYLE}
  >
    <span style={{ color }}>◉</span> {children}
  </li>
);

export default function ComplianceSchedulesDashboard() {
  return (
    <EmployeeProfileSection
      title="NDIS Compliance Schedule & Registers Dashboard"
      tone="red"
      defaultOpen
    >
      <div className="space-y-3">
        <p
          className="rounded-xl p-3 text-xs font-bold leading-relaxed text-[#0A2B6D]"
          style={GRADIENT_BORDER_STYLE}
        >
          <span style={{ color: '#0072FF' }}>◉</span> Schedule reference only. The cycles below describe expected controls; they do not confirm that reminders, escalations, registers, or evidence are configured or complete. Verify current settings and source records. Profile reviews are due every 3 calendar months and staff training every 12 calendar months under provider policy. An assignment is not evidence of completion.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CADENCES.map((cadence) => (
            <div
              key={cadence.title}
              className="rounded-xl p-3 shadow-2xs"
              style={GRADIENT_BORDER_STYLE}
            >
              <p
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-extrabold text-[#0A2B6D]"
                style={GRADIENT_BORDER_STYLE}
              >
                <span style={{ color: cadence.sym }}>◉</span>
                <span className="text-[#0A2B6D]">{cadence.title}</span>
              </p>
              <ul className="mt-2 space-y-1.5">
                {cadence.items.map((item, idx) => (
                  <Chip key={item} color={APP_COLOURS[idx % APP_COLOURS.length]}>
                    {item}
                  </Chip>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="rounded-xl p-3 shadow-2xs" style={GRADIENT_BORDER_STYLE}>
          <p
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-extrabold text-[#0A2B6D]"
            style={GRADIENT_BORDER_STYLE}
          >
            <span style={{ color: '#5A00D6' }}>◉</span>
            <span className="text-[#0A2B6D]">Registers That Must Be Kept</span>
          </p>
          <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {REGISTERS.map((item, idx) => (
              <Chip key={item} color={APP_COLOURS[idx % APP_COLOURS.length]}>
                {item}
              </Chip>
            ))}
          </ul>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl p-3 shadow-2xs" style={GRADIENT_BORDER_STYLE}>
            <p
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-extrabold text-[#0A2B6D]"
              style={GRADIENT_BORDER_STYLE}
            >
              <span style={{ color: '#0072FF' }}>◉</span>
              <span className="text-[#0A2B6D]">Actions, Workload &amp; Manager Copies</span>
            </p>
            <ul className="mt-2 space-y-1.5">
              <Chip color="#0072FF">
                Compliance tasks sent as to-do tasks and allocated to staff — workload shared, completion is recorded evidence
              </Chip>
              <Chip color="#5A00D6">
                Every action recorded on completion as evidence and corrective action
              </Chip>
              <Chip color="#FF2E9A">
                All meetings documented (minutes, attendees, actions)
              </Chip>
              <Chip color="#A100FF">
                Managers receive a copy of all incidents, risks, issues, concerns, tasks, corrective actions, feedback and follow-ups; most need a follow-up review completed and recorded
              </Chip>
              <Chip color="#0072FF">
                Routing requirement: verify that incidents, risks and feedback are routed to management and check delivery records.
              </Chip>
            </ul>
          </div>
          <div className="flex flex-col gap-3">
            <div className="rounded-xl p-3 shadow-2xs" style={GRADIENT_BORDER_STYLE}>
              <p
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-extrabold text-[#0A2B6D]"
                style={GRADIENT_BORDER_STYLE}
              >
                <span style={{ color: '#A100FF' }}>◉</span>
                <span className="text-[#0A2B6D]">NDIS Registration Audits</span>
              </p>
              <ul className="mt-2 space-y-1.5">
                <Chip color="#A100FF">Audit readiness is not assessed in this panel.</Chip>
                <Chip color="#5A00D6">
                  Review source records to confirm evidence, registration groups, currency, approvals and links.
                </Chip>
              </ul>
            </div>
            <div className="rounded-xl p-3 shadow-2xs" style={GRADIENT_BORDER_STYLE}>
              <p
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-extrabold text-[#0A2B6D]"
                style={GRADIENT_BORDER_STYLE}
              >
                <span style={{ color: '#FF2E9A' }}>◉</span>
                <span className="text-[#0A2B6D]">Where These Live</span>
              </p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {WHERE_LIVE.map((link, idx) => {
                  const col = APP_COLOURS[idx % APP_COLOURS.length];
                  return (
                    <li key={link.to} className="!border-0 !p-0">
                      <Link
                        to={link.to}
                        className="inline-flex items-center gap-1 break-words rounded-full px-2.5 py-1 text-[11px] font-extrabold leading-snug text-[#0A2B6D] transition hover:opacity-90"
                        style={GRADIENT_BORDER_STYLE}
                      >
                        <span style={{ color: col }}>◉</span>
                        <span style={{ color: '#0A2B6D' }}>{link.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        <p
          className="rounded-xl p-2.5 text-xs font-bold leading-snug text-[#0A2B6D]"
          style={GRADIENT_BORDER_STYLE}
        >
          <span style={{ color: '#5A00D6' }}>◉</span> Use the source modules to confirm whether each record exists, is current, is linked to this profile and has been reviewed. This panel is a schedule and navigation aid; it does not verify audit readiness or reminder delivery.
        </p>
      </div>
    </EmployeeProfileSection>
  );
}