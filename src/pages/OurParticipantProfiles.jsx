import React, { useState } from 'react';
import ParticipantDirectoryDashboard from '@/components/profile/ParticipantDirectoryDashboard';
import '@/components/profile/employeeDirectory.css';
import PageHeader from '@/components/PageHeader';
import OurProfilesTab from '@/components/profile/OurProfilesTab';
import '@/components/profile/myProfilePastels.css';

export default function OurParticipantProfiles({ basePath = '/our-participants', scoped = true, title = 'Our participant profiles' }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  return (
    <div className="employee-directory mx-auto max-w-6xl space-y-4 p-4 md:p-8 sm:max-lg:space-y-2 sm:max-lg:p-2">
      <PageHeader title={title} showDivider={false} showAlerts={false} showCompliance={false} showAudit={false} />
      <ParticipantDirectoryDashboard scoped={scoped} search={search} onSearch={setSearch} selected={status} onSelect={setStatus} />
      <OurProfilesTab kind="participant" basePath={basePath} scoped={scoped} directory searchValue={search} groupValue={status} onGroupChange={setStatus} />
    </div>
  );
}