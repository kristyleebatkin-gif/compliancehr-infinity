// Workflow Studio reference data and helpers: the node library, the twelve workflow
// states, the enterprise templates and the graph validator the designer runs before
// a definition can be published.
//
// Everything here is descriptive. Execution happens in the workflowRuntime backend
// function, which re-validates the graph and is the only writer of instances.

export const NODE_CATEGORIES = ['Core', 'Compliance', 'Audit', 'Evidence', 'Governance', 'AI', 'Advanced'];

export const NODE_LIBRARY = [
  { type: 'START', label: 'Start', category: 'Core', human: false, description: 'Entry point. Exactly one per workflow.' },
  { type: 'END', label: 'End', category: 'Core', human: false, description: 'Closes the run and records the outcome.' },
  { type: 'TASK', label: 'Task', category: 'Core', human: true, description: 'Work assigned to a role, with its own SLA.' },
  { type: 'FORM', label: 'Form', category: 'Core', human: true, description: 'Structured data capture before the run continues.' },
  { type: 'DECISION', label: 'Decision', category: 'Core', human: true, description: 'Branches on approve or reject.' },
  { type: 'WAIT', label: 'Wait', category: 'Core', human: false, description: 'Holds the run for a fixed period.' },
  { type: 'NOTIFICATION', label: 'Notification', category: 'Core', human: false, description: 'Alerts the assigned role and continues.' },

  { type: 'COMPLIANCE_REVIEW', label: 'Compliance review', category: 'Compliance', human: true, description: 'Reviews the run against its mapped obligations.' },
  { type: 'OBLIGATION_CHECK', label: 'Obligation check', category: 'Compliance', human: false, description: 'Confirms the obligation register covers this process.' },
  { type: 'CONTROL_CHECK', label: 'Control check', category: 'Compliance', human: false, description: 'Confirms a register control is in force.' },
  { type: 'STANDARD_CHECK', label: 'Standard check', category: 'Compliance', human: false, description: 'Confirms the mapped standard is active.' },

  { type: 'AUDIT_REVIEW', label: 'Audit review', category: 'Audit', human: true, description: 'Auditor assessment of the evidence held.' },
  { type: 'FINDING_REVIEW', label: 'Finding review', category: 'Audit', human: true, description: 'Rates and records a finding.' },
  { type: 'CORRECTIVE_ACTION', label: 'Corrective action', category: 'Audit', human: true, description: 'Owns the fix through to verification.' },
  { type: 'AUDIT_SIGNOFF', label: 'Audit sign-off', category: 'Audit', human: true, description: 'Closes the audit with an accountable signature.' },

  { type: 'EVIDENCE_REQUEST', label: 'Evidence request', category: 'Evidence', human: true, description: 'Asks the accountable role for evidence.' },
  { type: 'EVIDENCE_UPLOAD', label: 'Evidence upload', category: 'Evidence', human: true, description: 'Records the evidence that proves the step happened.' },
  { type: 'EVIDENCE_VALIDATION', label: 'Evidence validation', category: 'Evidence', human: false, description: 'Checks currency and confidence before scoring.' },

  { type: 'APPROVAL', label: 'Approval', category: 'Governance', human: true, description: 'Single accountable approval.' },
  { type: 'CEO_APPROVAL', label: 'CEO approval', category: 'Governance', human: true, description: 'Chief executive sign-off.' },
  { type: 'EXECUTIVE_APPROVAL', label: 'Executive approval', category: 'Governance', human: true, description: 'Executive group sign-off.' },
  { type: 'BOARD_APPROVAL', label: 'Board approval', category: 'Governance', human: true, description: 'Board resolution, recorded with the decision.' },

  { type: 'AI_REVIEW', label: 'AI review', category: 'AI', human: false, description: 'Governed AI assessment, logged to the AI audit trail.' },
  { type: 'AI_COMPLIANCE_REVIEW', label: 'AI compliance review', category: 'AI', human: false, description: 'Checks the run against mapped standards.' },
  { type: 'AI_RISK_SCORE', label: 'AI risk score', category: 'AI', human: false, description: 'Scores inherent and residual risk for the run.' },
  { type: 'AI_GAP_ANALYSIS', label: 'AI gap analysis', category: 'AI', human: false, description: 'Names what is missing before closure.' },
  { type: 'AI_RECOMMENDATION', label: 'AI recommendation', category: 'AI', human: false, description: 'Drafts a recommendation for human review.' },

  { type: 'SUB_WORKFLOW', label: 'Sub-workflow', category: 'Advanced', human: false, description: 'Calls another published workflow.' },
  { type: 'API_CALL', label: 'API call', category: 'Advanced', human: false, description: 'Records an outbound integration step.' },
  { type: 'WEBHOOK', label: 'Webhook', category: 'Advanced', human: false, description: 'Notifies an external system.' },
  { type: 'ESCALATION', label: 'Escalation', category: 'Advanced', human: true, description: 'Raises the run to a more senior role.' },
  { type: 'SLA_CHECK', label: 'SLA check', category: 'Advanced', human: false, description: 'Evaluates the clock against the target.' },
  { type: 'DOCUMENT_REQUEST', label: 'Document request', category: 'Advanced', human: true, description: 'Requests a controlled document.' },
];

export const NODE_META = Object.fromEntries(NODE_LIBRARY.map((node) => [node.type, node]));

export const WORKFLOW_STATES = ['Draft', 'Validated', 'Published', 'Ready', 'Running', 'Waiting', 'Paused', 'Escalated', 'Completed', 'Failed', 'Cancelled', 'Archived'];

export const INSTANCE_STATES = {
  Running: 'border-brand/40 bg-brand/10 text-brand',
  Waiting: 'border-warning/40 bg-warning/15 text-warning',
  Paused: 'border-border bg-muted text-foreground',
  Escalated: 'border-accent/40 bg-accent/10 text-accent',
  Completed: 'border-safe/40 bg-safe/10 text-safe',
  Failed: 'border-danger/50 bg-danger/15 text-danger',
  Cancelled: 'border-border bg-muted text-muted-foreground',
};

export const SLA_STATES = {
  'On track': 'border-safe/40 bg-safe/10 text-safe',
  'Due soon': 'border-warning/50 bg-warning/20 text-warning',
  Breached: 'border-danger/50 bg-danger/15 text-danger',
  Closed: 'border-border bg-muted text-muted-foreground',
};

export const node = (id, type, label, options = {}) => ({
  id,
  type,
  label,
  role: options.role || '',
  next: options.next || '',
  yes_next: options.yes || '',
  no_next: options.no || '',
  sla_hours: options.sla || 0,
  instruction: options.instruction || '',
});

export const WORKFLOW_TEMPLATES = [
  {
    code: 'TPL-01',
    name: 'NDIS incident management',
    workflow_type: 'Incident Management',
    domain: 'NDIS OS',
    sla_hours: 72,
    owner_role: 'Compliance Manager',
    standards: 'NDIS Core 2, NDIS Core 3.3',
    evidence: 'EVD-231 Incident report, EVD-236 Corrective action record',
    description: 'Reportable incident from notification through investigation, evidence, corrective action and compliance sign-off.',
    nodes: [
      node('start', 'START', 'Incident raised', { next: 'notify' }),
      node('notify', 'NOTIFICATION', 'Notify compliance and team leader', { next: 'triage' }),
      node('triage', 'TASK', 'Triage and risk rate the incident', { role: 'Team Leader', sla: 4, next: 'evidence' }),
      node('evidence', 'EVIDENCE_UPLOAD', 'Upload the incident record and any witness statements', { role: 'Team Leader', sla: 24, next: 'decide' }),
      node('decide', 'DECISION', 'Is the incident reportable?', { role: 'Compliance Manager', sla: 24, yes: 'investigate', no: 'close' }),
      node('investigate', 'TASK', 'Investigate and record the root cause', { role: 'Compliance Manager', sla: 48, next: 'risk' }),
      node('risk', 'AI_RISK_SCORE', 'Score inherent and residual risk', { next: 'capa' }),
      node('capa', 'CORRECTIVE_ACTION', 'Deliver the corrective action', { role: 'Quality & Improvement Manager', sla: 72, next: 'approve' }),
      node('approve', 'APPROVAL', 'Compliance sign-off', { role: 'Compliance Manager', sla: 24, next: 'close' }),
      node('close', 'END', 'Incident closed'),
    ],
  },
  {
    code: 'TPL-02',
    name: 'Complaints management',
    workflow_type: 'Complaints Management',
    domain: 'Quality OS',
    sla_hours: 120,
    owner_role: 'Compliance Manager',
    standards: 'NDIS Core 2.1, ACQS 6',
    evidence: 'EVD-005 Complaint record, EVD-006 Complaint outcome letter',
    description: 'Acknowledges, investigates and resolves a complaint with the outcome communicated and evidence held.',
    nodes: [
      node('start', 'START', 'Complaint received', { next: 'ack' }),
      node('ack', 'TASK', 'Acknowledge the complaint within one business day', { role: 'Administration', sla: 8, next: 'review' }),
      node('review', 'DECISION', 'Does this need a formal investigation?', { role: 'Compliance Manager', sla: 24, yes: 'investigate', no: 'respond' }),
      node('investigate', 'TASK', 'Investigate and gather evidence', { role: 'Compliance Manager', sla: 72, next: 'evidence' }),
      node('evidence', 'EVIDENCE_UPLOAD', 'Record the investigation evidence', { role: 'Compliance Manager', sla: 24, next: 'respond' }),
      node('respond', 'APPROVAL', 'Approve the written response', { role: 'General Manager', sla: 24, next: 'outcome' }),
      node('outcome', 'NOTIFICATION', 'Send the outcome to the complainant', { next: 'close' }),
      node('close', 'END', 'Complaint closed'),
    ],
  },
  {
    code: 'TPL-03',
    name: 'Restrictive practice authorisation',
    workflow_type: 'Restrictive Practices',
    domain: 'Clinical Governance OS',
    sla_hours: 168,
    owner_role: 'Clinical Governance Lead',
    standards: 'NDIS Core 2.4, ACQS 5',
    evidence: 'EVD-143 Restrictive practice authorisation, EVD-012 Behaviour support plan',
    description: 'Authorises a restrictive practice only with a current behaviour support plan, evidence and executive sign-off.',
    nodes: [
      node('start', 'START', 'Practice proposed', { next: 'assess' }),
      node('assess', 'COMPLIANCE_REVIEW', 'Confirm the least restrictive alternative', { role: 'Clinical Governance Lead', sla: 48, next: 'evidence' }),
      node('evidence', 'EVIDENCE_UPLOAD', 'Upload the behaviour support plan and consent', { role: 'Clinical Governance Lead', sla: 48, next: 'review' }),
      node('review', 'APPROVAL', 'Clinical governance approval', { role: 'Clinical Governance Lead', sla: 48, next: 'exec' }),
      node('exec', 'EXECUTIVE_APPROVAL', 'Executive authorisation', { role: 'CEO', sla: 48, next: 'record' }),
      node('record', 'NOTIFICATION', 'Record the authorisation in the register', { next: 'close' }),
      node('close', 'END', 'Authorisation recorded'),
    ],
  },
  {
    code: 'TPL-04',
    name: 'Aged Care SIRS notification',
    workflow_type: 'SIRS',
    domain: 'Aged Care OS',
    sla_hours: 24,
    owner_role: 'Clinical Governance Lead',
    standards: 'ACQS 2, ACQS 8',
    evidence: 'EVD-234 SIRS notification record, EVD-233 Investigation report',
    description: 'Priority 1 and Priority 2 serious incident response with the notification clock and evidence trail.',
    nodes: [
      node('start', 'START', 'Serious incident identified', { next: 'identify' }),
      node('identify', 'TASK', 'Assess priority and preserve the scene', { role: 'Registered Nurse', sla: 4, next: 'notify' }),
      node('notify', 'DECISION', 'Is this a Priority 1 incident?', { role: 'Clinical Governance Lead', sla: 4, yes: 'priority1', no: 'standard' }),
      node('priority1', 'TASK', 'Confirm applicable notification deadline and notify', { role: 'Compliance Manager', sla: 12, next: 'evidence' }),
      node('standard', 'TASK', 'Confirm applicable notification deadline and record', { role: 'Compliance Manager', sla: 40, next: 'evidence' }),
      node('evidence', 'EVIDENCE_UPLOAD', 'Upload the notification and investigation notes', { role: 'Compliance Manager', sla: 24, next: 'approve' }),
      node('approve', 'CEO_APPROVAL', 'Executive sign-off on the response', { role: 'CEO', sla: 24, next: 'close' }),
      node('close', 'END', 'SIRS response closed'),
    ],
  },
  {
    code: 'TPL-05',
    name: 'Clinical care plan review',
    workflow_type: 'Care Plan Review',
    domain: 'Clinical Governance OS',
    sla_hours: 336,
    owner_role: 'Clinical Governance Lead',
    standards: 'ACQS 5, NSQHS 1',
    evidence: 'EVD-137 Care plan, EVD-136 Clinical assessment',
    description: 'Scheduled care plan review with consent, clinical sign-off and the review date set.',
    nodes: [
      node('start', 'START', 'Care plan review due', { next: 'review' }),
      node('review', 'TASK', 'Review the plan against current needs', { role: 'Registered Nurse', sla: 72, next: 'consent' }),
      node('consent', 'EVIDENCE_REQUEST', 'Obtain and record consent', { role: 'Registered Nurse', sla: 72, next: 'assess' }),
      node('assess', 'COMPLIANCE_REVIEW', 'Check clinical risks and restrictive practice', { role: 'Clinical Governance Lead', sla: 72, next: 'signoff' }),
      node('signoff', 'APPROVAL', 'Clinical governance sign-off', { role: 'Clinical Governance Lead', sla: 48, next: 'close' }),
      node('close', 'END', 'Plan review complete'),
    ],
  },
  {
    code: 'TPL-06',
    name: 'Allied health referral management',
    workflow_type: 'Referral Management',
    domain: 'Allied Health OS',
    sla_hours: 240,
    owner_role: 'Allied Health Manager',
    standards: 'NDIS Core 1.1, ACQS 3',
    evidence: 'EVD-148 Allied health report, EVD-061 Support plan',
    description: 'Triage, appointment, assessment report and outcome for an allied health referral.',
    nodes: [
      node('start', 'START', 'Referral received', { next: 'triage' }),
      node('triage', 'TASK', 'Triage discipline and urgency', { role: 'Allied Health Manager', sla: 24, next: 'consent' }),
      node('consent', 'EVIDENCE_REQUEST', 'Confirm consent to refer and share', { role: 'Administration', sla: 48, next: 'book' }),
      node('book', 'FORM', 'Book the appointment', { role: 'Administration', sla: 48, next: 'assess' }),
      node('assess', 'TASK', 'Complete the discipline assessment', { role: 'Allied Health Manager', sla: 120, next: 'evidence' }),
      node('evidence', 'EVIDENCE_UPLOAD', 'Upload the assessment report', { role: 'Allied Health Manager', sla: 48, next: 'close' }),
      node('close', 'END', 'Referral closed with outcome recorded'),
    ],
  },
  {
    code: 'TPL-07',
    name: 'Policy approval',
    workflow_type: 'Policy Approval',
    domain: 'Governance OS',
    sla_hours: 336,
    owner_role: 'Compliance Manager',
    standards: 'NDIS Core 2, ACQS 8, ISO 9001:2015 5',
    evidence: 'EVD-026 Policy register extract, EVD-029 Board minutes',
    description: 'Draft, consult, executive and board approve, then publish a controlled policy.',
    nodes: [
      node('start', 'START', 'Policy change requested', { next: 'draft' }),
      node('draft', 'TASK', 'Draft the policy and the version note', { role: 'Compliance Manager', sla: 120, next: 'standards' }),
      node('standards', 'STANDARD_CHECK', 'Confirm the mapped standards are current', { next: 'consult' }),
      node('consult', 'DECISION', 'Is consultation complete?', { role: 'Compliance Manager', sla: 72, yes: 'ceo', no: 'draft' }),
      node('ceo', 'CEO_APPROVAL', 'Chief executive approval', { role: 'CEO', sla: 48, next: 'board' }),
      node('board', 'BOARD_APPROVAL', 'Board approval and resolution', { role: 'Board Member', sla: 72, next: 'publish' }),
      node('publish', 'NOTIFICATION', 'Publish the controlled version', { next: 'close' }),
      node('close', 'END', 'Policy published'),
    ],
  },
  {
    code: 'TPL-08',
    name: 'Internal audit execution',
    workflow_type: 'Internal Audit',
    domain: 'Audit OS',
    sla_hours: 480,
    owner_role: 'Audit Manager',
    standards: 'ISO 9001:2015 9, ACQS 8',
    evidence: 'EVD-152 Audit report, EVD-154 Finding record',
    description: 'Plan, test, rate findings and sign off an internal audit against the evidence held.',
    nodes: [
      node('start', 'START', 'Audit scheduled', { next: 'plan' }),
      node('plan', 'TASK', 'Prepare the audit plan and sampling', { role: 'Audit Manager', sla: 72, next: 'validate' }),
      node('validate', 'EVIDENCE_VALIDATION', 'Check evidence currency for the scope', { next: 'audit' }),
      node('audit', 'AUDIT_REVIEW', 'Test the controls and rate conformity', { role: 'Audit Manager', sla: 168, next: 'finding' }),
      node('finding', 'DECISION', 'Any non-conformity found?', { role: 'Audit Manager', sla: 24, yes: 'capa', no: 'signoff' }),
      node('capa', 'CORRECTIVE_ACTION', 'Agree the corrective action and owner', { role: 'Quality & Improvement Manager', sla: 120, next: 'signoff' }),
      node('signoff', 'AUDIT_SIGNOFF', 'Audit sign-off', { role: 'Compliance Manager', sla: 48, next: 'close' }),
      node('close', 'END', 'Audit closed'),
    ],
  },
  {
    code: 'TPL-09',
    name: 'Risk assessment and treatment',
    workflow_type: 'Risk Assessment',
    domain: 'Risk OS',
    sla_hours: 168,
    owner_role: 'Risk Manager',
    standards: 'ISO 31000, ACQS 8',
    evidence: 'EVD-177 Risk assessment, EVD-178 Treatment plan',
    description: 'Assess, score, route and treat a risk, then put it on the monitoring cycle.',
    nodes: [
      node('start', 'START', 'Risk raised', { next: 'assess' }),
      node('assess', 'TASK', 'Assess likelihood and consequence', { role: 'Risk Manager', sla: 24, next: 'score' }),
      node('score', 'AI_RISK_SCORE', 'Score inherent and residual risk', { next: 'route' }),
      node('route', 'DECISION', 'Does the residual risk exceed appetite?', { role: 'Risk Manager', sla: 24, yes: 'treatment', no: 'monitor' }),
      node('treatment', 'TASK', 'Deliver the treatment plan', { role: 'Risk Manager', sla: 72, next: 'approval' }),
      node('approval', 'EXECUTIVE_APPROVAL', 'Accept the residual risk', { role: 'CEO', sla: 48, next: 'monitor' }),
      node('monitor', 'SLA_CHECK', 'Set the review cycle', { next: 'close' }),
      node('close', 'END', 'Risk registered'),
    ],
  },
  {
    code: 'TPL-10',
    name: 'Workforce onboarding and credentialing',
    workflow_type: 'Onboarding',
    domain: 'Workforce OS',
    sla_hours: 240,
    owner_role: 'HR Manager',
    standards: 'NDIS Core 3.1, ACQS 7',
    evidence: 'EVD-111 Worker screening clearance, EVD-113 Induction record',
    description: 'Collect documents, verify screening and credentials, complete induction and approve the new worker.',
    nodes: [
      node('start', 'START', 'New worker starts', { next: 'docs' }),
      node('docs', 'EVIDENCE_REQUEST', 'Request screening, qualifications and ID', { role: 'Administration', sla: 48, next: 'screening' }),
      node('screening', 'TASK', 'Verify the worker screening clearance', { role: 'HR Manager', sla: 48, next: 'validate' }),
      node('validate', 'EVIDENCE_VALIDATION', 'Check every document is current', { next: 'induction' }),
      node('induction', 'TASK', 'Complete induction and mandatory training', { role: 'HR Manager', sla: 72, next: 'approval' }),
      node('approval', 'APPROVAL', 'Approve the worker as deployment ready', { role: 'General Manager', sla: 48, next: 'close' }),
      node('close', 'END', 'Worker onboarded'),
    ],
  },
];

export function graphFromJson(value) {
  try {
    const parsed = JSON.parse(value || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function validateWorkflow(nodes = []) {
  if (!Array.isArray(nodes) || nodes.length > 120 || nodes.some(n => !n || typeof n !== 'object')) return { valid: false, errors: ['A graph needs up to 120 valid nodes.'], warnings: [] };
  const errors = [];
  const warnings = [];
  const ids = new Set();

  nodes.forEach((item) => {
    if (!item?.id) errors.push('Every node needs an id.');
    else if (ids.has(item.id)) errors.push(`Node id "${item.id}" is used twice.`);
    else ids.add(item.id);
    if (!item?.type || !NODE_META[item.type]) errors.push(`Node "${item?.label || item?.id || 'unnamed'}" has an unknown type.`);
    if (!item?.label) errors.push(`Node "${item?.id || 'unnamed'}" needs a name.`);
  });

  const starts = nodes.filter((item) => item.type === 'START');
  const ends = nodes.filter((item) => item.type === 'END');
  if (starts.length !== 1) errors.push(`A workflow needs exactly one start node (found ${starts.length}).`);
  if (!ends.length) errors.push('A workflow needs an end node.');

  nodes.forEach((item) => {
    if (item.type === 'END') return;
    if (item.type === 'DECISION') {
      if (!item.yes_next || !item.no_next) errors.push(`Decision "${item.label}" needs both an approve and a reject route.`);
      if (item.yes_next && !ids.has(item.yes_next)) errors.push(`Decision "${item.label}" routes to a node that does not exist.`);
      if (item.no_next && !ids.has(item.no_next)) errors.push(`Decision "${item.label}" routes to a node that does not exist.`);
      return;
    }
    if (!item.next) errors.push(`"${item.label}" has no next step.`);
    else if (!ids.has(item.next)) errors.push(`"${item.label}" routes to a node that does not exist.`);
  });

  const reachable = new Set();
  if (starts[0]) {
    const queue = [starts[0].id];
    while (queue.length) {
      const currentId = queue.shift();
      if (reachable.has(currentId)) continue;
      reachable.add(currentId);
      const current = nodes.find((item) => item.id === currentId);
      if (!current) continue;
      [current.next, current.yes_next, current.no_next].filter(Boolean).forEach((idValue) => queue.push(idValue));
    }
    nodes.forEach((item) => {
      if (!reachable.has(item.id)) warnings.push(`"${item.label}" cannot be reached from the start node.`);
    });
  }

  const canEnd = new Set(ends.map(n => n.id));
  let changed = true;
  while (changed) {
    changed = false;
    nodes.forEach(n => {
      const targets = n.type === 'DECISION' ? [n.yes_next, n.no_next] : [n.next];
      if (!canEnd.has(n.id) && targets.some(id => canEnd.has(id))) { canEnd.add(n.id); changed = true; }
    });
  }
  nodes.forEach(n => {
    if (reachable.has(n.id) && !canEnd.has(n.id)) errors.push(`"${n.label}" has no route to an end node.`);
    if (n.sla_hours != null && (!Number.isFinite(Number(n.sla_hours)) || Number(n.sla_hours) < 0)) errors.push(`"${n.label}" needs a non-negative finite SLA target.`);
    if (NODE_META[n.type]?.human && !String(n.role || '').trim()) warnings.push(`"${n.label}" needs a canonical assignment policy before publication.`);
    if (!NODE_META[n.type]?.human && !['START', 'END'].includes(n.type)) warnings.push(`"${n.label}" requires a verified runtime adapter.`);
  });

  if (!nodes.some((item) => ['EVIDENCE_UPLOAD', 'EVIDENCE_REQUEST', 'EVIDENCE_VALIDATION'].includes(item.type))) {
    warnings.push('No evidence node: this run will not leave an evidence record.');
  }
  if (!nodes.some((item) => ['APPROVAL', 'CEO_APPROVAL', 'EXECUTIVE_APPROVAL', 'BOARD_APPROVAL', 'AUDIT_SIGNOFF'].includes(item.type))) {
    warnings.push('No approval node: nobody signs the outcome.');
  }
  if (!nodes.some((item) => NODE_META[item.type]?.human)) {
    errors.push('A workflow needs at least one step a person completes.');
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function nextNodeFor(item, outcome) {
  if (!item) return '';
  if (item.type === 'DECISION') return outcome === 'reject' ? item.no_next : item.yes_next;
  return item.next;
}

export function humanNodes(nodes = []) {
  return nodes.filter((item) => NODE_META[item.type]?.human);
}

export function summariseInstances(instances = []) {
  const open = instances.filter((row) => ['Running', 'Waiting', 'Paused', 'Escalated'].includes(row.state));
  const completed = instances.filter((row) => row.state === 'Completed');
  const closed = completed.filter((row) => row.completed_at);
  const durations = closed
    .map((row) => (new Date(row.completed_at).getTime() - new Date(row.started_at).getTime()) / 3600000)
    .filter((hours) => Number.isFinite(hours) && hours >= 0);

  return {
    total: instances.length,
    open: open.length,
    running: instances.filter((row) => row.state === 'Running').length,
    escalated: instances.filter((row) => row.state === 'Escalated').length,
    completed: completed.length,
    failed: instances.filter((row) => row.state === 'Failed').length,
    breaches: instances.filter((row) => row.sla_state === 'Breached').length,
    waitingApproval: open.filter((row) => /approval|sign-off/i.test(row.task_kind || '')).length,
    completionRate: instances.length ? Math.round((completed.length / instances.length) * 100) : null,
    // A mutable current SLA flag cannot prove historical compliance.
    slaCompliance: null,
    averageHours: durations.length ? Math.round((durations.reduce((sum, value) => sum + value, 0) / durations.length) * 10) / 10 : null,
  };
}

export function bottlenecks(instances = []) {
  const counts = new Map();
  instances
    .filter((row) => ['Running', 'Waiting', 'Escalated', 'Paused'].includes(row.state) && row.current_node_label)
    .forEach((row) => counts.set(row.current_node_label, (counts.get(row.current_node_label) || 0) + 1));
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

export function typeBreakdown(instances = []) {
  const counts = new Map();
  instances.forEach((row) => {
    const key = row.workflow_type || 'Unclassified';
    const entry = counts.get(key) || { type: key, total: 0, open: 0, completed: 0, breaches: 0 };
    entry.total += 1;
    if (['Running', 'Waiting', 'Paused', 'Escalated'].includes(row.state)) entry.open += 1;
    if (row.state === 'Completed') entry.completed += 1;
    if (row.sla_state === 'Breached') entry.breaches += 1;
    counts.set(key, entry);
  });
  return [...counts.values()].sort((a, b) => b.total - a.total);
}