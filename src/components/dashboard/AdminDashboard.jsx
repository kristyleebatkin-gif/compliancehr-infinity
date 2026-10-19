import React from 'react';
import DashboardCharts from './DashboardCharts';
import AttentionPanel from './AttentionPanel';
import ComplianceCompletionSummary from './ComplianceCompletionSummary';
import DepartmentComplianceSummary from './DepartmentComplianceSummary';
import ComplianceHealthDashboard from './ComplianceHealthDashboard';
import ProviderKpiWidget from '@/components/ndis/ProviderKpiWidget';

export default function AdminDashboard() {
  return (
    <>
      <AttentionPanel />

      <ComplianceCompletionSummary />

      <DepartmentComplianceSummary />

      <ComplianceHealthDashboard />

      <ProviderKpiWidget />

      <DashboardCharts />
    </>
  );
}