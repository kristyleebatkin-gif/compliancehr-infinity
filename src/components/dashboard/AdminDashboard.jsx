import React from 'react';
import DashboardCharts from './DashboardCharts';
import AttentionPanel from './AttentionPanel';
import ComplianceCompletionSummary from './ComplianceCompletionSummary';

export default function AdminDashboard() {
  return (
    <>
      <AttentionPanel />

      <ComplianceCompletionSummary />

      <DashboardCharts />
    </>
  );
}