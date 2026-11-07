import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRole } from '@/lib/useRole';
import useProfileRecord from '@/hooks/useProfileRecord';
import EmployeeDocuments from '@/components/employee/EmployeeDocuments';
import ProfileLoadState from '@/components/profile/ProfileLoadState';

export default function DocumentVaultEntry({ Vault, ...props }) {
  const [params] = useSearchParams();
  const { user } = useRole();
  const kind = props.profileKind || (params.get('participant_id') ? 'participant' : 'staff');
  const id = props.profile?.id || params.get(kind === 'participant' ? 'participant_id' : 'employee_id');
  const result = useProfileRecord(kind === 'participant' ? 'ParticipantProfile' : 'StaffProfile', props.profile ? null : id);
  if (user?.role === 'Employee' && kind !== 'participant' && params.get('view') === 'personal') return <EmployeeDocuments {...props} />;
  if (!props.profile && id && (result.loading || result.error || !result.profile)) return <ProfileLoadState loading={result.loading} error={result.error} onRetry={result.refresh} backTo="/documents" label="Document Vault" />;
  const profile = props.profile || result.profile;
  if (user?.role === 'Employee' && profile && kind === 'participant' && !profile.admin_approved) return <p role="alert" className="p-4 text-destructive">This participant is not approved for employee access.</p>;
  return <Vault {...props} profile={profile} profileKind={profile ? kind : props.profileKind} />;
}