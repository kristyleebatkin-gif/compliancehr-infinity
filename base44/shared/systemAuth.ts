// Shared authorization helpers for backend functions.

import { hasApprovedAccess } from './appAccess.ts';

export const MANAGEMENT_ROLES = ['admin', 'Provider Administrator', 'Management'];

// Roles trusted to send email from the organisation's identity.
// External/low-trust roles (e.g. Auditor) are deliberately excluded: they must
// never send email from the organisation's identity.
export const STAFF_SEND_ROLES = [
  ...MANAGEMENT_ROLES,
  'Human Resources Manager',
  'CRM & Marketing Officer',
  'Finance & Accounts Officer',
  'Rostering Coordinator',
  'Team Leader',
  'Quality & Improvement Manager',
  'Intake Officer',
  'Support Worker',
  'Employee',
];

// Roles trusted to record NDIS audit consent.
export const CONSENT_ROLES = [...MANAGEMENT_ROLES, 'Human Resources Manager', 'Quality & Improvement Manager'];

// Roles trusted to manage HR paperwork (contracts and position descriptions).
export const HR_ROLES = [...MANAGEMENT_ROLES, 'Team Leader', 'Human Resources Manager'];

export function hasAnyRole(user: any, roles: string[]): boolean {
  return hasApprovedAccess(user) && roles.includes(user.role);
}

// Authorizes a privileged automation function: only an authenticated user
// holding one of the allowed roles may call it. Workflow steps run as the
// app's admin, so scheduled invocations also authenticate through auth.me().
export async function authorizeSystemCall(base44: any, _body?: any, roles: string[] = MANAGEMENT_ROLES): Promise<boolean> {
  try {
    return hasAnyRole(await base44.auth.me(), roles);
  } catch {
    return false;
  }
}

// Lowercased set of email addresses stored in the app (registered users,
// staff, participants and contacts).
export async function appContactEmails(base44: any): Promise<Set<string>> {
  const emails = new Set<string>();
  const results = await Promise.allSettled([
    base44.asServiceRole.entities.User.list(),
    base44.asServiceRole.entities.StaffProfile.filter({}, { limit: 1000, fields: ['email'] }),
    base44.asServiceRole.entities.ParticipantProfile.filter({}, { limit: 1000, fields: ['email'] }),
    base44.asServiceRole.entities.Contact.filter({}, { limit: 1000, fields: ['email'] }),
  ]);
  for (const result of results) {
    if (result.status !== 'fulfilled') continue;
    const records = Array.isArray(result.value) ? result.value : result.value.items || [];
    for (const record of records) {
      if (record && record.email) emails.add(String(record.email).trim().toLowerCase());
    }
  }
  return emails;
}