import React from 'react';
import { Link } from 'react-router-dom';
import EmployeeProfileSection from '@/components/profile/EmployeeProfileSection';

/* Owner-confirmed NDIS Compliance Schedule & Registers (2026-10-22), rendered as a
   dashboard at the bottom of every employee and participant profile. */

const CADENCES = [
  {
    title: 'Real-Time & Statutory (24h / 5-Day)',
    tone: 'bg-danger/10',
    items: [
      'Immediate real-time notifications for critical incidents, high/critical risks, data breaches and complaints',
      '24-hour NDIS Commission initial notification for reportable incidents & 5-day statutory follow-up report',
      'Daily executive & compliance summary dispatched at 8:30 AM (Australia/Sydney)',
    ],
  },
  {
    title: 'Expiry & Escalation Windows (90 / 60 / 30 / 14 / 7 Days)',
    tone: 'bg-brand/10',
    items: [
      'NDIS Worker Screening, Police Check, Blue Card/WWCC, Driver Licence, First Aid & CPR expiry alerts at 90, 60, 30, 14 and 7 days',
      'Automated overdue task & audit corrective action (CAPA) escalation to Compliance & Management',
    ],
  },
  {
    title: 'Monthly & 10-Weekly Cycles',
    tone: 'bg-teal/10',
    items: [
      'Monthly Home Risk Assessments & Monthly Training Audit Reports',
      '10-Weekly Participant Progress Report copies & NDIS funding utilisation reviews',
    ],
  },
  {
    title: '3-Monthly (Quarterly) Cycles',
    tone: 'bg-warning/10',
    items: [
      'Internal audits with stored evidence and closed-loop corrective actions',
      'Employee and participant profile reviews every 3 calendar months from the last completed review (provider policy)',
      'Individual Participant Risk Assessments & Participant Details Checks',
      'Same documented evidence and corrective actions apply to incidents, feedback and risks',
    ],
  },
  {
    title: '6-Monthly & 12-Monthly Cycles',
    tone: 'bg-safe/10',
    items: [
      '6-Monthly: First aid kit checks, fire safety/extinguisher checks, evacuation drills, MSDS reviews & natural disaster kits',
      'Staff training renewal every 12 calendar months from evidenced completion (provider policy); earlier qualification expiry or competency needs still apply',
      '12-Monthly: Policy & procedure reviews, staff performance appraisals, insurance renewals & NDIS Practice Standards self-assessment',
    ],
  },
  {
    title: 'Daily & Ongoing',
    tone: 'bg-chart-5/10',
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

const Chip = ({ children }) => <li className="break-words rounded-md bg-white px-2.5 py-1.5 text-xs leading-relaxed text-black">{children}</li>;

export default function ComplianceSchedulesDashboard() {
  return <EmployeeProfileSection title="NDIS Compliance Schedule & Registers Dashboard" tone="red" defaultOpen>
    <div className="space-y-3">
      <p className="rounded-lg bg-white p-3 text-sm leading-relaxed text-black">Schedule reference only. Profile reviews are due every 3 calendar months and staff training every 12 calendar months under provider policy. A request or assignment is not evidence of completion. Reminder delivery and completion evidence must be checked in the linked records.</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CADENCES.map((cadence) => <div key={cadence.title} className={`rounded-lg ${cadence.tone} p-3`}>
          <p className="text-xs font-bold text-black">{cadence.title}</p>
          <ul className="mt-1.5 space-y-1.5">{cadence.items.map((item) => <Chip key={item}>{item}</Chip>)}</ul>
        </div>)}
      </div>

      <div className="rounded-lg bg-chart-1/10 p-3">
        <p className="text-xs font-bold text-black">Registers That Must Be Kept</p>
        <ul className="mt-1.5 space-y-1.5">{REGISTERS.map((item) => <Chip key={item}>{item}</Chip>)}</ul>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-chart-2/10 p-3">
          <p className="text-xs font-bold text-black">Actions, Workload & Manager Copies</p>
          <ul className="mt-1.5 space-y-1.5">
            <Chip>Compliance tasks sent as to-do tasks and allocated to staff — workload shared, completion is recorded evidence</Chip>
            <Chip>Every action recorded on completion as evidence and corrective action</Chip>
            <Chip>All meetings documented (minutes, attendees, actions)</Chip>
            <Chip>Managers receive a copy of all incidents, risks, issues, concerns, tasks, corrective actions, feedback and follow-ups; most need a follow-up review completed and recorded</Chip>
            <Chip>Built (2026-10-22): every incident, risk (any rating) and feedback is auto-routed to a manager copy the moment it is recorded</Chip>
          </ul>
        </div>
        <div className="flex flex-col gap-3">
          <div className="rounded-lg bg-brand/10 p-3">
            <p className="text-xs font-bold text-black">NDIS Registration Audits</p>
            <ul className="mt-1.5 space-y-1.5">
              <Chip>Evidence pack and registration groups kept audit-ready</Chip>
              <Chip>Drawing on the safety checks, drills, audits, registers and business documents above</Chip>
            </ul>
          </div>
          <div className="rounded-lg bg-chart-4/10 p-3">
            <p className="text-xs font-bold text-black">Where These Live</p>
            <ul className="mt-1 flex flex-wrap gap-1">
              {WHERE_LIVE.map((link) => <li key={link.to}>
                <Link to={link.to} className="inline-block break-words rounded-md bg-white px-2.5 py-1.5 text-xs leading-snug text-brand underline-offset-2 hover:underline">{link.label}</Link>
              </li>)}
            </ul>
          </div>
        </div>
      </div>

      <p className="text-xs leading-snug text-black">Evidence for every check, drill, audit and corrective action is stored with the record it belongs to, ready for NDIS registration audits.</p>
    </div>
  </EmployeeProfileSection>;
}