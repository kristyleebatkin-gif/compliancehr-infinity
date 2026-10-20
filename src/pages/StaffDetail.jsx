import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProfileHeader from '@/components/profile/ProfileHeader';
import PortalInviteButton from '@/components/profile/PortalInviteButton';
import ProfileLoadState from '@/components/profile/ProfileLoadState';
import StaffProfileSections from '@/components/staff/StaffProfileSections';
import useProfileRecord from '@/hooks/useProfileRecord';

export default function StaffDetail() {
  const { id } = useParams();
  const { profile: staff, loading, error, refresh } = useProfileRecord('StaffProfile', id);
  if (loading || error || !staff) return <ProfileLoadState loading={loading} error={error} backTo="/staff" label="Staff Profiles" />;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" asChild><Link to="/staff"><ArrowLeft className="h-4 w-4" />Staff Profiles</Link></Button>
        <PortalInviteButton kind="staff" profile={staff} />
      </div>
      <StaffProfileSections staff={staff} onUpdated={refresh} header={<ProfileHeader profile={staff} kind="staff" onUpdated={refresh} />} />
    </div>
  );
}