import React, { Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import OurProfileModuleList from '@/components/profile/OurProfileModuleList';
import OurProfileData from '@/components/profile/OurProfileData';
import ApprovedParticipantProfiles from '@/components/profile/ApprovedParticipantProfiles';

export default function OurProfileWorkspace({ profile, kind, header, onUpdated }) {
  const [params, setParams] = useSearchParams();
  const modules = OurProfileModuleList({ kind, profile,
    details: <OurProfileData profile={profile} kind={kind} onUpdated={onUpdated} />,
    approvedParticipants: <ApprovedParticipantProfiles />,
  });
  const selected = modules.find((module) => module.key === params.get('module')) || modules[0];
  const selectModule = (key) => {
    const next = new URLSearchParams(params);
    if (key === 'details') next.delete('module');
    else next.set('module', key);
    setParams(next, { replace: true });
  };
  return (
    <>
      {header}
      <Tabs value={selected.key} onValueChange={selectModule} className="min-w-0 space-y-5">
      <TabsList aria-label={`${kind === 'staff' ? 'Employee' : 'Participant'} profile modules`} className="h-auto justify-start">
        {modules.map(({ key, label, Icon }) => <TabsTrigger key={key} value={key}><Icon className="h-3.5 w-3.5" />{label}</TabsTrigger>)}
      </TabsList>
      <TabsContent key={`${profile.id}-${selected.key}`} value={selected.key} className="min-w-0 [&>div]:p-0">
        <Suspense fallback={<div role="status" className="flex items-center justify-center gap-2 py-12 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Loading {selected.label}...</div>}>
          {selected.content}
        </Suspense>
      </TabsContent>
      </Tabs>
    </>
  );
}