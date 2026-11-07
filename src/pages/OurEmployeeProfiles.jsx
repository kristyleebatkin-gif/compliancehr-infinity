import React, { useState } from 'react';
import { TrendingUp, Users, Building2, MessagesSquare } from 'lucide-react';
import EmployeeDirectorySummary from '@/components/profile/EmployeeDirectorySummary';
import ExecutiveWallScene from '@/components/safe/ExecutiveWallScene';
import Communications from '@/pages/Communications';
import EmployeeCategoryTiles from '@/components/profile/EmployeeCategoryTiles';
import useEmployeeDirectorySummary from '@/components/profile/useEmployeeDirectorySummary';
import '@/components/profile/employeeDirectory.css';
import ModuleShell from '@/components/module/ModuleShell';
import ModuleSearchBar from '@/components/module/ModuleSearchBar';
import OurProfilesTab from '@/components/profile/OurProfilesTab';
import MyProfileTabLink from '@/components/profile/MyProfileTabLink';
import { lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRole } from '@/lib/useRole';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
const StaffProgressDashboard = lazy(() => import('@/pages/StaffProgressDashboard'));

export default function OurEmployeeProfiles({ basePath = '/our-employees', scoped = true, title = 'Our employee profiles' }) {
  const { can } = useRole();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const summary = useEmployeeDirectorySummary(scoped);
  const [params, setParams] = useSearchParams();
  const progressAllowed = can('staff-progress');
  const rawTab = params.get('staffTab');
  const tab = rawTab === 'office' ? 'office' : rawTab === 'communications' ? 'communications' : (progressAllowed && rawTab === 'progress' ? 'progress' : 'profiles');
  const selectTab = (value) => {
    const next = new URLSearchParams(params);
    if (value === 'progress' || value === 'office' || value === 'communications') next.set('staffTab', value); else next.delete('staffTab');
    setParams(next, { replace: true });
  };
  return (
    <div className="employee-directory mx-auto max-w-6xl space-y-4 p-4 md:p-8 sm:max-lg:space-y-2 sm:max-lg:p-2">
      <Tabs value={tab} onValueChange={selectTab} className="space-y-4">
        <ModuleShell
          title={title}
          icon={Users}
          moduleKey="our-staff"
          tabs={<div className="flex flex-wrap items-center gap-1.5">
            <TabsList className="w-auto"><TabsTrigger value="profiles">Employee profiles</TabsTrigger></TabsList>
            <TabsList className="w-auto"><TabsTrigger value="communications"><MessagesSquare />Communication &amp; Mailbox</TabsTrigger></TabsList>
            <TabsList className="w-auto"><TabsTrigger value="office"><Building2 />Office View</TabsTrigger></TabsList>
            <MyProfileTabLink />
            {progressAllowed && <TabsList className="w-auto"><TabsTrigger value="progress"><TrendingUp />Staff progress</TabsTrigger></TabsList>}
          </div>}
          search={<ModuleSearchBar value={search} onChange={setSearch} placeholder="Search employees…" />}
          insightModule="staff"
        >
          <div className="px-2 py-2"><EmployeeDirectorySummary summary={summary.data} loading={summary.isPending} error={summary.error} onRetry={summary.refetch} /></div>
          {tab === 'profiles' && <div className="px-2 py-2"><EmployeeCategoryTiles categories={summary.data?.categories || []} selected={category} onSelect={setCategory} total={summary.data?.total} /></div>}
          <TabsContent value="profiles"><div className="mt-[1cm]"><OurProfilesTab kind="staff" basePath={basePath} scoped={scoped} directory searchValue={search} groupValue={category} onGroupChange={setCategory} categories={summary.data?.categories || []} total={summary.data?.total} /></div></TabsContent>
          <TabsContent value="communications"><div className="mt-4"><Communications embedded /></div></TabsContent>
          <TabsContent value="office"><div className="mt-4"><ExecutiveWallScene defaultViewMode="office" /></div></TabsContent>
          {progressAllowed && <TabsContent value="progress"><Suspense fallback={<p role="status" className="py-8 text-sm text-muted-foreground">Loading staff progress...</p>}><StaffProgressDashboard embedded search={search} /></Suspense></TabsContent>}
        </ModuleShell>
      </Tabs>
    </div>
  );
}