import React, { useState } from 'react';
import { Loader2, RefreshCw, FileCheck2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import TableTab from '@/components/common/TableTab';
import useJourneyGate, { runGateAction } from './useJourneyGate';
import DocumentReleaseRow from './DocumentReleaseRow';
import RevisionDialog from './RevisionDialog';

export default function DocumentReleaseGate({ canGovern }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [revising, setRevising] = useState(null);
  const { data, loading, error, reload } = useJourneyGate('e');
  const rows = data?.rows || [];

  const acknowledge = async (row) => {
    setBusy(true);
    const result = await runGateAction('record_acknowledgement', { document_id: row.document_id });
    setBusy(false);
    toast({
      title: result.ok ? 'Acknowledgement recorded' : 'Not acknowledged',
      description: result.message || result.error,
      variant: result.ok ? undefined : 'destructive',
    });
    if (result.ok) reload();
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[12px] text-[#0A2B6D]/80">
          Only an approved version with recorded approver and approval date can be acknowledged. Editing an approved version opens a new draft instead.
        </p>
        <Button size="sm" variant="outline" className="ml-auto" onClick={reload} disabled={loading}>
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />} Refresh
        </Button>
      </div>

      {data && (
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Awaiting my acknowledgement', value: data.summary.awaiting_my_acknowledgement },
            { label: 'Not releasable', value: data.summary.not_releasable },
            { label: 'Acknowledged by me', value: data.summary.acknowledged },
          ].map((tile) => (
            <div key={tile.label} className="rounded-xl border border-sky-200 bg-white px-3 py-2">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#0A2B6D]/70">{tile.label}</p>
              <p className="text-lg font-extrabold text-[#0A2B6D]">{tile.value}</p>
            </div>
          ))}
        </div>
      )}

      {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-800">{error}</p>}
      {loading && <p className="text-[12px] text-muted-foreground"><Loader2 className="mr-1 inline h-3.5 w-3.5 animate-spin" /> Checking controlled documents…</p>}

      {!loading && !error && !rows.length && (
        <div className="flex items-start gap-2 rounded-xl border border-sky-200 bg-white p-4 text-[12px] text-[#0A2B6D]">
          <FileCheck2 className="mt-0.5 h-4 w-4 shrink-0" />
          No controlled documents are recorded in the Document Control register yet.
        </div>
      )}

      {!!rows.length && (
        <TableTab label="Controlled documents">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead>
                <tr className="border-b border-sky-300">
                  <th className="px-2 py-2 text-[11px] uppercase">Document</th>
                  <th className="px-2 py-2 text-[11px] uppercase">Status</th>
                  <th className="px-2 py-2 text-[11px] uppercase">Approval</th>
                  <th className="px-2 py-2 text-[11px] uppercase">Release</th>
                  <th className="px-2 py-2 text-[11px] uppercase">Why</th>
                  <th className="px-2 py-2" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <DocumentReleaseRow
                    key={row.document_id}
                    row={row}
                    canGovern={canGovern}
                    busy={busy}
                    onAcknowledge={acknowledge}
                    onRevise={setRevising}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </TableTab>
      )}

      {revising && (
        <RevisionDialog
          document={revising}
          onClose={() => setRevising(null)}
          onSaved={(message) => {
            setRevising(null);
            toast({ title: 'Draft version opened', description: message });
            reload();
          }}
        />
      )}
    </div>
  );
}