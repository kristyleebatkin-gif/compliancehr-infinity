import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';

import { requireEmployee, employeeRosterIdentity, employeeDocumentScope } from '../../shared/employeeAccess.ts';
const TYPES = ['Resume', 'Contract', 'Police Check', 'Blue Card', 'First Aid Certificate', 'CPR Certificate', 'NDIS Worker Screening', "Driver's License", 'Qualifications', 'Reference Check', 'Staff Badge', 'Other'];
export default perBusiness(async function(req) {
  try {
    const base44 = createScopedClientFromRequest(req);
    const user = await requireEmployee(base44);
    const text = await req.text();
    if (text.length > 16000) throw new Error('Record is too large.');
    const { action, view, values = {}, cursor, id } = JSON.parse(text);
    if (cursor != null && (typeof cursor !== 'string' || cursor.length > 4000)) throw new Error('Invalid page.');
    const entities = base44.asServiceRole.entities;
    const staff = await employeeRosterIdentity(base44, user);
    const taskScope = { $or: [{ assigned_email: user.email }, { responsible_emails: user.email }, { assigned_to: staff.full_name }, { responsible: staff.full_name }] };
    if (action === 'list') {
      const options = { sort: '-created_date', limit: 25, cursor };
      if (view === 'feedback') return Response.json(await entities.Feedback.filter({ $or: [{ created_by_id: user.id }, { assigned_email: user.email }] }, options));
      if (view === 'complaints') return Response.json(await entities.Complaint.filter({ $or: [{ created_by_id: user.id }, { complainant_name: staff.full_name, complainant_relationship: 'Staff' }] }, options));
      if (view === 'documents') return Response.json(await entities.EmployeeDocument.filter(employeeDocumentScope(staff, user), options));
      if (view === 'certificates') return Response.json(await entities.Certificate.filter({ $or: [{ staff_id: staff.id }, { staff_id: { $in: [null, ''] }, staff_name: staff.full_name }] }, options));
      if (view === 'training') return Response.json(await entities.TrainingCompletion.filter({ $or: [{ learner_id: user.id }, { employee_id: staff.id }, { employee_id: { $in: [null, ''] }, learner_id: { $in: [null, ''] }, employee_name: staff.full_name }, { created_by_id: user.id }] }, { ...options, sort: '-completed_date', limit: 200 }));
      if (view === 'tasks') {
        if (id != null && (typeof id !== 'string' || !id || id.length > 100)) throw new Error('Invalid task.');
        return Response.json(await entities.TodoTask.filter({ $and: [taskScope, { archived: { $ne: true } }, ...(id ? [{ id }] : [])] }, options));
      }
      throw new Error('Unknown personal-record view.');
    }
    if (action === 'startTask' || action === 'finaliseTask') {
      if (typeof id !== 'string' || id.length > 100) throw new Error('Select a task.');
      const page = await entities.TodoTask.filter({ $and: [{ id }, taskScope] }, { limit: 1 });
      if (!page.items[0]) throw new Error('This task is not assigned to you.');
      if (page.items[0].archived || ['Finalised', 'Completed', 'Cancelled', 'Pending Approval'].includes(page.items[0].status)) throw new Error('This task is closed or already awaiting manager sign-off.');
      if (action === 'startTask') {
        await entities.TodoTask.update(id, { status: 'In Progress' });
        return Response.json({ success: true });
      }
      const minutes = Number(values.minutes);
      if (!Number.isFinite(minutes) || minutes < 0 || minutes > 100000) throw new Error('Enter valid time taken.');
      await entities.TodoTask.update(id, { status: 'Pending Approval', completed_date: new Date().toISOString().slice(0, 10), completed_by: staff.full_name, time_taken_minutes: minutes });
      return Response.json({ success: true });
    }
    if (action === 'document') {
      if (typeof values.title !== 'string' || !values.title.trim() || values.title.length > 200 || !TYPES.includes(values.document_type) || typeof values.file_uri !== 'string' || !values.file_uri || values.file_uri.length > 2000 || (values.notes && (typeof values.notes !== 'string' || values.notes.length > 4000)) || (values.expiry_date && !/^\d{4}-\d{2}-\d{2}$/.test(values.expiry_date))) throw new Error('Check the document details.');
      const record = await entities.EmployeeDocument.create({ title: values.title.trim(), document_type: values.document_type, employee_id: staff.id, employee_name: staff.full_name, file_uri: values.file_uri, expiry_date: values.expiry_date || undefined, notes: values.notes || '', status: 'Current' });
      return Response.json({ record });
    }
    if (action === 'complaint') {
      if (typeof values.subject !== 'string' || !values.subject.trim() || values.subject.length > 200 || typeof values.body !== 'string' || !values.body.trim() || values.body.length > 10000) throw new Error('Enter a title and complaint.');
      const record = await entities.Complaint.create({ title: values.subject.trim(), description: values.body.trim(), complaint_id: `CMP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, complainant_name: staff.full_name, complainant_relationship: 'Staff', date_received: new Date().toISOString().slice(0, 10), status: 'Received', category: 'Other', priority: 'Medium' });
      return Response.json({ record });
    }
    if (action === 'trainingCompletion') {
      if (!/^LMS-(?:[1-9]|[1-4][0-9]|50)$/.test(values.training_module_id || '') || typeof values.module_title !== 'string' || !values.module_title.trim() || values.module_title.length > 200 || typeof values.company_name !== 'string' || values.company_name.length > 200 || !/^\d{4}-\d{2}-\d{2}$/.test(values.expiry_date || '') || !Number.isFinite(Number(values.score)) || Number(values.score) < 0 || Number(values.score) > 100) throw new Error('Invalid training completion.');
      const record = await entities.TrainingCompletion.create({ employee_id: staff.id, employee_name: staff.full_name, learner_type: 'Employee', learner_id: user.id, learner_name: staff.full_name, company_name: values.company_name, training_module_id: values.training_module_id, module_title: values.module_title.trim(), score: Number(values.score), completed_date: new Date().toISOString().slice(0, 10), expiry_date: values.expiry_date, certificate_number: /^CHR-[A-Za-z0-9-]{1,80}$/.test(values.certificate_number || '') ? values.certificate_number : `CHR-${crypto.randomUUID().slice(0, 12).toUpperCase()}`, status: 'Completed' });
      return Response.json({ record });
    }
    if (action === 'trainingCertificate') {
      const page = await entities.TrainingCompletion.filter({ learner_id: user.id, certificate_number: String(values.certificate_number || '') }, { limit: 1 });
      const completion = page.items[0];
      if (!completion || completion.employee_id !== staff.id) throw new Error('This completion does not belong to you.');
      const existing = await entities.Certificate.filter({ staff_id: staff.id, certificate_number: completion.certificate_number }, { limit: 1 });
      const record = existing.items[0] || await entities.Certificate.create({ staff_id: staff.id, staff_name: staff.full_name, certificate_number: completion.certificate_number, training_module_id: completion.training_module_id, module_title: completion.module_title, issue_date: completion.completed_date, expiry_date: completion.expiry_date, score: completion.score, status: 'Current', issued_by: `${completion.company_name || 'ComplianceHR'} Training Hub` });
      if (!existing.items[0]) {
        const reminder = new Date(completion.expiry_date); reminder.setDate(reminder.getDate() - 30);
        await entities.Register.create({ register_type: 'Training Register', entry_title: `${completion.module_title} — ${staff.full_name}`, entry_id: record.certificate_number, status: 'Completed', recorded_date: completion.completed_date, owner: staff.full_name, linked_entity_type: 'TrainingCompletion', linked_entity_id: completion.id });
        await entities.TodoTask.create({ title: `${completion.module_title} — training renewal`, task_type: 'Training Renewal', assigned_to: staff.full_name, assigned_email: user.email, due_date: reminder.toISOString().slice(0, 10), status: 'Open', priority: 'Medium', linked_entity_type: 'TrainingCompletion', linked_entity_id: completion.id, notes: `Renewal reminder. Certificate ${record.certificate_number} expires ${completion.expiry_date}.` });
        await entities.AuditLog.create({ action: 'Training Completed', entity_type: 'TrainingCompletion', record_id: completion.id, record_title: `${completion.module_title} — ${staff.full_name}`, performed_by: user.full_name || user.email, performed_by_user_id: user.id, performed_by_email: user.email, timestamp: new Date().toISOString() });
      }
      return Response.json({ record });
    }
    if (action === 'certificateFile') {
      const certificate = typeof id === 'string' && id.length <= 100 ? await entities.Certificate.get(id) : null;
      if (!certificate || certificate.staff_id !== staff.id || typeof values.file_uri !== 'string' || !values.file_uri || values.file_uri.length > 2000) throw new Error('Certificate access denied.');
      await entities.Certificate.update(id, { file_url: values.file_uri });
      return Response.json({ success: true });
    }
    throw new Error('Unsupported personal-record action.');
  } catch (error) { return Response.json({ error: error.message || 'Personal-record access denied.' }, { status: 403 }); }
});