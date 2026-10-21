import React from 'react';
import PageHeader from '@/components/PageHeader';
import OurProfilesTab from '@/components/profile/OurProfilesTab';

export default function OurEmployeeProfiles({ basePath = '/our-employees', scoped = true, title = 'Our employee profiles' }) {
  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 md:p-8 sm:max-lg:space-y-2 sm:max-lg:p-2">
      <PageHeader title={title} showDivider={false} showAlerts={false} showCompliance={false} showAudit={false} className="rounded-xl p-3 sm:p-3 [&_h1]:text-xl" />
      <OurProfilesTab kind="staff" basePath={basePath} scoped={scoped} />
    </div>
  );
}