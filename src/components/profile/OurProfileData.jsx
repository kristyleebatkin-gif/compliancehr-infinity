import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StaffDetailsTab from '@/components/staff/StaffDetailsTab';
import ParticipantDetailsTab from '@/components/participants/ParticipantDetailsTab';
import StaffFillableForms from '@/components/staff/StaffFillableForms';
import ParticipantFillableForms from '@/components/participants/ParticipantFillableForms';
import StaffFileChecklist from '@/components/staff/StaffFileChecklist';
import ParticipantDocumentsTab from '@/components/participants/ParticipantDocumentsTab';
import ExportRow from '@/components/profile/ExportRow';

export default function OurProfileData({ profile, kind, onUpdated }) {
  const participant = kind === 'participant';
  return (
    <Tabs defaultValue="details" className="space-y-4">
      <TabsList className="justify-start">
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="forms">Fillable Forms</TabsTrigger>
        <TabsTrigger value="files">File Checklist</TabsTrigger>
      </TabsList>
      <TabsContent value="details" className="space-y-6">
        <ExportRow kind={kind} person={profile} section="details" />
        {participant ? <ParticipantDetailsTab participant={profile} onUpdated={onUpdated} /> : <StaffDetailsTab staff={profile} onUpdated={onUpdated} />}
      </TabsContent>
      <TabsContent value="forms">
        {participant ? <ParticipantFillableForms participant={profile} /> : <StaffFillableForms staff={profile} />}
      </TabsContent>
      <TabsContent value="files">
        {participant ? <ParticipantDocumentsTab participant={profile} /> : <StaffFileChecklist staff={profile} />}
      </TabsContent>
    </Tabs>
  );
}