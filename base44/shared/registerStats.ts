import { REGISTRY } from './registerRegistry.ts';

// Server-side register stats for every module: total, open, overdue, expiring.
// Shared between suggestionsDigest and moduleReview so counts are computed once, identically.
export async function gatherRegisterStats(base44: any): Promise<any[]> {
  const moduleKeys = Object.keys(REGISTRY);
  const today = new Date().toISOString().slice(0, 10);
  const in30 = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  const stats: any[] = [];
  for (let i = 0; i < moduleKeys.length; i += 6) {
    const batch = moduleKeys.slice(i, i + 6);
    const settled = await Promise.allSettled(batch.map(async (key: string) => {
      const cfg = REGISTRY[key];
      const ent = base44.entities[cfg.entity];
      const statusField = cfg.statusField || null;
      const openQuery = statusField ? { [statusField]: { $nin: cfg.closed } } : {};
      const [total, open, overdue, expiring] = await Promise.all([
        ent.count({}),
        statusField ? ent.count(openQuery) : Promise.resolve(0),
        cfg.dateField ? ent.count({ ...openQuery, [cfg.dateField]: { $lt: today } }) : Promise.resolve(null),
        cfg.dateField ? ent.count({ ...openQuery, [cfg.dateField]: { $gte: today, $lte: in30 } }) : Promise.resolve(null),
      ]);
      return { key, label: cfg.label, total, open: statusField ? open : total, overdue, expiring };
    }));
    for (const s of settled) if (s.status === 'fulfilled') stats.push(s.value);
  }
  return stats;
}

// Compact text form of the stats for an LLM prompt (numbers only, no PII).
export function statsToPromptLines(stats: any[]): string {
  return stats.map((s: any) => [
    `Module "${s.label}" (key: ${s.key}):`,
    `- Total records: ${s.total}`,
    `- Open: ${s.open}`,
    s.overdue !== null ? `- Overdue: ${s.overdue}` : null,
    s.expiring !== null ? `- Due/expiring within 30 days: ${s.expiring}` : null,
  ].filter((l: any) => l !== null).join('\n')).join('\n\n');
}