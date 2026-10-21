import React from 'react';
import { Files } from 'lucide-react';
export default function EmployeeRecordNotice() {
  return <div className="mb-2 flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-2 text-xs text-muted-foreground"><Files className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><p>Shared employee record. Saved form answers prefill Intake and Staff Profiles; supporting files are filed in the Document Hub. Signed documents stay unchanged.</p></div>;
}