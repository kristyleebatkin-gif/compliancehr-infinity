import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function useSafetyGuidance(module) {
  return useQuery({
    queryKey: ['safety-guidance', module],
    queryFn: async () => (await base44.entities.SafetyGuidance.filter({ module }, { sort: '-updated_date', limit: 100 })).items,
  });
}