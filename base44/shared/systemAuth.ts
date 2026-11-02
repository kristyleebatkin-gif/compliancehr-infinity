// Shared authorization helpers for backend functions, backed by canonical roleMatrix.ts.

import {
  MANAGEMENT_ROLES,
  COMPLIANCE_REVIEW_ROLES,
  STAFF_SEND_ROLES,
  CONSENT_ROLES,
  HR_ROLES,
  hasApprovedAccess,
  hasAnyRole,
  resolveUserTenantId,
  assertTenantRecordAccess,
  scopeQueryToTenant,
  stampTenantWritePayload,
} from './roleMatrix.ts';

export {
  MANAGEMENT_ROLES,
  COMPLIANCE_REVIEW_ROLES,
  STAFF_SEND_ROLES,
  CONSENT_ROLES,
  HR_ROLES,
  hasApprovedAccess,
  hasAnyRole,
  resolveUserTenantId,
  assertTenantRecordAccess,
  scopeQueryToTenant,
  stampTenantWritePayload,
};

// Authorizes a privileged automation function: only an authenticated user
// with account_status === 'Active', access_approved === true, and one of the
// allowed roles may call it.
export async function authorizeSystemCall(base44: any, _body?: any, roles: string[] = MANAGEMENT_ROLES): Promise<boolean> {
  try {
    const user = await base44.auth.me();
    return hasAnyRole(user, roles);
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
    base44.asServiceRole.entities.KeyBusinessContact.filter({ archived: { $ne: true } }, { limit: 1000, fields: ['email'] }),
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