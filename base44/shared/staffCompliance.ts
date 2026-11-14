import { BUSINESS_TIME_ZONE } from './businessTime.ts';
// Shared staff compliance progress computation (onboarding pack completion %).
// Used by the dashboard flag endpoint and the automated daily flag scan.

export const ONBOARDING_PREFIX = 'Onboarding pack - ';
export const FLAG_THRESHOLD = 80;

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const isDone = (status) => status === 'Completed' || status === 'Finalised';
const isSkipped = (status) => status === 'Cancelled';

// Returns rows: [{ name, done, total, pct (0-100 or null when no pack), overdue }]
export async function computeStaffCompliance(service) {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: BUSINESS_TIME_ZONE });

  const [tasksPage, staffPage] = await Promise.all([
    service.entities.TodoTask.filter(
      { title: { $regex: `^${escapeRegex(ONBOARDING_PREFIX)}`, $options: 'i' } },
      { sort: 'due_date', limit: 500, fields: ['title', 'status', 'due_date'] },
    ),
    service.entities.StaffProfile.list(),
  ]);

  const byStaff = new Map(); // name -> [{ step, status, due_date }]
  for (const t of tasksPage.items || []) {
    const rest = String(t.title || '').slice(ONBOARDING_PREFIX.length);
    const name = rest.slice(0, rest.lastIndexOf(' - ')).trim();
    const step = rest.slice(rest.lastIndexOf(' - ') + 3).trim();
    if (!name || !step) continue;
    if (!byStaff.has(name)) byStaff.set(name, []);
    byStaff.get(name).push({ step, status: t.status, due_date: t.due_date });
  }

  const names = new Set((staffPage.items || staffPage || []).map((s) => s.full_name).filter(Boolean));
  for (const n of byStaff.keys()) names.add(n);

  const rows = [];
  for (const name of names) {
    const steps = byStaff.get(name) || [];
    const done = steps.filter((s) => isDone(s.status)).length;
    const overdue = steps.filter((s) => !isDone(s.status) && !isSkipped(s.status) && s.due_date && s.due_date < today).length;
    rows.push({
      name,
      done,
      total: steps.length,
      pct: steps.length ? Math.round((done / steps.length) * 100) : null,
      overdue,
    });
  }
  rows.sort((a, b) => (a.pct ?? 999) - (b.pct ?? 999) || a.name.localeCompare(b.name));
  return rows;
}

export const isFlagged = (row) => row.pct !== null && row.pct < FLAG_THRESHOLD;