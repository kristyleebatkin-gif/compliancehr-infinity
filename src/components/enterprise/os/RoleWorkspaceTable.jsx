import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Search } from 'lucide-react';
import CoverageBadge from '@/components/enterprise/os/CoverageBadge';
import { Input } from '@/components/ui/input';
import { ROLE_WORKSPACES, WORKSPACE_COUNTS, WORKSPACE_ELEMENTS } from '@/lib/enterpriseRoleWorkspaces';

/** @param {any} props */
export default function RoleWorkspaceTable() {
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return ROLE_WORKSPACES;
    return ROLE_WORKSPACES.filter((item) =>
      `${item.role} ${item.workspace} ${item.group} ${item.note}`.toLowerCase().includes(term)
    );
  }, [query]);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold leading-tight text-[#0A2B6D]">Enterprise role workspaces</h2>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-[#0A2B6D]/75">
            Every workspace is measured against the nine required elements: {WORKSPACE_ELEMENTS.join(', ')}.
            A role only appears here if a real page can serve it today.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <CoverageBadge state="live" count={WORKSPACE_COUNTS.live} />
          <CoverageBadge state="partial" count={WORKSPACE_COUNTS.partial} />
          <CoverageBadge state="gap" count={WORKSPACE_COUNTS.gap} />
        </div>
      </div>

      <div className="relative mt-3 max-w-sm">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#0A2B6D]/60" />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Find a role or workspace"
          aria-label="Find a role or workspace"
          className="pl-9"
        />
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[720px] border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              {['Role', 'Workspace', 'Coverage', 'What exists and what is missing'].map((heading) => (
                <th
                  key={heading}
                  scope="col"
                  className="border-b border-slate-200 px-3 py-2 text-left text-[11px] font-extrabold uppercase tracking-widest text-[#0A2B6D]"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.role} className="align-top">
                <td className="border-b border-slate-100 px-3 py-2">
                  <p className="font-bold text-[#0A2B6D]">{item.role}</p>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#5A00D6]">{item.group}</p>
                </td>
                <td className="border-b border-slate-100 px-3 py-2">
                  {item.status === 'gap' ? (
                    <span className="text-xs font-semibold text-[#0A2B6D]/70">{item.workspace} (shared stop-gap)</span>
                  ) : (
                    <Link
                      to={item.route}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#0072FF] hover:text-[#5A00D6]"
                    >
                      {item.workspace} <ArrowUpRight size={12} />
                    </Link>
                  )}
                </td>
                <td className="border-b border-slate-100 px-3 py-2">
                  <CoverageBadge state={item.status} />
                </td>
                <td className="border-b border-slate-100 px-3 py-2 text-xs leading-relaxed text-[#0A2B6D]/80">
                  {item.note}
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-sm text-[#0A2B6D]/70">
                  No role matches “{query}”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}