import React, { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useRole } from '@/lib/useRole';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function StaffGoalOwnerField({ value, onChange }) {
  const { user, role } = useRole();
  const manager = ['Provider Administrator', 'Management', 'Administration'].includes(role);
  const [search, setSearch] = useState('');
  const query = useInfiniteQuery({
    queryKey: ['staff-goal-owners', user?.id, manager, search], initialPageParam: undefined,
    queryFn: ({ pageParam }) => base44.entities.StaffProfile.filter({ ...(manager ? {} : { email: user.email }), ...(search.trim() ? { full_name: { $regex: search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } } : {}) }, { sort: 'full_name', limit: 50, cursor: pageParam, fields: ['full_name', 'email'] }),
    getNextPageParam: (page) => page.has_more ? page.next_cursor : undefined,
  });
  const staff = query.data?.pages.flatMap((page) => page.items) || [];
  return <div className="grid gap-1.5">
    <Label htmlFor="staff-goal-owner">Employee *</Label>
    {manager && <Input aria-label="Search employees for goal" placeholder="Search employees" value={search} onChange={(event) => setSearch(event.target.value)} />}
    <select id="staff-goal-owner" required value={value} onChange={(event) => onChange(staff.find((person) => person.id === event.target.value))} className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground">
      <option value="">{query.isPending ? 'Loading employees...' : 'Select employee'}</option>
      {staff.map((person) => <option key={person.id} value={person.id} disabled={!person.email}>{person.full_name}{person.email ? '' : ' (email required)'}</option>)}
    </select>
    {query.isError && <p role="alert" className="text-xs text-destructive">{query.error.message}</p>}
    {!query.isPending && !staff.length && <p className="text-xs text-muted-foreground">No employee profiles found. Ask HR to set up the employee profile.</p>}
    {query.hasNextPage && <Button type="button" variant="outline" size="sm" disabled={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>Load more employees</Button>}
  </div>;
}