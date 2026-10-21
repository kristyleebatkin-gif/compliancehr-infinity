import React, { Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, FileText, ClipboardList } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import OurProfileModuleList from '@/components/profile/OurProfileModuleList';
import OurProfileData from '@/components/profile/OurProfileData';
import ApprovedParticipantProfiles from '@/components/profile/ApprovedParticipantProfiles';

export default function OurProfileWorkspace({ profile, kind, header, onUpdated, details, ourView = true, extraModules = [], moduleOverrides = {}, personal = false, matchEmployeeLayout = false }) {
  const [params, setParams] = useSearchParams();
  const employeeTiles = kind === 'staff' && (personal || matchEmployeeLayout);
  const modules = [...OurProfileModuleList({ kind, profile, ourView,
    details: details || <OurProfileData profile={profile} kind={kind} onUpdated={onUpdated} />,
    approvedParticipants: <ApprovedParticipantProfiles />,
  }), ...extraModules].flatMap((module) => employeeTiles && module.key === 'details' ? [
    { ...module, label: 'Documents', content: <OurProfileData personal contentOnly profile={profile} kind={kind} /> },
    { key: 'forms', label: 'Fillable Forms', Icon: FileText, content: <OurProfileData personal contentOnly profile={profile} kind={kind} initialTab="forms" /> },
    { key: 'files', label: 'File Checklist', Icon: ClipboardList, content: <OurProfileData personal contentOnly profile={profile} kind={kind} initialTab="files" /> },
  ] : [module]).map((module) => ({ ...module, content: moduleOverrides[module.key] || module.content }));
  const legacy = personal ? ({ work: 'work', documents: 'documents', forms: 'forms', files: 'files', 'name-tags': 'name-tag' }[params.get('tab')]) : null;
  const selected = modules.find((module) => module.key === (params.get('module') || legacy)) || modules[0];
  const selectModule = (key) => {
    const next = new URLSearchParams(params);
    if (personal && next.get('tab') !== 'participant-details') next.delete('tab');
    if (key === 'details') next.delete('module');
    else next.set('module', key);
    setParams(next, { replace: true });
  };
  return (
    <>
      {header}
      <Tabs value={selected.key} onValueChange={selectModule} className={`${personal || matchEmployeeLayout ? 'compact-tabs ' : ''}min-w-0 space-y-3`}>
      <TabsList aria-label={`${kind === 'staff' ? 'Employee' : 'Participant'} profile modules`} className="h-auto justify-start">
        {modules.map((module, index) => {
          const Icon = module.Icon;
          return <TabsTrigger key={module.key} value={module.key} data-module-index={index}><Icon className="h-3.5 w-3.5" />{module.label}</TabsTrigger>;
        })}
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