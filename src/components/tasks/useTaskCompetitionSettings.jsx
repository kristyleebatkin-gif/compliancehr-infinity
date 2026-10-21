import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { VOUCHERS, JOKES, FUN_FACTS, TEAM_STRATEGIES, COMPETITION_HISTORY } from '@/lib/commTypes';

const year = new Date().getFullYear();
const defaults = { season_start: `${year}-01-01`, season_end: `${year}-12-01T12:00`, season_note: 'Points reset fresh on 1 January each year and the competition finishes on 1 December at midday.', leaderboard_title: 'Employee task completion leaderboard', prizes_title: 'Prizes & certificate', prizes_note: 'Leaders get their voucher plus a company certificate showing total tasks completed and their fastest and slowest task, module and time.', banter_title: 'Sledge board (keep it kind!)', strategies_title: 'Team building strategies', history_title: 'History of past competitions', vouchers: VOUCHERS, jokes: JOKES, fun_facts: FUN_FACTS, team_strategies: TEAM_STRATEGIES, history: COMPETITION_HISTORY };
export default function useTaskCompetitionSettings() {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ['task-competition-settings'], queryFn: async () => {
    const page = await base44.entities.TaskCompetitionSettings.filter({ key: 'tasks' }, { sort: '-updated_date', limit: 1 });
    return page.items[0] || null;
  } });
  const mutation = useMutation({ mutationFn: async (values) => {
    const payload = { ...values, key: 'tasks' };
    return query.data?.id ? base44.entities.TaskCompetitionSettings.update(query.data.id, payload) : base44.entities.TaskCompetitionSettings.create(payload);
  }, onSuccess: () => client.invalidateQueries({ queryKey: ['task-competition-settings'] }) });
  return { settings: { ...defaults, ...(query.data || {}) }, loading: query.isLoading, error: query.error, save: mutation.mutateAsync };
}