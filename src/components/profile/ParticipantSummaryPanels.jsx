import React from 'react';
import ParticipantDetailsTab from '@/components/participants/ParticipantDetailsTab';
import ParticipantAuthorisationCard from '@/components/participants/ParticipantAuthorisationCard';
import ProfileAboutMeEditor from '@/components/profile/ProfileAboutMeEditor';
import ProfileLoggedSections from '@/components/profile/ProfileLoggedSections';
import ProfileCommDiary from '@/components/communications/ProfileCommDiary';
import ParticipantRequiredForms from '@/components/profile/ParticipantRequiredForms';
import ParticipantJourneyBox from '@/components/profile/ParticipantJourneyBox';
import EmployeeProfileSection from '@/components/profile/EmployeeProfileSection';
import ParticipantIntakeFormSection from '@/components/profile/ParticipantIntakeFormSection';
import ProfileQuickSquares from '@/components/profile/ProfileQuickSquares';
import ComplianceSchedulesDashboard from '@/components/profile/ComplianceSchedulesDashboard';
import IntakeCaseWorkflow from '@/components/intake/IntakeCaseWorkflow';

/* Participant profile mirror of the employee design, forms back in their
   original location: the left column holds Intake Readiness (moved here) and
   all forms; the right column holds the quick squares, logged sections,
   About Me, Participant Journey and communication logs. */
export default function ParticipantSummaryPanels({ profile, onUpdated, personal = false }) {
  return <div className="grid items-stretch gap-3 p-3 md:grid-cols-2">
    <div className="flex min-w-0 flex-col gap-3">
      <EmployeeProfileSection title="Intake Readiness" tone="green" uniform>
        <IntakeCaseWorkflow intakeType="Participant" profile={profile} profileView="readiness" />
      </EmployeeProfileSection>
      <div className="profile-left-fill flex min-w-0 flex-col gap-3">
        <ParticipantIntakeFormSection profile={profile} title="Participant Intake Form" tone="yellow" />
        <ParticipantIntakeFormSection profile={profile} title="Participant Intake Assessment" tone="purple" />
        <EmployeeProfileSection title="Required Documents" tone="green" defaultOpen><ParticipantRequiredForms key={profile.id} profile={profile} /></EmployeeProfileSection>
        <EmployeeProfileSection title="Participant Details" tone="orange"><ParticipantDetailsTab participant={profile} onUpdated={onUpdated} compact hideConsents /></EmployeeProfileSection>
        <ParticipantAuthorisationCard participant={profile} type="sharing" onUpdated={onUpdated} />
        <ParticipantAuthorisationCard participant={profile} type="advocacy" onUpdated={onUpdated} />
        <ParticipantAuthorisationCard participant={profile} type="medication" onUpdated={onUpdated} />
      </div>
    </div>
    <aside className="flex min-w-0 flex-col gap-3">
      <ProfileQuickSquares profile={profile} kind="participant" personal={personal} />
      <ProfileLoggedSections profile={profile} />
      <ProfileAboutMeEditor profile={profile} kind="participant" onUpdated={onUpdated} compact />
      <ParticipantJourneyBox profile={profile} />
      <EmployeeProfileSection title="Communication Logs & Records" tone="blue" uniform><ProfileCommDiary participant={profile} /></EmployeeProfileSection>
      <ComplianceSchedulesDashboard />
    </aside>
    <p className="min-w-0 rounded-lg border border-border bg-muted/30 px-2 py-1 text-[10px] text-muted-foreground md:col-span-2">Saved details, required intake forms and readiness belong to this participant. Consent decisions include who recorded them and when; consent is never assumed. See PROFILE_PERMISSIONS.md for who can view and edit each part.</p>
  </div>;
}