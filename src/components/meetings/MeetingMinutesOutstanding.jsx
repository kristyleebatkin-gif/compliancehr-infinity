import React from 'react';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function MeetingMinutesOutstanding({ meetings }) {
  if (!meetings.length) return null;
  return <section className="meeting-pink rounded-xl border p-3 text-sm" aria-label="Minutes outstanding">
    <p className="flex items-center gap-2 font-bold"><Clock className="h-4 w-4 shrink-0" />Minutes outstanding ({meetings.length})</p>
    <p className="mt-1 text-xs text-muted-foreground">{meetings.map((m) => `${m.title}${m.date ? ` (${format(new Date(m.date), 'd MMM')})` : ''}`).join(' · ')} - open a meeting below to record its minutes.</p>
  </section>;
}