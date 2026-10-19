import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { HR_ROLES, hasAnyRole } from '../../shared/systemAuth.ts';
import { compileFileRows } from '../../shared/hrFileEvidence.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasAnyRole(user, [...HR_ROLES, 'Rostering Coordinator'])) return Response.json({ error: 'HR access required' }, { status: 403 });
    const { cursor } = await req.json();
    if (cursor != null && (typeof cursor !== 'string' || cursor.length > 4096)) return Response.json({ error: 'Invalid page' }, { status: 400 });
    // HR managers may see cross-register file summaries, never the underlying sensitive documents.
    const entities = base44.asServiceRole.entities;
    const [page, total] = await Promise.all([
      entities.StaffProfile.filter({}, { sort: 'full_name', limit: 50, fields: ['full_name', 'status', 'employee_number'], ...(cursor ? { cursor } : {}) }),
      entities.StaffProfile.count({}),
    ]);
    const staff = page.items || [];
    if (!staff.length) return Response.json({ rows: [], total, next_cursor: null, has_more: false });
    const ids = staff.map((person) => person.id);
    const numbers = staff.map((person) => person.employee_number).filter(Boolean);
    const names = staff.map((person) => person.full_name).filter(Boolean);
    const documentLink = { $or: [{ employee_id: { $in: [...ids, ...numbers] } }, { employee_name: { $in: names } }] };
    const paperworkLink = { $or: [{ staff_profile_id: { $in: ids } }, { employee_id: { $in: numbers } }, { employee_name: { $in: names } }] };
    const grouped = (entity, query, groupBy, extra = {}) => entity.aggregate({ query, groupBy, limit: 1000, ...extra });
    const [documents, contracts, descriptions, certificates, checklists, nameCounts] = await Promise.all([
      grouped(entities.EmployeeDocument, { ...documentLink, status: { $ne: 'Archived' } }, ['employee_id', 'employee_name', 'document_type', 'title']),
      grouped(entities.EmployeeEmploymentContract, { ...paperworkLink, archived: { $ne: true }, contract_status: { $in: ['Signed', 'Active'] } }, ['staff_profile_id', 'employee_id', 'employee_name']),
      grouped(entities.EmployeePositionDescription, { ...paperworkLink, archived: { $ne: true }, status: 'Acknowledged' }, ['staff_profile_id', 'employee_id', 'employee_name']),
      grouped(entities.Certificate, { $or: [{ staff_id: { $in: [...ids, ...numbers] } }, { staff_name: { $in: names } }], status: { $ne: 'Revoked' } }, ['staff_id', 'staff_name', 'module_title']),
      grouped(entities.ComplianceChecklistEntry, { checklist_key: { $in: ids.map((id) => `staff-file-checklist-${id}`) } }, 'checklist_key', { max: 'updated_date' }),
      grouped(entities.StaffProfile, { full_name: { $in: names } }, 'full_name'),
    ]);
    if ([documents, contracts, descriptions, certificates, checklists].some((group) => group.truncated)) return Response.json({ error: 'This page has too many evidence groups to calculate accurately.' }, { status: 422 });
    const latest = checklists.rows?.length ? await entities.ComplianceChecklistEntry.filter({ $or: checklists.rows.map((row) => ({ checklist_key: row.checklist_key, updated_date: row.max_updated_date })) }, { sort: '-updated_date', limit: 100, fields: ['checklist_key', 'answers'] }) : { items: [] };
    if (latest.has_more) return Response.json({ error: 'Duplicate checklist records must be resolved before calculating completeness.' }, { status: 422 });
    const evidence = [
      ...documents.rows,
      ...contracts.rows.map((row) => ({ ...row, employee_id: row.staff_profile_id || row.employee_id, document_type: 'Employment Contract' })),
      ...descriptions.rows.map((row) => ({ ...row, employee_id: row.staff_profile_id || row.employee_id, document_type: 'Position Description' })),
      ...certificates.rows.map((row) => ({ employee_id: row.staff_id, employee_name: row.staff_name, document_type: row.module_title })),
    ];
    const ambiguousNames = nameCounts.rows.filter((row) => row.count > 1).map((row) => row.full_name);
    const rows = compileFileRows(staff, evidence, latest.items, ambiguousNames);
    const summary = { average: Math.round(rows.reduce((sum, row) => sum + row.pct, 0) / rows.length), complete: rows.filter((row) => row.onFile === row.total).length };
    return Response.json({ rows, summary, total, ambiguous_names: ambiguousNames, next_cursor: page.next_cursor, has_more: page.has_more });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}