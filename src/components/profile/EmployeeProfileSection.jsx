import React, { useState } from 'react';

const tones = {
  purple: 'bg-chart-1/10', blue: 'bg-chart-2/10',
  green: 'bg-chart-3/10', orange: 'bg-chart-4/10',
  pink: 'bg-chart-5/10', red: 'bg-danger/10',
  slate: 'bg-foreground/5', neutral: 'bg-card',
  teal: 'bg-[hsl(var(--hr-evidence)/0.1)]',
  yellow: 'bg-[hsl(var(--profile-lemon))]',
};
export default function EmployeeProfileSection({ title, children, tone = 'neutral', uniform = false }) {
  const [activated, setActivated] = useState(false);
  return <details data-profile-tone={tone} className={`min-w-0 rounded-xl p-2 ${tones[tone] || tones.neutral} ${uniform ? 'profile-uniform-box' : ''}`} onToggle={(event) => { if (event.target === event.currentTarget && event.currentTarget.open) setActivated(true); }}>
    <summary className="app-section-card-header flex cursor-pointer items-center rounded-lg px-3 text-xs font-semibold">{title}</summary>
    {activated && <div className="mt-2 min-w-0 space-y-2">{children}</div>}
  </details>;
}