import React from 'react';
import ModuleComplianceStrip from '@/components/ModuleComplianceStrip';

// Live tracker bar — shown under the Task Dash
// on the Communication Centre (the header bar for these is hidden on this page only).
export default function CommAuditBar() {
  return (
    <div className="module-action-bar flex flex-wrap items-center gap-1 rounded-lg border-2 border-[#0A2B6D] bg-card px-1.5 py-1 shadow-sm">
      <ModuleComplianceStrip path="/communications" />
    </div>
  );
}