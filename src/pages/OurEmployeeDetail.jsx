import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProfileHeader from '@/components/profile/ProfileHeader';
import PortalInviteButton from '@/components/profile/PortalInviteButton';
import ProfileLoadState from '@/components/profile/ProfileLoadState';
import StaffProfileSections from '@/components/staff/StaffProfileSections';
import useProfileRecord from '@/hooks/useProfileRecord';

export default function OurEmployeeDetail() {
  const { id } = useParams();
  const { profile: employee, loading, error, refresh } = useProfileRecord('StaffProfile', id);
  if (loading || error || !employee) return <ProfileLoadState loading={loading} error={error} backTo="/our-employees" label="Our employee profiles" />;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" asChild><Link to="/our-employees"><ArrowLeft className="h-4 w-4" />Our employee profiles</Link></Button>
        <PortalInviteButton kind="staff" profile={employee} />
      </div>
      <StaffProfileSections staff={employee} onUpdated={refresh} header={<ProfileHeader profile={employee} kind="staff" onUpdated={refresh} />} />
    </div>
  );
}