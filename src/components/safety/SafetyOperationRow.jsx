import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function SafetyOperationRow({ to, primary, secondary, badge, alert }) {
  return <Link to={to} className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3 hover:bg-accent ${alert ? 'border-danger/30 bg-danger/5' : 'border-border bg-card'}`}>
    <div className="min-w-0 flex-1 basis-32"><p className="break-words text-sm font-semibold">{primary}</p><p className="mt-1 break-words text-xs text-muted-foreground">{secondary}</p></div>
    <div className="flex flex-wrap items-center gap-1.5">{badge}<ChevronRight className="h-3.5 w-3.5 text-muted-foreground" /></div>
  </Link>;
}