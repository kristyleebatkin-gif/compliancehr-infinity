import React from 'react';
export default function ProfileConsentLog({ profile }) {
  const entries = String(profile.change_log || '').split('\n').filter((line) => /(?:audit consent|consent to share information|consent to act as an advocate|medication consent):/i.test(line));
  return <details className="mt-2 border-t border-border pt-1.5">
    <summary className="cursor-pointer text-[11px] font-semibold">Consent log</summary>
    {entries.length ? <ul className="mt-1 max-h-28 space-y-1 overflow-y-auto">{entries.map((entry, index) => <li key={index} className="break-words text-[10px] leading-relaxed text-muted-foreground">{entry}</li>)}</ul> : <p className="mt-1 text-[10px] text-muted-foreground">No consent changes logged yet.</p>}
  </details>;
}