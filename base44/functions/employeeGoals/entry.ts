import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { requireEmployee, approvedEmployeeParticipant } from '../../shared/employeeAccess.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await requireEmployee(base44);
    const text = await req.text();
    if (text.length > 16000) return Response.json({ error: 'Entry is too long.' }, { status: 400 });
    const { action, participant_id, goal_id, values = {}, cursor } = JSON.parse(text);
    const entities = base44.asServiceRole.entities;
    if (cursor != null && (typeof cursor !== 'string' || cursor.length > 4000)) return Response.json({ error: 'Invalid page.' }, { status: 400 });
    if (action === 'participants') return Response.json(await entities.ParticipantProfile.filter({ admin_approved: true }, { sort: 'full_name', fields: ['id', 'full_name'], limit: 50, cursor }));
    if (!['list', 'create', 'progress', 'notesList', 'notesCreate'].includes(action)) return Response.json({ error: 'Unsupported goal action.' }, { status: 400 });
    const person = await approvedEmployeeParticipant(base44, participant_id);
    if (action === 'list') return Response.json(await entities.Goal.filter({ participant_name: person.full_name }, { sort: '-created_date', limit: 25, cursor }));
    const boundedText = (value, max) => typeof value === 'string' && value.length <= max;
    if (action === 'create') {
      if (!boundedText(values.goal, 4000) || !values.goal.trim() || !boundedText(values.category || '', 200) || !boundedText(values.support_needed || '', 4000) || !['In Progress', 'Achieved', 'On Hold'].includes(values.status) || (values.target_date && !/^\d{4}-\d{2}-\d{2}$/.test(values.target_date))) return Response.json({ error: 'Check the goal details.' }, { status: 400 });
      const progress = Number(values.progress);
      if (!Number.isFinite(progress) || progress < 0 || progress > 100) return Response.json({ error: 'Progress must be between 0 and 100.' }, { status: 400 });
      const goal = await entities.Goal.create({ participant_name: person.full_name, goal: values.goal.trim(), category: values.category || '', support_needed: values.support_needed || '', target_date: values.target_date || undefined, progress: values.status === 'Achieved' ? 100 : progress, status: progress === 100 ? 'Achieved' : values.status, admin_approved: false });
      return Response.json({ goal });
    }
    if (typeof goal_id !== 'string' || goal_id.length > 100) return Response.json({ error: 'Select a goal.' }, { status: 400 });
    const goal = await entities.Goal.get(goal_id);
    if (!goal || goal.participant_name !== person.full_name) return Response.json({ error: 'Goal access denied.' }, { status: 403 });
    if (action === 'progress') {
      const progress = Number(values.progress);
      if (!Number.isFinite(progress) || progress < 0 || progress > 100) return Response.json({ error: 'Progress must be between 0 and 100.' }, { status: 400 });
      await entities.Goal.update(goal.id, { progress, status: progress === 100 ? 'Achieved' : goal.status === 'Achieved' ? 'In Progress' : goal.status });
      return Response.json({ success: true });
    }
    if (action === 'notesList') return Response.json(await entities.GoalProgressNote.filter({ goal_id: goal.id }, { sort: '-created_date', limit: 50, cursor }));
    if (!['Progress Note', 'Progress Report'].includes(values.entry_type) || !boundedText(values.notes || '', 8000) || !boundedText(values.file_uri || '', 2000) || !boundedText(values.file_name || '', 300) || (!values.notes?.trim() && !values.file_uri)) return Response.json({ error: 'Check the progress entry.' }, { status: 400 });
    const note = await entities.GoalProgressNote.create({ goal_id: goal.id, participant_name: person.full_name, entry_type: values.entry_type, notes: values.notes || '', file_uri: values.file_uri || undefined, file_name: values.file_name || undefined, recorded_by: user.full_name || user.email, recorded_date: new Date().toISOString().slice(0, 10) });
    return Response.json({ note });
  } catch (error) {
    return Response.json({ error: error.message || 'Goal access could not be checked.' }, { status: 403 });
  }
}