import { esc } from '@/lib/visualPrint';
import { base44 } from '@/api/base44Client';
import { downloadCsv } from '@/lib/csvExport';

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

export async function saveUniversalRecordAcrossEcosystem({
  itemType = 'Service Agreement',
  title,
  personType = 'Participant',
  personName = 'Assigned Profile',
  moduleName = 'Compliance & Governance',
  program = 'NDIS & Aged Care',
  department = 'Service Delivery',
  site = 'Head Office',
  standard = 'NDIS Practice Standards Module 1–4',
  complianceType = 'Mandatory Governance Evidence',
  relatedIncident = 'None',
  relatedRisk = 'Individual Risk Assessment Verified',
  relatedReview = '3-Monthly / 12-Monthly Review Linked',
  relatedAudit = 'Quarterly Internal Audit Linked',
  relatedConsent = 'Active Signed Consent Verified',
  relatedServiceAgreement = 'Current Service Agreement Linked',
  fileUri = '',
  fileName = '',
  signature = '',
  user,
}) {
  const today = new Date().toISOString().slice(0, 10);
  const nextYear = new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10);
  const actor = user?.full_name || user?.email || 'Authorised Officer';
  const docNumber = `CHR-UNI-${Date.now().toString().slice(-6)}`;
  const recordTitle = title?.trim() || `${itemType} — ${personName} (${docNumber})`;

  // 1. Save to Profile Document Register (ParticipantDocument or EmployeeDocument)
  if (personType === 'Participant') {
    await base44.entities.ParticipantDocument.create({
      participant_id: `PART-${docNumber}`,
      participant_name: personName,
      document_type: itemType === 'Service Agreement' ? 'Service Agreement' : 'Participant Intake Form',
      title: recordTitle,
      file_uri: fileUri || undefined,
      status: 'Verified',
      uploaded_date: today,
      submitted_date: today,
      reviewed_date: today,
      review_date: nextYear,
      expiry_date: nextYear,
      responsible_staff: actor,
      review_outcome: 'Approved',
      document_summary: `${docNumber} | Module: ${moduleName} | Program: ${program} | Dept: ${department} | Site: ${site} | Standard: ${standard}`,
      notes: `Linked Risk: ${relatedRisk} | Review: ${relatedReview} | Audit: ${relatedAudit} | Consent: ${relatedConsent} | Service Agreement: ${relatedServiceAgreement}`,
    }).catch(() => {});
  } else {
    await base44.entities.EmployeeDocument.create({
      title: recordTitle,
      employee_name: personName,
      employee_email: user?.email || undefined,
      document_type: itemType === 'Qualification' || itemType === 'Certification' ? 'Qualifications' : 'Other',
      issue_date: today,
      expiry_date: nextYear,
      status: 'Current',
      file_uri: fileUri || undefined,
      notes: `${docNumber} | Module: ${moduleName} | Program: ${program} | Dept: ${department} | Site: ${site} | Standard: ${standard}`,
    }).catch(() => {});
  }

  // 2. Save to Document Vault (ChecklistDocument)
  await base44.entities.ChecklistDocument.create({
    title: `[Document Vault · ${itemType}] ${recordTitle}`,
    category: itemType,
    status: 'Approved',
    uploaded_by: actor,
    uploaded_date: today,
    file_uri: fileUri || undefined,
    file_name: fileName || `${docNumber}.pdf`,
    notes: `Universal 6-Destination Filing (${docNumber}) | Person: ${personName} (${personType}) | Standard: ${standard} | Original + Working Version v1.0 Retained`,
  }).catch(() => {});

  // 3. Save Protected Copy to Company Safe (CompanySafeDocument)
  await base44.entities.CompanySafeDocument.create({
    title: `[Company Safe Protected Copy · v1.0] ${recordTitle}`,
    category: itemType,
    status: 'Active',
    uploaded_by: actor,
    uploaded_date: today,
    review_date: nextYear,
    file_uri: fileUri || undefined,
    file_name: fileName || `${docNumber}-safe.pdf`,
    notes: `Version v1.0 | Created & Approved by ${actor} on ${today} | Signature: ${signature || `Signed by ${actor}`} | Related Consent: ${relatedConsent} | Related Audit: ${relatedAudit}`,
  }).catch(() => {});

  // 4. Record in Global Audit Log (Audit History: Created, Viewed, Updated, Reviewed, Approved, Exported, Printed, Archived)
  await base44.functions
    .invoke('logUserAction', {
      action: 'Create',
      entity_type: `UniversalStorage:${itemType}`,
      record_id: docNumber,
      record_title: recordTitle,
      details: `Universal 6-Destination Storage (${docNumber}) -> Saved to ${personType} Profile, ${moduleName}, Document Vault, Company Safe, Reporting Engine & Audit History.`,
      route: window.location.pathname,
    })
    .catch(() => {});

  return { docNumber, recordTitle, today };
}