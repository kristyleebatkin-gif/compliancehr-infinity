import React, { Suspense, lazy, useState } from 'react';
import { Heart, TrendingUp, Building2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import ParticipantDirectoryDashboard from '@/components/profile/ParticipantDirectoryDashboard';
import ExecutiveWallScene from '@/components/safe/ExecutiveWallScene';
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
  const rawTab = params.get('participantTab');
  const tab = rawTab === 'office' ? 'office' : (progressAllowed && rawTab === 'progress' ? 'progress' : 'profiles');
  const selectTab = (value) => {
    const next = new URLSearchParams(params);
    if (value === 'progress' || value === 'office') next.set('participantTab', value); else next.delete('participantTab');
    setParams(next, { replace: true });
  };
  return (
    <div className="employee-directory mx-auto max-w-6xl space-y-4 px-4 pb-4 pt-2 md:px-8 md:pb-8 md:pt-2 sm:max-lg:space-y-2 sm:max-lg:p-2">
      <Tabs value={tab} onValueChange={selectTab} className="space-y-4">
        <ModuleShell
          title={title}
          icon={Heart}
          moduleKey="our-participants"
          tabs={<div className="flex flex-wrap items-center gap-2">
            <TabsList className="w-auto shrink-0">
              <TabsTrigger value="profiles">Participant profiles</TabsTrigger>
              <TabsTrigger value="office"><Building2 className="mr-1.5 h-3.5 w-3.5" />Office View</TabsTrigger>
              {progressAllowed && <TabsTrigger value="progress"><TrendingUp className="mr-1.5 h-3.5 w-3.5" />Staff progress</TabsTrigger>}
            </TabsList>
            <MyProfileTabLink />
          </div>}
          search={<ModuleSearchBar value={search} onChange={setSearch} placeholder="Search participants…" />}
          insightModule="participants"
        >
          <div className="px-2 pb-2"><ParticipantDirectoryDashboard scoped={scoped} selected={status} onSelect={setStatus} /></div>
          <TabsContent value="profiles"><div className="mt-4"><OurProfilesTab kind="participant" basePath={basePath} scoped={scoped} directory searchValue={search} groupValue={status} onGroupChange={setStatus} /></div></TabsContent>
          <TabsContent value="office"><div className="mt-4"><ExecutiveWallScene defaultViewMode="office" /></div></TabsContent>
          {progressAllowed && <TabsContent value="progress"><Suspense fallback={<p role="status" className="py-8 text-sm text-muted-foreground">Loading staff progress...</p>}><StaffProgressDashboard embedded search={search} /></Suspense></TabsContent>}
        </ModuleShell>
      </Tabs>
    </div>
  );
}