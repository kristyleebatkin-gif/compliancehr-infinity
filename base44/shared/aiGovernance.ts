// Central AI Governance Gatekeeper: enforces account_status=Active, access_approved=true,
// role matrix controls, tenant isolation, and immutable AuditLog recording for every AI invocation.

import {
  ALL_ROLES,
  hasApprovedAccess,
  hasAnyRole,
  resolveUserTenantId,
  assertTenantRecordAccess,
} from './roleMatrix.ts';

export async function authorizeAndLogAiAction(
  base44: any,
  options: {
    feature: string;
    allowedRoles?: string[];
    requestedTenantId?: string | null;
    targetRecord?: any;
    recordId?: string;
    recordTitle?: string;
    summary?: string;
  }
) {
  const user = await base44.auth.me().catch(() => null);
  if (!user) {
    return {
      authorized: false,
      user: null,
      response: Response.json({ error: 'Authentication required.' }, { status: 401 }),
    };
  }

  if (!hasApprovedAccess(user)) {
    try {
      await base44.asServiceRole.entities.AuditLog.create({
        action: `AI Blocked (${options.feature})`,
        entity_type: 'AIGovernance',
        record_id: String(options.recordId || options.feature).slice(0, 120),
        record_title: String(options.recordTitle || options.feature).slice(0, 200),
        performed_by: user.full_name || user.email || user.id,
        performed_by_user_id: user.id,
        performed_by_email: user.email || '',
        performed_by_role: user.role || 'Unapproved',
        details: `Blocked AI invocation for non-active or unapproved account (status=${user.account_status || 'none'}, approved=${Boolean(user.access_approved)}).`,
        timestamp: new Date().toISOString(),
      });
    } catch {
      // Do not fail denial response if audit write fails
    }
    return {
      authorized: false,
      user,
      response: Response.json(
        { error: 'Active, approved account access is required to use AI tools.' },
        { status: 403 }
      ),
    };
  }

  const allowedRoles = options.allowedRoles || ALL_ROLES;
  if (!hasAnyRole(user, allowedRoles)) {
    try {
      await base44.asServiceRole.entities.AuditLog.create({
        action: `AI Role Denied (${options.feature})`,
        entity_type: 'AIGovernance',
        record_id: String(options.recordId || options.feature).slice(0, 120),
        record_title: String(options.recordTitle || options.feature).slice(0, 200),
        performed_by: user.full_name || user.email || user.id,
        performed_by_user_id: user.id,
        performed_by_email: user.email || '',
        performed_by_role: user.role || '',
        details: `Role "${user.role}" is not permitted to invoke ${options.feature}.`,
        timestamp: new Date().toISOString(),
      });
    } catch {
      // Do not fail denial response
    }
    return {
      authorized: false,
      user,
      response: Response.json(
        { error: `Role "${user.role}" is not authorised for ${options.feature}.` },
        { status: 403 }
      ),
    };
  }

  let tenantId: string | null = null;
  try {
    tenantId = resolveUserTenantId(user);
    if (options.requestedTenantId && tenantId && options.requestedTenantId !== tenantId) {
      throw new Error('Cross-tenant AI access denied.');
    }
    if (options.targetRecord) {
      assertTenantRecordAccess(user, options.targetRecord, tenantId);
    }
  } catch (tenantError: any) {
    return {
      authorized: false,
      user,
      response: Response.json(
        { error: tenantError?.message || 'Cross-tenant AI access denied.' },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    user,
    tenantId,
    logSuccess: async (detailsText: string) => {
      await base44.asServiceRole.entities.AuditLog.create({
        action: `AI Invoked (${options.feature})`,
        entity_type: 'AIGovernance',
        record_id: String(options.recordId || options.feature).slice(0, 120),
        record_title: String(options.recordTitle || options.feature).slice(0, 200),
        performed_by: user.full_name || user.email || user.id,
        performed_by_user_id: user.id,
        performed_by_email: user.email || '',
        performed_by_role: user.role || '',
        details: String(detailsText || options.summary || options.feature).slice(0, 2000),
        timestamp: new Date().toISOString(),
      });
    },
  };
}