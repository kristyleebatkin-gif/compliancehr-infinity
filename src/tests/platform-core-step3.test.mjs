import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { computePlatformCoreMetrics } from '../components/users/PlatformCoreGovernanceCommandStrip.jsx';

// 1. Verify computePlatformCoreMetrics accuracy (Row 1 Executive KPIs)
const sampleTenants = [
  { id: 't1', organisation_id: 'org-a', status: 'Active' },
  { id: 't2', organisation_id: 'org-b', status: 'Suspended' },
];
const sampleMemberships = [
  { id: 'm1', organisation_id: 'org-a', status: 'Active', mfa_enforced: true },
  { id: 'm2', organisation_id: 'org-a', status: 'Active', mfa_enforced: true },
  { id: 'm3', organisation_id: 'org-a', status: 'Invited', mfa_enforced: false },
  { id: 'm4', organisation_id: 'org-a', status: 'Suspended', mfa_enforced: true },
];

const metrics = computePlatformCoreMetrics(sampleTenants, sampleMemberships);
assert.equal(metrics.activeTenants, 1);
assert.equal(metrics.activeMembers, 2);
assert.equal(metrics.pendingInvites, 1);
assert.equal(metrics.suspendedCount, 2);
assert.equal(metrics.mfaRate, 75);

// 2. Verify UsersPermissionsHub and UsersTable meet Enterprise Polish Director standards
const hubSource = fs.readFileSync(
  path.resolve(process.cwd(), 'src/pages/UsersPermissionsHub.jsx'),
  'utf8'
);
assert.equal(
  /text-\[(?:9|10|11)px\]/.test(hubSource),
  false,
  'UsersPermissionsHub must not contain sub-12px font sizes'
);
assert.equal(
  hubSource.includes('PlatformCoreGovernanceCommandStrip'),
  true,
  'UsersPermissionsHub must render the 3-Row PlatformCoreGovernanceCommandStrip'
);

const tableSource = fs.readFileSync(
  path.resolve(process.cwd(), 'src/components/users/UsersTable.jsx'),
  'utf8'
);
assert.equal(
  tableSource.includes('Administrator Permission Required'),
  true,
  'UsersTable must render an enterprise permission-denied state'
);

console.log('All Platform Core Step 3 & Enterprise Polish Director tests passed.');