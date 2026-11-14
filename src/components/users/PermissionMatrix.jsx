import React from 'react';
import { ALL_ROLES, canAccessNav } from '@/lib/roles';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import { ShieldCheck, Check, Minus } from 'lucide-react';

const ROLE_LABELS = {
  Guest: 'Guest',
  Participant: 'Participant',
  Employee: 'Employee',
  Administration: 'Admin',
  'Compliance Administrator': 'Compliance',
  'Provider Administrator': 'Provider Admin',
  Management: 'Management',
  Auditor: 'Auditor',
};

export default function PermissionMatrix() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-3 shadow-sm">
      <div className="mb-2.5 flex items-center gap-2 text-sm font-bold">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-sm"><ShieldCheck className="h-3.5 w-3.5" /></span>
        Role permission matrix
      </div>
      <p className="mb-2 text-xs text-muted-foreground">
        Module visibility for the {ALL_ROLES.length} roles defined in the app. Other job roles count as one of these: see the Access explorer below.
      </p>
      <div className="matrix-viewport overflow-auto">
        <table className="permission-matrix w-full text-left text-[10px]">
          <thead>
            <tr className="border-b border-border/60">
              <th className="matrix-module py-1.5 pr-2 font-semibold">Module</th>
              {ALL_ROLES.map((role) => (
                <th key={role} className="px-1.5 py-1.5 text-center">
                  <span className="matrix-role block font-bold text-foreground" title={role}>{ROLE_LABELS[role] || role}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MODULE_DIRECTORY.map((module, idx) => (
              <tr key={module.key} className={`border-b border-border/40 transition-colors hover:bg-brand/5 ${idx % 2 === 0 ? 'bg-muted/20' : ''}`}>
                <td className="py-1.5 pr-2 font-medium">{module.label}</td>
                {ALL_ROLES.map((role) => {
                  const allowed = canAccessNav(role, module.key);
                  return (
                    <td key={role} className="px-1.5 py-1.5 text-center">
                      {allowed ? (
                        <span title="Module visible" className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-safe/15 text-safe"><Check className="h-3 w-3" /></span>
                      ) : (
                        <span title="Module hidden" className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-muted text-foreground/25"><Minus className="h-3 w-3" /></span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2.5 text-xs text-muted-foreground">
        This matrix reflects the app's module visibility rules. It does not verify action-level permissions or record-level security; those need to be checked in each module and its data rules.
      </p>
    </div>
  );
}
