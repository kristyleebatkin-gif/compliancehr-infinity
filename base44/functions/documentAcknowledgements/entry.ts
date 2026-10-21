import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { requireEmployee, employeeRosterIdentity, employeeDocumentScope } from '../../shared/employeeAccess.ts';
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    if (!await base44.auth.isAuthenticated()) return Response.json({ error: 'Sign in to continue.' }, { status: 401 });
    const user = await base44.auth.me();
    if (!user || ['Rejected', 'Archived', 'Suspended'].includes(user.account_status)) return Response.json({ error: 'Access denied.' }, { status: 403 });
    const text = await req.text();
    if (text.length > 6000) return Response.json({ error: 'Request is too large.' }, { status: 400 });
    const { action, entity, id, cursor, confirmed, version_key } = JSON.parse(text);
    if (!['list', 'acknowledge'].includes(action) || !['EmployeeDocument', 'ParticipantDocument', 'FormSubmission'].includes(entity) || typeof id !== 'string' || !id || id.length > 100 || (cursor != null && (typeof cursor !== 'string' || cursor.length > 4000))) return Response.json({ error: 'Select a valid document.' }, { status: 400 });
    let documents;
    if (user.role === 'Employee' && entity === 'EmployeeDocument') {
      await requireEmployee(base44);
      const staff = await employeeRosterIdentity(base44, user);
      documents = await base44.asServiceRole.entities.EmployeeDocument.filter({ $and: [{ id }, employeeDocumentScope(staff, user)] }, { limit: 1 });
    } else documents = await base44.entities[entity].filter({ id }, { limit: 1 });
    const document = documents.items[0];
    if (!document) return Response.json({ error: 'Document unavailable or access denied.' }, { status: 403 });
    if (entity === 'FormSubmission' && document.status === 'Draft') return Response.json({ error: 'Complete the document before acknowledging it.' }, { status: 400 });
    const revision = document.updated_date || document.created_date || '';
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify([entity, id, revision, document.file_uri || document.file_url || document.submitted_document_url || ''])));
    const version = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
    const records = base44.asServiceRole.entities.DocumentAcknowledgement;
    const scope = { document_entity: entity, document_id: id };
    const own = { ...scope, acknowledged_by_user_id: user.id, version_key: version };
    const canReview = ['admin', 'Provider Administrator', 'Management', 'Compliance Manager', 'Administration', 'Team Leader', 'Human Resources Manager'].includes(user.role);
    if (action === 'list') {
      const [page, mine] = await Promise.all([
        records.filter({ ...scope, ...(canReview ? {} : { acknowledged_by_user_id: user.id }) }, { sort: '-acknowledged_at', limit: 25, cursor }),
        records.filter(own, { limit: 1 }),
      ]);
      return Response.json({ ...page, version_key: version, acknowledged: !!mine.items.length, can_review: canReview, title: document.title || document.form_title || document.document_type || 'Document' });
    }
    if (confirmed !== true || version_key !== version) return Response.json({ error: 'Confirm you have read the current saved revision. Reopen the log if the document has changed.' }, { status: 409 });
    const existing = await records.filter(own, { limit: 1 });
    if (existing.items.length) return Response.json({ record: existing.items[0], already_acknowledged: true });
    const record = await records.create({ ...own, document_title: document.title || document.form_title || document.document_type || 'Document', document_revision: revision, acknowledged_by_name: user.full_name || user.email, acknowledged_by_email: user.email, acknowledged_by_role: user.role, acknowledged_at: new Date().toISOString(), declaration: 'I confirm that I have read and acknowledge this saved revision of the document.' });
    return Response.json({ record });
  } catch (error) { return Response.json({ error: error.message || 'Unable to access document acknowledgements.' }, { status: 400 }); }
}