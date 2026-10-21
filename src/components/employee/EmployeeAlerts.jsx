import React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useRole } from '@/lib/useRole';
import { Button } from '@/components/ui/button';
import EmployeeAlertAction from '@/components/employee/EmployeeAlertAction';
export default function EmployeeAlerts() {
  const { user } = useRole();
  const query = useInfiniteQuery({ queryKey: ['employee-notifications', user.id], initialPageParam: null, queryFn: ({ pageParam }) => base44.entities.Notification.filter({ recipient_id: user.id }, { sort: '-created_date', limit: 25, cursor: pageParam }), getNextPageParam: (page) => page.has_more ? page.next_cursor : undefined });
  const items = query.data?.pages.flatMap((page) => page.items || []) || [];
  return <section className="space-y-3"><Button variant="outline" onClick={() => query.refetch()} disabled={query.isFetching}>Refresh my alerts</Button>
    {query.isPending ? <p role="status">Loading your alerts…</p> : query.isError ? <p role="alert" className="text-destructive">{query.error.message}</p> : !items.length ? <p className="text-sm text-muted-foreground">No alerts addressed to you.</p> : items.map((item) => <article key={item.id} className="space-y-2 rounded-xl border border-border bg-card p-4"><h3 className="text-sm font-semibold">{item.type}</h3><p className="whitespace-pre-wrap text-sm">{item.message}</p><p className="text-xs text-muted-foreground">{item.created_date?.slice(0, 10)}</p><EmployeeAlertAction notification={item} />{!item.read && <Button size="sm" variant="outline" onClick={async () => { await base44.entities.Notification.update(item.id, { read: true }); await query.refetch(); }}>Mark read</Button>}</article>)}
    {query.hasNextPage && <Button variant="outline" onClick={() => query.fetchNextPage()} disabled={query.isFetchingNextPage}>Load more alerts</Button>}
  </section>;
}