import { jsPDF } from 'jspdf';
import { drawFormHeader, drawSectionHeading, drawFieldRows, drawRegisterTable, drawSignatures, drawFormNotice, drawDeclaration } from '@/lib/formDocumentStyles';
import { drawDocumentFooter, loadCompanyBranding } from '@/lib/companyBranding';

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

const PURPOSES = {
  'NDIS Registration Certificate': 'Records the provider\'s current NDIS registration certificate, registration groups and conditions of registration as evidence for audits and funding bodies.',
  'NDIS Audit Report': 'Records the most recent NDIS Commission audit outcome, certification level and corrective actions as part of the provider\'s quality management system.',
  'Public Liability Insurance': 'Records the current public liability policy of currency, level of cover and exclusions held to protect participants, staff and the public.',
  'Professional Indemnity Insurance': 'Records the current professional indemnity policy of currency protecting the business against claims arising from professional advice or services.',
  'Workcover Insurance': 'Records the current workers compensation (WorkCover Qld) policy of currency and declared wages as required under state legislation.',
  'Fair Work Legislation': 'Records the Fair Work instruments the business operates under, including the National Employment Standards and applicable modern award obligations.',
  'Business Wage Award': 'Records the applicable modern award (e.g. Social, Community, Home Care and Disability Services Industry Award 2010) and classification pay points.',
  Qleave: 'Records the QLeave (contractor worker compensation) registration and levy lodgement status for engaged contractors.',
  'Superannuation Guarantee': 'Records the business\'s superannuation guarantee compliance, default fund choice and quarterly payment schedule.',
  'ABN Registration': 'Records the Australian Business Number registration details, entity structure and GST status held with the Australian Business Register.',
  'Other Insurances': 'Records any additional insurance policies held by the business, including vehicle fleet, property and management liability cover.',
  'Business Registration': 'Records ASIC business registration details, entity type and key registered contacts for governance records.',
  'Business Access Sites and Codes': 'Records restricted business access sites, alarm and security codes custody, and key-holder responsibilities.',
  'Other Documents': 'Records any other compliance or governance document held in the Company Safe.',
};

const FIELD_SETS = [
  {
    match: (docType) => docType.includes('Insurance'),
    fields: [
      { label: 'Insurance Type' },
      { label: 'Insurer / Underwriter' },
      { label: 'Policy Number' },
      { label: 'Policy Holder' },
      { label: 'Period of Cover (From)' },
      { label: 'Period of Cover (To)' },
      { label: 'Premium ($)' },
      { label: 'Level of Cover / Sum Insured' },
      { label: 'Inclusions' },
      { label: 'Exclusions / Endorsements' },
      { label: 'Certificate of Currency Reference' },
      { label: 'Broker / Adviser Contact' },
      { label: 'Renewal Reminder Date' },
    ],
  },
  {
    match: (docType) => /Registration|Audit Report|ABN/.test(docType),
    fields: [
      { label: 'Certificate / Registration Number' },
      { label: 'Issued / Registered By' },
      { label: 'Date Issued' },
      { label: 'Valid Until' },
      { label: 'Registration Groups / Scope Covered' },
      { label: 'Conditions or Endorsements' },
      { label: 'Audit Outcome / Certification Level' },
      { label: 'Corrective Actions Raised' },
      { label: 'Verification Link or Reference' },
    ],
  },
  {
    match: (docType) => /Legislation|Award|Qleave|Superannuation/.test(docType),
    fields: [
      { label: 'Legislation / Instrument Name' },
      { label: 'Instrument Number / Reference' },
      { label: 'Jurisdiction' },
      { label: 'Version or Date in Force' },
      { label: 'Summary of Obligations' },
      { label: 'Applies To (Roles or Teams)' },
      { label: 'Compliance Evidence Held' },
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
  { label: 'Version / Date in Force' },
  { label: 'Summary or Notes' },
];

const fieldsFor = (docType) => (FIELD_SETS.find((set) => set.match(docType)) || { fields: FIELDS_FALLBACK }).fields;

export async function downloadComplianceTemplatePdf(docType) {
  await loadCompanyBranding().catch(() => {});
  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' });
  const code = `CS-${String(COMPLIANCE_DOC_TYPES.indexOf(docType) + 1).padStart(3, '0')}`;

  let y = drawFormHeader(doc, {
    title: docType,
    code,
    subtitle: 'Company Safe Record Sheet - complete, attach and file in the Document Vault',
  });

  y = drawFormNotice(doc, y, { purpose: PURPOSES[docType] || '' });

  y = drawSectionHeading(doc, y, 'Record Details');
  y = drawFieldRows(doc, y, fieldsFor(docType));

  y = drawSectionHeading(doc, y, 'Renewal & Review Register');
  y = drawRegisterTable(doc, y, ['Version', 'Date Recorded', 'Reviewed By', 'Next Review', 'Status'], { rows: 8, rowH: 24 });

  y = drawDeclaration(doc, y);

  y = drawSignatures(doc, y, { left: 'Responsible Officer (Signature)', right: 'Date', heading: 'Verification' });

  drawDocumentFooter(doc, { title: docType, code });
  doc.save(`${docType} - Company Safe Template.pdf`);
}