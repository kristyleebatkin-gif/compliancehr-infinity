// Release 2 of the data-separation work (audit CRIT-01).
// Adds a server-enforced business lock to each entity's access rules (RLS).
//
//   node scripts/tenant-rls.mjs            -> dry run: prints what would change
//   node scripts/tenant-rls.mjs --apply    -> rewrites base44/entities/*.jsonc
//
// DO NOT run with --apply until the tenantMigration function has tagged every existing
// record in the live database. Untagged records become invisible once these rules are on.
//
// Rules added (combined with AND to the existing role rules, which are kept unchanged):
//   business-owned:     owner (admin) OR record.tenant_id == user's tenant_id
//   shared with copies: read  -> owner OR own business OR master ("shared")
//                       write -> owner OR own business (masters are owner-only)
//   shared library:     read unchanged; create/update/delete -> owner only
//   platform:           unchanged
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BUSINESS_OWNED_ENTITIES,
  SHARED_WITH_COPIES_ENTITIES,
  SHARED_LIBRARY_ENTITIES,
  SHARED_MASTER_TENANT_ID,
} from '../src/lib/tenantClassification.js';

export const TENANT_RLS_MARKER = '__tenant_lock_v1__';
const OPS = ['read', 'create', 'update', 'delete'];
const OWNER = { user_condition: { role: 'admin' } };
const OWN_BUSINESS = { 'data.tenant_id': '{{user.data.tenant_id}}' };
const MASTER = { 'data.tenant_id': SHARED_MASTER_TENANT_ID };

function lockFor(group, op) {
  if (group === 'business') return { $or: [OWNER, OWN_BUSINESS] };
  if (group === 'shared_with_copies') {
    return op === 'read' ? { $or: [OWNER, OWN_BUSINESS, MASTER] } : { $or: [OWNER, OWN_BUSINESS] };
  }
  if (group === 'shared_library') return op === 'read' ? null : OWNER;
  return null;
}

export function groupOf(name) {
  if (BUSINESS_OWNED_ENTITIES.includes(name)) return 'business';
  if (SHARED_WITH_COPIES_ENTITIES.includes(name)) return 'shared_with_copies';
  if (SHARED_LIBRARY_ENTITIES.includes(name)) return 'shared_library';
  return 'platform';
}

export function isLocked(rule) {
  return Boolean(rule && Array.isArray(rule.$and) && rule.$and.some((r) => r && r[TENANT_RLS_MARKER] === undefined && r.$comment === TENANT_RLS_MARKER));
}

// Returns a new schema with the business lock added. Idempotent: already-locked ops are left alone.
export function withTenantRls(schema) {
  const group = groupOf(schema.name);
  const rls = { ...(schema.rls || {}) };
  for (const op of OPS) {
    const lock = lockFor(group, op);
    if (!lock) continue;
    const existing = rls[op];
    if (isLocked(existing)) continue;
    const tagged = { ...lock, $comment: TENANT_RLS_MARKER };
    rls[op] = existing ? { $and: [existing, tagged] } : { $and: [tagged] };
  }
  return { ...schema, rls };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const apply = process.argv.includes('--apply');
  const dir = path.resolve('base44/entities');
  let changed = 0;
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.jsonc'))) {
    const full = path.join(dir, file);
    const schema = JSON.parse(fs.readFileSync(full, 'utf8'));
    const next = withTenantRls(schema);
    if (JSON.stringify(next.rls) === JSON.stringify(schema.rls)) continue;
    changed += 1;
    if (apply) fs.writeFileSync(full, JSON.stringify(next, null, 2) + '\n');
    else console.log(`would lock ${schema.name} (${groupOf(schema.name)})`);
  }
  console.log(`${apply ? 'Locked' : 'Would lock'} ${changed} entities.`);
}
