import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useRole } from '@/lib/useRole';

export default function RiskChemicalFilters({ riskRating, setRiskRating, hazardClass, setHazardClass }) {
  const { user } = useRole();
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['risk-chemical-dashboard', 'hazard-options', user?.id], enabled: !!user?.id,
    queryFn: () => base44.entities.Chemical.list({ distinct: 'hazard_class' }),
  });
  const classes = (data?.items || []).filter((value) => typeof value === 'string' && value.trim()).sort((a, b) => a.localeCompare(b));
  return (
    <section className="executive-glass-surface flex flex-wrap items-end gap-3 rounded-xl border border-header-foreground/20 p-4 text-header-foreground shadow-panel" aria-label="Dashboard filters">
      <label className="grid min-w-40 flex-1 gap-1 text-xs font-bold">Risk rating
        <select value={riskRating} onChange={(event) => setRiskRating(event.target.value)} className="min-h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground"><option value="">All ratings</option>{['Low', 'Medium', 'High', 'Critical'].map((rating) => <option key={rating} value={rating}>{rating}</option>)}</select>
      </label>
      <label className="grid min-w-40 flex-1 gap-1 text-xs font-bold">Chemical hazard class
        <select value={hazardClass} onChange={(event) => setHazardClass(event.target.value)} disabled={isPending || isError} className="min-h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground disabled:opacity-60"><option value="">{isPending ? 'Loading classes…' : 'All hazard classes'}</option><option value="__no_class__">Not recorded</option>{classes.map((value) => <option key={value} value={value}>{value}</option>)}</select>
      </label>
      <button type="button" onClick={() => { setRiskRating(''); setHazardClass(''); }} className="min-h-10 rounded-lg border border-header-foreground/30 px-4 text-sm font-bold hover:bg-workspace-navy">Clear filters</button>
      {isError && <p role="alert" className="w-full text-xs">Hazard classes could not be loaded. <button onClick={() => refetch()} className="underline">Retry</button></p>}
      <p className="w-full text-xs">Risk rating affects risk metrics and reviews; hazard class affects chemical metrics. Asset service dates are unchanged.</p>
    </section>
  );
}