import React, { Suspense, lazy, useState } from 'react';
import { Heart, TrendingUp } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import ParticipantDirectoryDashboard from '@/components/profile/ParticipantDirectoryDashboard';
import '@/components/profile/employeeDirectory.css';
import ModuleShell from '@/components/module/ModuleShell';
import ModuleSearchBar from '@/components/module/ModuleSearchBar';
import OurProfilesTab from '@/components/profile/OurProfilesTab';
import MyProfileTabLink from '@/components/profile/MyProfileTabLink';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRole } from '@/lib/useRole';
import '@/components/profile/myProfilePastels.css';

const StaffProgressDashboard = lazy(() => import('@/pages/StaffProgressDashboard'));

export default function OurParticipantProfiles({ basePath = '/our-participants', scoped = true, title = 'Our participant profiles' }) {
  const { can } = useRole();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [params, setParams] = useSearchParams();
  const progressAllowed = can('staff-progress');
  const tab = progressAllowed && params.get('participantTab') === 'progress' ? 'progress' : 'profiles';
  const selectTab = (value) => {
    const next = new URLSearchParams(params);
    if (value === 'progress') next.set('participantTab', value); else next.delete('participantTab');
    setParams(next, { replace: true });
  };
  return (
    <div className="employee-directory mx-auto max-w-6xl space-y-4 px-4 pb-4 pt-2 md:px-8 md:pb-8 md:pt-2 sm:max-lg:space-y-2 sm:max-lg:p-2">
      <Tabs value={tab} onValueChange={selectTab} className="space-y-4">
        <ModuleShell
          title={title}
          icon={Heart}
          moduleKey="our-participants"
          tabs={<div className="flex flex-nowrap items-center gap-1.5">
            <TabsList className="w-auto shrink-0"><TabsTrigger value="profiles">Participant profiles</TabsTrigger></TabsList>
            <MyProfileTabLink />
            {progressAllowed && <TabsList className="w-auto shrink-0"><TabsTrigger value="progress"><TrendingUp />Staff progress</TabsTrigger></TabsList>}
          </div>}
          search={<ModuleSearchBar value={search} onChange={setSearch} placeholder="Search participants…" />}
          insightModule="participants"
        >
          <div className="px-2 pb-2"><ParticipantDirectoryDashboard scoped={scoped} selected={status} onSelect={setStatus} /></div>
          <TabsContent value="profiles"><div className="mt-[1cm]"><OurProfilesTab kind="participant" basePath={basePath} scoped={scoped} directory searchValue={search} groupValue={status} onGroupChange={setStatus} /></div></TabsContent>
          {progressAllowed && <TabsContent value="progress"><Suspense fallback={<p role="status" className="py-8 text-sm text-muted-foreground">Loading staff progress...</p>}><StaffProgressDashboard embedded search={search} /></Suspense></TabsContent>}
        </ModuleShell>
      </Tabs>
    </div>
  );
}