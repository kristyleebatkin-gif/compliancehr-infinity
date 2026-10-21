import { useInfiniteQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useRole } from '@/lib/useRole';
import { preparePersonalProfileAccess, profileRecordScope } from '@/lib/personalProfileAccess';

export default function useEmployeeDirectoryPage({ enabled, scoped, search, group }) {
  const { user, role } = useRole();
  return useInfiniteQuery({
    queryKey: ['employee-directory-page', scoped, role, user?.id, search, group],
    enabled: enabled && !!user?.id,
    initialPageParam: null,
    queryFn: async ({ pageParam }) => {
      if (scoped) await preparePersonalProfileAccess();
      const scope = scoped ? profileRecordScope(role, user, 'StaffProfile') : {};
      const term = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const clauses = [scope];
      if (group !== 'all') clauses.push(group === 'Unassigned' ? { $or: [{ role: '' }, { role: null }, { role: { $exists: false } }] } : { role: group });
      if (term) clauses.push({ $or: ['full_name', 'email', 'phone', 'position', 'role', 'employee_number'].map(field => ({ [field]: { $regex: term, $options: 'i' } })) });
      return base44.entities.StaffProfile.filter({ $and: clauses }, { sort: 'full_name', limit: 50, ...(pageParam ? { cursor: pageParam } : {}) });
    },
    getNextPageParam: page => page.has_more ? page.next_cursor : undefined,
  });
}