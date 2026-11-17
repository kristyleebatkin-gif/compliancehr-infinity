import React from 'react';
import { Sparkles } from 'lucide-react';

const PRIORITY_TONE = { High: 'risk', Medium: 'expiring', Low: 'review' };

/** Rendered copilot output. Always labelled as a generated draft, never as a verified record. */
export default function CopilotReport({ result }) {
  const review = result?.review;
  if (!review) return null;
  const registers = result.registers || {};

  return (
    <div className="space-y-3">
      <div className="rounded-lg border p-2.5" style={{ borderColor: '#FFD37A', background: 'rgba(255, 211, 122, 0.14)' }}>
        <p className="flex items-center gap-1.5 text-xs font-extrabold" style={{ color: '#FFE6B4' }}>
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          AI generated draft. Not a verified record.
        </p>
        <p className="v8-sub mt-0.5">
          Written by {review.label || 'the copilot'} from register metadata only. Nothing here is approved, closed or
          verified until a person acting in their role records that decision in the register.
        </p>
      </div>

      <div>
        <p className="v8-muted font-bold uppercase tracking-wide">Summary</p>
        <p className="mt-1 text-xs leading-relaxed text-white">{review.executive_summary}</p>
      </div>

      {review.key_findings?.length > 0 && (
        <div>
          <p className="v8-muted font-bold uppercase tracking-wide">Findings it cited</p>
          <ul className="mt-1 space-y-1.5">
            {review.key_findings.map((finding, index) => (
              <li key={index} className="v8-row">
                <p className="text-xs text-white">{finding.finding}</p>
                <p className="v8-muted mt-0.5">Sources: {(finding.source_ids || []).join(', ') || 'none cited'}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {review.recommendations?.length > 0 && (
        <div>
          <p className="v8-muted font-bold uppercase tracking-wide">Recommended actions</p>
          <ul className="mt-1 space-y-1.5">
            {review.recommendations.map((item, index) => (
              <li key={index} className="v8-row">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="v8-chip" data-state={PRIORITY_TONE[item.priority] || 'muted'}>{item.priority}</span>
                  <p className="text-xs font-bold text-white">{item.action}</p>
                </div>
                <p className="v8-sub mt-0.5">{item.reasoning}</p>
                <p className="v8-muted mt-0.5">Sources: {(item.source_ids || []).join(', ') || 'none cited'}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {review.limitations?.length > 0 && (
        <div>
          <p className="v8-muted font-bold uppercase tracking-wide">Limits of this review</p>
          <ul className="v8-sub mt-1 list-disc space-y-0.5 pl-4">
            {review.limitations.map((limit, index) => <li key={index}>{limit}</li>)}
          </ul>
        </div>
      )}

      <p className="v8-muted">
        Registers read: {['standards', 'controls', 'evidence', 'findings']
          .map((key) => `${registers[key] ?? 0} ${key}`)
          .join(' · ')}
        {result.limited ? ' · at least one register reached the read limit' : ''}
      </p>
    </div>
  );
}