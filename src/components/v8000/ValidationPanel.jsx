import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowUpRight, CheckCircle2 } from 'lucide-react';

const SEVERITY = {
  high: { label: 'Action needed', state: 'risk' },
  medium: { label: 'Review', state: 'expiring' },
  low: { label: 'Improve', state: 'review' },
};

/** Traceability and validation findings, each with the count and the register to act in. */
export default function ValidationPanel({ checks = [] }) {
  if (!checks.length) {
    return (
      <div className="v8-panel p-4">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4" style={{ color: '#7CF0C4' }} aria-hidden="true" />
          <div>
            <p className="v8-title">No validation issues found</p>
            <p className="v8-sub mt-1">
              Every check passed on the records loaded for this business. This is not proof of compliance: it means no
              traceability or evidence problem was detected in these registers today.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {checks.map((check) => {
        const severity = SEVERITY[check.severity] || SEVERITY.low;
        return (
          <div key={check.id} className="v8-panel p-3.5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="v8-chip" data-state={severity.state}>
                    <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                    {severity.label}
                  </span>
                  <span className="v8-chip" data-state="muted">{check.count} record{check.count === 1 ? '' : 's'}</span>
                </div>
                <p className="v8-title mt-1.5">{check.title}</p>
                <p className="v8-sub mt-0.5">{check.detail}</p>
              </div>
              <Link to={check.action.path} className="v8-link">
                {check.action.label}
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}