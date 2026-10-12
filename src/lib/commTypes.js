import { base44 } from '@/api/base44Client';

export const NOTE_TYPES = ['Shift Note', 'Participant Incident', 'Risk', 'Feedback', 'Issue/Concern', 'Changes', 'Progress'];

export const SHIFT_TYPES = [
  'Community Access', 'In-Home Supports', 'Domestic Assistance', 'Yard Assistance',
  'Respite', 'Capacity Building', 'Health Professional Appointment', 'Support Coordination',
];

export const APP_MODULES = [
  'Dashboard', 'Staff', 'Participants', 'Compliance Hub', 'Documents', 'Training', 'Tasks',
  'Incidents', 'Certificates', 'Risks', 'Feedback', 'Checklists', 'Assets', 'Invoicing',
  'Meetings', 'Emergency Response', 'Programs & Events', 'Communications', 'Intake',
  'Goal Progress', 'Quality Improvement', 'Key Contacts', 'Volunteers', 'Rostering',
  'Visual Boards', 'Company Safe', 'Equipment Manuals', 'MSDS Library', 'Community Council',
  'Referrals', 'NDIS Provider Portal', 'NDIS Updates', 'Quotes', 'Receipts', 'Data Control',
  'Users & Permissions',
];

export const EMPLOYEE_LOG_TYPES = [
  'Rostering & Shift Changes', 'Payroll & Timesheets', 'Invoicing & Payments',
  'Compliance Documentation', 'Incident Reporting', 'Participant Intake', 'Employee Onboarding',
  'Records & Information Requests', 'Supplier Orders', 'IT & Systems Support',
  'Policy Updates', 'Audit Preparation', 'Mail & Correspondence', 'Meeting Coordination',
  'General Administration',
];

export const COMMON_SUBJECTS = [
  'Late or missing timesheet', 'Roster change request', 'Missing document', 'System access issue',
  'Payment enquiry', 'Policy or procedure question', 'Training reminder', 'Vehicle or equipment issue',
  'Stock or supply order', 'Client or family enquiry', 'Other',
];

export const NOTE_TIPS = {
  'Shift Note': 'Tips for effective shift notes: record what you saw, heard and did - facts only, no opinions. Write it as if the family, a supervisor or an auditor will read it. Include times, who was present, and any changes to the participant\'s wellbeing. Avoid abbreviations others may not understand.',
  'Participant Incident': 'Tips for effective incident reports: report facts, not assumptions - what happened, when, where, who was present, and what you did in response. Note injuries, witnesses and notifications made. Report within required timeframes and never leave out details because they seem minor.',
  'Risk': 'Tips for effective risk reports: describe the risk clearly, who or what it affects, how likely it is, and the controls already in place. Suggest practical controls - elimination first, then engineering, then training and supervision. Update the risk register rather than keeping a personal list.',
  'Feedback': 'Tips for effective participant feedback: record feedback in the participant\'s own words where possible, note the date and context, and separate what was said from your interpretation. Include both positives and concerns, and whether the participant wants any action taken.',
  'Issue/Concern': 'Tips for effective issue/concern reports: state the issue plainly, its impact on the participant or service, and any immediate action taken. Raise it early - small concerns are easier to resolve. Note who you reported it to and when.',
  'Changes': 'Tips for recording changes: note exactly what changed (routine, health, behaviour, supports, contacts), when you noticed it, and who has been informed. Link the change to the participant\'s plan or routine so the team can adjust supports consistently.',
  'Progress': 'Tips for effective progress reports: link observations to the participant\'s goals, give concrete examples rather than general impressions, and note both progress and barriers. Keep language strengths-based and objective - describe what the participant did, not labels.',
};

const CHARACTERS = [
  { name: 'Kangaroo', emoji: '🦘' }, { name: 'Koala', emoji: '🐨' }, { name: 'Emu', emoji: '🪶' },
  { name: 'Wombat', emoji: '🐻' }, { name: 'Platypus', emoji: '🦫' }, { name: 'Kookaburra', emoji: '🐦' },
  { name: 'Echidna', emoji: '🦔' }, { name: 'Bilby', emoji: '🐭' }, { name: 'Quokka', emoji: '🐹' },
  { name: 'Cassowary', emoji: '🦤' }, { name: 'Lyrebird', emoji: '🕊️' }, { name: 'Dingo', emoji: '🐕' },
];

export function characterFor(name) {
  const key = String(name || '').toLowerCase();
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) hash = (hash * 31 + key.charCodeAt(i)) % 100000;
  return CHARACTERS[hash % CHARACTERS.length];
}

export const VOUCHERS = [
  { rank: 1, amount: 100, label: '$100 voucher' },
  { rank: 2, amount: 50, label: '$50 voucher' },
  { rank: 3, amount: 30, label: '$30 voucher' },
];

export const TEAM_STRATEGIES = [
  'Celebrate wins loudly - shout out a teammate\'s completed task at handover each week.',
  'Pair up on big tasks: two people on one difficult job beats two half-done tasks.',
  'Swap one tip a week - everyone teaches the team their single best productivity trick.',
  'Keep banter kind: sledge the spreadsheet, never the person.',
  'Close the loop - if you finalise a task, tell the person who shared it.',
];

export const COMPETITION_HISTORY = [
  { season: '2026', note: 'Current season - the first recorded season. Winners will be listed here when the competition ends on 1 December.' },
];

export const JOKES = [
  'Why did the compliance manager bring a pencil to the audit? In case they needed to draw their own conclusions.',
  'How many support workers does it take to change a lightbulb? One - but the incident report will still take longer.',
  'Why was the roster so calm? It had everything under shift control.',
  'What did the sticky note say to the task list? "You complete me."',
  'Why do auditors love nature? Everything is already in order.',
  'What is a timesheet\'s favourite music? Anything with a good fill.',
  'Why did the folder go to therapy? Too many unresolved issues.',
  'What do you call a task with no due date? A rumour.',
  'Why did the spreadsheet break up with the checklist? It found someone more cell-f sufficient.',
  'How does a kookaburra file an incident report? It just laughs, then documents it properly.',
  'Why was the printer bad at tasks? It kept jamming at the deadline.',
  'What is the fastest way to finish a to-do list? Start it before the leaderboard does.',
];

export const FUN_FACTS = [
  'A group of wombats is called a "wisdom" - fitting for a compliance team.',
  'Kangaroos cannot walk backwards - neither can a finalised task.',
  'The phrase "red tape" comes from the ribbon used to bind legal documents in the 1600s.',
  'Koalas sleep up to 20 hours a day - the current world record for work-life balance.',
  'Emus and kangaroos cannot walk backwards, which is why they appear on the Australian coat of arms.',
  'The humble checklist was popularised by pilots in 1935 and has prevented countless accidents since.',
  'Quokkas are so friendly they have been called "the world\'s happiest animal".',
  'Platypuses glow under UV light - even nature keeps a few surprises in the audit trail.',
  'The Echidna is one of only two egg-laying mammals in the world. The other is also Australian.',
  'The term "brainstorming" was coined in 1953 - teams have been finding better ways since.',
  'Dingo fences in Australia stretch longer than the distance from Sydney to Perth.',
  'Kookaburras laugh loudest at dawn - the best time to clear your inbox.',
];

export const MANAGEMENT_ROLES = ['Management', 'Team Leader', 'Compliance Manager'];

const pageItems = (result) => (Array.isArray(result) ? result : (result?.items || []));

export async function loadCommContacts() {
  const map = new Map();
  try {
    const users = await base44.entities.User.list();
    (users || []).forEach((u) => {
      if (u.email) map.set(u.email, { email: u.email, name: u.full_name || u.email, type: 'App User' });
    });
  } catch { /* user list may be restricted */ }
  try {
    const staff = await base44.entities.StaffProfile.filter({}, { limit: 300, fields: ['full_name', 'email'] });
    pageItems(staff).forEach((s) => {
      if (s.email && !map.has(s.email)) map.set(s.email, { email: s.email, name: s.full_name, type: 'Staff' });
    });
  } catch { /* ignore */ }
  try {
    const participants = await base44.entities.ParticipantProfile.filter({}, { limit: 300, fields: ['full_name', 'email'] });
    pageItems(participants).forEach((p) => {
      if (p.email && !map.has(p.email)) map.set(p.email, { email: p.email, name: p.full_name, type: 'Participant' });
    });
  } catch { /* ignore */ }
  return [...map.values()];
}

export async function loadManagementEmails() {
  const map = new Map();
  const add = (email, name) => { if (email && !map.has(email)) map.set(email, { email, name: name || email }); };
  try {
    const users = await base44.entities.User.filter({ role: 'admin' }, { limit: 200 });
    pageItems(users).forEach((u) => add(u.email, u.full_name));
  } catch { /* ignore */ }
  for (const role of MANAGEMENT_ROLES) {
    try {
      const staff = await base44.entities.StaffProfile.filter({ role }, { limit: 100, fields: ['full_name', 'email'] });
      pageItems(staff).forEach((s) => add(s.email, s.full_name));
    } catch { /* ignore */ }
  }
  return [...map.values()];
}

export async function openAttachment(att) {
  const uri = att?.uri || att?.url || '';
  if (!uri) return;
  if (/^https?:/i.test(uri)) { window.open(uri, '_blank'); return; }
  try {
    const res = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: uri, expires_in: 600 });
    if (res?.signed_url) window.open(res.signed_url, '_blank');
  } catch { /* signed url unavailable */ }
}

export function exportCsv(filename, rows) {
  const header = Object.keys(rows[0] || {});
  const lines = [header.join(',')].concat(
    rows.map((r) => header.map((h) => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(',')),
  );
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}