// Disaster Recovery, Backup Manifest & Restore Verification Engine
// Provides deterministic backup snapshot creation, integrity checksums,
// orphan/reference verification, and documented RTO/RPO recovery specifications.

import { detectOrphanParticipantRecords } from './roleMatrix.js';

export const RECOVERY_SPECIFICATION = {
  rto_minutes: 60, // Recovery Time Objective: 60 minutes maximum service restoration window
  rpo_minutes: 15, // Recovery Point Objective: 15 minutes maximum data-loss exposure window
  recovery_owner_role: 'Provider Administrator',
  escalation_contacts: ['Provider Administrator', 'Compliance Administrator', 'Management'],
  covered_domains: [
    'AuditLog',
    'ParticipantProfile',
    'ParticipantDocument',
    'StaffProfile',
    'EmployeeDocument',
    'ChecklistDocument',
    'CompanySafeDocument',
    'User',
  ],
  recovery_steps: [
    '1. Isolate affected tenant or module and place write-maintenance guard on impacted register.',
    '2. Generate current point-in-time state snapshot before applying any restorative writes.',
    '3. Validate backup manifest checksum, schema version, and tenant_id scope.',
    '4. Restore parent identity records first (ParticipantProfile, StaffProfile) before dependent documents.',
    '5. Restore document metadata and verify private file_uri storage links via CreateFileSignedUrl.',
    '6. Append immutable recovery AuditLog entries recording actor, timestamp, restored count, and verification status.',
  ],
};

export function computeManifestChecksum(recordsByEntity = {}) {
  const canonical = JSON.stringify(
    Object.keys(recordsByEntity)
      .sort()
      .map((entityName) => [
        entityName,
        (recordsByEntity[entityName] || []).map((r) => ({
          id: r?.id || null,
          updated_date: r?.updated_date || r?.created_date || null,
        })),
      ])
  );
  let hash = 2166136261;
  for (let i = 0; i < canonical.length; i++) {
    hash ^= canonical.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

export function createBackupManifest(recordsByEntity = {}, metadata = {}) {
  const counts = {};
  for (const [entityName, list] of Object.entries(recordsByEntity)) {
    counts[entityName] = Array.isArray(list) ? list.length : 0;
  }
  const checksum = computeManifestChecksum(recordsByEntity);
  return {
    version: '1.0',
    created_at: metadata.created_at || new Date().toISOString(),
    created_by: metadata.created_by || 'System Recovery Engine',
    tenant_id: metadata.tenant_id || null,
    rto_minutes: RECOVERY_SPECIFICATION.rto_minutes,
    rpo_minutes: RECOVERY_SPECIFICATION.rpo_minutes,
    recovery_owner: RECOVERY_SPECIFICATION.recovery_owner_role,
    counts,
    checksum,
    payload: recordsByEntity,
  };
}

export async function verifyAndRestoreBackup(manifest, targetStore, options = {}) {
  if (!manifest || typeof manifest !== 'object' || !manifest.payload) {
    throw new Error('Invalid backup manifest: missing payload.');
  }
  const recomputed = computeManifestChecksum(manifest.payload);
  if (manifest.checksum !== recomputed) {
    throw new Error(`Backup checksum mismatch: expected ${manifest.checksum}, got ${recomputed}.`);
  }
  if (options.expectedTenantId && manifest.tenant_id && manifest.tenant_id !== options.expectedTenantId) {
    throw new Error('Cross-tenant restore blocked: manifest tenant_id does not match target tenant.');
  }

  const participants = manifest.payload.ParticipantProfile || [];
  const participantDocs = manifest.payload.ParticipantDocument || [];
  const orphans = detectOrphanParticipantRecords(
    participantDocs,
    participants.map((p) => p.id)
  );
  if (orphans.length > 0 && !options.allowOrphans) {
    throw new Error(`Restore validation failed: ${orphans.length} orphan participant document(s) detected.`);
  }

  const restoredCounts = {};
  const restoreOrder = [
    'ParticipantProfile',
    'StaffProfile',
    'EmployeeDocument',
    'ParticipantDocument',
    'ChecklistDocument',
    'CompanySafeDocument',
    'AuditLog',
  ];

  const orderedEntities = [
    ...restoreOrder.filter((k) => k in manifest.payload),
    ...Object.keys(manifest.payload).filter((k) => !restoreOrder.includes(k)),
  ];

  for (const entityName of orderedEntities) {
    const records = manifest.payload[entityName] || [];
    restoredCounts[entityName] = 0;
    for (const record of records) {
      if (targetStore?.upsert) {
        await targetStore.upsert(entityName, record);
      }
      restoredCounts[entityName] += 1;
    }
  }

  return {
    verified: true,
    checksum: recomputed,
    restoredCounts,
    orphanCount: orphans.length,
    restoredAt: new Date().toISOString(),
  };
}