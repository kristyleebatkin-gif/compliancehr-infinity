// Release switch for business data separation (audit CRIT-01).
// KEEP IN STEP: base44/shared/tenantEnforcement.ts and src/lib/tenantEnforcement.js must match (a test checks this).
// Turn on ONLY in release 2, after tenantMigration has tagged every live record and
// `node scripts/tenant-rls.mjs --apply` has been run in the same change.
export const TENANT_ENFORCEMENT_ON = true;
