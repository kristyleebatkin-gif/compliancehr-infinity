import React from 'react';
import { Files } from 'lucide-react';

const GRADIENT_BORDER_STYLE = {
  border: '2px solid transparent',
  background:
    'linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #5A00D6 62%, #FF2E9A 100%) border-box',
};

export default function EmployeeRecordNotice() {
  return (
    <div
      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold leading-snug text-[#0A2B6D] shadow-2xs"
      style={GRADIENT_BORDER_STYLE}
    >
      <Files className="h-4 w-4 shrink-0 text-[#0072FF]" />
      <p style={{ color: '#0A2B6D' }}>
        <span style={{ color: '#5A00D6' }}>◉</span> Shared employee record. Saved answers prefill matching forms in Intake and Staff Profiles. Files linked to a staff profile are filed in the Document Hub; signed documents stay unchanged.
      </p>
    </div>
  );
}