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
import { createClientFromRequest as sdkClientFromRequest } from 'npm:@base44/sdk@0.8.54';
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

// ---------------------------------------------------------------------------------------------
// Function wrapper (release 2). Usage in a backend function:
//
//   import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';
//   export default perBusiness(async function (req) {
//     const base44 = createScopedClientFromRequest(req);   // instead of createClientFromRequest
//     ...unchanged function body...
//   });
//
// perBusiness decides the business on the server, never from the browser:
//   - staff (any role but admin): their own business only; asking for another is refused
//   - owner (admin) with body.tenant_id: that business (automations pass the record's tag)
//   - owner without body.tenant_id (scheduled jobs, owner tools): every active business in turn
// With one business the function's own response is returned unchanged. With several, the
// responses are combined as { per_business: [...] }.
// ---------------------------------------------------------------------------------------------
export const SCOPE_HEADER = 'x-chr-business-scope';

// A client whose entities (user and service role) are limited to one business.
export function scopedClient(base44: any, tenantId: string) {
  let service: any = null;
  let own: any = null;
  return new Proxy(base44, {
    get(target, prop, receiver) {
      if (prop === 'entities') return (own ||= scopedEntities(target.entities, tenantId));
      if (prop === 'asServiceRole') {
        if (!service) {
          const raw = target.asServiceRole;
          const scopedEnts = scopedEntities(raw.entities, tenantId);
          service = new Proxy(raw, {
            get(t, p, r) {
              if (p === 'entities') return scopedEnts;
              const v = Reflect.get(t, p, r);
              return typeof v === 'function' ? v.bind(t) : v;
            },
          });
        }
        return service;
      }
      if (prop === 'businessId') return tenantId;
      const v = Reflect.get(target, prop, receiver);
      return typeof v === 'function' ? v.bind(target) : v;
    },
  });
}

type ClientFactory = (req: Request) => any;

export function createScopedClientFromRequest(req: Request, factory: ClientFactory = sdkClientFromRequest) {
  const tenantId = req.headers.get(SCOPE_HEADER);
  if (!tenantId) throw new Error('Business scope missing: this function must be wrapped with perBusiness().');
  return scopedClient(factory(req), tenantId);
}

const json = (body: any, status: number) => Response.json(body, { status });

export function perBusiness(
  handler: (req: Request) => Promise<Response | undefined>,
  factory: ClientFactory = sdkClientFromRequest,
) {
  return async function (req: Request): Promise<Response> {
    const hasBody = !['GET', 'HEAD'].includes(req.method);
    const text = hasBody ? await req.text().catch(() => '') : '';
    let body: any = {};
    try { body = text ? JSON.parse(text) : {}; } catch { body = {}; }

    const base = factory(new Request(req.url, { method: req.method, headers: req.headers, body: hasBody ? text : undefined }));
    let user: any = null;
    try { user = await base.auth.me(); } catch { user = null; }
    if (!user) return json({ error: 'Unauthorized' }, 401);

    const own = user.tenant_id || user.data?.tenant_id || null;
    const requested = typeof body?.tenant_id === 'string' && body.tenant_id ? body.tenant_id : null;
    let targets: string[];
    if (user.role !== 'admin') {
      if (!own) return json({ error: 'This account is not linked to a business.' }, 403);
      if (requested && requested !== own) return json({ error: 'Cross-business access denied.' }, 403);
      targets = [own];
    } else {
      const active = await activeTenantIds(base);
      if (requested) {
        if (!active.includes(requested)) return json({ error: 'Unknown or inactive business.' }, 404);
        targets = [requested];
      } else {
        targets = active.length ? active : own ? [own] : [];
      }
    }
    if (!targets.length) return json({ error: 'No business to act for.' }, 403);

    const runFor = async (tenantId: string): Promise<Response> => {
      const headers = new Headers(req.headers);
      headers.set(SCOPE_HEADER, tenantId); // always set here, so a browser-sent value is overwritten
      const res = await handler(new Request(req.url, { method: req.method, headers, body: hasBody ? text : undefined }));
      return res instanceof Response ? res : json({ error: 'The function finished without a response.' }, 500);
    };

    if (targets.length === 1) return runFor(targets[0]);

    const per_business: any[] = [];
    let worst = 200;
    for (const tenantId of targets) {
      try {
        const res = await runFor(tenantId);
        const raw = await res.text();
        let parsed: any = raw;
        try { parsed = JSON.parse(raw); } catch { /* keep text */ }
        per_business.push({ tenant_id: tenantId, status: res.status, body: parsed });
        if (res.status >= 500) worst = 500;
      } catch (err) {
        per_business.push({ tenant_id: tenantId, status: 500, body: { error: String((err as any)?.message || err) } });
        worst = 500;
      }
    }
    return json({ per_business }, worst);
  };
}
