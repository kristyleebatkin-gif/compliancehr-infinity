import React, { useMemo, useState } from 'react';
import { Check, Minus, Search } from 'lucide-react';
import { explainNavAccess, normalizeRole, ACTION_PERMISSIONS, ALL_ROLES, LEGACY_ROLE_MAP } from '@/lib/roles';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import useAppUsers from '@/components/users/useAppUsers';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

// Access Explorer (backlog 17.06): who can open what, and why. Every answer comes from the
// same rules the app enforces (explainNavAccess mirrors canAccessNav; a test checks they agree).

const ROLE_CHOICES = [...new Set(['admin', ...ALL_ROLES, ...Object.keys(LEGACY_ROLE_MAP)])].filter((r) => r !== 'user');

function Tick({ allowed }) {
  return allowed ? (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-800" aria-label="Can open"><Check className="h-3.5 w-3.5" /></span>
  ) : (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-500" aria-label="Hidden"><Minus className="h-3.5 w-3.5" /></span>
  );
}

export default function AccessExplorer() {
  const { data, isLoading, enabled } = useAppUsers('');
  const people = data?.users || [];
  const [personId, setPersonId] = useState('');
  const [role, setRole] = useState('Employee');
  const [filter, setFilter] = useState('');

  const person = people.find((p) => p.id === personId) || null;
  const activeRole = person ? person.role : role;
  const effective = normalizeRole(activeRole);

  const rows = useMemo(() => MODULE_DIRECTORY
    .map((m) => ({ ...m, ...explainNavAccess(activeRole, m.key) }))
    .filter((m) => !filter || m.label.toLowerCase().includes(filter.toLowerCase())), [activeRole, filter]);
  const openCount = MODULE_DIRECTORY.filter((m) => explainNavAccess(activeRole, m.key).allowed).length;

  return (
    <section aria-label="Access explorer" className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-panel">
      <div>
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#0A2B6D]">Access explorer: who can open what, and why</h2>
        <p className="text-xs text-slate-600">Answers come from the same rules the app enforces. Page access only; each module may limit actions further.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor="access-person">Person</Label>
          <select
            id="access-person"
            className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-sm"
            value={personId}
            onChange={(e) => setPersonId(e.target.value)}
            disabled={!enabled}
          >
            <option value="">— Pick a role instead —</option>
            {people.map((p) => <option key={p.id} value={p.id}>{p.full_name || p.email} ({p.role})</option>)}
          </select>
          {isLoading && <p className="text-xs text-slate-500">Loading people…</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="access-role">Role</Label>
          <select
            id="access-role"
            className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-sm disabled:opacity-60"
            value={person ? person.role : role}
            onChange={(e) => setRole(e.target.value)}
            disabled={Boolean(person)}
          >
            {(person && !ROLE_CHOICES.includes(person.role) ? [person.role, ...ROLE_CHOICES] : ROLE_CHOICES)
              .map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="access-filter">Find a module</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
            <Input id="access-filter" className="pl-8" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="e.g. Invoicing" />
          </div>
        </div>
      </div>

      <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-800" role="status">
        <strong>{person ? (person.full_name || person.email) : activeRole}</strong>
        {effective !== activeRole && <> — <strong>{activeRole}</strong> counts as <strong>{effective}</strong> for page access</>}
        {' '}— opens <strong>{openCount}</strong> of {MODULE_DIRECTORY.length} modules.
      </p>

      <div className="max-h-[28rem] overflow-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-slate-100 text-xs uppercase text-slate-600">
            <tr><th className="p-2">Module</th><th className="p-2 text-center">Opens</th><th className="p-2">Why</th></tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.key} className="border-t border-slate-100">
                <td className="p-2 font-medium text-slate-900">{m.label}</td>
                <td className="p-2 text-center"><Tick allowed={m.allowed} /></td>
                <td className="p-2 text-slate-700">{m.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-bold text-[#0A2B6D]">Actions the server checks</h3>
        <ul className="space-y-2">
          {ACTION_PERMISSIONS.map((a) => {
            const can = a.roles.includes(activeRole);
            return (
              <li key={a.key} className="flex items-start gap-2 rounded-lg border border-slate-200 p-2.5">
                <Tick allowed={can} />
                <div className="min-w-0 text-sm">
                  <p className="font-medium text-slate-900">{a.label}</p>
                  <p className="text-xs text-slate-600">Roles: {a.roles.join(', ')}. {a.note}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
