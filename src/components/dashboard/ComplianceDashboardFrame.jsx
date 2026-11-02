import React from 'react';
import '@/components/dashboard/complianceDashboardFrame.css';

const APP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #5A00D6 62%, #FF2E9A 100%)';

export default function ComplianceDashboardFrame({ children }) {
  return (
    <div
      className="compliance-dashboard-frame preserve-island-theme overflow-hidden rounded-2xl p-[3px] shadow-md"
      style={{ background: APP_BORDER_GRADIENT }}
    >
      <div
        className="rounded-[13px] p-3"
        style={{
          background: 'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)',
        }}
      >
        <div
          className="rounded-2xl p-[2px]"
          style={{ background: APP_BORDER_GRADIENT }}
        >
          <div className="compliance-dashboard-compact rounded-[14px] bg-white p-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}