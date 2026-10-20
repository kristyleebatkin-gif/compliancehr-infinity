import React from 'react';
import PageHeader from '@/components/PageHeader';
import OurProfilesTab from '@/components/profile/OurProfilesTab';

export default function OurParticipantProfiles() {
  return (
    <div className="mx-auto max-w-6xl space-y-4 p-3 md:p-5">
      <PageHeader title="Our participant profiles" showDivider={false} showAlerts={false} showCompliance={false} showAudit={false} className="rounded-xl p-3 sm:p-3 [&_h1]:text-xl" />
      <OurProfilesTab kind="participant" />
    </div>
  );
}