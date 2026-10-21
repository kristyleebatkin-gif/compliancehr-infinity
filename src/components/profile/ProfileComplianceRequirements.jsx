import React from 'react';
import EmployeeProfileSection from '@/components/profile/EmployeeProfileSection';

/* Owner-confirmed NDIS compliance requirements, shown on every employee and
   participant profile. Cadences: safety checks and drills 6-monthly; internal
   audits 3-monthly; cleaning, sign in/out daily; registers kept continuously. */
const GROUPS = [
  {
    heading: 'Safety & Emergency (6-monthly, evidence stored)',
    items: [
      'First aid kit check (Safety Register)',
      'Fire safety equipment and extinguisher checks',
      'Fire and evacuation drills (Emergency Drills)',
      'MSDS review (Equipment & MSDS library)',
      'Natural disaster kit check',
      'Emergency plans reviewed and accessible',
    ],
  },
  {
    heading: 'Audits & Corrective Actions (3-monthly)',
    items: [
      'Internal audits documented with stored evidence',
      'Corrective actions recorded and closed for incidents, risks and feedback',
      'Incidents, risks and feedback all recorded in their registers',
      'NDIS registration audit readiness (evidence pack and registration groups)',
    ],
  },
  {
    heading: 'Daily Workplace Requirements',
    items: [
      'Daily cleaning checklist',
      'Sign in and out register (visitors and staff)',
      'Infection control practices',
      'Waste management',
      'PPE available and used',
      'Manual handling safe techniques, training current',
    ],
  },
  {
    heading: 'Registers & Records',
    items: [
      'Document register: every document recorded',
      'Legal requirements register: acknowledgements recorded',
      'Human resource register: list of every employee',
      'Service delivery register: all participants',
      'Continuous improvement register',
    ],
  },
  {
    heading: 'Actions & Workload (allocated to-do lists)',
    items: [
      'Compliance tasks sent as to-do tasks and allocated to staff',
      'All actions recorded on completion as evidence and corrective actions',
      'Shared workload: every staff member carries their allocation',
    ],
  },
  {
    heading: 'Meetings & Manager Copies',
    items: [
      'Every meeting documented (minutes, attendees, actions)',
      'Managers receive a copy of all incidents, risks, issues, concerns, tasks, corrective actions, feedback and follow-ups',
      'Follow-up review completed and recorded for records needing review',
    ],
  },
  {
    heading: 'Business Documents (on file, kept current)',
    items: [
      'Business structure documentation',
      'Strategic plan',
      'Operations plan',
      'Business plan',
    ],
  },
];

export default function ProfileComplianceRequirements() {
  return <EmployeeProfileSection title="Compliance & Audit Requirements" tone="red" uniform>
    <div className="space-y-1.5">
      {GROUPS.map((group) => <div key={group.heading}>
        <p className="text-[11px] font-bold text-black">{group.heading}</p>
        <ul className="space-y-1">
          {group.items.map((item) => <li key={item} className="break-words rounded-md bg-white px-2 py-1 text-[11px] leading-relaxed text-black">{item}</li>)}
        </ul>
      </div>)}
      <p className="text-[10px] leading-snug text-black">Evidence for every check, drill, audit and corrective action is stored with the record it belongs to, ready for NDIS registration audits.</p>
    </div>
  </EmployeeProfileSection>;
}