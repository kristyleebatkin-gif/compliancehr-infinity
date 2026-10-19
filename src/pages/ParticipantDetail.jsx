import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, FileSignature, Files, Heart, MessagesSquare, ScrollText } from 'lucide-react';
import ProfileCommDiary from '@/components/communications/ProfileCommDiary';
import ProfileHeader from '@/components/profile/ProfileHeader';
import TeamSection from '@/components/profile/TeamSection';
import ParticipantDetailsTab from '@/components/participants/ParticipantDetailsTab';
import ParticipantFillableForms from '@/components/participants/ParticipantFillableForms';
import ParticipantDocumentsTab from '@/components/participants/ParticipantDocumentsTab';
import ParticipantRecordsTab from '@/components/participants/ParticipantRecordsTab';
import ProfileIntakeDocuments from '@/components/intake/ProfileIntakeDocuments';
import FundingUtilisation from '@/components/participants/FundingUtilisation';
import ExportRow from '@/components/profile/ExportRow';
import { useRole } from '@/lib/useRole';

export default function ParticipantDetail() {
  const { id } = useParams();
  const [participant, setParticipant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { isAdmin } = useRole();

  const load = async () => {
    try {
      const record = await base44.entities.ParticipantProfile.get(id);
      if (!record) setNotFound(true);
      else setParticipant(record);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  if (loading) {
    return <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>;
  }

  if (notFound) {
    return (
      <div className="space-y-4 text-center py-16">
        <p className="text-muted-foreground">Participant not found.</p>
        <Button variant="outline" asChild><Link to="/participants"><ArrowLeft className="h-4 w-4" />Back to participants</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2"><Link to="/participants"><ArrowLeft className="h-4 w-4" />Participants</Link></Button>
      </div>

      <ProfileHeader profile={participant} kind="participant" onUpdated={load} />

      <FundingUtilisation participant={participant} onUpdated={load} />

      <TeamSection
        title={`${participant.full_name}'s support worker team`}
        description="The staff team who support this participant."
        values={participant.support_team || []}
        kind="staff"
        editable={isAdmin}
        onUpdate={async (next) => { await base44.entities.ParticipantProfile.update(participant.id, { support_team: next }); await load(); }}
        footer={participant.progress_notes_due_date ? (
          <p className="mt-3 text-[11px] text-muted-foreground">Progress note and report copies are emailed to administrators every 10 weeks. Progress notes due (3-monthly): <span className="font-semibold text-foreground">{participant.progress_notes_due_date}</span></p>
        ) : null}
      />

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details"><ScrollText className="mr-1 inline h-3.5 w-3.5" />Details</TabsTrigger>
          <TabsTrigger value="documents"><Files className="mr-1 inline h-3.5 w-3.5" />Documents</TabsTrigger>
          <TabsTrigger value="records"><Heart className="mr-1 inline h-3.5 w-3.5" />Incidents &amp; Goals</TabsTrigger>
          <TabsTrigger value="comm"><MessagesSquare className="mr-1 inline h-3.5 w-3.5" />Communication Diary</TabsTrigger>
          <TabsTrigger value="forms"><FileSignature className="mr-1 inline h-3.5 w-3.5" />Fillable Forms</TabsTrigger>
        </TabsList>
        <TabsContent value="details"><ExportRow kind="participant" person={participant} section="details" /><ParticipantDetailsTab participant={participant} onUpdated={load} /></TabsContent>
        <TabsContent value="documents">
          <ExportRow kind="participant" person={participant} section="documents" />
          <div className="space-y-6">
            <ParticipantDocumentsTab participant={participant} />
            <ProfileIntakeDocuments profileId={participant.id} />
          </div>
        </TabsContent>
        <TabsContent value="records"><ExportRow kind="participant" person={participant} section="records" /><ParticipantRecordsTab participant={participant} /></TabsContent>
        <TabsContent value="comm"><ExportRow kind="participant" person={participant} section="comm" /><ProfileCommDiary participant={participant} /></TabsContent>
        <TabsContent value="forms"><ExportRow kind="participant" person={participant} section="forms" /><ParticipantFillableForms participant={participant} /></TabsContent>
      </Tabs>
    </div>
  );
}