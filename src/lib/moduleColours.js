export const MODULE_COLOURS = [
  '#4f46e5',
  '#2563eb',
  '#0891b2',
  '#0d9488',
  '#16a34a',
  '#ca8a04',
  '#ea580c',
  '#dc2626',
  '#db2777',
  '#9333ea',
];

// Semantic module colour map: page titles map to a FIXED accent family instead of a
// random hash, so safety modules are always red, finance always green, etc.
// Order matters — the first keyword match wins. Unknown titles fall back to the hash.
const SEMANTIC_MODULES = [
  { keywords: ['incident', 'emergency', 'safety', 'investigation', 'take five', 'drill'], colour: '#dc2626', accent: '#ea580c' },
  { keywords: ['risk', 'hazard', 'whs'], colour: '#ea580c', accent: '#ca8a04' },
  { keywords: ['invoice', 'quote', 'receipt', 'payment', 'financial'], colour: '#16a34a', accent: '#0d9488' },
  { keywords: ['training', 'certificate', 'certification', 'lms', 'competency'], colour: '#0d9488', accent: '#0891b2' },
  { keywords: ['staff', 'employee', 'personnel', 'volunteer', 'performance', 'buddy'], colour: '#2563eb', accent: '#0891b2' },
  { keywords: ['participant', 'client', 'referral', 'goal', 'feedback', 'survey', 'communication'], colour: '#db2777', accent: '#9333ea' },
  { keywords: ['roster', 'shift', 'meeting', 'task', 'timesheet'], colour: '#6366f1', accent: '#4f46e5' },
  { keywords: ['chemical', 'msds', 'equipment', 'asset', 'maintenance', 'manual'], colour: '#ca8a04', accent: '#ea580c' },
  { keywords: ['ndis', 'community', 'council', 'news', 'programs', 'quality', 'checklist'], colour: '#9333ea', accent: '#db2777' },
  { keywords: ['compliance', 'audit', 'policy', 'legal', 'document', 'vault', 'form', 'company safe'], colour: '#4f46e5', accent: '#3b82f6' },
];

export function moduleColour(value = '', offset = 0) {
  const text = String(value).toLowerCase();
  const match = SEMANTIC_MODULES.find((entry) => entry.keywords.some((keyword) => text.includes(keyword)));
  if (match) return offset === 0 ? match.colour : match.accent;
  const hash = [...text].reduce((total, character) => total + character.charCodeAt(0), 0);
  return MODULE_COLOURS[(hash + offset) % MODULE_COLOURS.length];
}