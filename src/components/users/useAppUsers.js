import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { hasApprovedAccess } from '@/lib/roles';

export default function useAppUsers(search = '') {
  const { user } = useAuth();
  const client = useQueryClient();
  const enabled = hasApprovedAccess(user) && ['admin', 'Provider Administrator', 'Management'].includes(user?.role);
  const query = useQuery({
    queryKey: ['app-users', search], enabled, refetchInterval: 30000,
    queryFn: async () => {
      const { data } = await base44.functions.invoke('manageAppAccess', { action: 'list', search });
      return data;
    },
  });
  return { ...query, enabled, refresh: () => client.invalidateQueries({ queryKey: ['app-users'] }) };
}