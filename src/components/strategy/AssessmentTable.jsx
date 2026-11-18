import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button, NewRow, StatusBadge, StrategyEmpty, TableBody, TableCell, TableFrame, TableHead, TableHeader, TableRow, parseList } from '@/components/strategy/strategyKit';

const LABELS = { 1: 'Initial', 2: 'Emerging', 3: 'Defined', 4: 'Managed', 5: 'Optimised' };

/** @param {any} props */
export default function AssessmentTable({ assessments = [], capabilities = [], canEdit, onNew, onValidate } = {}) {
  return (
    <div>
      <NewRow
        canEdit={canEdit}
        label="Record assessment"
        onNew={onNew}
        note={capabilities.length ? 'A maturity of 4 or 5 needs at least one evidence reference before it can be recorded.' : 'Record a capability first: every assessment belongs to one.'}
      />
      {!assessments.length ? (
        <StrategyEmpty
          title="No maturity assessment recorded yet"
          body="An assessment records the assessor, the date, the score, the rationale and the evidence behind it. A capability rolls up the latest validated assessment only."
        />
      ) : (
        <TableFrame>
          <TableHeader>
            <TableRow>
              <TableHead>Capability</TableHead>
              <TableHead>Assessor and date</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Rationale</TableHead>
              <TableHead>Evidence</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assessments.map((row) => {
              const refs = parseList(row.evidence_refs_json);
              return (
                <TableRow key={row.id}>
                  <TableCell className="min-w-[180px]">
                    <div className="text-sm font-bold text-[#0A2B6D]">{row.capability_name}</div>
                    <div className="text-[11px] text-[#0A2B6D]/60">{row.assessment_ref}</div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-[#0A2B6D]">
                    <div>{row.assessor}</div>
                    <div className="text-[11px] text-[#0A2B6D]/60">{String(row.assessed_at || '').slice(0, 10)}</div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-[#0A2B6D]">
                    <span className="font-bold">{row.score}</span> · {LABELS[Math.round(Number(row.score))] || ''}
                  </TableCell>
                  <TableCell className="min-w-[240px] text-[11px] text-[#0A2B6D]/80">{row.rationale}</TableCell>
                  <TableCell className="min-w-[160px] text-[11px] text-[#0A2B6D]/80">
                    <div className="font-bold text-[#0A2B6D]">{refs.length} references</div>
                    {refs.slice(0, 2).map((ref, index) => (
                      <div key={`${row.id}-ref-${index}`} className="text-[#0A2B6D]/60">{ref.register}: {ref.reference || ref.record_id}</div>
                    ))}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <StatusBadge status={row.status} />
                    {row.validated_by && <div className="mt-1 text-[11px] text-[#0A2B6D]/60">{row.validated_by}</div>}
                  </TableCell>
                  <TableCell className="text-right">
                    {canEdit && row.status === 'Draft' && (
                      <Button size="sm" variant="secondary" onClick={() => onValidate?.(row)}><CheckCircle2 className="h-3.5 w-3.5" /> Validate</Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </TableFrame>
      )}
    </div>
  );
}