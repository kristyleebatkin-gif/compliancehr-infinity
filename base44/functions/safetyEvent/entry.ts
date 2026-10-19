import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const ENTITY_NAMES = new Set(['Incident', 'Investigation', 'Risk', 'TakeFive', 'SafetyDocument']);
const ADMIN_ROLES = new Set(['admin', 'Provider Administrator', 'Compliance Manager', 'Administration', 'Team Leader']);

function registerType(entityType, record) {
  if (entityType === 'Incident') return 'Incident Register';
  if (entityType === 'Investigation') return 'Investigation Register';
  if (entityType === 'TakeFive') return 'Take Five Register';
  if (entityType === 'Risk') {
    if (record.report_type === 'Hazard') return 'Hazard Register';
    if (record.report_type === 'Near Miss') return 'Near Miss Register';
    return 'Risk Register';
  }
  const documentType = String(record.document_type || '');
  if (documentType === 'Incident Report') return 'Incident Register';
  if (documentType === 'Investigation Report') return 'Investigation Register';
  if (documentType === 'Near Miss Report') return 'Near Miss Register';
  if (documentType === 'Hazard Report' || documentType === 'Daily Vehicle Check') return 'Hazard Register';
  if (documentType === 'Take Five Assessment') return 'Take Five Register';
  return 'Risk Register';
}

function recordSummary(entityType, record) {
  const title = String(record.title || record.task || record.document_type || entityType);
  const entryId = String(record.incident_id || record.investigation_id || record.risk_id || record.assessment_id || record.id || '');
  const description = String(record.description || record.findings || record.hazards_identified || record.notes || '');
  const status = String(record.status || record.rating || record.risk_rating || 'Recorded');
  const recordedDate = String(record.date_occurred || record.start_date || record.identified_date || record.assessment_date || record.uploaded_date || new Date().toISOString().slice(0, 10));
  const owner = String(record.reported_by || record.investigator || record.owner || record.worker_name || record.uploaded_by || '');
  return { title, entryId, description, status, recordedDate, owner };
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const entityType = String(body.entity_type || '');
    const recordId = String(body.record_id || '');
    if (!ENTITY_NAMES.has(entityType) || !recordId) {
      return Response.json({ error: 'A supported entity_type and record_id are required.' }, { status: 400 });
    }

    // Resolve through the caller-scoped client so this function cannot be used
    // to synchronize a record the current user is not allowed to access. The
    // only fallback is a record the caller created but cannot read back.
    let record;
    try {
      record = await base44.entities[entityType].get(recordId);
    } catch {
      const owned = await base44.asServiceRole.entities[entityType].get(recordId);
      record = owned && String(owned.created_by_id || '') === String(user.id) ? owned : null;
    }
    if (!record) {
      return Response.json({ error: 'Record not found or not accessible' }, { status: 404 });
    }
    if (entityType === 'Incident') {
      const participantId = String(record.participant_id || '');
      const staffId = String(record.staff_id || '');
      let participantConsent = 'Audit declined';
      let staffConsent = 'Audit declined';
      if (participantId) {
        try {
          const participant = await base44.asServiceRole.entities.ParticipantProfile.get(participantId);
          participantConsent = participant.audit_consent || 'Audit consent received';
        } catch {
          participantConsent = 'Audit declined';
        }
      }
      if (staffId) {
        try {
          const staff = await base44.asServiceRole.entities.StaffProfile.get(staffId);
          staffConsent = staff.audit_consent || 'Audit consent received';
        } catch {
          staffConsent = 'Audit declined';
        }
      }
      await base44.asServiceRole.entities.Incident.update(recordId, {
        participant_audit_consent: participantConsent,
        staff_audit_consent: staffConsent,
      });
      record.participant_audit_consent = participantConsent;
      record.staff_audit_consent = staffConsent;
    }
    const summary = recordSummary(entityType, record);
    const payload = {
      register_type: registerType(entityType, record),
      entry_title: summary.title,
      entry_id: summary.entryId || recordId,
      description: summary.description,
      linked_entity_type: entityType,
      linked_entity_id: recordId,
      status: summary.status,
      recorded_date: summary.recordedDate,
      owner: summary.owner,
    };
    const existingPage = await base44.asServiceRole.entities.Register.filter({
      linked_entity_type: entityType,
      linked_entity_id: recordId,
    });
    const existing = (existingPage.items || existingPage)[0];
    if (existing) await base44.asServiceRole.entities.Register.update(existing.id, payload);
    else await base44.asServiceRole.entities.Register.create(payload);

    const notificationResult = { notified: 0, emailed: 0, email_failures: [] };
    if (body.notify !== false) {
      const users = await base44.asServiceRole.entities.User.list();
      const administrators = users.filter((candidate) => ADMIN_ROLES.has(candidate.role));
      const message = `${entityType} recorded: ${summary.title}. Status: ${summary.status}. Recorded by ${summary.owner || user.full_name || user.email || 'an app user'}.`;
      for (const administrator of administrators) {
        await base44.asServiceRole.entities.Notification.create({
          type: entityType === 'Incident' ? 'Incident Escalation' : 'General',
          recipient: administrator.email || administrator.full_name || administrator.role,
          recipient_id: administrator.id,
          message,
          read: false,
          linked_entity_type: entityType,
          linked_entity_id: recordId,
        });
        notificationResult.notified += 1;
        if (administrator.email) {
          try {
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: administrator.email,
              subject: `[ComplianceHR] New ${entityType}: ${summary.title}`,
              body: `${message}\n\nOpen ComplianceHR to review the complete record and required controls.`,
              from_name: 'ComplianceHR',
            });
            notificationResult.emailed += 1;
          } catch (error) {
            notificationResult.email_failures.push({
              email: administrator.email,
              error: error instanceof Error ? error.message : 'Email could not be sent',
            });
          }
        }
      }
    }

    await base44.asServiceRole.entities.AuditLog.create({
      action: existing ? 'Update' : 'Create',
      entity_type: entityType,
      record_id: recordId,
      record_title: summary.title,
      performed_by: user.full_name || user.email || 'ComplianceHR user',
      details: `${payload.register_type} synchronized${body.notify === false ? '' : ' and administrators notified'}.`,
    });

    return Response.json({ success: true, register_id: existing ? existing.id : null, ...notificationResult });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Safety event could not be processed' }, { status: 500 });
  }
}