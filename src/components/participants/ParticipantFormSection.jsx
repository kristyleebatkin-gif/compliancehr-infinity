import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ParticipantFillableForms from '@/components/participants/ParticipantFillableForms';

export default function ParticipantFormSection({ participant, form, required }) {
  const [params] = useSearchParams();
  const selected = params.get('form') === form.key;
  const [open, setOpen] = useState(selected);
  useEffect(() => { if (selected) setOpen(true); }, [selected]);
  return <details open={open} onToggle={(event) => { if (event.target === event.currentTarget) setOpen(event.currentTarget.open); }} className="min-w-0 rounded-xl border border-border border-l-4 border-l-primary bg-card p-3">
    <summary className="cursor-pointer text-sm font-semibold"><span>{form.key}</span><span className="ml-2 text-xs font-normal text-muted-foreground">{required ? 'Required intake form' : 'Additional form'}{form.code ? ` · ${form.code}` : ''}</span></summary>
    {open && <div className="mt-3"><ParticipantFillableForms participant={participant} formType={form.key} /></div>}
  </details>;
}