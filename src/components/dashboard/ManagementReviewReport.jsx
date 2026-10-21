import React from 'react';
import { FileText } from 'lucide-react';
import BoardReportButton from '@/components/compliance/BoardReportButton';

export default function ManagementReviewReport() {
  return <section className="management-review-report flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/20 bg-card px-3 py-2.5 shadow-sm">
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><FileText className="h-4 w-4" /></span>
      <div>
        <h2 className="font-display text-sm font-bold">Management review report</h2>
        <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">Export the current risk and compliance status as a PDF summary for management.</p>
      </div>
    </div>
    <BoardReportButton />
  </section>;
}