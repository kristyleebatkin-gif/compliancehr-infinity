import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProfileHeader from '@/components/profile/ProfileHeader';
import PortalInviteButton from '@/components/profile/PortalInviteButton';
import ProfileLoadState from '@/components/profile/ProfileLoadState';
import ParticipantApprovalToggle from '@/components/participants/ParticipantApprovalToggle';
import ParticipantProfileSections from '@/components/participants/ParticipantProfileSections';
import useProfileRecord from '@/hooks/useProfileRecord';

export default function OurParticipantDetail() {
  const { id } = useParams();
  const { profile: participant, loading, error, refresh } = useProfileRecord('ParticipantProfile', id);
  if (loading || error || !participant) return <ProfileLoadState loading={loading} error={error} backTo="/our-participants" label="Our participant profiles" />;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="ghost" size="sm" asChild><Link to="/our-participants"><ArrowLeft className="h-4 w-4" />Our participant profiles</Link></Button>
        <div className="flex flex-wrap items-center gap-2">
          <ParticipantApprovalToggle participant={participant} onUpdate={refresh} />
          <PortalInviteButton kind="participant" profile={participant} />
        </div>
      </div>
      <ProfileHeader profile={participant} kind="participant" onUpdated={refresh} />
      <ParticipantProfileSections participant={participant} onUpdated={refresh} />
    </div>
  );
}