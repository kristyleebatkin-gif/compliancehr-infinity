import React from 'react';
import { NAV_PERMISSIONS, ALL_ROLES } from '@/lib/roles';
import { ShieldCheck, Check, Minus } from 'lucide-react';

const MODULE_LABELS = {
  dashboard: 'Dashboard', participants: 'Participant Profiles', 'visual-boards': 'Visual Boards',
  intake: 'Intake Centre', staff: 'Staff Profiles', training: 'Training Centre', compliance: 'Compliance Centre',
  incidents: 'Incident Clinic', risks: 'Risk Reporting', 'audit-centre': 'Audit Centre', documents: 'Document Vault',
  'company-safe': 'Company Safe', certificates: 'Certificates', feedback: 'Feedback & Surveys', 'audit-log': 'Audit Log',
  tasks: 'Tasks', quality: 'Quality & Improvement', assets: 'Asset Management', goals: 'Goal Progress',
  shifts: 'Shift Scheduling (legacy)', rostering: 'Rostering', 'human-resources': 'Human Resources',
  invoicing: 'Invoicing Centre', quotes: 'Quote Centre', manual: 'Manual', users: 'Users & Permissions', forms: 'Forms',
  checklists: 'Checklists', 'emergency-response': 'Emergency Response', meetings: 'Meeting Centre',
  'data-control': 'Data Control Panel', receipts: 'Receipt Hub', 'equipment-manuals': 'Equipment Manuals',
  msds: 'MSDS Chemical Library', 'community-council': 'Community & Council', 'insurance-finance': 'Insurance & Finance',
  programs: 'Programs & Events', events: 'Events', 'ndis-news': 'NDIS Updates & News', weather: 'Weather',
  'key-contacts': 'Key Personnel Contacts', 'community-referral': 'Referral & Support', 'ndis-provider': 'NDIS Provider Portal',
  'volunteering-placements': 'Volunteering & Placements', 'whats-on': "What's On", communications: 'Communication Centre',
  portal: 'Participant Portal', 'safety-insights': 'Safety Insights', analytics: 'Business Analytics',
  crm: 'CRM & Leads', procurement: 'Procurement', projects: 'Projects Hub', help: 'Help Centre',
  'user-guides': 'User Guides',
  notifications: 'Notifications', 'safety-insights': 'Safety Insights',
};

const ROLE_COLUMNS = [
  ['Provider Admin', ['admin', 'Provider Administrator']],
  ['Compliance Mgr', ['Compliance Manager']],
  ['Admin / Team Ldr', ['Administration', 'Team Leader']],
  ['Support Worker', ['Support Worker']],
  ['Finance', ['Finance & Accounts Officer']],
  ['HR Manager', ['Human Resources Manager']],
  ['Rostering Coord', ['Rostering Coordinator']],
  ['Quality Mgr', ['Quality & Improvement Manager']],
  ['CRM & Marketing', ['CRM & Marketing Officer']],
  ['Intake Officer', ['Intake Officer']],
  ['Participant', ['Participant']],
  ['Auditor', ['Auditor']],
  ['Volunteer', ['Volunteer']],
];

// Special row-level rules on top of the simple module access above.
const SPECIAL_RULES = {
  staff: 'Support Workers see only their own profile and records',
  participants: 'Participants see only their own profile and records',
  documents: 'Support Workers manage only their own documents; participant vaults are self-scoped',
  tasks: 'Everyone sees tasks allocated to them; management roles see the full register',
  feedback: 'Records are also visible to the assigned staff member by email',
  'audit-log': 'Auditors can only see records where audit consent was received',
  communications: 'Employees and participants see restricted tabs and their own diary only',
  'company-safe': 'Business details visible to all roles; passwords and banking restricted to finance/admin',
  users: 'Only admins can list, update or delete other users',
  goals: 'Participants see progress notes for their own goals',
  rostering: 'Staff see their own shifts and availability; coordinators manage the roster',
};


export default function PermissionMatrix() {
  const modules = Object.keys(NAV_PERMISSIONS).filter((k) => MODULE_LABELS[k]);

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-3 shadow-sm">
      <div className="mb-2.5 flex items-center gap-2 text-sm font-bold">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-sm"><ShieldCheck className="h-3.5 w-3.5" /></span>
        Role permission matrix
      </div>
      <div className="overflow-x-auto">
        <table className="permission-matrix w-full text-left text-[10px]">
          <thead>
            <tr className="border-b border-border/60">
              <th className="matrix-module py-1.5 pr-2 font-semibold">Module</th>
              {ROLE_COLUMNS.map(([label]) => (
                <th key={label} className="px-1.5 py-1.5 text-center">
                  <span className="matrix-role block font-bold text-foreground" title={label}>{label}</span>
                </th>
              ))}

            </tr>
          </thead>
          <tbody>
            {modules.map((m, idx) => {
              const allowed = NAV_PERMISSIONS[m] || ALL_ROLES;
              return (
                <tr key={m} className={`border-b border-border/40 transition-colors hover:bg-brand/5 ${idx % 2 === 0 ? 'bg-muted/20' : ''}`}>
                  <td className="py-1.5 pr-2 font-medium">{MODULE_LABELS[m]}</td>
                  {ROLE_COLUMNS.map(([label, roles]) => {
                    const ok = roles.some((r) => allowed.includes(r));
                    return (
                      <td key={label} className="px-1.5 py-1.5 text-center">
                        {ok ? (
                          <span title="Access" className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-safe/15 text-safe"><Check className="h-3 w-3" /></span>
                        ) : (
                          <span title="No access" className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-muted text-foreground/25"><Minus className="h-3 w-3" /></span>
                        )}
                      </td>
                    );
                  })}

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <details className="mt-2 text-[10px]">
        <summary className="cursor-pointer font-semibold">Special access rules</summary>
        <div className="mt-1 grid gap-1 sm:grid-cols-2">
          {Object.entries(SPECIAL_RULES).map(([key, rule]) => <p key={key}><strong>{MODULE_LABELS[key]}:</strong> {rule}</p>)}
        </div>
      </details>
      <p className="mt-2.5 text-xs text-muted-foreground">
        "All roles" modules (dashboard, key contacts, programs, community lookup) are visible to everyone, including participants and auditors.
        Detailed per-record permissions are enforced by row-level security on every module.
      </p>
    </div>
  );
}