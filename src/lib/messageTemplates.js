// Standard message templates for the Communication Centre, focused on
// overdue compliance task reminders and certificate renewals.
// Placeholders use {{token}} and are filled in when the template is applied.

export const TEMPLATE_TOKEN_LABELS = {
  staff_name: "Person's name",
  task_title: 'Compliance task',
  due_date: 'Due date',
  days_overdue: 'Days overdue',
  qualification_name: 'Qualification (e.g. First Aid)',
  training_name: 'Training module',
  policy_name: 'Policy name',
  sender_name: 'Your name',
  company_name: 'Company name',
};

export const MESSAGE_TEMPLATES = [
  {
    id: 'overdue-first',
    name: 'Overdue compliance task reminder',
    category: 'Overdue tasks',
    subject: 'Reminder: compliance task {{task_title}} is overdue',
    body: 'Hi {{staff_name}},\n\nOur records show that the compliance task "{{task_title}}" was due on {{due_date}} and is now {{days_overdue}} days overdue.\n\nPlease complete this task as soon as possible. If you need help, more time, or the task has already been completed, simply reply to this email so we can update our records.\n\nThank you for helping keep our compliance current.\n\nKind regards,\n{{sender_name}}\n{{company_name}}',
  },
  {
    id: 'overdue-final',
    name: 'Final reminder before escalation',
    category: 'Overdue tasks',
    subject: 'Second and final reminder: {{task_title}} remains overdue',
    body: 'Hi {{staff_name}},\n\nThis is a second and final reminder that the compliance task "{{task_title}}" is now {{days_overdue}} days past its due date of {{due_date}}.\n\nIf it is not completed within 7 days the matter will be escalated to management in line with our compliance policy. If the task is already complete, please reply with the details so we can update our records straight away.\n\nKind regards,\n{{sender_name}}\n{{company_name}}',
  },
  {
    id: 'overdue-summary',
    name: 'Outstanding tasks summary to management',
    category: 'Overdue tasks',
    subject: 'Compliance update: outstanding overdue tasks this week',
    body: 'Hi team,\n\nHere is a summary of compliance tasks currently outstanding beyond their due date. Please review the list below and confirm completion dates or support needed for each item.\n\nOutstanding items:\n- {{task_title}} (due {{due_date}})\n\nA full register is available in the Tasks module. Please update your items by the end of the week.\n\nKind regards,\n{{sender_name}}\n{{company_name}}',
  },
  {
    id: 'expiry-firstaid',
    name: 'First aid / CPR certificate renewal',
    category: 'Renewals & certificates',
    subject: 'Action needed: your {{qualification_name}} certificate expires on {{due_date}}',
    body: 'Hi {{staff_name}},\n\nOur records show your {{qualification_name}} certificate expires on {{due_date}}. To keep your compliance current, please book a renewal course and upload your new certificate to your staff profile once completed.\n\nIf you have already renewed, reply with the certificate details and we will update your file.\n\nKind regards,\n{{sender_name}}\n{{company_name}}',
  },
  {
    id: 'expiry-policecheck',
    name: 'Police check renewal reminder',
    category: 'Renewals & certificates',
    subject: 'Reminder: police check renewal required by {{due_date}}',
    body: 'Hi {{staff_name}},\n\nYour national police check on file is due to expire on {{due_date}}. A current police check is a condition of engagement, so please start your renewal now and provide the certificate before the expiry date.\n\nIf you need assistance with the renewal process, please contact the office.\n\nKind regards,\n{{sender_name}}\n{{company_name}}',
  },
  {
    id: 'expiry-screening',
    name: 'NDIS worker screening renewal',
    category: 'Renewals & certificates',
    subject: 'Reminder: NDIS worker screening check expires {{due_date}}',
    body: 'Hi {{staff_name}},\n\nOur records show your NDIS worker screening check expires on {{due_date}}. Please begin your renewal application as soon as possible and send us the new clearance before the expiry date so there is no break in your clearance status.\n\nKind regards,\n{{sender_name}}\n{{company_name}}',
  },
  {
    id: 'training-renewal',
    name: 'Mandatory training due reminder',
    category: 'Training & policy',
    subject: 'Reminder: {{training_name}} training is due on {{due_date}}',
    body: 'Hi {{staff_name}},\n\nThe {{training_name}} training module is due to be completed by {{due_date}}. The module is available in the Training Centre and takes approximately 30 minutes.\n\nPlease complete it before the due date, or let us know if you need an extension or support to finish it.\n\nKind regards,\n{{sender_name}}\n{{company_name}}',
  },
  {
    id: 'policy-review',
    name: 'Policy review due reminder',
    category: 'Training & policy',
    subject: 'Reminder: review of {{policy_name}} is due on {{due_date}}',
    body: 'Hi {{staff_name}},\n\nAs part of our quality cycle, the {{policy_name}} policy is due for review on {{due_date}}. Please read the current version, note any improvements or required changes, and record your sign-off in the compliance register.\n\nKind regards,\n{{sender_name}}\n{{company_name}}',
  },
  {
    id: 'audit-prep',
    name: 'Audit preparation task request',
    category: 'Audit & reviews',
    subject: 'Audit preparation: please complete {{task_title}} by {{due_date}}',
    body: 'Hi {{staff_name}},\n\nWe are preparing for an upcoming audit and need your support to complete "{{task_title}}" by {{due_date}}.\n\nPlease provide the requested evidence or documents through your staff profile, and reply to this email if anything is unclear or you need a hand pulling it together.\n\nThank you for your help.\n\nKind regards,\n{{sender_name}}\n{{company_name}}',
  },
];

export function extractTemplateTokens(text) {
  const tokens = new Set();
  String(text || '').replace(/\{\{([a-z_]+)\}\}/gi, (_, token) => {
    tokens.add(token);
    return _;
  });
  return [...tokens];
}

export function fillTemplate(text, values) {
  return String(text || '').replace(/\{\{([a-z_]+)\}\}/gi, (match, token) => {
    const value = values?.[token];
    return value != null && String(value).trim() ? String(value) : match;
  });
}