import React from 'react';
import IntakeCaseWorkflow from '@/components/intake/IntakeCaseWorkflow';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StaffDetailsTab from '@/components/staff/StaffDetailsTab';
import ParticipantDetailsTab from '@/components/participants/ParticipantDetailsTab';
import StaffFillableForms from '@/components/staff/StaffFillableForms';
import AllParticipantForms from '@/components/participants/AllParticipantForms';
import StaffFileChecklist from '@/components/staff/StaffFileChecklist';
import ParticipantDocumentsTab from '@/components/participants/ParticipantDocumentsTab';
import ExportRow from '@/components/profile/ExportRow';
import AllEmployeeForms from '@/components/profile/AllEmployeeForms';
import ParticipantProfileFileChecklist from '@/components/profile/ParticipantProfileFileChecklist';

export default function OurProfileData({ profile, kind, onUpdated, detailsContent, initialTab = 'details', personal = false, contentOnly = false }) {
  const participant = kind === 'participant';
  const staffIntake = personal && !participant;
  if (contentOnly) {
    if (initialTab === 'forms') return participant ? <AllParticipantForms participant={profile} /> : <AllEmployeeForms profile={profile} />;
    if (participant && initialTab === 'files') return <ParticipantProfileFileChecklist participant={profile} />;
    return <IntakeCaseWorkflow intakeType={participant ? 'Participant' : 'Employee'} profile={profile} profileView={initialTab === 'files' ? 'readiness' : 'documents'} />;
  }
  return (
    <Tabs defaultValue={initialTab} className="space-y-4">
      <TabsList className="justify-start">
        <TabsTrigger value="details">{staffIntake ? 'Documents' : 'Details'}</TabsTrigger>
        <TabsTrigger value="forms">Fillable Forms</TabsTrigger>
        <TabsTrigger value="files">File Checklist</TabsTrigger>
      </TabsList>
      <TabsContent value="details" className="space-y-4">
        {staffIntake ? <IntakeCaseWorkflow intakeType="Employee" profile={profile} profileView="documents" /> : detailsContent || <><ExportRow kind={kind} person={profile} section="details" />
        {participant ? <ParticipantDetailsTab participant={profile} onUpdated={onUpdated} /> : <StaffDetailsTab staff={profile} onUpdated={onUpdated} />}</>}
      </TabsContent>
      <TabsContent value="forms">
        {participant ? <AllParticipantForms participant={profile} /> : personal ? <AllEmployeeForms profile={profile} /> : <StaffFillableForms staff={profile} />}
      </TabsContent>
      <TabsContent value="files">
        {staffIntake ? <IntakeCaseWorkflow intakeType="Employee" profile={profile} profileView="readiness" /> : participant ? <ParticipantDocumentsTab participant={profile} /> : <StaffFileChecklist staff={profile} />}
      </TabsContent>
    </Tabs>
  );
}