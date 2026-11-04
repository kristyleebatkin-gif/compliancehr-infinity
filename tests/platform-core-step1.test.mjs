import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ENTITIES_DIR = path.resolve(process.cwd(), 'base44/entities');

function loadSchema(name) {
  const filePath = path.join(ENTITIES_DIR, `${name}.jsonc`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function applySchemaDefaultsAndValidate(schema, input) {
  const record = { ...input };
  for (const [key, prop] of Object.entries(schema.properties || {})) {
    if (record[key] === undefined && prop.default !== undefined) {
      record[key] = prop.default;
    }
  }
  for (const reqField of schema.required || []) {
    if (record[reqField] === undefined || record[reqField] === null || record[reqField] === '') {
      throw new Error(`Missing required field "${reqField}" on ${schema.name}`);
    }
  }
  return record;
}

const tenantSchema = loadSchema('Tenant');
const membershipSchema = loadSchema('TenantMembership');
const businessSchema = loadSchema('BusinessDetails');
const notificationSchema = loadSchema('Notification');
const auditLogSchema = loadSchema('AuditLog');

// Verify all 5 Platform Core schemas include organisation_id and valid enumColors
for (const schema of [tenantSchema, membershipSchema, businessSchema, notificationSchema, auditLogSchema]) {
  assert.equal(schema.properties.organisation_id?.type, 'string', `${schema.name} must define organisation_id: string`);
  for (const [propName, prop] of Object.entries(schema.properties)) {
    if (Array.isArray(prop.enum) && Array.isArray(prop.enumColors)) {
      assert.equal(
        prop.enum.length,
        prop.enumColors.length,
        `${schema.name}.${propName} enumColors length must match enum length`
      );
    }
  }
}

// PC-101: Create Tenant with defaults
const createdTenant = applySchemaDefaultsAndValidate(tenantSchema, {
  organisation_id: 'org-alpha',
  tenant_key: 'org-alpha',
  legal_name: 'Alpha Care Pty Ltd',
});
assert.equal(createdTenant.status, 'Provisioning');
assert.equal(createdTenant.timezone, 'Australia/Brisbane');
assert.equal(createdTenant.default_locale, 'en-AU');
assert.equal(createdTenant.subscription_tier, 'Enterprise');

// PC-102: Reject TenantMembership missing required user_id or organisation_id
assert.throws(
  () =>
    applySchemaDefaultsAndValidate(membershipSchema, {
      organisation_id: 'org-alpha',
      tenant_id: 'org-alpha',
      membership_role: 'Support Worker',
    }),
  /Missing required field "user_id" on TenantMembership/
);

const validMembership = applySchemaDefaultsAndValidate(membershipSchema, {
  organisation_id: 'org-alpha',
  tenant_id: 'org-alpha',
  user_id: 'usr-101',
});
assert.equal(validMembership.status, 'Invited');
assert.equal(validMembership.mfa_enforced, true);

// PC-103: Notification default read state & severity
const createdNotification = applySchemaDefaultsAndValidate(notificationSchema, {
  organisation_id: 'org-alpha',
  message: 'Worker screening check due in 14 days',
});
assert.equal(createdNotification.type, 'General');
assert.equal(createdNotification.severity, 'Info');
assert.equal(createdNotification.read, false);

// PC-104: BusinessDetails & AuditLog defaults
const createdBusiness = applySchemaDefaultsAndValidate(businessSchema, {
  organisation_id: 'org-alpha',
  business_name: 'Alpha Care Services',
});
assert.equal(createdBusiness.payment_terms_days, 14);
assert.equal(createdBusiness.quote_validity_days, 30);

const createdAudit = applySchemaDefaultsAndValidate(auditLogSchema, {
  organisation_id: 'org-alpha',
  action: 'TENANT_PROVISIONED',
  entity_type: 'Tenant',
});
assert.equal(createdAudit.audit_consent, 'Audit declined');

console.log('All Platform Core Step 1 (Data Layer) schema & default tests passed.');