// Release 1 of the data-separation work (audit CRIT-01).
// Owner-only. Creates the Choices North Queensland business record, links existing user
// accounts to it, and stamps the business tag (tenant_id) on every existing record that has none.
//
// Body:
//   { "mode": "dryRun" }                         -> counts only, changes nothing (default)
//   { "mode": "apply" }                          -> makes the changes
//   { "mode": "apply", "entities": ["TodoTask"], "limitPerEntity": 1 }
//                                                -> probe: tag one record to confirm no automation fires
//
// Safe to run more than once: records that already carry a tenant_id are never changed.
// Only the tenant_id field is written, so the change is reversible (clear tenant_id on the listed ids).
// Automations that run on update ignore a change to tenant_id alone (guard added to their conditions).
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { hasApprovedAccess } from '../../shared/roleMatrix.ts';
import {
  BUSINESS_OWNED_ENTITIES,
  SHARED_WITH_COPIES_ENTITIES,
  SHARED_MASTER_TENANT_ID,
} from '../../shared/tenantClassification.ts';

// Matches the tenant_id already on every existing user account.
const CHOICES_NQ_TENANT_ID = 'tenant_compliancehr_default';
const CHOICES_NQ = {
  tenant_key: CHOICES_NQ_TENANT_ID,
  organisation_id: CHOICES_NQ_TENANT_ID,
  legal_name: 'Kristy Lee Dalton',
  trading_name: 'Choices North Queensland',
  abn: '11769681650',
  ndis_provider_number: '4-LPHJR5O',
  status: 'Active',
  timezone: 'Australia/Brisbane',
  default_locale: 'en-AU',
  provisioning_notes: 'Created by tenantMigration (audit CRIT-01). Head office: Unit 5, 14 Keane Street, Currajong QLD 4812.',
};
const MEMBERSHIP_ROLES = new Set([
  'admin', 'Provider Administrator', 'Compliance Manager', 'Human Resources Manager',
  'Quality & Improvement Manager', 'Finance & Accounts Officer', 'Rostering Coordinator',
  'Team Leader', 'Intake Officer', 'CRM & Marketing Officer', 'Administration',
  'Support Worker', 'Employee', 'Volunteer', 'Participant', 'Auditor',
]);

async function allRecords(dao) {
  const out = [];
  let cursor = null;
  const seen = new Set();
  do {
    const page = await dao.filter({}, { limit: 200, ...(cursor ? { cursor } : {}) });
    const items = Array.isArray(page) ? page : page?.items || [];
    out.push(...items);
    cursor = !Array.isArray(page) && page?.has_more ? page.next_cursor : null;
    if (cursor && seen.has(cursor)) throw new Error('Pagination did not advance.');
    if (cursor) seen.add(cursor);
  } while (cursor);
  return out;
}

export default async function reqHandler(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin' || !hasApprovedAccess(user)) {
      return Response.json({ error: 'Forbidden: owner (admin) only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const apply = body?.mode === 'apply';
    const only = Array.isArray(body?.entities) && body.entities.length ? new Set(body.entities) : null;
    const limitPerEntity = Number.isInteger(body?.limitPerEntity) && body.limitPerEntity > 0 ? body.limitPerEntity : null;
    const svc = base44.asServiceRole.entities;
    const report = { mode: apply ? 'apply' : 'dryRun', tenant: null, memberships: [], entities: [], errors: [] };

    // 1. Business record
    const existingTenants = await allRecords(svc.Tenant);
    let tenant = existingTenants.find((t) => t.tenant_key === CHOICES_NQ_TENANT_ID);
    if (!tenant) {
      report.tenant = { action: apply ? 'created' : 'would create', ...CHOICES_NQ };
      if (apply && !only) tenant = await svc.Tenant.create(CHOICES_NQ);
    } else {
      report.tenant = { action: 'exists', id: tenant.id, trading_name: tenant.trading_name };
    }

    // 2. Memberships for users already on this business
    if (!only) {
      const users = await allRecords(svc.User);
      const memberships = await allRecords(svc.TenantMembership);
      for (const u of users.filter((x) => (x.tenant_id || x.data?.tenant_id) === CHOICES_NQ_TENANT_ID)) {
        if (memberships.some((m) => m.user_id === u.id && m.tenant_id === CHOICES_NQ_TENANT_ID)) {
          report.memberships.push({ user_id: u.id, action: 'exists' });
          continue;
        }
        const role = MEMBERSHIP_ROLES.has(u.role) ? u.role : 'Employee';
        report.memberships.push({ user_id: u.id, email: u.email, role, action: apply ? 'created' : 'would create' });
        if (apply) {
          await svc.TenantMembership.create({
            organisation_id: CHOICES_NQ_TENANT_ID,
            tenant_id: CHOICES_NQ_TENANT_ID,
            user_id: u.id,
            user_email: u.email || '',
            membership_role: role,
            status: 'Active',
            starts_on: new Date().toISOString().slice(0, 10),
            invited_by_user_id: user.id,
            notes: 'Created by tenantMigration (audit CRIT-01).',
          });
        }
      }
    }

    // 3. Stamp untagged records
    const targets = [
      ...BUSINESS_OWNED_ENTITIES.map((name) => ({ name, value: CHOICES_NQ_TENANT_ID })),
      ...SHARED_WITH_COPIES_ENTITIES.map((name) => ({ name, value: SHARED_MASTER_TENANT_ID })),
    ].filter((t) => !only || only.has(t.name));

    for (const { name, value } of targets) {
      const dao = svc[name];
      if (!dao) { report.errors.push({ entity: name, error: 'Entity not available' }); continue; }
      try {
        const records = await allRecords(dao);
        let untagged = records.filter((r) => !(r.tenant_id || r.data?.tenant_id));
        const otherTenants = [...new Set(records.map((r) => r.tenant_id || r.data?.tenant_id).filter((t) => t && t !== value))];
        if (limitPerEntity) untagged = untagged.slice(0, limitPerEntity);
        const taggedIds = [];
        if (apply) {
          for (const r of untagged) {
            await dao.update(r.id, { tenant_id: value });
            taggedIds.push(r.id);
          }
        }
        report.entities.push({
          entity: name, total: records.length, untagged: untagged.length,
          tagged_now: taggedIds.length, tag_value: value, other_tenant_values: otherTenants, tagged_ids: taggedIds,
        });
      } catch (err) {
        report.errors.push({ entity: name, error: String(err?.message || err) });
      }
    }

    const totals = report.entities.reduce((a, e) => ({ total: a.total + e.total, untagged: a.untagged + e.untagged, tagged: a.tagged + e.tagged_now }), { total: 0, untagged: 0, tagged: 0 });
    report.totals = totals;

    if (apply) {
      await svc.AuditLog.create({
        organisation_id: CHOICES_NQ_TENANT_ID,
        tenant_id: CHOICES_NQ_TENANT_ID,
        action: 'Business data tagging (tenantMigration)',
        entity_type: 'Tenant',
        record_id: tenant?.id || '',
        record_title: 'Choices North Queensland',
        performed_by: user.full_name || user.email,
        performed_by_user_id: user.id,
        performed_by_email: user.email,
        performed_by_role: user.role,
        details: JSON.stringify({ totals, errors: report.errors, probe: Boolean(only || limitPerEntity) }).slice(0, 4000),
        timestamp: new Date().toISOString(),
      });
    }

    return Response.json(report);
  } catch (err) {
    return Response.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
