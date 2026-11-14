// Release 2 (audit CRIT-01/02/03): one business at a time for server code.
//
// scopedEntities(entities, tenantId) wraps an SDK entities client (user or service role) so that:
//   - list / filter / count only see that business's records
//     (shared-with-copies types also see the "shared" master copies)
//   - create / bulkCreate / upsert stamp the business on new records
//   - get returns null for another business's record
//   - update / bulkUpdate / delete refuse another business's record and never move a record
//     to another business (tenant_id is stripped from changes)
//   - updateMany only reaches this business's records
// Shared library and platform types (except User) pass through unchanged.
//
// forEachTenant(base44, fn) runs a scheduled job once per active business with a scoped client,
// so reminders, alerts and logs never mix businesses.
//
// The wrapper always applies, independent of TENANT_ENFORCEMENT_ON: every live record is tagged
// (14 Nov 2026), so scoping is correct today and stays correct when a second business is added.
import {
  BUSINESS_OWNED_ENTITIES,
  SHARED_WITH_COPIES_ENTITIES,
  SHARED_MASTER_TENANT_ID,
} from './tenantClassification.ts';

const BUSINESS = new Set<string>(BUSINESS_OWNED_ENTITIES);
const COPIES = new Set<string>(SHARED_WITH_COPIES_ENTITIES);

// User accounts carry tenant_id too; scoping them keeps "notify all admins" inside one business.
const SCOPED_PLATFORM = new Set<string>(['User']);

export function scopeKind(name: string): 'business' | 'copies' | 'user' | 'none' {
  if (BUSINESS.has(name)) return 'business';
  if (COPIES.has(name)) return 'copies';
  if (SCOPED_PLATFORM.has(name)) return 'user';
  return 'none';
}

const tenantOf = (r: any) => r?.tenant_id ?? r?.data?.tenant_id ?? null;

export function scopeFilter(name: string, query: any, tenantId: string) {
  const kind = scopeKind(name);
  const q = { ...(query && typeof query === 'object' ? query : {}) };
  if (kind === 'business' || kind === 'user') return { ...q, tenant_id: tenantId };
  if (kind === 'copies') return { ...q, tenant_id: { $in: [tenantId, SHARED_MASTER_TENANT_ID] } };
  return q;
}

export function canSee(name: string, record: any, tenantId: string) {
  const kind = scopeKind(name);
  if (kind === 'none' || !record) return true;
  const t = tenantOf(record);
  if (kind === 'copies') return t === tenantId || t === SHARED_MASTER_TENANT_ID;
  return t === tenantId;
}

// Writes: a shared master copy can be read by every business but changed by none of them.
export function canWrite(name: string, record: any, tenantId: string) {
  const kind = scopeKind(name);
  if (kind === 'none' || !record) return true;
  return tenantOf(record) === tenantId;
}

function stamp(name: string, data: any, tenantId: string) {
  const kind = scopeKind(name);
  if (kind === 'none' || kind === 'user') return data;
  return { ...(data || {}), tenant_id: tenantId };
}

function stripTenant(name: string, changes: any) {
  if (scopeKind(name) === 'none' || !changes || typeof changes !== 'object') return changes;
  const { tenant_id: _ignored, ...rest } = changes;
  return rest;
}

export class CrossBusinessError extends Error {
  status = 403;
  constructor(entity: string) { super(`Cross-business access denied (${entity}).`); }
}

function scopedDao(name: string, dao: any, tenantId: string) {
  if (scopeKind(name) === 'none') return dao;
  const fetchOwn = async (id: string, forWrite: boolean) => {
    const rec = await dao.get(id);
    if (!rec) return null;
    const ok = forWrite ? canWrite(name, rec, tenantId) : canSee(name, rec, tenantId);
    if (!ok) throw new CrossBusinessError(name);
    return rec;
  };
  return new Proxy(dao, {
    get(target, prop, receiver) {
      switch (prop) {
        case 'filter':
          return (query: any, ...rest: any[]) => target.filter(scopeFilter(name, query, tenantId), ...rest);
        case 'list':
          return (...args: any[]) => target.filter(scopeFilter(name, {}, tenantId), ...args);
        case 'count':
          return (query: any, ...rest: any[]) => target.count(scopeFilter(name, query, tenantId), ...rest);
        case 'get':
          return async (id: string) => {
            const rec = await target.get(id);
            return rec && canSee(name, rec, tenantId) ? rec : null;
          };
        case 'create':
          return (data: any, ...rest: any[]) => target.create(stamp(name, data, tenantId), ...rest);
        case 'bulkCreate':
          return (rows: any[], ...rest: any[]) =>
            target.bulkCreate((rows || []).map((r) => stamp(name, r, tenantId)), ...rest);
        case 'upsert':
          return (rows: any, ...rest: any[]) =>
            target.upsert(Array.isArray(rows) ? rows.map((r) => stamp(name, r, tenantId)) : stamp(name, rows, tenantId), ...rest);
        case 'update':
          return async (id: string, changes: any, ...rest: any[]) => {
            await fetchOwn(id, true);
            return target.update(id, stripTenant(name, changes), ...rest);
          };
        case 'bulkUpdate':
          return async (rows: any[], ...rest: any[]) => {
            for (const r of rows || []) await fetchOwn(r.id, true);
            return target.bulkUpdate((rows || []).map((r) => stripTenant(name, r)), ...rest);
          };
        case 'updateMany':
          return (query: any, changes: any, ...rest: any[]) => {
            const ownOnly = scopeKind(name) === 'copies' ? { ...(query || {}), tenant_id: tenantId } : scopeFilter(name, query, tenantId);
            const safe = changes && typeof changes === 'object'
              ? Object.fromEntries(Object.entries(changes).map(([op, v]) => [op, stripTenant(name, v)]))
              : changes;
            return target.updateMany(ownOnly, safe, ...rest);
          };
        case 'delete':
          return async (id: string, ...rest: any[]) => {
            await fetchOwn(id, true);
            return target.delete(id, ...rest);
          };
        default: {
          const v = Reflect.get(target, prop, receiver);
          return typeof v === 'function' ? v.bind(target) : v;
        }
      }
    },
  });
}

export function scopedEntities(entities: any, tenantId: string) {
  if (!tenantId) throw new Error('scopedEntities needs a business (tenantId).');
  const cache = new Map<string, any>();
  return new Proxy(entities, {
    get(target, prop, receiver) {
      if (typeof prop !== 'string') return Reflect.get(target, prop, receiver);
      if (!cache.has(prop)) {
        const dao = Reflect.get(target, prop, receiver);
        cache.set(prop, dao && typeof dao === 'object' ? scopedDao(prop, dao, tenantId) : dao);
      }
      return cache.get(prop);
    },
  });
}

// Active businesses, read with the service role.
export async function activeTenantIds(base44: any): Promise<string[]> {
  const page: any = await base44.asServiceRole.entities.Tenant.filter({ status: 'Active' }, { limit: 500 });
  const items = Array.isArray(page) ? page : page?.items || [];
  return [...new Set<string>(items.map((t: any) => t.tenant_key).filter(Boolean))];
}

// Runs fn once per active business with a service-role client scoped to it.
// One business failing does not stop the others; results and errors are returned per business.
export async function forEachTenant<T>(
  base44: any,
  fn: (tenantId: string, entities: any) => Promise<T>,
): Promise<{ tenantId: string; result?: T; error?: string }[]> {
  const out: { tenantId: string; result?: T; error?: string }[] = [];
  for (const tenantId of await activeTenantIds(base44)) {
    try {
      out.push({ tenantId, result: await fn(tenantId, scopedEntities(base44.asServiceRole.entities, tenantId)) });
    } catch (err) {
      out.push({ tenantId, error: String((err as any)?.message || err) });
    }
  }
  return out;
}

// For automations started by a record change: the business is the record's own tag.
export function tenantOfTrigger(payload: any): string | null {
  return tenantOf(payload?.data) || tenantOf(payload?.old_data) || payload?.tenant_id || null;
}
