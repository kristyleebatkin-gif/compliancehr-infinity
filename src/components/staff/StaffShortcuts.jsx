import React from 'react';
import { Users, ShieldCheck, Trophy, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SHORTCUTS = [
  ['profiles', 'Staff profile', Users],
  ['certifications', 'Staff certificates', ShieldCheck],
  ['recognition', 'Leaderboard', Trophy],
];

export default function StaffShortcuts({ value, onChange, onProgress }) {
  return <nav aria-label="Staff shortcuts" className="mb-2 flex flex-wrap gap-1.5 sm:max-lg:[&_button]:h-7 sm:max-lg:[&_button]:px-2 sm:max-lg:[&_button]:text-[11px]">
    {SHORTCUTS.map(([key, label, Icon]) => <Button key={key} type="button" size="sm" variant="outline" aria-pressed={value === key} onClick={() => onChange(key)} className={value === key ? 'gap-1.5 border-primary/40 bg-primary/10 text-primary' : 'gap-1.5'}>
      <Icon className="h-4 w-4" />{label}
    </Button>)}
    {onProgress && <Button type="button" size="sm" variant="outline" onClick={onProgress} className="gap-1.5"><TrendingUp className="h-4 w-4" />Staff progress &amp; compliance</Button>}
  </nav>;
}