import React from 'react';
import DashboardCharts from './DashboardCharts';
import AttentionPanel from './AttentionPanel';
import ComplianceCompletionSummary from './ComplianceCompletionSummary';
import DepartmentComplianceSummary from './DepartmentComplianceSummary';
import ComplianceHealthDashboard from './ComplianceHealthDashboard';
import ComplianceStatusBoard from './ComplianceStatusBoard';
import ExpiryReviewFeed from './ExpiryReviewFeed';
import ProviderKpiWidget from '@/components/ndis/ProviderKpiWidget';

export default function AdminDashboard() {
  return (
    <>
      <AttentionPanel />

      <ComplianceStatusBoard />

      <ExpiryReviewFeed />

      <ComplianceCompletionSummary />

      <DepartmentComplianceSummary />

      <ComplianceHealthDashboard />

      <ProviderKpiWidget />

      <DashboardCharts />
    </>
  );
}