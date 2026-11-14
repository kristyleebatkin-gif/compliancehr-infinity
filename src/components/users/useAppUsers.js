import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { hasApprovedAccess } from '@/lib/roles';

// Every User Administration call names the manager's own business, so the owner acts for one business at a time.
export async function accessCall(user, body) {
  const tenant_id = user?.tenant_id || user?.data?.tenant_id;
  const { data } = await base44.functions.invoke('manageAppAccess', tenant_id ? { ...body, tenant_id } : body);
  return data;
}

export function accessError(e, fallback = 'Unable to save the change.') {
  return e?.response?.data?.error || e?.message || fallback;
}

export default function useAppUsers(search = '') {
  const { user } = useAuth();
  const client = useQueryClient();
  const enabled = hasApprovedAccess(user) && ['admin', 'Provider Administrator', 'Management'].includes(user?.role);
  const query = useQuery({
    queryKey: ['app-users', search], enabled, refetchInterval: 30000,
    queryFn: () => accessCall(user, { action: 'list', search }),
  });
  return { ...query, enabled, refresh: () => client.invalidateQueries({ queryKey: ['app-users'] }) };
}
