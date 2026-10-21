import React from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { Users } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useRole } from '@/lib/useRole';
import Staff from '@/pages/Staff';
import StaffProgressDashboard from '@/pages/StaffProgressDashboard';

export default function StaffProfilesHub({ initialTab = 'profiles' }) {
  const { can } = useRole();
  const [params, setParams] = useSearchParams();
  const profiles = can('staff');
  const progress = can('staff-progress');
  if (!profiles && !progress) return <Navigate to="/dashboard" replace />;
  const requested = params.get('staffTab') || initialTab;
  const selected = requested === 'progress' && progress ? 'progress' : profiles ? 'profiles' : 'progress';
  const selectTab = (value) => {
    const next = new URLSearchParams(params);
    next.set('staffTab', value);
    setParams(next, { replace: true });
  };
  if (selected === 'profiles') return <Staff />;
  return <div className="compact-module compact-tabs mx-auto w-full min-w-0 max-w-6xl space-y-3 p-2">
    <PageHeader icon={Users} title="Staff Profiles" subtitle="Employee records, documents, intake progress and compliance in one place." showAlerts={false} action={selected === 'progress' && profiles ? <Button variant="outline" size="sm" onClick={() => selectTab('profiles')}><Users />Back to staff profiles</Button> : null} />
    <Tabs value={selected} onValueChange={selectTab}>
      {progress && <TabsContent value="progress"><StaffProgressDashboard embedded /></TabsContent>}
    </Tabs>
  </div>;
}