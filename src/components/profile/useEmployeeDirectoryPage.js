import { useInfiniteQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useRole } from '@/lib/useRole';
import { preparePersonalProfileAccess, profileRecordScope } from '@/lib/personalProfileAccess';

export default function useEmployeeDirectoryPage({ enabled, scoped, search, group, kind = 'staff' }) {
  const { user, role } = useRole();
  const participant = kind === 'participant';
  const entityName = participant ? 'ParticipantProfile' : 'StaffProfile';
  return useInfiniteQuery({
    queryKey: ['profile-directory-page', kind, scoped, role, user?.id, search, group],
    enabled: enabled && !!user?.id,
    initialPageParam: null,
    queryFn: async ({ pageParam }) => {
      if (scoped) await preparePersonalProfileAccess();
      const scope = scoped ? profileRecordScope(role, user, entityName) : {};
      const term = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const clauses = [scope];
      if (group !== 'all') clauses.push(participant ? { status: group } : group === 'Unassigned' ? { $or: [{ role: '' }, { role: null }, { role: { $exists: false } }] } : { role: group });
      const searchFields = participant ? ['full_name', 'email', 'phone', 'ndis_number', 'ndis_reference_number', 'support_type'] : ['full_name', 'email', 'phone', 'position', 'role', 'employee_number'];
      if (term) clauses.push({ $or: searchFields.map(field => ({ [field]: { $regex: term, $options: 'i' } })) });
      return base44.entities[entityName].filter({ $and: clauses }, { sort: 'full_name', limit: 50, ...(pageParam ? { cursor: pageParam } : {}) });
    },
    getNextPageParam: page => page.has_more ? page.next_cursor : undefined,
  });
}