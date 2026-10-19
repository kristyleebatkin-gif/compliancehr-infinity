// Shared authorization helpers for backend functions.

// Internal token passed by this app's own workflow definitions in their invoke
// payloads. Function code and workflow files are not publicly readable, so
// anonymous callers of the published function URL cannot supply it.
export const SYSTEM_TOKEN = 'a7f3d9c2e8b14f6a0d5c9e2b7f4a1c8e3d6b9f2a5c8e1d4b7a9f3c6e2d5b8a1f';

export const MANAGEMENT_ROLES = ['admin', 'Provider Administrator', 'Compliance Manager', 'Administration'];

// Roles trusted to send email from the organisation's identity.
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
  'Auditor',
];

// Roles trusted to record NDIS audit consent.
export const CONSENT_ROLES = [...MANAGEMENT_ROLES, 'Human Resources Manager', 'Quality & Improvement Manager'];

// Roles trusted to manage HR paperwork (contracts and position descriptions).
export const HR_ROLES = [...MANAGEMENT_ROLES, 'Team Leader', 'Human Resources Manager'];

export function hasAnyRole(user: any, roles: string[]): boolean {
  return !!user && roles.includes(user.role);
}

// Accepts either a workflow invocation carrying the system token, or an
// authenticated user holding one of the allowed roles.
export async function authorizeSystemCall(base44: any, body: any, roles: string[] = MANAGEMENT_ROLES): Promise<boolean> {
  if (body && body.token === SYSTEM_TOKEN) return true;
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