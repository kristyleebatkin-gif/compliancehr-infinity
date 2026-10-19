import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { authorizeSystemCall } from '../../shared/systemAuth.ts';

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
    notify: false,
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
    notifyType: 'General',
    notifyWhen: (rec) => ['High', 'Critical'].includes(rec?.rating),
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
};

export default async function(req) {
  try {
    const body = await req.json().catch(() => ({}));
    if (!(await authorizeSystemCall(base44, body))) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const entity = body.entity;
    const recordId = body.record_id;
    const event = body.event || 'create';
    if (!entity || !recordId || !ROUTES[entity]) {
      return Response.json({ error: 'Unsupported route' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
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
        await base44.asServiceRole.entities.Notification.create({
          type: route.notifyType,
          recipient: 'Management',
          message: `${entity.replace(/([a-z])([A-Z])/g, '$1 $2')} auto-routed: ${title}${person ? ` (${person})` : ''}`,
          read: false,
        });
        notified = true;
      } catch (e) { console.error('Notification failed', e.message); }
    }

    return Response.json({ ok: true, register_id: registerEntry.id, register_type: registerType, notified });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}