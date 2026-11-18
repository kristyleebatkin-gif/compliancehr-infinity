// C10 tenant isolation, checked against the stored entity schemas themselves.
//
// The strategy service only ever writes through a business-scoped client, but the rules are the
// second layer: if these are ever loosened, one business could read another's strategy. This test
// reads the shipped schemas so a regression fails the normal test run.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { tenantGroupOf } from '../src/lib/tenantClassification.js';

const ENTITIES = [
  'EnterprisePortfolio',
  'TransformationProgram',
  'StrategyObjective',
  'StrategyBenefit',
  'EnterpriseCapability',
  'CapabilityMaturityAssessment',
  'TransformationRoadmap',
  'StrategyAuditRecord',
];

const LOCK = { $or: [{ user_condition: { role: 'admin' } }, { 'data.tenant_id': '{{user.data.tenant_id}}' }] };
const ALLOWED_ROLES = ['admin', 'Provider Administrator', 'Compliance Manager', 'Compliance Administrator', 'Management', 'Administration', 'Quality & Improvement Manager', 'Auditor'];

const schemaOf = (name) => JSON.parse(fs.readFileSync(path.join('base44', 'entities', `${name}.jsonc`), 'utf8'));

test('every C10 register is business owned in the classification', () => {
  for (const name of ENTITIES) assert.equal(tenantGroupOf(name), 'business', `${name} must be classified as business owned`);
});

test('every C10 register carries tenant_id and a complete schema', () => {
  for (const name of ENTITIES) {
    const schema = schemaOf(name);
    assert.equal(schema.name, name);
    assert.ok(schema.properties.tenant_id, `${name} needs tenant_id`);
    assert.ok(schema.required.includes('tenant_id'), `${name} must require tenant_id`);
    for (const field of schema.required) {
      assert.ok(schema.properties[field], `${name}.${field} is required but not defined`);
    }
  }
});

test('reads are limited to approved executive and compliance roles within the same business', () => {
  for (const name of ENTITIES) {
    const { rls } = schemaOf(name);
    assert.ok(Array.isArray(rls.read.$and), `${name} read rule must be an $and`);
    const [roles, approved] = rls.read.$and;
    for (const role of ALLOWED_ROLES) {
      assert.ok(roles.$or.some((rule) => rule.user_condition?.role === role), `${name} must allow ${role}`);
    }
    assert.equal(roles.$or.some((rule) => rule.user_condition?.role === 'Employee'), false, `${name} must not allow every employee`);
    assert.deepEqual(approved.user_condition, { account_status: 'Active', access_approved: true });
    assert.equal(rls.read.$and.at(-1) && JSON.stringify(rls.read.$and.at(-1)), JSON.stringify(LOCK), `${name} read needs the business lock`);
  }
});

test('writes are service-role only and still bounded to the business', () => {
  for (const name of ENTITIES) {
    const { rls } = schemaOf(name);
    for (const op of ['create', 'update', 'delete']) {
      const rule = rls[op];
      assert.ok(Array.isArray(rule.$and), `${name}.${op} must be an $and`);
      assert.equal(rule.$and[0].user_condition?.role, '__service_role_only__', `${name}.${op} must be service-role only`);
      assert.equal(JSON.stringify(rule.$and.at(-1)), JSON.stringify(LOCK), `${name}.${op} needs the business lock`);
    }
  }
});

test('nothing is open to anonymous access', () => {
  for (const name of ENTITIES) {
    const { rls } = schemaOf(name);
    assert.ok(rls.read && rls.create && rls.update && rls.delete, `${name} must define all four rules`);
    assert.notEqual(JSON.stringify(rls.read), '{}', `${name} read rule must not be empty`);
  }
});