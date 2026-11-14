import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';

import { authorizeSystemCall } from '../../shared/systemAuth.ts';
import { notifyRoutedManagement } from '../../shared/routedManagementAlerts.ts';

// Cross-module register routing: files any new record from the routed entities
// into its correct Register (and escalates critical items as Notifications).
// Invoked by the "Auto Route" entity-trigger workflows on create/update.

const pick = (rec, fields) => {
  for (const f of fields) {
    const v = rec?.[f];
    if (v !== undefined && v !== null && String(v).trim() !== '') return String(v);
  }
  return '';
};

const ROUTES = {
  CommunicationEntry: {
    register: () => 'Communication Register',
    titleFields: ['subject', 'attention'],
    descFields: ['body', 'issues_concerns'],
    personFields: ['person_name'],
    ownerFields: ['sender_name'],
    notify: false,
  },
  ShiftNote: {
    register: () => 'Communication Register',
    titleFields: ['note_type', 'subject'],
    descFields: ['what_happened', 'issues_concerns'],
    personFields: ['participant_name', 'staff_name'],
    ownerFields: ['recorded_by'],
    notify: false,
  },
  Incident: {
    register: () => 'Incident Register',
    titleFields: ['title'],
    descFields: ['description'],
    personFields: ['participant_name'],
    ownerFields: ['reported_by'],
    notify: true,
    notifyType: 'Incident Escalation',
  },
  Feedback: {
    register: () => 'Feedback Register',
    titleFields: ['subject'],
    descFields: ['message', 'comments', 'description'],
    personFields: ['participant_name', 'staff_name'],
    ownerFields: ['recorded_by'],
    notify: true,
    notifyType: 'Feedback Manager Copy',
  },
  Risk: {
    // report_type: Risk / Hazard / Near Miss -> matching register
    register: (rec) => {
      const t = (rec?.report_type || 'Risk').toLowerCase();
      if (t.includes('hazard')) return 'Hazard Register';
      if (t.includes('near')) return 'Near Miss Register';
      return 'Risk Register';
    },
    titleFields: ['title'],
    descFields: ['description', 'hazards_identified'],
    personFields: ['participant_name'],
    ownerFields: ['owner'],
    notify: true,
    notifyType: 'Risk Manager Copy',
  },
  GoalProgressNote: {
    register: () => 'Goal Progress Register',
    titleFields: ['title', 'note_type'],
    descFields: ['note', 'content', 'progress_note', 'body'],
    personFields: ['participant_name'],
    ownerFields: ['recorded_by', 'created_by'],
    notify: false,
  },
  DataBreach: {
    register: () => 'Data Breach Register',
    titleFields: ['title'],
    descFields: ['description'],
    personFields: ['participant_name'],
    ownerFields: ['reported_by'],
    notify: true,
    notifyType: 'Incident Escalation',
  },
  Investigation: {
    register: () => 'Investigation Register',
    titleFields: ['title'],
    descFields: ['description', 'findings'],
    personFields: ['participant_name'],
    ownerFields: ['owner', 'investigator'],
    notify: false,
  },
  TrainingCompletion: {
    register: () => 'Training Register',
    titleFields: ['module_title'],
    descFields: ['notes', 'result'],
    personFields: ['employee_name'],
    ownerFields: ['recorded_by'],
    notify: false,
  },
  EmergencyDrill: {
    register: () => 'Emergency Drill Register',
    titleFields: ['title'],
    descFields: ['description', 'notes'],
    personFields: ['location'],
    ownerFields: ['recorded_by', 'owner'],
    notify: false,
  },
  Meeting: {
    register: () => 'Meeting Minutes Register',
    titleFields: ['title'],
    descFields: ['description', 'minutes', 'notes'],
    personFields: ['location'],
    ownerFields: ['owner', 'chairperson'],
    notify: false,
  },
  TakeFive: {
    register: () => 'Take Five Register',
    titleFields: ['task'],
    descFields: ['notes', 'comments'],
    personFields: ['participant_name', 'location'],
    ownerFields: ['staff_name', 'recorded_by'],
    notify: false,
  },
  InternalAudit: {
    register: () => 'Internal Audit Register',
    titleFields: ['register_audited', 'audit_category'],
    descFields: ['findings_identified', 'audit_scope'],
    personFields: ['auditor'],
    ownerFields: ['auditor'],
    notify: false,
  },
};

export default perBusiness(async function(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const entity = body.entity;
    const recordId = body.record_id;
    const event = body.event || 'create';
    if (!entity || !recordId || !ROUTES[entity]) {
      return Response.json({ error: 'Unsupported route' }, { status: 400 });
    }

    const base44 = createScopedClientFromRequest(req);
    if (!(await authorizeSystemCall(base44, body))) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const rec = await base44.asServiceRole.entities[entity].get(recordId);
    if (!rec) return Response.json({ error: 'Record not found' }, { status: 404 });

    const route = ROUTES[entity];
    const registerType = route.register(rec);
    const title = pick(rec, route.titleFields) || 'Untitled entry';
    const person = pick(rec, route.personFields);
    const owner = pick(rec, route.ownerFields) || 'System (auto-routed)';
    const description = pick(rec, route.descFields).slice(0, 900);
    const status = pick(rec, ['status']);
    const recordedDate = (rec.created_date || rec.entry_date || rec.date || new Date().toISOString()).slice(0, 10);

    // Find any existing register entry for this record (idempotent routing).
    const existing = await base44.asServiceRole.entities.Register.filter(
      { register_type: registerType, linked_entity_id: recordId }, { limit: 1 },
    );

    let registerEntry;
    if (existing.items && existing.items.length > 0) {
      registerEntry = await base44.asServiceRole.entities.Register.update(existing.items[0].id, {
        description,
        status: status || existing.items[0].status,
        recorded_date: recordedDate,
        owner,
      });
    } else {
      registerEntry = await base44.asServiceRole.entities.Register.create({
        register_type: registerType,
        entry_title: `${entity.replace(/([a-z])([A-Z])/g, '$1 $2')}: ${title}`,
        entry_id: recordId,
        description,
        linked_entity_type: entity,
        linked_entity_id: recordId,
        status: status || 'Recorded',
        recorded_date: recordedDate,
        owner,
      });
    }

    // Escalate critical items as notifications for management.
    let notified = false;
    if (route.notify && event === 'create' && (!route.notifyWhen || route.notifyWhen(rec))) {
      try {
        notified = (await notifyRoutedManagement(base44.asServiceRole, entity, recordId, route.notifyType,
          `${entity.replace(/([a-z])([A-Z])/g, '$1 $2')} auto-routed: ${title}${person ? ` (${person})` : ''}`)) > 0;
      } catch (e) { console.error('Notification failed', e.message); }
    }

    // Risk register workflow: keep rating, owner, review cadence and dates current.
    let riskAutoUpdates = 0;
    if (entity === 'Risk') {
      const L = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'];
      const C = ['Insignificant', 'Minor', 'Moderate', 'Major', 'Severe'];
      const li = L.indexOf(rec.likelihood);
      const ci = C.indexOf(rec.consequence);
      if (li >= 0 && ci >= 0) {
        const score = (li + 1) * (ci + 1);
        const rating = score >= 15 ? 'Critical' : score >= 9 ? 'High' : score >= 4 ? 'Medium' : 'Low';
        const updates = {};
        if (rec.rating !== rating) updates.rating = rating;
        if (!rec.owner) updates.owner = ['Compliance', 'Financial'].includes(rec.category) ? 'Compliance Manager' : 'Team Leader';
        if (!rec.identified_date) updates.identified_date = recordedDate;
        if (!rec.review_date) {
          const d = new Date();
          d.setDate(d.getDate() + (['High', 'Critical'].includes(rating) ? 30 : rating === 'Medium' ? 90 : 180));
          updates.review_date = d.toISOString().slice(0, 10);
        }
        if (Object.keys(updates).length > 0) {
          await base44.asServiceRole.entities.Risk.update(recordId, updates);
          riskAutoUpdates = Object.keys(updates).length;
        }
      }
    }

    // Auto-create a compliance issue from serious incidents and audit findings.
    let issueCreated = false;
    if (event === 'create') {
      if (entity === 'Incident' && ['High', 'Critical'].includes(rec.severity)) {
        try {
          await base44.asServiceRole.entities.ComplianceIssue.create({
            title: `Incident: ${title}`,
            description: (pick(rec, ['description', 'immediate_actions']) || '').slice(0, 900),
            category: 'Incident',
            source: 'Incident Review',
            priority: rec.severity === 'Critical' ? 'Urgent' : 'High',
            status: 'Open',
            date_logged: recordedDate,
            logged_by: owner,
          });
          issueCreated = true;
        } catch (e) { console.error('Issue auto-create failed', e.message); }
      }
      if (entity === 'InternalAudit' && pick(rec, ['findings_identified', 'finding_reference'])) {
        try {
          await base44.asServiceRole.entities.ComplianceIssue.create({
            title: `Audit finding: ${title}`,
            description: (pick(rec, ['findings_identified', 'audit_scope']) || '').slice(0, 900),
            category: 'Governance',
            source: 'Internal Audit',
            priority: 'Medium',
            status: 'Open',
            date_logged: recordedDate,
            logged_by: pick(rec, ['auditor']) || 'Auditor',
          });
          issueCreated = true;
        } catch (e) { console.error('Issue auto-create failed', e.message); }
      }
    }

    return Response.json({ ok: true, register_id: registerEntry.id, register_type: registerType, notified, riskAutoUpdates, issueCreated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});