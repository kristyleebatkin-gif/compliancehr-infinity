import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

/** The nine V8000 entry points, each showing the live count of the registers behind it. */
export default function EntryPointGrid({ entryPoints = [], loading = false }) {
  const [filter, setFilter] = useState('all');
  const frameworks = useMemo(() => [...new Set(entryPoints.map((entry) => entry.label))], [entryPoints]);
  const visible = filter === 'all' ? entryPoints : entryPoints.filter((entry) => entry.label === filter);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <label className="v8-muted font-bold" htmlFor="v8-entry-filter">Show</label>
        <select
          id="v8-entry-filter"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="rounded-md border border-white/25 bg-[#0A2B6D] px-2 py-1 text-xs font-bold text-white"
        >
          <option value="all">All entry points</option>
          {frameworks.map((framework) => <option key={framework} value={framework}>{framework}</option>)}
        </select>
      </div>

      {loading ? (
        <p className="v8-sub" role="status">Reading the registers behind each entry point…</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((entry) => {
            const known = entry.counts.filter((count) => count.count !== null);
            const empty = known.length > 0 && known.every((count) => count.count === 0);
            return (
              <div key={entry.key} className="v8-panel flex h-full flex-col p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="v8-title">{entry.label}</p>
                  <Link to={entry.path} className="v8-link" aria-label={`Open ${entry.label} dashboard`}>
                    Open
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
                <p className="v8-sub mt-1 flex-1">{entry.description}</p>
                <dl className="mt-2 space-y-1">
                  {entry.counts.map((count) => (
                    <div key={count.label} className="flex items-baseline justify-between gap-2">
                      <dt className="v8-muted">{count.label}</dt>
                      <dd className="text-xs font-extrabold text-white" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {count.count === null ? 'Unavailable' : count.count}
                      </dd>
                    </div>
                  ))}
                </dl>
                {empty && <p className="v8-muted mt-2">No records yet in this register.</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}