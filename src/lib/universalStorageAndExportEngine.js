import { esc } from '@/lib/visualPrint';
import { base44 } from '@/api/base44Client';
import { downloadCsv } from '@/lib/csvExport';
import { validateApprovalTransition } from '@/lib/roleMatrix';

export const UNIVERSAL_25_ITEM_TYPES = [
  'Form',
  'Intake',
  'Induction',
  'Assessment',
  'Skills Assessment',
  'Review',
  'Audit',
  'Consent',
  'Communication',
  'Goal',
  'Risk',
  'Incident',
  'Emergency Record',
  'Service Agreement',
  'Welcome Pack',
  'Qualification',
  'Certification',
  'Policy Review',
  'Procedure Review',
  'Checklist',
  'Upload',
  'Attachment',
  'Photo',
  'Signature',
  'Report',
];

export const PARTICIPANT_11_STORAGE_BUCKETS = [
  'Participant Profile',
  'Documents',
  'Consents',
  'Assessments',
  'Risks',
  'Reviews',
  'Incidents',
  'Communications',
  'Service Agreements',
  'Emergency Information',
  'Audit History',
];

export const EMPLOYEE_8_STORAGE_BUCKETS = [
  'Employee Profile',
  'Skills Assessments',
  'Certifications',
  'Qualifications',
  'Reviews',
  'Compliance Records',
  'Communications',
  'Audit History',
];

export const COMPANY_SAFE_9_PROTECTED_CATEGORIES = [
  'Consents',
  'Service Agreements',
  'Certifications',
  'Qualifications',
  'Audits',
  'Reviews',
  'Compliance Reports',
  'Governance Reports',
  'Critical Evidence',
];

export const AUDIT_8_LIFECYCLE_EVENTS = [
  'Created',
  'Viewed',
  'Updated',
  'Reviewed',
  'Approved',
  'Exported',
  'Printed',
  'Archived',
];

export const RETENTION_7_LAYERS = [
  'Original Record (Immutable Baseline)',
  'Updated Record (Current Working State)',
  'Previous Versions (v1.0 → vCurrent)',
  'Supporting Documents (Private URI / Vault Linked)',
  'Digital & Witness Signatures (Date/Time Stamped)',
  'Linked Communications (6-Stage Lifecycle)',
  'Related Substantiating Evidence',
];

export const REPORT_8_TYPES = [
  { id: 'existing-records', label: 'Existing Records Report' },
  { id: 'missing-records', label: 'Missing Records Report' },
  { id: 'missing-evidence', label: 'Missing Evidence Report' },
  { id: 'missing-reviews', label: 'Missing Reviews Report' },
  { id: 'missing-approvals', label: 'Missing Approvals Report' },
  { id: 'expiring-documents', label: 'Expiring Documents Report' },
  { id: 'expiring-certifications', label: 'Expiring Certifications Report' },
  { id: 'expiring-consents', label: 'Expiring Consents Report' },
];

export const EXPORT_6_SCOPES = [
  'Single Record Export',
  'Multi Record Export',
  'Profile Export',
  'Compliance Export',
  'Audit Pack Export',
  'Evidence Pack Export',
];

export function exportUniversalData(formatType, filenameBase, columns, rows, title = 'ComplianceHR Infinity — Universal Evidence & Compliance Export') {
  const safeBase = filenameBase.toLowerCase().replace(/[^a-z0-9-_]+/g, '-');

  if (formatType === 'csv') {
    downloadCsv(`${safeBase}.csv`, columns, rows);
    return;
  }

  const tableHeaders = columns.map((c) => `<th style="border:1px solid #0A2B6D;padding:6px 8px;background:#0A2B6D;color:#ffffff;font-size:11px;text-align:left;">${esc(c.label)}</th>`).join('');
  const tableRows = rows
    .map(
      (r) =>
        `<tr>${columns
          .map(
            (c) =>
              `<td style="border:1px solid #cbd5e1;padding:6px 8px;font-size:11px;color:#0A2B6D;">${esc(
                r[c.key] ?? ''
              )}</td>`
          )
          .join('')}</tr>`
    )
    .join('');

  const htmlDoc = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>${esc(title)}</title>
</head>
<body style="font-family:Arial,sans-serif;padding:20px;color:#0A2B6D;">
  <h2 style="margin:0 0 4px 0;color:#0A2B6D;">${esc(title)}</h2>
  <p style="margin:0 0 12px 0;font-size:11px;color:#5A00D6;">
    Generated: ${new Date().toLocaleString('en-AU')} · Universal Data Storage, Retention, Traceability &amp; Export Standard
  </p>
  <table style="border-collapse:collapse;width:100%;">${tableHeaders}${tableRows}</table>
</body>
</html>`;

  if (formatType === 'word') {
    const blob = new Blob([htmlDoc], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeBase}.doc`;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  if (formatType === 'excel') {
    const blob = new Blob([htmlDoc], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeBase}.xls`;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  if (formatType === 'pdf') {
    const win = window.open('', '_blank', 'width=980,height=720');
    if (win) {
      win.document.write(htmlDoc);
      win.document.close();
      win.focus();
      win.print();
    }
  }
}

const idempotencyCache = new Map();

export async function withRetryAndIdempotency(operation, { retries = 2, baseDelayMs = 150, idempotencyKey = null } = {}) {
  if (idempotencyKey && idempotencyCache.has(idempotencyKey)) {
    return idempotencyCache.get(idempotencyKey);
  }
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await operation();
      if (idempotencyKey) idempotencyCache.set(idempotencyKey, result);
      return result;
    } catch (error) {
      lastError = error;
      if (error?.status === 400 || error?.status === 401 || error?.status === 403 || error?.status === 404) {
        break;
      }
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, baseDelayMs * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

export function isSyntheticParticipantId(participantId) {
  const id = String(participantId || '').trim();
  if (!id) return true;
  return /^(?:PART-|DOC-PART-|FAKE-|SYNTH-|TEMP-)/i.test(id);
}

export function detectOrphanParticipantRecords(records = [], validParticipantIds = []) {
  const validSet = new Set(validParticipantIds.map((id) => String(id).trim()).filter(Boolean));
  const orphans = [];
  for (const record of records) {
    const pid = String(record?.participant_id || '').trim();
    if (!pid || isSyntheticParticipantId(pid) || (validSet.size > 0 && !validSet.has(pid))) {
      orphans.push({
        id: record?.id || null,
        title: record?.title || record?.document_type || 'Untitled',
        participant_id: pid || null,
        participant_name: record?.participant_name || null,
        reason: !pid
          ? 'Missing participant_id'
          : isSyntheticParticipantId(pid)
            ? `Synthetic participant_id (${pid})`
            : `Unresolved participant_id (${pid})`,
      });
    }
  }
  return orphans;
}

export { validateApprovalTransition };

export async function saveUniversalRecordAcrossEcosystem({
  itemType = 'Service Agreement',
  title,
  personType = 'Participant',
  personName = '',
  participantId = '',
  employeeId = '',
  moduleName = 'Compliance & Governance',
  program = 'NDIS & Aged Care',
  department = 'Service Delivery',
  site = 'Head Office',
  standard = 'NDIS Practice Standards Module 1–4',
  complianceType = 'Mandatory Governance Evidence',
  relatedIncident = 'None',
  relatedRisk = 'Pending Risk Verification',
  relatedReview = 'Pending Review Link',
  relatedAudit = 'Pending Internal Audit Link',
  relatedConsent = 'Pending Consent Verification',
  relatedServiceAgreement = 'Pending Service Agreement Link',
  fileUri = '',
  fileName = '',
  signature = '',
  idempotencyKey = '',
  user,
  client = base44,
}) {
  if (!user?.id && !user?.email) {
    throw new Error('Authenticated user context is required to file records.');
  }
  const cleanName = String(personName || '').trim();
  if (!cleanName) {
    throw new Error('A valid participant or employee name is required.');
  }

  const today = new Date().toISOString().slice(0, 10);
  const nextYear = new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10);
  const actor = user?.full_name || user?.email;
  const docNumber = idempotencyKey || `CHR-UNI-${Date.now().toString().slice(-6)}`;
  const recordTitle = title?.trim() || `${itemType} — ${cleanName} (${docNumber})`;

  let resolvedParticipantId = String(participantId || '').trim();
  if (personType === 'Participant') {
    if (resolvedParticipantId && isSyntheticParticipantId(resolvedParticipantId)) {
      throw new Error(`Synthetic participant reference "${resolvedParticipantId}" is not permitted. Link a real ParticipantProfile ID.`);
    }
    if (!resolvedParticipantId) {
      const page = await client.entities.ParticipantProfile.filter({ full_name: cleanName }, { limit: 2 });
      const matches = Array.isArray(page) ? page : page?.items || [];
      if (matches.length === 0) {
        throw new Error(`No ParticipantProfile found for "${cleanName}". Create or select a valid participant profile before filing.`);
      }
      if (matches.length > 1) {
        throw new Error(`Multiple participant profiles match "${cleanName}". Select an explicit participant_id to avoid ambiguous filing.`);
      }
      resolvedParticipantId = matches[0].id;
    }
    if (!resolvedParticipantId || isSyntheticParticipantId(resolvedParticipantId)) {
      throw new Error('Valid participant_id relationship is required.');
    }
  }

  const outcomes = {
    docNumber,
    recordTitle,
    today,
    initialStatus: 'Pending Review',
    succeeded: [],
    failed: [],
  };

  // 1. Save to Profile Document Register (starts in Pending Review / Draft, never synthetic Verified/Approved)
  try {
    if (personType === 'Participant') {
      const createdProfileDoc = await withRetryAndIdempotency(
        () =>
          client.entities.ParticipantDocument.create({
            participant_id: resolvedParticipantId,
            participant_name: cleanName,
            document_type: itemType === 'Service Agreement' ? 'Service Agreement' : 'Participant Intake Form',
            title: recordTitle,
            file_uri: fileUri || undefined,
            status: fileUri ? 'Pending Review' : 'Requested',
            uploaded_date: today,
            submitted_date: today,
            review_date: nextYear,
            expiry_date: nextYear,
            responsible_staff: actor,
            review_outcome: 'Pending Review',
            document_summary: `${docNumber} | Module: ${moduleName} | Program: ${program} | Dept: ${department} | Site: ${site} | Standard: ${standard}`,
            notes: `Linked Risk: ${relatedRisk} | Review: ${relatedReview} | Audit: ${relatedAudit} | Consent: ${relatedConsent} | Service Agreement: ${relatedServiceAgreement}`,
          }),
        { idempotencyKey: `${docNumber}:profileDoc` }
      );
      outcomes.succeeded.push({ destination: 'ParticipantDocument', id: createdProfileDoc?.id });
    } else {
      const createdEmpDoc = await withRetryAndIdempotency(
        () =>
          client.entities.EmployeeDocument.create({
            title: recordTitle,
            employee_id: employeeId || undefined,
            employee_name: cleanName,
            employee_email: user?.email || undefined,
            document_type: itemType === 'Qualification' || itemType === 'Certification' ? 'Qualifications' : 'Other',
            issue_date: today,
            expiry_date: nextYear,
            status: 'Current',
            file_uri: fileUri || undefined,
            notes: `${docNumber} | Module: ${moduleName} | Program: ${program} | Dept: ${department} | Site: ${site} | Standard: ${standard}`,
          }),
        { idempotencyKey: `${docNumber}:profileDoc` }
      );
      outcomes.succeeded.push({ destination: 'EmployeeDocument', id: createdEmpDoc?.id });
    }
  } catch (err) {
    outcomes.failed.push({ destination: 'ProfileDocument', error: err?.message || 'Profile document write failed' });
  }

  // 2. Save to Document Vault (ChecklistDocument) — starts in Draft / Pending Review until approved
  try {
    const vaultDoc = await withRetryAndIdempotency(
      () =>
        client.entities.ChecklistDocument.create({
          title: `[Document Vault · ${itemType}] ${recordTitle}`,
          category: itemType,
          status: 'Draft',
          uploaded_by: actor,
          uploaded_date: today,
          file_uri: fileUri || undefined,
          file_name: fileName || `${docNumber}.pdf`,
          notes: `Universal Filing (${docNumber}) | Person: ${cleanName} (${personType}) | Standard: ${standard} | Status: Draft awaiting review`,
        }),
      { idempotencyKey: `${docNumber}:vaultDoc` }
    );
    outcomes.succeeded.push({ destination: 'ChecklistDocument', id: vaultDoc?.id });
  } catch (err) {
    outcomes.failed.push({ destination: 'ChecklistDocument', error: err?.message || 'Vault write failed' });
  }

  // 3. Save Working Copy to Company Safe (CompanySafeDocument)
  try {
    const safeDoc = await withRetryAndIdempotency(
      () =>
        client.entities.CompanySafeDocument.create({
          title: `[Company Safe Copy · v1.0] ${recordTitle}`,
          category: itemType,
          status: 'Draft',
          uploaded_by: actor,
          uploaded_date: today,
          review_date: nextYear,
          file_uri: fileUri || undefined,
          file_name: fileName || `${docNumber}-safe.pdf`,
          notes: `Version v1.0 | Submitted by ${actor} on ${today}${signature ? ` | Signatory: ${signature}` : ''} | Awaiting formal approval`,
        }),
      { idempotencyKey: `${docNumber}:safeDoc` }
    );
    outcomes.succeeded.push({ destination: 'CompanySafeDocument', id: safeDoc?.id });
  } catch (err) {
    outcomes.failed.push({ destination: 'CompanySafeDocument', error: err?.message || 'Company Safe write failed' });
  }

  if (outcomes.failed.length > 0) {
    const summary = outcomes.failed.map((f) => `${f.destination}: ${f.error}`).join('; ');
    throw new Error(
      outcomes.succeeded.length > 0
        ? `Partial filing failure (${outcomes.succeeded.length} succeeded, ${outcomes.failed.length} failed): ${summary}`
        : `Filing failed across all destinations: ${summary}`
    );
  }

  // 4. Record in Global Audit Log via server function
  await withRetryAndIdempotency(
    () =>
      client.functions.invoke('logUserAction', {
        action: 'Create',
        entity_type: `UniversalStorage:${itemType}`,
        record_id: docNumber,
        record_title: recordTitle,
        details: `Universal Storage (${docNumber}) -> Filed to ${personType} Profile (${resolvedParticipantId || cleanName}), ${moduleName}, Document Vault & Company Safe as Pending Review.`,
        route: typeof window !== 'undefined' ? window.location.pathname : '/universal-storage',
      }),
    { idempotencyKey: `${docNumber}:audit` }
  );

  return outcomes;
}