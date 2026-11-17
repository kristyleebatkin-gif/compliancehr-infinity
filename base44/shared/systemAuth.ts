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
  SYSTEM_GLOBAL_ENTITIES,
  createTenantScopedEntitiesProxy,
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
  SYSTEM_GLOBAL_ENTITIES,
  createTenantScopedEntitiesProxy,
};

export function getTenantScopedEntities(base44: any, user: any, explicitTenantId: string | null = null) {
  const tenantId = explicitTenantId || user?.tenant_id || user?.data?.tenant_id || null;
  const rawEntities = base44?.asServiceRole?.entities || base44?.entities;
  return createTenantScopedEntitiesProxy(rawEntities, () => ({ user, tenantId }));
}

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
export async function appContactEmails(base44: any, user?: any): Promise<Set<string>> {
  // Resolve from an authenticated caller before privileged contact lookups. The enclosing
  // perBusiness wrapper remains the membership boundary; this helper also fails closed alone.
  const tenantId = resolveUserTenantId(user);
  if (!user?.id || !tenantId) throw new Error('An approved business identity is required.');
  const emails = new Set<string>();
  const baseQuery = scopeQueryToTenant({}, tenantId);
  const results = await Promise.allSettled([
    base44.asServiceRole.entities.User.filter(baseQuery),
    base44.asServiceRole.entities.StaffProfile.filter(baseQuery, { limit: 1000, fields: ['email', 'tenant_id'] }),
    base44.asServiceRole.entities.ParticipantProfile.filter(baseQuery, { limit: 1000, fields: ['email', 'tenant_id'] }),
    base44.asServiceRole.entities.Contact.filter(baseQuery, { limit: 1000, fields: ['email', 'tenant_id'] }),
    base44.asServiceRole.entities.KeyBusinessContact.filter(scopeQueryToTenant({ archived: { $ne: true } }, tenantId), { limit: 1000, fields: ['email', 'tenant_id'] }),
  ]);
  for (const result of results) {
    if (result.status !== 'fulfilled') continue;
    const records = Array.isArray(result.value) ? result.value : result.value?.items;
    if (!Array.isArray(records)) continue;
    for (const record of records) {
      const recordTenant = record?.tenant_id || record?.data?.tenant_id;
      if (recordTenant === tenantId && typeof record?.email === 'string') {
        emails.add(record.email.trim().toLowerCase());
      }
    }
  }
  return emails;
}
