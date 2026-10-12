import React from 'react';
import DashboardCharts from './DashboardCharts';
import AttentionPanel from './AttentionPanel';

export default function AdminDashboard() {
  return (
    <>
      <AttentionPanel />

      <DashboardCharts />
    </>
  );
}