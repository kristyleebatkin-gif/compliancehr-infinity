import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FactoryPill, PmmEmpty, StatusPill } from './pmmKit';

/** @param {any} props */
export default function CapabilityMatrix({ rows = [], summary = null } = {}) {
  if (!rows.length) {
    return <PmmEmpty title="No capability rows" body="The metadata repository has not declared any capability yet." />;
  }
  const byStatus = summary?.byStatus || {};
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 text-[11px] font-bold text-[#0A2B6D]">
        {['present', 'partial', 'planned', 'blocked', 'unverified'].map((status) => (
          <span key={status} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1">
            <StatusPill status={status} /> {byStatus[status] ?? 0}
          </span>
        ))}
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Phase</TableHead>
              <TableHead>Capability</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Factory</TableHead>
              <TableHead>Evidence</TableHead>
              <TableHead>Position</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.key}>
                <TableCell className="whitespace-nowrap text-xs font-bold text-[#0A2B6D]">{row.phase}</TableCell>
                <TableCell className="min-w-[180px]">
                  <p className="text-xs font-bold text-[#0A2B6D]">{row.name}</p>
                  {row.gate ? <span className="mt-1 inline-flex rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700">Release gate</span> : null}
                </TableCell>
                <TableCell><StatusPill status={row.status} /></TableCell>
                <TableCell><FactoryPill state={row.factory} /></TableCell>
                <TableCell className="min-w-[200px]">
                  {row.evidence?.length ? (
                    <ul className="space-y-0.5">
                      {row.evidence.map((path) => (
                        <li key={path} className="break-all font-mono text-[10px] text-[#0A2B6D]/75">{path}</li>
                      ))}
                    </ul>
                  ) : <span className="text-[11px] text-[#0A2B6D]/60">No delivered evidence</span>}
                </TableCell>
                <TableCell className="min-w-[240px] text-[11px] leading-5 text-[#0A2B6D]/80">
                  {row.reason ? <span className="block font-bold text-rose-700">{row.reason}</span> : null}
                  {row.note}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}