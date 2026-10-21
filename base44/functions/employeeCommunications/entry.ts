import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { requireEmployee, approvedEmployeeParticipant, employeeRosterIdentity } from '../../shared/employeeAccess.ts';
import { addressedTo, authoredBy, personalDiaryScope, keyPersonnel, saveEmployeeCommunication } from '../../shared/employeeCommunicationAccess.ts';
import { appContactEmails } from '../../shared/systemAuth.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await requireEmployee(base44);
    const text = await req.text();
    if (text.length > 25000) return Response.json({ error: 'Message is too large.' }, { status: 400 });
    const body = JSON.parse(text);
    const { action, view, cursor, participant_id, values = {} } = body;
    const entities = base44.asServiceRole.entities;
    if (cursor != null && (typeof cursor !== 'string' || cursor.length > 4000)) throw new Error('Invalid page.');
    if (action === 'contacts') return Response.json({ items: await keyPersonnel(base44) });
    if (action === 'team') return Response.json(await entities.StaffProfile.filter({ status: { $ne: 'Inactive' } }, { sort: 'full_name', fields: ['id', 'full_name'], limit: 50, cursor }));
    if (action === 'list') {
      let query;
      if (view === 'diary') query = await personalDiaryScope(base44, user);
      else if (view === 'received') query = { $and: [addressedTo(user), { sender_email: { $ne: user.email } }] };
      else if (view === 'sent') query = authoredBy(user);
      else if (view === 'logs') query = { $and: [addressedTo(user), { $or: [{ sender_email: 'system@compliancehr-portal' }, { sender_name: 'Automated Compliance Reminder' }, { sender_name: 'System (Compliance Reminders)' }] }] };
      else if (view === 'employee-log') query = { $and: [{ entry_kind: 'Employee Log' }, await personalDiaryScope(base44, user)] };
      else if (view === 'shift-notes') {
        const person = participant_id ? await approvedEmployeeParticipant(base44, participant_id) : null;
        query = { $and: [{ entry_kind: 'Shift Note' }, person ? { person_type: 'Participant', person_name: person.full_name } : authoredBy(user)] };
      } else if (view === 'video') query = { $and: [{ entry_kind: 'Video Call' }, { $or: [authoredBy(user), addressedTo(user)] }] };
      else if (view === 'banter' || view === 'shoutouts') query = { entry_kind: 'Team Banter', ...(view === 'shoutouts' ? { note_type: 'Shoutout' } : {}) };
      else if (view === 'feed') return Response.json(await entities.Announcement.filter({ audience: { $in: ['All', 'Everyone', 'All Staff', 'Staff', 'All Employees', 'Employees', 'Employee'] } }, { sort: '-created_date', limit: 25, cursor }));
      else throw new Error('Unknown communication view.');
      return Response.json(await entities.CommunicationEntry.filter(query, { sort: '-created_date', limit: 25, cursor }));
    }
    if (!['message', 'video', 'note', 'banter', 'reply'].includes(action)) throw new Error('Unsupported communication action.');
    if (await entities.CommunicationEntry.count({ employee_author_id: user.id, created_date: { $gte: new Date(Date.now() - 60000).toISOString() } }) >= 10) return Response.json({ error: 'Please wait a minute before posting again.' }, { status: 429 });
    const subject = typeof values.subject === 'string' ? values.subject.trim() : '';
    const message = typeof values.body === 'string' ? values.body.trim() : '';
    if (subject.length > 200 || message.length > 10000 || (action !== 'video' && !message)) throw new Error('Enter a message of up to 10,000 characters.');
    if (action === 'banter') {
      const person = values.staff_id ? await entities.StaffProfile.get(String(values.staff_id)) : null;
      if (values.staff_id && !person) throw new Error('Select a teammate.');
      const record = await saveEmployeeCommunication(base44, user, { entry_kind: 'Team Banter', person_type: person ? 'Employee' : 'General', person_name: person?.full_name || '', note_type: person ? 'Shoutout' : '', subject: person ? `Shoutout for ${person.full_name}` : message.slice(0, 80), body: person ? `Shoutout to ${person.full_name}: ${message}` : message });
      return Response.json({ record });
    }
    if (action === 'note') {
      const staff = await employeeRosterIdentity(base44, user);
      const person = participant_id ? await approvedEmployeeParticipant(base44, participant_id) : null;
      if (!['Shift Note', 'Employee Log'].includes(values.kind)) throw new Error('Choose a note type.');
      const kind = values.kind;
      if (kind === 'Employee Log' && person) throw new Error('Employee logs can only be about you.');
      if (values.date && !/^\d{4}-\d{2}-\d{2}$/.test(values.date)) throw new Error('Check the note date.');
      const attachments = Array.isArray(values.attachments) ? values.attachments : [];
      if (attachments.length > 5 || attachments.some((file) => typeof file.uri !== 'string' || file.uri.length > 2000 || typeof file.name !== 'string' || file.name.length > 300)) throw new Error('Choose up to five valid attachments.');
      const noteTypes = ['Shift Note', 'Employee Incident', 'Feedback Form', 'Issue or Concern Report', 'Change Request', 'Progress Notes', 'Progress Reports'];
      if (values.note_type && !noteTypes.includes(values.note_type)) throw new Error('Choose a valid note type.');
      for (const field of ['shift_type', 'log_type', 'travel_location', 'incident_report', 'issues_concerns']) if (values[field] != null && (typeof values[field] !== 'string' || values[field].length > (field === 'issues_concerns' ? 3000 : 500))) throw new Error('Check the note details.');
      if (values.medication_supervised && !['Yes', 'No'].includes(values.medication_supervised)) throw new Error('Check medication supervision.');
      const travel = Number(values.travel_km || 0);
      if (!Number.isFinite(travel) || travel < 0 || travel > 100000) throw new Error('Check the travel distance.');
      let goal;
      if (values.goal_id) {
        if (!person || typeof values.goal_id !== 'string' || values.goal_id.length > 100) throw new Error('Select an approved participant goal.');
        goal = await entities.Goal.get(values.goal_id);
        if (!goal || goal.participant_name !== person.full_name) throw new Error('This goal does not belong to the selected participant.');
      }
      const record = await saveEmployeeCommunication(base44, user, { entry_kind: kind, person_type: person ? 'Participant' : 'Employee', person_name: person?.full_name || staff.full_name, staff_involved: [staff.full_name], subject: subject || `${values.note_type || kind} - ${person?.full_name || staff.full_name}`, body: message, note_type: kind === 'Shift Note' ? values.note_type || kind : kind, log_type: kind === 'Employee Log' ? values.log_type || 'General Administration' : undefined, entry_date: values.date || undefined, attachments_json: JSON.stringify(attachments), shift_type: values.shift_type || '', travel_km: travel, travel_location: values.travel_location || '', medication_supervised: values.medication_supervised || undefined, incident_report: values.incident_report || '', issues_concerns: values.issues_concerns || '', goal: goal?.goal || '' });
      if (goal) {
        await base44.functions.invoke('employeeGoals', { action: 'notesCreate', participant_id: person.id, goal_id: goal.id, values: { entry_type: values.note_type === 'Progress Reports' ? 'Progress Report' : 'Progress Note', notes: message } });
        await entities.CommunicationEntry.update(record.id, { goal_note_created: true });
      }
      return Response.json({ record });
    }
    let recipients;
    if (action === 'reply') {
      if (typeof body.parent_id !== 'string' || body.parent_id.length > 100) throw new Error('Select a message.');
      const page = await entities.CommunicationEntry.filter({ $and: [{ id: body.parent_id }, await personalDiaryScope(base44, user)] }, { limit: 1 });
      const parent = page.items[0];
      if (!parent?.sender_email || parent.sender_email === user.email) throw new Error('This message cannot be replied to.');
      recipients = [{ email: parent.sender_email, name: parent.sender_name || parent.sender_email }];
    } else {
      const selected = Array.isArray(values.recipients) ? values.recipients : [];
      if (!selected.length || selected.length > 25 || selected.some((email) => typeof email !== 'string')) throw new Error('Select between 1 and 25 key-personnel recipients.');
      const emails = [...new Set(selected.map((email) => email.trim().toLowerCase()))];
      if (action === 'message' && values.email_mode === true && values.email_copy === true && emails.length === 1) {
        if (!(await appContactEmails(base44)).has(emails[0])) return Response.json({ error: 'Choose an email address belonging to an app user or a saved contact.' }, { status: 403 });
        recipients = [{ email: emails[0], name: emails[0] }];
      } else {
        const contacts = await keyPersonnel(base44);
        recipients = emails.map((email) => contacts.find((contact) => contact.email === email));
        if (recipients.some((recipient) => !recipient)) return Response.json({ error: 'Bulk messages and video invitations are limited to saved business contacts, management and administrators.' }, { status: 403 });
      }
    }
    if (!subject) throw new Error('Enter a subject.');
    const link = action === 'video' ? `https://meet.jit.si/chr-${crypto.randomUUID()}` : null;
    let emailResult;
    if (values.email_copy === true && action !== 'reply') {
      const response = await base44.functions.invoke('sendProfessionalEmail', { recipients: recipients.map((person) => person.email), subject, body: link ? `${message || 'Please join the video call.'}\n\n${link}` : message });
      emailResult = response.data;
      if (emailResult?.error) throw new Error(emailResult.error);
    }
    const record = await saveEmployeeCommunication(base44, user, { entry_kind: action === 'video' ? 'Video Call' : values.email_copy ? 'Email' : 'Message', person_type: 'General', subject, body: link || message, recipients_json: JSON.stringify(recipients), recipient_emails: recipients.map((person) => person.email), parent_id: action === 'reply' ? body.parent_id : undefined, email_sent: Boolean(emailResult?.sent), send_copy_emails: emailResult?.sent ? recipients.map((person) => person.email).filter((email) => !emailResult.failed?.includes(email)) : [] });
    const users = await entities.User.list();
    const recipientEmails = new Set(recipients.map((person) => person.email.toLowerCase()));
    const targets = users.filter((person) => recipientEmails.has(String(person.email).toLowerCase()));
    if (targets.length) await entities.Notification.bulkCreate(targets.map((person) => ({ type: 'General', recipient: person.email, recipient_id: person.id, message: `${user.full_name || 'An employee'}: ${subject}`, action_url: '/communications', read: false, linked_entity_type: 'CommunicationEntry', linked_entity_id: record.id })));
    return Response.json({ record, email: emailResult || null });
  } catch (error) {
    return Response.json({ error: error.message || 'Communication access denied.' }, { status: 403 });
  }
}