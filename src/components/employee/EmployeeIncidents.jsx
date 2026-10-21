import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useRole } from '@/lib/useRole';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function EmployeeIncidents({ embedded = false }) {
  const { user } = useRole();
  const [search, setSearch] = useState('');
  const query = useInfiniteQuery({ queryKey: ['employee-incidents', user?.id, search], initialPageParam: null,
    queryFn: ({ pageParam }) => base44.entities.Incident.filter({ created_by_id: user.id, ...(search ? { title: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } } : {}) }, { sort: '-date_occurred', limit: 25, cursor: pageParam }),
    getNextPageParam: (page) => page.has_more ? page.next_cursor : undefined,
  });
  const items = query.data?.pages.flatMap((page) => page.items) || [];
  return <section className="space-y-4">
    {!embedded && <PageHeader title="My Incidents" subtitle="Your submitted incident reports." />}
    <div className="flex flex-wrap gap-3"><Button asChild variant="outline"><Link to="/incidents/submit">Report an incident</Link></Button><Input aria-label="Search my incidents" placeholder="Search my incidents" value={search} onChange={(event) => setSearch(event.target.value)} className="max-w-sm" /></div>
    {query.isPending ? <p role="status">Loading your incidents…</p> : query.isError ? <p role="alert" className="text-destructive">{query.error.message}<Button variant="outline" onClick={() => query.refetch()}>Retry</Button></p> : !items.length ? <p className="rounded-xl border border-border bg-card p-6 text-muted-foreground">No incident reports found.</p> : items.map((item) => <article key={item.id} className="space-y-2 rounded-xl border border-border bg-card p-4"><div className="flex flex-wrap items-center justify-between gap-2"><Link className="font-semibold text-primary underline" to={`/incidents/${item.id}`}>{item.title}</Link><Badge variant="outline">{item.status}</Badge></div><p className="text-xs text-muted-foreground">{item.incident_id} · {item.date_occurred}</p><p className="whitespace-pre-wrap text-sm">{item.description}</p></article>)}
    {query.hasNextPage && <Button variant="outline" disabled={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>Load more incidents</Button>}
  </section>;
}