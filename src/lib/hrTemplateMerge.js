import { format } from 'date-fns';

// Placeholders available in HR template content and what they pull in.
export const HR_TEMPLATE_PLACEHOLDERS = [
  { token: '{{staff_name}}', label: "Staff member's full name" },
  { token: '{{position}}', label: 'Position / role title' },
  { token: '{{position_level}}', label: 'Position level' },
  { token: '{{start_date}}', label: 'Employment start date' },
  { token: '{{employee_number}}', label: 'Employee number' },
  { token: '{{supervisor}}', label: 'Supervisor name' },
  { token: '{{staff_email}}', label: 'Staff email' },
  { token: '{{staff_phone}}', label: 'Staff phone' },
  { token: '{{hourly_rate}}', label: 'Hourly rate ($)' },
  { token: '{{date}}', label: "Today's date" },
  { token: '{{company_name}}', label: 'Company name' },
  { token: '{{sender_name}}', label: 'Sender name (you)' },
];

const prettyDate = (iso) => {
  if (!iso) return '';
  const d = new Date(`${String(iso).slice(0, 10)}T00:00:00`);
  return Number.isNaN(d.getTime()) ? '' : format(d, 'd MMMM yyyy');
};

// Merges {{placeholders}} in template content with a staff member's data.
// Unresolved tokens are left visible so the sender can fill them manually.
export function mergeHrTemplate(content, staff, branding, me) {
  const company = branding?.companyName || 'ComplianceHR Infinity';
  const values = {
    staff_name: staff?.full_name || '',
    position: staff?.position || '',
    position_level: staff?.position_level || '',
    start_date: prettyDate(staff?.start_date),
    employee_number: staff?.employee_number || '',
    supervisor: staff?.supervisor || '',
    staff_email: staff?.email || '',
    staff_phone: staff?.phone || '',
    hourly_rate: staff?.hourly_rate != null ? `$${staff.hourly_rate}` : '',
    date: format(new Date(), 'd MMMM yyyy'),
    company_name: company,
    sender_name: me ? (me.full_name || me.email) : '',
  };
  return String(content || '').replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (m, key) => {
    const v = values[key.toLowerCase()];
    return v !== undefined && v !== '' ? v : m;
  });
}

export function hasUnresolvedTokens(text) {
  return /\{\{[a-z_]+\}\}/i.test(text || '');
}