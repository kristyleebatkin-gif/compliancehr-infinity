import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, FileSignature, Files, Heart, ScrollText } from 'lucide-react';
import ParticipantDetailsTab from '@/components/participants/ParticipantDetailsTab';
import ParticipantDocumentsTab from '@/components/participants/ParticipantDocumentsTab';
import ParticipantFillableForms from '@/components/participants/ParticipantFillableForms';
import ParticipantRecordsTab from '@/components/participants/ParticipantRecordsTab';
import ProfileIntakeDocuments from '@/components/intake/ProfileIntakeDocuments';

export default function ParticipantDetail() {
  const { id } = useParams();
  const [participant, setParticipant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

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
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="flex items-center gap-2 text-2xl font-bold"><Heart className="h-6 w-6" />{participant.full_name}</h1>
          <Badge className={statusTone(participant.status)}>{participant.status}</Badge>
          {participant.ndis_number && <Badge variant="outline">NDIS {participant.ndis_number}</Badge>}
          {participant.ndis_reference_number && <Badge variant="outline">Ref {participant.ndis_reference_number}</Badge>}
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details"><ScrollText className="mr-1 inline h-3.5 w-3.5" />Details</TabsTrigger>
          <TabsTrigger value="documents"><Files className="mr-1 inline h-3.5 w-3.5" />Documents</TabsTrigger>
          <TabsTrigger value="forms"><FileSignature className="mr-1 inline h-3.5 w-3.5" />Fillable Forms</TabsTrigger>
          <TabsTrigger value="records"><Heart className="mr-1 inline h-3.5 w-3.5" />Incidents &amp; Goals</TabsTrigger>
        </TabsList>
        <TabsContent value="details"><ParticipantDetailsTab participant={participant} onUpdated={load} /></TabsContent>
        <TabsContent value="documents">
          <div className="space-y-6">
            <ParticipantDocumentsTab participant={participant} />
            <ProfileIntakeDocuments profileId={participant.id} />
          </div>
        </TabsContent>
        <TabsContent value="forms"><ParticipantFillableForms participant={participant} /></TabsContent>
        <TabsContent value="records"><ParticipantRecordsTab participant={participant} /></TabsContent>
      </Tabs>
    </div>
  );
}