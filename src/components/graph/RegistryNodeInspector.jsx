import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const PROVENANCE_TONE = {
  'Record field': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Knowledge link': 'bg-blue-50 text-blue-700 border-blue-200',
  'Derived rule': 'bg-slate-50 text-slate-700 border-slate-200',
};

/** @param {any} props */
export default function RegistryNodeInspector({ open, onOpenChange, node, relationships = [], counts = {}, sourceRecord, loading, error } = {}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{node?.display_label || 'Indexed record'}</DialogTitle>
          <DialogDescription>
            {node ? `${node.module_label} · ${node.summary || 'no summary'} · status ${node.record_status || 'not recorded'}` : 'Loading this record'}
          </DialogDescription>
        </DialogHeader>

        {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{error}</p>}
        {loading ? (
          <p className="py-6 text-center text-sm text-[#0A2B6D]/70">Loading relationships…</p>
        ) : node ? (
          <div className="space-y-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#0A2B6D]/70">Source record (trace)</p>
              <p className="mt-1 text-xs text-[#0A2B6D]">
                <span className="font-bold">{node.source_entity}</span> record {node.source_record_id}
                {' · '}
                {sourceRecord?.exists
                  ? `still present in this business${sourceRecord.updated ? `, last updated ${new Date(sourceRecord.updated).toLocaleDateString()}` : ''}.`
                  : 'no longer present in this business, so it should be rebuilt away from the index.'}
              </p>
              <Link to={node.module_path || '/'} className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-[#0072FF] hover:underline">
                Open {node.module_path} <ArrowUpRight className="h-3 w-3" />
              </Link>
              <p className="mt-1 text-[11px] text-[#0A2B6D]/60">
                The graph holds a reference and a short summary only. The register remains the record of truth.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-[11px] font-bold text-[#0A2B6D]">
              <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5">{counts.relationships ?? 0} relationships</span>
              <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5">{counts.outgoing ?? 0} out</span>
              <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5">{counts.incoming ?? 0} in</span>
              <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5">{counts.recorded ?? 0} recorded by hand</span>
              {counts.minConfidence !== null && counts.minConfidence !== undefined && (
                <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5">lowest confidence {counts.minConfidence}%</span>
              )}
            </div>

            {relationships.length ? (
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Relationship</TableHead>
                      <TableHead>Other record</TableHead>
                      <TableHead>Provenance</TableHead>
                      <TableHead>Confidence</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {relationships.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="whitespace-nowrap text-xs font-bold text-[#0A2B6D]">
                          {row.direction === 'out' ? '→' : '←'} {row.relationship}
                        </TableCell>
                        <TableCell className="min-w-[180px] text-xs text-[#0A2B6D]">
                          {row.other_label || row.other_key}
                          <div className="text-[11px] text-[#0A2B6D]/60">{row.other_type}</div>
                        </TableCell>
                        <TableCell className="min-w-[220px] text-[11px] text-[#0A2B6D]">
                          <span className={`inline-flex rounded-full border px-2 py-0.5 font-bold ${PROVENANCE_TONE[row.provenance_type] || PROVENANCE_TONE['Derived rule']}`}>
                            {row.provenance_type}
                          </span>
                          <div className="mt-1 text-[#0A2B6D]/70">{row.provenance_detail}</div>
                          {row.source_field && <div className="text-[#0A2B6D]/60">Field: {row.source_field}</div>}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs font-bold text-[#0A2B6D]">{row.confidence}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-center text-xs text-[#0A2B6D]/70">
                This record is indexed but holds no validated relationship. That is a real gap in the graph, not an error.
              </p>
            )}

            <p className="flex items-start gap-2 text-[11px] text-[#0A2B6D]/70">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Confidence is the strength of the rule or link that produced the edge, not proof that the relationship is correct in the world.
            </p>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}