import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const TONE_BORDER = {
  purple: '#5A00D6',
  violet: '#5A00D6',
  blue: '#0072FF',
  green: '#0072FF',
  orange: '#A100FF',
  pink: '#FF2E9A',
  red: '#FF2E9A',
  slate: '#0072FF',
  neutral: '#5A00D6',
  teal: '#00C6FF',
  yellow: '#A100FF',
};

const HEADING_TEXT_GRADIENT =
  'linear-gradient(90deg, #0A2B6D 0%, #0A2B6D 38%, #0072FF 62%, #5A00D6 82%, #FF2E9A 100%)';

export default function EmployeeProfileSection({
  title,
  children,
  tone = 'neutral',
  uniform = false,
  half = false,
  defaultOpen = false,
}) {
  const [activated, setActivated] = useState(defaultOpen);
  const borderCol = TONE_BORDER[tone] || '#5A00D6';

  return (
    <details
      data-profile-tone={tone}
      {...(half ? { 'data-profile-half': '' } : {})}
      {...(defaultOpen ? { open: true } : {})}
      className={`min-w-0 rounded-xl bg-white p-2.5 shadow-2xs ${uniform ? 'profile-uniform-box' : ''}`}
      style={{ border: `2px solid ${borderCol}` }}
      onToggle={(event) => {
        if (event.target === event.currentTarget && event.currentTarget.open) setActivated(true);
      }}
    >
      <summary
        className="app-section-card-header flex cursor-pointer items-center justify-between gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-extrabold"
        style={{ border: `2px solid ${borderCol}` }}
      >
        <span className="flex min-w-0 items-center gap-1.5">
          <span style={{ color: borderCol }}>◉</span>
          <span
            className="bg-clip-text text-transparent font-extrabold"
            style={{ backgroundImage: HEADING_TEXT_GRADIENT }}
          >
            {title}
          </span>
        </span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0" style={{ color: borderCol }} />
      </summary>
      {activated && <div className="mt-2 min-w-0 space-y-2">{children}</div>}
    </details>
  );
}