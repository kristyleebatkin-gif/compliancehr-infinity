import React from 'react';
import { INTAKE_REQUIREMENTS } from '@/lib/intakeCases';
import EmployeeProfileSection from '@/components/profile/EmployeeProfileSection';
import ParticipantFillableForms from '@/components/participants/ParticipantFillableForms';

const tones = ['blue', 'purple', 'green', 'pink', 'orange', 'teal'];

export default function ParticipantRequiredForms({ profile }) {
  return <div className="min-w-0 space-y-3" aria-label="Required participant intake forms">
    {INTAKE_REQUIREMENTS.Participant.map((title, index) => (
      <EmployeeProfileSection key={title} title={title} tone={tones[index % tones.length]}>
        <ParticipantFillableForms participant={profile} formType={title} compact />
      </EmployeeProfileSection>
    ))}
  </div>;
}