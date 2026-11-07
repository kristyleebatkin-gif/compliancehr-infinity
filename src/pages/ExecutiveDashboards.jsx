import React, { useState } from 'react';
import { LayoutDashboard, ShieldAlert, Landmark, ShieldCheck } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import ExecutiveMetricCard from '@/components/executive/ExecutiveMetricCard';
import useExecutiveDashboardMetrics from '@/components/executive/useExecutiveDashboardMetrics';

const VIEWS = {
  executive: { title: 'CEO Executive Dashboard', description: 'A concise overview of outstanding governance and operational records.', icon: LayoutDashboard, metrics: [
    ['risks', 'Open risks', 'Identified, assessed, treating or monitored risks.', '/risks'],
    ['incidents', 'Open incidents', 'Reported incidents that are not yet resolved or closed.', '/incidents'],
    ['issues', 'Open compliance issues', 'Issues marked open or in progress.', '/compliance?tab=issues'],
    ['tasks', 'Overdue tasks', 'Unfinished tasks with a due date before today in Sydney.', '/tasks'],
  ] },
  risk: { title: 'Enterprise Risk Dashboard', description: 'Review recorded risks and outstanding review dates.', icon: ShieldAlert, metrics: [
    ['risks', 'Open risks', 'Identified, assessed, treating or monitored risks.', '/risks'],
    ['highRisks', 'High and critical risks', 'Open risks recorded with a high or critical rating.', '/risks'],
    ['riskReviews', 'Reviews past due', 'Open risks with a review date before today in Sydney.', '/risks'],
    ['incidents', 'Open incidents', 'Reported incidents that are not yet resolved or closed.', '/incidents'],
  ] },
  board: { title: 'Board Governance Dashboard', description: 'Review governance records, declarations, audit follow-ups and significant risks.', icon: Landmark, metrics: [
    ['governanceReviews', 'Governance reviews past due', 'Active or under-review governance objects with a review date before today in Sydney.', '/governance?tab=objects'],
    ['declarations', 'Declarations needing attention', 'Declarations marked under review or expired.', '/governance?tab=delegations'],
    ['auditFollowups', 'Audit follow-ups required', 'Audit records marked follow-up required.', '/compliance?tab=audits'],
    ['highRisks', 'High and critical risks', 'Open risks recorded with a high or critical rating.', '/risks'],
  ] },
  compliance: { title: 'Compliance Command Dashboard', description: 'Monitor unresolved issues, policy expiry, audit follow-up and overdue tasks.', icon: ShieldCheck, metrics: [
    ['issues', 'Open compliance issues', 'Issues marked open or in progress.', '/compliance?tab=issues'],
    ['expiredPolicies', 'Expired policies', 'Policies with an expired status.', '/compliance?tab=policies'],
    ['auditFollowups', 'Audit follow-ups required', 'Audit records marked follow-up required.', '/compliance?tab=audits'],
    ['tasks', 'Overdue tasks', 'Unfinished tasks with a due date before today in Sydney.', '/tasks'],
  ] },
};

export default function ExecutiveDashboards() {
  const [view, setView] = useState('executive');
  const { data, isLoading } = useExecutiveDashboardMetrics(view);
  const current = VIEWS[view];
  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-3 pb-6">
      <PageHeader title={current.title} description={current.description} icon={current.icon} />
      <section className="gradient-brand space-y-4 rounded-xl border border-brand p-4 sm:p-5">
        <div className="flex flex-wrap gap-2" aria-label="Executive dashboard selection">
          {Object.entries(VIEWS).map(([key, item]) => (
            <button key={key} type="button" onClick={() => setView(key)} aria-pressed={view === key} className={view === key ? 'rounded-lg bg-card px-4 py-2 text-sm font-bold text-card-foreground' : 'rounded-lg border border-header-foreground/40 px-4 py-2 text-sm font-bold text-header-foreground'}>{item.title}</button>
          ))}
        </div>
        <p className="text-xs leading-relaxed text-header-foreground">Counts reflect records visible to your account. These source registers do not currently support organisation-level filtering, so counts may not represent a single organisation.</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {current.metrics.map(([key, title, description, path]) => <ExecutiveMetricCard key={key} title={title} description={description} value={data?.[key] ?? null} loading={isLoading} path={path} />)}
        </div>
      </section>
    </div>
  );
}