import React from 'react';
import { Files } from 'lucide-react';
export default function EmployeeRecordNotice() {
  return <div className="flex w-full items-start gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground"><Files className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><p>Shared employee record. Saved answers prefill matching forms in Intake and Staff Profiles. Files linked to a staff profile are filed in the Document Hub; signed documents stay unchanged.</p></div>;
}