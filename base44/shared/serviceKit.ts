/**
 * Small server helpers shared by the capability-track services (C8, C9, …).
 *
 * These are the parts that were identical in every service: a typed refusal, a bounded page read,
 * and a record lookup that can only ever return a record from the acting business. Extracted here
 * so the behaviour of tenant scoping and error statuses is written once.
 */

export class Refusal extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export const refuse = (message: string, status = 400): never => { throw new Refusal(message, status); };

/** One bounded page. Returns an array whatever the SDK returns, so callers never map a page object. */
export async function pageOf(dao: any, query: any, sort = '-created_date', limit = 200): Promise<any[]> {
  const page = await dao.filter(query, { sort, limit });
  const rows = Array.isArray(page) ? page : page?.items;
  return Array.isArray(rows) ? rows : [];
}

/** A record by id, only when it belongs to the acting business. A 404 reads as "not found". */
export async function getOwn(dao: any, id: string, tenantId: string) {
  const key = typeof id === 'string' ? id.trim() : '';
  if (!key) return null;
  const record = await dao.get(key).catch((e: any) => (e?.status === 404 ? null : Promise.reject(e)));
  return record && record.tenant_id === tenantId ? record : null;
}

export async function requireOwn(dao: any, id: string, tenantId: string, label: string) {
  const record = await getOwn(dao, id, tenantId);
  if (!record) refuse(`That ${label} is not in your business.`, 404);
  return record;
}