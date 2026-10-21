import React from 'react';
import PageHeader from '@/components/PageHeader';
import OurProfilesTab from '@/components/profile/OurProfilesTab';
import { lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRole } from '@/lib/useRole';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
const StaffProgressDashboard = lazy(() => import('@/pages/StaffProgressDashboard'));

export default function OurEmployeeProfiles({ basePath = '/our-employees', scoped = true, title = 'Our employee profiles' }) {
  const { can } = useRole();
  const [params, setParams] = useSearchParams();
  const progressAllowed = can('staff-progress');
  const tab = progressAllowed && params.get('staffTab') === 'progress' ? 'progress' : 'profiles';
  const selectTab = (value) => {
    const next = new URLSearchParams(params);
    if (value === 'progress') next.set('staffTab', value); else next.delete('staffTab');
    setParams(next, { replace: true });
  };
  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 md:p-8 sm:max-lg:space-y-2 sm:max-lg:p-2">
      <PageHeader title={title} showDivider={false} showAlerts={false} showCompliance={false} showAudit={false} className="rounded-xl p-3 sm:p-3 [&_h1]:text-xl" />
      <Tabs value={tab} onValueChange={selectTab}>
        {progressAllowed && <TabsList><TabsTrigger value="profiles">Employee profiles</TabsTrigger><TabsTrigger value="progress">Staff progress</TabsTrigger></TabsList>}
        <TabsContent value="profiles"><OurProfilesTab kind="staff" basePath={basePath} scoped={scoped} /></TabsContent>
        {progressAllowed && <TabsContent value="progress"><Suspense fallback={<p role="status" className="py-8 text-sm text-muted-foreground">Loading staff progress...</p>}><StaffProgressDashboard embedded /></Suspense></TabsContent>}
      </Tabs>
    </div>
  );
}