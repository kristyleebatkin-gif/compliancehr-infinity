import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MODULE_DIRECTORY, NAV_GROUPS } from '@/lib/moduleDirectory';

export default function BlueprintPreviewSection() {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('');
  const modules = MODULE_DIRECTORY.filter((item) => (!group || item.group === group) && (item.label + ' ' + item.blurb + ' ' + item.group).toLowerCase().includes(query.trim().toLowerCase()));
  return <section id="blueprint" className="scroll-mt-48 rounded-2xl border border-[#0072FF]/25 bg-white p-5 text-[#0A2B6D] sm:p-7">
    <p className="text-sm font-bold text-[#5A00D6]">Explore the platform</p>
    <h2 className="mt-2 text-2xl font-bold">One directory. {MODULE_DIRECTORY.length} connected workspaces.</h2>
    <p className="mt-2 text-sm">Explore {NAV_GROUPS.length} groups. Workspace access requires sign-in and the appropriate permissions. This catalogue describes navigation; it does not certify operational readiness.</p>
    <div className="my-5 grid gap-3 sm:grid-cols-2">
      <label className="text-sm font-semibold">Find a workspace<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search modules" className="mt-1 block min-h-11 w-full rounded-lg border border-[#0072FF]/30 bg-white px-3" /></label>
      <label className="text-sm font-semibold">Browse by group<select value={group} onChange={(event) => setGroup(event.target.value)} className="mt-1 block min-h-11 w-full rounded-lg border border-[#0072FF]/30 bg-white px-3"><option value="">All {NAV_GROUPS.length} groups</option>{NAV_GROUPS.map((item) => <option key={item.id} value={item.label}>{item.label}</option>)}</select></label>
    </div>
    <p role="status" className="mb-3 text-sm">{modules.length} of {MODULE_DIRECTORY.length} workspaces</p>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{modules.map((item) => {
      const Icon = item.icon;
      return <article key={item.key} className="flex flex-col rounded-xl border border-[#0072FF]/20 p-4">
        <p className="text-xs font-semibold text-[#5A00D6]">{item.group.replace(/^\d+\.\s*/, '')}</p>
        <h3 className="mt-2 flex items-center gap-2 text-base font-bold"><Icon size={18} aria-hidden="true" />{item.label}</h3>
        <p className="my-3 flex-1 text-sm">{item.blurb}</p>
        <Link to={'/login?returnTo=' + encodeURIComponent(item.path)} className="inline-flex min-h-11 items-center text-sm font-bold text-[#0072FF]" aria-label={'Sign in to ' + item.label}>Sign in to workspace →</Link>
      </article>;
    })}</div>
    {!modules.length && <p className="rounded-xl bg-[#0072FF]/5 p-5">No matching workspaces. Try another search or group.</p>}
  </section>;
}
