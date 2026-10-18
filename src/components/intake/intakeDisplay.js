// Shared display helpers for the intake case workflow and its child components.
export const TERMINAL_STATUSES = new Set(['Converted to Profile', 'Declined', 'Withdrawn']);

export const initials = (name) => String(name || '?').trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

export const scoreTone = (score) => (score >= 90 ? 'text-emerald-600' : score >= 50 ? 'text-amber-500' : 'text-rose-500');

export const STATUS_CLASS = {
  Draft: 'bg-primary/10 text-primary',
  'Information Required': 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
  'Ready for Review': 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300',
  Approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
  'Converted to Profile': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
  Declined: 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300',
  Withdrawn: 'bg-muted text-muted-foreground',
};