// Symmetric progression across all 45 modules:
// Blue (#0072FF) -> Dark blue (#0A2B6D) -> Dark purple (#5A00D6) -> Purple (#A100FF) -> Pink (#FF2E9A) -> Purple (#A100FF) -> Dark purple (#5A00D6) -> Dark blue (#0A2B6D) -> Blue (#0072FF)
// Plus Sky blue (#00C6FF), Magenta (#FF6EDB), and Light purple / lilac (#C084FC).
export const MODULE_KEY_COLOURS = {
  'dashboard': '#0072FF',
  'operations-centre': '#0A2B6D',
  'my-profile': '#5A00D6',
  'our-staff': '#A100FF',
  'our-participants': '#FF2E9A',
  'intake': '#A100FF',
  'documents': '#5A00D6',
  'company-safe': '#0A2B6D',
  'visual-boards': '#0072FF',
  'communications': '#00C6FF',
  'assistant': '#5A00D6',
  'incidents': '#FF2E9A',
  'incident-analytics': '#FF6EDB',
  'risks': '#A100FF',
  'compliance': '#5A00D6',
  'auditor-portal': '#0A2B6D',
  'training': '#0072FF',
  'certificates': '#00C6FF',
  'assets': '#0A2B6D',
  'rostering': '#5A00D6',
  'invoicing': '#A100FF',
  'goals': '#FF2E9A',
  'emergency-response': '#FF6EDB',
  'meetings': '#A100FF',
  'users': '#5A00D6',
  'receipts': '#0A2B6D',
  'equipment-manuals': '#0072FF',
  'community-council': '#00C6FF',
  'community-referral': '#5A00D6',
  'ndis-provider': '#A100FF',
  'ndis-news': '#FF2E9A',
  'quotes': '#FF6EDB',
  'programs': '#C084FC',
  'key-contacts': '#5A00D6',
  'volunteering-placements': '#0A2B6D',
  'analytics': '#0072FF',
  'human-resources': '#5A00D6',
  'crm': '#FF2E9A',
  'procurement': '#0A2B6D',
  'projects': '#0072FF',
  'tasks': '#A100FF',
  'feedback': '#FF6EDB',
  'quality': '#00C6FF',
  'suggestions-hub': '#C084FC',
  'help': '#0072FF',
  'user-guides': '#FF2E9A',
  'daily-briefing': '#0072FF',
  'checklists': '#5A00D6',
  'review-due': '#A100FF',
  'universal-storage': '#0A2B6D',
  'registers': '#5A00D6',
  'user-success': '#00C6FF',
  'record-intelligence': '#0072FF',
  'frontline-hub': '#FF2E9A',
  'workforce-presence': '#A100FF',
};

// Live dashboard card keys that differ from the module directory keys.
const ALIASES = { emergency: 'emergency-response', hr: 'human-resources', volunteers: 'volunteering-placements' };

export function moduleKeyColour(key) {
  return MODULE_KEY_COLOURS[ALIASES[key] || key] || '#0072FF';
}

export default function dashboardModuleColours(key) {
  const colour = moduleKeyColour(key);
  return { colour, accent: colour };
}