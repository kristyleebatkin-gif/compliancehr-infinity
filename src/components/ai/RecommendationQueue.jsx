import React from 'react';
import { BadgeCheck } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { PRIORITY_TONES, RECOMMENDATION_STATUS_TONES, confidenceBand } from '@/lib/aiIntelligence';

const STATUSES = ['Awaiting review', 'Accepted', 'Rejected', 'Implemented'];

export default function RecommendationQueue({ recommendations, onStatusChange }) {
  if (!recommendations.length) {
    return (
      <EmptyState
        icon={BadgeCheck}
        title="No recommendations yet"
        message="Run a copilot review and every recommendation it produces lands here with its reasoning, confidence and traceability, awaiting human verification."
        modulePath="Compliance"
        createLabel="Run a copilot review"
        createHref="/ai-os"
      />
    );
  }

  return (
    <div className="min-w-0 overflow-x-auto">
      <table className="w-full min-w-[1040px] border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left">Recommendation</th>
            <th className="text-left">Raised by</th>
            <th className="text-left">Confidence</th>
            <th className="text-left">Priority</th>
            <th className="text-left">Traceability</th>
            <th className="text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {recommendations.map((item) => {
            const band = confidenceBand(item.confidence);
            return (
              <tr key={item.id} className="border-b border-border/60 last:border-0">
                <td className="align-top">
                  <div className="font-semibold text-foreground">{item.recommendation || item.title}</div>
                  {item.title && item.recommendation && item.title !== item.recommendation ? (
                    <div className="text-[11px] font-bold text-brand">{item.title}</div>
                  ) : null}
                  {item.reasoning ? (
                    <div className="mt-1 max-w-[420px] text-[11px] font-medium leading-snug text-muted-foreground">
                      {item.reasoning}
                    </div>
                  ) : null}
                  {item.human_verified_by ? (
                    <div className="mt-1 text-[10px] font-bold text-muted-foreground">
                      {item.status} by {item.human_verified_by} · {item.human_verified_date}
                    </div>
                  ) : null}
                </td>
                <td className="align-top">
                  <div className="text-xs font-bold text-foreground">{item.agent_name}</div>
                  <div className="text-[11px] font-medium text-muted-foreground">{item.recommendation_type || item.module}</div>
                </td>
                <td className="align-top">
                  <span className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-bold ${band.chip}`}>
                    {item.confidence ?? 0}%
                  </span>
                </td>
                <td className="align-top">
                  <span
                    className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-bold ${
                      PRIORITY_TONES[item.priority] || PRIORITY_TONES.Medium
                    }`}
                  >
                    {item.priority}
                  </span>
                </td>
                <td className="align-top">
                  <div className="max-w-[220px] space-y-0.5 text-[10px] font-semibold leading-snug text-muted-foreground">
                    {item.standard_refs ? <div>Standards: {item.standard_refs}</div> : null}
                    {item.control_refs ? <div>Controls: {item.control_refs}</div> : null}
                    {item.risk_refs ? <div>Risks: {item.risk_refs}</div> : null}
                    {!item.standard_refs && !item.control_refs && !item.risk_refs ? <div>No linked records</div> : null}
                  </div>
                </td>
                <td className="align-top">
                  <select
                    value={item.status || 'Awaiting review'}
                    onChange={(event) => onStatusChange(item, event.target.value)}
                    className={`h-8 rounded-md border px-2 text-xs font-semibold ${
                      RECOMMENDATION_STATUS_TONES[item.status] || RECOMMENDATION_STATUS_TONES['Awaiting review']
                    }`}
                    aria-label={`Status for ${item.title || 'recommendation'}`}
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}