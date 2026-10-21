import React from 'react';
import '@/components/dashboard/complianceDashboardFrame.css';

export default function ComplianceDashboardFrame({ children }) {
  return <div className="compliance-dashboard-frame"><div className="compliance-dashboard-compact">{children}</div></div>;
}