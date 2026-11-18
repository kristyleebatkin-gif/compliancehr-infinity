import React from 'react';
import { Search, ShieldQuestion } from 'lucide-react';
import { Button, StatusBadge, TableBody, TableCell, TableFrame, TableHead, TableHeader, TableRow, WorkforceEmpty } from '@/components/workforce/workforceKit';

const when = (value) => (value ? new Date(value).toLocaleString() : 'Not yet');

/** Every recorded AI proposal, what policy said about it, and how a person settled it. */
export default function DecisionTable({ decisions = [], canReview, onOpen, onReview } = {}) {
  if (!decisions.length) {
    return (
      <WorkforceEmpty
        title="No AI proposal recorded yet"
        body="Record a proposal to see it checked against the agent's tool grant, redacted, given a policy verdict and, where a person must decide, placed in the review queue."
      />
    );
  }
  return (
    <div>
      <TableFrame>
        <TableHeader>
          <TableRow>
            <TableHead>Decision</TableHead>
            <TableHead>Agent and version</TableHead>
            <TableHead>Tool</TableHead>
            <TableHead>Policy verdict</TableHead>
            <TableHead>Confidence</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {decisions.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="min-w-[220px]">
                <div className="text-sm font-bold text-[#0A2B6D]">{row.action_title || 'Untitled proposal'}</div>
                <div className="text-[11px] text-[#0A2B6D]/60">{row.decision_ref}</div>
                <div className="text-[11px] text-[#0A2B6D]/50">{when(row.created_date)}</div>
              </TableCell>
              <TableCell className="min-w-[180px] text-[11px] text-[#0A2B6D]/80">
                <div className="text-xs font-bold text-[#0A2B6D]">{row.agent_name}</div>
                <div>{row.model_name || 'No model recorded'}</div>
                <div>Prompt v{row.prompt_version} · {row.autonomy_level}</div>
              </TableCell>
              <TableCell className="min-w-[150px] text-[11px] text-[#0A2B6D]/80">
                {row.tool_name ? (
                  <>
                    <div className="text-xs font-bold text-[#0A2B6D]">{row.tool_name}</div>
                    <div>{row.tool_kind} · {row.tool_risk_level} risk</div>
                  </>
                ) : 'No tool'}
              </TableCell>
              <TableCell className="min-w-[200px]">
                <StatusBadge status={row.policy_verdict} />
                <p className="mt-1 text-[11px] text-[#0A2B6D]/70">{row.policy_reason}</p>
              </TableCell>
              <TableCell className="whitespace-nowrap text-xs text-[#0A2B6D]">
                {row.confidence}%<div className="text-[11px] text-[#0A2B6D]/60">{row.confidence_band}</div>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <StatusBadge status={row.status} />
                <div className="mt-1 text-[11px] text-[#0A2B6D]/60">{row.execution_state}</div>
                {row.reviewed_by && <div className="text-[11px] text-[#0A2B6D]/60">by {row.reviewed_by}</div>}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex flex-wrap justify-end gap-1">
                  <Button size="sm" variant="outline" onClick={() => onOpen?.(row)}><Search className="h-3.5 w-3.5" /> Open</Button>
                  {canReview && row.status === 'Awaiting human review' && (
                    <Button size="sm" variant="secondary" onClick={() => onReview?.(row)}>
                      <ShieldQuestion className="h-3.5 w-3.5" /> Review
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableFrame>
    </div>
  );
}