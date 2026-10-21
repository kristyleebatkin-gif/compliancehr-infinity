import React, { useState } from 'react';
import EmployeeDirectorySummary from '@/components/profile/EmployeeDirectorySummary';
import EmployeeDirectoryToolbar from '@/components/profile/EmployeeDirectoryToolbar';
import useEmployeeDirectorySummary from '@/components/profile/useEmployeeDirectorySummary';
import '@/components/profile/employeeDirectory.css';
import PageHeader from '@/components/PageHeader';
import OurProfilesTab from '@/components/profile/OurProfilesTab';
import { lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRole } from '@/lib/useRole';
import { Tabs, TabsContent } from '@/components/ui/tabs';
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
      <PageHeader title={title} showDivider={false} showAlerts={false} showCompliance={false} showAudit={false} />
      <Tabs value={tab} onValueChange={selectTab} className="space-y-4">
        <EmployeeDirectoryToolbar search={search} onSearch={setSearch} progressAllowed={progressAllowed} />
        <EmployeeDirectorySummary summary={summary.data} loading={summary.isPending} error={summary.error} onRetry={summary.refetch} />
        {tab === 'profiles' && <div aria-hidden="true" className="h-3 w-full rounded-md border border-border bg-card" />}
        <TabsContent value="profiles"><OurProfilesTab kind="staff" basePath={basePath} scoped={scoped} directory searchValue={search} groupValue={category} onGroupChange={setCategory} categories={summary.data?.categories || []} total={summary.data?.total} /></TabsContent>
        {progressAllowed && <TabsContent value="progress"><Suspense fallback={<p role="status" className="py-8 text-sm text-muted-foreground">Loading staff progress...</p>}><StaffProgressDashboard embedded search={search} /></Suspense></TabsContent>}
      </Tabs>
    </div>
  );
}