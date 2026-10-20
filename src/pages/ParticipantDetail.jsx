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

export default function ParticipantDetail() {
  const { id } = useParams();
  const { profile: participant, loading, error, refresh } = useProfileRecord('ParticipantProfile', id);
  if (loading || error || !participant) return <ProfileLoadState loading={loading} error={error} backTo="/participants" label="Participant Profiles" />;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="ghost" size="sm" asChild><Link to="/participants"><ArrowLeft className="h-4 w-4" />Participant Profiles</Link></Button>
        <div className="flex flex-wrap items-center gap-2">
          <ParticipantApprovalToggle participant={participant} onUpdate={refresh} />
          <PortalInviteButton kind="participant" profile={participant} />
        </div>
      </div>
      <ParticipantProfileSections participant={participant} onUpdated={refresh} header={<ProfileHeader profile={participant} kind="participant" onUpdated={refresh} />} />
    </div>
  );
}