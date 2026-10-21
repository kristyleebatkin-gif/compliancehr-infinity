import React from 'react';
import ComplianceDashboardFrame from '@/components/dashboard/ComplianceDashboardFrame';
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


export default function AdminDashboard() {
  return (
    <>
      <ComplianceDashboardFrame><AttentionPanel /></ComplianceDashboardFrame>

      <ComplianceDashboardFrame><ComplianceStatusBoard /></ComplianceDashboardFrame>

      <ComplianceDashboardFrame><IncidentExpiryChart /></ComplianceDashboardFrame>

      <ComplianceDashboardFrame><ExpiryReviewFeed /></ComplianceDashboardFrame>

      <ComplianceDashboardFrame><DeadlineCalendar /></ComplianceDashboardFrame>

      <ComplianceDashboardFrame><ComplianceCompletionSummary /></ComplianceDashboardFrame>

      <ComplianceDashboardFrame><DepartmentComplianceSummary /></ComplianceDashboardFrame>

      <ComplianceDashboardFrame><ComplianceHealthDashboard /></ComplianceDashboardFrame>

      <ComplianceDashboardFrame><ProviderKpiWidget /></ComplianceDashboardFrame>

      <ComplianceDashboardFrame><DashboardCharts /></ComplianceDashboardFrame>
    </>
  );
}