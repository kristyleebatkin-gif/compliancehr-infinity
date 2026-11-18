import React from 'react';
import { StatusBadge, StrategyEmpty, TableBody, TableCell, TableFrame, TableHead, TableHeader, TableRow } from '@/components/strategy/strategyKit';

/** Every strategy write and refusal, hash chained so a removed entry is visible. */
export default function StrategyAuditTable({ records = [] } = {}) {
  if (!records.length) {
    return <StrategyEmpty title="No strategy audit entries yet" body="Each create, edit, status change, approval and refused attempt is appended here with the person, the reason and a chain hash." />;
  }
  return (
    <TableFrame>
      <TableHeader>
        <TableRow>
          <TableHead>When</TableHead>
          <TableHead>Actor</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>Subject</TableHead>
          <TableHead>Outcome</TableHead>
          <TableHead>Detail</TableHead>
          <TableHead>Chain</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="whitespace-nowrap text-[11px] text-[#0A2B6D]/80">{String(row.occurred_at || '').replace('T', ' ').slice(0, 16)}</TableCell>
            <TableCell className="min-w-[140px] text-[11px] text-[#0A2B6D]/80">
              <div className="text-xs font-bold text-[#0A2B6D]">{row.actor}</div>
              <div>{row.actor_role}</div>
            </TableCell>
            <TableCell className="min-w-[190px] text-[11px] text-[#0A2B6D]/80">
              <div className="font-bold text-[#0A2B6D]">{row.action}</div>
              <div>{row.audit_ref}</div>
            </TableCell>
            <TableCell className="min-w-[150px] text-[11px] text-[#0A2B6D]/80">
              <div>{row.subject_type}</div>
              <div className="text-[#0A2B6D]/60">{row.subject_ref || row.subject_id}</div>
            </TableCell>
            <TableCell><StatusBadge status={row.outcome} /></TableCell>
            <TableCell className="min-w-[220px] text-[11px] text-[#0A2B6D]/80">
              {row.detail}
              {row.redacted_count > 0 && <div className="text-[#0A2B6D]/50">{row.redacted_count} value(s) redacted</div>}
            </TableCell>
            <TableCell className="text-[11px] text-[#0A2B6D]/60">{(row.chain_hash || '').slice(0, 14)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </TableFrame>
  );
}