import React from 'react';
import { NAV_PERMISSIONS, ALL_ROLES } from '@/lib/roles';
import { ShieldCheck } from 'lucide-react';

const MODULE_LABELS = {
  dashboard: 'Dashboard', participants: 'Participant Profiles', 'visual-boards': 'Visual Boards',
  intake: 'Intake Centre', staff: 'Staff Profiles', training: 'Training Centre', compliance: 'Compliance Centre',
  incidents: 'Incident Clinic', risks: 'Risk Reporting', 'audit-centre': 'Audit Centre', documents: 'Document Vault',
  'company-safe': 'Company Safe', certificates: 'Certificates', feedback: 'Feedback & Surveys', 'audit-log': 'Audit Log',
  tasks: 'Tasks', quality: 'Quality & Improvement', assets: 'Asset Management', goals: 'Goal Progress',
  shifts: 'Shift Scheduling (legacy)', rostering: 'Rostering', 'human-resources': 'Human Resources',
  invoicing: 'Invoicing Centre', manual: 'Manual', users: 'Users & Permissions', forms: 'Forms',
  checklists: 'Checklists', 'emergency-response': 'Emergency Response', meetings: 'Meeting Centre',
  'data-control': 'Data Control Panel', receipts: 'Receipt Hub', 'equipment-manuals': 'Equipment Manuals',
  msds: 'MSDS Chemical Library', 'community-council': 'Community & Council', 'insurance-finance': 'Insurance & Finance',
  programs: 'Programs & Events', events: 'Events', 'ndis-news': 'NDIS Updates & News', weather: 'Weather',
  'key-contacts': 'Key Personnel Contacts', 'community-referral': 'Referral & Support', 'ndis-provider': 'NDIS Provider Portal',
  'volunteering-placements': 'Volunteering & Placements', 'whats-on': "What's On", communications: 'Communication Centre',
  portal: 'Participant Portal', 'safety-insights': 'Safety Insights',
};

const ROLE_COLUMNS = [
  ['admin / Provider Administrator', ['admin', 'Provider Administrator']],
  ['Compliance Manager', ['Compliance Manager']],
  ['Administration / Team Leader', ['Administration']],
  ['Support Worker', ['Support Worker']],
  ['Participant', ['Participant']],
  ['Auditor', ['Auditor']],
];

export default function PermissionMatrix() {
  const modules = Object.keys(NAV_PERMISSIONS).filter((k) => MODULE_LABELS[k]);

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="h-4 w-4 text-brand" />Role permission matrix</div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-xs">
          <thead>
            <tr className="border-b border-border/60">
              <th className="py-2 pr-3 font-semibold">Module</th>
              {ROLE_COLUMNS.map(([label]) => <th key={label} className="px-2 py-2 font-semibold">{label}</th>)}
            </tr>
          </thead>
          <tbody>
            {modules.map((m) => {
              const allowed = NAV_PERMISSIONS[m] || ALL_ROLES;
              return (
                <tr key={m} className="border-b border-border/40">
                  <td className="py-1.5 pr-3">{MODULE_LABELS[m]}</td>
                  {ROLE_COLUMNS.map(([label, roles]) => {
                    const ok = roles.some((r) => allowed.includes(r));
                    return (
                      <td key={label} className="px-2 py-1.5">
                        <span className={ok ? 'text-safe font-medium' : 'text-foreground/25'}>{ok ? 'Access' : 'No access'}</span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        "All roles" modules (dashboard, key contacts, programs, community lookup) are visible to everyone, including participants and auditors.
        Detailed per-record permissions are enforced by row-level security on every module.
      </p>
    </div>
  );
}