import { hasApprovedAccess } from './appAccess.ts';

export async function requireEmployee(base44) {
  const user = await base44.auth.me();
  if (!user?.email || user.role !== 'Employee' || !hasApprovedAccess(user)) throw new Error('Active Employee access is required.');
  return user;
}
export async function approvedEmployeeParticipant(base44, id) {
  if (typeof id !== 'string' || !id || id.length > 100) throw new Error('Select an approved participant.');
  const person = await base44.asServiceRole.entities.ParticipantProfile.get(id);
  if (!person?.admin_approved) throw new Error('This participant is not approved.');
  const matches = await base44.asServiceRole.entities.ParticipantProfile.count({ full_name: person.full_name });
  if (matches !== 1) throw new Error('Duplicate participant names need administrator review before these records can be shared.');
  return person;
}
export async function employeeRosterIdentity(base44, user) {
  const page = await base44.asServiceRole.entities.StaffProfile.filter({ email: user.email }, { limit: 2, fields: ['id', 'full_name'] });
  if (page.items.length !== 1 || !page.items[0].full_name) throw new Error('Ask an administrator to link one employee profile to your account.');
  const person = page.items[0];
  if (await base44.asServiceRole.entities.StaffProfile.count({ full_name: person.full_name }) !== 1) throw new Error('Duplicate employee names need administrator review before sharing roster records.');
  return person;
}