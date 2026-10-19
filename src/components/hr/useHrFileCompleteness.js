import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function useHrFileCompleteness(cursor) {
  const client = useQueryClient();
  useEffect(() => {
    let timer;
    const refresh = () => {
      clearTimeout(timer);
      timer = setTimeout(() => client.invalidateQueries({ queryKey: ['hr-file-completeness'] }), 800);
    };
    const stop = ['StaffProfile', 'EmployeeDocument', 'Certificate', 'ComplianceChecklistEntry', 'EmployeeEmploymentContract', 'EmployeePositionDescription'].map((name) => base44.entities[name].subscribe(refresh));
    return () => { clearTimeout(timer); stop.forEach((unsubscribe) => unsubscribe()); };
  }, [client]);
  return useQuery({
    queryKey: ['hr-file-completeness', cursor], staleTime: 30000, retry: false,
    queryFn: async () => {
      const response = await base44.functions.invoke('staffFileCompleteness', { cursor });
      if (response.data.error) throw new Error(response.data.error);
      return response.data;
    },
  });
}