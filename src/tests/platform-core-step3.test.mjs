import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const hubSource = fs.readFileSync(
  path.resolve(process.cwd(), 'src/pages/UsersPermissionsHub.jsx'),
  'utf8'
);
const tableSource = fs.readFileSync(
  path.resolve(process.cwd(), 'src/components/users/UsersTable.jsx'),
  'utf8'
);
const stripSource = fs.readFileSync(
  path.resolve(process.cwd(), 'src/components/users/PlatformCoreGovernanceCommandStrip.jsx'),
  'utf8'
);

// Lens 1: Visual Consistency & Typography (no sub-12px font sizes or consumer rainbow borders)
assert.equal(
  /text-\[(?:9|10|11)px\]/.test(hubSource),
  false,
  'UsersPermissionsHub must not contain sub-12px font sizes'
);
assert.equal(
  hubSource.includes('borderTopColor: hex'),
  false,
  'UsersPermissionsHub must replace consumer rainbow role cards with enterprise slate-200 cards'
);

// Lens 3 & 4: States & Microcopy (enterprise permission-denied, retry error recovery, clear empty state)
assert.equal(
  tableSource.includes('Administrator Permission Required'),
  true,
  'UsersTable must render an enterprise permission-denied state with recovery guidance'
);
assert.equal(
  tableSource.includes('All caught up — no user accounts are awaiting approval.'),
  true,
  'UsersTable must render confident plain-English empty state copy'
);

// Lens 6, 7 & 10: Data Presentation, Trust Signals & Enterprise Features
assert.equal(
  stripSource.includes('Platform Core — Organisation &amp; Tenant Governance'),
  true,
  'PlatformCoreGovernanceCommandStrip must render the 3-Row Enterprise Command Grid'
);
assert.equal(
  stripSource.includes('Membership Governance Detail Drawer'),
  true,
  'PlatformCoreGovernanceCommandStrip must include the slide-over detail drawer'
);
assert.equal(
  stripSource.includes('logUserAction'),
  true,
  'PlatformCoreGovernanceCommandStrip must record audited lifecycle transitions via logUserAction'
);
assert.equal(
  stripSource.includes('Export Governance Matrix (CSV)'),
  true,
  'PlatformCoreGovernanceCommandStrip must provide CSV export of organisation memberships'
);

console.log('All Platform Core Step 3 & Enterprise Polish Director tests passed.');