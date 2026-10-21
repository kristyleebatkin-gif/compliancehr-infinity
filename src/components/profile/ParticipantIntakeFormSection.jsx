import React from 'react';
import EmployeeProfileSection from '@/components/profile/EmployeeProfileSection';
import ParticipantFillableForms from '@/components/participants/ParticipantFillableForms';
import { PARTICIPANT_FILLABLE_FORMS } from '@/lib/participantFillableForms';

export default function ParticipantIntakeFormSection({ profile, title, tone = 'neutral' }) {
  const fillable = PARTICIPANT_FILLABLE_FORMS.some((form) => form.key === title);
  return <EmployeeProfileSection title={title} tone={tone}>
    {fillable ? <ParticipantFillableForms participant={profile} formType={title} compact /> : <p className="text-xs text-muted-foreground">Upload or view this document using Required documents above.</p>}
  </EmployeeProfileSection>;
}