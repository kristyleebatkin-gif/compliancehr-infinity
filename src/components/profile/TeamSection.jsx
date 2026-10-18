import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, X } from 'lucide-react';

// Team section for profiles: chips of team members with add/remove, saving
// straight to the profile record.
export default function TeamSection({ title, description, values = [], kind, onUpdate, footer }) {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (kind === 'participants') {
          const page = await base44.entities.ParticipantProfile.list({ sort: 'full_name', limit: 200, fields: ['full_name'] });
          if (alive) setOptions((page.items || []).map((p) => p.full_name).filter(Boolean));
        } else {
          const page = await base44.entities.StaffProfile.list({ sort: 'full_name', limit: 200, fields: ['full_name'] });
          if (alive) setOptions((page.items || []).map((s) => s.full_name).filter(Boolean));
        }
      } catch (error) { console.error(error); }
    })();
    return () => { alive = false; };
  }, [kind]);

  const remaining = options.filter((o) => !values.includes(o));

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="mb-1 flex items-center gap-2 text-sm font-semibold"><Users className="h-4 w-4 text-brand" />{title}</div>
      {description && <p className="mb-3 text-xs text-muted-foreground">{description}</p>}
      <div className="flex flex-wrap items-center gap-2">
        {values.length === 0 && <span className="text-sm text-muted-foreground">No team members added yet.</span>}
        {values.map((name) => (
          <span key={name} className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
            {name}
            <button onClick={() => onUpdate(values.filter((v) => v !== name))} className="rounded-full p-0.5 hover:bg-brand/20"><X className="h-3 w-3" /></button>
          </span>
        ))}
      </div>
      {remaining.length > 0 && (
        <div className="mt-3">
          <Select value="none" onValueChange={(v) => { if (v !== 'none') onUpdate([...values, v]); }}>
            <SelectTrigger className="h-9 w-full sm:w-[250px]"><SelectValue placeholder="Add a team member..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Select to add...</SelectItem>
              {remaining.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}
      {footer}
    </div>
  );
}