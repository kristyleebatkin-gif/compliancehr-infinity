import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { hasApprovedAccess } from '../../shared/appAccess.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.email) return Response.json({ error: 'Please sign in.' }, { status: 401 });
    if (!hasApprovedAccess(user) || user.role === 'Participant') return Response.json({ error: 'Staff access is required.' }, { status: 403 });
    const { action, profile_id, document, document_id, updates } = await req.json();
    if (!['load', 'attach', 'remove', 'update'].includes(action)) return Response.json({ error: 'Invalid action.' }, { status: 400 });
    const entities = base44.asServiceRole.entities;
    const profiles = await entities.StaffProfile.filter({ email: user.email }, { limit: 2 });
    if (profiles.items.length !== 1 || profiles.items[0].id !== profile_id) return Response.json({ error: 'This is not your employee profile.' }, { status: 403 });
    const staff = profiles.items[0];
    const cases = await entities.IntakeCase.filter({ intake_type: 'Employee', $or: [{ related_profile_id: staff.id }, { email: user.email }] }, { sort: '-created_date', limit: 1 });
    let intakeCase = cases.items[0];
    const initial = { intake_type: 'Employee', related_profile_id: staff.id, applicant_name: staff.full_name, email: user.email, date_of_birth: staff.date_of_birth || '', phone: staff.phone || '', address: staff.address || '', employee_role: staff.role || '', banking_details: staff.banking_details || '', superannuation_details: staff.superannuation_details || '', tax_file_number: staff.tax_file_number || '', qualifications_certificates: staff.skills || '', emergency_contact: staff.emergency_contact || '', status: 'Draft', completed_document_types: [] };
    if (!intakeCase && action === 'load') return Response.json({ intakeCase: { ...initial, id: `profile-${staff.id}` }, documents: [] });
    if (action === 'attach' && (!document || typeof document.document_type !== 'string' || document.document_type.length > 180 || typeof document.file_uri !== 'string' || document.file_uri.length > 2000 || !document.file_uri || typeof document.file_name !== 'string' || document.file_name.length > 300)) return Response.json({ error: 'Invalid document.' }, { status: 400 });
    if (action === 'update' && (!updates || Object.keys(updates).some((key) => !['completed_document_types', 'acknowledgement_log'].includes(key)) || (updates.acknowledgement_log !== undefined && (typeof updates.acknowledgement_log !== 'string' || updates.acknowledgement_log.length > 20000)))) return Response.json({ error: 'Invalid document update.' }, { status: 400 });
    if (!intakeCase) {
      if (action === 'remove') return Response.json({ error: 'Document not found.' }, { status: 404 });
      intakeCase = await entities.IntakeCase.create({ ...initial, case_number: `EIC-PROFILE-${staff.id}` });
    }
    const docPage = await entities.IntakeDocument.filter({ intake_case_id: intakeCase.id }, { sort: '-created_date', limit: 500 });
    if (docPage.has_more) return Response.json({ error: 'Please ask HR to review this intake archive before updating it.' }, { status: 409 });
    let documents = docPage.items;
    let saved;
    if (action === 'attach') {
      saved = await entities.IntakeDocument.create({ intake_case_id: intakeCase.id, intake_case_number: intakeCase.case_number, intake_type: 'Employee', profile_id: staff.id, document_type: document.document_type, file_name: document.file_name, file_uri: document.file_uri, uploaded_by: user.full_name || user.email, uploaded_date: new Date().toISOString().slice(0, 10) });
      documents = [saved, ...documents];
      if (/^(NDIS .*|Australian Commission .*|Medication Administration Training|Manual Handling Training|First Aid|CPR) Certificate$/.test(saved.document_type)) await entities.TrainingCompletion.create({ learner_type: 'Employee', learner_id: staff.id, employee_id: staff.id, learner_name: staff.full_name, employee_name: staff.full_name, module_title: saved.document_type, completed_date: saved.uploaded_date, status: 'Completed', training_notes: `Certificate attached via personal employee documents (${intakeCase.case_number}).` });
    }
    if (action === 'remove') {
      const target = documents.find((item) => item.id === document_id);
      if (!target) return Response.json({ error: 'Document not found in your intake.' }, { status: 404 });
      await entities.IntakeDocument.delete(target.id);
      documents = documents.filter((item) => item.id !== target.id);
      intakeCase.completed_document_types = (intakeCase.completed_document_types || []).filter((type) => type !== target.document_type || documents.some((item) => item.document_type === type));
    }
    if (action !== 'load') {
      const changes = { completed_document_types: [...new Set([...(intakeCase.completed_document_types || []), ...documents.map((item) => item.document_type)])], ...(action === 'update' && updates.acknowledgement_log !== undefined ? { acknowledgement_log: updates.acknowledgement_log } : {}) };
      await entities.IntakeCase.update(intakeCase.id, changes);
      intakeCase = { ...intakeCase, ...changes };
    }
    return Response.json({ intakeCase, documents, document: saved || null });
  } catch (error) {
    return Response.json({ error: error.message || 'Unable to load your employee documents.' }, { status: 500 });
  }
}