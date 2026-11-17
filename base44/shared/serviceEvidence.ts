// Explicit service evidence associations. A link records a reviewed association, not clinical verification.
import { hasApprovedAccess } from './roleMatrix.ts';
import { readWorkflowRecords } from './workflowSafety.ts';
const ROLES = ['admin', 'Provider Administrator', 'Administration', 'Team Leader', 'Management', 'Rostering Coordinator'];
const clean = value => typeof value === 'string' ? value.trim() : '';
const scan = (dao, query = {}) => readWorkflowRecords(dao, query, { sort: 'id' });
export async function evidenceHash(value) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(value)));
  return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, '0')).join('');
}
export const shiftEvidenceSnapshot = shift => ['Shift', shift.id, shift.tenant_id, shift.participant_name, shift.employee_name, shift.date, shift.start_time, shift.end_time];
export const noteEvidenceSnapshot = note => [note.note_entity, note.id, note.tenant_id, note.participant_name || note.person_name, note.date || note.entry_date, note.staff_name || note.staff_involved, note.what_happened || note.body, note.lifecycle_status, note.updated_date];
export function activeServiceLinks(events) {
  const groups = new Map();
  for (const event of events) groups.set(event.shift_id, [...(groups.get(event.shift_id) || []), event]);
  return [...groups.values()].map(rows => {
    rows.sort((a, b) => String(b.recorded_at).localeCompare(String(a.recorded_at)) || String(b.id).localeCompare(String(a.id)));
    if (rows[1] && rows[0].recorded_at === rows[1].recorded_at && (rows[0].note_id !== rows[1].note_id || rows[0].action !== rows[1].action)) return { ...rows[0], conflict: true };
    return rows[0];
  }).filter(row => row.action !== 'Unlink' || row.conflict);
}
export async function assessServiceEvidence(shifts, notes, events, tenantId) {
  const active = activeServiceLinks(events.filter(event => event.tenant_id === tenantId));
  return await Promise.all(shifts.map(async shift => {
    const row = { shift_id: shift.id, state: 'unlinked', label: 'No exact note link', note_entity: null, note_id: null };
    if (!tenantId || shift.tenant_id !== tenantId) return { ...row, state: 'invalid', label: 'Business scope mismatch' };
    const link = active.find(event => event.shift_id === shift.id);
    if (!link) return row;
    const sameNote = active.filter(event => event.note_entity === link.note_entity && event.note_id === link.note_id);
    if (link.conflict || sameNote.length !== 1) return { ...row, state: 'conflict', label: 'Conflicting associations need review' };
    const note = notes.find(note => note.note_entity === link.note_entity && note.id === link.note_id && note.tenant_id === tenantId);
    if (!note || note.lifecycle_status === 'Archived' || note.entry_kind && note.entry_kind !== 'Shift Note') return { ...row, state: 'changed', label: 'Linked note unavailable or archived' };
    if (link.shift_hash !== await evidenceHash(shiftEvidenceSnapshot(shift)) || link.note_hash !== await evidenceHash(noteEvidenceSnapshot(note))) return { ...row, state: 'changed', label: 'Record changed — review association' };
    if (!(clean(note.what_happened || note.body))) return { ...row, state: 'invalid', label: 'Linked note has no service content' };
    return { ...row, state: 'linked', label: 'Exact note linked', note_entity: link.note_entity, note_id: link.note_id };
  }));
}
export async function requireServiceEvidenceUser(base44, user, now = new Date()) {
  const tenantId = base44.businessId;
  if (!user?.id || !hasApprovedAccess(user) || !ROLES.includes(user.role) || !tenantId || tenantId !== (user.tenant_id || user.data?.tenant_id)) throw Object.assign(new Error('An approved service manager in this business is required.'), { status: 403 });
  const today = now.toLocaleDateString('en-CA', { timeZone: 'Australia/Brisbane' });
  const memberships = await scan(base44.asServiceRole.entities.TenantMembership, { user_id: user.id, tenant_id: tenantId, status: 'Active' });
  if (!memberships.some(row => row.user_id === user.id && row.tenant_id === tenantId && row.status === 'Active' && (!row.starts_on || row.starts_on <= today) && (!row.ends_on || row.ends_on >= today))) throw Object.assign(new Error('An active business membership is required.'), { status: 403 });
  return tenantId;
}
export async function readServiceEvidenceNotes(entities, dates) {
  const [legacy, diary] = await Promise.all([
    scan(entities.ShiftNote, { date: { $in: dates } }),
    scan(entities.CommunicationEntry, { entry_kind: 'Shift Note', entry_date: { $in: dates } })
  ]);
  return [...legacy.map(note => ({ ...note, note_entity: 'ShiftNote' })), ...diary.map(note => ({ ...note, note_entity: 'CommunicationEntry' }))];
}
export async function serviceEvidenceCommand(base44, user, body, now = new Date()) {
  const tenantId = await requireServiceEvidenceUser(base44, user, now);
  const entities = base44.entities;
  const action = body.action || 'assess';
  if (!['assess', 'options', 'link', 'unlink'].includes(action)) throw Object.assign(new Error('Unsupported service evidence action.'), { status: 400 });
  const ids = [...new Set(action === 'assess' ? body.shift_ids : [body.shift_id])];
  if (!ids.length || ids.length > 2000 || ids.some(id => typeof id !== 'string' || !id || id.length > 100)) throw Object.assign(new Error('Select valid service shift records.'), { status: 400 });
  const shifts = await scan(entities.Shift, { id: { $in: ids } });
  if (shifts.length !== ids.length || shifts.some(shift => shift.tenant_id !== tenantId)) throw Object.assign(new Error('One or more shifts are unavailable in this business.'), { status: 404 });
  const events = await scan(base44.asServiceRole.entities.ServiceEvidenceLink, { tenant_id: tenantId });
  const notes = await readServiceEvidenceNotes(entities, [...new Set(shifts.map(shift => shift.date))]);
  if (action === 'assess') return { rows: await assessServiceEvidence(shifts, notes, events, tenantId), verification: 'Associations only; not clinical verification or billing authorisation.' };
  const shift = shifts[0];
  const candidates = notes.filter(note => note.tenant_id === tenantId && note.lifecycle_status !== 'Archived' && clean(note.person_name || note.participant_name) === clean(shift.participant_name) && clean(note.entry_date || note.date) === clean(shift.date) && clean(note.body || note.what_happened));
  const current = (await assessServiceEvidence(shifts, notes, events, tenantId))[0];
  if (action === 'options') return { current, notes: candidates.map(note => ({ id: note.id, note_entity: note.note_entity, title: note.subject || 'Service note', body: note.body || note.what_happened, staff: note.staff_name || (note.staff_involved || []).join(', '), date: note.date || note.entry_date })) };
  if (body.reviewed !== true || !clean(body.reason) || body.reason.length > 1000 || !/^[a-zA-Z0-9_-]{12,100}$/.test(body.command_key || '')) throw Object.assign(new Error('Review the note, enter an association reason and provide a command reference.'), { status: 400 });
  const prior = events.find(event => event.command_key === body.command_key);
  if (prior) {
    if (prior.shift_id !== shift.id || prior.action !== (action === 'link' ? 'Link' : 'Unlink') || action === 'link' && (prior.note_id !== body.note_id || prior.note_entity !== body.note_entity)) throw Object.assign(new Error('This command reference was already used for different work.'), { status: 409 });
    return { ok: true, deduplicated: true, current };
  }
  let note, participant, worker;
  if (action === 'link') {
    note = candidates.find(note => note.note_entity === body.note_entity && note.id === body.note_id);
    if (!note) throw Object.assign(new Error('Select a factual service note for the exact participant and service date.'), { status: 400 });
    const [people, workers] = await Promise.all([scan(entities.ParticipantProfile, { full_name: shift.participant_name }), scan(entities.StaffProfile, { full_name: shift.employee_name })]);
    if (people.length !== 1 || workers.length !== 1 || [...people, ...workers].some(row => row.tenant_id !== tenantId)) throw Object.assign(new Error('Resolve participant and worker identity ambiguity before linking service evidence.'), { status: 409 });
    participant = people[0]; worker = workers[0];
    const noteWorkers = note.staff_name ? [note.staff_name] : note.staff_involved || [];
    if (!noteWorkers.includes(worker.full_name)) throw Object.assign(new Error('The service note must identify the worker assigned to this shift.'), { status: 400 });
    if (activeServiceLinks(events).some(event => event.note_id === note.id && event.note_entity === note.note_entity && event.shift_id !== shift.id)) throw Object.assign(new Error('This note is already associated with another shift. Review it before moving the association.'), { status: 409 });
  }
  const row = await base44.asServiceRole.entities.ServiceEvidenceLink.create({
    tenant_id: tenantId, shift_id: shift.id, action: action === 'link' ? 'Link' : 'Unlink', command_key: body.command_key,
    note_entity: note?.note_entity || current.note_entity || '', note_id: note?.id || current.note_id || '',
    participant_id: participant?.id || '', worker_id: worker?.id || '',
    shift_hash: await evidenceHash(shiftEvidenceSnapshot(shift)), note_hash: note ? await evidenceHash(noteEvidenceSnapshot(note)) : '',
    actor_id: user.id, actor_role: user.role, reason: body.reason.trim(), recorded_at: now.toISOString()
  });
  if (!row?.id) throw new Error('The evidence association was not confirmed. Refresh before retrying.');
  const latest = await scan(base44.asServiceRole.entities.ServiceEvidenceLink, { tenant_id: tenantId });
  return { ok: true, current: (await assessServiceEvidence(shifts, notes, latest, tenantId))[0] };
}
