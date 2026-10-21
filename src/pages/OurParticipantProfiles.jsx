import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import ParticipantDirectoryDashboard from '@/components/profile/ParticipantDirectoryDashboard';
import '@/components/profile/employeeDirectory.css';
import ModuleShell from '@/components/module/ModuleShell';
import ModuleSearchBar from '@/components/module/ModuleSearchBar';
import OurProfilesTab from '@/components/profile/OurProfilesTab';
import MyProfileTabLink from '@/components/profile/MyProfileTabLink';
import '@/components/profile/myProfilePastels.css';

export default function OurParticipantProfiles({ basePath = '/our-participants', scoped = true, title = 'Our participant profiles' }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  return (
    <div className="employee-directory mx-auto max-w-6xl space-y-4 p-4 md:p-8 sm:max-lg:space-y-2 sm:max-lg:p-2">
      <ModuleShell
        title={title}
        icon={Heart}
        moduleKey="our-participants"
        tabs={<MyProfileTabLink />}
        search={<ModuleSearchBar value={search} onChange={setSearch} placeholder="Search participants…" />}
        insightModule="participants"
      >
        <div className="px-2 py-2"><ParticipantDirectoryDashboard scoped={scoped} selected={status} onSelect={setStatus} /></div>
        <div className="mt-[1cm]"><OurProfilesTab kind="participant" basePath={basePath} scoped={scoped} directory searchValue={search} groupValue={status} onGroupChange={setStatus} /></div>
      </ModuleShell>
    </div>
  );
}