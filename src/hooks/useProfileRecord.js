import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function useProfileRecord(entityName, id) {
  const query = useQuery({
    queryKey: ['profile-record', entityName, id],
    queryFn: () => base44.entities[entityName].get(id),
    enabled: Boolean(id),
    retry: false,
  });
  return { profile: query.data, loading: query.isLoading, error: query.error, refresh: query.refetch };
}