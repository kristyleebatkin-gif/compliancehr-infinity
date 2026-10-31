// Cohesive enterprise indigo/violet & slate module palette
export const MODULE_KEY_COLOURS = {
  'dashboard': '#4F46E5',
  'operations-centre': '#3730A3',
  'my-profile': '#4F46E5',
  'our-staff': '#4338CA',
  'our-participants': '#6D28D9',
  'intake': '#4F46E5',
  'documents': '#4338CA',
  'company-safe': '#312E81',
  'visual-boards': '#6D28D9',
  'communications': '#4F46E5',
  'assistant': '#6D28D9',
  'incidents': '#4338CA',
  'incident-analytics': '#5B21B6',
  'risks': '#3730A3',
  'compliance': '#4F46E5',
  'auditor-portal': '#312E81',
  'training': '#4F46E5',
  'certificates': '#6D28D9',
  'assets': '#334155',
  'rostering': '#4F46E5',
  'invoicing': '#4338CA',
  'goals': '#6D28D9',
  'emergency-response': '#3730A3',
  'meetings': '#4F46E5',
  'users': '#4338CA',
  'receipts': '#334155',
  'equipment-manuals': '#4F46E5',
  'community-council': '#4338CA',
  'community-referral': '#6D28D9',
  'ndis-provider': '#4F46E5',
  'ndis-news': '#5B21B6',
  'quotes': '#4338CA',
  'programs': '#6D28D9',
  'key-contacts': '#4F46E5',
  'volunteering-placements': '#3730A3',
  'analytics': '#4F46E5',
  'human-resources': '#4338CA',
  'crm': '#6D28D9',
  'procurement': '#334155',
  'projects': '#4F46E5',
  'tasks': '#4338CA',
  'feedback': '#6D28D9',
  'quality': '#4F46E5',
  'suggestions-hub': '#5B21B6',
  'help': '#4F46E5',
  'user-guides': '#4338CA',
  'daily-briefing': '#4F46E5',
  'checklists': '#4338CA',
  'review-due': '#5B21B6',
  'universal-storage': '#3730A3',
  'registers': '#4F46E5',
  'user-success': '#6D28D9',
  'record-intelligence': '#4338CA',
  'frontline-hub': '#4F46E5',
  'workforce-presence': '#3730A3',
  'governance': '#312E81',
};

const ALIASES = { emergency: 'emergency-response', hr: 'human-resources', volunteers: 'volunteering-placements' };

export function moduleKeyColour(key) {
  return MODULE_KEY_COLOURS[ALIASES[key] || key] || '#4F46E5';
}

export default function dashboardModuleColours(key) {
  const colour = moduleKeyColour(key);
  return { colour, accent: colour };
}