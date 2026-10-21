import React, { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import profileRecordExport from '@/lib/profileRecordExport';

export default function EmployeeLinkedRecords({ profile, entity, query, title }) {
  const [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const records = useInfiniteQuery({ queryKey: ['employee-profile-linked', profile.id, entity, query], initialPageParam: null, queryFn: ({ pageParam }) => base44.entities[entity].filter(query, { sort: '-created_date', limit: 20, ...(pageParam ? { cursor: pageParam } : {}) }), getNextPageParam: (page) => page.has_more ? page.next_cursor : undefined });
  const rows = (item) => Object.entries(item).filter(([key, value]) => !['id', 'created_by_id'].includes(key) && value != null && value !== '').map(([field, value]) => ({ field: field.replaceAll('_', ' '), value: typeof value === 'object' ? JSON.stringify(value) : String(value) }));
  const download = async (item) => { setBusy(true); setError(''); try { await profileRecordExport(title, profile, rows(item), 'pdf'); } catch (failure) { setError(failure.message); } finally { setBusy(false); } };
  return <div className="min-w-0 space-y-2">
    <h4 className="text-xs font-semibold">{title}</h4>
    {records.isPending ? <p role="status" className="text-xs">Loading records…</p> : records.isError ? <p role="alert" className="text-xs text-destructive">These records could not be loaded with the current access: {records.error.message}<Button type="button" variant="outline" size="sm" onClick={() => records.refetch()}>Retry</Button></p> : <>
      {!records.data.pages[0].items.length && <p className="text-xs text-muted-foreground">No accessible records on file.</p>}
      {records.data.pages.flatMap((page) => page.items).map((item) => <details key={item.id} className="min-w-0 rounded-lg border border-border p-2"><summary className="cursor-pointer text-xs">{item.title || item.module_title || item.position_title || item.shift || item.review_type || title} · {item.date || item.completed_date || item.scheduled_review_date || item.created_date?.slice(0, 10)}</summary><dl className="mt-2 space-y-1">{rows(item).map((row) => <div key={row.field} className="text-[11px]"><dt className="font-medium capitalize">{row.field}</dt><dd className="whitespace-pre-wrap break-words text-muted-foreground">{row.value}</dd></div>)}</dl><Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => download(item)}>Download record PDF</Button></details>)}
      {records.hasNextPage && <Button type="button" size="sm" variant="outline" disabled={records.isFetchingNextPage} onClick={() => records.fetchNextPage()}>Load more records</Button>}
    </>}
    {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
  </div>;
}