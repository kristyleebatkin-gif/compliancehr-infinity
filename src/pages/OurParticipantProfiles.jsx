import React from 'react';
import PageHeader from '@/components/PageHeader';
import OurProfilesTab from '@/components/profile/OurProfilesTab';
import '@/components/profile/myProfilePastels.css';

export default function OurParticipantProfiles({ basePath = '/our-participants', scoped = true, title = 'Our participant profiles' }) {
  return (
    <div className="my-profile-pastels mx-auto max-w-6xl space-y-4 p-3 md:p-5">
      <PageHeader title={title} showDivider={false} showAlerts={false} showCompliance={false} showAudit={false} className="my-profile-heading rounded-xl p-3 sm:p-3 [&_h1]:text-xl" />
      <OurProfilesTab kind="participant" basePath={basePath} scoped={scoped} />
    </div>
  );
}