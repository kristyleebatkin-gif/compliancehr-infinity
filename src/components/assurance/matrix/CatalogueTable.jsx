import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const PAGE_SIZE = 30;

export default function CatalogueTable({ title, description, columns = [], rows = [], searchKeys = [] }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) => searchKeys.some((key) => String(row[key] ?? '').toLowerCase().includes(term)));
  }, [rows, search, searchKeys]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const visible = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-extrabold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => { setSearch(event.target.value); setPage(0); }}
            placeholder="Search the catalogue"
            className="pl-8"
            aria-label={`Search ${title}`}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                {columns.map((column) => (
                  <th key={column.key} className="px-3 py-2">{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visible.map((row) => (
                <tr key={row.id || row.code} className="align-top hover:bg-muted/60">
                  {columns.map((column) => (
                    <td key={column.key} className="px-3 py-2 text-sm font-medium text-foreground">
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
              {!visible.length && (
                <tr>
                  <td colSpan={columns.length} className="px-3 py-8 text-center text-sm text-muted-foreground">
                    Nothing matches this search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {pageCount > 1 && (
          <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2">
            <p className="text-[11px] font-semibold text-muted-foreground">
              Page {current + 1} of {pageCount} · {filtered.length} entries
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-md border border-border px-2 py-1 text-[11px] font-bold text-foreground disabled:opacity-40"
                disabled={current === 0}
                onClick={() => setPage(current - 1)}
              >
                Previous
              </button>
              <button
                type="button"
                className="rounded-md border border-border px-2 py-1 text-[11px] font-bold text-foreground disabled:opacity-40"
                disabled={current >= pageCount - 1}
                onClick={() => setPage(current + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}