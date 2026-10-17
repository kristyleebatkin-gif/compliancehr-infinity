import { jsPDF } from 'jspdf';
import { drawFormHeader, drawSectionHeading, drawFieldRows, drawRegisterTable, drawSignatures } from '@/lib/formDocumentStyles';
import { drawDocumentFooter } from '@/lib/companyBranding';

/**
 * Professional downloadable templates for the company safe's compliance and
 * business documents: every record type gets a branded record sheet with the
 * fields an auditor expects, a renewal register and an authorisation panel.
 */

export const COMPLIANCE_DOC_TYPES = [
  'NDIS Registration Certificate',
  'NDIS Audit Report',
  'Public Liability Insurance',
  'Professional Indemnity Insurance',
  'Workcover Insurance',
  'Fair Work Legislation',
  'Business Wage Award',
  'Qleave',
  'Superannuation Guarantee',
  'ABN Registration',
  'Other Insurances',
  'Business Registration',
  'Business Access Sites and Codes',
  'Other Documents',
];

const FIELD_SETS = [
  {
    match: (docType) => docType.includes('Insurance'),
    fields: [
      { label: 'Insurance Type' },
      { label: 'Insurer' },
      { label: 'Policy Number' },
      { label: 'Policy Holder' },
      { label: 'Period of Cover (From)' },
      { label: 'Period of Cover (To)' },
      { label: 'Premium ($)' },
      { label: 'Level of Cover / Inclusions' },
      { label: 'Certificate of Currency Reference' },
    ],
  },
  {
    match: (docType) => /Registration|Audit Report|ABN/.test(docType),
    fields: [
      { label: 'Certificate / Registration Number' },
      { label: 'Issued / Registered By' },
      { label: 'Date Issued' },
      { label: 'Valid Until' },
      { label: 'Related Provider Number' },
      { label: 'Conditions or Endorsements' },
      { label: 'Verification Link or Reference' },
    ],
  },
  {
    match: (docType) => /Legislation|Award|Qleave|Superannuation/.test(docType),
    fields: [
      { label: 'Legislation / Instrument Name' },
      { label: 'Jurisdiction' },
      { label: 'Version or Date in Force' },
      { label: 'Summary of Obligations' },
      { label: 'Applies To (Roles or Teams)' },
      { label: 'Review Frequency' },
      { label: 'Next Review Date' },
    ],
  },
];

const FIELDS_FALLBACK = [
  { label: 'Document Reference Number' },
  { label: 'Recorded With / Issued By' },
  { label: 'Date Recorded' },
  { label: 'Valid Until / Review Date' },
  { label: 'Responsible Officer' },
  { label: 'Summary or Notes' },
];

const fieldsFor = (docType) => (FIELD_SETS.find((set) => set.match(docType)) || { fields: FIELDS_FALLBACK }).fields;

export function downloadComplianceTemplatePdf(docType) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' });
  const code = `CS-${String(COMPLIANCE_DOC_TYPES.indexOf(docType) + 1).padStart(3, '0')}`;

  let y = drawFormHeader(doc, {
    title: docType,
    code,
    subtitle: 'Company Safe Record Sheet - complete, attach and file in the Document Vault',
  });

  y = drawSectionHeading(doc, y, 'Record Details');
  y = drawFieldRows(doc, y, fieldsFor(docType));

  y = drawSectionHeading(doc, y, 'Renewal & Review Register');
  y = drawRegisterTable(doc, y, ['Version', 'Date Recorded', 'Reviewed By', 'Next Review', 'Status'], { rows: 8, rowH: 24 });

  y = drawSignatures(doc, y, { left: 'Responsible Officer (Signature)', right: 'Date', heading: 'Verification' });

  drawDocumentFooter(doc, { title: docType, code });
  doc.save(`${docType} - Company Safe Template.pdf`);
}