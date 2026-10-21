import React from 'react';
import { INTAKE_REQUIREMENTS } from '@/lib/intakeCases';
import EmployeeProfileSection from '@/components/profile/EmployeeProfileSection';
import ParticipantIntakeFormSection from '@/components/profile/ParticipantIntakeFormSection';

const primaryForms = ['Participant Intake Form', 'Participant Intake Assessment'];
const sections = [
  { title: 'Agreements, Consents & Advocacy', tone: 'purple', forms: ['Participant Handbook', 'Referral Form', 'NDIS Plan', 'Service Agreement', 'Consent to Share Information', 'Authority to Act as Advocate'] },
  { title: 'Support Plans & Safeguards', tone: 'green', forms: ['Participant Support Plan', 'Individual Risk Assessment', 'Home Risk Assessment', 'Personal Emergency Form', 'Fire Drill Form', 'Provider Declaration'] },
  { title: 'Health, Medication & Mealtime Support', tone: 'pink', forms: ['Medication Record Sheet', 'Medication Evaluation', 'Medication Consent', 'SAM Medication Assessment', 'Mealtime Management Plan', 'Behaviour Support Plan', 'Restrictive Practices Record'] },
  { title: 'Feedback, Incidents & File Reviews', tone: 'orange', forms: ['Participant File Audit Checklist', 'Satisfaction Survey', 'Feedback and Complaints', 'Investigation Form', 'Incident Reports'] },
];

export default function ParticipantRequiredForms({ profile }) {
  return <div className="min-w-0 space-y-3" aria-label="Required participant intake forms">
    {primaryForms.map((title) => <ParticipantIntakeFormSection key={title} profile={profile} title={title} />)}
    {sections.map((section) => <EmployeeProfileSection key={section.title} title={section.title} tone={section.tone}>
      {section.forms.filter((title) => INTAKE_REQUIREMENTS.Participant.includes(title)).map((title) => <ParticipantIntakeFormSection key={title} profile={profile} title={title} />)}
    </EmployeeProfileSection>)}
  </div>;
}