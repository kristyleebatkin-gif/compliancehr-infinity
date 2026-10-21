import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useRole } from '@/lib/useRole';
import { profileRecordScope, preparePersonalProfileAccess } from '@/lib/personalProfileAccess';
import { loadProfileWithTimeout } from '@/lib/profileLoading';

export default function useProfileRecord(entityName, id) {
  const { user, role } = useRole();
  const query = useQuery({
    queryKey: ['profile-record', entityName, id, user?.id, role],
    queryFn: () => loadProfileWithTimeout(async () => {
      await preparePersonalProfileAccess();
      const scope = profileRecordScope(role, user, entityName);
      const page = await base44.entities[entityName].filter({ ...scope, id }, { limit: 1 });
      return page.items[0] || null;
    }),
    enabled: Boolean(id && user?.id),
    retry: false,
  });
  // Live updates: the profile re-reads the moment the record changes anywhere
  // in the app, so profiles stay in sync with the Our staff/participant lists.
  useEffect(() => {
    if (!id || !user?.id) return undefined;
    const entity = base44.entities[entityName];
    if (!entity?.subscribe) return undefined;
    return entity.subscribe(() => { query.refetch(); });
  }, [entityName, id, user?.id, query.refetch]);
  const missingAccount = !user?.id ? new Error('Your account could not be loaded. Please sign in again.') : null;
  const missingId = !id ? new Error('No profile was selected.') : null;
  return { profile: query.data, loading: Boolean(id && user?.id) && query.isLoading, error: missingAccount || missingId || query.error, refresh: query.refetch };
}