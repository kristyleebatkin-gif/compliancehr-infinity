import React, { useState } from 'react';
import { LayoutDashboard, ShieldAlert, Landmark, ShieldCheck, ClipboardCheck, FolderOpen } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import ExecutiveMetricCard from '@/components/executive/ExecutiveMetricCard';
import useExecutiveDashboardMetrics from '@/components/executive/useExecutiveDashboardMetrics';
import ReportGenerator from '@/components/reports/ReportGenerator';
import '@/components/executive/executiveGlass.css';

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
  quality: { title: 'Quality Command Dashboard', description: 'Monitor improvement, corrective and preventive actions across the quality register.', icon: ClipboardCheck, metrics: [
    ['openImprovements', 'Open improvement ideas', 'Improvement and idea records marked new or in progress.', '/quality?tab=Improvement'],
    ['openCorrective', 'Open corrective actions', 'Corrective actions marked new or in progress.', '/quality?tab=Corrective%20Action'],
    ['overdueCorrective', 'Overdue corrective actions', 'New or in-progress corrective actions with a target date before today in Sydney.', '/quality?tab=Corrective%20Action'],
    ['openPreventive', 'Open preventive actions', 'Preventive actions marked new or in progress.', '/quality?tab=Preventive%20Action'],
  ] },
  documents: { title: 'Document Command Centre', description: 'Track controlled-document review, draft and version status.', icon: FolderOpen, metrics: [
    ['documentReviews', 'Document reviews past due', 'Draft, review or approved documents with a review date before today in Sydney.', '/governance?tab=document-control'],
    ['documentsInReview', 'Documents in review', 'Controlled documents marked review.', '/governance?tab=document-control'],
    ['draftDocuments', 'Draft documents', 'Controlled documents marked draft.', '/governance?tab=document-control'],
    ['supersededDocuments', 'Superseded documents', 'Controlled documents marked superseded.', '/governance?tab=document-control'],
  ] },
};

export default function ExecutiveDashboards({ embedded = false } = {}) {
  const [view, setView] = useState('executive');
  const { data, isLoading } = useExecutiveDashboardMetrics(view);
  const current = VIEWS[view];
  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-3 pb-6">
      {!embedded && <PageHeader title={current.title} description={current.description} icon={current.icon} />}
      {!embedded && <ReportGenerator area="executive" />}
      <section className="executive-dashboard-metrics executive-glass-surface space-y-4 rounded-xl border border-header-foreground/20 p-4 shadow-panel sm:p-5">
        <div className="flex flex-wrap gap-2" aria-label="Executive dashboard selection">
          {Object.entries(VIEWS).map(([key, item]) => (
            <button key={key} type="button" onClick={() => setView(key)} aria-pressed={view === key} className={view === key ? 'rounded-lg border border-header-foreground/40 bg-brand px-4 py-2 text-sm font-bold text-header-foreground shadow-panel backdrop-blur-md' : 'rounded-lg border border-header-foreground/30 bg-workspace-navy/70 px-4 py-2 text-sm font-bold text-header-foreground backdrop-blur-md hover:bg-workspace-navy/90'}>{item.title}</button>
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