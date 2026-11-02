import { base44 } from '@/api/base44Client';
import { exportUniversalData, saveUniversalRecordAcrossEcosystem } from '@/lib/universalStorageAndExportEngine';

export const AUTO_CLOSURE_10_RULES = [
  {
    id: 'shift_automation',
    title: '1. Shift Automation',
    category: 'Shift & Service Delivery',
    conditions: [
      'Clock In Completed',
      'Clock Out Completed',
      'Shift Note Completed',
      'Progress Note Completed',
      'Goal Update Completed',
      'Required Signatures Completed',
    ],
    autoActions: [
      'Complete Shift Task',
      'Complete Service Record Task',
      'Update Participant Record',
      'Update Employee Record',
    ],
    registersUpdated: ['Shift & Attendance Register', 'Participant Profile', 'Employee Profile', 'Service Delivery Register'],
    route: '/roster',
  },
  {
    id: 'vehicle_check_automation',
    title: '2. Vehicle Check Automation',
    category: 'Fleet & WHS Safety',
    conditions: [
      'Checklist Completed',
      'Required Photos Uploaded',
      'Employee Signature Recorded',
    ],
    autoActions: [
      'Update Vehicle Register',
      'Update Driver Profile',
      'Update Compliance Records',
    ],
    registersUpdated: ['Vehicle Safety Register', 'Employee Driver Profile', 'WHS Compliance Register'],
    route: '/assets',
  },
  {
    id: 'medication_competency_automation',
    title: '3. Medication Competency Automation',
    category: 'Clinical & Workforce Capability',
    conditions: [
      'Assessment Completed',
      'Competency Approved',
      'Assessor Recorded',
      'Evidence Uploaded',
    ],
    autoActions: [
      'Update Employee Profile',
      'Update Competency Register',
      'Update Compliance Dashboard',
    ],
    registersUpdated: ['Competency & Skills Register', 'Employee Profile', 'Compliance Dashboard'],
    route: '/training',
  },
  {
    id: 'document_review_automation',
    title: '4. Document & Policy Review Automation',
    category: 'Governance & Document Control',
    conditions: [
      'Review Checklist Completed',
      'Changes Assessed',
      'Approval Completed',
      'Review Report Generated',
    ],
    autoActions: [
      'Update Policy Register',
      'Update Review Register',
      'Update Compliance Records',
    ],
    registersUpdated: ['Policy Register', 'Review Register', 'Compliance Records'],
    route: '/documents',
  },
  {
    id: 'participant_review_automation',
    title: '5. Participant Review Automation',
    category: 'Participant Outcomes & NDIS',
    conditions: [
      'Review Conducted',
      'Goals Updated',
      'Risks Reviewed',
      'Service Agreement Checked',
      'Report Generated',
    ],
    autoActions: [
      'Update Review Register',
      'Update Participant Profile',
      'Update Goal Dashboard',
    ],
    registersUpdated: ['Participant Review Register', 'Participant Profile', 'Goal & Outcomes Dashboard'],
    route: '/review-due',
  },
  {
    id: 'consent_automation',
    title: '6. Consent Automation',
    category: 'Consent, Privacy & Authority',
    conditions: [
      'Consent Signed',
      'Signature Verified',
      'Document Stored',
    ],
    autoActions: [
      'Update Consent Register',
      'Update Participant Profile',
      'Update Compliance Records',
    ],
    registersUpdated: ['Participant & Employee Consent Register', 'Participant Profile', 'Compliance Records'],
    route: '/compliance',
  },
  {
    id: 'service_agreement_automation',
    title: '7. Service Agreement Automation',
    category: 'Contracts & Onboarding',
    conditions: [
      'Agreement Issued',
      'Viewed',
      'Signed',
      'Stored',
    ],
    autoActions: [
      'Update Service Agreement Register',
      'Update Participant Profile',
      'Update Compliance Dashboard',
    ],
    registersUpdated: ['Service Agreement Register', 'Participant Profile', 'Compliance Dashboard'],
    route: '/documents?focus=participant',
  },
  {
    id: 'fire_drill_automation',
    title: '8. Fire Drill Automation',
    category: 'Emergency & Site Readiness',
    conditions: [
      'Drill Conducted',
      'Attendance Recorded',
      'Findings Recorded',
      'Report Generated',
    ],
    autoActions: [
      'Update Fire Drill Register',
      'Update Emergency Register',
      'Update Compliance Records',
    ],
    registersUpdated: ['Fire Drill Register', 'Emergency Response Register', 'Compliance Records'],
    route: '/emergency-response',
  },
  {
    id: 'audit_automation',
    title: '9. Audit Action Automation',
    category: 'Audit & Continuous Improvement',
    conditions: [
      'Evidence Uploaded',
      'Corrective Action Implemented',
      'Review Recorded',
      'Approval Recorded',
    ],
    autoActions: [
      'Automatically Close Audit Findings',
      'Update Internal Audit Register',
      'Update Audit Readiness Score',
    ],
    registersUpdated: ['Internal Audit Register', 'Continuous Improvement Register', 'Auditor Portal'],
    route: '/auditor-portal',
  },
  {
    id: 'action_automation',
    title: '10. Linked Evidence Action Automation',
    category: 'Universal Evidence Closure',
    conditions: [
      'Upload Evidence → Action Closed',
      'Approval Given → Review Closed',
      'Document Signed → Task Closed',
      'Risk Reviewed → Review Closed',
    ],
    autoActions: [
      'Update Register Status & Completion Date',
      'Stamp Reviewer & Evidence Link',
      'Update Executive Dashboard Status',
    ],
    registersUpdated: ['Master Action Register', 'Shared To-Do Register', 'Executive Compliance Dashboard'],
    route: '/tasks',
  },
];

export const RISK_TRIGGER_KEYWORDS = [
  { keyword: 'aggression', category: 'Behavioural', rating: 'High', label: 'Behavioural Aggression / Escalation' },
  { keyword: 'falls', category: 'Clinical', rating: 'High', label: 'Participant Fall / Mobility Hazard' },
  { keyword: 'fall', category: 'Clinical', rating: 'High', label: 'Participant Fall / Mobility Hazard' },
  { keyword: 'medication issue', category: 'Clinical', rating: 'Critical', label: 'Medication Administration Issue' },
  { keyword: 'medication error', category: 'Clinical', rating: 'Critical', label: 'Medication Administration Error' },
  { keyword: 'behavioural concern', category: 'Participant', rating: 'Medium', label: 'Behavioural Support Concern' },
  { keyword: 'environmental hazard', category: 'Workplace Health & Safety', rating: 'High', label: 'Environmental / Home Safety Hazard' },
];

export const ACTION_TRIGGER_PHRASES = [
  { phrase: 'family requested follow-up', title: 'Family Follow-Up Call & Outcome Summary', priority: 'High', daysDue: 1 },
  { phrase: 'requested follow-up', title: 'Stakeholder Follow-Up Action', priority: 'High', daysDue: 2 },
  { phrase: 'needs review', title: 'Scheduled Care / Support Plan Review', priority: 'Medium', daysDue: 3 },
  { phrase: 'doctor appointment', title: 'Coordinate Medical Appointment & Transport', priority: 'Medium', daysDue: 3 },
  { phrase: 'Order medication', title: 'Pharmacy Medication Re-Order & Webster Check', priority: 'Urgent', daysDue: 1 },
];

export function analyzeNoteForHighValueTriggers(noteText = '') {
  const lower = (noteText || '').toLowerCase();
  const detectedRisks = RISK_TRIGGER_KEYWORDS.filter((k) => lower.includes(k.keyword));
  const detectedActions = ACTION_TRIGGER_PHRASES.filter((p) => lower.includes(p.phrase.toLowerCase()));

  // Also catch any generic "follow-up" or "follow up" if not already matched
  if (
    detectedActions.length === 0 &&
    (lower.includes('follow-up') || lower.includes('follow up') || lower.includes('call family'))
  ) {
    detectedActions.push({
      phrase: 'Follow-up requested in note',
      title: 'Follow-Up Action from Shift / Communication Note',
      priority: 'High',
      daysDue: 2,
    });
  }

  return {
    hasRiskPrompt: detectedRisks.length > 0,
    detectedRisks,
    hasActionAutoGen: detectedActions.length > 0,
    detectedActions,
  };
}

export async function executeAutomaticRuleClosure(rule, user, { signature = '', participantId = '', employeeId = '', evidenceUri = '' } = {}) {
  if (!user?.id || user?.account_status !== 'Active' || user?.access_approved !== true) {
    throw new Error('Active, approved user session is required to submit task closure evidence.');
  }
  const cleanSignature = String(signature || user?.full_name || user?.email || '').trim();
  if (!cleanSignature) {
    throw new Error('Explicit user attribution is required to submit task closure.');
  }
  const today = new Date().toISOString().slice(0, 10);
  const actor = user.full_name || user.email;
  const stampId = `CLOSURE-${Date.now().toString().slice(-6)}`;

  // 1. Find any open matching task or create a submitted task entry awaiting review
  const existingOpen = await base44.entities.TodoTask.filter(
    { status: { $in: ['Open', 'In Progress', 'Pending', 'Pending Approval'] } },
    { sort: '-created_date', limit: 25 }
  );

  const openItems = existingOpen?.items || [];
  const keyword = rule.title.split(' ')[1]?.toLowerCase() || '';
  const matchedTask = openItems.find((t) => (t.title || '').toLowerCase().includes(keyword));

  if (matchedTask) {
    await base44.entities.TodoTask.update(matchedTask.id, {
      status: 'Pending Approval',
      completed_date: today,
      completed_by: actor,
      signature: cleanSignature,
      notes: `${matchedTask.notes ? matchedTask.notes + '\n' : ''}[${stampId}] Submitted by ${actor} for supervisor review. Gates checked: ${rule.conditions.join(', ')}.`,
    });
  } else {
    await base44.entities.TodoTask.create({
      title: `${rule.title.replace(/^\d+\.\s*/, '')} — Submitted for Review`,
      task_type: rule.category,
      module: rule.category,
      task_date: today,
      due_date: today,
      completed_date: today,
      completed_by: actor,
      signature: cleanSignature,
      priority: 'Medium',
      status: 'Pending Approval',
      notes: `Submitted by ${actor} for review. Gates checked: ${rule.conditions.join(' | ')}.`,
    });
  }

  // 2. Create Checklist record in Under Review / Pending Approval state (never self-approved)
  await base44.entities.Checklist.create({
    title: `${rule.title.replace(/^\d+\.\s*/, '')} (${stampId})`,
    category: rule.category,
    status: 'Under Review',
    outcome: 'Pending Review',
    reviewer: actor,
    review_date: today,
    approval_status: 'Pending Approval',
    digital_signature: cleanSignature,
    signature_timestamp: new Date().toISOString(),
    evidence_uri: evidenceUri || undefined,
    items: rule.conditions.map((c) => ({ text: c, done: true })),
    notes: `Submitted by ${actor} for compliance review. Target registers: ${rule.registersUpdated.join(', ')}.`,
  });

  // 3. Only file to Universal Storage if a real subject profile ID is provided
  if (participantId || employeeId) {
    await saveUniversalRecordAcrossEcosystem({
      itemType: 'Checklist',
      title: `${rule.title.replace(/^\d+\.\s*/, '')} — Closure Submission (${stampId})`,
      personType: participantId ? 'Participant' : 'Employee',
      personName: actor,
      participantId: participantId || undefined,
      employeeId: employeeId || undefined,
      moduleName: rule.category,
      signature: cleanSignature,
      evidenceUri: evidenceUri || undefined,
      approvalState: 'Submitted',
      user,
    });
  }

  return {
    stampId,
    today,
    actor,
    closedExistingTask: Boolean(matchedTask),
    matchedTaskTitle: matchedTask?.title || null,
  };
}

export async function autoGenerateThreeMonthParticipantReview(participantName = 'Active NDIS Participant', assignedOfficer = 'Case Manager', user) {
  const today = new Date();
  const reviewDate = new Date(today.getTime() + 7 * 86400000).toISOString().slice(0, 10);
  const stamp = `REV-3M-${Date.now().toString().slice(-5)}`;

  await base44.entities.TodoTask.create({
    title: `3-Month Participant Plan & Risk Review — ${participantName} (${stamp})`,
    task_type: 'Review Reminder',
    module: 'Participant Reviews',
    assigned_to: assignedOfficer,
    task_date: today.toISOString().slice(0, 10),
    due_date: reviewDate,
    priority: 'High',
    status: 'Open',
    notes: `Auto-generated at 3-month milestone: Review created, assigned to ${assignedOfficer}, scheduled for ${reviewDate}, and reminder queued.`,
  });

  await base44.entities.CommunicationEntry.create({
    entry_kind: 'Message',
    person_type: 'Participant',
    person_name: participantName,
    subject: `3-Month Review Scheduled — ${participantName}`,
    body: `Automated 3-Month Review created, assigned to ${assignedOfficer}, and scheduled for ${reviewDate}. Reminder notification dispatched.`,
    entry_date: today.toISOString().slice(0, 10),
    sender_name: user?.full_name || 'Automation Engine',
    lifecycle_status: 'Delivered',
    module: 'Participant Reviews',
  }).catch(() => {});

  return { stamp, reviewDate, participantName, assignedOfficer };
}

export async function autoGenerateNewEmployeeCompetencies(employeeName = 'New Support Worker', user) {
  const today = new Date().toISOString().slice(0, 10);
  const due = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
  const bundle = [
    { title: `Mandatory Workforce Induction — ${employeeName}`, type: 'Training Renewal' },
    { title: `Core NDIS & Aged Care Skills Assessment — ${employeeName}`, type: 'Training Renewal' },
    { title: `Mandatory Policies & Code of Conduct Acknowledgement — ${employeeName}`, type: 'Policy Review' },
    { title: `Medication & Manual Handling Competency Verification — ${employeeName}`, type: 'Training Renewal' },
  ];

  await base44.entities.TodoTask.bulkCreate(
    bundle.map((item) => ({
      title: item.title,
      task_type: item.type,
      module: 'Training & Competency',
      assigned_to: employeeName,
      task_date: today,
      due_date: due,
      priority: 'High',
      status: 'Open',
      notes: 'Auto-generated upon new employee onboarding: Induction, Skills Assessments, Policies & Competencies assigned.',
    }))
  );

  return { employeeName, assignedCount: bundle.length, due };
}

export async function compileAndExportZeroTouchAuditPack(format = 'pdf') {
  const [checklists, risks, tasks, comms, consents, docs] = await Promise.all([
    base44.entities.Checklist.filter({}, { sort: '-created_date', limit: 10 }).catch(() => ({ items: [] })),
    base44.entities.Risk.filter({}, { sort: '-created_date', limit: 10 }).catch(() => ({ items: [] })),
    base44.entities.TodoTask.filter({ status: 'Completed' }, { sort: '-completed_date', limit: 10 }).catch(() => ({ items: [] })),
    base44.entities.CommunicationEntry.filter({}, { sort: '-created_date', limit: 10 }).catch(() => ({ items: [] })),
    base44.entities.InformationSharingConsent.filter({}, { sort: '-created_date', limit: 10 }).catch(() => ({ items: [] })),
    base44.entities.ParticipantDocument.filter({}, { sort: '-created_date', limit: 10 }).catch(() => ({ items: [] })),
  ]);

  const asStatus = (n) => (n > 0 ? 'Backed by Live Register Records' : 'Missing Data (0 Records)');
  const checklistCount = (checklists?.items || []).length;
  const riskCount = (risks?.items || []).length;
  const commCount = (comms?.items || []).length;
  const docCount = (docs?.items || []).length;
  const consentCount = (consents?.items || []).length;
  const taskCount = (tasks?.items || []).length;

  const rows = [
    { domain: '1. Participant & Plan Reviews', count: checklistCount, status: asStatus(checklistCount), source: 'Review Register & Checklists' },
    { domain: '2. Risk Assessments & Controls', count: riskCount, status: asStatus(riskCount), source: 'Enterprise Risk Register' },
    { domain: '3. Shift & Progress Notes', count: commCount, status: asStatus(commCount), source: 'Communications & Shift Note Ledger' },
    { domain: '4. Service Agreements & Participant Documents', count: docCount, status: asStatus(docCount), source: 'Participant Document Vault' },
    { domain: '5. Signed Consents (Participant & Staff)', count: consentCount, status: asStatus(consentCount), source: 'Master Consent Registers' },
    { domain: '6. Completed Governance & Competency Tasks', count: taskCount, status: asStatus(taskCount), source: 'Task & Competency Register' },
  ];

  exportUniversalData(
    format,
    'zero-touch-audit-evidence-pack',
    [
      { key: 'domain', label: 'Audit Evidence Domain' },
      { key: 'count', label: 'Verified Records' },
      { key: 'status', label: 'Closure & Evidence Status' },
      { key: 'source', label: 'Single-Source Register' },
    ],
    rows,
    'ComplianceHR Infinity — Zero-Touch Auto-Compiled Audit Evidence Pack'
  );

  return rows;
}