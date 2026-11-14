// One server-derived business (tenant) context for backend functions (audit CRIT-01/02/03/04).
// The business always comes from the signed-in account on the server, never from the browser.
//
// TENANT_ENFORCEMENT_ON stays false for release 1 (fields + tagging). While false:
//   - new records are still stamped with the caller's business (stampTenant)
//   - queries are NOT narrowed, so records not yet tagged stay visible
//   - membership is not required (memberships are created by tenantMigration)
// Release 2 sets it to true AFTER tenantMigration has tagged every live record, together with
// `node scripts/tenant-rls.mjs --apply` and the same switch in src/lib/tenantEnforcement.js.
import { hasApprovedAccess } from './roleMatrix.ts';
import { TENANT_ENFORCEMENT_ON } from './tenantEnforcement.ts';

export { TENANT_ENFORCEMENT_ON };

export type TenantContext = {
  ok: true;
  user: any;
  tenantId: string;
  isOwner: boolean;
} | { ok: false; status: number; error: string };

const userTenantOf = (user: any) => user?.tenant_id || user?.data?.tenant_id || null;

// requestedTenantId: only the platform owner (admin) may act for another business.
export async function resolveTenantContext(base44: any, requestedTenantId: string | null = null): Promise<TenantContext> {
  let user: any = null;
  try { user = await base44.auth.me(); } catch { user = null; }
  if (!user) return { ok: false, status: 401, error: 'Unauthorized' };
  if (!hasApprovedAccess(user)) return { ok: false, status: 403, error: 'Account is not active and approved.' };

  const isOwner = user.role === 'admin';
  const own = userTenantOf(user);

  if (isOwner) {
    const tenantId = requestedTenantId || own;
    if (!tenantId) return { ok: false, status: 403, error: 'No business selected.' };
    if (requestedTenantId && requestedTenantId !== own && TENANT_ENFORCEMENT_ON) {
      const found: any = await base44.asServiceRole.entities.Tenant.filter({ tenant_key: requestedTenantId }, { limit: 1 });
      const items = Array.isArray(found) ? found : found?.items || [];
      if (!items.length) return { ok: false, status: 404, error: 'Unknown business.' };
    }
    return { ok: true, user, tenantId, isOwner };
  }

  if (!own) return { ok: false, status: 403, error: 'This account is not linked to a business.' };
  if (requestedTenantId && requestedTenantId !== own) {
    return { ok: false, status: 403, error: 'Cross-business access denied.' };
  }
  if (TENANT_ENFORCEMENT_ON) {
    const found: any = await base44.asServiceRole.entities.TenantMembership.filter(
      { user_id: user.id, tenant_id: own, status: 'Active' }, { limit: 1 },
    );
    const items = Array.isArray(found) ? found : found?.items || [];
    if (!items.length) return { ok: false, status: 403, error: 'No active membership for this business.' };
  }
  return { ok: true, user, tenantId: own, isOwner };
}

// Narrows a query to the caller's business once enforcement is on.
export function scopeQuery(query: any, tenantId: string) {
  if (!TENANT_ENFORCEMENT_ON) return { ...(query || {}) };
  return { ...(query || {}), tenant_id: tenantId };
}

// Always stamps the business on new records, so records made from release 1 on are tagged.
export function stampTenant(payload: any, tenantId: string | null) {
  if (!tenantId) return { ...(payload || {}) };
  return { ...(payload || {}), tenant_id: tenantId };
}

export function denied(ctx: { status: number; error: string }) {
  return Response.json({ error: ctx.error }, { status: ctx.status });
}
