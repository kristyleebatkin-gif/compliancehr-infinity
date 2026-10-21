import React from 'react';
import ProfileAboutMeEditor from '@/components/profile/ProfileAboutMeEditor';
import ProfileDetailsCheck from '@/components/profile/ProfileDetailsCheck';
import ProfileLoggedSections from '@/components/profile/ProfileLoggedSections';
import StaffBadgePreview from '@/components/safe/StaffBadgePreview';
import ProfileAuditConsentCard from '@/components/profile/ProfileAuditConsentCard';
import EmployeeRecordNotice from '@/components/profile/EmployeeRecordNotice';
import StaffProfileQuestionForm from '@/components/profile/StaffProfileQuestionForm';
import EmployeeJourney from '@/components/profile/EmployeeJourney';
import EmployeeRemainingSections from '@/components/profile/EmployeeRemainingSections';
import EmployeeProfileSection from '@/components/profile/EmployeeProfileSection';
import StaffCommPanel from '@/components/communications/StaffCommPanel';
import IntakeCaseWorkflow from '@/components/intake/IntakeCaseWorkflow';
import ParticipantSummaryPanels from '@/components/profile/ParticipantSummaryPanels';
import ProfileQuickSquares from '@/components/profile/ProfileQuickSquares';
import ProfileComplianceRequirements from '@/components/profile/ProfileComplianceRequirements';
import StaffAuthorisationCard from '@/components/profile/StaffAuthorisationCard';

/* Layout, forms back in their original location: the left column holds Intake
   Readiness (moved here) and all forms; the right column holds the name tag,
   quick squares (timesheets/alerts/availability, emergency info), logged
   sections, About Me, Journey and Communication Logs. */
export default function ProfileSummaryPanels({ profile, kind, branding, onUpdated, staffQuestions = kind === 'staff', personal = false }) {
  if (kind === 'participant') return <ParticipantSummaryPanels profile={profile} onUpdated={onUpdated} personal={personal} />;
  if (staffQuestions) return <div className="grid items-stretch gap-3 p-3 md:grid-cols-2">
    <div className="flex min-w-0 flex-col gap-3">
      <EmployeeProfileSection title="Intake Readiness" tone="green" uniform>
        <IntakeCaseWorkflow intakeType="Employee" profile={profile} profileView="readiness" />
      </EmployeeProfileSection>
      <div className="profile-left-fill flex min-w-0 flex-col gap-3">
        <StaffAuthorisationCard staff={profile} type="medication" onUpdated={onUpdated} />
        <StaffAuthorisationCard staff={profile} type="sharing" onUpdated={onUpdated} />
        <StaffAuthorisationCard staff={profile} type="advocacy" onUpdated={onUpdated} />
        <StaffProfileQuestionForm profile={profile} title="Staff Information Form" />
        <StaffProfileQuestionForm profile={profile} title="Staff Onboarding Form" />
        <EmployeeRemainingSections key={profile.id} profile={profile} afterHalves={<EmployeeProfileSection title="Résumé" tone="yellow"><IntakeCaseWorkflow intakeType="Employee" profile={profile} profileView="resume" /></EmployeeProfileSection>} />
      </div>
    </div>
    <aside className="flex min-w-0 flex-col gap-3">
      <StaffBadgePreview branding={branding} staff={profile} compact />
      <ProfileQuickSquares profile={profile} kind={kind} personal={personal} />
      <ProfileLoggedSections profile={profile} />
      <ProfileAboutMeEditor profile={profile} kind={kind} onUpdated={onUpdated} compact />
      <EmployeeJourney profile={profile} onUpdated={onUpdated} />
      <EmployeeProfileSection title="Communication Logs & Records" tone="blue" uniform><StaffCommPanel staff={profile} /></EmployeeProfileSection>
      <ProfileComplianceRequirements />
    </aside>
    <div className="min-w-0 md:col-span-2"><EmployeeRecordNotice /></div>
  </div>;
  return <div className="grid items-start gap-3 p-3 md:grid-cols-2">
    <div className="min-w-0 space-y-3"><ProfileAboutMeEditor profile={profile} kind={kind} onUpdated={onUpdated} /><ProfileAuditConsentCard profile={profile} kind={kind} onUpdated={onUpdated} /></div>
    <div className="min-w-0 space-y-2">
      {kind === 'staff' && <StaffBadgePreview branding={branding} staff={profile} compact />}
      <ProfileDetailsCheck profile={profile} />
    </div>
  </div>;
}