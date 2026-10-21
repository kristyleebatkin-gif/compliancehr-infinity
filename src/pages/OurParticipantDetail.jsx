import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProfileHeader from '@/components/profile/ProfileHeader';
import PortalInviteButton from '@/components/profile/PortalInviteButton';
import ProfileLoadState from '@/components/profile/ProfileLoadState';
import OurProfileWorkspace from '@/components/profile/OurProfileWorkspace';
import useProfileRecord from '@/hooks/useProfileRecord';
import { useRole, ROLES } from '@/lib/useRole';

export default function OurParticipantDetail({ backTo = '/our-participants', backLabel = 'Our participant profiles', scoped = true }) {
  const { id } = useParams();
  const { profile: participant, loading, error, refresh } = useProfileRecord('ParticipantProfile', id);
  const { role, user } = useRole();
  const notPermitted = scoped && !loading && !error && participant && ((role === ROLES.PARTICIPANT && participant.email !== (user?.email || '')) || (role === ROLES.SUPPORT && !participant.admin_approved));
  if (loading || error || !participant || notPermitted) {
    if (notPermitted) return <ProfileLoadState backTo={backTo} label={backLabel} error message={role === ROLES.SUPPORT ? 'This participant profile has not been approved for employee access.' : 'You can only view your own participant profile.'} />;
    return <ProfileLoadState loading={loading} error={error} backTo={backTo} label={backLabel} />;
  }
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="ghost" size="sm" asChild><Link to={backTo}><ArrowLeft className="h-4 w-4" />Back to {backLabel}</Link></Button>
        <div className="flex flex-wrap items-center gap-2">
          <PortalInviteButton kind="participant" profile={participant} />
        </div>
      </div>
      <OurProfileWorkspace key={participant.id} profile={participant} kind="participant" onUpdated={refresh} header={<ProfileHeader profile={participant} kind="participant" onUpdated={refresh} />} />
    </div>
  );
}