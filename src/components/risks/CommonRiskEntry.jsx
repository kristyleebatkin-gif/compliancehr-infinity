import React from 'react';
import { Plus } from 'lucide-react';
import EditableSafetyText from '@/components/safety/EditableSafetyText';
import useSafetyGuidance from '@/components/safety/useSafetyGuidance';

export default function CommonRiskEntry({ group, risk, adding, onAdd }) {
  const query = useSafetyGuidance('risks');
  const key = `${group}-${risk.title}`;
  const description = query.data?.find((item) => item.guidance_key === key)?.text ?? risk.description;
  return <div className="space-y-2 rounded-xl border border-border bg-card p-3">
    <div className="flex items-start justify-between gap-2"><h4 className="min-w-0 break-words text-xs font-semibold">{risk.title}</h4><button type="button" onClick={() => onAdd(group, { ...risk, description })} disabled={adding === key || query.isPending || query.isError} className="flex shrink-0 items-center gap-1 rounded-lg bg-primary/10 px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/20 disabled:opacity-50"><Plus className="h-3 w-3" />{adding === key ? 'Adding…' : 'Add'}</button></div>
    <div className="text-xs leading-5 text-muted-foreground"><EditableSafetyText module="risks" guidanceKey={key} defaultText={risk.description} label={`Response for ${risk.title}`} /></div>
  </div>;
}