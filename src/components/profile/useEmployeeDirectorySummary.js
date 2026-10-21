import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useRole } from '@/lib/useRole';
import { preparePersonalProfileAccess, profileRecordScope } from '@/lib/personalProfileAccess';

export default function useEmployeeDirectorySummary(scoped) {
  const { user, role } = useRole();
  return useQuery({
    queryKey: ['employee-directory-summary', scoped, role, user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (scoped) await preparePersonalProfileAccess();
      const query = scoped ? profileRecordScope(role, user, 'StaffProfile') : {};
      const [total, active, onLeave, categories] = await Promise.all([
        base44.entities.StaffProfile.count(query),
        base44.entities.StaffProfile.count({ $and: [query, { status: 'Active' }] }),
        base44.entities.StaffProfile.count({ $and: [query, { status: 'On Leave' }] }),
        base44.entities.StaffProfile.aggregate({ query, groupBy: 'role' }),
      ]);
      return { total, active, onLeave, categories: (categories.rows || []).map(row => ({ label: row.role || 'Unassigned', count: row.count })).sort((a, b) => a.label.localeCompare(b.label)) };
    },
  });
}