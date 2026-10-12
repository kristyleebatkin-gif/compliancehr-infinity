import { base44 } from '@/api/base44Client';

const today = () => new Date().toISOString().slice(0, 10);

// Every diary entry is recorded on the Communication Register (kept with the other registers in the document vault).
export async function logCommunicationRegister(record) {
  if (!record?.id) return;
  try {
    await base44.entities.Register.create({
      register_type: 'Communication Register',
      entry_title: record.subject || record.entry_kind || 'Communication entry',
      entry_id: record.id,
      description: [record.entry_kind, record.note_type, record.person_name].filter(Boolean).join(' - '),
      linked_entity_type: 'CommunicationEntry',
      linked_entity_id: record.id,
      status: 'Recorded',
      recorded_date: record.entry_date || today(),
      owner: record.sender_name || '',
    });
  } catch (e) { console.error('Communication register recording failed', e); }
}

// Shift note types are routed to their matching modules: incidents, feedback, risk reporting and the to-do board.
export async function routeDiaryEntry(record) {
  await logCommunicationRegister(record);
  if (!record?.id) return;
  const noteType = record.note_type || '';
  const subject = record.subject || noteType;
  const body = record.body || '';
  const date = record.entry_date || today();
  const person = record.person_name || '';
  try {
    if (noteType === 'Employee Incident') {
      await base44.entities.Incident.create({
        title: subject,
        severity: 'Medium',
        date_occurred: date,
        reported_by: record.sender_name || '',
        participant_name: person,
        description: body,
        source_entity_type: 'Communication Diary',
        source_entity_id: record.id,
        source_form_title: 'Employee Incident (Communication Centre)',
      });
    } else if (noteType === 'Feedback Form') {
      await base44.entities.Feedback.create({
        type: 'Feedback Form',
        subject,
        message: body,
        submitted_by: record.sender_name || '',
        received_via: 'Communication Centre',
        received_date: date,
      });
      await base44.entities.Register.create({
        register_type: 'Feedback Register',
        entry_title: subject,
        entry_id: record.id,
        linked_entity_type: 'CommunicationEntry',
        linked_entity_id: record.id,
        status: 'Received',
        recorded_date: date,
        owner: record.sender_name || '',
      });
    } else if (noteType === 'Issue or Concern Report') {
      await base44.entities.Risk.create({
        title: subject.startsWith('Issue or Concern Report') ? subject : `Issue or Concern: ${subject}`,
        report_type: 'Risk',
        description: body,
        category: 'Operational',
        rating: 'Medium',
        status: 'Identified',
        owner: record.sender_name || '',
        identified_date: date,
        source_entity_type: 'Issue or Concern Report',
        source_entity_id: record.id,
        source_form_title: 'Issue or Concern Report (Communication Centre)',
      });
      await base44.entities.Register.create({
        register_type: 'Issue Concern Register',
        entry_title: subject,
        entry_id: record.id,
        linked_entity_type: 'CommunicationEntry',
        linked_entity_id: record.id,
        status: 'Identified',
        recorded_date: date,
        owner: record.sender_name || '',
      });
    } else if (noteType === 'Change Request') {
      const responsible = (record.staff_involved || [])[0] || record.sender_name || '';
      await base44.entities.TodoTask.create({
        title: subject,
        module: 'Communications',
        task_date: date,
        due_date: '',
        responsible: responsible ? [responsible] : [],
        important_info: body,
        shared_by: record.sender_name || '',
      });
    }
  } catch (e) { console.error('Diary routing failed', e); }
}