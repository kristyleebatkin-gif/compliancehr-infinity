import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const TONE_SYMBOL = {
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

const SECTION_DARK_BLUE_STYLE = {
  border: '2px solid transparent',
  background:
    'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%) padding-box, linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #5A00D6 62%, #FF2E9A 100%) border-box',
};

const GRADIENT_BORDER_STYLE = {
  border: '2px solid transparent',
  background:
    'linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #5A00D6 62%, #FF2E9A 100%) border-box',
};

export default function EmployeeProfileSection({
  title,
  children,
  tone = 'neutral',
  uniform = false,
  half = false,
  defaultOpen = false,
}) {
  const [activated, setActivated] = useState(defaultOpen);
  const symCol = TONE_SYMBOL[tone] || '#5A00D6';

  return (
    <details
      data-profile-tone={tone}
      {...(half ? { 'data-profile-half': '' } : {})}
      {...(defaultOpen ? { open: true } : {})}
      className={`min-w-0 rounded-xl p-2.5 shadow-2xs ${uniform ? 'profile-uniform-box' : ''}`}
      style={SECTION_DARK_BLUE_STYLE}
      onToggle={(event) => {
        if (event.target === event.currentTarget && event.currentTarget.open) setActivated(true);
      }}
    >
      <summary
        className="app-section-card-header flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-xs font-extrabold text-[#0A2B6D]"
        style={GRADIENT_BORDER_STYLE}
      >
        <span className="flex min-w-0 items-center gap-1.5 text-[#0A2B6D]">
          <span style={{ color: symCol }}>◉</span>
          <span className="font-extrabold text-[#0A2B6D]">{title}</span>
        </span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0" style={{ color: symCol }} />
      </summary>
      {activated && <div className="mt-2 min-w-0 space-y-2">{children}</div>}
    </details>
  );
}