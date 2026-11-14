import React from 'react';
import { Loader2, RefreshCw, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TableTab from '@/components/common/TableTab';
import useJourneyGate from './useJourneyGate';
import GateBadge, { GateFindings } from './GateBadge';

/**
 * Roster eligibility from recorded evidence only. A worker with no recorded
 * checks is "Unknown", never "Eligible" — the screen must not certify someone
 * the organisation has not evidenced.
 */
export default function RosterEligibilityGate() {
  const { data, loading, error, reload } = useJourneyGate('d');
  const rows = data?.rows || [];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[12px] text-[#0A2B6D]/80">
          {data?.note || 'Eligibility is judged only on evidence recorded in this business.'}
        </p>
        <Button size="sm" variant="outline" className="ml-auto" onClick={reload} disabled={loading}>
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />} Refresh
        </Button>
      </div>

      {data && (
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Blocked', value: data.summary.blocked, tone: 'text-rose-700' },
            { label: 'Unknown', value: data.summary.incomplete, tone: 'text-amber-800' },
            { label: 'Evidenced', value: data.summary.ready, tone: 'text-emerald-700' },
          ].map((tile) => (
            <div key={tile.label} className="rounded-xl border border-sky-200 bg-white px-3 py-2">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#0A2B6D]/70">{tile.label}</p>
              <p className={`text-lg font-extrabold ${tile.tone}`}>{tile.value}</p>
            </div>
          ))}
        </div>
      )}

      {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-800">{error}</p>}
      {loading && <p className="text-[12px] text-muted-foreground"><Loader2 className="mr-1 inline h-3.5 w-3.5 animate-spin" /> Checking recorded screening, certificates and training…</p>}

      {!loading && !error && !rows.length && (
        <div className="flex items-start gap-2 rounded-xl border border-sky-200 bg-white p-4 text-[12px] text-[#0A2B6D]">
          <UserCheck className="mt-0.5 h-4 w-4 shrink-0" />
          No employee profiles are recorded yet, so there is nothing to judge.
        </div>
      )}

      {!!rows.length && (
        <TableTab label="Employees">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-sky-300">
                  <th className="px-2 py-2 text-[11px] uppercase">Employee</th>
                  <th className="px-2 py-2 text-[11px] uppercase">Status</th>
                  <th className="px-2 py-2 text-[11px] uppercase">Shift eligibility</th>
                  <th className="px-2 py-2 text-[11px] uppercase">Evidence gaps</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.staff_id} className="border-b border-border/70 align-top">
                    <td className="px-2 py-2 text-[12px] font-semibold text-[#0A2B6D]">
                      {row.staff_name}
                      {row.position ? <p className="text-[11px] font-normal text-muted-foreground">{row.position}</p> : null}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-[12px]">{row.status || '—'}</td>
                    <td className="px-2 py-2"><GateBadge state={row.state} /></td>
                    <td className="px-2 py-2"><GateFindings blockers={row.blockers} unknowns={row.unknowns} limit={5} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TableTab>
      )}
    </div>
  );
}