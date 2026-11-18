import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PanelNote, PmmEmpty } from './pmmKit';

const TONE = {
  reused: 'bg-blue-50 text-blue-700 border-blue-200',
  reference: 'bg-purple-50 text-purple-700 border-purple-200',
  adapted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  partial: 'bg-amber-50 text-amber-800 border-amber-200',
};

/** @param {any} props */
export default function MigrationMap({ platform = {} } = {}) {
  const entries = platform.compatibility || [];
  if (!entries.length) {
    return <PmmEmpty title="No compatibility map" body="Record how each area of the current architecture maps to the target stack." />;
  }
  return (
    <div className="space-y-3">
      <PanelNote>
        The live app stays on its Base44 runtime. Nothing in the target column has been deployed: the factory records how each area maps,
        and generated output is reviewed before anyone acts on it.
      </PanelNote>

      <div className="flex flex-wrap gap-2">
        {(platform.targetStack || []).map((item) => (
          <span key={item} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-[#0A2B6D]">{item}</span>
        ))}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Area</TableHead>
              <TableHead>Today</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Reconciliation</TableHead>
              <TableHead>Position</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.area}>
                <TableCell className="whitespace-nowrap text-xs font-bold text-[#0A2B6D]">{entry.area}</TableCell>
                <TableCell className="min-w-[200px] text-[11px] leading-5 text-[#0A2B6D]/80">{entry.current}</TableCell>
                <TableCell className="min-w-[200px] text-[11px] leading-5 text-[#0A2B6D]/80">{entry.target}</TableCell>
                <TableCell className="min-w-[220px] text-[11px] leading-5 text-[#0A2B6D]/80">{entry.approach}</TableCell>
                <TableCell>
                  <span className={`inline-flex whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${TONE[entry.status] || TONE.reference}`}>
                    {entry.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#0A2B6D]/60">Migration rules</p>
        <ul className="mt-2 space-y-1.5">
          {(platform.migrationRules || []).map((rule) => (
            <li key={rule} className="flex gap-2 text-[11px] leading-5 text-[#0A2B6D]/85">
              <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#5A00D6]" />
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}