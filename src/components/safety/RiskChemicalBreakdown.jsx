import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useRole } from '@/lib/useRole';
import { openRiskQuery } from '@/components/safety/riskChemicalQueries';

export default function RiskChemicalBreakdown({ kind }) {
  const { user } = useRole();
  const isRisk = kind === 'risk';
  const field = isRisk ? 'rating' : 'hazard_class';
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['risk-chemical-dashboard', 'breakdown', kind, user?.id], enabled: !!user?.id,
    queryFn: () => base44.entities[isRisk ? 'Risk' : 'Chemical'].aggregate({ query: isRisk ? openRiskQuery : {}, groupBy: field }),
  });
  const rows = (data?.rows || []).map((row) => ({ label: row[field] || 'Not recorded', count: row.count })).sort((a, b) => b.count - a.count);
  const max = Math.max(1, ...rows.map((row) => row.count));
  return (
    <section className="executive-glass-surface min-w-0 rounded-xl border border-header-foreground/20 p-5 text-header-foreground shadow-panel">
      <div className="flex flex-wrap items-start justify-between gap-2"><div><h2 className="text-base font-extrabold">{isRisk ? 'Open risks by rating' : 'Chemical hazard classes'}</h2><p className="mt-1 text-xs">{isRisk ? 'Recorded risk ratings' : 'Exact hazard class text from the chemical register'}</p></div><Link className="text-xs font-bold underline" to={isRisk ? '/risks' : '/equipment-manuals?tab=msds'}>Open register</Link></div>
      {isPending ? <p className="mt-6 text-sm">Loading…</p> : isError ? <p role="alert" className="mt-6 text-sm">Data unavailable. <button onClick={() => refetch()} className="underline">Retry</button></p> : rows.length === 0 ? <p className="mt-6 text-sm">No records to display.</p> : <div className="mt-5 space-y-3">{rows.map((row, index) => (
        <div key={`${row.label}-${index}`}><div className="mb-1 flex justify-between gap-2 text-xs font-semibold"><span className="break-words">{row.label}</span><span className="tabular-nums">{row.count}</span></div><div className="h-2 overflow-hidden rounded-full bg-header-foreground/20"><div className="h-full rounded-full bg-header-foreground" style={{ width: `${(row.count / max) * 100}%` }} /></div></div>
      ))}</div>}
    </section>
  );
}