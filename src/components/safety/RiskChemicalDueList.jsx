import React from 'react';
import { Link } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useRole } from '@/lib/useRole';
import { filteredRiskQuery, safetyDashboardDate, safetyDashboardToday } from '@/components/safety/riskChemicalQueries';

export default function RiskChemicalDueList({ kind, riskRating }) {
  const { user } = useRole();
  const risk = kind === 'risk';
  const field = risk ? 'review_date' : 'next_service_date';
  const today = safetyDashboardToday();
  const { data, isPending, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['risk-chemical-dashboard', 'dates', kind, user?.id, risk ? riskRating : null], enabled: !!user?.id, initialPageParam: undefined,
    queryFn: ({ pageParam }) => base44.entities[risk ? 'Risk' : 'Asset'].filter({ ...(risk ? filteredRiskQuery(riskRating) : { status: { $ne: 'Retired' } }), [field]: { $gte: '1900-01-01' } }, { sort: field, limit: 10, ...(pageParam ? { cursor: pageParam } : {}) }),
    getNextPageParam: (page) => page.has_more ? page.next_cursor : undefined,
  });
  const records = data?.pages.flatMap((page) => page.items) || [];
  return (
    <section className="executive-glass-surface min-w-0 rounded-xl border border-header-foreground/20 p-5 text-header-foreground shadow-panel">
      <div className="flex flex-wrap items-start justify-between gap-2"><div><h2 className="text-base font-extrabold">{risk ? 'Risk review dates' : 'Asset service dates'}</h2><p className="mt-1 text-xs">{risk ? 'Open risks with a review date' : 'Non-retired assets with a next service date'}</p></div><Link className="text-xs font-bold underline" to={risk ? '/risks' : '/assets'}>Open register</Link></div>
      {isPending ? <p className="mt-6 text-sm">Loading…</p> : isError && !data ? <p role="alert" className="mt-6 text-sm">Dates unavailable. <button onClick={() => refetch()} className="underline">Retry</button></p> : records.length === 0 ? <p className="mt-6 text-sm">No dates recorded yet.</p> : <ul className="mt-4 divide-y divide-header-foreground/20">{records.map((item) => <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 py-3"><div className="min-w-0"><p className="break-words text-sm font-bold">{risk ? item.title : item.name}</p><p className="text-xs">{risk ? item.rating : item.location || item.category}</p></div><div className="text-right text-xs"><p className="font-bold">{safetyDashboardDate(item[field])}</p><p>{item[field] < today ? 'Overdue' : item[field] === today ? 'Due today' : 'Upcoming'}</p></div></li>)}</ul>}
      {hasNextPage && <button type="button" disabled={isFetchingNextPage} onClick={() => fetchNextPage()} className="mt-3 rounded-lg border border-header-foreground/30 px-3 py-2 text-xs font-bold hover:bg-workspace-navy disabled:opacity-50">{isFetchingNextPage ? 'Loading…' : 'Load more'}</button>}
      {isError && data && <p role="alert" className="mt-2 text-xs">Could not load more dates. Please try again.</p>}
    </section>
  );
}