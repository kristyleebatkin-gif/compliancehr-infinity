import { jsPDF } from 'jspdf';
import { drawCompanyBranding, drawDocumentFooter } from '@/lib/companyBranding';

/**
 * Operational Plan section outline used for the blank template.
 */
export const OPERATIONAL_PLAN_SECTIONS = [
  'Executive Summary',
  'Operational Goals & Targets',
  'Service Delivery Model',
  'Staffing & Rostering',
  'Participant Intake & Onboarding',
  'Work Health & Safety',
  'Quality & Compliance Monitoring',
  'Risk & Incident Management',
  'Training & Workforce Development',
  'Asset & Resource Management',
  'Financial Operations & Budget',
  'Performance Monitoring & Reporting',
  'Continuous Improvement',
  'Review & Approval',
];

/**
 * Strategic Plan section outline used for the blank template.
 */
export const STRATEGIC_PLAN_SECTIONS = [
  'Executive Summary',
  'Vision, Mission & Values',
  'Strategic Goals',
  'SWOT Analysis',
  'Stakeholder & Community Engagement',
  'Service & Market Strategy',
  'Risk & Opportunity Analysis',
  'Resource & Capability Plan',
  'Quality & Compliance Alignment',
  'Implementation Roadmap',
  'Monitoring & Evaluation',
  'Review & Approval',
];

/**
 * Business Plan section outline used for the blank template.
 */
export const BUSINESS_PLAN_SECTIONS = [
  'Executive Summary',
  'Business Overview',
  'Vision, Mission & Values',
  'Goals & Objectives',
  'Market Analysis',
  'Services & Supports Offered',
  'Operational Plan',
  'Organisational Structure & Staffing',
  'Risk Management',
  'Financial Plan',
  'Quality & Compliance',
  'Continuous Improvement',
  'Review & Approval',
];

const drawPlanHeader = (doc, title, subtitle) => {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  let y = 54;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(91, 44, 131);
  drawCompanyBranding(doc, 40, y);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(130);
  doc.text('COMPLIANCE MANAGEMENT PLATFORM', 40, y + 14);
  y += 34;
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30);
  doc.text(title, 40, y);
  y += 16;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(110);
  doc.text(subtitle, 40, y);
  y += 14;
  doc.setDrawColor(210);
  doc.line(40, y, pageW - 40, y);
  y += 26;
  return { pageW, pageH, getY: () => y, setY: (v) => { y = v; } };
};

const drawPlanFields = (doc, ctx, headerFields) => {
  const { pageW } = ctx;
  ctx.setY(ctx.getY() + 0);
  let y = ctx.getY();
  doc.setFontSize(10);
  doc.setTextColor(40);
  for (const f of headerFields) {
    doc.setFont('helvetica', 'bold');
    doc.text(`${f}:`, 40, y);
    doc.setDrawColor(170);
    doc.line(200, y, pageW - 40, y);
    y += 28;
  }
  ctx.setY(y);
};

const drawPlanSections = (doc, ctx, sections) => {
  const { pageW, pageH } = ctx;
  let y = ctx.getY() + 8;
  for (const section of sections) {
    if (y > pageH - 80) { doc.addPage(); y = 54; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(91, 44, 131);
    doc.text(section, 40, y);
    y += 18;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(110);
    for (let i = 0; i < 5; i++) {
      doc.setDrawColor(220);
      doc.line(40, y, pageW - 40, y);
      y += 22;
    }
    y += 10;
  }
  ctx.setY(y);
};

const drawPlanSignature = (doc, ctx) => {
  const { pageW, pageH } = ctx;
  let y = ctx.getY();
  if (y > pageH - 80) { doc.addPage(); y = 54; }
  y += 10;
  doc.setDrawColor(170);
  doc.line(40, y, 250, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Authorised By (Signature)', 40, y + 13);
  doc.line(pageW - 250, y, pageW - 40, y);
  doc.text('Date', pageW - 250, y + 13);
};

/**
 * Generates and downloads a blank Business Plan template PDF.
 */
export function downloadBusinessPlanPdf() {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const ctx = drawPlanHeader(doc, 'Business Plan', 'Provider Strategic & Operational Planning Template');
  drawPlanFields(doc, ctx, ['Provider Name', 'ABN', 'NDIS Registration Number', 'Prepared By', 'Date Prepared', 'Review Date']);
  drawPlanSections(doc, ctx, BUSINESS_PLAN_SECTIONS);
  drawPlanSignature(doc, ctx);
  drawDocumentFooter(doc, { title: 'Business Plan' });
  doc.save('Business Plan.pdf');
}

/**
 * Generates and downloads a blank Strategic Plan template PDF.
 */
export function downloadStrategicPlanPdf() {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const ctx = drawPlanHeader(doc, 'Strategic Plan', 'Provider Long-Term Strategy & Direction Template');
  drawPlanFields(doc, ctx, ['Provider Name', 'ABN', 'NDIS Registration Number', 'Planning Period', 'Prepared By', 'Date Prepared', 'Review Date']);
  drawPlanSections(doc, ctx, STRATEGIC_PLAN_SECTIONS);
  drawPlanSignature(doc, ctx);
  drawDocumentFooter(doc, { title: 'Strategic Plan' });
  doc.save('Strategic Plan.pdf');
}

/**
 * Generates and downloads a blank Operational Plan template PDF.
 */
export function downloadOperationalPlanPdf() {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const ctx = drawPlanHeader(doc, 'Operational Plan', 'Provider Day-to-Day Operations & Delivery Template');
  drawPlanFields(doc, ctx, ['Provider Name', 'ABN', 'NDIS Registration Number', 'Reporting Period', 'Prepared By', 'Date Prepared', 'Review Date']);
  drawPlanSections(doc, ctx, OPERATIONAL_PLAN_SECTIONS);
  drawPlanSignature(doc, ctx);
  drawDocumentFooter(doc, { title: 'Operational Plan' });
  doc.save('Operational Plan.pdf');
}

const PLAN_TEMPLATES = {
  'Continuous Improvement Plan': {
    subtitle: 'Provider Continuous Improvement Framework Template',
    sections: [
      'Purpose & Scope',
      'Continuous Improvement Objectives',
      'Governance & Responsibilities',
      'Sources of Improvement (Feedback, Incidents, Audits, Reviews)',
      'Improvement Identification & Prioritisation',
      'Action Planning & Implementation',
      'Monitoring & Review',
      'Effectiveness Evaluation',
      'Communication & Staff Engagement',
      'Participant Impact Consideration',
      'Documentation & Record Keeping',
      'Review & Approval',
    ],
  },
  'Data Breach Response Plan': {
    subtitle: 'Provider Data Breach & Notification Response Template',
    sections: [
      'Purpose & Scope',
      'Data Breach Definition',
      'Roles & Responsibilities',
      'Breach Detection & Reporting',
      'Initial Assessment & Containment',
      'Notification (Participants, NDIS Commission, OAIC)',
      'Risk Assessment & Mitigation',
      'Investigation & Root Cause Analysis',
      'Corrective Actions',
      'Communication Strategy',
      'Record Keeping & Reporting',
      'Plan Review & Testing',
      'Review & Approval',
    ],
  },
  'Emergency and Disaster Management Plan': {
    subtitle: 'Provider Emergency & Disaster Preparedness Template',
    sections: [
      'Purpose & Scope',
      'Emergency & Disaster Definitions',
      'Roles & Responsibilities',
      'Risk Assessment & Potential Scenarios',
      'Prevention & Mitigation Measures',
      'Preparedness (Equipment, Training, Drills)',
      'Response Procedures (Fire, Flood, Medical, Natural Disaster)',
      'Evacuation & Shelter Procedures',
      'Communication & Coordination with Emergency Services',
      'Participant Support & Welfare',
      'Recovery & Business Continuity',
      'Plan Review & Testing',
      'Review & Approval',
    ],
  },
  'COVID-19 Management Plan': {
    subtitle: 'Provider COVID-19 Infection Prevention & Control Template',
    sections: [
      'Purpose & Scope',
      'COVID-19 Risk Assessment',
      'Infection Prevention & Control Measures',
      'Vaccination & Worker Screening',
      'PPE Requirements',
      'Participant & Staff Hygiene Practices',
      'Isolation & Outbreak Management',
      'Staffing & Rostering Contingency',
      'Participant Support During Isolation',
      'Communication & Reporting',
      'Cleaning & Environmental Hygiene',
      'Plan Review & Update',
      'Review & Approval',
    ],
  },
  'Waste Management Plan': {
    subtitle: 'Provider Clinical & General Waste Handling Template',
    sections: [
      'Purpose & Scope',
      'Waste Categories & Definitions',
      'Roles & Responsibilities',
      'Waste Segregation & Colour Coding',
      'Clinical & Sharps Waste Handling',
      'General Waste Handling',
      'Storage & Labelling Requirements',
      'Collection, Transport & Disposal',
      'PPE & Staff Hygiene',
      'Participant Safety & Community Standards',
      'Spill & Incident Management',
      'Training & Competency',
      'Record Keeping & Auditing',
      'Review & Approval',
    ],
  },
  'Staff Training Plan': {
    subtitle: 'Provider Workforce Training & Development Template',
    sections: [
      'Purpose & Scope',
      'Training Policy & Objectives',
      'Roles & Responsibilities',
      'Mandatory & Statutory Training Requirements',
      'NDIS Worker Orientation & Code of Conduct',
      'Clinical & Specialist Competencies',
      'First Aid, CPR & Emergency Response',
      'Manual Handling & Infection Control',
      'Participant-Specific Training',
      'Onboarding & Induction',
      'Refresher & Recurring Training Schedule',
      'Competency Assessment & Verification',
      'Record Keeping & Compliance Tracking',
      'Training Evaluation & Improvement',
      'Review & Approval',
    ],
  },
  'Data Backup Plan': {
    subtitle: 'Provider Data Backup & Recovery Template',
    sections: [
      'Purpose & Scope',
      'Data Backup Policy & Objectives',
      'Roles & Responsibilities',
      'Data Classification & Criticality',
      'Backup Scope & Coverage',
      'Backup Schedule & Frequency',
      'Backup Methods & Storage Locations',
      'Encryption & Security Controls',
      'Retention & Deletion Policy',
      'Recovery Objectives (RTO & RPO)',
      'Restoration & Testing Procedures',
      'Vendor & Cloud Provider Arrangements',
      'Incident Response & Failure Handling',
      'Record Keeping & Auditing',
      'Review & Approval',
    ],
  },
  'Business Continuity Plan': {
    subtitle: 'Provider Business Continuity & Recovery Template',
    sections: [
      'Purpose & Scope',
      'Business Impact Analysis',
      'Critical Functions & Priorities',
      'Roles & Responsibilities',
      'Risk Scenarios & Disruptions',
      'Continuity Strategies & Workarounds',
      'IT & Data Recovery',
      'Alternate Work Arrangements',
      'Communication Plan (Staff, Participants, Stakeholders)',
      'Resource & Supplier Dependencies',
      'Recovery & Restoration',
      'Plan Testing & Maintenance',
      'Review & Approval',
    ],
  },
};

export const BUSINESS_PLAN_TEMPLATES = Object.keys(PLAN_TEMPLATES);

export function downloadPlanTemplatePdf(planName) {
  const tpl = PLAN_TEMPLATES[planName];
  if (!tpl) return;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const ctx = drawPlanHeader(doc, planName, tpl.subtitle);
  drawPlanFields(doc, ctx, ['Provider Name', 'ABN', 'NDIS Registration Number', 'Prepared By', 'Date Prepared', 'Review Date']);
  drawPlanSections(doc, ctx, tpl.sections);
  drawPlanSignature(doc, ctx);
  drawDocumentFooter(doc, { title: planName });
  doc.save(`${planName}.pdf`);
}

const REGISTER_TEMPLATES = {
  'Human Resource Register': {
    subtitle: 'Provider Workforce & Personnel Record Template',
    columns: ['Employee Name', 'Role / Position', 'Start Date', 'Employment Type', 'NDIS Worker Screen Expiry', 'Qualifications', 'Training Status', 'Next Review Date', 'Notes'],
  },
  'Risk Assessed Role Register': {
    subtitle: 'Provider Role Risk Assessment Register Template',
    columns: ['Role / Position', 'Risk Level', 'Assessment Date', 'Assessed By', 'Screening Required', 'Controls in Place', 'Review Date', 'Status', 'Notes'],
  },
  'Asset Register': {
    subtitle: 'Provider Asset & Equipment Tracking Template',
    columns: ['Asset ID', 'Asset Description', 'Category', 'Make / Model', 'Serial Number', 'Location', 'Assigned To', 'Condition', 'Purchase Date', 'Value', 'Next Inspection', 'Status'],
  },
  'Asset Maintenance Record': {
    subtitle: 'Provider Asset Maintenance and Repair Record',
    columns: ['Date', 'Asset ID', 'Asset Name', 'Maintenance Required', 'Action Taken', 'Completed By', 'Cost', 'Next Maintenance', 'Full Name', 'Signature'],
  },
  'Asset Disposal Register': {
    subtitle: 'Provider Asset Disposal and Approval Register',
    columns: ['Asset ID', 'Asset Description', 'Disposal Date', 'Reason', 'Disposal Method', 'Approved By', 'Evidence', 'Full Name', 'Signature', 'Notes'],
  },
  'Asset Compliance Review Register': {
    subtitle: 'Provider Asset Register Compliance Review Template',
    columns: ['Review Date', 'Reviewed By', 'Register Status', 'Actions Required', 'Responsible Person', 'Due Date', 'Completion Date', 'Full Name', 'Signature', 'Notes'],
  },
  'Continuous Improvement Register': {
    subtitle: 'Provider Improvement Action Tracking Template',
    columns: ['Improvement ID', 'Date Identified', 'Source', 'Issue / Opportunity', 'Priority', 'Owner', 'Action Required', 'Target Date', 'Status', 'Outcome'],
  },
  'Internal Audit Register': {
    subtitle: 'Provider Internal Audit Planning and Findings Register',
    columns: ['Audit ID', 'Category', 'Register / File Audited', 'Frequency', 'Scheduled Date', 'Auditor', 'Findings', 'Risk Rating', 'Corrective Action', 'Owner', 'Due Date', 'Status'],
  },
  'Audit Readiness Report': {
    subtitle: 'Provider Audit Readiness Assessment Template',
    columns: ['Audit Date', 'Status', 'Readiness Score', 'Participant Files', 'Staff Files', 'Training', 'Policies', 'Incidents', 'Risk', 'Generated By', 'Findings', 'Signature'],
  },
  'Participant Folder Audit Register': {
    subtitle: 'Participant File Audit Cycle and Findings Register',
    columns: ['Participant ID', 'Participant Name', 'Audit Interval', 'Last Audit', 'Next Due', 'Status', 'Auditor', 'Findings', 'Action Required', 'Full Name', 'Signature'],
  },
  'Staff Training Audit Register': {
    subtitle: 'Staff Training Compliance Audit Register',
    columns: ['Employee ID', 'Employee Name', 'Audit Type', 'Last Audit', 'Next Due', 'Status', 'Reviewer', 'Training Gaps', 'Action Required', 'Full Name', 'Signature'],
  },
  'Performance Review Schedule Register': {
    subtitle: 'Staff Performance Review Schedule and Outcome Register',
    columns: ['Employee ID', 'Employee Name', 'Position', 'Last Review', 'Next Review', 'Reviewer', 'Status', 'Outcome', 'Development Actions', 'Full Name', 'Signature'],
  },
  'Fire Drill Form': {
    subtitle: 'Emergency Fire Drill Attendance and Evaluation Form',
    columns: ['Drill Date', 'Start Time', 'Location', 'Conducted By', 'Participants', 'Evacuation Time', 'Issues Identified', 'Corrective Actions', 'Next Drill', 'Full Name', 'Signature'],
  },
  'Emergency Drill Schedule Register': {
    subtitle: 'Provider Emergency Drill Schedule and Findings Register',
    columns: ['Drill Type', 'Last Drill', 'Next Due', 'Status', 'Conducted By', 'Participants', 'Location', 'Findings', 'Corrective Actions', 'Full Name', 'Signature'],
  },
  'NDIS Registration Audit Due Register': {
    subtitle: 'NDIS Registration, Audit and Certification Deadline Register',
    columns: ['Deadline ID', 'Requirement', 'Deadline Type', 'Due Date', 'Priority', 'Status', 'Owner', 'Evidence Required', 'Completion Date', 'Full Name', 'Signature'],
  },
  'Legal Requirements Register': {
    subtitle: 'Provider Legal & Compliance Obligations Template',
    columns: ['Requirement', 'Source / Authority', 'Applicable To', 'Owner', 'Last Reviewed', 'Next Review', 'Status', 'Evidence', 'Notes'],
  },
  'Document Control Register': {
    subtitle: 'Provider Document Version Control Template',
    columns: ['Document Title', 'Document ID', 'Version', 'Owner', 'Approval Date', 'Review Date', 'Status', 'Distribution', 'Notes'],
  },
  'Risk Register': {
    subtitle: 'Provider Risk Identification & Treatment Template',
    columns: ['Risk ID', 'Risk Description', 'Category', 'Likelihood', 'Consequence', 'Risk Rating', 'Controls', 'Treatment Action', 'Owner', 'Review Date', 'Status'],
  },
  'Legislative Control Register': {
    subtitle: 'Provider Legislative Compliance Control Template',
    columns: ['Legislation / Act', 'Section', 'Obligation', 'Control Measure', 'Owner', 'Evidence', 'Last Reviewed', 'Next Review', 'Status', 'Notes'],
  },
  'Feedback and Complaints Register': {
    subtitle: 'Provider Feedback & Complaints Tracking Template',
    columns: ['Entry ID', 'Date Received', 'Source', 'Type', 'Complainant', 'Description', 'Assigned To', 'Target Resolution', 'Status', 'Resolution'],
  },
  'Incident Register': {
    subtitle: 'Provider Incident Logging & Tracking Template',
    columns: ['Incident ID', 'Date', 'Time', 'Reported By', 'Participant / Staff', 'Incident Type', 'Description', 'Severity', 'Action Taken', 'Follow-up', 'Status'],
  },
  'Chemical Register': {
    subtitle: 'Provider Chemical & Hazardous Substance Register Template',
    columns: ['Chemical Name', 'Supplier', 'SDS Location', 'Quantity', 'Location Stored', 'Risk Level', 'Date Added', 'Disposal Date', 'Status'],
  },
  'Conflict of Interest Register': {
    subtitle: 'Provider Conflict of Interest Declaration Template',
    columns: ['Entry ID', 'Date Declared', 'Person', 'Role', 'Nature of Conflict', 'Related Party', 'Management Plan', 'Declared To', 'Status', 'Review Date'],
  },
  'Service Delivery Register': {
    subtitle: 'Provider Service Delivery Tracking Template',
    columns: ['Entry ID', 'Date', 'Participant', 'Service Type', 'Staff Member', 'Hours', 'Shift Time', 'Location', 'Outcome', 'Notes', 'Status'],
  },
  'Delegation of Authority Register': {
    subtitle: 'Provider Delegation & Authorisation Template',
    columns: ['Delegation ID', 'Authority Delegated', 'Delegated To', 'Role', 'Delegated By', 'Scope / Limits', 'Effective Date', 'Expiry Date', 'Conditions', 'Status'],
  },
};

export const BUSINESS_REGISTER_TEMPLATES = Object.keys(REGISTER_TEMPLATES);

export function downloadRegisterTemplatePdf(registerName) {
  const tpl = REGISTER_TEMPLATES[registerName];
  if (!tpl) return;
  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'landscape' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  let y = 40;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(91, 44, 131);
  drawCompanyBranding(doc, 28, y, { fontSize: 14 });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(130);
  doc.text('COMPLIANCE MANAGEMENT PLATFORM', 28, y + 12);
  y += 26;

  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30);
  doc.text(registerName, 28, y);
  y += 12;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(110);
  doc.text(tpl.subtitle, 28, y);
  y += 10;
  doc.setDrawColor(210);
  doc.line(28, y, pageW - 28, y);
  y += 18;

  const cols = tpl.columns;
  const colCount = cols.length;
  const tableW = pageW - 56;
  const colW = tableW / colCount;
  const rowH = 26;
  let fieldIndex = 0;
  const fieldPrefix = registerName.replace(/[^a-zA-Z0-9]+/g, '_');

  const addCellField = (x, fieldY, width) => {
    const field = new doc.AcroForm.TextField();
    field.fieldName = `${fieldPrefix}_cell_${fieldIndex++}`;
    field.x = x + 2;
    field.y = fieldY + 2;
    field.width = width - 4;
    field.height = rowH - 4;
    field.fontSize = 6.5;
    doc.addField(field);
  };

  const drawHeader = () => {
    doc.setFillColor(91, 44, 131);
    doc.rect(28, y, tableW, rowH, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255);
    cols.forEach((c, i) => {
      const lines = doc.splitTextToSize(c, colW - 6);
      doc.text(lines, 28 + i * colW + 3, y + 9);
    });
    y += rowH;
  };

  const drawRows = (count) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(60);
    for (let r = 0; r < count; r++) {
      if (y > pageH - rowH - 30) {
        doc.addPage();
        y = 40;
        drawHeader();
      }
      doc.setDrawColor(220);
      doc.rect(28, y, tableW, rowH, 'S');
      for (let i = 0; i < colCount; i++) {
        doc.line(28 + i * colW, y, 28 + i * colW, y + rowH);
        addCellField(28 + i * colW, y, colW);
      }
      y += rowH;
    }
  };

  drawHeader();
  drawRows(18);

  y += 14;
  drawDocumentFooter(doc, { title: registerName, margin: 28 });

  doc.save(`${registerName}.pdf`);
}

/**
 * Policies & Procedures Manual - extracted list.
 */
export const POLICY_MANUAL = 'NDIS Policy & Procedure Manual';

export const POLICY_VOLUMES = [
  { id: 1, title: 'Volume 1 - Governance & Participant Rights', range: 'CM-POL-001 - CM-POL-010' },
  { id: 2, title: 'Volume 2 - Complaints, Incidents & Service Delivery', range: 'CM-POL-011 - CM-POL-020' },
  { id: 3, title: 'Volume 3 - Safe Supports & Participant Management', range: 'CM-POL-021 - CM-POL-027' },
];

export const POLICY_TEMPLATES = [
  { code: 'CM-POL-001', volume: 1, title: 'Rights and Responsibilities Policy and Procedure' },
  { code: 'CM-POL-002', volume: 1, title: 'Individual Values and Beliefs Policy and Procedure' },
  { code: 'CM-POL-003', volume: 1, title: 'Privacy and Confidentiality Policy and Procedure' },
  { code: 'CM-POL-004', volume: 1, title: 'Independence and Informed Choice Policy and Procedure' },
  { code: 'CM-POL-005', volume: 1, title: 'Freedom from Violence, Abuse, Neglect, Exploitation and Discrimination Policy and Procedure' },
  { code: 'CM-POL-006', volume: 1, title: 'Governance and Operational Management Policy and Procedure' },
  { code: 'CM-POL-007', volume: 1, title: 'Conflict of Interest Policy and Procedure' },
  { code: 'CM-POL-008', volume: 1, title: 'Risk Management Policy and Procedure' },
  { code: 'CM-POL-009', volume: 1, title: 'Quality Management Policy and Procedure' },
  { code: 'CM-POL-010', volume: 1, title: 'Information Management Policy and Procedure' },
  { code: 'CM-POL-011', volume: 2, title: 'Feedback and Complaints Management Policy and Procedure' },
  { code: 'CM-POL-012', volume: 2, title: 'Incident Management Policy and Procedure' },
  { code: 'CM-POL-013', volume: 2, title: 'Human Resource Management Policy and Procedure' },
  { code: 'CM-POL-014', volume: 2, title: 'Emergency and Disaster Management Policy and Procedure' },
  { code: 'CM-POL-015', volume: 2, title: 'Continuity of Supports Policy and Procedure' },
  { code: 'CM-POL-016', volume: 2, title: 'Access to Supports Policy and Procedure' },
  { code: 'CM-POL-017', volume: 2, title: 'Support Planning Policy and Procedure' },
  { code: 'CM-POL-018', volume: 2, title: 'Service Agreements with Participants Policy and Procedure' },
  { code: 'CM-POL-019', volume: 2, title: 'Responsive Support Provision Policy and Procedure' },
  { code: 'CM-POL-020', volume: 2, title: 'Transition to or From a Provider Policy and Procedure' },
  { code: 'CM-POL-021', volume: 3, title: 'Safe Environment Policy and Procedure' },
  { code: 'CM-POL-022', volume: 3, title: 'Infection Prevention and Control Policy and Procedure' },
  { code: 'CM-POL-023', volume: 3, title: 'Participant Money and Property Policy and Procedure' },
  { code: 'CM-POL-024', volume: 3, title: 'Mealtime Management Policy and Procedure' },
  { code: 'CM-POL-025', volume: 3, title: 'Personal Support Policy and Procedure' },
  { code: 'CM-POL-026', volume: 3, title: 'Medication Management Policy and Procedure' },
  { code: 'CM-POL-027', volume: 3, title: 'Waste Management Policy and Procedure' },
];

const POLICY_SECTIONS = [
  '1. Purpose',
  '2. Scope',
  '3. Policy Statement',
  '4. Definitions',
  '5. Procedure',
  '6. Roles and Responsibilities',
  '7. Related Documents & Legislation',
  '8. Monitoring and Review',
];

export function downloadPolicyTemplatePdf(policy) {
  const { code, title, volume } = policy;
  const vol = POLICY_VOLUMES.find((v) => v.id === volume) || {};
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  let y = 54;

  // Brand header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(91, 44, 131);
  drawCompanyBranding(doc, 40, y);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(130);
  doc.text(POLICY_MANUAL, 40, y + 14);
  if (vol.title) {
    doc.setFontSize(8);
    doc.setTextColor(0, 166, 166);
    doc.text(vol.title, 40, y + 26);
  }
  y += vol.title ? 44 : 34;

  // Title block
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30);
  doc.text(code, 40, y);
  y += 18;
  doc.setFontSize(13);
  const titleLines = doc.splitTextToSize(title, pageW - 80);
  doc.text(titleLines, 40, y);
  y += titleLines.length * 16 + 6;
  doc.setDrawColor(210);
  doc.line(40, y, pageW - 40, y);
  y += 22;

  // Policy detail fields
  doc.setFontSize(10);
  doc.setTextColor(40);
  const detailFields = ['Policy ID', 'Version', 'Effective Date', 'Review Date', 'Policy Owner', 'Approved By'];
  for (const f of detailFields) {
    doc.setFont('helvetica', 'bold');
    doc.text(`${f}:`, 40, y);
    doc.setDrawColor(170);
    doc.line(180, y, pageW - 40, y);
    y += 26;
  }

  // Section outlines
  y += 6;
  for (const section of POLICY_SECTIONS) {
    if (y > pageH - 90) {
      doc.addPage();
      y = 54;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(91, 44, 131);
    doc.text(section, 40, y);
    y += 18;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(110);
    for (let i = 0; i < 5; i++) {
      doc.setDrawColor(220);
      doc.line(40, y, pageW - 40, y);
      y += 22;
    }
    y += 10;
  }

  // Approval block
  if (y > pageH - 90) {
    doc.addPage();
    y = 54;
  }
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(91, 44, 131);
  doc.text('9. Approval', 40, y);
  y += 18;
  doc.setDrawColor(170);
  doc.line(40, y, 260, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(110);
  doc.text('Authorised By (Signature)', 40, y + 13);
  doc.line(pageW - 260, y, pageW - 40, y);
  doc.text('Date', pageW - 260, y + 13);

  // Footer
  drawDocumentFooter(doc, {
    title: `${POLICY_MANUAL}${vol.title ? ` | ${vol.title}` : ''}`,
    code,
  });

  doc.save(`${title}.pdf`);
}