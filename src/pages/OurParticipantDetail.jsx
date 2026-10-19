import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileLoadState from '@/components/profile/ProfileLoadState';
import ParticipantProfileSections from '@/components/participants/ParticipantProfileSections';
import useProfileRecord from '@/hooks/useProfileRecord';
import { useRole, ROLES } from '@/lib/useRole';

export default function OurParticipantDetail() {
  const { id } = useParams();
  const { profile: participant, loading, error, refresh } = useProfileRecord('ParticipantProfile', id);
  const { role, user } = useRole();
  const notPermitted = !loading && !error && participant && role === ROLES.PARTICIPANT && participant.email !== (user?.email || '');
  if (loading || error || !participant || notPermitted) {
    if (notPermitted) return <ProfileLoadState backTo="/our-participants" label="Our participant profiles" error message="You can only view your own participant profile." />;
    return <ProfileLoadState loading={loading} error={error} backTo="/our-participants" label="Our participant profiles" />;
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="ghost" size="sm" asChild><Link to="/our-participants"><ArrowLeft className="h-4 w-4" />Our participant profiles</Link></Button>
        <div className="flex flex-wrap items-center gap-2" />
      </div>
      <ParticipantProfileSections participant={participant} onUpdated={refresh} ourView header={<ProfileHeader profile={participant} kind="participant" onUpdated={refresh} />} />
    </div>
  );
}