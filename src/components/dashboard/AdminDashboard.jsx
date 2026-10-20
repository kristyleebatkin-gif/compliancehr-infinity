import React from 'react';
import DashboardCharts from './DashboardCharts';
import AttentionPanel from './AttentionPanel';
import ComplianceCompletionSummary from './ComplianceCompletionSummary';
import DepartmentComplianceSummary from './DepartmentComplianceSummary';
import ComplianceHealthDashboard from './ComplianceHealthDashboard';
import ComplianceStatusBoard from './ComplianceStatusBoard';
import IncidentExpiryChart from './IncidentExpiryChart';
import ExpiryReviewFeed from './ExpiryReviewFeed';
import DeadlineCalendar from './DeadlineCalendar';
import ProviderKpiWidget from '@/components/ndis/ProviderKpiWidget';
import BoardReportButton from '@/components/compliance/BoardReportButton';

export default function AdminDashboard() {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-panel">
        <div>
          <h2 className="font-display text-lg font-bold">Management review report</h2>
          <p className="text-xs font-medium text-muted-foreground">Export the current risk and compliance status as a PDF summary for management.</p>
        </div>
        <BoardReportButton />
      </div>

      <AttentionPanel />

      <ComplianceStatusBoard />

      <IncidentExpiryChart />

      <ExpiryReviewFeed />

      <DeadlineCalendar />

      <ComplianceCompletionSummary />

      <DepartmentComplianceSummary />

      <ComplianceHealthDashboard />

      <ProviderKpiWidget />

      <DashboardCharts />
    </>
  );
}