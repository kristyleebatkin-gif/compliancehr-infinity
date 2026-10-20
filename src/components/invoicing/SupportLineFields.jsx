import React, { useId } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SupportLineFields({ line, onChange }) {
  const id = useId();
  return <div className="grid gap-2 sm:col-span-12 sm:grid-cols-4">
    {[['support_worker', 'Support worker', 'text'], ['service_date', 'Service date', 'date'], ['start_time', 'Start time', 'time'], ['end_time', 'End time', 'time']].map(([key, label, type]) =>
      <div key={key} className="grid min-w-0 gap-1"><Label htmlFor={`${id}-${key}`} className="text-xs">{label}</Label><Input id={`${id}-${key}`} type={type} value={line[key] || ''} onChange={(event) => onChange({ [key]: event.target.value })} /></div>
    )}
  </div>;
}