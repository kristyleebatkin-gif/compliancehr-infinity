import { base44 } from '@/api/base44Client';

const REGISTER_ROLES = ['admin', 'Provider Administrator', 'Management', 'Compliance Manager', 'Administration', 'Team Leader', 'Human Resources Manager'];
export const managesProfiles = (role) => REGISTER_ROLES.includes(role);
export const ownProfileQuery = (user) => ({ email: user?.email || '__no_signed_in_email__' });
export function profileRecordScope(role, user, entityName) {
  if (managesProfiles(role)) return {};
  if (role === 'Support Worker' && entityName === 'ParticipantProfile') return { admin_approved: true };
  return ownProfileQuery(user);
}
export async function preparePersonalProfileAccess() {
  const { data } = await base44.functions.invoke('personalProfileAccess', {});
  if (data.error) throw new Error(data.error);
  return data;
}