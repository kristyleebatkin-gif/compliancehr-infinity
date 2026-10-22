import React from 'react';
import ModuleComplianceStrip from '@/components/ModuleComplianceStrip';
import ModuleAuditChecklistButton from '@/components/ModuleAuditChecklistButton';
import ModuleAuditButton from '@/components/ModuleAuditButton';

// Live tracker, Audit Checklist and Audit Report — shown under the Task Dash
// on the Communication Centre (the header bar for these is hidden on this page only).
export default function CommAuditBar() {
  return (
    <div className="module-action-bar flex flex-wrap items-center gap-1 rounded-lg border border-border/60 bg-card px-1.5 py-1 shadow-sm">
      <ModuleComplianceStrip path="/communications" />
      <div className="flex shrink-0 items-center gap-1 [&>button]:h-7 [&>button]:gap-1 [&>button]:px-2 [&>button]:text-[11px] [&>button_svg]:mr-0 [&>button_svg]:size-3">
        <ModuleAuditChecklistButton />
        <ModuleAuditButton />
      </div>
    </div>
  );
}