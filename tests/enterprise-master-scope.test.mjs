import test from 'node:test';
import assert from 'node:assert/strict';
import { MASTER_CATALOGUE, MASTER_ROLES, MASTER_WORKSPACE_ELEMENTS, MODULE_OUTPUTS, MASTER_TRACEABILITY, MASTER_ENGINES, FOUNDATION_SERVICES, filterMasterCatalogue } from '../src/lib/enterpriseMasterScope.js';
import { REQUIRED_WORKSPACES, WORKSPACE_ELEMENTS } from '../src/lib/enterprisePhases.js';
test('catalogue reserves 1,500 contiguous numbers in 30 groups without fabricating individual modules', () => {
  assert.equal(MASTER_CATALOGUE.length, 30);
  let next = 1;
  for (const group of MASTER_CATALOGUE) {
    assert.equal(group.first, next);
    assert.equal(group.last - group.first + 1, 50);
    assert.equal(group.status, 'Scope definition required');
    assert.equal('modules' in group, false);
    next = group.last + 1;
  }
  assert.equal(next, 1501);
});
test('master catalogue search is case insensitive and supports reserved ranges', () => {
  assert.equal(filterMasterCatalogue('  PRIVACY  ')[0].first, 801);
  assert.equal(filterMasterCatalogue('001-050')[0].first, 1);
  assert.equal(filterMasterCatalogue('nonexistent').length, 0);
  assert.equal(filterMasterCatalogue('').length, 30);
});
test('version two has forty distinct outputs, full role workspaces and traceability gates', () => {
  assert.equal(MODULE_OUTPUTS.length, 40); assert.equal(new Set(MODULE_OUTPUTS).size, 40);
  assert.equal(MASTER_ROLES.length, 46); assert.equal(MASTER_WORKSPACE_ELEMENTS.length, 16);
  for (const role of MASTER_ROLES) assert.ok(REQUIRED_WORKSPACES.includes(role));
  for (const element of MASTER_WORKSPACE_ELEMENTS) assert.ok(WORKSPACE_ELEMENTS.includes(element));
  assert.equal(MASTER_TRACEABILITY[0], 'Legislation'); assert.equal(MASTER_TRACEABILITY.at(-1), 'Board Reporting');
  assert.ok(MASTER_TRACEABILITY.includes('Verification')); assert.ok(MASTER_TRACEABILITY.includes('Attestation'));
  assert.equal(MASTER_ENGINES.length, 19); assert.equal(FOUNDATION_SERVICES.length, 13);
});
