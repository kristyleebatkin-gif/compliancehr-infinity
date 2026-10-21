import React from 'react';
import { Files } from 'lucide-react';
export default function EmployeeRecordNotice() {
  return <div className="flex w-full items-start gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-2 py-1 text-[10px] leading-tight text-muted-foreground"><Files className="h-3 w-3 shrink-0 text-primary" /><p>Shared employee record. Saved answers prefill matching forms in Intake and Staff Profiles. Files linked to a staff profile are filed in the Document Hub; signed documents stay unchanged.</p></div>;
}