import React, { useState } from 'react';

export default function EmployeeProfileSection({ title, children }) {
  const [activated, setActivated] = useState(false);
  return <details className="min-w-0 rounded-xl border border-border bg-card p-2" onToggle={(event) => { if (event.target === event.currentTarget && event.currentTarget.open) setActivated(true); }}>
    <summary className="cursor-pointer text-xs font-semibold">{title}</summary>
    {activated && <div className="mt-2 min-w-0 space-y-2">{children}</div>}
  </details>;
}