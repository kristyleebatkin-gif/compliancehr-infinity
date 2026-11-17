import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useRole } from '@/lib/useRole';
import { executiveIdentity, canReadExecutiveMetrics } from '@/lib/executiveMetrics';
import { businessToday } from '@/lib/integrityIndex';
import { loadIntegrityIndex } from '@/lib/loadIntegrityIndex';

// Loads the real counts behind every integrity measure for the signed-in business, then scores them.
export default function useIntegrityIndex() {
  const { user } = useRole();
  const today = businessToday();
  const tenant = user?.tenant_id || user?.data?.tenant_id;

  return useQuery({
    queryKey: ['enterprise-integrity-index', executiveIdentity(user), today],
    enabled: Boolean(tenant && canReadExecutiveMetrics(user)),
    staleTime: 60000,
    queryFn: () => loadIntegrityIndex({ entities: base44.entities, user, today }),
  });
}