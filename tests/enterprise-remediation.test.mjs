import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  validateApprovalTransition,
  resolveUserTenantId,
  assertTenantRecordAccess,
  scopeQueryToTenant,
  stampTenantWritePayload,
  canAccessDocumentClassification,
} from '../src/lib/roleMatrix.js';
import {
  createBackupManifest,
  verifyAndRestoreBackup,
  RECOVERY_SPECIFICATION,
} from '../src/lib/disasterRecoveryAndBackup.js';

async function importWithViteAliases(relPath) {
  let src = await readFile(new URL(relPath, import.meta.url), 'utf8');
  src = src
    .replace(/import\s+\{\s*base44\s*\}\s+from\s+['"]@\/api\/base44Client['"];?/g, 'const base44 = { entities: {}, functions: { invoke: async () => ({}) } };')
    .replace(/import\s+\{\s*esc\s*\}\s+from\s+['"]@\/lib\/visualPrint['"];?/g, 'const esc = (s) => String(s ?? "");')
    .replace(/from\s+['"]@\/lib\/csvExport['"]/g, `from '${new URL('../src/lib/csvExport.js', import.meta.url).href}'`)
    .replace(/from\s+['"]@\/lib\/roleMatrix['"]/g, `from '${new URL('../src/lib/roleMatrix.js', import.meta.url).href}'`);
  return import(`data:text/javascript;base64,${Buffer.from(src).toString('base64')}`);
}

const storageEngine = await importWithViteAliases('../src/lib/universalStorageAndExportEngine.js');
const scoreEngine = await importWithViteAliases('../src/lib/organisationHealthScoreEngine.js');

const {
  isSyntheticParticipantId,
  detectOrphanParticipantRecords,
  repairOrphanParticipantDocuments,
  withRetryAndIdempotency,
  saveUniversalRecordAcrossEcosystem,
} = storageEngine;

const {
  evaluateThresholdBand,
  loadAndCalculateExecutiveScores,
} = scoreEngine;

const activeAdmin = {
  id: 'usr_admin_1',
  email: 'admin@provider.com.au',
  full_name: 'Alex Admin',
  role: 'Provider Administrator',
  account_status: 'Active',
  access_approved: true,
  tenant_id: 'tenant_alpha',
};

const activeEmployee = {
  id: 'usr_emp_1',
  email: 'worker@provider.com.au',
  full_name: 'Sam Worker',
  role: 'Employee',
  account_status: 'Active',
  access_approved: true,
  tenant_id: 'tenant_alpha',
};

const suspendedAdmin = {
  ...activeAdmin,
  account_status: 'Suspended',
};

test('tenant isolation blocks cross-tenant reads, writes, and suspended tenants', () => {
  assert.equal(resolveUserTenantId(activeAdmin, { user_id: 'usr_admin_1', tenant_id: 'tenant_alpha', status: 'Active' }, { id: 'tenant_alpha', status: 'Active' }), 'tenant_alpha');
  assert.throws(() => resolveUserTenantId(activeAdmin, null, { id: 'tenant_alpha', status: 'Suspended' }), /Suspended/);
  assert.throws(() => resolveUserTenantId(activeAdmin, { user_id: 'usr_admin_1', tenant_id: 'tenant_beta', status: 'Active' }), /Cross-tenant/);
  assert.throws(() => assertTenantRecordAccess(activeAdmin, { id: 'rec_1', tenant_id: 'tenant_beta' }), /Cross-tenant/);
  assert.equal(assertTenantRecordAccess(activeAdmin, { id: 'rec_1', tenant_id: 'tenant_alpha' }), true);
  assert.deepEqual(scopeQueryToTenant({ status: 'Active' }, 'tenant_alpha'), { status: 'Active', tenant_id: 'tenant_alpha' });
  assert.deepEqual(stampTenantWritePayload({ title: 'Policy' }, activeAdmin), { title: 'Policy', tenant_id: 'tenant_alpha' });
  assert.throws(() => stampTenantWritePayload({ title: 'Policy', tenant_id: 'tenant_beta' }, activeAdmin), /Cross-tenant write denied/);
});

test('approval workflow enforces Draft -> Submitted -> Under Review -> Approved/Rejected -> Archived with evidence', () => {
  const step1 = validateApprovalTransition('Draft', 'Submitted', { user: activeEmployee });
  assert.equal(step1.status, 'Submitted');

  assert.throws(() => validateApprovalTransition('Submitted', 'Under Review', { user: activeEmployee }), /not permitted/);

  const step2 = validateApprovalTransition('Submitted', 'Under Review', { user: activeAdmin });
  assert.equal(step2.status, 'Under Review');

  assert.throws(() => validateApprovalTransition('Draft', 'Approved', { user: activeAdmin, reason: 'Fast track', evidence_uri: 'private/ev.pdf' }), /Cannot transition/);
  assert.throws(() => validateApprovalTransition('Under Review', 'Approved', { user: activeAdmin, reason: '', evidence_uri: 'private/ev.pdf' }), /reason is required/);
  assert.throws(() => validateApprovalTransition('Under Review', 'Approved', { user: activeAdmin, reason: 'Verified against NDIS standard', evidence_uri: '' }), /evidence is required/);

  const step3 = validateApprovalTransition('Under Review', 'Approved', {
    user: activeAdmin,
    reason: 'Verified against NDIS Practice Standard 1',
    evidence_uri: 'private/evidence-pack-1.pdf',
  });
  assert.equal(step3.status, 'Approved');
  assert.equal(step3.approver_id, activeAdmin.id);
  assert.equal(step3.evidence_reference, 'private/evidence-pack-1.pdf');

  assert.throws(() => validateApprovalTransition('Under Review', 'Approved', { user: suspendedAdmin, reason: 'ok', evidence_uri: 'private/ev.pdf' }), /Active, approved account/);
});

test('document security classification restricts Sensitive and Regulated records', () => {
  assert.equal(canAccessDocumentClassification(activeEmployee, 'Internal'), true);
  assert.equal(canAccessDocumentClassification(activeEmployee, 'Sensitive'), false);
  assert.equal(canAccessDocumentClassification(activeEmployee, 'Regulated'), false);
  assert.equal(canAccessDocumentClassification(activeAdmin, 'Regulated'), true);
  assert.equal(canAccessDocumentClassification(suspendedAdmin, 'Public'), false);
});

test('synthetic participant IDs (PART-*, P-*) are detected and refused on filing', async () => {
  assert.equal(isSyntheticParticipantId('PART-CHR-UNI-123456'), true);
  assert.equal(isSyntheticParticipantId('P-10294'), true);
  assert.equal(isSyntheticParticipantId('6ae74dcdd5fc0ff3a4145f1f'), false);

  const docs = [
    { id: 'doc1', title: 'Plan 1', participant_id: 'PART-101', participant_name: "Liam O'Connor" },
    { id: 'doc2', title: 'Plan 2', participant_id: 'P-202', participant_name: 'Evelyn Nguyen' },
    { id: 'doc3', title: 'Plan 3', participant_id: '6ae74dcdd5fc0ff3a4145f1f', participant_name: "Liam O'Connor" },
  ];
  const participants = [
    { id: '6ae74dcdd5fc0ff3a4145f1f', full_name: "Liam O'Connor" },
    { id: '6ae74dcdd5fc0ff3a4145f45', full_name: 'Evelyn Nguyen' },
    { id: '6ae74dcdd5fc0ff3a4145efd', full_name: 'Evelyn Nguyen' },
  ];

  const orphans = detectOrphanParticipantRecords(docs, participants.map((p) => p.id));
  assert.equal(orphans.length, 2);

  const repair = repairOrphanParticipantDocuments(docs, participants);
  assert.equal(repair.repaired.length, 1);
  assert.equal(repair.repaired[0].resolved_participant_id, '6ae74dcdd5fc0ff3a4145f1f');
  assert.equal(repair.unresolved.length, 1);
  assert.match(repair.unresolved[0].reason, /Ambiguous/);

  await assert.rejects(
    () =>
      saveUniversalRecordAcrossEcosystem({
        personType: 'Participant',
        personName: "Liam O'Connor",
        participantId: 'PART-FAKE-999',
        user: activeAdmin,
      }),
    /Synthetic participant reference/
  );
});

test('withRetryAndIdempotency retries transient errors and deduplicates idempotent keys', async () => {
  let attempts = 0;
  const res1 = await withRetryAndIdempotency(
    async () => {
      attempts += 1;
      if (attempts < 2) throw new Error('Transient network failure');
      return { id: 'rec_99' };
    },
    { retries: 2, baseDelayMs: 5, idempotencyKey: 'idem-test-1' }
  );
  assert.deepEqual(res1, { id: 'rec_99' });
  assert.equal(attempts, 2);

  const res2 = await withRetryAndIdempotency(
    async () => {
      attempts += 1;
      return { id: 'rec_100' };
    },
    { idempotencyKey: 'idem-test-1' }
  );
  assert.deepEqual(res2, { id: 'rec_99' });
  assert.equal(attempts, 2);
});

test('compliance score engine never defaults empty data to green/baseline and reports errors honestly', async () => {
  assert.equal(evaluateThresholdBand(null).status, 'Missing Data');
  assert.equal(evaluateThresholdBand(95, 80, 65, true).status, 'Error');
  assert.equal(evaluateThresholdBand(50, 80, 65).status, 'Fail');
  assert.equal(evaluateThresholdBand(75, 80, 65).status, 'Warning');
  assert.equal(evaluateThresholdBand(90, 80, 65).status, 'Pass');

  const emptyClient = {
    entities: new Proxy(
      {},
      {
        get: () => ({
          count: async () => 0,
          filter: async () => ({ items: [] }),
        }),
      }
    ),
  };
  const emptyResult = await loadAndCalculateExecutiveScores(emptyClient);
  assert.equal(emptyResult.scores.compliance.score, null);
  assert.equal(emptyResult.scores.compliance.band.status, 'Missing Data');
  assert.equal(emptyResult.scores.organisation_health.score, null);
  assert.equal(emptyResult.scores.organisation_health.band.status, 'Missing Data');
});

test('disaster recovery manifest creation, checksum verification, and restore validation succeed', async () => {
  assert.equal(RECOVERY_SPECIFICATION.rto_minutes, 60);
  assert.equal(RECOVERY_SPECIFICATION.rpo_minutes, 15);

  const payload = {
    ParticipantProfile: [{ id: 'part_1', full_name: 'Jordan Taylor', updated_date: '2026-11-02' }],
    ParticipantDocument: [{ id: 'pdoc_1', title: 'Service Agreement', participant_id: 'part_1', updated_date: '2026-11-02' }],
    AuditLog: [{ id: 'aud_1', action: 'Create', entity_type: 'ParticipantDocument', updated_date: '2026-11-02' }],
  };
  const manifest = createBackupManifest(payload, { tenant_id: 'tenant_alpha', created_by: activeAdmin.email });
  const restored = [];
  const verification = await verifyAndRestoreBackup(
    manifest,
    { upsert: async (entityName, record) => restored.push([entityName, record.id]) },
    { expectedTenantId: 'tenant_alpha' }
  );
  assert.equal(verification.verified, true);
  assert.equal(restored.length, 3);
  assert.deepEqual(restored[0], ['ParticipantProfile', 'part_1']);

  const tampered = { ...manifest, payload: { ...payload, ParticipantProfile: [] } };
  await assert.rejects(() => verifyAndRestoreBackup(tampered, {}), /checksum mismatch/);
});