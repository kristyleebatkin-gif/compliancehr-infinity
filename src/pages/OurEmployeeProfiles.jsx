import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, UserRound, Users } from 'lucide-react';
import EmployeeDirectorySummary from '@/components/profile/EmployeeDirectorySummary';
import EmployeeCategoryTiles from '@/components/profile/EmployeeCategoryTiles';
import useEmployeeDirectorySummary from '@/components/profile/useEmployeeDirectorySummary';
import '@/components/profile/employeeDirectory.css';
import ModuleShell from '@/components/module/ModuleShell';
import ModuleSearchBar from '@/components/module/ModuleSearchBar';
import OurProfilesTab from '@/components/profile/OurProfilesTab';
import { lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRole } from '@/lib/useRole';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
const StaffProgressDashboard = lazy(() => import('@/pages/StaffProgressDashboard'));

export default function OurEmployeeProfiles({ basePath = '/our-employees', scoped = true, title = 'Our employee profiles' }) {
  const { can } = useRole();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const summary = useEmployeeDirectorySummary(scoped);
  const [params, setParams] = useSearchParams();
  const progressAllowed = can('staff-progress');
  const tab = progressAllowed && params.get('staffTab') === 'progress' ? 'progress' : 'profiles';
  const selectTab = (value) => {
    const next = new URLSearchParams(params);
    if (value === 'progress') next.set('staffTab', value); else next.delete('staffTab');
    setParams(next, { replace: true });
  };
  return (
    <div className="employee-directory mx-auto max-w-6xl space-y-4 p-4 md:p-8 sm:max-lg:space-y-2 sm:max-lg:p-2">
      <Tabs value={tab} onValueChange={selectTab} className="space-y-4">
        <ModuleShell
          title={title}
          icon={Users}
          moduleKey="our-staff"
          tabs={<TabsList className="w-auto">
            <TabsTrigger value="profiles">Employee profiles</TabsTrigger>
            {progressAllowed && <TabsTrigger value="progress"><TrendingUp />Staff progress</TabsTrigger>}
          </TabsList>}
          actions={<Button asChild variant="outline"><Link to="/my-profile"><UserRound />My profile</Link></Button>}
          search={<ModuleSearchBar value={search} onChange={setSearch} placeholder="Search employees…" />}
          insightModule="staff"
        >
          <EmployeeDirectorySummary summary={summary.data} loading={summary.isPending} error={summary.error} onRetry={summary.refetch} />
          {tab === 'profiles' && <EmployeeCategoryTiles categories={summary.data?.categories || []} selected={category} onSelect={setCategory} total={summary.data?.total} />}
          <TabsContent value="profiles"><OurProfilesTab kind="staff" basePath={basePath} scoped={scoped} directory searchValue={search} groupValue={category} onGroupChange={setCategory} categories={summary.data?.categories || []} total={summary.data?.total} /></TabsContent>
          {progressAllowed && <TabsContent value="progress"><Suspense fallback={<p role="status" className="py-8 text-sm text-muted-foreground">Loading staff progress...</p>}><StaffProgressDashboard embedded search={search} /></Suspense></TabsContent>}
        </ModuleShell>
      </Tabs>
    </div>
  );
}