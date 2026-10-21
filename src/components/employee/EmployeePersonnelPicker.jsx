import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useRole } from '@/lib/useRole';
import { Button } from '@/components/ui/button';
export default function EmployeePersonnelPicker({ selected, onChange }) {
  const { user } = useRole();
  const query = useQuery({ queryKey: ['employee-key-personnel', user.id], queryFn: async () => (await base44.functions.invoke('employeeCommunications', { action: 'contacts' })).data.items });
  return <fieldset className="space-y-2 rounded-lg border border-border p-3"><legend className="text-sm font-semibold">Business contacts, management and admin</legend>
    {query.isPending ? <p role="status" className="text-sm">Loading key personnel…</p> : query.isError ? <p role="alert" className="text-destructive">{query.error.message}<Button variant="outline" onClick={() => query.refetch()}>Retry</Button></p> : !query.data.length ? <p className="text-sm text-muted-foreground">No eligible contacts are available.</p> : <div className="max-h-52 space-y-2 overflow-y-auto">{query.data.map((person) => <label key={person.email} className="flex items-start gap-2 text-sm"><input type="checkbox" checked={selected.includes(person.email)} disabled={selected.length >= 25 && !selected.includes(person.email)} onChange={(event) => onChange(event.target.checked ? [...selected, person.email] : selected.filter((email) => email !== person.email))} /><span>{person.name}<span className="block text-xs text-muted-foreground">{person.type} · {person.email}</span></span></label>)}</div>}
    <p className="text-xs text-muted-foreground">Choose up to 25 recipients.</p>
  </fieldset>;
}