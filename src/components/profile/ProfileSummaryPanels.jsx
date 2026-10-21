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

export default function ProfileSummaryPanels({ profile, kind, branding, onUpdated, staffQuestions = kind === 'staff' }) {
  if (kind === 'participant') return <ParticipantSummaryPanels profile={profile} onUpdated={onUpdated} />;
  if (staffQuestions) return <div className="grid items-stretch gap-3 p-3 md:grid-cols-2">
    <div className="profile-left-fill flex min-w-0 flex-col gap-3">
      <StaffProfileQuestionForm profile={profile} title="Staff Information Form" />
      <StaffProfileQuestionForm profile={profile} title="Staff Onboarding Form" />
      <EmployeeRemainingSections key={profile.id} profile={profile} afterHalves={<EmployeeProfileSection title="Résumé" tone="yellow"><IntakeCaseWorkflow intakeType="Employee" profile={profile} profileView="resume" /></EmployeeProfileSection>} />
      <StaffBadgePreview branding={branding} staff={profile} compact />
    </div>
    <aside className="flex min-w-0 flex-col gap-3">
      <ProfileAboutMeEditor profile={profile} kind={kind} onUpdated={onUpdated} compact />
      <EmployeeJourney profile={profile} onUpdated={onUpdated} />
      <EmployeeProfileSection title="Communication Logs & Records" tone="blue" uniform><StaffCommPanel staff={profile} /></EmployeeProfileSection>
      <ProfileLoggedSections profile={profile} />
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