import React, { useState } from 'react';

const tones = {
  purple: 'border-chart-1/50 bg-chart-1/10', blue: 'border-chart-2/50 bg-chart-2/10',
  green: 'border-chart-3/50 bg-chart-3/10', orange: 'border-chart-4/50 bg-chart-4/10',
  pink: 'border-chart-5/50 bg-chart-5/10', red: 'border-danger/50 bg-danger/10',
  slate: 'border-foreground/40 bg-foreground/5', neutral: 'border-border bg-card',
  teal: 'border-[hsl(var(--hr-evidence)/0.5)] bg-[hsl(var(--hr-evidence)/0.1)]',
};
export default function EmployeeProfileSection({ title, children, tone = 'neutral' }) {
  const [activated, setActivated] = useState(false);
  return <details className={`min-w-0 rounded-xl border border-l-4 p-2 ${tones[tone] || tones.neutral}`} onToggle={(event) => { if (event.target === event.currentTarget && event.currentTarget.open) setActivated(true); }}>
    <summary className="cursor-pointer text-xs font-semibold">{title}</summary>
    {activated && <div className="mt-2 min-w-0 space-y-2">{children}</div>}
  </details>;
}