export const STUDIO_RELEASE_NOTICE = 'Live in this release: saved drafts, graph validation, an immutable published version with a graph hash, and supervised runs through task, approval, evidence validation and end. Still unavailable: the SLA sweeper, notifications, AI steps, webhooks, sub-workflows and external integrations. Templates and their standard mappings still need review before operational use.';

export function simulateWorkflow(nodes, decisions = {}, limit = 120) {
  if (!Array.isArray(nodes) || !nodes.length || nodes.length > 120) return { status: 'Invalid', steps: [] };
  const ids = new Set();
  for (const n of nodes) {
    if (!n || typeof n.id !== 'string' || ids.has(n.id)) return { status: 'Invalid', steps: [] };
    ids.add(n.id);
  }
  const starts = nodes.filter(n => n.type === 'START');
  if (starts.length !== 1) return { status: 'Invalid', steps: [] };
  const byId = new Map(nodes.map(n => [n.id, n]));
  const steps = [];
  let id = starts[0].id;
  const bound = Math.min(240, Math.max(1, Number(limit) || 120));
  while (steps.length < bound) {
    const n = byId.get(id);
    if (!n) return { status: 'Broken route', steps };
    steps.push({ id: n.id, label: n.label, type: n.type });
    if (n.type === 'END') return { status: 'Reached end (simulation only)', steps };
    if (n.type === 'DECISION') {
      if (!['approve', 'reject'].includes(decisions[n.id])) return { status: 'Decision required', decisionId: n.id, steps };
      id = decisions[n.id] === 'approve' ? n.yes_next : n.no_next;
    } else if (['START', 'TASK', 'FORM', 'APPROVAL', 'CEO_APPROVAL', 'EXECUTIVE_APPROVAL', 'BOARD_APPROVAL', 'AUDIT_REVIEW', 'AUDIT_SIGNOFF', 'COMPLIANCE_REVIEW', 'FINDING_REVIEW', 'CORRECTIVE_ACTION', 'ESCALATION', 'EVIDENCE_REQUEST', 'EVIDENCE_UPLOAD', 'DOCUMENT_REQUEST'].includes(n.type)) {
      id = n.next;
    } else {
      return { status: 'Adapter required (not executed)', steps };
    }
  }
  return { status: 'Step limit reached', steps };
}

export function studioScopeKey(user) {
  return JSON.stringify([user?.id, user?.tenant_id || user?.data?.tenant_id, user?.role, user?.account_status, user?.access_approved]);
}