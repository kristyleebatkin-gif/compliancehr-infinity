import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useRole } from '@/lib/useRole';
import { BUSINESS_TIME_ZONE } from '@/lib/businessTime';
import { executiveIdentity, canReadExecutiveMetrics, loadExecutiveMetrics } from '@/lib/executiveMetrics';

export default function useExecutiveDashboardMetrics(view) {
  const { user } = useRole();
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: BUSINESS_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  return useQuery({
    queryKey: ['executive-dashboard-metrics', executiveIdentity(user), view, today],
    enabled: canReadExecutiveMetrics(user),
    queryFn: () => loadExecutiveMetrics({ entities: base44.entities, user, view, today }),
    staleTime: 30000,
  });
}
