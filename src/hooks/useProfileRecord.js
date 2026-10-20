import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useRole } from '@/lib/useRole';
import { managesProfiles, ownProfileQuery, preparePersonalProfileAccess } from '@/lib/personalProfileAccess';

export default function useProfileRecord(entityName, id) {
  const { user, role } = useRole();
  const selfOnly = !managesProfiles(role);
  const query = useQuery({
    queryKey: ['profile-record', entityName, id, user?.id, role],
    queryFn: async () => {
      await preparePersonalProfileAccess();
      const scope = selfOnly ? ownProfileQuery(user) : {};
      const page = await base44.entities[entityName].filter({ ...scope, id }, { limit: 1 });
      return page.items[0] || null;
    },
    enabled: Boolean(id && user?.id),
    retry: false,
  });
  return { profile: query.data, loading: !user?.id || query.isLoading, error: query.error, refresh: query.refetch };
}