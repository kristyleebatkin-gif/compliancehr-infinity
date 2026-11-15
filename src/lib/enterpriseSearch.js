// Permission gates supplement existing server RLS and the tenant-scoped SDK client.
// This search never uses service-role access and never fetches file contents.
export const SEARCH_SOURCES = [
  { key: 'staff', label: 'Employees', entity: 'StaffProfile', permission: 'our-staff', fields: ['id', 'full_name', 'position'], match: ['full_name', 'position'] },
  { key: 'participants', label: 'Participants', entity: 'ParticipantProfile', permission: 'our-participants', fields: ['id', 'full_name', 'status'], match: ['full_name'] },
  { key: 'employeeDocuments', label: 'Employee documents', entity: 'EmployeeDocument', permission: 'documents', fields: ['id', 'title', 'document_type'], match: ['title'], output: 'documents' },
  { key: 'participantDocuments', label: 'Participant documents', entity: 'ParticipantDocument', permission: 'documents', fields: ['id', 'title', 'document_type'], match: ['title'], output: 'documents' },
  { key: 'tasks', label: 'Tasks', entity: 'TodoTask', permission: 'tasks', fields: ['id', 'title', 'status'], match: ['title'] },
  { key: 'incidents', label: 'Incidents', entity: 'Incident', permission: 'incidents', fields: ['id', 'title', 'severity', 'status'], match: ['title', 'location'] },
  { key: 'risks', label: 'Risks', entity: 'Risk', permission: 'risks', fields: ['id', 'title', 'rating', 'status'], match: ['title', 'category'] },
  { key: 'policies', label: 'Policies', entity: 'Policy', permission: 'compliance', fields: ['id', 'document_name', 'category', 'status'], match: ['document_name', 'category'] },
  { key: 'goals', label: 'Goals', entity: 'Goal', permission: 'goals', fields: ['id', 'title', 'status'], match: ['title'] },
  { key: 'assets', label: 'Assets', entity: 'Asset', permission: 'assets', fields: ['id', 'name', 'category'], match: ['name', 'category'] },
  { key: 'audits', label: 'Audits', entity: 'Audit', permission: 'compliance', fields: ['id', 'title', 'audit_type', 'status'], match: ['title', 'audit_area'] },
  { key: 'evidence', label: 'Evidence', entity: 'AuditEvidenceFile', permission: 'compliance', fields: ['id', 'title', 'standard', 'control'], match: ['title', 'standard', 'control'] },
  { key: 'training', label: 'Training', entity: 'TrainingModule', permission: 'training', fields: ['id', 'title', 'module_code', 'status'], match: ['title', 'module_code'] },
  { key: 'projects', label: 'Projects', entity: 'BusinessProject', permission: 'projects', fields: ['id', 'name', 'status'], match: ['name'] },
  { key: 'governance', label: 'Governance records', entity: 'GovernanceObject', permission: 'governance', fields: ['id', 'title', 'record_type', 'status'], match: ['title', 'object_code'] },
];
export const emptySearchResults = () => Object.fromEntries(['modules', ...SEARCH_SOURCES.map((source) => source.output || source.key)].map((key) => [key, []]));
export function searchIdentity(user) {
  const tenant = user?.tenant_id || user?.data?.tenant_id;
  return user?.id && tenant ? JSON.stringify([user.id, tenant, user.role, user.account_status, user.access_approved]) : null;
}
export function searchModules(directory, term, can) {
  const needle = term.trim().toLowerCase();
  return directory.filter((module) => can(module.key) && (module.label + ' ' + module.blurb + ' ' + module.group).toLowerCase().includes(needle)).slice(0, needle ? 6 : directory.length);
}
export async function searchEnterprise({ entities, term, can, user }) {
  const results = emptySearchResults();
  const identity = searchIdentity(user);
  if (!identity || user?.account_status !== 'Active' || user?.access_approved !== true) {
    return { results, unavailable: [], blocked: true };
  }
  const needle = term.trim().slice(0, 100);
  if (needle.length < 2) return { results, unavailable: [], blocked: false };
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const rx = { $regex: escaped, $options: 'i' };
  const tenant = user.tenant_id || user.data.tenant_id;
  const sources = SEARCH_SOURCES.filter((source) => can(source.permission));
  const responses = await Promise.allSettled(sources.map(async (source) => {
    const query = { $and: [{ tenant_id: tenant }, { $or: source.match.map((field) => ({ [field]: rx })) }] };
    const response = await entities[source.entity].filter(query, { limit: 5, fields: source.fields });
    const rows = Array.isArray(response) ? response : response?.items;
    if (!Array.isArray(rows)) throw new Error('Unexpected search response');
    // Exclude unrecognisable rows; no arbitrary record fields leave this adapter.
    return rows.filter((row) => row && typeof row.id === 'string')
      .map((row) => Object.fromEntries(source.fields.filter((field) => typeof row[field] === 'string').map((field) => [field, row[field]])))
      .slice(0, 5);
  }));
  const unavailable = [];
  responses.forEach((response, index) => {
    const source = sources[index];
    if (response.status === 'rejected') unavailable.push(source.label);
    else results[source.output || source.key] = [...results[source.output || source.key], ...response.value].slice(0, 5);
  });
  return { results, unavailable, blocked: false };
}
