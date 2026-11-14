import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { BUSINESS_TIME_ZONE } from '../../shared/businessTime.ts';

// Automatic document audit for staff and participant profiles.
// Triggered by the "Document Audit: Participant/Employee" workflows on every
// create/update/delete of a ParticipantDocument or EmployeeDocument record.
// Records who made the change (attributed from the app's own client log entry
// for the same change) and when, writes it to the central AuditLog and keeps
// the person's profile change log up to date.

const INTERNAL_FIELDS = new Set(['id', 'created_date', 'updated_date', 'created_by_id']);
const DISPLAY_ENTITY = { ParticipantDocument: 'Participant Document', EmployeeDocument: 'Employee Document' };
const ACTOR_ACTIONS = ['Document Updated', 'Document Uploaded', 'Document Created', 'Document Deleted', 'Documents Bulk Updated'];

const parseMaybeJson = (value) => {
  if (value && typeof value === 'object') return value;
  if (typeof value === 'string' && value.trim().startsWith('{') && !value.includes('[object')) {
    try { return JSON.parse(value); } catch { return null; }
  }
  return null;
};

const parseMaybeArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : []; } catch { return []; }
  }
  return [];
};

const fmt = (value) => {
  if (value === true) return 'Yes';
  if (value === false) return 'No';
  if (value == null || value === '') return '(empty)';
  if (Array.isArray(value)) return value.join(', ').slice(0, 120) || '(empty)';
  return String(value).slice(0, 120);
};

const label = (field) => String(field).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const entityName = body.entity_name === 'EmployeeDocument' ? 'EmployeeDocument' : 'ParticipantDocument';
    const display = DISPLAY_ENTITY[entityName];
    const isParticipant = entityName === 'ParticipantDocument';
    const eventType = ['create', 'update', 'delete'].includes(body.event_type) ? body.event_type : 'update';
    const recordId = body.record_id == null ? '' : String(body.record_id).slice(0, 120);

    let snap = parseMaybeJson(body.data);
    const oldData = parseMaybeJson(body.old_data);
    if (!snap && recordId && eventType !== 'delete') {
      try { snap = await base44.asServiceRole.entities[entityName].get(recordId); } catch { snap = null; }
    }
    snap = snap || oldData || {};

    const title = String(snap.title || snap.document_type || 'Document').slice(0, 200);
    const changed = parseMaybeArray(body.changed_fields).filter((f) => !INTERNAL_FIELDS.has(f));
    const diff = changed.slice(0, 6)
      .map((f) => {
        const before = eventType === 'create' ? '' : fmt(oldData ? oldData[f] : '');
        const after = fmt(snap[f]);
        if (before === after) return null;
        return eventType === 'create' ? `${label(f)}: ${after}` : `${label(f)}: ${before} → ${after}`;
      })
      .filter(Boolean)
      .join('; ')
      .slice(0, 800);

    const action = eventType === 'create' ? 'Document Created' : eventType === 'delete' ? 'Document Deleted' : 'Document Updated';

    // Attribute the actor from the client-side log entry raised for this change
    // (the dialogs and bulk actions log the acting user just before writing).
    let actor = null;
    try {
      const windowStart = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const page = await base44.asServiceRole.entities.AuditLog.filter(
        {
          entity_type: display,
          created_date: { $gte: windowStart },
          action: { $in: ACTOR_ACTIONS },
        },
        { sort: '-created_date', limit: 25, fields: ['id', 'record_id', 'record_title', 'action', 'details', 'performed_by', 'performed_by_user_id', 'performed_by_email', 'performed_by_role'] }
      );
      const candidates = page.items || [];
      actor = (recordId && candidates.find((e) => e.record_id === recordId))
        || candidates.find((e) => title && e.record_title === title)
        || candidates.find((e) => e.action === 'Documents Bulk Updated')
        || null;
    } catch (e) {
      console.error('Actor lookup failed:', e);
    }

    const performedBy = actor ? actor.performed_by : 'Automatic capture (system)';
    const performedById = actor ? actor.performed_by_user_id : '';
    const performedByEmail = actor ? actor.performed_by_email : '';
    const performedByRole = actor ? actor.performed_by_role : 'System';
    const profileType = isParticipant ? 'participant' : 'employee';

    // Resolve the person this document belongs to.
    let person = null;
    try {
      if (isParticipant) {
        const P = base44.asServiceRole.entities.ParticipantProfile;
        if (snap.participant_id) person = await P.get(snap.participant_id).catch(() => null);
        if (!person && snap.participant_name) {
          const page = await P.filter({ full_name: snap.participant_name }, { limit: 1 });
          person = (page.items || [])[0] || null;
        }
      } else {
        const S = base44.asServiceRole.entities.StaffProfile;
        if (snap.employee_id) person = await S.get(snap.employee_id).catch(() => null);
        if (!person && snap.employee_name) {
          const page = await S.filter({ full_name: snap.employee_name }, { limit: 1 });
          person = (page.items || [])[0] || null;
        }
      }
    } catch (e) {
      console.error('Person lookup failed:', e);
    }

    let mode = 'created';
    let auditId = null;
    if (actor) {
      // The client log entry already exists (and already updated the profile
      // change log): enrich it with the automatic change details instead of
      // creating a duplicate entry.
      const merged = [String(actor.details || '').slice(0, 700), diff ? `Changed: ${diff}` : ''].filter(Boolean).join(' | ').slice(0, 1000);
      await base44.asServiceRole.entities.AuditLog.update(actor.id, { profile_type: profileType, details: merged });
      mode = 'enriched';
      auditId = actor.id;
    } else {
      const rec = await base44.asServiceRole.entities.AuditLog.create({
        action,
        entity_type: display,
        record_id: recordId,
        record_title: title,
        performed_by: performedBy,
        performed_by_user_id: performedById,
        performed_by_email: performedByEmail,
        performed_by_role: performedByRole,
        route: 'Automatic document audit',
        details: diff,
        timestamp: new Date().toISOString(),
        profile_type: profileType,
        audit_consent: person?.audit_consent || 'Audit declined',
      });
      auditId = rec.id;
    }

    // Keep the person's profile audit trail (change log) current when the
    // client did not already record the change.
    if (!actor && person) {
      const stamp = new Intl.DateTimeFormat('en-AU', {
        timeZone: BUSINESS_TIME_ZONE, dateStyle: 'medium', timeStyle: 'short', hour12: false,
      }).format(new Date());
      const line = `${stamp} | ${action}: ${title} | by ${performedBy} (${performedByRole})${diff ? ` | ${diff}` : ''}`;
      const entity = base44.asServiceRole.entities[isParticipant ? 'ParticipantProfile' : 'StaffProfile'];
      const change_log = [person.change_log, line].filter(Boolean).join('\n').slice(-4000);
      await entity.update(person.id, { change_log });
    }

    return Response.json({ success: true, mode, id: auditId });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Document audit failed' }, { status: 500 });
  }
}