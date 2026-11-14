import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';
import {
  assessBillingBoard,
  assessDocumentRelease,
  assessIncidentFollowUp,
  assessRosterEligibility,
  buildBillingLines,
  noteKey,
  partitionBillable,
  nextVersionLabel,
} from '../../shared/connectedJourneys.ts';

// Connected journey gates for the owner-approved scope (journeys B–E).
//
// Every read and write happens on the server: the business is decided by
// perBusiness(), roles are checked here, and the verdicts come from
// shared/connectedJourneys.ts so the screen and the write guard can never
// disagree. Nothing is billed, closed or approved on the strength of what the
// browser claims — each write re-reads the record and re-runs the same rules.

const BILLING_ROLES = ['admin', 'Provider Administrator', 'Finance & Accounts Officer', 'Administration'];
const GOVERNANCE_ROLES = [
  'admin',
  'Provider Administrator',
  'Compliance Manager',
  'Compliance Administrator',
  'Management',
  'Quality & Improvement Manager',
];
const VIEW_ROLES = [...new Set([...BILLING_ROLES, ...GOVERNANCE_ROLES, 'Team Leader', 'Human Resources Manager'])];

const day = (d: Date) => d.toISOString().slice(0, 10);
const shiftDays = (days: number) => {
  const to = new Date();
  const from = new Date(to.getTime() - days * 86400000);
  return { from: day(from), to: day(to) };
};
const text = (v: unknown) => String(v ?? '').trim();
const json = (body: unknown, status = 200) => Response.json(body, { status });
const fail = (message: string, status = 400) => json({ error: message }, status);

const listAll = async (dao: any, query: any, options: any) => {
  const page = await dao.filter(query, options);
  return page?.items ?? (Array.isArray(page) ? page : []);
};

function canView(role: string) {
  return VIEW_ROLES.includes(role);
}

async function billingBoard(base44: any, body: any) {
  const window = shiftDays(Number(body.days) > 0 ? Math.min(Number(body.days), 120) : 30);
  const from = text(body.from) || window.from;
  const to = text(body.to) || window.to;

  const [shifts, notes] = await Promise.all([
    listAll(base44.entities.Shift, { date: { $gte: from, $lte: to } }, { sort: '-date', limit: 300 }),
    listAll(base44.entities.ShiftNote, { date: { $gte: from, $lte: to } }, { sort: '-date', limit: 500 }),
  ]);

  const rows = assessBillingBoard({
    shifts,
    noteKeys: notes.map((n: any) => noteKey(n.participant_name, n.date)),
  });

  const order = { blocked: 0, ready: 1, complete: 2 };
  rows.sort((a, b) => (order[a.state] - order[b.state]) || String(b.date).localeCompare(String(a.date)));

  return json({
    ok: true,
    journey: 'b',
    from,
    to,
    notes_found: notes.length,
    summary: {
      ready: rows.filter((r) => r.state === 'ready').length,
      blocked: rows.filter((r) => r.state === 'blocked').length,
      already_billed: rows.filter((r) => r.state === 'complete').length,
      ready_value: Math.round(rows.filter((r) => r.state === 'ready').reduce((sum, r) => sum + r.amount, 0) * 100) / 100,
    },
    rows,
  });
}

async function incidentBoard(base44: any) {
  const [incidents, actions, risks] = await Promise.all([
    listAll(
      base44.entities.Incident,
      { status: { $in: ['Reported', 'Under Investigation', 'Action Required', 'Resolved'] } },
      { sort: '-date_occurred', limit: 60 },
    ),
    listAll(base44.entities.ImprovementAction, { linked_entity_type: 'Incident' }, { limit: 500 }),
    listAll(base44.entities.Risk, { source_entity_type: 'Incident' }, { limit: 300 }),
  ]);

  const byIncident = new Map<string, any[]>();
  for (const action of actions) {
    const key = text(action.linked_entity_id);
    if (!key) continue;
    byIncident.set(key, [...(byIncident.get(key) || []), action]);
  }
  const riskIds = new Set(risks.map((r: any) => text(r.source_entity_id)).filter(Boolean));

  const rows = incidents.map((incident: any) => {
    const linked = byIncident.get(text(incident.id)) || [];
    const gate = assessIncidentFollowUp({
      incident,
      actions: linked,
      riskLinked: riskIds.has(text(incident.id)),
    });
    return {
      incident_id: text(incident.id),
      incident_number: text(incident.incident_id) || text(incident.document_number) || text(incident.id),
      title: text(incident.title),
      severity: text(incident.severity),
      status: text(incident.status),
      owner: text(incident.owner) || text(incident.responsible_manager),
      date_occurred: text(incident.date_occurred),
      actions: linked.map((a: any) => ({
        id: text(a.id),
        title: text(a.title),
        owner: text(a.owner),
        status: text(a.status),
        target_date: text(a.target_date),
        effectiveness_result: text(a.effectiveness_result) || 'Not Reviewed',
      })),
      ...gate,
    };
  });

  const rank = { blocked: 0, ready: 1, complete: 2 };
  rows.sort((a: any, b: any) => (rank[a.state] - rank[b.state]) || String(b.date_occurred).localeCompare(String(a.date_occurred)));

  return json({
    ok: true,
    journey: 'c',
    summary: {
      needs_action: rows.filter((r: any) => r.state === 'blocked' && !r.actions.length).length,
      awaiting_effectiveness: rows.filter((r: any) => r.blockers.some((b: any) => b.code.startsWith('effectiveness'))).length,
      ready_to_close: rows.filter((r: any) => r.state === 'ready').length,
    },
    rows,
  });
}

async function eligibilityBoard(base44: any, body: any) {
  const [staff, records, certificates, training] = await Promise.all([
    listAll(base44.entities.StaffProfile, {}, { sort: 'full_name', limit: 100 }),
    listAll(base44.entities.WorkforceAssuranceRecord, {}, { sort: '-record_date', limit: 500 }),
    listAll(base44.entities.Certificate, {}, { sort: '-issue_date', limit: 500 }),
    listAll(base44.entities.TrainingCompletion, {}, { sort: '-completed_date', limit: 500 }),
  ]);

  const wanted = text(body.staff_id);
  const today = day(new Date());

  const match = (record: any, profile: any) =>
    text(record.staff_id) === text(profile.id) ||
    text(record.employee_id) === text(profile.id) ||
    (text(record.staff_name) && text(record.staff_name).toLowerCase() === text(profile.full_name).toLowerCase()) ||
    (text(record.employee_name) && text(record.employee_name).toLowerCase() === text(profile.full_name).toLowerCase());

  const rows = staff
    .filter((profile: any) => !wanted || text(profile.id) === wanted)
    .map((profile: any) => {
      const gate = assessRosterEligibility({
        staff: profile,
        screening: records.filter((r: any) => match(r, profile)),
        certificates: certificates.filter((c: any) => match(c, profile)),
        training: training.filter((t: any) => match(t, profile)),
        today,
      });
      return {
        staff_id: text(profile.id),
        staff_name: text(profile.full_name),
        position: text(profile.position),
        status: text(profile.status),
        ...gate,
      };
    });

  const rank = { blocked: 0, incomplete: 1, ready: 2, complete: 3 };
  rows.sort((a: any, b: any) => rank[a.state] - rank[b.state]);

  return json({
    ok: true,
    journey: 'd',
    summary: {
      blocked: rows.filter((r: any) => r.state === 'blocked').length,
      incomplete: rows.filter((r: any) => r.state === 'incomplete').length,
      ready: rows.filter((r: any) => r.state === 'ready').length,
    },
    note: 'Eligibility is judged only on checks, certificates and training your organisation has recorded. Missing evidence is shown as unknown, never as a pass.',
    rows,
  });
}

async function documentBoard(base44: any, user: any) {
  const [documents, acknowledgements] = await Promise.all([
    listAll(base44.entities.DocumentControl, {}, { sort: '-approval_date', limit: 150 }),
    listAll(base44.entities.PolicyAcknowledgement, {}, { sort: '-acknowledged_date', limit: 500 }),
  ]);

  const mine = new Set(
    acknowledgements
      .filter((a: any) => text(a.staff_user_id) === text(user.id) || (user.email && text(a.staff_email) === text(user.email)))
      .map((a: any) => text(a.policy_id)),
  );

  const rows = documents.map((doc: any) => {
    const acknowledged = mine.has(text(doc.document_id)) || mine.has(text(doc.id));
    const gate = assessDocumentRelease({ document: doc, acknowledged });
    return {
      document_id: text(doc.id),
      register_id: text(doc.document_id),
      title: text(doc.title),
      version: text(doc.version),
      status: text(doc.status),
      category: text(doc.document_category),
      approved_by: text(doc.approved_by),
      approval_date: text(doc.approval_date),
      review_date: text(doc.review_date),
      ...gate,
    };
  });

  const rank = { ready: 0, blocked: 1, complete: 2 };
  rows.sort((a: any, b: any) => (rank[a.state] - rank[b.state]) || String(a.title).localeCompare(String(b.title)));

  return json({
    ok: true,
    journey: 'e',
    summary: {
      awaiting_my_acknowledgement: rows.filter((r: any) => r.state === 'ready').length,
      not_releasable: rows.filter((r: any) => r.state === 'blocked').length,
      acknowledged: rows.filter((r: any) => r.state === 'complete').length,
    },
    rows,
  });
}

async function billShifts(base44: any, user: any, body: any) {
  if (!BILLING_ROLES.includes(user.role)) return fail('Your role cannot raise invoices.', 403);
  if (body.confirm !== true) return fail('Confirm the draft invoice before it is created.', 400);

  const ids = Array.isArray(body.shift_ids) ? [...new Set(body.shift_ids.map(text).filter(Boolean))] : [];
  if (!ids.length) return fail('Select at least one shift to bill.', 400);
  if (ids.length > 100) return fail('Select at most 100 shifts at a time.', 400);
  if (ids.some((id) => !/^[a-f0-9]{24}$/i.test(id))) {
    return fail('One or more selected shifts are not valid record IDs.', 400);
  }

  const shifts = await listAll(base44.entities.Shift, { id: { $in: ids } }, { limit: 200 });
  if (!shifts.length) return fail('None of the selected shifts are in this business.', 404);

  const dates = [...new Set(shifts.map((s: any) => text(s.date).slice(0, 10)).filter(Boolean))];
  const notes = await listAll(
    base44.entities.ShiftNote,
    { date: { $in: dates } },
    { limit: 500 },
  );
  const rows = assessBillingBoard({
    shifts,
    noteKeys: notes.map((n: any) => noteKey(n.participant_name, n.date)),
  });
  const partition = partitionBillable(rows, ids);

  if (!partition.billable.length) {
    return json({ ok: false, error: 'No selected shift is ready to bill.', ...partition }, 400);
  }

  const billable = rows.filter((row) => partition.billable.includes(row.shift_id));
  const toBill = shifts.filter((s: any) => partition.billable.includes(text(s.id)));
  const lines = buildBillingLines(toBill);
  const total = Math.round(lines.reduce((sum, line) => sum + line.amount, 0) * 100) / 100;
  const participants = [...new Set(toBill.map((s: any) => text(s.participant_name)).filter(Boolean))];
  const now = new Date();
  const stamp = `${now.toISOString().slice(0, 10).replace(/-/g, '')}-${String(now.getTime()).slice(-6)}`;

  const invoice = await base44.entities.Invoice.create({
    invoice_number: `SB-${stamp}`,
    participant_name: participants.length === 1 ? participants[0] : '',
    participant_id: text(toBill[0]?.participant_id),
    client_name: participants.length === 1 ? participants[0] : `${participants.length} participants`,
    line_items: JSON.stringify(lines),
    subtotal: total,
    amount: total,
    issue_date: day(now),
    due_date: day(new Date(now.getTime() + 14 * 86400000)),
    status: 'Draft',
    payment_terms: '14 days',
    description: `Draft invoice raised from ${lines.length} completed, approved and notated service shift(s).`,
    notes: `Prepared by ${text(user.full_name) || text(user.email)}. Every line keeps its originating shift id.`,
  });

  const billed: string[] = [];
  const failed: { shift_id: string; reason: string }[] = [];
  for (const shift of toBill) {
    try {
      await base44.entities.Shift.update(text(shift.id), { invoiced: true, invoice_id: text(invoice.id) });
      billed.push(text(shift.id));
    } catch (error) {
      failed.push({ shift_id: text(shift.id), reason: (error as Error).message });
    }
  }

  return json({
    ok: true,
    invoice_id: text(invoice.id),
    invoice_number: text(invoice.invoice_number),
    amount: total,
    billed,
    failed,
    skipped: partition.skipped,
    not_found: partition.notFound,
    service_ids_retained: lines.map((line) => line.shift_id),
    billable_count: billable.length,
    message: `Draft invoice ${text(invoice.invoice_number)} created for ${billed.length} shift(s).`,
  });
}

async function createCorrectiveAction(base44: any, user: any, body: any) {
  if (!GOVERNANCE_ROLES.includes(user.role)) return fail('Your role cannot record corrective actions.', 403);

  const incident = await base44.entities.Incident.get(text(body.incident_id));
  if (!incident) return fail('Incident not found in this business.', 404);
  if (text(incident.status) === 'Closed') return fail('This incident is already closed.', 400);

  const title = text(body.title);
  const owner = text(body.owner);
  const target = text(body.target_date);
  const criteria = text(body.effectiveness_criteria);
  if (!title) return fail('Give the corrective action a title.', 400);
  if (!owner) return fail('Name the accountable owner.', 400);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(target)) return fail('Set a target date (YYYY-MM-DD).', 400);
  if (!criteria) return fail('State how effectiveness will be measured before the action can close.', 400);

  const action = await base44.entities.ImprovementAction.create({
    improvement_id: `INC-${text(incident.incident_id) || text(incident.id)}-${Date.now().toString().slice(-5)}`,
    date_identified: day(new Date()),
    identified_by: text(user.full_name) || text(user.email),
    area_department: text(incident.department) || 'Incident follow-up',
    source: 'Incident Reviews',
    title,
    description: text(body.description) || `Corrective action recorded from incident ${text(incident.incident_id) || text(incident.id)}.`,
    risk_impact: text(incident.risk_assessment) || text(incident.control_measures),
    priority: ['Critical', 'High'].includes(text(incident.severity))
      ? 'Urgent'
      : ['Medium'].includes(text(incident.severity))
        ? 'High'
        : 'Medium',
    improvement_action_required: title,
    owner,
    target_date: target,
    status: 'Identified',
    effectiveness_criteria: criteria,
    linked_entity_type: 'Incident',
    linked_entity_id: text(incident.id),
  });

  return json({
    ok: true,
    action_id: text(action.id),
    message: 'Corrective action linked to the incident. Closure stays blocked until it is closed with effectiveness evidence.',
  });
}

async function recordAcknowledgement(base44: any, user: any, body: any) {
  const document = await base44.entities.DocumentControl.get(text(body.document_id));
  if (!document) return fail('Controlled document not found in this business.', 404);

  const already = await listAll(
    base44.entities.PolicyAcknowledgement,
    { staff_user_id: user.id },
    { limit: 200 },
  );
  const registerId = text(document.document_id) || text(document.id);
  if (already.some((a: any) => text(a.policy_id) === registerId || text(a.policy_id) === text(document.id))) {
    return json({ ok: false, error: 'You have already acknowledged this document.' }, 409);
  }

  const gate = assessDocumentRelease({ document, acknowledged: false });
  if (gate.state !== 'ready') {
    return json({ ok: false, error: gate.blockers[0]?.label || 'This document is not approved for acknowledgement.', blockers: gate.blockers }, 400);
  }

  const acknowledgement = await base44.entities.PolicyAcknowledgement.create({
    policy_id: registerId,
    policy_name: text(document.title),
    policy_version: text(document.version),
    staff_user_id: text(user.id),
    staff_name: text(user.full_name) || text(user.email) || 'Staff member',
    staff_email: text(user.email),
    acknowledged_date: day(new Date()),
  });

  return json({ ok: true, acknowledgement_id: text(acknowledgement.id), message: 'Acknowledgement recorded against the approved version.' });
}

async function startRevision(base44: any, user: any, body: any) {
  if (!GOVERNANCE_ROLES.includes(user.role)) return fail('Your role cannot start a document revision.', 403);

  const document = await base44.entities.DocumentControl.get(text(body.document_id));
  if (!document) return fail('Controlled document not found in this business.', 404);
  if (text(document.status) !== 'Approved') {
    return fail('Only an approved version can be revised. Finish the current draft or review first.', 400);
  }
  const summary = text(body.change_summary);
  if (!summary) return fail('Describe what changes in the new draft.', 400);

  const draft = await base44.entities.DocumentControl.create({
    title: text(document.title),
    document_id: text(document.document_id) || text(document.id),
    version: nextVersionLabel(document.version),
    status: 'Draft',
    document_category: text(document.document_category),
    business_unit: text(document.business_unit),
    owner: text(document.owner) || text(user.full_name),
    superseded_version: text(document.version),
    change_summary: summary,
    notes: `Draft opened from approved version ${text(document.version)} by ${text(user.full_name) || text(user.email)}.`,
  });

  return json({
    ok: true,
    draft_id: text(draft.id),
    version: text(draft.version),
    message: `Draft version ${text(draft.version)} opened. The approved version ${text(document.version)} is unchanged and stays the released copy.`,
  });
}

export default perBusiness(async function (req) {
  try {
    const base44 = createScopedClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return fail('Unauthorized', 401);
    if (!canView(user.role)) return fail('Your role cannot view connected workflow gates.', 403);

    const body = (await req.json().catch(() => ({}))) as any;
    const action = text(body.action) || 'assess';
    const journey = text(body.journey).toLowerCase();

    if (action === 'assess') {
      if (journey === 'b') {
        if (!BILLING_ROLES.includes(user.role)) return fail('Your role cannot view billing exceptions.', 403);
        return await billingBoard(base44, body);
      }
      if (journey === 'c') return await incidentBoard(base44);
      if (journey === 'd') return await eligibilityBoard(base44, body);
      if (journey === 'e') return await documentBoard(base44, user);
      return fail('Unknown journey. Use b, c, d or e.', 400);
    }

    if (action === 'bill_shifts') return await billShifts(base44, user, body);
    if (action === 'create_corrective_action') return await createCorrectiveAction(base44, user, body);
    if (action === 'record_acknowledgement') return await recordAcknowledgement(base44, user, body);
    if (action === 'start_revision') return await startRevision(base44, user, body);

    return fail('Unknown action.', 400);
  } catch (error) {
    return fail((error as Error).message || 'The connected workflow check failed.', 500);
  }
});