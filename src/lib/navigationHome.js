import { canAccessNav, hasApprovedAccess } from './roleMatrix.js';

const ROLE_HOMES = {
  'Provider Administrator': ['dashboard', '/dashboard'],
  admin: ['dashboard', '/dashboard'],
  Management: ['dashboard', '/dashboard'],
  'Compliance Administrator': ['compliance', '/compliance'],
  'Compliance Manager': ['compliance', '/compliance'],
  Administration: ['today', '/today'],
  'Team Leader': ['team-leader', '/team-leader'],
  'Finance & Accounts Officer': ['invoicing', '/invoicing'],
  'Human Resources Manager': ['human-resources', '/hr'],
  'Rostering Coordinator': ['rostering', '/rostering'],
  'Quality & Improvement Manager': ['quality', '/quality'],
  'CRM & Marketing Officer': ['crm', '/crm'],
  'Intake Officer': ['intake', '/intake'],
  Participant: ['my-profile', '/my-profile'],
  Auditor: ['auditor-portal', '/auditor-portal'],
  Employee: ['frontline-hub', '/frontline-hub'],
  'Support Worker': ['frontline-hub', '/frontline-hub'],
};

export function navigationHome(user) {
  if (!hasApprovedAccess(user)) return '/dashboard';
  const home = ROLE_HOMES[user.role];
  return home && canAccessNav(user.role, home[0]) ? home[1] : '/dashboard';
}
