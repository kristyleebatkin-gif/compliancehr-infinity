import React from 'react';
import DashboardCharts from './DashboardCharts';
import AttentionPanel from './AttentionPanel';
import ComplianceCompletionSummary from './ComplianceCompletionSummary';
import ComplianceHealthDashboard from './ComplianceHealthDashboard';

export default function AdminDashboard() {
  return (
    <>
      <AttentionPanel />

      <ComplianceCompletionSummary />

      <ComplianceHealthDashboard />

      <DashboardCharts />
    </>
  );
}