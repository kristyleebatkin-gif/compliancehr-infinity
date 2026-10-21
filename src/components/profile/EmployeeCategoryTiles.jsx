import React from 'react';
import { Users } from 'lucide-react';
const TONES = { Administration: 'var(--teal)', 'Compliance Manager': 'var(--primary)', Management: 'var(--chart-5)', 'Support Worker': 'var(--safe)', 'Team Leader': 'var(--warning)', Unassigned: 'var(--hr-evidence)' };
export default function EmployeeCategoryTiles({ categories, selected, onSelect, total }) {
  const tiles = [{ key: 'all', label: 'All users', count: total ?? '…' }, ...categories.map(category => ({ ...category, key: category.label }))];
  return <div aria-label="Employee categories" className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
    {tiles.map(({ key, label, count }) => <button key={key} type="button" aria-pressed={selected === key} onClick={() => onSelect(selected === key ? 'all' : key)} className="employee-directory-tile flex min-w-0 items-center gap-2 rounded-xl p-3 text-left focus-visible:ring-2 focus-visible:ring-ring" style={{ '--directory-tone': key === 'all' ? 'var(--primary)' : TONES[label] || 'var(--hr-evidence)' }}>
      <Users className="h-5 w-5 shrink-0" />
      <span className="min-w-0 flex-1 text-xs font-bold">{label}</span><span className="text-xl font-extrabold tabular-nums">{count}</span>
    </button>)}
  </div>;
}