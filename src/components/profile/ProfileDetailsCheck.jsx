import React from 'react';
import { History } from 'lucide-react';

export default function ProfileDetailsCheck({ profile }) {
  const lines = String(profile.change_log || '').split('\n').filter(Boolean);
  return <details className="min-w-0 rounded-lg border border-border/60 bg-muted/40 px-2.5 py-2">
    <summary className="cursor-pointer text-[11px] font-semibold"><History className="mr-1 inline h-3 w-3" />Details check &amp; change log</summary>
    {profile.last_details_check_date && <p className="mt-1 text-[10px] text-muted-foreground">Last check: {profile.last_details_check_date}</p>}
    {lines.length ? <ul className="mt-1 max-h-24 space-y-1 overflow-y-auto">{lines.map((line, index) => <li key={index} className="break-words text-[10px] text-muted-foreground">{line}</li>)}</ul> : <p className="mt-1 text-[10px] text-muted-foreground">No changes logged yet.</p>}
  </details>;
}