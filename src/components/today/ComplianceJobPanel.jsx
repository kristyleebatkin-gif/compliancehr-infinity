import React from 'react';
import { Link } from 'react-router-dom';
import { Timer, ArrowRight } from 'lucide-react';
import { Panel, Pill, Empty } from '@/components/today/todayUi';

export default function ComplianceJobPanel({ issues, incidents }) {
  const job = issues[0];
  const incident = incidents[0];

  return (
    <Panel title="10-minute compliance job" subtitle="One small job keeps the audit ready" action={<Pill tone="amber">Today</Pill>}>
      {job ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-[#5A00D6] to-[#FF2E9A] text-white">
              <Timer className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="t-title truncate text-[12.5px] font-bold">{job.title}</p>
              <p className="t-muted truncate text-[10.5px] font-semibold">
                {job.category || 'Compliance'} · {job.priority || 'Medium'} priority
              </p>
            </div>
          </div>
          <p className="t-muted line-clamp-2 text-[11.5px] leading-relaxed">
            {job.description || 'Close this item out and record the evidence in the compliance register.'}
          </p>
          <Link to="/compliance" className="t-btn t-btn-primary w-full">
            Start 10-minute job <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : incident ? (
        <div className="space-y-2">
          <p className="t-title text-[12.5px] font-bold">{incident.title}</p>
          <p className="t-muted text-[11.5px]">
            {incident.severity} severity · {incident.status}
          </p>
          <Link to={`/incidents/${incident.id}`} className="t-btn t-btn-primary w-full">
            Review incident <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <Empty>Nothing outstanding — your compliance register is clear.</Empty>
      )}
    </Panel>
  );
}