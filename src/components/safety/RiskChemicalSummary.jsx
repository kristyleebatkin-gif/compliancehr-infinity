import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useRole } from '@/lib/useRole';
import { Activity, AlertTriangle, FlaskConical, Wrench } from 'lucide-react';
import { safetyDashboardToday, filteredRiskQuery, filteredChemicalQuery } from '@/components/safety/riskChemicalQueries';

export default function RiskChemicalSummary({ riskRating, hazardClass }) {
  const { user } = useRole();
  const today = safetyDashboardToday();
  const { data, isPending } = useQuery({
    queryKey: ['risk-chemical-dashboard', 'summary', user?.id, today, riskRating, hazardClass], enabled: !!user?.id,
    queryFn: async () => {
      const results = await Promise.allSettled([
        base44.entities.Risk.count(filteredRiskQuery(riskRating)),
        base44.entities.Risk.count({ ...filteredRiskQuery(riskRating), $and: [{ rating: { $in: ['High', 'Critical'] } }] }),
        base44.entities.Chemical.count(filteredChemicalQuery(hazardClass)),
        base44.entities.Asset.count({ status: { $ne: 'Retired' }, next_service_date: { $gte: '1900-01-01', $lt: today } }),
      ]);
      return results.map((r) => r.status === 'fulfilled' ? r.value : null);
    },
  });
  const cards = [
    ['Open risks', 'Identified through monitored', Activity],
    ['High & critical', 'Open risks needing attention', AlertTriangle],
    ['Chemicals', 'Chemical register records', FlaskConical],
    ['Overdue services', 'Active assets past service date', Wrench],
  ];
  return <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">{cards.map(([title, subtitle, Icon], i) => (
    <article key={title} className="executive-glass-surface min-w-0 rounded-xl border border-header-foreground/20 p-4 text-header-foreground shadow-panel">
      <Icon className="h-5 w-5" /><p className="mt-3 text-xs font-bold">{title}</p>
      <p className="mt-1 text-3xl font-extrabold tabular-nums">{isPending ? '…' : data?.[i] ?? 'Unavailable'}</p>
      <p className="mt-1 text-xs">{subtitle}</p>
    </article>
  ))}</div>;
}