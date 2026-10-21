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
import '@/components/profile/myProfilePastels.css';

export default function OurEmployeeDetail({ backTo = '/our-employees', backLabel = 'Our employee profiles', scoped = true }) {
  const { id } = useParams();
  const { profile: employee, loading, error, refresh } = useProfileRecord('StaffProfile', id);
  const { role, user } = useRole();
  const notPermitted = scoped && !loading && !error && employee && role === ROLES.SUPPORT && employee.email !== (user?.email || '');
  if (loading || error || !employee || notPermitted) {
    if (notPermitted) return <ProfileLoadState backTo={backTo} label={backLabel} error message="You can only view your own employee profile." />;
    return <ProfileLoadState loading={loading} error={error} backTo={backTo} label={backLabel} onRetry={refresh} />;
  }
  return (
    <div className="my-profile-pastels mx-auto max-w-6xl p-3 md:p-5 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" asChild><Link to={backTo}><ArrowLeft className="h-4 w-4" />Back to {backLabel}</Link></Button>
        <PortalInviteButton kind="staff" profile={employee} />
      </div>
      <OurProfileWorkspace key={employee.id} profile={employee} kind="staff" matchEmployeeLayout onUpdated={refresh} header={<ProfileHeader profile={employee} kind="staff" onUpdated={refresh} />} />
    </div>
  );
}