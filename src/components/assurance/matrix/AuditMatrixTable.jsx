import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AUDIT_DOMAINS, CRITICALITY } from '@/lib/masterAssuranceCatalogue';
import { MATRIX_STATE_ORDER, MATRIX_STATES, matrixCsv } from '@/lib/auditMatrixScoring';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 25;

function downloadCsv(rows) {
  const blob = new Blob([matrixCsv(rows)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `audit-matrix-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function AuditMatrixTable({ rows = [], domain = 'All', onDomainChange, onSelect }) {
  const [search, setSearch] = useState('');
  const [state, setState] = useState('All');
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (domain !== 'All' && row.audit_domain !== domain) return false;
      if (state !== 'All' && row.state !== state) return false;
      if (!term) return true;
      return [row.audit_code, row.audit_name, row.audit_domain, row.control_name, row.evidence_name, row.standard_code, row.indicator_code]
        .join(' ')
        .toLowerCase()
        .includes(term);
    });
  }, [rows, domain, state, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const visible = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  const reset = (setter) => (value) => {
    setter(value);
    setPage(0);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => reset(setSearch)(event.target.value)}
              placeholder="Search checkpoint, control, evidence or standard"
              className="pl-8"
              aria-label="Search the audit matrix"
            />
          </div>
          <select
            value={domain}
            onChange={(event) => reset(onDomainChange)(event.target.value)}
            className="h-9 rounded-md border border-input bg-card px-2 text-sm font-semibold text-foreground"
            aria-label="Filter by domain"
          >
            <option value="All">All domains</option>
            {AUDIT_DOMAINS.map((item) => (
              <option key={item.domain} value={item.domain}>{item.domain}</option>
            ))}
          </select>
          <select
            value={state}
            onChange={(event) => reset(setState)(event.target.value)}
            className="h-9 rounded-md border border-input bg-card px-2 text-sm font-semibold text-foreground"
            aria-label="Filter by assessment status"
          >
            <option value="All">All statuses</option>
            {MATRIX_STATE_ORDER.map((key) => (
              <option key={key} value={key}>{MATRIX_STATES[key].label}</option>
            ))}
          </select>
        </div>
        <Button variant="outline" size="sm" onClick={() => downloadCsv(filtered)}>
          <Download className="mr-1.5 h-4 w-4" /> Export matrix
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="px-3 py-2">Code</th>
                <th className="px-3 py-2">Audit checkpoint</th>
                <th className="px-3 py-2">Control</th>
                <th className="px-3 py-2">Evidence requirement</th>
                <th className="px-3 py-2">Criticality</th>
                <th className="px-3 py-2">Assessment status</th>
                <th className="px-3 py-2">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visible.map((row) => (
                <tr
                  key={row.audit_code}
                  className="cursor-pointer align-top hover:bg-muted/60"
                  onClick={() => onSelect?.(row)}
                >
                  <td className="px-3 py-2 text-xs font-bold text-brand"><button type="button" onClick={() => onSelect?.(row)} className="underline">{row.audit_code}</button></td>
                  <td className="px-3 py-2">
                    <div className="text-sm font-semibold text-foreground">{row.audit_name}</div>
                    <div className="text-[11px] font-medium text-muted-foreground">
                      {row.audit_domain} · {row.standard_code} · {row.indicator_code}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-xs font-semibold text-foreground">
                    {row.control_code}
                    <div className="text-[11px] font-medium text-muted-foreground">{row.control_name}</div>
                  </td>
                  <td className="px-3 py-2 text-xs font-semibold text-foreground">
                    {row.evidence_code}
                    <div className="text-[11px] font-medium text-muted-foreground">{row.evidence_name}</div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={cn('rounded-full border px-2 py-0.5 text-[11px] font-bold', CRITICALITY[row.criticality].tone)}>
                      {row.criticality}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={cn('rounded-full border px-2 py-0.5 text-[11px] font-bold', row.state_tone)}>
                      {row.state_label}
                    </span>
                    {row.findings_count > 0 && (
                      <div className="mt-1 text-[11px] font-semibold text-danger">{row.findings_count} open finding(s)</div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs font-bold text-foreground">
                    {row.achieved_points == null ? 'Not assessed' : `${row.achieved_points}/${row.weighting}`} 
                    <div className="text-[11px] font-medium text-muted-foreground">{row.compliance_percentage == null ? '' : `${row.compliance_percentage}%`} </div>
                  </td>
                </tr>
              ))}
              {!visible.length && (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-sm text-muted-foreground">
                    No checkpoint matches this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-3 py-2">
          <p className="text-[11px] font-semibold text-muted-foreground">
            Showing {visible.length} of {filtered.length} checkpoints · {rows.length} in the catalogue
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={current === 0} onClick={() => setPage(current - 1)}>
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <span className="text-[11px] font-bold text-foreground">Page {current + 1} of {pageCount}</span>
            <Button variant="outline" size="sm" disabled={current >= pageCount - 1} onClick={() => setPage(current + 1)}>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}