import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  assertTenantRecordAccess,
  stampTenantWritePayload,
} from '../lib/roleMatrix.js';
import { canCommunityUserAccessEntity } from '../lib/communityPlatformEngine.js';

const ENTITIES_DIR = path.resolve(process.cwd(), 'base44/entities');

function loadSchema(name) {
  return JSON.parse(fs.readFileSync(path.join(ENTITIES_DIR, `${name}.jsonc`), 'utf8'));
}

function resolveTemplateValue(rawVal, user) {
  if (typeof rawVal !== 'string') return rawVal;
  if (rawVal === '{{user.id}}') return user?.id ?? null;
  if (rawVal === '{{user.email}}') return user?.email ?? null;
  if (rawVal === '{{user.role}}') return user?.role ?? null;
  const dataMatch = rawVal.match(/^\{\{user\.data\.([a-zA-Z0-9_]+)\}\}$/);
  if (dataMatch) {
    const field = dataMatch[1];
    return user?.data?.[field] ?? user?.[field] ?? null;
  }
  return rawVal;
}

function getRecordField(record, key) {
  if (key.startsWith('data.')) {
    const subKey = key.slice(5);
    return record?.data?.[subKey] ?? record?.[subKey];
  }
  return record?.[key];
}

function evaluateRlsRule(rule, user, record) {
  if (!rule || typeof rule !== 'object') return false;
  if ('$or' in rule) {
    return rule.$or.some((branch) => evaluateRlsRule(branch, user, record));
  }
  if ('$and' in rule) {
    return rule.$and.every((branch) => evaluateRlsRule(branch, user, record));
  }
  if ('user_condition' in rule) {
    return Object.entries(rule.user_condition).every(([k, v]) => user?.[k] === v);
  }
  return Object.entries(rule).every(([fieldKey, expected]) => {
    const actual = getRecordField(record, fieldKey);
    const resolvedExpected = resolveTemplateValue(expected, user);
    if (resolvedExpected === null || resolvedExpected === undefined) return false;
    return actual === resolvedExpected;
  });
}

function filterVisibleFields(schema, user, record) {
  const output = { ...record };
  for (const [fieldName, prop] of Object.entries(schema.properties || {})) {
    if (prop?.rls?.read) {
      const allowed = evaluateRlsRule(prop.rls.read, user, record);
      if (!allowed) {
        delete output[fieldName];
      }
    }
  }
  return output;
}

const tenantSchema = loadSchema('Tenant');
const membershipSchema = loadSchema('TenantMembership');
const businessSchema = loadSchema('BusinessDetails');
const notificationSchema = loadSchema('Notification');
const auditLogSchema = loadSchema('AuditLog');
const userSchema = loadSchema('User');

// Verify User.jsonc locks tenant_id (and organisation_id once approved) updates to collaborator_role: editor
assert.deepEqual(userSchema.properties.tenant_id.rls.update, {
  user_condition: { collaborator_role: 'editor' },
});
if (userSchema.properties.organisation_id) {
  assert.deepEqual(userSchema.properties.organisation_id.rls.update, {
    user_condition: { collaborator_role: 'editor' },
  });
}

const orgAAdmin = {
  id: 'usr-admin-a',
  email: 'admin@org-a.com.au',
  role: 'Provider Administrator',
  account_status: 'Active',
  access_approved: true,
  organisation_id: 'org-a',
  data: { organisation_id: 'org-a', tenant_id: 'org-a' },
};

const orgASupportWorker = {
  id: 'usr-sw-a',
  email: 'worker@org-a.com.au',
  role: 'Support Worker',
  account_status: 'Active',
  access_approved: true,
  organisation_id: 'org-a',
  data: { organisation_id: 'org-a', tenant_id: 'org-a' },
};

const orgAFinance = {
  id: 'usr-fin-a',
  email: 'finance@org-a.com.au',
  role: 'Finance & Accounts Officer',
  account_status: 'Active',
  access_approved: true,
  organisation_id: 'org-a',
  data: { organisation_id: 'org-a', tenant_id: 'org-a' },
};

const orgAAuditor = {
  id: 'usr-aud-a',
  email: 'auditor@org-a.com.au',
  role: 'Auditor',
  account_status: 'Active',
  access_approved: true,
  organisation_id: 'org-a',
  data: { organisation_id: 'org-a', tenant_id: 'org-a' },
};

const orgBRecord = {
  id: 'rec-org-b',
  organisation_id: 'org-b',
  tenant_id: 'org-b',
  business_name: 'Org B Care Pty Ltd',
};

const orgABusinessRecord = {
  id: 'rec-org-a',
  organisation_id: 'org-a',
  tenant_id: 'org-a',
  business_name: 'Org A Care Pty Ltd',
  tax_file_number: '123-456-789',
  bsb: '062-000',
  account_number: '99887766',
};

// PC-201: Support Worker in Org A can read BusinessDetails in Org A, but CANNOT update BusinessDetails
assert.equal(evaluateRlsRule(businessSchema.rls.read, orgASupportWorker, orgABusinessRecord), true);
assert.equal(evaluateRlsRule(businessSchema.rls.update, orgASupportWorker, orgABusinessRecord), false);
assert.equal(evaluateRlsRule(businessSchema.rls.update, orgAAdmin, orgABusinessRecord), true);

// PC-202: Field-level RLS strips tax_file_number, bsb, and account_number for Support Worker, keeps for Finance Officer
const swVisibleBusiness = filterVisibleFields(businessSchema, orgASupportWorker, orgABusinessRecord);
assert.equal(swVisibleBusiness.tax_file_number, undefined);
assert.equal(swVisibleBusiness.bsb, undefined);
assert.equal(swVisibleBusiness.account_number, undefined);

const financeVisibleBusiness = filterVisibleFields(businessSchema, orgAFinance, orgABusinessRecord);
assert.equal(financeVisibleBusiness.tax_file_number, '123-456-789');
assert.equal(financeVisibleBusiness.bsb, '062-000');

// PC-203: Cross-Organisation Isolation — Org A Provider Administrator cannot read/update Org B records
assert.equal(evaluateRlsRule(tenantSchema.rls.read, orgAAdmin, orgBRecord), false);
assert.equal(evaluateRlsRule(membershipSchema.rls.read, orgAAdmin, orgBRecord), false);
assert.equal(evaluateRlsRule(businessSchema.rls.read, orgAAdmin, orgBRecord), false);
assert.equal(evaluateRlsRule(auditLogSchema.rls.read, orgAAdmin, orgBRecord), false);
assert.throws(() => assertTenantRecordAccess(orgAAdmin, orgBRecord), /Cross-tenant access denied/);
assert.throws(
  () => stampTenantWritePayload({ organisation_id: 'org-b', business_name: 'Spoof' }, orgAAdmin),
  /Cross-tenant write denied/
);

// PC-204: Immutable AuditLog & Server-Only Notification creation — client roles blocked from AuditLog writes
for (const actor of [orgAAdmin, orgASupportWorker, orgAFinance, orgAAuditor]) {
  assert.equal(evaluateRlsRule(auditLogSchema.rls.create, actor, orgABusinessRecord), false);
  assert.equal(evaluateRlsRule(auditLogSchema.rls.update, actor, orgABusinessRecord), false);
  assert.equal(evaluateRlsRule(auditLogSchema.rls.delete, actor, orgABusinessRecord), false);
  assert.equal(evaluateRlsRule(notificationSchema.rls.create, actor, orgABusinessRecord), false);
}

// PC-205: Auditor Consent Gate on AuditLog within same organisation
const consentedAudit = {
  id: 'aud-1',
  organisation_id: 'org-a',
  audit_consent: 'Audit consent received',
};
const declinedAudit = {
  id: 'aud-2',
  organisation_id: 'org-a',
  audit_consent: 'Audit declined',
};
assert.equal(evaluateRlsRule(auditLogSchema.rls.read, orgAAuditor, consentedAudit), true);
assert.equal(evaluateRlsRule(auditLogSchema.rls.read, orgAAuditor, declinedAudit), false);

// PC-206: Zero-Trust Community & External Adviser isolation from Platform Core private entities
for (const coreEntity of ['Tenant', 'TenantMembership', 'BusinessDetails', 'AuditLog']) {
  assert.equal(
    canCommunityUserAccessEntity({ surface: 'community', role: 'Community Member' }, coreEntity),
    false,
    `Community Member must be blocked from ${coreEntity}`
  );
  assert.equal(
    canCommunityUserAccessEntity({ surface: 'community', role: 'External Adviser' }, coreEntity),
    false,
    `External Adviser must be blocked from ${coreEntity}`
  );
}

console.log('All Platform Core Step 2 (Permissions & Cross-Organisation Isolation) tests passed.');