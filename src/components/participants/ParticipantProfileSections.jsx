import React, { Suspense } from 'react';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, CalendarClock, ClipboardCheck, FileSignature, Files, Heart, ListTodo, MessagesSquare, ScrollText, ShieldAlert, Target } from 'lucide-react';
import ProfileTodoList from '@/components/communications/ProfileTodoList';
import ParticipantDetailsTab from '@/components/participants/ParticipantDetailsTab';
import ParticipantDocumentsTab from '@/components/participants/ParticipantDocumentsTab';
import ParticipantRecordsTab from '@/components/participants/ParticipantRecordsTab';
import ParticipantFillableForms from '@/components/participants/ParticipantFillableForms';
import FundingUtilisation from '@/components/participants/FundingUtilisation';
import ProfileCommDiary from '@/components/communications/ProfileCommDiary';
import ProfileIntakeDocuments from '@/components/intake/ProfileIntakeDocuments';
import ExportRow from '@/components/profile/ExportRow';
import TeamSection from '@/components/profile/TeamSection';
import ParticipantShiftsTab from '@/components/participants/ParticipantShiftsTab';
import ParticipantSafetyTab from '@/components/participants/ParticipantSafetyTab';
import ParticipantReviewsTab from '@/components/participants/ParticipantReviewsTab';
import OurProfileModuleList from '@/components/profile/OurProfileModuleList';
import GoalProgress from '@/pages/GoalProgress';
import { useRole } from '@/lib/useRole';
import '@/components/profile/profileSectionLayout.css';

export default function ParticipantProfileSections({ participant, onUpdated, header, ourView = false }) {
  const { isAdmin } = useRole();
  const teamSection = (
    <TeamSection title={`${participant.full_name}'s support worker team`} description="The staff team who support this participant." values={participant.support_team || []} kind="staff" editable={isAdmin && !ourView}
      onUpdate={async (next) => { await base44.entities.ParticipantProfile.update(participant.id, { support_team: next }); await onUpdated(); }}
      footer={participant.progress_notes_due_date ? <p className="mt-3 text-[11px] text-muted-foreground">Progress note and report copies are emailed to administrators every 10 weeks. Progress notes due (3-monthly): <span className="font-semibold text-foreground">{participant.progress_notes_due_date}</span></p> : null} />
  );
  // Admin participant profiles carry the same business module set as the 'Our'
  // workspaces; participants get no HR, receipts or training content.
  const businessModules = ourView ? [] : OurProfileModuleList({ kind: 'participant', profile: participant });
  const tabs = [
    { key: 'details', label: 'Details', Icon: ScrollText, content: <div className="space-y-6"><FundingUtilisation participant={participant} onUpdated={onUpdated} />{teamSection}<ExportRow kind="participant" person={participant} section="details" /><ParticipantDetailsTab participant={participant} onUpdated={onUpdated} /></div> },
    { key: 'forms', label: 'Fillable Forms', Icon: FileSignature, content: <ParticipantFillableForms participant={participant} /> },
    { key: 'documents', label: 'File Checklist', Icon: Files, content: <div className="space-y-6"><ParticipantDocumentsTab participant={participant} /><ProfileIntakeDocuments profileId={participant.id} /></div> },
    { key: 'records', label: 'Safety Records', Icon: Heart, content: <ParticipantRecordsTab participant={participant} /> },
    { key: 'comm', label: 'Communication Log', Icon: MessagesSquare, content: <ProfileCommDiary participant={participant} /> },
    { key: 'todo', label: 'To-Do', Icon: ListTodo, content: <ProfileTodoList person={participant} /> },
    // Same modulars as 'Our' employee views, except as outlined: no HR,
    // receipts or training content. All read-only here.
    { key: 'shifts', label: 'Shifts & Availability', Icon: CalendarClock, content: <ParticipantShiftsTab participant={participant} /> },
    { key: 'safety', label: 'Risks & Safeguarding', Icon: ShieldAlert, content: <ParticipantSafetyTab participant={participant} /> },
    { key: 'reviews', label: 'Reviews, Surveys & Complaints', Icon: ClipboardCheck, content: <ParticipantReviewsTab participant={participant} /> },
    // Goal Progress lives on the normal participant profile (not the 'Our' workspace).
    { key: 'progress', label: 'Goal Progress', Icon: Target, content: <GoalProgress embedded profile={participant} profileKind="participant" /> },
    ...businessModules,
  ];
  return (
    <>
      {header}
      <Tabs defaultValue="details" className="profile-sections">
        <TabsList className="h-auto flex-wrap justify-start gap-1">
          {tabs.map(({ key, label, Icon }) => <TabsTrigger key={key} value={key}><Icon className="mr-1 inline h-3.5 w-3.5" />{label}</TabsTrigger>)}
        </TabsList>
        {tabs.map(({ key, content, module }) => (
          <TabsContent key={key} value={key}>
            <Suspense fallback={<div role="status" className="flex items-center justify-center gap-2 py-12 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Loading...</div>}>
              {key === 'details' ? content : <>{module ? null : <ExportRow kind="participant" person={participant} section={key} />}{content}</>}
            </Suspense>
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
}