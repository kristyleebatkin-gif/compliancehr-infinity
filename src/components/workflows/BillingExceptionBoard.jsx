import React, { useMemo, useState } from 'react';
import { Loader2, Receipt, RefreshCw, CalendarRange } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import TableTab from '@/components/common/TableTab';
import useJourneyGate, { runGateAction } from './useJourneyGate';
import BillingExceptionRow from './BillingExceptionRow';

const PERIODS = [
  { days: 7, label: 'Last 7 days' },
  { days: 30, label: 'Last 30 days' },
  { days: 90, label: 'Last 90 days' },
];

export default function BillingExceptionBoard({ canBill }) {
  const { toast } = useToast();
  const [days, setDays] = useState(30);
  const [selected, setSelected] = useState([]);
  const [busy, setBusy] = useState(false);
  const { data, loading, error, reload } = useJourneyGate('b', { days });
  const rows = data?.rows || [];

  const selectedTotal = useMemo(
    () => rows.filter((r) => selected.includes(r.shift_id)).reduce((sum, r) => sum + r.amount, 0),
    [rows, selected],
  );

  const toggle = (id) => setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const prepare = async () => {
    setBusy(true);
    const result = await runGateAction('bill_shifts', { shift_ids: selected, confirm: true });
    setBusy(false);
    if (!result.ok) {
      toast({ title: 'Draft invoice not created', description: result.error, variant: 'destructive' });
      return;
    }
    toast({
      title: result.message || 'Draft invoice created',
      description: `${result.billed?.length || 0} shift(s) marked invoiced. ${result.skipped?.length ? `${result.skipped.length} skipped because they are not billable.` : ''}`,
    });
    setSelected([]);
    reload();
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {PERIODS.map((p) => (
          <Button key={p.days} size="sm" variant={days === p.days ? 'default' : 'outline'} onClick={() => { setDays(p.days); setSelected([]); }}>
            <CalendarRange className="h-3.5 w-3.5" /> {p.label}
          </Button>
        ))}
        <Button size="sm" variant="outline" onClick={reload} disabled={loading}>
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />} Refresh
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[12px] font-semibold text-[#0A2B6D]">
            {selected.length} selected · ${selectedTotal.toFixed(2)}
          </span>
          <Button size="sm" onClick={prepare} disabled={!canBill || busy || !selected.length}>
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Receipt className="h-3.5 w-3.5" />} Prepare draft invoice
          </Button>
        </div>
      </div>

      {data && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: 'Ready to bill', value: data.summary.ready, tone: 'text-emerald-700' },
            { label: 'Blocked', value: data.summary.blocked, tone: 'text-rose-700' },
            { label: 'Already invoiced', value: data.summary.already_billed, tone: 'text-[#0A2B6D]' },
            { label: 'Ready value', value: `$${Number(data.summary.ready_value).toFixed(2)}`, tone: 'text-[#0A2B6D]' },
          ].map((tile) => (
            <div key={tile.label} className="rounded-xl border border-sky-200 bg-white px-3 py-2">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#0A2B6D]/70">{tile.label}</p>
              <p className={`text-lg font-extrabold ${tile.tone}`}>{tile.value}</p>
            </div>
          ))}
        </div>
      )}

      {!canBill && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-900">
          You can see the exceptions but your role cannot raise invoices. Ask a finance-capable administrator to bill the ready shifts.
        </p>
      )}

      {loading && <p className="text-[12px] text-muted-foreground"><Loader2 className="mr-1 inline h-3.5 w-3.5 animate-spin" /> Checking shifts against attendance, notes and approval…</p>}
      {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-800">{error}</p>}

      {!loading && !error && !rows.length && (
        <div className="rounded-xl border border-sky-200 bg-white p-4 text-[12px] text-[#0A2B6D]">
          No shifts were rostered between {data?.from} and {data?.to}. Once shifts exist, each one is checked here for completion, approval and a service note before it can be billed.
        </div>
      )}

      {!!rows.length && (
        <TableTab label="Shifts">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-sky-300">
                  <th className="px-2 py-2 text-[11px] uppercase">Bill</th>
                  <th className="px-2 py-2 text-[11px] uppercase">Date</th>
                  <th className="px-2 py-2 text-[11px] uppercase">Participant</th>
                  <th className="px-2 py-2 text-[11px] uppercase">Amount</th>
                  <th className="px-2 py-2 text-[11px] uppercase">State</th>
                  <th className="px-2 py-2 text-[11px] uppercase">Why</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <BillingExceptionRow key={row.shift_id} row={row} selected={selected.includes(row.shift_id)} onToggle={toggle} />
                ))}
              </tbody>
            </table>
          </div>
        </TableTab>
      )}
    </div>
  );
}