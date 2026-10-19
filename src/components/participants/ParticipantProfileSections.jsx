import React from 'react';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileSignature, Files, Heart, MessagesSquare, ScrollText } from 'lucide-react';
import ParticipantDetailsTab from '@/components/participants/ParticipantDetailsTab';
import ParticipantDocumentsTab from '@/components/participants/ParticipantDocumentsTab';
import ParticipantRecordsTab from '@/components/participants/ParticipantRecordsTab';
import ParticipantFillableForms from '@/components/participants/ParticipantFillableForms';
import FundingUtilisation from '@/components/participants/FundingUtilisation';
import ProfileCommDiary from '@/components/communications/ProfileCommDiary';
import ProfileIntakeDocuments from '@/components/intake/ProfileIntakeDocuments';
import ExportRow from '@/components/profile/ExportRow';
import TeamSection from '@/components/profile/TeamSection';
import { useRole } from '@/lib/useRole';

export default function ParticipantProfileSections({ participant, onUpdated, header }) {
  const { isAdmin } = useRole();
  const teamSection = (
    <TeamSection title={`${participant.full_name}'s support worker team`} description="The staff team who support this participant." values={participant.support_team || []} kind="staff" editable={isAdmin}
      onUpdate={async (next) => { await base44.entities.ParticipantProfile.update(participant.id, { support_team: next }); await onUpdated(); }}
      footer={participant.progress_notes_due_date ? <p className="mt-3 text-[11px] text-muted-foreground">Progress note and report copies are emailed to administrators every 10 weeks. Progress notes due (3-monthly): <span className="font-semibold text-foreground">{participant.progress_notes_due_date}</span></p> : null} />
  );
  const tabs = [
    { key: 'details', label: 'Details', Icon: ScrollText, content: <div className="space-y-6">{header}<FundingUtilisation participant={participant} onUpdated={onUpdated} />{teamSection}<ExportRow kind="participant" person={participant} section="details" /><ParticipantDetailsTab participant={participant} onUpdated={onUpdated} /></div> },
    { key: 'documents', label: 'Documents', Icon: Files, content: <div className="space-y-6"><ParticipantDocumentsTab participant={participant} /><ProfileIntakeDocuments profileId={participant.id} /></div> },
    { key: 'records', label: 'Incidents & Goals', Icon: Heart, content: <ParticipantRecordsTab participant={participant} /> },
    { key: 'comm', label: 'Communication Diary', Icon: MessagesSquare, content: <ProfileCommDiary participant={participant} /> },
    { key: 'forms', label: 'Fillable Forms', Icon: FileSignature, content: <ParticipantFillableForms participant={participant} /> },
  ];
  return (
    <Tabs defaultValue="details">
      <TabsList className="h-auto flex-wrap justify-start gap-1">
        {tabs.map(({ key, label, Icon }) => <TabsTrigger key={key} value={key}><Icon className="mr-1 inline h-3.5 w-3.5" />{label}</TabsTrigger>)}
      </TabsList>
      {tabs.map(({ key, content }) => (
        <TabsContent key={key} value={key}>
          {key === 'details' ? content : <><ExportRow kind="participant" person={participant} section={key} />{content}</>}
        </TabsContent>
      ))}
    </Tabs>
  );
}