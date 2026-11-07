import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function useExecutiveDashboardMetrics() {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Australia/Sydney', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  return useQuery({
    queryKey: ['executive-dashboard-metrics', today],
    queryFn: async () => {
      const openRisks = { status: { $in: ['Identified', 'Assessed', 'Treating', 'Monitored'] } };
      const openIncidents = { status: { $in: ['Reported', 'Under Investigation', 'Action Required'] } };
      const requests = [
        ['risks', base44.entities.Risk.count(openRisks)],
        ['highRisks', base44.entities.Risk.count({ ...openRisks, rating: { $in: ['High', 'Critical'] } })],
        ['riskReviews', base44.entities.Risk.count({ ...openRisks, review_date: { $gte: '1900-01-01', $lt: today } })],
        ['incidents', base44.entities.Incident.count(openIncidents)],
        ['issues', base44.entities.ComplianceIssue.count({ status: { $in: ['Open', 'In Progress'] } })],
        ['tasks', base44.entities.TodoTask.count({ status: { $in: ['Pending', 'Pending Approval', 'In Progress', 'Open', 'Overdue'] }, due_date: { $gte: '1900-01-01', $lt: today } })],
      ];
      const results = await Promise.allSettled(requests.map(([, request]) => request));
      return Object.fromEntries(requests.map(([key], i) => [key, results[i].status === 'fulfilled' && typeof results[i].value === 'number' ? results[i].value : null]));
    },
    staleTime: 30000,
  });
}