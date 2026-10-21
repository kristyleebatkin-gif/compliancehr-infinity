import React from 'react';
import { Users } from 'lucide-react';
const TONES = { Administration: 'var(--teal)', 'Compliance Manager': 'var(--primary)', Management: 'var(--chart-5)', 'Support Worker': 'var(--safe)', 'Team Leader': 'var(--warning)', Unassigned: 'var(--hr-evidence)' };
export default function EmployeeCategoryTiles({ categories, selected, onSelect }) {
  return <div aria-label="Employee categories" className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
    {categories.map(({ label, count }) => <button key={label} type="button" aria-pressed={selected === label} onClick={() => onSelect(selected === label ? 'all' : label)} className="employee-directory-tile flex min-w-0 items-center gap-2 rounded-xl p-3 text-left focus-visible:ring-2 focus-visible:ring-ring" style={{ '--directory-tone': TONES[label] || 'var(--hr-evidence)' }}>
      <Users className="h-5 w-5 shrink-0" />
      <span className="min-w-0 flex-1 text-xs font-bold">{label}</span><span className="text-xl font-extrabold tabular-nums">{count}</span>
    </button>)}
  </div>;
}