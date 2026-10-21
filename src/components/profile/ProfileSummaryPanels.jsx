import React from 'react';
import ProfileAboutMeEditor from '@/components/profile/ProfileAboutMeEditor';
import ProfileDetailsCheck from '@/components/profile/ProfileDetailsCheck';
import StaffBadgePreview from '@/components/safe/StaffBadgePreview';
import ProfileAuditConsentCard from '@/components/profile/ProfileAuditConsentCard';
import StaffProfileQuestionForm from '@/components/profile/StaffProfileQuestionForm';
import EmployeeJourney from '@/components/profile/EmployeeJourney';
import EmployeeRemainingSections from '@/components/profile/EmployeeRemainingSections';
import EmployeeProfileSection from '@/components/profile/EmployeeProfileSection';
import StaffCommPanel from '@/components/communications/StaffCommPanel';

export default function ProfileSummaryPanels({ profile, kind, branding, onUpdated, staffQuestions = kind === 'staff' }) {
  if (staffQuestions) return <div className="grid items-start gap-3 p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,0.55fr)]">
    <div className="min-w-0 space-y-3">
      <StaffBadgePreview branding={branding} staff={profile} compact />
      <StaffProfileQuestionForm profile={profile} title="Staff Information Form" />
      <StaffProfileQuestionForm profile={profile} title="Staff Onboarding Form" />
      <EmployeeRemainingSections key={profile.id} profile={profile} />
    </div>
    <aside className="min-w-0 space-y-2">
      <ProfileAboutMeEditor profile={profile} kind={kind} onUpdated={onUpdated} compact />
      <EmployeeJourney profile={profile} onUpdated={onUpdated} />
      <EmployeeProfileSection title="Communication Logs & Records" tone="blue"><StaffCommPanel staff={profile} /></EmployeeProfileSection>
      <ProfileAuditConsentCard profile={profile} kind={kind} onUpdated={onUpdated} compact />
      <ProfileDetailsCheck profile={profile} />
    </aside>
  </div>;
  return <div className="grid items-start gap-3 p-3 md:grid-cols-2">
    <div className="min-w-0 space-y-3"><ProfileAboutMeEditor profile={profile} kind={kind} onUpdated={onUpdated} /><ProfileAuditConsentCard profile={profile} kind={kind} onUpdated={onUpdated} /></div>
    <div className="min-w-0 space-y-2">
      {kind === 'staff' && <StaffBadgePreview branding={branding} staff={profile} compact />}
      <ProfileDetailsCheck profile={profile} />
    </div>
  </div>;
}