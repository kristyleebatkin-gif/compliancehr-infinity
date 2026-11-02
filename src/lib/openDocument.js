import { base44 } from '@/api/base44Client';
import { safeUrl } from '@/lib/safeUrl';
import {
  exportControlledRecordAsPdf,
  exportControlledRecordAsWord,
  exportControlledRecordAsExcel,
  exportControlledRecordAsCsv,
} from '@/lib/enterpriseGovernanceStandard';

const SAMPLE_URL_PATTERN = /^(s3:\/\/|https?:\/\/([^/]*\.)?(example\.com|compliancehr-infinity\.com|hr-docs\.s3\.))/i;

export function isRealStoredUri(uri) {
  if (!uri || typeof uri !== 'string') return false;
  const trimmed = uri.trim();
  if (!trimmed || SAMPLE_URL_PATTERN.test(trimmed)) return false;
  return true;
}

export async function resolveDocumentUrl(doc = {}) {
  if (!doc) return '';
  const rawUri =
    doc.file_uri ||
    doc.signed_form_uri ||
    doc.supporting_evidence_uri ||
    doc.evidence_uri ||
    doc.submitted_document_url ||
    doc.checklist_file_uri ||
    doc.report_file_uri ||
    doc.fileUri ||
    '';

  if (isRealStoredUri(rawUri)) {
    if (/^https?:\/\//i.test(rawUri)) {
      return safeUrl(rawUri) || '';
    }
    try {
      const res = await base44.integrations.Core.CreateFileSignedUrl({
        file_uri: rawUri,
        expires_in: 3600,
      });
      if (res?.signed_url) return res.signed_url;
    } catch {
      // Fall back to public file_url or structured document viewer if private URI cannot be signed
    }
  }

  const rawUrl = doc.file_url || doc.signed_form_url || doc.official_url || doc.source_document_url || '';
  if (isRealStoredUri(rawUrl)) {
    return safeUrl(rawUrl) || '';
  }
  return '';
}

export function buildControlledRecordFromDoc(doc = {}) {
  const today = new Date().toISOString().slice(0, 10);
  const title =
    doc.title ||
    doc.document_name ||
    doc.documentName ||
    doc.name ||
    doc.form_title ||
    doc.file_name ||
    doc.document_type ||
    doc.module_title ||
    doc.consent_type ||
    'Controlled Compliance Document';

  const docNum =
    doc.documentNumber ||
    doc.docNumber ||
    doc.document_id ||
    doc.code ||
    doc.certificate_number ||
    `CHR-DOC-${String(doc.id || '2026').slice(-6).toUpperCase()}`;

  const version = String(doc.version || doc.versionNumber || 'v1.0').startsWith('v')
    ? String(doc.version || doc.versionNumber || 'v1.0')
    : `v${doc.version}`;

  const category =
    doc.category ||
    doc.document_category ||
    doc.document_type ||
    doc.itemType ||
    doc.library ||
    'Compliance & Governance';

  const moduleName =
    doc.module ||
    (doc.participant_name || doc.participant_id ? 'Participant Profiles & Document Vault' : '') ||
    (doc.employee_name || doc.staff_name ? 'Employee Profiles & HR Vault' : '') ||
    'Compliance & Document Hub';

  const owner =
    doc.owner ||
    doc.approved_by ||
    doc.approvedBy ||
    doc.uploaded_by ||
    doc.submitted_by ||
    doc.responsible_staff ||
    doc.reviewer ||
    doc.authority ||
    doc.user ||
    'Compliance Manager';

  const person =
    doc.personName ||
    doc.person_name ||
    doc.participant_name ||
    doc.employee_name ||
    doc.staff_name ||
    doc.recipient_name ||
    owner;

  const createdDate =
    doc.issue_date ||
    doc.uploaded_date ||
    doc.submitted_date ||
    doc.date ||
    doc.consent_start_date ||
    doc.date_signed ||
    doc.createdDate ||
    (doc.created_date ? String(doc.created_date).slice(0, 10) : today);

  const nextReview =
    doc.review_date ||
    doc.next_review ||
    doc.expiry_date ||
    doc.expiryDate ||
    doc.consent_end_date ||
    doc.nextReviewDate ||
    doc.due_date ||
    'Scheduled (Annual / 6-Monthly)';

  const status = doc.status || doc.review_outcome || 'Approved & Filed';

  const mainContentText =
    doc.content ||
    doc.description ||
    doc.purpose ||
    doc.document_summary ||
    doc.submission_summary ||
    doc.consent_description ||
    doc.notes ||
    `Official controlled record for "${title}" (${docNum} · ${version}), maintained in ComplianceHR Infinity under NDIS Practice Standards, Aged Care Quality Standards, Privacy Act 1988, and WHS compliance frameworks.`;

  const customMainFields = Array.isArray(doc.mainFields) && doc.mainFields.length > 0
    ? doc.mainFields
    : [
        { key: 'title', label: 'Document / Record Title', value: title },
        { key: 'classification', label: 'Category & Type', value: `${category}${doc.document_type && doc.document_type !== category ? ` · ${doc.document_type}` : ''}` },
        { key: 'person', label: 'Related Participant / Staff / Subject', value: person || 'Organisation-Wide' },
        { key: 'status', label: 'Verification & Compliance Status', value: status },
        { key: 'effectiveDate', label: 'Issue / Uploaded / Effective Date', value: createdDate },
        { key: 'reviewExpiry', label: 'Review / Expiry Date', value: nextReview },
        ...(doc.jurisdiction ? [{ key: 'jurisdiction', label: 'Jurisdiction & Authority', value: `${doc.jurisdiction} · ${doc.authority || 'Regulator'}` }] : []),
        ...(doc.information_authorised ? [{ key: 'infoAuth', label: 'Information Authorised', value: doc.information_authorised }] : []),
        { key: 'summary', label: 'Document Content & Operational Details', value: mainContentText },
      ];

  return {
    id: doc.id || docNum,
    documentName: title,
    documentNumber: docNum,
    recordId: doc.recordId || doc.id || `REC-${docNum}`,
    versionNumber: version,
    status,
    module: moduleName,
    category,
    owner,
    department: doc.department || 'Compliance, Quality & Document Control',
    createdDate,
    modifiedDate: doc.updated_date ? String(doc.updated_date).slice(0, 10) : createdDate,
    lastReviewDate: doc.reviewed_date || doc.lastReviewDate || createdDate,
    nextReviewDate: nextReview,
    reviewFrequency: doc.reviewFrequency || doc.review_schedule || '12-Monthly / As Scheduled',
    approvedBy: doc.approved_by || doc.approvedBy || owner,
    approvalDate: doc.approval_date || doc.approvalDate || createdDate,
    purpose:
      doc.purpose ||
      doc.description ||
      `Provide controlled governance, operational verification, and audit-ready evidence for "${title}" across ComplianceHR Infinity.`,
    scope:
      doc.scope ||
      `Applies to ${person || 'all authorised personnel and participants'} within ${moduleName} (${category}).`,
    relatedDocuments: doc.relatedDocuments || [
      'NDIS Practice Standards & Quality Indicators (Core Modules 1–4)',
      'Strengthened Aged Care Quality Standards & WHS Act',
      'CHR-DOC-098 Master 98-Document Control Register',
    ],
    mainFields: customMainFields,
    fullBodyText: mainContentText,
    evidenceItems: doc.evidenceItems || [
      `Filed in Document Vault & Compliance Hub (${category})`,
      `Related Subject / Person: ${person || 'Organisation-Wide'}`,
      `Status: ${status} · Next Review / Expiry: ${nextReview}`,
    ],
    actionsItems: doc.actionsItems || [
      'Retain controlled master copy in Document Vault & Company Safe',
      'Monitor automated 90 / 60 / 30 / 14-day review and expiry reminders',
    ],
    reviewer: doc.reviewer || owner,
    reviewOutcome: doc.review_outcome || doc.reviewOutcome || status,
    reviewNotes: doc.notes || doc.reviewNotes || mainContentText,
    approvalNotes:
      doc.approvalNotes ||
      `Verified and recorded by ${doc.approved_by || doc.approvedBy || owner} on ${createdDate}.`,
    rawDoc: doc,
  };
}

export async function openDocumentInViewer(doc = {}) {
  const controlled = buildControlledRecordFromDoc(doc);
  const resolvedUrl = await resolveDocumentUrl(doc);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('chr:open-document', {
        detail: {
          doc,
          controlled,
          resolvedUrl,
        },
      })
    );
  }
  return { controlled, resolvedUrl };
}

export function exportDocumentRecord(doc = {}, formatType = 'pdf') {
  const controlled = doc.documentNumber && doc.mainFields ? doc : buildControlledRecordFromDoc(doc);
  if (formatType === 'word') return exportControlledRecordAsWord(controlled);
  if (formatType === 'excel') return exportControlledRecordAsExcel(controlled);
  if (formatType === 'csv') return exportControlledRecordAsCsv(controlled);
  return exportControlledRecordAsPdf(controlled);
}