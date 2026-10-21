import React from 'react';
import ParticipantDetailsTab from '@/components/participants/ParticipantDetailsTab';
import ParticipantAuthorisationCard from '@/components/participants/ParticipantAuthorisationCard';
import ProfileAboutMeEditor from '@/components/profile/ProfileAboutMeEditor';
import ProfileAuditConsentCard from '@/components/profile/ProfileAuditConsentCard';
import ProfileDetailsCheck from '@/components/profile/ProfileDetailsCheck';
import ParticipantRequiredForms from '@/components/profile/ParticipantRequiredForms';
import EmployeeProfileSection from '@/components/profile/EmployeeProfileSection';
import IntakeCaseWorkflow from '@/components/intake/IntakeCaseWorkflow';

export default function ParticipantSummaryPanels({ profile, onUpdated }) {
  return <div className="grid items-start gap-3 p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,0.55fr)]">
    <div className="min-w-0 space-y-3">
      <IntakeCaseWorkflow intakeType="Participant" profile={profile} profileView="overview" />
      <ParticipantRequiredForms key={profile.id} profile={profile} />
      <EmployeeProfileSection title="Participant Details" tone="neutral"><ParticipantDetailsTab participant={profile} onUpdated={onUpdated} compact hideConsents /></EmployeeProfileSection>
    </div>
    <aside className="min-w-0 space-y-2">
      <ProfileAboutMeEditor profile={profile} kind="participant" onUpdated={onUpdated} compact />
      <ParticipantAuthorisationCard participant={profile} type="sharing" onUpdated={onUpdated} />
      <ParticipantAuthorisationCard participant={profile} type="advocacy" onUpdated={onUpdated} />
      <ParticipantAuthorisationCard participant={profile} type="medication" onUpdated={onUpdated} />
      <ProfileAuditConsentCard profile={profile} kind="participant" onUpdated={onUpdated} compact />
      <ProfileDetailsCheck profile={profile} />
    </aside>
    <p className="min-w-0 rounded-lg border border-border bg-muted/30 px-2 py-1 text-[10px] text-muted-foreground md:col-span-2">Saved details, required intake forms and readiness belong to this participant. Consent decisions include who recorded them and when; consent is never assumed.</p>
  </div>;
}