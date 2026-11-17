import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useRole } from '@/lib/useRole';
import { executiveIdentity, canReadExecutiveMetrics } from '@/lib/executiveMetrics';
import { businessToday, integrityDimensions, scoreIntegrityIndex } from '@/lib/integrityIndex';

// Loads the real counts behind every integrity measure for the signed-in business, then scores them.
export default function useIntegrityIndex() {
  const { user } = useRole();
  const today = businessToday();
  const tenant = user?.tenant_id || user?.data?.tenant_id;

  return useQuery({
    queryKey: ['enterprise-integrity-index', executiveIdentity(user), today],
    enabled: Boolean(tenant && canReadExecutiveMetrics(user)),
    staleTime: 60000,
    queryFn: async () => {
      const dimensions = integrityDimensions(today);
      const measures = dimensions.flatMap((dimension) => dimension.measures);
      const results = await Promise.allSettled(
        measures.map((measure) => base44.entities[measure.entity].count({ ...measure.query, tenant_id: tenant })),
      );
      const counts = Object.fromEntries(measures.map((measure, index) => {
        const result = results[index];
        const value = result.status === 'fulfilled' ? result.value : null;
        return [measure.key, Number.isSafeInteger(value) && value >= 0 ? value : null];
      }));
      return { ...scoreIntegrityIndex(dimensions, counts), counts, today };
    },
  });
}