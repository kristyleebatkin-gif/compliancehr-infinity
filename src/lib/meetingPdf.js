import { buildChecklistPdf, downloadChecklistPdf } from '@/lib/checklistsPdf';

export function downloadMinutesTemplate() {
  downloadChecklistPdf({
    title: 'Meeting Minutes',
    code: 'MTG-001',
    docType: 'Minutes',
    subtitle: 'Meeting minutes and action record',
    fields: [
      { label: 'Meeting title' },
      { label: 'Meeting type' },
      { label: 'Date and time' },
      { label: 'Location / video link' },
      { label: 'Chairperson' },
      { label: 'Minute taker' },
      { label: 'Attendees', multiline: true },
      { label: 'Apologies', multiline: true },
      { label: 'Agenda items', multiline: true },
      { label: 'Discussion and decisions', multiline: true },
      { label: 'Action items (task, owner, due date)', multiline: true },
      { label: 'Next meeting date' },
    ],
    signoffFields: ['Chairperson signature', 'Date', 'Minute taker'],
  });
}

const meetingFields = (meeting) => {
  const when = [meeting.date, meeting.time].filter(Boolean).join(' at ');
  return [
    { label: 'Meeting title', value: meeting.title || '' },
    { label: 'Meeting type', value: meeting.meeting_type || '' },
    { label: 'Date and time', value: when },
    { label: 'Location / video link', value: [meeting.location, meeting.meeting_link].filter(Boolean).join('  |  ') },
    { label: 'Chairperson', value: meeting.chair || '' },
    { label: 'Minute taker', value: meeting.minute_taker || '' },
    { label: 'Attendees', value: meeting.attendees || '', multiline: true },
    { label: 'Apologies', value: meeting.attendance || '', multiline: true },
    { label: 'Agenda', value: meeting.agenda || '', multiline: true },
    { label: 'Discussion and decisions', value: meeting.minutes || '', multiline: true },
    { label: 'Meeting assessment', value: meeting.assessment || '', multiline: true },
  ];
};

export function buildMeetingMinutesPdf(meeting) {
  return buildChecklistPdf({
    title: `Meeting Minutes - ${meeting.title}`,
    code: 'MTG-002',
    docType: 'Minutes',
    subtitle: 'Recorded minutes of meeting',
    fields: meetingFields(meeting),
    signoffFields: ['Chairperson signature', 'Date', 'Minute taker'],
  });
}

export function downloadMeetingMinutesPdf(meeting) {
  downloadChecklistPdf({
    title: `Meeting Minutes - ${meeting.title}`,
    code: 'MTG-002',
    docType: 'Minutes',
    subtitle: 'Recorded minutes of meeting',
    fields: meetingFields(meeting),
    signoffFields: ['Chairperson signature', 'Date', 'Minute taker'],
  });
}

export function meetingMinutesBase64(meeting) {
  const doc = buildMeetingMinutesPdf(meeting);
  return doc.output('datauristring').split(',').pop();
}

export function parseEmails(text) {
  return String(text || '')
    .split(/[,;\s]+/)
    .map((email) => email.trim())
    .filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
}