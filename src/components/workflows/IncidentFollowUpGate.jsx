import React, { useState } from 'react';
import { Loader2, RefreshCw, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import TableTab from '@/components/common/TableTab';
import useJourneyGate from './useJourneyGate';
import IncidentFollowUpRow from './IncidentFollowUpRow';
import CorrectiveActionDialog from './CorrectiveActionDialog';

export default function IncidentFollowUpGate({ canAct }) {
  const { toast } = useToast();
  const [target, setTarget] = useState(null);
  const { data, loading, error, reload } = useJourneyGate('c');
  const rows = data?.rows || [];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[12px] text-[#0A2B6D]/80">
          Closure is assessed from linked corrective actions: owner, target date, effectiveness review, evidence and approved closure.
        </p>
        <Button size="sm" variant="outline" className="ml-auto" onClick={reload} disabled={loading}>
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />} Refresh
        </Button>
      </div>

      {data && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {[
            { label: 'Needs an action', value: data.summary.needs_action },
            { label: 'Awaiting effectiveness', value: data.summary.awaiting_effectiveness },
            { label: 'Ready to close', value: data.summary.ready_to_close },
          ].map((tile) => (
            <div key={tile.label} className="rounded-xl border border-sky-200 bg-white px-3 py-2">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#0A2B6D]/70">{tile.label}</p>
              <p className="text-lg font-extrabold text-[#0A2B6D]">{tile.value}</p>
            </div>
          ))}
        </div>
      )}

      {!canAct && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-900">
          You can review these gates; recording corrective actions needs a governance role.
        </p>
      )}

      {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-800">{error}</p>}
      {loading && <p className="text-[12px] text-muted-foreground"><Loader2 className="mr-1 inline h-3.5 w-3.5 animate-spin" /> Checking incident follow-up…</p>}

      {!loading && !error && !rows.length && (
        <div className="flex items-start gap-2 rounded-xl border border-sky-200 bg-white p-4 text-[12px] text-[#0A2B6D]">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          No open incidents are awaiting closure. Closed incidents are not checked here.
        </div>
      )}

      {!!rows.length && (
        <TableTab label="Open incidents">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-sky-300">
                  <th className="px-2 py-2 text-[11px] uppercase">Incident</th>
                  <th className="px-2 py-2 text-[11px] uppercase">Severity</th>
                  <th className="px-2 py-2 text-[11px] uppercase">Owner</th>
                  <th className="px-2 py-2 text-[11px] uppercase">Actions</th>
                  <th className="px-2 py-2 text-[11px] uppercase">Closure</th>
                  <th className="px-2 py-2 text-[11px] uppercase">Why</th>
                  <th className="px-2 py-2" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <IncidentFollowUpRow key={row.incident_id} row={row} onAddAction={(r) => canAct && setTarget(r)} />
                ))}
              </tbody>
            </table>
          </div>
        </TableTab>
      )}

      {target && (
        <CorrectiveActionDialog
          incident={target}
          onClose={() => setTarget(null)}
          onSaved={(message) => {
            setTarget(null);
            toast({ title: 'Corrective action linked', description: message });
            reload();
          }}
        />
      )}
    </div>
  );
}