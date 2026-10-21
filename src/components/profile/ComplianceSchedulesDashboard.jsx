import React from 'react';
import { Link } from 'react-router-dom';
import EmployeeProfileSection from '@/components/profile/EmployeeProfileSection';

/* Owner-confirmed NDIS Compliance Schedule & Registers (2026-10-22), rendered as a
   dashboard at the bottom of every employee and participant profile. */

const CADENCES = [
  {
    title: '6-Monthly',
    tone: 'bg-danger/10',
    items: [
      'First aid kit checks', 'Fire safety equipment and extinguisher checks',
      'Fire and evacuation drills', 'MSDS reviews', 'Natural disaster kit checks',
      'Emergency plans reviewed and kept accessible',
    ],
  },
  {
    title: '3-Monthly',
    tone: 'bg-warning/10',
    items: [
      'Internal audits with stored evidence and corrective actions',
      'Same documented evidence and corrective actions apply to incidents, feedback and risks',
    ],
  },
  {
    title: 'Daily',
    tone: 'bg-teal/10',
    items: ['Cleaning checklist', 'Sign in and out register'],
  },
  {
    title: 'Ongoing',
    tone: 'bg-safe/10',
    items: ['Infection control', 'Waste management', 'PPE', 'Manual handling', 'Continuous improvement'],
  },
  {
    title: 'On File, Kept Current',
    tone: 'bg-chart-5/10',
    items: ['Business structure', 'Strategic plan', 'Operations plan', 'Business plan', 'Emergency plans'],
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