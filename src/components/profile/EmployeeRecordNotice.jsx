import React from 'react';
import { Files } from 'lucide-react';

export default function EmployeeRecordNotice() {
  return (
    <div className="flex w-full items-center gap-2 rounded-xl border-2 border-[#0072FF] bg-white px-3 py-2 text-xs font-bold leading-snug text-[#0A2B6D] shadow-2xs">
      <Files className="h-4 w-4 shrink-0 text-[#0072FF]" />
      <p style={{ color: '#0A2B6D' }}>
        <span style={{ color: '#5A00D6' }}>◉</span> Shared employee record. Saved answers prefill matching forms in Intake and Staff Profiles. Files linked to a staff profile are filed in the Document Hub; signed documents stay unchanged.
      </p>
    </div>
  );
}