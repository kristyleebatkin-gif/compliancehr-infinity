// One fixed, distinct colour for each of the 45 modules.
export const MODULE_KEY_COLOURS = {
  'dashboard': '#4f46e5',
  'my-profile': '#db2777',
  'our-staff': '#2563eb',
  'our-participants': '#e11d48',
  'intake': '#0ea5e9',
  'documents': '#ca8a04',
  'company-safe': '#7c3aed',
  'visual-boards': '#a855f7',
  'communications': '#0891b2',
  'assistant': '#8b5cf6',
  'incidents': '#dc2626',
  'incident-analytics': '#f97316',
  'risks': '#ea580c',
  'compliance': '#6d28d9',
  'auditor-portal': '#1d4ed8',
  'training': '#0d9488',
  'certificates': '#14b8a6',
  'assets': '#b45309',
  'rostering': '#6366f1',
  'invoicing': '#16a34a',
  'goals': '#c026d3',
  'emergency-response': '#b91c1c',
  'meetings': '#d97706',
  'users': '#0284c7',
  'receipts': '#059669',
  'equipment-manuals': '#a16207',
  'community-council': '#65a30d',
  'community-referral': '#be185d',
  'ndis-provider': '#7e22ce',
  'ndis-news': '#9333ea',
  'quotes': '#15803d',
  'programs': '#ec4899',
  'key-contacts': '#0e7490',
  'volunteering-placements': '#f43f5e',
  'analytics': '#0369a1',
  'human-resources': '#7c3aed',
  'crm': '#be123c',
  'procurement': '#92400e',
  'projects': '#4338ca',
  'tasks': '#ef4444',
  'feedback': '#f472b6',
  'quality': '#22c55e',
  'suggestions-hub': '#3b82f6',
  'help': '#0891b2',
  'user-guides': '#ec4899',
};

// Live dashboard card keys that differ from the module directory keys.
const ALIASES = { emergency: 'emergency-response', hr: 'human-resources', volunteers: 'volunteering-placements' };

export function moduleKeyColour(key) {
  return MODULE_KEY_COLOURS[ALIASES[key] || key] || '#4f46e5';
}

export default function dashboardModuleColours(key) {
  const colour = moduleKeyColour(key);
  return { colour, accent: colour };
}