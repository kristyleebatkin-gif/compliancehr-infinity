import React from 'react';

export default function HrFileCompletenessSummary({ summary }) {
  if (!summary) return null;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl border border-border bg-muted/30 p-4"><p className="text-2xl font-bold text-primary">{summary.average}%</p><p className="text-xs text-muted-foreground">Average file completeness on this page</p></div>
      <div className="rounded-xl border border-border bg-muted/30 p-4"><p className="text-2xl font-bold text-safe">{summary.complete}</p><p className="text-xs text-muted-foreground">Staff on this page with all required documents on file</p></div>
    </div>
  );
}