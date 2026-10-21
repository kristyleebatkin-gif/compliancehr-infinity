import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

const tones = { danger: 'border-danger/30 bg-danger/10', primary: 'border-primary/30 bg-primary/10', teal: 'border-hr-evidence/30 bg-hr-evidence/10' };
export default function SafetyOperationTile({ icon: Icon, label, count, urgent, to, tone }) {
  return <Link to={to} className={`flex min-w-0 flex-col gap-4 rounded-2xl border p-4 shadow-sm transition-shadow hover:shadow-md ${tones[tone]}`}>
    <div className="flex flex-wrap items-start justify-between gap-2"><span className="rounded-xl border border-border bg-card p-2 text-foreground"><Icon className="h-5 w-5" /></span>{urgent > 0 && <Badge className="border-danger/25 bg-card text-danger">{urgent} urgent</Badge>}</div>
    <div><p className="text-3xl font-extrabold tabular-nums tracking-tight text-foreground">{count}</p><p className="mt-1 break-words text-xs font-semibold text-foreground">{label}</p></div>
  </Link>;
}