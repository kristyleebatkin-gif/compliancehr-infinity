import { employeeRosterIdentity } from './employeeAccess.ts';
import { hasApprovedAccess } from './appAccess.ts';
export const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export const addressedTo = (user) => ({ $or: [{ recipient_emails: user.email.toLowerCase() }, { recipients_json: { $regex: `"email"\\s*:\\s*"${escapeRegex(user.email)}"`, $options: 'i' } }] });
export const authoredBy = (user) => ({ $or: [{ employee_author_id: user.id }, { created_by_id: user.id }, { sender_email: user.email }] });
export async function personalDiaryScope(base44, user) {
  const staff = await employeeRosterIdentity(base44, user);
  return { $or: [authoredBy(user), addressedTo(user), { person_type: 'Employee', person_name: staff.full_name }] };
}
export async function keyPersonnel(base44) {
  const users = await base44.asServiceRole.entities.User.list();
  const contacts = users.filter((user) => ['admin', 'Provider Administrator', 'Management', 'Administration'].includes(user.role) && hasApprovedAccess(user)).map((user) => ({ email: user.email, name: user.full_name || user.email, type: user.role }));
  let cursor;
  for (let pageNumber = 0; pageNumber < 5; pageNumber++) {
    const page = await base44.asServiceRole.entities.KeyBusinessContact.filter({ archived: { $ne: true } }, { limit: 200, cursor, fields: ['full_name', 'email', 'role_title'] });
    contacts.push(...page.items.map((person) => ({ email: person.email, name: person.full_name, type: person.role_title || 'Business contact' })));
    if (!page.has_more) { cursor = null; break; }
    cursor = page.next_cursor;
  }
  if (cursor) throw new Error('The key-personnel directory is too large. Ask an administrator to archive inactive contacts.');
  return [...new Map(contacts.filter((person) => person.email).map((person) => [person.email.trim().toLowerCase(), { ...person, email: person.email.trim().toLowerCase() }])).values()];
}
export async function saveEmployeeCommunication(base44, user, values) {
  const now = new Date();
  const record = await base44.asServiceRole.entities.CommunicationEntry.create({ ...values, employee_author_id: user.id, sender_name: user.full_name || user.email, sender_email: user.email, entry_date: values.entry_date || now.toISOString().slice(0, 10), entry_time: values.entry_time || now.toLocaleTimeString('en-AU', { timeZone: 'Australia/Sydney', hour12: false }).slice(0, 5), module: 'Communications' });
  await base44.asServiceRole.entities.Register.create({ register_type: 'Communication Register', entry_title: record.subject || record.entry_kind, entry_id: record.id, linked_entity_type: 'CommunicationEntry', linked_entity_id: record.id, status: 'Recorded', recorded_date: record.entry_date, owner: user.full_name || user.email });
  return record;
}